<?php

namespace App\Services;

use App\Models\DocumentRequest;

class DocumentRequestService
{
    /**
     * Récupère toutes les demandes de documents (pour l'admin).
     */
    public function getAllRequests()
    {
        return DocumentRequest::with('user.studentProfile')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Récupère les demandes d'un utilisateur spécifique.
     */
    public function getUserRequests(int $userId)
    {
        return DocumentRequest::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Crée une nouvelle demande de document.
     */
    public function createRequest(int $userId, string $type, array $extraData = []): DocumentRequest
    {
        return DocumentRequest::create(array_merge([
            'user_id' => $userId,
            'type' => $type,
            'status' => 'pending',
        ], $extraData));
    }

    /**
     * Approuve une demande.
     */
    public function approveRequest(int $requestId, ?string $pdfPath = null): DocumentRequest
    {
        $request = DocumentRequest::findOrFail($requestId);
        
        $request->update([
            'status' => 'approved',
            'pdf_path' => $pdfPath ?: 'documents/default_signed.pdf',
        ]);

        return $request;
    }

    /**
     * Rejette une demande avec un motif.
     */
    public function rejectRequest(int $requestId, string $reason): DocumentRequest
    {
        $request = DocumentRequest::findOrFail($requestId);
        
        $request->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        return $request;
    }
}
