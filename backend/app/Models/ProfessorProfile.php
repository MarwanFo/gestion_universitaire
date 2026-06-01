<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'speciality',
        'department',
        'employment_type',
        'office',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
