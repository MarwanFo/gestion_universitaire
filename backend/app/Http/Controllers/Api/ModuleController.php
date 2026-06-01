<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return response()->json(Module::all());
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
            'code' => 'required|string|max:50|unique:modules,code',
            'credits' => 'required|integer|min:1|max:30',
            'coefficient' => 'required|numeric|min:0.5|max:10',
            'semester' => 'required|in:S1,S2',
            'type' => 'required|in:STANDARD,PFA,PFE',
            'field_ids' => 'required|array|min:1',
            'field_ids.*' => 'exists:fields,id',
        ]);

        // Exclude field_ids from the main creation payload since it goes into pivot table
        $moduleData = collect($validated)->except('field_ids')->toArray();
        $module = Module::create($moduleData);

        // Sync many-to-many fields relationship
        $module->fields()->sync($validated['field_ids']);

        return response()->json([
            'message' => 'Matière créée avec succès.',
            'module' => $module->fresh()
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

        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('modules', 'code')->ignore($module->id),
            ],
            'credits' => 'required|integer|min:1|max:30',
            'coefficient' => 'required|numeric|min:0.5|max:10',
            'semester' => 'required|in:S1,S2',
            'type' => 'required|in:STANDARD,PFA,PFE',
            'field_ids' => 'required|array|min:1',
            'field_ids.*' => 'exists:fields,id',
        ]);

        $moduleData = collect($validated)->except('field_ids')->toArray();
        $module->update($moduleData);

        // Sync many-to-many fields relationship
        $module->fields()->sync($validated['field_ids']);

        return response()->json([
            'message' => 'Matière modifiée avec succès.',
            'module' => $module->fresh()
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

        $module = Module::findOrFail($id);
        
        // Detach relations before deletion
        $module->fields()->detach();
        $module->delete();

        return response()->json([
            'message' => 'Matière supprimée avec succès.'
        ]);
    }
}
