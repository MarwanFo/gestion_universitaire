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
use App\Http\Controllers\Api\TimetableController;
use App\Http\Controllers\Api\FieldController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\GroupController;

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

    // Emploi du temps (Timetable)
    Route::get('/timetables', [TimetableController::class, 'index']);

    // Secured Administration API Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/timetables', [TimetableController::class, 'adminIndex']);
        Route::post('/admin/timetables', [TimetableController::class, 'store']);
        Route::put('/admin/timetables/{id}', [TimetableController::class, 'update']);
        Route::delete('/admin/timetables/{id}', [TimetableController::class, 'destroy']);
        Route::delete('/admin/timetables/group/{groupId}', [TimetableController::class, 'clear']);
        Route::post('/admin/timetables/generate', [TimetableController::class, 'generate']);
        Route::post('/admin/timetables/publish', [TimetableController::class, 'publish']);

        // Administration utilisateurs
        Route::get('/admin/stats', [AdminUserController::class, 'stats']);
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::post('/admin/users', [AdminUserController::class, 'store']);
        Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
        Route::get('/admin/fields-groups', [AdminUserController::class, 'getFieldsAndGroups']);

        // Administration filières (Fields)
        Route::get('/admin/buildings', [FieldController::class, 'getBuildings']);
        Route::get('/admin/fields', [FieldController::class, 'index']);
        Route::post('/admin/fields', [FieldController::class, 'store']);
        Route::put('/admin/fields/{id}', [FieldController::class, 'update']);
        Route::delete('/admin/fields/{id}', [FieldController::class, 'destroy']);

        // Administration matières (Modules)
        Route::get('/admin/modules', [ModuleController::class, 'index']);
        Route::post('/admin/modules', [ModuleController::class, 'store']);
        Route::put('/admin/modules/{id}', [ModuleController::class, 'update']);
        Route::delete('/admin/modules/{id}', [ModuleController::class, 'destroy']);

        // Administration groupes (Groups/Classes)
        Route::get('/admin/groups', [GroupController::class, 'index']);
        Route::post('/admin/groups', [GroupController::class, 'store']);
        Route::put('/admin/groups/{id}', [GroupController::class, 'update']);
        Route::delete('/admin/groups/{id}', [GroupController::class, 'destroy']);
        Route::get('/admin/rooms', [GroupController::class, 'getRooms']);
        Route::get('/admin/groups/{id}/students', [GroupController::class, 'getStudents']);
        Route::post('/admin/groups/split', [GroupController::class, 'splitPromotion']);
    });
});
