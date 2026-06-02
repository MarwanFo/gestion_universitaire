<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $docRequest->type }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            color: #333333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 50px;
        }
        .header-logo-cell {
            width: 80px;
            vertical-align: middle;
        }
        .header-logo-square {
            width: 64px;
            height: 64px;
            background: #4f46e5;
            border-radius: 12px;
            color: #ffffff;
            font-weight: bold;
            font-size: 24px;
            text-align: center;
            line-height: 64px;
        }
        .header-text-cell {
            vertical-align: middle;
            padding-left: 15px;
        }
        .univ-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e1b4b;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
        }
        .univ-sub {
            font-size: 11px;
            color: #6b7280;
            margin: 2px 0 0 0;
            text-transform: uppercase;
            font-weight: bold;
        }
        .header-right-cell {
            text-align: right;
            vertical-align: middle;
            font-size: 11px;
            color: #9ca3af;
        }
        .doc-title-container {
            border-top: 2px solid #e5e7eb;
            border-bottom: 2px solid #e5e7eb;
            padding: 20px 0;
            margin-bottom: 50px;
            text-align: center;
        }
        .doc-title {
            font-size: 22px;
            font-weight: bold;
            color: #111827;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content-section {
            margin-bottom: 60px;
            font-size: 15px;
            color: #374151;
            text-align: justify;
        }
        .content-p {
            margin-bottom: 25px;
            text-indent: 30px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
        }
        .info-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
        }
        .info-label {
            font-weight: bold;
            color: #4b5563;
            width: 35%;
        }
        .info-val {
            color: #111827;
        }
        .date-section {
            text-align: right;
            margin-bottom: 50px;
            font-weight: bold;
            color: #4b5563;
        }
        .signature-section-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 40px;
        }
        .sig-cell {
            width: 50%;
            vertical-align: top;
        }
        .stamp-box {
            display: inline-block;
            border: 3px double #dc2626;
            color: #dc2626;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.85;
            margin-top: 15px;
        }
        .stamp-title {
            font-size: 13px;
            margin-bottom: 3px;
            border-bottom: 1px solid #dc2626;
            padding-bottom: 3px;
        }
        .sig-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .sig-name {
            font-size: 12px;
            color: #4b5563;
            margin-bottom: 15px;
        }
        .sig-drawing {
            font-family: 'Georgia', serif;
            font-style: italic;
            font-size: 24px;
            color: #1e3a8a;
            margin-top: 10px;
            padding-left: 20px;
        }
        .footer-note {
            position: absolute;
            bottom: 30px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    <!-- Header Table -->
    <table class="header-table">
        <tr>
            <td class="header-logo-cell">
                <div class="header-logo-square">UPF</div>
            </td>
            <td class="header-text-cell">
                <h1 class="univ-title">Université Privée de Fès</h1>
                <p class="univ-sub">Direction des Affaires Académiques et de la Scolarité</p>
            </td>
            <td class="header-right-cell">
                Réf: UPF-DOC-{{ str_pad($docRequest->id, 6, '0', STR_PAD_LEFT) }}<br>
                Date de demande: {{ $docRequest->created_at->format('d/m/Y') }}
            </td>
        </tr>
    </table>

    <!-- Document Title -->
    <div class="doc-title-container">
        <h2 class="doc-title">
            @if(str_contains(strtolower($docRequest->type), 'scolarité'))
                Attestation de Scolarité
            @elseif(str_contains(strtolower($docRequest->type), 'travail'))
                Attestation de Travail
            @elseif(str_contains(strtolower($docRequest->type), 'paie'))
                Bulletin de Paie Simplifié
            @elseif(str_contains(strtolower($docRequest->type), 'mission'))
                Ordre de Mission Officiel
            @else
                {{ $docRequest->type }}
            @endif
        </h2>
    </div>

    <!-- Document Content -->
    <div class="content-section">
        <p class="content-p">
            Le Secrétariat Général et la Direction Académique de l'Université Privée de Fès attestent par la présente les informations suivantes concernant le membre affilié ci-dessous :
        </p>

        <table class="info-table">
            <!-- Common Info -->
            <tr>
                <td class="info-label">Nom Complet</td>
                <td class="info-val"><strong>{{ $docRequest->user->name }}</strong></td>
            </tr>
            <tr>
                <td class="info-label">Code d'Identification (CIN)</td>
                <td class="info-val">{{ $docRequest->user->cin ?: 'N/A' }}</td>
            </tr>
            <tr>
                <td class="info-label">Adresse Email</td>
                <td class="info-val">{{ $docRequest->user->email }}</td>
            </tr>

            <!-- Student specific -->
            @if($docRequest->user->role === 'student')
                <tr>
                    <td class="info-label">Filière d'Études</td>
                    <td class="info-val">{{ $docRequest->user->studentProfile?->field?->name ?: 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Classe / Groupe</td>
                    <td class="info-val">{{ $docRequest->user->studentProfile?->group?->name ?: 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Année Académique</td>
                    <td class="info-val">{{ date('Y') }} / {{ date('Y') + 1 }}</td>
                </tr>
            @endif

            <!-- Professor specific -->
            @if($docRequest->user->role === 'professor')
                <tr>
                    <td class="info-label">Département d'Enseignement</td>
                    <td class="info-val">{{ $docRequest->user->professorProfile?->department ?: 'Sciences de l\'Ingénieur' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Spécialité Académique</td>
                    <td class="info-val">{{ $docRequest->user->professorProfile?->speciality ?: 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Type de Contrat</td>
                    <td class="info-val">{{ $docRequest->user->professorProfile?->employment_type ?: 'Permanent' }}</td>
                </tr>
            @endif

            <!-- Document details for specific requests -->
            @if($docRequest->destination)
                <tr>
                    <td class="info-label">Destination de la Mission</td>
                    <td class="info-val">{{ $docRequest->destination }}</td>
                </tr>
            @endif
            @if($docRequest->start_date && $docRequest->end_date)
                <tr>
                    <td class="info-label">Période / Dates</td>
                    <td class="info-val">Du {{ \Carbon\Carbon::parse($docRequest->start_date)->format('d/m/Y') }} au {{ \Carbon\Carbon::parse($docRequest->end_date)->format('d/m/Y') }}</td>
                </tr>
            @endif
            @if($docRequest->motif)
                <tr>
                    <td class="info-label">Objet / Motif</td>
                    <td class="info-val">{{ $docRequest->motif }}</td>
                </tr>
            @endif
        </table>

        <p class="content-p">
            Cette attestation est délivrée à l'intéressé(e) pour servir et faire valoir ce que de droit. L'université certifie l'authenticité des données déclarées ci-dessus.
        </p>
    </div>

    <!-- Date Section -->
    <div class="date-section">
        Fait à Fès, le {{ date('d/m/Y') }}
    </div>

    <!-- Signatures and Stamps -->
    <table class="signature-section-table">
        <tr>
            <td class="sig-cell">
                <div class="sig-title">Le Directeur Académique</div>
                <div class="sig-name">Direction Générale UPF</div>
                <div class="sig-drawing">M. Benjelloun</div>
            </td>
            <td class="sig-cell" style="text-align: right;">
                <div class="stamp-box">
                    <div class="stamp-title">Université Privée de Fès</div>
                    * TAMPON OFFICIEL *<br>
                    TAMPON NUMÉRIQUE SIGNÉ
                </div>
            </td>
        </tr>
    </table>

    <!-- Footer Note -->
    <div class="footer-note">
        Université Privée de Fès - Route d'Imouzzer, Fès, Maroc. Tél: +212 (0) 535 600 800 - Email: contact@upf.ac.ma<br>
        Ce document est signé électroniquement et possède une valeur juridique officielle. Réf vérification: UPF-{{ md5($docRequest->id) }}
    </div>

</body>
</html>
