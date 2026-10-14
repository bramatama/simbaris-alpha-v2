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
        $admin = DB::table('admins')->first(); // Mengambil admin pertama sebagai creator

        // 1. Buat Event yang sedang Buka Pendaftaran
        $eventId1 = DB::table('events')->insertGetId([
            'public_id' => Str::uuid(),
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
            'created_at' => $now, 'updated_at' => $now
        ]);

        // 2. Setup Harga Tiket per Jenjang (Event Levels)
        $eventLevelSmpId = DB::table('event_levels')->insertGetId([
            'event_id' => $eventId1, 'level_id' => 2, 'registration_fees' => 150000, 'quota' => 20, 'created_at' => $now, 'updated_at' => $now
        ]);
        $eventLevelSmaId = DB::table('event_levels')->insertGetId([
            'event_id' => $eventId1, 'level_id' => 3, 'registration_fees' => 200000, 'quota' => 25, 'created_at' => $now, 'updated_at' => $now
        ]);

        // ========================================================================
        // LANGKAH BARU: AKTIFKAN SCORING CATEGORY UNTUK EVENT INI
        // ========================================================================
        $masterCategories = DB::table('master_scoring_categories')->get();
        $activeScoringCategoryIds = [];

        foreach ($masterCategories as $master) {
            $scoringCategoryId = DB::table('scoring_categories')->insertGetId([
                'event_id' => $eventId1,
                'master_category_id' => $master->master_category_id,
                'created_at' => $now,
                'updated_at' => $now
            ]);
            $activeScoringCategoryIds[] = $scoringCategoryId; // Simpan ID untuk dipasangkan ke juri nanti
        }

        // ========================================================================
        // 3. SETUP JURI & KEAHLIANNYA DI EVENT INI
        // ========================================================================
        $judges = DB::table('judges')->get();
        $eventJudgeIds = [];
        
        // A. Masukkan Juri ke Event
        foreach ($judges as $judge) {
            $eventJudgeIds[] = DB::table('event_judges')->insertGetId([
                'event_id' => $eventId1, 
                'judge_id' => $judge->judge_id, 
                'created_at' => $now, 
                'updated_at' => $now
            ]);
        }

        // B. Pasangkan Keahlian (Expertise) Juri berdasarkan Scoring Categories Event
        $judgeExpertiseData = [];
        foreach ($eventJudgeIds as $eventJudgeId) {
            $selectedScoringCategoryIds = collect($activeScoringCategoryIds)
                ->shuffle()
                ->take(rand(1, min(2, count($activeScoringCategoryIds))));

            foreach ($selectedScoringCategoryIds as $scoringCategoryId) {
                $judgeExpertiseData[] = [
                    'event_judge_id' => $eventJudgeId,
                    'scoring_category_id' => $scoringCategoryId, // Menggunakan ID dari tabel scoring_categories (Event)
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Simpan data expertise secara bulk (Mass Insert)
        if (!empty($judgeExpertiseData)) {
            DB::table('judge_expertises')->insertOrIgnore($judgeExpertiseData);
        }

        // Setup Panitia Bertugas
        $committee = DB::table('committees')->first();
        DB::table('event_committees')->insert([
            'event_id' => $eventId1, 'committee_id' => $committee->committee_id, 'position' => 'administration', 'created_at' => $now, 'updated_at' => $now
        ]);

        // 4. Setup Hadiah Event (Simulasi untuk Jenjang SMA - Juara Utama 1)
        // $championUtama1 = DB::table('champions')->where('champion_name', 'Juara Utama 1')->first();
        // DB::table('event_champions')->insert([
        //     'event_level_id' => $eventLevelSmaId,
        //     'champion_id' => $championUtama1->champion_id,
        //     'prize_money' => 2000000,
        //     'certificate' => true,
        //     'prize_descriptions' => 'Trophy Tetap + Uang pembinaan + Piagam',
        //     'created_at' => $now, 'updated_at' => $now
        // ]);
    }
}