@extends('emails.layout')

@section('title', 'Confirmation de Réservation de Salle - UPF')

@section('content')
    <h2>Bonjour Prof. {{ $reservation->professor->first_name }} {{ $reservation->professor->last_name }},</h2>
    
    <p>Nous avons le plaisir de vous informer que votre demande de réservation de salle a été validée par l'administration.</p>

    <div class="details-box">
        <div class="detail-row">
            <span class="detail-label">Salle réservée</span>
            <span class="detail-value">{{ $reservation->room->name }} (Capacité: {{ $reservation->room->capacity }} places)</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ \Carbon\Carbon::parse($reservation->date)->format('d/m/Y') }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Créneau Horaire</span>
            <span class="detail-value">
                {{ \Carbon\Carbon::parse($reservation->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($reservation->end_time)->format('H:i') }}
            </span>
        </div>
        @if($reservation->reason)
            <div class="detail-row">
                <span class="detail-label">Motif / Événement</span>
                <span class="detail-value">{{ $reservation->reason }}</span>
            </div>
        @endif
    </div>

    <p>Vous pouvez désormais utiliser cette salle pour votre cours ou votre événement à la date et heure indiquées.</p>

    <div class="btn-container">
        <a href="http://localhost:5173/rooms" class="btn">Gérer mes réservations</a>
    </div>

    <p style="margin-top: 32px;">Cordialement,<br>L'équipe d'administration UPF</p>
@endsection
