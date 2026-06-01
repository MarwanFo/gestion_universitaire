<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('credits')->default(4);
            $table->decimal('coefficient', 4, 2)->default(2.00);
            $table->enum('semester', ['S1', 'S2'])->default('S1');
            $table->enum('type', ['STANDARD', 'PFA', 'PFE'])->default('STANDARD');
            $table->foreignId('professor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
