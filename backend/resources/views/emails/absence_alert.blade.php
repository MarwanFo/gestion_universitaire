@extends('emails.layout')

@section('title', "Alerte d'Absence - UPF")

@section('content')
    <h2>Bonjour {{ $absence->student->first_name }} {{ $absence->student->last_name }},</h2>
    
    <p>Nous vous informons qu'une absence a été signalée à votre nom par votre enseignant pour la séance suivante :</p>

    <div class="details-box">
        <div class="detail-row">
            <span class="detail-label">Matière / Module</span>
            <span class="detail-value">
                {{ $absence->timetable && $absence->timetable->module ? $absence->timetable->module->name : 'N/A' }} 
                ({{ $absence->timetable && $absence->timetable->module ? $absence->timetable->module->code : '' }})
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Enseignant</span>
            <span class="detail-value">
                {{ $absence->timetable && $absence->timetable->module && $absence->timetable->module->professor 
                    ? 'Prof. ' . $absence->timetable->module->professor->first_name . ' ' . $absence->timetable->module->professor->last_name
                    : 'N/A' }}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ \Carbon\Carbon::parse($absence->date)->format('d/m/Y') }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Horaire / Créneau</span>
            <span class="detail-value">
                @if($absence->timetable)
                    {{ \Carbon\Carbon::parse($absence->timetable->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($absence->timetable->end_time)->format('H:i') }}
                @else
                    N/A
                @endif
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Statut</span>
            <span class="detail-value" style="color: #ef4444; font-weight: 700;">NON JUSTIFIÉE</span>
        </div>
    </div>

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
        <h4 style="margin: 0 0 8px; color: #b45309; font-size: 13px; font-weight: 700; text-transform: uppercase;">Rappel Règlementaire</h4>
        <p style="margin: 0; color: #d97706; font-size: 12px; line-height: 1.5;">
            Conformément au règlement de l'UPF, vous disposez d'un délai de <strong>48 heures</strong> à compter de la date de l'absence pour soumettre un justificatif officiel (certificat médical, convocation, etc.) directement depuis votre espace étudiant.
        </p>
    </div>

    <div class="btn-container">
        <a href="http://localhost:5173/attendance" class="btn">Justifier mon absence</a>
    </div>

    <p style="margin-top: 32px;">Cordialement,<br>Le service de scolarité UPF</p>
@endsection
