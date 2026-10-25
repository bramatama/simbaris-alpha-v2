<?php

namespace App\Http\Controllers\Scorings;

use App\Http\Controllers\Controller;
use App\Models\MasterScoringCategory;
use App\Models\ScoringCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterScoringCategoryController extends Controller
{
    /**
     * Menampilkan daftar Master Kategori beserta Kriteria di dalamnya (Satu Halaman Terpadu).
     */
    public function index()
    {
        $masterScoringCategories = MasterScoringCategory::with(['masterAssessmentCriteria' => function ($query) {
            $query->orderBy('criteria_name', 'asc');
        }])
        ->orderBy('master_category_id', 'asc')
        ->get();

        return inertia('events/scorings/admin/Index', [
            'masterScoringCategories' => $masterScoringCategories,
        ]);
    }

    /**
     * Menyimpan Master Kategori Penilaian baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:255|unique:master_scoring_categories,category_name',
        ]);

        MasterScoringCategory::create([
            'category_name' => str($validated['category_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Kategori Penilaian berhasil ditambahkan.');
    }

    /**
     * Memperbarui Master Kategori Penilaian.
     */
    public function update(Request $request, $master_category_id)
    {
        $category = MasterScoringCategory::findOrFail($master_category_id);

        $validated = $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('master_scoring_categories', 'category_name')->ignore($category->master_category_id, 'master_category_id'),
            ],
        ]);

        $category->update([
            'category_name' => str($validated['category_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Kategori Penilaian berhasil diperbarui.');
    }

    /**
     * Menghapus Master Kategori Penilaian (dengan proteksi).
     */
    public function destroy($master_category_id)
    {
        $category = MasterScoringCategory::findOrFail($master_category_id);

        // Proteksi: Cek apakah kategori ini sudah dipakai oleh event manapun
        $isUsedInEvents = ScoringCategory::where('master_category_id', $category->master_category_id)->exists();

        if ($isUsedInEvents) {
            return redirect()->back()->withErrors([
                'error' => 'Kategori ini tidak dapat dihapus karena sudah digunakan dalam event perlombaan.'
            ]);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Master Kategori Penilaian berhasil dihapus.');
    }
}