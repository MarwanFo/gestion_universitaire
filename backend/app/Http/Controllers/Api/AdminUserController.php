<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\ProfessorProfile;
use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    /**
     * Stats globales pour le dashboard admin.
     */
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return response()->json([
            'total_students' => User::where('role', 'student')->count(),
            'total_professors' => User::where('role', 'professor')->count(),
            'pending_requests' => DocumentRequest::where('status', 'pending')->count(),
        ]);
    }

    /**
     * Liste des utilisateurs.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $users = User::with([
            'studentProfile.group',
            'studentProfile.field',
            'professorProfile',
            'fields',
            'taughtModules'
        ])->orderBy('id', 'desc')->get();

        return response()->json($users);
    }

    /**
     * Création d'un utilisateur.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'cin' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|in:admin,student,professor',
            'is_active' => 'nullable',
            'avatar' => 'nullable|image|max:2048',
        ];

        if ($request->role === 'student') {
            $rules = array_merge($rules, [
                'cne' => 'required|string|max:50',
                'enrollment_year' => 'required|integer',
                'bac_type' => 'required|string|max:255',
                'bac_grade' => 'required|numeric|between:0,20',
                'level' => 'required|integer|between:1,5',
                'group_id' => 'nullable|exists:groups,id',
                'field_id' => 'nullable|exists:fields,id',
            ]);
        } elseif ($request->role === 'professor') {
            $rules = array_merge($rules, [
                'speciality' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'employment_type' => 'required|in:permanent,vacataire',
                'office' => 'nullable|string|max:100',
                'field_ids' => 'nullable|array',
                'field_ids.*' => 'exists:fields,id',
                'module_ids' => 'nullable|array',
                'module_ids.*' => 'exists:modules,id',
            ]);
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $isActive = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'cin' => $request->cin,
            'phone' => $request->phone,
            'role' => $request->role,
            'is_active' => $isActive,
        ]);

        if ($request->hasFile('avatar')) {
            $path = \App\Helpers\UploadHelper::upload($request->file('avatar'), 'avatars');
            $user->avatar_path = $path;
            $user->save();
        }

        if ($request->role === 'student') {
            StudentProfile::create([
                'user_id' => $user->id,
                'cne' => $request->cne,
                'enrollment_year' => $request->enrollment_year,
                'bac_type' => $request->bac_type,
                'bac_grade' => $request->bac_grade,
                'level' => $request->level,
                'group_id' => $request->group_id,
                'field_id' => $request->field_id,
            ]);
        } elseif ($request->role === 'professor') {
            ProfessorProfile::create([
                'user_id' => $user->id,
                'speciality' => $request->speciality,
                'department' => $request->department,
                'employment_type' => $request->employment_type,
                'office' => $request->office,
            ]);

            // Sync Fields/Filières
            $user->fields()->sync($request->input('field_ids', []));

            // Assign Modules/Matières
            // Clear previous assignments for this professor
            \App\Models\Module::where('professor_id', $user->id)->update(['professor_id' => null]);
            // Set new assignments
            if (!empty($request->input('module_ids'))) {
                \App\Models\Module::whereIn('id', $request->input('module_ids'))->update(['professor_id' => $user->id]);
            }
        }

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user' => $user->load(['studentProfile.group', 'studentProfile.field', 'professorProfile', 'fields', 'taughtModules'])
        ]);
    }

    /**
     * Modification d'un utilisateur.
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $user = User::findOrFail($id);

        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'cin' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|in:admin,student,professor',
            'is_active' => 'nullable',
            'avatar' => 'nullable|image|max:2048',
        ];

        if ($request->role === 'student') {
            $rules = array_merge($rules, [
                'cne' => 'required|string|max:50',
                'enrollment_year' => 'required|integer',
                'bac_type' => 'required|string|max:255',
                'bac_grade' => 'required|numeric|between:0,20',
                'level' => 'required|integer|between:1,5',
                'group_id' => 'nullable|exists:groups,id',
                'field_id' => 'nullable|exists:fields,id',
            ]);
        } elseif ($request->role === 'professor') {
            $rules = array_merge($rules, [
                'speciality' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'employment_type' => 'required|in:permanent,vacataire',
                'office' => 'nullable|string|max:100',
                'field_ids' => 'nullable|array',
                'field_ids.*' => 'exists:fields,id',
                'module_ids' => 'nullable|array',
                'module_ids.*' => 'exists:modules,id',
            ]);
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $isActive = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $userData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'cin' => $request->cin,
            'phone' => $request->phone,
            'role' => $request->role,
            'is_active' => $isActive,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists locally
            if ($user->avatar_path && !str_starts_with($user->avatar_path, 'http')) {
                $oldPath = str_replace('/storage/', '', $user->avatar_path);
                Storage::disk('public')->delete($oldPath);
            }
            $path = \App\Helpers\UploadHelper::upload($request->file('avatar'), 'avatars');
            $user->avatar_path = $path;
            $user->save();
        }

        // Handle profile sync/creation/deletion based on role
        if ($request->role === 'student') {
            if ($user->professorProfile) {
                $user->professorProfile->delete();
            }

            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'cne' => $request->cne,
                    'enrollment_year' => $request->enrollment_year,
                    'bac_type' => $request->bac_type,
                    'bac_grade' => $request->bac_grade,
                    'level' => $request->level,
                    'group_id' => $request->group_id,
                    'field_id' => $request->field_id,
                ]
            );
        } elseif ($request->role === 'professor') {
            if ($user->studentProfile) {
                $user->studentProfile->delete();
            }

            ProfessorProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'speciality' => $request->speciality,
                    'department' => $request->department,
                    'employment_type' => $request->employment_type,
                    'office' => $request->office,
                ]
            );

            // Sync Fields/Filières
            $user->fields()->sync($request->input('field_ids', []));

            // Assign Modules/Matières
            // Clear previous assignments for this professor
            \App\Models\Module::where('professor_id', $user->id)->update(['professor_id' => null]);
            // Set new assignments
            if (!empty($request->input('module_ids'))) {
                \App\Models\Module::whereIn('id', $request->input('module_ids'))->update(['professor_id' => $user->id]);
            }
        } else {
            // admin
            if ($user->studentProfile) {
                $user->studentProfile->delete();
            }
            if ($user->professorProfile) {
                $user->professorProfile->delete();
            }
        }

        return response()->json([
            'message' => 'Utilisateur modifié avec succès.',
            'user' => $user->fresh(['studentProfile.group', 'studentProfile.field', 'professorProfile', 'fields', 'taughtModules'])
        ]);
    }

    /**
     * Suppression d'un utilisateur.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $user = User::findOrFail($id);
        
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 400);
        }

        if ($user->avatar_path) {
            $oldPath = str_replace('/storage/', '', $user->avatar_path);
            Storage::disk('public')->delete($oldPath);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    /**
     * Liste des filières et groupes pour la création/modification d'utilisateurs.
     */
    public function getFieldsAndGroups(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return response()->json([
            'fields' => \App\Models\Field::all(),
            'groups' => \App\Models\Group::all(),
        ]);
    }
}
