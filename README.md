# Smart UPF - Système de Gestion Universitaire

## Description
Plateforme universitaire complète développée avec Laravel 11 et React, permettant la gestion pédagogique et administrative d'un établissement d'enseignement supérieur. 

## Fonctionnalités Principales
- **Espace Administration :** Gestion des utilisateurs, des filières, des modules, et validation des demandes administratives.
- **Espace Enseignant :** Saisie des notes, gestion des absences (feuille d'appel), réservation de salles, et tenue du cahier de textes.
- **Espace Étudiant :** Consultation des notes, suivi des absences, soumission de justificatifs et demandes d'attestations ou relevés de notes.
- **Sécurité :** Authentification par rôles via Laravel Sanctum et API REST sécurisée.

## Stack Technique
- **Backend :** Laravel 11, PostgreSQL, API REST
- **Frontend :** React (Vite), Tailwind CSS
- **Outils :** Axios, Lucide React (Icônes)

## Installation et Déploiement

### Prérequis
- PHP 8.2+
- Composer
- Node.js & npm
- PostgreSQL

### Backend (API Laravel)
1. Allez dans le dossier `backend` : `cd backend`
2. Installez les dépendances : `composer install`
3. Configurez l'environnement : copiez `.env.example` vers `.env` et configurez votre connexion PostgreSQL.
4. Générez la clé de l'application : `php artisan key:generate`
5. Exécutez les migrations et les seeders : `php artisan migrate:fresh --seed`
6. Lancez le serveur : `php artisan serve`

### Frontend (Application React)
1. Allez dans le dossier `frontend` : `cd frontend`
2. Installez les dépendances : `npm install`
3. Lancez le serveur de développement : `npm run dev`

### Utilisateurs par défaut (générés par le Seeder)
- **Admin :** `admin@upf.ac.ma` (Mot de passe: `Password123`)
- **Professeur :** `prof.benjelloun@upf.ac.ma` (Mot de passe: `Password123`)
- **Étudiant :** `student.alami@upf.ac.ma` (Mot de passe: `Password123`)
