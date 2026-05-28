<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'field_id'];

    public function field(): BelongsTo
    {
        return $this->belongsTo(Field::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'group_id');
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }
}
