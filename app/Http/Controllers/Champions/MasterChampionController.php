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
     * Kunci seluruh endpoint di controller ini khusus untuk Super Admin
     */
    public function __construct()
    {
        abort_if(auth()->user()?->role !== 'admin', 403, 'Akses ditolak: Fitur ini khusus untuk Super Admin.');
    }
    
    /**
     * Menyimpan Master Piala baru.
     */
    public function store(Request $request)
    {
        $messages = [
            'champion_category_id.required' => 'Kategori juara wajib dipilih.',
            'champion_category_id.exists' => 'Kategori juara yang dipilih tidak ditemukan.',

            'champion_name.required' => 'Nama piala wajib diisi.',
            'champion_name.string' => 'Nama piala harus berupa teks.',
            'champion_name.max' => 'Nama piala maksimal 255 karakter.',
            'champion_name.unique' => 'Nama piala sudah digunakan dalam kategori juara ini. Silakan gunakan nama lain.',
        ];

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
        ], $messages);

        Champion::create([
            'champion_category_id' => $validated['champion_category_id'],
            
            // Menggunakan fungsi title() bawaan Laravel atau trim agar 
            // "juara utama 1" dan "Juara Utama 1" menjadi format yang rapi dan seragam
            'champion_name' => str($validated['champion_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Piala berhasil ditambahkan.');
    }
    
    /**
     * Memperbarui nama Master Piala.
     */
    public function update(Request $request, $champion_id)
    {
        $champion = Champion::findOrFail($champion_id);

        $messages = [
            'champion_name.required' => 'Nama piala wajib diisi.',
            'champion_name.string' => 'Nama piala harus berupa teks.',
            'champion_name.max' => 'Nama piala maksimal 255 karakter.',
            'champion_name.unique' => 'Nama piala sudah digunakan dalam kategori juara ini. Silakan gunakan nama lain.',
        ];

        $validated = $request->validate([
            'champion_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('champions', 'champion_name')
                    ->where(function ($query) use ($champion) {
                        return $query->where('champion_category_id', $champion->champion_category_id);
                    })
                    ->ignore($champion->champion_id, 'champion_id'),
            ],
        ], $messages);

        $champion->update([
            'champion_name' => str($validated['champion_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Nama Master Piala berhasil diperbarui.');
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