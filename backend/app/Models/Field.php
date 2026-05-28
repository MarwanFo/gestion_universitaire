<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Field extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code'];

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class);
    }
}
