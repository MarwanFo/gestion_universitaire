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
            if ($user->group) {
                $modules = Module::where('field_id', $user->group->field_id)->get();
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
    public function index($moduleId)
    {
        $announcements = Announcement::where('module_id', $moduleId)
            ->with(['professor', 'comments.user'])
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
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,docx,pptx,zip,jpg,png|max:5120',
        ]);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('announcements', 'public');
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $announcement = Announcement::create([
            'module_id' => $request->module_id,
            'professor_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->input('content'),
            'file_path' => $filePath,
            'file_name' => $fileName,
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
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,docx,pptx,zip,jpg,png|max:5120',
        ]);

        $announcement->title = $request->title;
        $announcement->content = $request->input('content');

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('announcements', 'public');
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
}
