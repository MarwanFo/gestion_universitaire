<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('timetable_id')->constrained('timetables')->onDelete('cascade');
            $table->date('date');
            $table->integer('session_part')->default(1); // 1 for first 1:30, 2 for second 1:30
            $table->string('status')->default('absent'); // absent, present
            $table->string('justification_path')->nullable();
            $table->string('justification_status')->default('none'); // none, pending, validated, rejected
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'timetable_id', 'date', 'session_part']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
