<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'cin',
        'phone',
        'avatar_path',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $with = ['studentProfile', 'professorProfile'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Appends to serialized output.
     */
    protected $appends = ['name', 'group_id', 'group'];

    /**
     * Accessor for full name to maintain backward compatibility.
     */
    public function getNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Accessor for group_id to maintain backward compatibility.
     */
    public function getGroupIdAttribute()
    {
        return $this->studentProfile ? $this->studentProfile->group_id : null;
    }

    /**
     * Accessor for group to maintain backward compatibility.
     */
    public function getGroupAttribute()
    {
        return $this->studentProfile ? $this->studentProfile->group : null;
    }

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function professorProfile(): HasOne
    {
        return $this->hasOne(ProfessorProfile::class);
    }

    public function fields()
    {
        return $this->belongsToMany(Field::class, 'field_user');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'student_id');
    }

    public function documentRequests()
    {
        return $this->hasMany(DocumentRequest::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'professor_id');
    }

    public function taughtModules()
    {
        return $this->hasMany(Module::class, 'professor_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isProfessor(): bool
    {
        return $this->role === 'professor';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }
}
