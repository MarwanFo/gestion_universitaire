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
2. Chaque matière (module) planifiée sur un jour doit durer exactement 3 heures, divisée en 2 séances de 1h30 chacune séparées par une pause de 30 minutes.
3. Il y a 2 blocs de cours possibles par jour (un le matin, un l'après-midi) :
   - Bloc Matin : Séance 1 de 08:30:00 à 10:00:00 ET Séance 2 de 10:30:00 à 12:00:00.
   - Bloc Après-midi : Séance 1 de 14:00:00 à 15:30:00 ET Séance 2 de 16:00:00 à 17:30:00.
4. IMPORTANT : Pour chaque matière programmée sur un jour donné, tu dois générer OBLIGATOIREMENT les deux séances correspondantes (soit Séance 1 ET Séance 2 pour le matin, soit Séance 1 ET Séance 2 pour l'après-midi). Ne génère jamais une seule séance isolée de 1h30. Les deux séances doivent avoir le même module_id, la même salle (room_id), et le même enseignant.
5. Aucun enseignant ne peut enseigner à deux groupes différents sur le même créneau horaire (jour + heure).
6. Aucune salle ne peut accueillir deux groupes différents sur le même créneau horaire.
7. Le groupe en cours ne peut pas avoir deux cours programmés sur le même créneau.
8. Planifie chaque matière fournie au moins une fois (soit 3h au total : Séance 1 et Séance 2) sur la semaine.
9. Ne renvoie aucun commentaire ni texte explicatif avant ou après le JSON. Renvoyer uniquement le JSON brut dans ce format exact :
{
  \"slots\": [
    {
      \"module_id\": 1,
      \"room_id\": 2,
      \"day\": \"Lundi\",
      \"start_time\": \"08:30:00\",
      \"end_time\": \"10:00:00\"
    },
    {
      \"module_id\": 1,
      \"room_id\": 2,
      \"day\": \"Lundi\",
      \"start_time\": \"10:30:00\",
      \"end_time\": \"12:00:00\"
    }
  ]
}";

        $userPrompt = "Voici les données pour générer l'emploi du temps du groupe :\n";
        $userPrompt .= "Groupe: " . json_encode($group) . "\n";
        $userPrompt .= "Matières / Modules à programmer: " . json_encode($modules) . "\n";
        $userPrompt .= "Salles de cours disponibles: " . json_encode($rooms) . "\n";
        $userPrompt .= "Créneaux occupés dans le système (conflits à éviter): " . json_encode($existingSlots) . "\n";
        $userPrompt .= "Génère l'emploi du temps en respectant strictement la règle des cours de 3h divisés en deux séances de 1h30 séparées par 30 minutes de pause. Évite tous les conflits. Ne mets pas d'explication. Renvoie le format JSON demandé.";

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
