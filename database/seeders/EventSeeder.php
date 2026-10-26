<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // =========================================================
        // 0. VALIDASI DATA AWAL
        // =========================================================

        $admin = DB::table('admins')->first();

        if (!$admin) {
            throw new \RuntimeException(
                'Data admin belum tersedia. Jalankan AdminSeeder terlebih dahulu.'
            );
        }

        // =========================================================
        // 1. BUAT EVENT
        // =========================================================

        $eventId1 = DB::table('events')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'event_name' => 'Lomba Paskibra Pandawa Vol IV 2026',
            'description' => 'Kompetisi baris berbaris bergengsi tingkat nasional.',
            'location' => 'GOR Bulungan, Jakarta',
            'status' => 'registration_open',
            'poster_path' => 'event_posters/dummy_poster.png',
            'registration_start_time' => $now->copy()->subDays(5),
            'registration_end_time' => $now->copy()->addDays(10),
            'start_time' => $now->copy()->addDays(20),
            'end_time' => $now->copy()->addDays(22),
            'created_by' => $admin->admin_id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // =========================================================
        // 2. SETUP JENJANG EVENT
        // =========================================================

        $eventLevelSmpId = DB::table('event_levels')->insertGetId([
            'event_id' => $eventId1,
            'level_id' => 2,
            'registration_fees' => 150000,
            'quota' => 20,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $eventLevelSmaId = DB::table('event_levels')->insertGetId([
            'event_id' => $eventId1,
            'level_id' => 3,
            'registration_fees' => 200000,
            'quota' => 25,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // =========================================================
        // 3. SETUP SCORING CATEGORIES BERDASARKAN JENJANG
        // =========================================================

        $masterCategories = DB::table('master_scoring_categories')
            ->get();

        // Menyimpan ID kategori berdasarkan jenjang event.
        // Setiap jenjang memiliki scoring_categories sendiri.
        $scoringCategoryIdsByLevel = [
            'smp' => [],
            'sma' => [],
        ];

        $eventLevels = [
            'smp' => $eventLevelSmpId,
            'sma' => $eventLevelSmaId,
        ];

        foreach ($eventLevels as $level => $eventLevelId) {
            foreach ($masterCategories as $master) {
                $scoringCategoryId = DB::table('scoring_categories')
                    ->insertGetId([
                        'event_level_id' => $eventLevelId,
                        'master_category_id' => $master->master_category_id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                $scoringCategoryIdsByLevel[$level][] =
                    $scoringCategoryId;
            }
        }

        // Gabungkan semua kategori dari jenjang SMP dan SMA.
        // Digunakan untuk simulasi pembagian keahlian juri.
        $activeScoringCategoryIds = collect(
            $scoringCategoryIdsByLevel
        )
            ->flatten()
            ->unique()
            ->values();

        // =========================================================
        // 4. SETUP JURI DAN KEAHLIANNYA
        // =========================================================

        $judges = DB::table('judges')->get();

        // ---------------------------------------------------------
        // A. Masukkan setiap juri ke event satu kali
        // ---------------------------------------------------------

        $eventJudgeIds = [];

        foreach ($judges as $judge) {
            $eventJudgeId = DB::table('event_judges')
                ->insertGetId([
                    'event_id' => $eventId1,
                    'judge_id' => $judge->judge_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

            $eventJudgeIds[] = $eventJudgeId;
        }

        // ---------------------------------------------------------
        // B. Pembagian keahlian juri berdasarkan kategori
        // ---------------------------------------------------------

        $judgeExpertiseData = [];

        // Jika kategori tersedia, setiap juri mendapat
        // 1-2 kategori secara acak untuk kebutuhan data dummy.
        if ($activeScoringCategoryIds->isNotEmpty()) {
            foreach ($eventJudgeIds as $eventJudgeId) {
                $maxCategories = min(
                    2,
                    $activeScoringCategoryIds->count()
                );

                $numberOfCategories = rand(1, $maxCategories);

                $selectedScoringCategoryIds = $activeScoringCategoryIds
                    ->shuffle()
                    ->take($numberOfCategories);

                foreach ($selectedScoringCategoryIds as $scoringCategoryId) {
                    $judgeExpertiseData[] = [
                        'event_judge_id' => $eventJudgeId,
                        'scoring_category_id' => $scoringCategoryId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        // ---------------------------------------------------------
        // C. Simpan seluruh keahlian juri sekaligus
        // ---------------------------------------------------------

        if (!empty($judgeExpertiseData)) {
            DB::table('judge_expertises')
                ->insertOrIgnore($judgeExpertiseData);
        }

        // =========================================================
        // 5. SETUP PANITIA EVENT
        // =========================================================

        $committee = DB::table('committees')->first();

        if ($committee) {
            DB::table('event_committees')->insert([
                'event_id' => $eventId1,
                'committee_id' => $committee->committee_id,
                'position' => 'administration',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}