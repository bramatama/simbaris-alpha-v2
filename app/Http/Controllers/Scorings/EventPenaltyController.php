<?php

namespace App\Http\Controllers\Scorings;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPenalty;
use App\Models\MasterPenalty;
use App\Models\EventChampionCategory; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EventPenaltyController extends Controller
{
    /**
     * Menampilkan Halaman Manajemen Penalti (Form Tambah/Edit & Tabel Daftar).
     */
    public function index($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $eventPenalties = EventPenalty::where('event_id', $event->event_id)
            ->with([
                'masterPenalty',
                'championCategories.championCategory' 
            ])
            ->latest()
            ->get();

        // Data master dikirim HANYA untuk dijadikan opsi Select/Dropdown di frontend
        $masterPenalties = MasterPenalty::orderBy('penalty_name', 'asc')->get();

        $championCategories = EventChampionCategory::where('event_id', $event->event_id)
            ->with('championCategory:champion_category_id,champion_category_name')
            ->get();

        return inertia('events/penalties/committee/Index', [
            'event' => $event,
            'eventPenalties' => $eventPenalties,
            'masterPenalties' => $masterPenalties,
            'championCategories' => $championCategories,
        ]);
    }

    /**
     * Menyimpan data penalti baru (Dipanggil dari form di halaman Index).
     */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $validated = $this->validatePenaltyForm($request);

        DB::transaction(function () use ($validated, $event) {
            
            // Cek apakah penalti master ini sudah pernah ditambahkan ke event ini
            $exists = EventPenalty::where('event_id', $event->event_id)
                ->where('master_penalty_id', $validated['master_penalty_id'])
                ->exists();

            if ($exists) {
            throw ValidationException::withMessages([
                    'master_penalty_id' =>
                        'Aturan penalti ini sudah ada di dalam event.',
                ]);            
            }

            $eventPenalty = EventPenalty::create([
                'event_id' => $event->event_id,
                'master_penalty_id' => $validated['master_penalty_id'], // Langsung pakai ID dari Master
                'description' => $validated['description'] ?? null, 
                'penalty_value' => round((float) $validated['penalty_value'], 2),
                'calculation_type' => $validated['calculation_type'],
                'penalty_action' => $validated['penalty_action'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            $this->syncTargetCategories($eventPenalty->event_penalty_id, $validated['event_champion_category_ids']);
        });

        return redirect()->back()->with('success', 'Aturan penalti berhasil ditambahkan.');
    }

    /**
     * Memperbarui data penalti (Dipanggil ketika mode form beralih ke Edit).
     */
    public function update(Request $request, $public_id, $event_penalty_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $event_penalty_id)
            ->firstOrFail();

        // Validasi ekstra saat update: pastikan master_penalty_id tidak bentrok dengan data lain
        $validated = $this->validatePenaltyForm($request, $eventPenalty->event_penalty_id);

        DB::transaction(function () use ($validated, $eventPenalty) {
            
            $eventPenalty->update([
                'master_penalty_id' => $validated['master_penalty_id'], // Update ID Master
                'description' => $validated['description'] ?? null, 
                'penalty_value' => round((float) $validated['penalty_value'], 2),
                'calculation_type' => $validated['calculation_type'],
                'penalty_action' => $validated['penalty_action'],
            ]);

            DB::table('event_penalty_champion_categories')
                ->where('event_penalty_id', $eventPenalty->event_penalty_id)
                ->delete();

            $this->syncTargetCategories($eventPenalty->event_penalty_id, $validated['event_champion_category_ids']);
        });

        return redirect()->back()->with('success', 'Aturan penalti berhasil diperbarui.');
    }

    /**
     * Mengaktifkan/Menonaktifkan penalti langsung dari tabel.
     */
    public function toggleStatus($public_id, $event_penalty_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $event_penalty_id)
            ->firstOrFail();

        $eventPenalty->update([
            'is_active' => !$eventPenalty->is_active 
        ]);

        $statusText = $eventPenalty->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Penalti berhasil $statusText.");
    }

    /**
     * Menghapus aturan penalti langsung dari tabel.
     */
    public function destroy($public_id, $event_penalty_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $event_penalty_id)
            ->firstOrFail();

        $eventPenalty->delete();

        return redirect()->back()->with('success', 'Aturan penalti berhasil dihapus.');
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    private function validatePenaltyForm(Request $request, $ignoreEventPenaltyId = null)
    {
        $rules = [
            'master_penalty_id' => 'required|exists:master_penalties,master_penalty_id', // Berubah jadi ID
            'description' => 'nullable|string', 
            'penalty_value' => 'required|numeric|min:0',
            'calculation_type' => ['required', Rule::in(['fixed', 'per_occurrence', 'per_second'])],
            'penalty_action' => ['required', Rule::in(['deduction', 'disqualification'])],
            'is_active' => 'boolean',
            'event_champion_category_ids' => 'required|array|min:1',
            'event_champion_category_ids.*' => 'exists:event_champion_categories,event_champion_category_id',
        ];

        // Validasi opsional untuk update: Mencegah admin memilih master_penalty_id yang sudah dipakai
        // oleh record event_penalties lain di event yang sama.
        if ($ignoreEventPenaltyId) {
            $rules['master_penalty_id'] = [
                'required',
                'exists:master_penalties,master_penalty_id',
                Rule::unique('event_penalties')->where(function ($query) use ($request) {
                    return $query->where('event_id', $request->route('event_id')); // Sesuaikan parameter route-mu
                })->ignore($ignoreEventPenaltyId, 'event_penalty_id')
            ];
        }

        return $request->validate($rules);
    }

    private function syncTargetCategories($eventPenaltyId, $categoryIds)
    {
        $pivotData = array_map(function ($categoryId) use ($eventPenaltyId) {
            return [
                'event_penalty_id' => $eventPenaltyId,
                'event_champion_category_id' => $categoryId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }, $categoryIds);

        DB::table('event_penalty_champion_categories')->insert($pivotData);
    }
}