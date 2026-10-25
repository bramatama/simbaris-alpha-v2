<?php

namespace App\Http\Controllers\Champions;

use App\Http\Controllers\Controller;
use App\Models\ChampionCategory;
use App\Models\EventChampionCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterChampionCategoryController extends Controller
{
    /**
     * Menampilkan daftar Master Kategori Juara.
     */
    public function index()
    {
        // Mengambil semua master kategori diurutkan berdasarkan nama
        $championCategories = ChampionCategory::with([
            'champions' => function ($query) {
            $query->orderBy('champion_id', 'asc');
        }])->orderBy('champion_category_id', 'asc')->get();

        return inertia('events/champions/admin/Index', [
            'championCategories' => $championCategories,
        ]);
    }

    /**
     * Menyimpan Master Kategori Juara baru ke database pusat.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'champion_category_name' => 'required|string|max:255|unique:champion_categories,champion_category_name',
        ]);

        ChampionCategory::create([
            'champion_category_name' => $validated['champion_category_name'],
        ]);

        return redirect()->back()->with('success', 'Master Kategori Juara berhasil ditambahkan ke sistem.');
    }

    /**
     * Memperbarui nama Master Kategori Juara.
     */
    public function update(Request $request, $champion_category_id)
    {
        $category = ChampionCategory::findOrFail($champion_category_id);

        $validated = $request->validate([
            'champion_category_name' => [
                'required',
                'string',
                'max:255',
                // Pengecualian unique untuk ID yang sedang diupdate
                Rule::unique('champion_categories', 'champion_category_name')->ignore($category->champion_category_id, 'champion_category_id'),
            ],
        ]);

        $category->update([
            'champion_category_name' => $validated['champion_category_name'],
        ]);

        return redirect()->back()->with('success', 'Master Kategori Juara berhasil diperbarui.');
    }

    /**
     * Menghapus Master Kategori Juara (dengan proteksi integritas data).
     */
    public function destroy($champion_category_id)
    {
        $category = ChampionCategory::findOrFail($champion_category_id);

        $isUsedInEvents = EventChampionCategory::where('champion_category_id', $category->champion_category_id)->exists();

        if ($isUsedInEvents) {
            return redirect()->back()->withErrors([
                'error' => 'Kategori ini tidak dapat dihapus karena sudah digunakan dalam satu atau beberapa event perlombaan.'
            ]);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Master Kategori Juara berhasil dihapus.');
    }
}