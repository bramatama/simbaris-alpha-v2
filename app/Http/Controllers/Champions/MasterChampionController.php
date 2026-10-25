<?php

namespace App\Http\Controllers\Champions;

use App\Http\Controllers\Controller;
use App\Models\Champion;
use App\Models\ChampionCategory;
use App\Models\EventChampion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterChampionController extends Controller
{
    /**
     * Menyimpan Master Piala baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'champion_category_id' => 'required|exists:champion_categories,champion_category_id',
            'champion_name' => [
                'required',
                'string',
                'max:255',
                // Mencegah duplikasi nama piala di dalam kategori yang sama
                Rule::unique('champions', 'champion_name')->where(function ($query) use ($request) {
                    return $query->where('champion_category_id', $request->champion_category_id);
                }),
            ],
        ]);

        Champion::create([
            'champion_category_id' => $validated['champion_category_id'],
            
            // Menggunakan fungsi title() bawaan Laravel atau trim agar 
            // "juara utama 1" dan "Juara Utama 1" menjadi format yang rapi dan seragam
            'champion_name' => str($validated['champion_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Piala berhasil ditambahkan.');
    }

    /**
     * Menghapus Master Piala dengan proteksi relasi.
     */
    public function destroy($champion_id)
    {
        $champion = Champion::findOrFail($champion_id);

        // Proteksi jika piala ini sudah telanjur digunakan oleh panitia di event manapun
        $isUsedInEvents = EventChampion::where('champion_id', $champion->champion_id)->exists();

        if ($isUsedInEvents) {
            return redirect()->back()->withErrors([
                'error' => 'Master Piala ini tidak dapat dihapus karena sudah digunakan dalam event perlombaan.'
            ]);
        }

        $champion->delete();

        return redirect()->back()->with('success', 'Master Piala berhasil dihapus.');
    }
}