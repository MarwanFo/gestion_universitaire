<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authentifie l'utilisateur et délivre un token Sanctum.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $isAdminLogin = $request->boolean('is_admin_login', false);

        if ($user->role === 'admin' && !$isAdminLogin) {
            throw ValidationException::withMessages([
                'email' => ["Les administrateurs doivent utiliser le portail d'administration sécurisé."],
            ]);
        }

        if ($user->role !== 'admin' && $isAdminLogin) {
            throw ValidationException::withMessages([
                'email' => ["Accès refusé. Ce portail est réservé exclusivement aux administrateurs."],
            ]);
        }

        // Création du Token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Déconnecte l'utilisateur en révoquant ses tokens.
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }

    /**
     * Récupère le profil de l'utilisateur actuellement connecté.
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->load('group'));
    }
}
