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
        ]);

        $extraData = $request->only(['destination', 'start_date', 'end_date', 'motif']);

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
}
