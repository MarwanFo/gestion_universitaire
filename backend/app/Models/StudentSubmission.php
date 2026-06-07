<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'module_id',
        'title',
        'link',
        'file_path',
        'file_name'
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
