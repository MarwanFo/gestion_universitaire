<?php

namespace App\Services;

use App\Models\DocumentRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    /**
     * Génère un PDF pour une demande approuvée et retourne le chemin d'accès au fichier.
     *
     * @param DocumentRequest $request Demande de document approuvée.
     * @return string Chemin d'accès relatif du fichier stocké.
     */
    public function generatePdf(DocumentRequest $request): string
    {
        $user = $request->user;
        $type = $request->type;
        
        $data = [
            'request' => $request,
            'user' => $user,
            'date' => now()->format('d/m/Y'),
        ];

        // Rendu HTML vers PDF selon le type de document
        // Remarque : Nous allons configurer des templates de base
        $html = '';
        if ($type === 'scolarite') {
            $html = "<h1>ATTESTATION DE SCOLARITE</h1><p>Nous soussignés, l'Administration de l'Université Privée de Fès, attestons que l'étudiant(e) {$user->name} est inscrit(e) au cours de l'année universitaire courante.</p>";
        } elseif ($type === 'inscription') {
            $html = "<h1>CERTIFICAT D'INSCRIPTION</h1><p>Certifie que l'étudiant(e) {$user->name} est officiellement inscrit(e) dans notre établissement.</p>";
        } elseif ($type === 'releve') {
            $html = "<h1>RELEVE DE NOTES</h1><p>Relevé de notes de {$user->name} :</p><ul>";
            foreach ($user->grades as $grade) {
                $html .= "<li>{$grade->module->name} : " . ($grade->final_grade ?? 'N/A') . "</li>";
            }
            $html .= "</ul>";
        } elseif ($type === 'travail') {
            $html = "<h1>ATTESTATION DE TRAVAIL</h1><p>Atteste que le Professeur {$user->name} est un membre actif du corps professoral de notre établissement.</p>";
        } elseif ($type === 'ordre_mission') {
            $html = "<h1>ORDRE DE MISSION</h1><p>Il est ordonné au Professeur {$user->name} de se déplacer à {$request->destination} du {$request->start_date} au {$request->end_date} pour le motif suivant : {$request->motif}.</p>";
        }

        // Chargement du HTML dans PDF
        $pdf = Pdf::loadHTML($html);
        $fileName = 'documents/' . $type . '_' . $request->id . '_' . time() . '.pdf';
        
        // Stockage du PDF généré
        Storage::disk('public')->put($fileName, $pdf->output());

        // Sauvegarde du chemin dans la demande
        $request->pdf_path = $fileName;
        $request->save();

        return $fileName;
    }
}
