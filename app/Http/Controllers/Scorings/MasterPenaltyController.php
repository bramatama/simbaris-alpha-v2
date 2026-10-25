<?php

namespace App\Http\Controllers\Scorings;

use App\Http\Controllers\Controller;
use App\Models\MasterPenalty;
use App\Models\EventPenalty;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterPenaltyController extends Controller
{
    /**
     * Menampilkan daftar Master Penalti.
     */
    public function index()
    {
        // Tarik semua data master penalti diurutkan berdasarkan nama
        $masterPenalties = MasterPenalty::orderBy('penalty_name', 'asc')->get();

        return inertia('events/penalties/admin/Index', [
            'masterPenalties' => $masterPenalties,
        ]);
    }

    /**
     * Menyimpan Master Penalti baru ke database pusat.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'penalty_name' => 'required|string|max:255|unique:master_penalties,penalty_name',
        ]);

        MasterPenalty::create([
            'penalty_name' => str($validated['penalty_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Penalti berhasil ditambahkan.');
    }

    /**
     * Memperbarui data Master Penalti.
     */
    public function update(Request $request, $master_penalty_id)
    {
        $masterPenalty = MasterPenalty::findOrFail($master_penalty_id);

        $validated = $request->validate([
            'penalty_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('master_penalties', 'penalty_name')->ignore($masterPenalty->master_penalty_id, 'master_penalty_id'),
            ],
        ]);

        $masterPenalty->update([
            'penalty_name' => str($validated['penalty_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Penalti berhasil diperbarui.');
    }

    /**
     * Menghapus Master Penalti (dengan proteksi relasi).
     */
    public function destroy($master_penalty_id)
    {
        $masterPenalty = MasterPenalty::findOrFail($master_penalty_id);

        // Proteksi: Cek apakah penalti ini sudah digunakan dalam event kepanitiaan manapun
        $isUsedInEvents = EventPenalty::where('master_penalty_id', $masterPenalty->master_penalty_id)->exists();

        if ($isUsedInEvents) {
            return redirect()->back()->withErrors([
                'error' => 'Master Penalti ini tidak dapat dihapus karena sudah digunakan dalam satu atau beberapa event perlombaan.'
            ]);
        }

        $masterPenalty->delete();

        return redirect()->back()->with('success', 'Master Penalti berhasil dihapus.');
    }
}