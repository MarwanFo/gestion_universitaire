<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'module_id', 'cc1', 'cc2', 'exam', 'final_grade'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Calcule automatiquement la note finale selon la formule :
     * ((CC1 + CC2) / 2) * 0.4 + Exam * 0.6
     */
    public function calculateFinalGrade(): ?float
    {
        if ($this->cc1 === null || $this->cc2 === null || $this->exam === null) {
            return null;
        }

        $ccAverage = ($this->cc1 + $this->cc2) / 2.0;
        $final = ($ccAverage * 0.4) + ($this->exam * 0.6);
        
        return round($final, 2);
    }
}
