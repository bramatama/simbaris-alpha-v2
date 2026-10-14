<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Level;
use App\Models\EventLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventLevelController extends Controller
{
    /**
     * Menampilkan halaman konfigurasi level & biaya untuk event tertentu.
     */
    public function index($public_id)
    {
        // Ambil data event beserta konfigurasi level yang sudah ada
        $event = Event::select('event_id', 'event_name', 'public_id')
                ->where('public_id', $public_id)
                ->with('eventLevels.level') 
                ->firstOrFail();

        // Ambil semua master data jenjang (SD, SMP, SMA, dll)
        $levels = Level::all();

        return inertia('events/levels/LevelManagement', [
            'event' => $event,
            'levels' => $levels,
        ]);
    }

    /**
     * Menyimpan atau memperbarui konfigurasi biaya dan kuota jenjang.
     */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        // Validasi diperbarui untuk menerima level_name baru
        $validated = $request->validate([
            'levels' => 'required|array',
            'levels.*.level_id' => 'nullable|exists:levels,level_id',
            'levels.*.level_name' => 'nullable|string|max:255', // Untuk input jenjang baru
            'levels.*.registration_fees' => 'required|integer|min:0',
            'levels.*.quota' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $event) {
            $submittedLevelIds = [];

            foreach ($validated['levels'] as $levelData) {
                if (empty($levelData['level_id']) && !empty($levelData['level_name'])) {
                    $level = Level::firstOrCreate([
                        'level_name' => strtoupper(trim($levelData['level_name'])) 
                    ]);
                    $currentLevelId = $level->level_id;
                } else {
                    $currentLevelId = $levelData['level_id'];
                }

                if ($currentLevelId) {
                    $submittedLevelIds[] = $currentLevelId;

                    EventLevel::updateOrCreate(
                        [
                            'event_id' => $event->event_id,
                            'level_id' => $currentLevelId,
                        ],
                        [
                            'registration_fees' => $levelData['registration_fees'],
                            'quota' => $levelData['quota'] ?? 0,
                        ]
                    );
                }
            }

            if (!empty($submittedLevelIds)) {
                EventLevel::where('event_id', $event->event_id)
                    ->whereNotIn('level_id', $submittedLevelIds)
                    ->delete();
            } else {
                EventLevel::where('event_id', $event->event_id)->delete();
            }
        });

        return back()->with('success', 'Konfigurasi jenjang berhasil disimpan!');
    }
}