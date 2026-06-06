<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DocumentRequestService;
use Illuminate\Http\Request;

class DocumentRequestController extends Controller
{
    protected $docService;

    public function __construct(DocumentRequestService $docService)
    {
        $this->docService = $docService;
    }

    /**
     * Liste des demandes de documents.
     */
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            $requests = $this->docService->getAllRequests();
        } else {
            $requests = $this->docService->getUserRequests($request->user()->id);
        }

        return response()->json($requests);
    }

    /**
     * Nouvelle demande de document.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            // Options pour les profs (ordre de mission)
            'destination' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'motif' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $extraData = $request->only(['destination', 'start_date', 'end_date', 'motif']);

        if ($request->has('metadata')) {
            $metadata = $request->input('metadata');
            if (is_array($metadata)) {
                if (isset($metadata['destination'])) $extraData['destination'] = $metadata['destination'];
                if (isset($metadata['start_date'])) $extraData['start_date'] = $metadata['start_date'];
                if (isset($metadata['end_date'])) $extraData['end_date'] = $metadata['end_date'];
                if (isset($metadata['reason'])) $extraData['motif'] = $metadata['reason'];
                if (isset($metadata['motif'])) $extraData['motif'] = $metadata['motif'];
            }
        }

        $docRequest = $this->docService->createRequest(
            $request->user()->id,
            $request->type,
            $extraData
        );

        return response()->json([
            'message' => 'Demande de document soumise avec succès.',
            'request' => $docRequest
        ]);
    }

    /**
     * Approuver une demande (Admin).
     */
    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $docRequest = $this->docService->approveRequest($id);

        return response()->json([
            'message' => 'Demande approuvée.',
            'request' => $docRequest
        ]);
    }

    /**
     * Rejeter une demande (Admin).
     */
    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'reason' => 'required|string',
        ]);

        $docRequest = $this->docService->rejectRequest($id, $request->reason);

        return response()->json([
            'message' => 'Demande rejetée.',
            'request' => $docRequest
        ]);
    }

    /**
     * Télécharger l'attestation officielle en format PDF.
     */
    public function downloadPdf(Request $request, $id)
    {
        // Authentification manuelle via token en query param si non connecté via session
        $user = $request->user();
        if (!$user && $request->filled('token')) {
            $tokenStr = $request->query('token');
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($tokenStr);
            if ($tokenModel) {
                $user = $tokenModel->tokenable;
            }
        }

        // On récupère la demande
        $docRequest = \App\Models\DocumentRequest::with('user')->findOrFail($id);

        // Si le document n'est pas encore approuvé, on restreint l'accès aux admins ou propriétaires
        if ($docRequest->status !== 'approved') {
            if (!$user || ($user->role !== 'admin' && $user->id !== $docRequest->user_id)) {
                return response()->json(['message' => 'Accès interdit. Le document n\'est pas encore approuvé.'], 403);
            }
        }

        // Compilation du PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.document', compact('docRequest'));
        
        $filename = str_replace(' ', '_', $docRequest->type) . '_' . $docRequest->id . '.pdf';
        
        return $pdf->download($filename);
    }
}
