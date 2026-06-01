<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NvidiaLlmService
{
    protected $apiKey;
    protected $model;
    protected $endpoint;

    public function __construct()
    {
        $this->apiKey = env('NVIDIA_API_KEY');
        $this->model = env('NVIDIA_MODEL', 'meta/llama-3.1-70b-instruct');
        $this->endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
    }

    public function generateTimetable(array $group, array $modules, array $rooms, array $existingSlots)
    {
        if (empty($this->apiKey) || $this->apiKey === 'your_nvidia_api_key_here') {
            throw new \Exception("La clé API NVIDIA n'est pas configurée ou est restée à sa valeur par défaut dans le fichier .env.");
        }

        // We prepare the prompt with context
        $systemPrompt = "Tu es un algorithme expert d'aide à la génération d'emplois du temps universitaires.
Ton but est de planifier des cours sans conflits et de renvoyer UNIQUEMENT un objet JSON valide contenant la liste des créneaux horaires générés.

Règles de planification :
1. Les jours autorisés sont : Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi.
2. Les plages horaires standards de 2 heures sont :
   - 08:30:00 à 10:30:00
   - 10:30:00 à 12:30:00
   - 14:00:00 à 16:00:00
   - 16:00:00 à 18:00:00
3. Aucun enseignant ne peut enseigner à deux groupes différents sur le même créneau horaire (jour + heure).
4. Aucune salle ne peut accueillir deux groupes différents sur le même créneau horaire.
5. Le groupe en cours ne peut pas avoir deux cours programmés sur le même créneau.
6. Tu dois programmer au moins un cours pour chaque module fourni (si possible, et dans la limite des heures disponibles).
7. Ne renvoie aucun commentaire ni texte explicatif avant ou après le JSON. Renvoyer uniquement le JSON brut dans ce format exact :
{
  \"slots\": [
    {
      \"module_id\": 1,
      \"room_id\": 2,
      \"day\": \"Lundi\",
      \"start_time\": \"08:30:00\",
      \"end_time\": \"10:30:00\"
    }
  ]
}";

        $userPrompt = "Voici les données pour générer l'emploi du temps du groupe :\n";
        $userPrompt .= "Groupe: " . json_encode($group) . "\n";
        $userPrompt .= "Matières / Modules à programmer: " . json_encode($modules) . "\n";
        $userPrompt .= "Salles de cours disponibles: " . json_encode($rooms) . "\n";
        $userPrompt .= "Créneaux occupés dans le système (conflits à éviter): " . json_encode($existingSlots) . "\n";
        $userPrompt .= "Génère l'emploi du temps en évitant les conflits. Ne mets pas d'explication. Renvoie le format JSON demandé.";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post($this->endpoint, [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            'temperature' => 0.2,
            'max_tokens' => 2000,
        ]);

        if ($response->failed()) {
            Log::error("NVIDIA API error: " . $response->body());
            throw new \Exception("Erreur lors de l'appel à l'API NVIDIA : Status " . $response->status());
        }

        $result = $response->json();
        $text = $result['choices'][0]['message']['content'] ?? '';

        Log::info("NVIDIA Response text: " . $text);

        // Extract JSON block if LLM returned markdown code blocks
        if (preg_match('/\{.*\}/s', $text, $matches)) {
            $text = $matches[0];
        }

        $parsed = json_decode($text, true);
        if (!$parsed || !isset($parsed['slots'])) {
            Log::error("Failed to parse NVIDIA response as JSON slots. Raw content: " . $text);
            throw new \Exception("La réponse de l'IA n'est pas au format JSON valide.");
        }

        return $parsed['slots'];
    }
}
