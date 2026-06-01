<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'level', 'academic_year', 'room_id', 'field_id'];

    public function field(): BelongsTo
    {
        return $this->belongsTo(Field::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function studentProfiles(): HasMany
    {
        return $this->hasMany(StudentProfile::class, 'group_id');
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }
}
