<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Announcement;
use App\Models\Comment;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    /**
     * Liste des modules pour l'espace d'échange.
     */
    public function modules(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'student') {
            // Modules liés à la filière du groupe de l'étudiant
            $fieldId = $user->group ? $user->group->field_id : ($user->studentProfile ? $user->studentProfile->field_id : null);
            if ($fieldId) {
                $modules = Module::whereHas('fields', function($q) use ($fieldId) {
                    $q->where('fields.id', $fieldId);
                })->get();
            } else {
                $modules = Module::all();
            }
        } elseif ($user->role === 'professor') {
            $modules = Module::where('professor_id', $user->id)->get();
        } else {
            $modules = Module::all();
        }

        return response()->json($modules);
    }

    /**
     * Liste des annonces d'un module avec leurs commentaires.
     */
    public function index(Request $request, $moduleId)
    {
        $user = $request->user();
        $query = Announcement::where('module_id', $moduleId);

        if ($user->role === 'student') {
            $groupId = $user->group ? $user->group->id : ($user->studentProfile ? $user->studentProfile->group_id : null);
            if ($groupId) {
                $query->where(function($q) use ($groupId) {
                    $q->where('group_id', $groupId)
                      ->orWhereNull('group_id');
                });
            }
        } elseif ($user->role === 'professor') {
            if ($request->has('group_id')) {
                $groupId = $request->query('group_id');
                $query->where('group_id', $groupId);
            }
        }

        $relations = [
            'professor',
            'comments' => function($q) {
                $q->orderBy('created_at', 'asc');
            },
            'comments.user'
        ];

        if ($user->role === 'professor') {
            $relations[] = 'studentAttachments.user';
        } else {
            $relations['studentAttachments'] = function($q) use ($user) {
                $q->where('user_id', $user->id);
            };
        }

        $announcements = $query->with($relations)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($announcements);
    }

    /**
     * Publier une annonce (Enseignant).
     */
    public function storeAnnouncement(Request $request)
    {
        if ($request->user()->role !== 'professor') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'group_id' => 'nullable|exists:groups,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,docx,pptx,zip,jpg,png|max:5120',
            'allow_student_attachments' => 'nullable',
        ]);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $filePath = \App\Helpers\UploadHelper::upload($request->file('file'), 'announcements');
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $announcement = Announcement::create([
            'module_id' => $request->module_id,
            'group_id' => $request->group_id,
            'professor_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->input('content'),
            'file_path' => $filePath,
            'file_name' => $fileName,
            'allow_student_attachments' => filter_var($request->input('allow_student_attachments'), FILTER_VALIDATE_BOOLEAN),
        ]);

        return response()->json([
            'message' => 'Annonce publiée avec succès.',
            'announcement' => $announcement->load('professor')
        ]);
    }

    /**
     * Modifier une annonce (Enseignant).
     */
    public function updateAnnouncement(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        if ($request->user()->role !== 'professor' || $announcement->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'group_id' => 'nullable|exists:groups,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,docx,pptx,zip,jpg,png|max:5120',
            'allow_student_attachments' => 'nullable',
        ]);

        if ($request->has('group_id')) {
            $announcement->group_id = $request->group_id;
        }

        $announcement->title = $request->title;
        $announcement->content = $request->input('content');

        if ($request->has('allow_student_attachments')) {
            $announcement->allow_student_attachments = filter_var($request->input('allow_student_attachments'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('file')) {
            $filePath = \App\Helpers\UploadHelper::upload($request->file('file'), 'announcements');
            $fileName = $request->file('file')->getClientOriginalName();
            $announcement->file_path = $filePath;
            $announcement->file_name = $fileName;
        }

        $announcement->save();

        return response()->json([
            'message' => 'Annonce modifiée avec succès.',
            'announcement' => $announcement->load('professor')
        ]);
    }

    /**
     * Supprimer une annonce (Enseignant).
     */
    public function destroyAnnouncement(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        if ($request->user()->role !== 'professor' || $announcement->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        if ($announcement->file_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($announcement->file_path);
        }

        $announcement->delete();

        return response()->json([
            'message' => 'Annonce supprimée avec succès.'
        ]);
    }

    /**
     * Poster un commentaire (Étudiant ou Enseignant).
     */
    public function storeComment(Request $request, $announcementId)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $announcement = Announcement::findOrFail($announcementId);

        $comment = Comment::create([
            'announcement_id' => $announcement->id,
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
        ]);

        return response()->json([
            'message' => 'Commentaire ajouté.',
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * Obtenir les devoirs/fichiers soumis (Étudiant voit les siens, Professeur voit tout).
     */
    public function getSubmissions(Request $request, $moduleId)
    {
        $user = $request->user();
        if ($user->role === 'student') {
            $submissions = \App\Models\StudentSubmission::where('module_id', $moduleId)
                ->where('student_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->role === 'professor') {
            $submissions = \App\Models\StudentSubmission::where('module_id', $moduleId)
                ->with('student')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $submissions = \App\Models\StudentSubmission::where('module_id', $moduleId)
                ->with('student')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($submissions);
    }

    /**
     * Soumettre un fichier ou lien (Étudiant).
     */
    public function storeSubmission(Request $request, $moduleId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'link' => 'nullable|url',
            'file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,rar,png,jpg,jpeg|max:10240',
        ]);

        if (!$request->input('link') && !$request->hasFile('file')) {
            return response()->json(['message' => 'Veuillez fournir un lien ou un fichier joint.'], 422);
        }

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $filePath = \App\Helpers\UploadHelper::upload($request->file('file'), 'submissions');
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $submission = \App\Models\StudentSubmission::create([
            'student_id' => $request->user()->id,
            'module_id' => $moduleId,
            'title' => $request->input('title'),
            'link' => $request->input('link'),
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        return response()->json([
            'message' => 'Votre fichier/lien a été partagé avec votre enseignant.',
            'submission' => $submission->load('student')
        ]);
    }

    /**
     * Uploader une pièce jointe étudiant pour une annonce spécifique.
     */
    public function storeStudentAttachment(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        if (!$announcement->allow_student_attachments) {
            return response()->json(['message' => 'Les pièces jointes ne sont pas autorisées pour cette annonce.'], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB limit
        ]);

        $filePath = \App\Helpers\UploadHelper::upload($request->file('file'), 'student_attachments');
        $fileName = $request->file('file')->getClientOriginalName();

        $attachment = \App\Models\StudentAttachment::create([
            'announcement_id' => $announcement->id,
            'user_id' => $request->user()->id,
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        return response()->json([
            'message' => 'Fichier joint ajouté avec succès.',
            'attachment' => $attachment->load('user')
        ]);
    }
}
