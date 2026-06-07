<?php

namespace Tests\Feature;

use App\Mail\AbsenceAlertMail;
use App\Mail\DocumentRequestStatusMail;
use App\Mail\ReservationConfirmedMail;
use App\Models\Absence;
use App\Models\DocumentRequest;
use App\Models\Field;
use App\Models\Group;
use App\Models\Module;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MailNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;
    protected $studentUser;
    protected $professorUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create standard users
        $this->adminUser = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@upf.ac.ma',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $this->studentUser = User::create([
            'first_name' => 'Student',
            'last_name' => 'User',
            'email' => 'student@upf.ac.ma',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);

        $this->professorUser = User::create([
            'first_name' => 'Professor',
            'last_name' => 'User',
            'email' => 'professor@upf.ac.ma',
            'password' => bcrypt('password'),
            'role' => 'professor',
        ]);
    }

    /**
     * Test email notification on Document Request Approval.
     */
    public function test_document_request_approved_sends_email()
    {
        Mail::fake();

        $docRequest = DocumentRequest::create([
            'user_id' => $this->studentUser->id,
            'type' => 'Attestation de scolarité',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/documents/{$docRequest->id}/approve");

        $response->assertStatus(200);

        Mail::assertQueued(DocumentRequestStatusMail::class, function ($mail) use ($docRequest) {
            return $mail->hasTo($this->studentUser->email) &&
                   $mail->docRequest->id === $docRequest->id &&
                   $mail->docRequest->status === 'approved';
        });
    }

    /**
     * Test email notification on Document Request Rejection.
     */
    public function test_document_request_rejected_sends_email()
    {
        Mail::fake();

        $docRequest = DocumentRequest::create([
            'user_id' => $this->studentUser->id,
            'type' => 'Attestation de scolarité',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/documents/{$docRequest->id}/reject", [
                'reason' => 'Informations incorrectes',
            ]);

        $response->assertStatus(200);

        Mail::assertQueued(DocumentRequestStatusMail::class, function ($mail) use ($docRequest) {
            return $mail->hasTo($this->studentUser->email) &&
                   $mail->docRequest->id === $docRequest->id &&
                   $mail->docRequest->status === 'rejected' &&
                   $mail->docRequest->rejection_reason === 'Informations incorrectes';
        });
    }

    /**
     * Test email notification on Reservation Approval.
     */
    public function test_reservation_approved_sends_email()
    {
        Mail::fake();

        $room = Room::create([
            'name' => 'Salle 101',
            'capacity' => 40,
            'type' => 'Cours',
        ]);

        $reservation = Reservation::create([
            'room_id' => $room->id,
            'professor_id' => $this->professorUser->id,
            'date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '08:30:00',
            'end_time' => '10:00:00',
            'reason' => 'Cours de React',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/admin/reservations/{$reservation->id}", [
                'status' => 'approved',
            ]);

        $response->assertStatus(200);

        Mail::assertQueued(ReservationConfirmedMail::class, function ($mail) use ($reservation) {
            return $mail->hasTo($this->professorUser->email) &&
                   $mail->reservation->id === $reservation->id &&
                   $mail->reservation->status === 'approved';
        });
    }

    /**
     * Test email notification on Absence Registration.
     */
    public function test_absence_registration_sends_email()
    {
        Mail::fake();

        $room = Room::create([
            'name' => 'Salle 101',
            'capacity' => 40,
            'type' => 'Cours',
        ]);

        $field = Field::create([
            'name' => 'Génie Informatique',
            'code' => 'GINFO',
            'cycle' => 'INGENIEUR',
            'duration' => 3,
        ]);

        $group = Group::create([
            'name' => 'GINFO 2',
            'level' => 2,
            'academic_year' => '2025/2026',
            'field_id' => $field->id,
        ]);

        $module = Module::create([
            'name' => 'React & Laravel',
            'code' => 'RL1',
            'credits' => 4,
            'coefficient' => 2,
            'semester' => 'S1',
            'type' => 'STANDARD',
            'professor_id' => $this->professorUser->id,
        ]);

        $timetable = Timetable::create([
            'module_id' => $module->id,
            'group_id' => $group->id,
            'room_id' => $room->id,
            'day' => 'Lundi',
            'start_time' => '08:30:00',
            'end_time' => '10:00:00',
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->professorUser, 'sanctum')
            ->postJson("/api/absences", [
                'timetable_id' => $timetable->id,
                'date' => now()->format('Y-m-d'),
                'session_part' => 1,
                'sheet' => [
                    $this->studentUser->id => true, // Absent
                ]
            ]);

        $response->assertStatus(200);

        Mail::assertQueued(AbsenceAlertMail::class, function ($mail) {
            return $mail->hasTo($this->studentUser->email) &&
                   $mail->absence->student_id === $this->studentUser->id &&
                   $mail->absence->status === 'absent';
        });
    }
}
