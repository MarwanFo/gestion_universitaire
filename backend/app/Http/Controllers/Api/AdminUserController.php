<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Group;
use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

        $users = User::with('group')->orderBy('id', 'desc')->get();
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

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,professor,student',
            'password' => 'required|min:6',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
            'group_id' => $request->group_id,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user' => $user->load('group')
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

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
