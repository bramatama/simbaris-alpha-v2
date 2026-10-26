<?php

namespace App\Http\Controllers\Participations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventLevel;
use App\Models\Participation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ParticipationOrderController extends Controller
{
    /**
     * 1. INDEX: Menampilkan daftar urutan peserta (Read-only) difilter per jenjang.
     */
    public function index(Request $request, $public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $eventLevels = EventLevel::with('level:level_id,level_name')
            ->where('event_id', $event->event_id)
            ->get();

        $activeLevelId = $request->query('level_id');
        $activeLevel = $activeLevelId 
            ? $eventLevels->where('event_level_id', $activeLevelId)->first() 
            : $eventLevels->first();

        if (!$activeLevel) {
            abort(404, 'Event ini belum memiliki jenjang perlombaan.');
        }

        // Ambil peserta yang disetujui, urutkan berdasarkan appearance_order (null di bawah)
        $participations = Participation::select('participation_id', 'team_name', 'pic_name', 'appearance_order', 'status')
            ->where('event_id', $event->event_id)
            ->where('event_level_id', $activeLevel->event_level_id)
            ->where('status', 'approved')
            ->orderByRaw('ISNULL(appearance_order), appearance_order ASC')
            ->orderBy('created_at', 'ASC')
            ->get();

        return inertia('events/participations/orders/committee/Index', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'activeLevel' => $activeLevel,
            'participations' => $participations,
        ]);
    }

    /**
     * 2. EDIT: Halaman Form untuk menyusun nomor urut di satu jenjang spesifik.
     */
    public function edit($public_id, $event_level_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $eventLevel = EventLevel::with('level:level_id,level_name')
            ->where('event_level_id', $event_level_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $participations = Participation::select('participation_id', 'team_name', 'pic_name', 'appearance_order')
            ->where('event_id', $event->event_id)
            ->where('event_level_id', $eventLevel->event_level_id)
            ->where('status', 'approved')
            ->orderByRaw('ISNULL(appearance_order), appearance_order ASC')
            ->orderBy('created_at', 'ASC')
            ->get();

        return inertia('events/participations/orders/committee/Edit', [
            'event' => $event,
            'eventLevel' => $eventLevel,
            'participations' => $participations,
        ]);
    }

    /**
     * 3. UPDATE: Menyimpan perubahan massal nomor urut untuk jenjang tersebut.
     */
    public function update(Request $request, $public_id, $event_level_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $eventLevel = EventLevel::where('event_level_id', $event_level_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $validated = $request->validate([
            'orders' => 'present|array',
            'orders.*.participation_id' => 'required|exists:participations,participation_id',
            'orders.*.appearance_order' => 'required|integer|min:1',
        ]);

        $orderNumbers = collect($validated['orders'])->pluck('appearance_order')->toArray();
        if (count($orderNumbers) !== count(array_unique($orderNumbers))) {
            throw ValidationException::withMessages([
                'orders' => 'Terdapat nomor urut yang ganda. Pastikan setiap tim memiliki nomor urut tampil yang unik.'
            ]);
        }

        DB::transaction(function () use ($validated, $event, $eventLevel) {
            $participationIds = collect($validated['orders'])->pluck('participation_id')->toArray();

            // TAHAP 1: Kosongkan sementara (set null) nomor urut untuk tim-tim yang diubah
            // Ini untuk menghindari bentrok 'Duplicate entry' saat posisi saling bertukar
            Participation::whereIn('participation_id', $participationIds)
                ->where('event_id', $event->event_id)
                ->where('event_level_id', $eventLevel->event_level_id)
                ->update(['appearance_order' => null]);

            // TAHAP 2: Masukkan nomor urut final yang baru
            foreach ($validated['orders'] as $orderData) {
                Participation::where('participation_id', $orderData['participation_id'])
                    ->where('event_id', $event->event_id)
                    ->update([
                        'appearance_order' => $orderData['appearance_order']
                    ]);
            }
        });

        return redirect()->route('committee.events.participations.orders.index', [
            'public_id' => $public_id,
            'level_id' => $eventLevel->event_level_id
        ])->with('success', 'Nomor urut tampil berhasil diperbarui!');
    }

    /**
     * 4. DESTROY: Reset (kosongkan) seluruh nomor urut pada jenjang ini.
     */
    public function destroy($public_id, $event_level_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $eventLevel = EventLevel::where('event_level_id', $event_level_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        Participation::where('event_id', $event->event_id)
            ->where('event_level_id', $eventLevel->event_level_id)
            ->where('status', 'approved')
            ->update(['appearance_order' => null]);

        return redirect()->back()->with('success', 'Nomor urut tampil berhasil di-reset menjadi kosong.');
    }
}