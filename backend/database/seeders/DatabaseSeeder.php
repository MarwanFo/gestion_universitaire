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
use App\Models\StudentProfile;
use App\Models\ProfessorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Buildings
        $buildingA = \App\Models\Building::create(['name' => 'Bâtiment A (Sciences)']);
        $buildingB = \App\Models\Building::create(['name' => 'Bâtiment B (Technologie)']);
        $buildingC = \App\Models\Building::create(['name' => 'Bâtiment C (Business & Management)']);

        // 1. Fields
        $field = Field::create([
            'name' => 'Génie Informatique',
            'code' => 'GINFO',
            'cycle' => 'INGENIEUR',
            'duration' => 3,
        ]);

        Field::create([
            'name' => 'Génie Civil',
            'code' => 'GCIVIL',
            'cycle' => 'INGENIEUR',
            'duration' => 3,
        ]);

        Field::create([
            'name' => 'Management & Commerce',
            'code' => 'MGT',
            'cycle' => 'LICENCE',
            'duration' => 3,
        ]);

        Field::create([
            'name' => 'Classe Préparatoire',
            'code' => 'PREPA-MPSI',
            'cycle' => 'PREPA',
            'duration' => 2,
        ]);

        Field::create([
            'name' => 'Master Intelligence Artificielle',
            'code' => 'M-IA',
            'cycle' => 'MASTER',
            'duration' => 2,
        ]);

        // 2. Rooms
        $room101 = Room::create(['name' => 'Salle 101', 'type' => 'TD', 'capacity' => 40]);
        $room102 = Room::create(['name' => 'Salle 102', 'type' => 'TD', 'capacity' => 30]);
        $roomAmphi = Room::create(['name' => 'Amphi A', 'type' => 'Amphithéâtre', 'capacity' => 150]);
        $roomLab = Room::create(['name' => 'Labo Info 1', 'type' => 'TP', 'capacity' => 25]);

        // 3. Groups
        $group3A = Group::create([
            'name' => 'GINFO-3A',
            'level' => 3,
            'academic_year' => '2025-2026',
            'room_id' => $room102->id,
            'field_id' => $field->id,
        ]);

        $group2A = Group::create([
            'name' => 'GINFO-2A',
            'level' => 2,
            'academic_year' => '2025-2026',
            'room_id' => $room101->id,
            'field_id' => $field->id,
        ]);

        // 3. Users (Admin, Professors, Students)
        $admin = User::create([
            'first_name' => 'Directeur',
            'last_name' => 'Académique',
            'email' => 'admin@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'admin',
            'cin' => 'AB123456',
            'phone' => '0600000001',
            'is_active' => true,
        ]);

        // Professors
        $profBenjelloun = User::create([
            'first_name' => 'Prof.',
            'last_name' => 'Benjelloun',
            'email' => 'prof.benjelloun@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'professor',
            'cin' => 'CD123456',
            'phone' => '0600000002',
            'is_active' => true,
        ]);
        ProfessorProfile::create([
            'user_id' => $profBenjelloun->id,
            'speciality' => 'Génie Logiciel & Technologies Web',
            'department' => 'Sciences de l\'Ingénieur',
            'employment_type' => 'permanent',
            'office' => 'Bureau A12',
        ]);

        $profTazi = User::create([
            'first_name' => 'Prof.',
            'last_name' => 'Tazi',
            'email' => 'prof.tazi@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'professor',
            'cin' => 'EF123456',
            'phone' => '0600000003',
            'is_active' => true,
        ]);
        ProfessorProfile::create([
            'user_id' => $profTazi->id,
            'speciality' => 'Bases de données & Systèmes complexes',
            'department' => 'Sciences de l\'Ingénieur',
            'employment_type' => 'permanent',
            'office' => 'Bureau A14',
        ]);

        // Students 3A
        $studentAlami = User::create([
            'first_name' => 'Marwan',
            'last_name' => 'Alami',
            'email' => 'student.alami@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'cin' => 'GH123456',
            'phone' => '0600000004',
            'is_active' => true,
        ]);
        StudentProfile::create([
            'user_id' => $studentAlami->id,
            'cne' => '1234567890',
            'enrollment_year' => 2023,
            'bac_type' => 'Sciences Physiques',
            'bac_grade' => 16.5,
            'level' => 3,
            'group_id' => $group3A->id,
            'field_id' => $field->id,
        ]);

        $studentKamali = User::create([
            'first_name' => 'Sara',
            'last_name' => 'Kamali',
            'email' => 'student.kamali@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'cin' => 'IJ123456',
            'phone' => '0600000005',
            'is_active' => true,
        ]);
        StudentProfile::create([
            'user_id' => $studentKamali->id,
            'cne' => '0987654321',
            'enrollment_year' => 2023,
            'bac_type' => 'Sciences Mathématiques B',
            'bac_grade' => 17.2,
            'level' => 3,
            'group_id' => $group3A->id,
            'field_id' => $field->id,
        ]);

        $studentBennani = User::create([
            'first_name' => 'Youssef',
            'last_name' => 'Bennani',
            'email' => 'student.bennani@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'cin' => 'KL123456',
            'phone' => '0600000006',
            'is_active' => true,
        ]);
        StudentProfile::create([
            'user_id' => $studentBennani->id,
            'cne' => '1122334455',
            'enrollment_year' => 2023,
            'bac_type' => 'Sciences Physiques',
            'bac_grade' => 14.8,
            'level' => 3,
            'group_id' => $group3A->id,
            'field_id' => $field->id,
        ]);

        // Students 2A
        $studentTazi = User::create([
            'first_name' => 'Anas',
            'last_name' => 'Tazi',
            'email' => 'student.tazi@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'cin' => 'MN123456',
            'phone' => '0600000007',
            'is_active' => true,
        ]);
        StudentProfile::create([
            'user_id' => $studentTazi->id,
            'cne' => '2233445566',
            'enrollment_year' => 2024,
            'bac_type' => 'Sciences Mathématiques A',
            'bac_grade' => 15.9,
            'level' => 2,
            'group_id' => $group2A->id,
            'field_id' => $field->id,
        ]);

        $studentFilali = User::create([
            'first_name' => 'Lina',
            'last_name' => 'Filali',
            'email' => 'student.filali@upf.ac.ma',
            'password' => Hash::make('Password123'),
            'role' => 'student',
            'cin' => 'OP123456',
            'phone' => '0600000008',
            'is_active' => true,
        ]);
        StudentProfile::create([
            'user_id' => $studentFilali->id,
            'cne' => '3344556677',
            'enrollment_year' => 2024,
            'bac_type' => 'Sciences Physiques',
            'bac_grade' => 15.3,
            'level' => 2,
            'group_id' => $group2A->id,
            'field_id' => $field->id,
        ]);

        // 4. Modules
        $fieldMia = Field::where('code', 'M-IA')->first();

        $moduleWeb = Module::create([
            'name' => 'Technologie Web 2 (React & Laravel)',
            'code' => 'GINFO-TW2',
            'credits' => 6,
            'coefficient' => 3.00,
            'semester' => 'S2',
            'type' => 'STANDARD',
            'professor_id' => $profBenjelloun->id,
        ]);
        $moduleWeb->fields()->attach([$field->id, $fieldMia->id]);

        $moduleDb = Module::create([
            'name' => 'Base de données Avancées (Postgres)',
            'code' => 'GINFO-DB',
            'credits' => 4,
            'coefficient' => 2.00,
            'semester' => 'S1',
            'type' => 'STANDARD',
            'professor_id' => $profTazi->id,
        ]);
        $moduleDb->fields()->attach([$field->id]);

        $moduleAgile = Module::create([
            'name' => 'Management de Projet Agile',
            'code' => 'GINFO-AGILE',
            'credits' => 4,
            'coefficient' => 1.50,
            'semester' => 'S1',
            'type' => 'STANDARD',
            'professor_id' => $profBenjelloun->id,
        ]);
        $moduleAgile->fields()->attach([$field->id]);

        $moduleNetwork = Module::create([
            'name' => 'Réseaux & Protocoles',
            'code' => 'GINFO-NET',
            'credits' => 4,
            'coefficient' => 2.00,
            'semester' => 'S1',
            'type' => 'STANDARD',
            'professor_id' => $profTazi->id,
        ]);
        $moduleNetwork->fields()->attach([$field->id]);

        $modulePfa = Module::create([
            'name' => 'Projet de Fin d\'Année',
            'code' => 'GINFO-PFA',
            'credits' => 8,
            'coefficient' => 4.00,
            'semester' => 'S2',
            'type' => 'PFA',
            'professor_id' => $profBenjelloun->id,
        ]);
        $modulePfa->fields()->attach([$field->id]);

        // 5. Rooms (Already created above)

        // 6. Timetables
        $t1 = Timetable::create([
            'module_id' => $moduleNetwork->id,
            'group_id' => $group3A->id,
            'room_id' => $room102->id,
            'day' => 'Lundi',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'is_published' => true,
        ]);

        $t2 = Timetable::create([
            'module_id' => $moduleAgile->id,
            'group_id' => $group3A->id,
            'room_id' => $room101->id,
            'day' => 'Lundi',
            'start_time' => '14:00:00',
            'end_time' => '16:00:00',
            'is_published' => true,
        ]);

        $t3 = Timetable::create([
            'module_id' => $moduleDb->id,
            'group_id' => $group3A->id,
            'room_id' => $roomLab->id,
            'day' => 'Mardi',
            'start_time' => '11:00:00',
            'end_time' => '13:00:00',
            'is_published' => true,
        ]);

        $t4 = Timetable::create([
            'module_id' => $moduleWeb->id,
            'group_id' => $group3A->id,
            'room_id' => $roomLab->id,
            'day' => 'Mercredi',
            'start_time' => '08:30:00',
            'end_time' => '11:30:00',
            'is_published' => true,
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
            'group_id' => $group3A->id,
            'professor_id' => $profBenjelloun->id,
            'title' => 'Mise en ligne du TP 2 - Intégration React & Sanctum',
            'content' => 'Bonjour à tous, les énoncés et fichiers de démarrage pour le TP 2 sont disponibles. Veuillez travailler la partie authentification JWT et rendre vos dépôts Git avant Lundi prochain.',
        ]);

        $announce2 = Announcement::create([
            'module_id' => $moduleWeb->id,
            'group_id' => $group3A->id,
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
