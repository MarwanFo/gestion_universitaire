<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\DocumentRequestController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ClassroomController;
use App\Http\Controllers\Api\AdminUserController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Notes (Grades)
    Route::get('/grades', [GradeController::class, 'index']);
    Route::post('/grades/group', [GradeController::class, 'showGroupGrades']);
    Route::post('/grades', [GradeController::class, 'store']);

    // Absences
    Route::get('/absences', [AbsenceController::class, 'index']);
    Route::post('/absences', [AbsenceController::class, 'store']);
    Route::post('/absences/{id}/justify', [AbsenceController::class, 'justify']);

    // Documents administratifs
    Route::get('/documents', [DocumentRequestController::class, 'index']);
    Route::post('/documents', [DocumentRequestController::class, 'store']);
    Route::post('/documents/{id}/approve', [DocumentRequestController::class, 'approve']);
    Route::post('/documents/{id}/reject', [DocumentRequestController::class, 'reject']);

    // Espace de cours interactif (Classroom)
    Route::get('/classroom/modules', [ClassroomController::class, 'modules']);
    Route::get('/classroom/modules/{id}', [ClassroomController::class, 'index']);
    Route::post('/classroom/announcements', [ClassroomController::class, 'storeAnnouncement']);
    Route::post('/classroom/announcements/{id}/comments', [ClassroomController::class, 'storeComment']);

    // Salles et réservations
    Route::get('/reservations/rooms', [ReservationController::class, 'roomsList']);
    Route::post('/reservations', [ReservationController::class, 'store']);

    // Administration utilisateurs
    Route::get('/admin/stats', [AdminUserController::class, 'stats']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
});
