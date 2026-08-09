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

        // 3. Setup Juri & Panitia Bertugas di Event Ini
        $judges = DB::table('judges')->get();
        foreach ($judges as $judge) {
            DB::table('event_judges')->insert([
                'event_id' => $eventId1, 'judge_id' => $judge->judge_id, 'expertise' => 'PBB & Variasi', 'created_at' => $now, 'updated_at' => $now
            ]);
        }
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