@extends('emails.layout')

@section('title', 'Statut de votre demande de document - UPF')

@section('content')
    <h2>Bonjour {{ $docRequest->user->first_name }} {{ $docRequest->user->last_name }},</h2>
    
    <p>Nous vous informons que le statut de votre demande de document administratif a été mis à jour par l'administration.</p>

    <div class="details-box">
        <div class="detail-row">
            <span class="detail-label">Type de document</span>
            <span class="detail-value">{{ $docRequest->type }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Statut de la demande</span>
            <span class="detail-value" style="color: {{ $docRequest->status === 'approved' ? '#10b981' : '#ef4444' }};">
                {{ $docRequest->status === 'approved' ? 'APPROUVÉE' : 'REJETÉE' }}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date de demande</span>
            <span class="detail-value">{{ $docRequest->created_at->format('d/m/Y H:i') }}</span>
        </div>
    </div>

    @if($docRequest->status === 'rejected')
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
            <h4 style="margin: 0 0 8px; color: #991b1b; font-size: 13px; font-weight: 700; text-transform: uppercase;">Motif du rejet</h4>
            <p style="margin: 0; color: #b91c1c; font-size: 13px; line-height: 1.5;">
                {{ $docRequest->rejection_reason ?? 'Aucun motif spécifié.' }}
            </p>
        </div>
    @else
        <p>Votre document est désormais disponible et peut être téléchargé en format PDF officiel depuis votre espace étudiant.</p>
        
        <div class="btn-container">
            <a href="http://localhost:5173/documents" class="btn">Télécharger le document</a>
        </div>
    @endif

    <p style="margin-top: 32px;">Si vous avez des questions, veuillez contacter le service scolarité de l'UPF.</p>
@endsection
