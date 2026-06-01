<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Field extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'cycle',
        'duration',
    ];

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'field_module');
    }
}
