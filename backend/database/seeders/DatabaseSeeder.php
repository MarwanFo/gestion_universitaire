<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Field;
use App\Models\Group;
use App\Models\Module;
use App\Models\Room;
use App\Models\Timetable;
use App\Models\Grade;
use App\Models\Absence;
use App\Models\Announcement;
use App\Models\Comment;
use App\Models\DocumentRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Fields
        $field = Field::create([
            'name' => 'Génie Informatique',
            'code' => 'GINFO',
        ]);

        // 2. Groups
        $group3A = Group::create([
            'name' => 'GINFO-3A',
            'field_id' => $field->id,
        ]);

        $group2A = Group::create([
            'name' => 'GINFO-2A',
            'field_id' => $field->id,
        ]);

        // 3. Users (Admin, Professors, Students)
        $admin = User::create([
            'name' => 'Directeur Académique',
            'email' => 'admin@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'admin',
        ]);

        $profBenjelloun = User::create([
            'name' => 'Prof. Benjelloun',
            'email' => 'prof.benjelloun@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'professor',
        ]);

        $profTazi = User::create([
            'name' => 'Prof. Tazi',
            'email' => 'prof.tazi@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'professor',
        ]);

        // Students 3A
        $studentAlami = User::create([
            'name' => 'Marwan Alami',
            'email' => 'student.alami@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'group_id' => $group3A->id,
        ]);

        $studentKamali = User::create([
            'name' => 'Sara Kamali',
            'email' => 'student.kamali@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'group_id' => $group3A->id,
        ]);

        $studentBennani = User::create([
            'name' => 'Youssef Bennani',
            'email' => 'student.bennani@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'group_id' => $group3A->id,
        ]);

        // Students 2A
        $studentTazi = User::create([
            'name' => 'Anas Tazi',
            'email' => 'student.tazi@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'group_id' => $group2A->id,
        ]);

        $studentFilali = User::create([
            'name' => 'Lina Filali',
            'email' => 'student.filali@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'group_id' => $group2A->id,
        ]);

        // 4. Modules
        $moduleWeb = Module::create([
            'name' => 'Technologie Web 2 (React & Laravel)',
            'code' => 'GINFO-TW2',
            'field_id' => $field->id,
            'professor_id' => $profBenjelloun->id,
        ]);

        $moduleDb = Module::create([
            'name' => 'Base de données Avancées (Postgres)',
            'code' => 'GINFO-DB',
            'field_id' => $field->id,
            'professor_id' => $profTazi->id,
        ]);

        $moduleAgile = Module::create([
            'name' => 'Management de Projet Agile',
            'code' => 'GINFO-AGILE',
            'field_id' => $field->id,
            'professor_id' => $profBenjelloun->id,
        ]);

        $moduleNetwork = Module::create([
            'name' => 'Réseaux & Protocoles',
            'code' => 'GINFO-NET',
            'field_id' => $field->id,
            'professor_id' => $profTazi->id,
        ]);

        // 5. Rooms
        $room101 = Room::create(['name' => 'Salle 101', 'type' => 'Cours', 'capacity' => 40]);
        $room102 = Room::create(['name' => 'Salle 102', 'type' => 'TD', 'capacity' => 30]);
        $roomAmphi = Room::create(['name' => 'Amphi A', 'type' => 'Amphithéâtre', 'capacity' => 150]);
        $roomLab = Room::create(['name' => 'Labo Info 1', 'type' => 'TP', 'capacity' => 25]);

        // 6. Timetables
        $t1 = Timetable::create([
            'module_id' => $moduleNetwork->id,
            'group_id' => $group3A->id,
            'room_id' => $room102->id,
            'day' => 'Lundi',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
        ]);

        $t2 = Timetable::create([
            'module_id' => $moduleAgile->id,
            'group_id' => $group3A->id,
            'room_id' => $room101->id,
            'day' => 'Lundi',
            'start_time' => '14:00:00',
            'end_time' => '16:00:00',
        ]);

        $t3 = Timetable::create([
            'module_id' => $moduleDb->id,
            'group_id' => $group3A->id,
            'room_id' => $roomLab->id,
            'day' => 'Mardi',
            'start_time' => '11:00:00',
            'end_time' => '13:00:00',
        ]);

        $t4 = Timetable::create([
            'module_id' => $moduleWeb->id,
            'group_id' => $group3A->id,
            'room_id' => $roomLab->id,
            'day' => 'Mercredi',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
        ]);

        // 7. Grades
        // Grades Alami
        Grade::create(['student_id' => $studentAlami->id, 'module_id' => $moduleWeb->id, 'cc1' => 15, 'cc2' => 16, 'exam' => 14, 'final_grade' => 14.6]);
        Grade::create(['student_id' => $studentAlami->id, 'module_id' => $moduleDb->id, 'cc1' => 13, 'cc2' => 12, 'exam' => 14, 'final_grade' => 13.4]);
        Grade::create(['student_id' => $studentAlami->id, 'module_id' => $moduleNetwork->id, 'cc1' => 11, 'cc2' => 10, 'exam' => 12, 'final_grade' => 11.4]);
        Grade::create(['student_id' => $studentAlami->id, 'module_id' => $moduleAgile->id, 'cc1' => 16, 'cc2' => 15, 'exam' => 17, 'final_grade' => 16.4]);

        // Grades Kamali
        Grade::create(['student_id' => $studentKamali->id, 'module_id' => $moduleWeb->id, 'cc1' => 17, 'cc2' => 18, 'exam' => 16, 'final_grade' => 16.6]);
        Grade::create(['student_id' => $studentKamali->id, 'module_id' => $moduleDb->id, 'cc1' => 14, 'cc2' => 15, 'exam' => 13, 'final_grade' => 13.6]);

        // Grades Bennani
        Grade::create(['student_id' => $studentBennani->id, 'module_id' => $moduleWeb->id, 'cc1' => 12, 'cc2' => 13, 'exam' => 11, 'final_grade' => 11.6]);
        Grade::create(['student_id' => $studentBennani->id, 'module_id' => $moduleDb->id, 'cc1' => 10, 'cc2' => 11, 'exam' => 10, 'final_grade' => 10.2]);

        // 8. Absences
        Absence::create([
            'student_id' => $studentAlami->id,
            'timetable_id' => $t1->id, // Réseaux
            'date' => '2026-05-25',
            'status' => 'absent',
            'justification_status' => 'none',
        ]);

        Absence::create([
            'student_id' => $studentAlami->id,
            'timetable_id' => $t4->id, // Web
            'date' => '2026-05-18',
            'status' => 'absent',
            'justification_status' => 'validated',
            'justification_path' => 'justifications/medical_cert.pdf',
        ]);

        // 9. Classroom (Announcements & Comments)
        $announce1 = Announcement::create([
            'module_id' => $moduleWeb->id,
            'professor_id' => $profBenjelloun->id,
            'title' => 'Mise en ligne du TP 2 - Intégration React & Sanctum',
            'content' => 'Bonjour à tous, les énoncés et fichiers de démarrage pour le TP 2 sont disponibles. Veuillez travailler la partie authentification JWT et rendre vos dépôts Git avant Lundi prochain.',
        ]);

        $announce2 = Announcement::create([
            'module_id' => $moduleWeb->id,
            'professor_id' => $profBenjelloun->id,
            'title' => 'Rappel : Projet de fin de module',
            'content' => "N'oubliez pas de finaliser vos spécifications techniques (Use Case, diagrammes de séquence) d'ici demain soir. Bon courage !",
        ]);

        // Comments
        Comment::create([
            'announcement_id' => $announce1->id,
            'user_id' => $studentAlami->id,
            'content' => "Merci Monsieur ! Est-ce qu'on doit utiliser le fallback hors-ligne en cas d'erreur de CORS ?",
        ]);

        Comment::create([
            'announcement_id' => $announce1->id,
            'user_id' => $profBenjelloun->id,
            'content' => "Oui, vous pouvez implémenter la simulation dans les services d'API en cas de défaillance.",
        ]);

        // 10. Document Requests
        DocumentRequest::create([
            'user_id' => $studentAlami->id,
            'type' => 'scolarite',
            'status' => 'pending',
        ]);

        DocumentRequest::create([
            'user_id' => $studentAlami->id,
            'type' => 'releve',
            'status' => 'approved',
            'pdf_path' => 'documents/releve_ginfo2.pdf',
        ]);
    }
}
