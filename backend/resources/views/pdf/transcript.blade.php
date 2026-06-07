<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Relevé de Notes - {{ $student->first_name }} {{ $student->last_name }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #2d3748;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 30px;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 15px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-logo {
            width: 50%;
            font-size: 20px;
            font-weight: bold;
            color: #2b6cb0;
        }
        .header-logo span {
            font-size: 10px;
            color: #718096;
            display: block;
            margin-top: 5px;
            font-weight: normal;
        }
        .header-title {
            text-align: right;
            width: 50%;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            color: #2d3748;
        }
        .doc-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 25px;
            color: #1a365d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .student-info {
            width: 100%;
            margin-bottom: 30px;
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }
        .student-info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .student-info-table td {
            padding: 6px 10px;
            vertical-align: top;
        }
        .label {
            font-weight: bold;
            color: #4a5568;
            width: 25%;
        }
        .value {
            color: #2d3748;
            width: 25%;
        }
        .grades-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .grades-table th {
            background-color: #2b6cb0;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            font-size: 11px;
            text-transform: uppercase;
            border: 1px solid #2b6cb0;
        }
        .grades-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
        }
        .grades-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
        }
        .badge-success {
            background-color: #c6f6d5;
            color: #22543d;
        }
        .badge-danger {
            background-color: #fed7d7;
            color: #742a2a;
        }
        .summary-container {
            width: 100%;
            margin-top: 20px;
            margin-bottom: 40px;
        }
        .summary-table {
            width: 40%;
            margin-left: 60%;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
        }
        .summary-title {
            font-weight: bold;
            background-color: #edf2f7;
            color: #4a5568;
        }
        .summary-value {
            font-weight: bold;
            font-size: 13px;
        }
        .footer {
            margin-top: 50px;
            width: 100%;
        }
        .signature-box {
            width: 45%;
            float: right;
            border: 1px dashed #cbd5e0;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            height: 110px;
        }
        .signature-title {
            font-weight: bold;
            color: #4a5568;
            margin-bottom: 45px;
            font-size: 11px;
            text-transform: uppercase;
        }
        .signature-placeholder {
            font-size: 9px;
            color: #a0aec0;
            font-style: italic;
        }
        .signature-factice {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            color: #2b6cb0;
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <div class="header">
        <table class="header-table">
            <tr>
                <td class="header-logo">
                    UNIVERSITÉ PRIVÉE DE FÈS
                    <span>PORTAIL ACADÉMIQUE DE GESTION</span>
                </td>
                <td class="header-title">
                    Document Officiel<br>
                    <span style="font-size: 9px; color: #718096; font-weight: normal;">Généré le {{ date('d/m/Y H:i') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="doc-title">
        Relevé de Notes Officiel
    </div>

    <div class="student-info">
        <table class="student-info-table">
            <tr>
                <td class="label">Nom & Prénom :</td>
                <td class="value">{{ $student->last_name }} {{ $student->first_name }}</td>
                <td class="label">C.N.E :</td>
                <td class="value">{{ $student->cne ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Filière / Classe :</td>
                <td class="value">{{ $student->group ?? 'GINFO-3A' }}</td>
                <td class="label">Année Académique :</td>
                <td class="value">{{ $student->enrollment_year ?? date('Y') - 1 . '/' . date('Y') }}</td>
            </tr>
            <tr>
                <td class="label">Email Institutionnel :</td>
                <td class="value" colspan="3">{{ $student->email }}</td>
            </tr>
        </table>
    </div>

    <table class="grades-table">
        <thead>
            <tr>
                <th style="width: 50%;">Module</th>
                <th class="text-center" style="width: 10%;">CC1</th>
                <th class="text-center" style="width: 10%;">CC2</th>
                <th class="text-center" style="width: 10%;">Exam</th>
                <th class="text-center" style="width: 10%;">Moyenne</th>
                <th class="text-center" style="width: 10%;">Statut</th>
            </tr>
        </thead>
        <tbody>
            @foreach($grades as $grade)
            <tr>
                <td>{{ $grade['module'] }}</td>
                <td class="text-center">{{ number_format($grade['cc1'], 2) }}</td>
                <td class="text-center">{{ number_format($grade['cc2'], 2) }}</td>
                <td class="text-center">{{ number_format($grade['exam'], 2) }}</td>
                <td class="text-center" style="font-weight: bold;">{{ number_format($grade['average'], 2) }}</td>
                <td class="text-center">
                    @if($grade['average'] >= 10)
                        <span class="badge badge-success">Validé</span>
                    @else
                        <span class="badge badge-danger">Ajourné</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-container">
        <table class="summary-table">
            <tr>
                <td class="summary-title">Moyenne Générale</td>
                <td class="summary-value text-right">{{ number_format($overall_average, 2) }} / 20</td>
            </tr>
            <tr>
                <td class="summary-title">Résultat de l'Année</td>
                <td class="summary-value text-right">
                    @if($overall_average >= 10)
                        <span style="color: #2f855a; font-weight: bold;">ADMIS</span>
                    @else
                        <span style="color: #c53030; font-weight: bold;">NON ADMIS</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <div class="signature-box">
            <div class="signature-title">Cachet et Signature</div>
            <div class="signature-factice">Fait à Fès, le {{ date('d/m/Y') }}<br>Administration UPF</div>
            <div class="signature-placeholder">[ Signature Numérique Officielle ]</div>
        </div>
    </div>

</body>
</html>
