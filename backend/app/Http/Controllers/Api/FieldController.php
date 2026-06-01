<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Field;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return response()->json(Field::all());
    }

    /**
     * Get list of buildings for dropdown selection.
     */
    public function getBuildings(Request $request)
    {
        return response()->json(Building::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:fields,code',
            'cycle' => 'required|in:LICENCE,MASTER,INGENIEUR,PREPA',
            'duration' => 'required|integer|min:1|max:10',
        ]);

        $field = Field::create($validated);

        return response()->json([
            'message' => 'Filière créée avec succès.',
            'field' => $field->fresh()
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $field = Field::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('fields', 'code')->ignore($field->id),
            ],
            'cycle' => 'required|in:LICENCE,MASTER,INGENIEUR,PREPA',
            'duration' => 'required|integer|min:1|max:10',
        ]);

        $field->update($validated);

        return response()->json([
            'message' => 'Filière modifiée avec succès.',
            'field' => $field->fresh()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $field = Field::findOrFail($id);
        $field->delete();

        return response()->json([
            'message' => 'Filière supprimée avec succès.'
        ]);
    }
}
