<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Level;
use App\Models\EventLevel;
use App\Models\ScoringCategory;
use App\Models\JudgeExpertise;
use App\Concerns\HasEventAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventLevelController extends Controller
{
    use HasEventAccess;
    /**
     * Menampilkan halaman konfigurasi level & biaya untuk event tertentu.
     */
    public function index($public_id)
    {
        $event = Event::select('event_id', 'event_name', 'public_id')
                ->where('public_id', $public_id)
                ->with('eventLevels.level') 
                ->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

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

        $this->validateEventAccess($event, ['administration'], ['committee']);

        $validated = $request->validate([
            'levels' => 'required|array|min:1',
            'levels.*.level_id' => 'required|exists:levels,level_id',
            'levels.*.registration_fees' => 'required|integer|min:0',
            'levels.*.quota' => 'nullable|integer|min:0',
        ], [
            'levels.required' => 'Pilih minimal satu jenjang kompetisi.',
            'levels.min' => 'Pilih minimal satu jenjang kompetisi.',
            'levels.*.level_id.required' => 'Jenjang tidak valid.',
            'levels.*.level_id.exists' => 'Jenjang tidak ditemukan di sistem.',
            'levels.*.registration_fees.required' => 'Biaya pendaftaran wajib diisi.',
            'levels.*.registration_fees.integer' => 'Biaya pendaftaran harus berupa angka (bilangan bulat).',
            'levels.*.registration_fees.min' => 'Biaya pendaftaran tidak boleh bernilai negatif.',
            'levels.*.quota.integer' => 'Kuota harus berupa angka.',
            'levels.*.quota.min' => 'Kuota tidak boleh bernilai negatif.',
        ]);

        try {
            DB::transaction(function () use ($validated, $event) {

                $submittedLevelIds = collect($validated['levels'])
                    ->pluck('level_id')
                    ->unique()
                    ->values()
                    ->toArray();

                // Identifikasi jenjang yang akan dihapus
                $levelsToDelete = EventLevel::where('event_id', $event->event_id)
                    ->whereNotIn('level_id', $submittedLevelIds)
                    ->get();

                // Validasi relasi sebelum penghapusan
                foreach ($levelsToDelete as $eventLevel) {

                    // Ambil kategori penilaian pada jenjang tersebut
                    $scoringCategories = ScoringCategory::where(
                        'event_level_id',
                        $eventLevel->event_level_id
                    );

                    $hasScoringCategories = $scoringCategories->exists();

                    // Periksa expertise juri melalui scoring_categories
                    $hasJudgeExpertises = JudgeExpertise::whereIn(
                        'scoring_category_id',
                        ScoringCategory::where(
                            'event_level_id',
                            $eventLevel->event_level_id
                        )->select('scoring_category_id')
                    )->exists();

                    // Tolak penghapusan jika masih memiliki relasi
                    if ($hasScoringCategories || $hasJudgeExpertises) {

                        $levelName = $eventLevel->level->level_name
                            ?? 'Jenjang ini';

                        $relations = [];

                        if ($hasScoringCategories) {
                            $relations[] = 'kategori penilaian';
                        }

                        if ($hasJudgeExpertises) {
                            $relations[] = 'expertise juri';
                        }

                        throw new \Exception(
                            "{$levelName} tidak dapat dihapus karena masih digunakan dalam konfigurasi penilaian atau juri."
                        );
                    }
                }

                // Simpan atau perbarui konfigurasi jenjang
                foreach ($validated['levels'] as $levelData) {

                    EventLevel::updateOrCreate(
                        [
                            'event_id' => $event->event_id,
                            'level_id' => $levelData['level_id'],
                        ],
                        [
                            'registration_fees' => $levelData['registration_fees'],
                            'quota' => $levelData['quota'] ?? 0,
                        ]
                    );
                }

                // Hapus jenjang yang tidak lagi dipilih
                EventLevel::where('event_id', $event->event_id)
                    ->whereNotIn('level_id', $submittedLevelIds)
                    ->delete();
            });

            return back()->with(
                'success',
                'Konfigurasi jenjang berhasil disimpan!'
            );

        } catch (\Exception $e) {

            return back()->with('error', $e->getMessage());
        }
    }
}