<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'code', 
        'credits',
        'coefficient',
        'semester',
        'type',
        'professor_id'
    ];

    protected $with = ['fields', 'professor'];

    protected $appends = ['field', 'field_id', 'professor_name'];

    public function fields(): BelongsToMany
    {
        return $this->belongsToMany(Field::class, 'field_module');
    }

    public function getFieldAttribute()
    {
        return $this->fields->first();
    }

    public function getFieldIdAttribute()
    {
        return $this->fields->first()?->id;
    }

    public function getProfessorNameAttribute()
    {
        return $this->professor?->name;
    }

    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }
}
