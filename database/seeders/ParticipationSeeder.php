<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ParticipationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        $event = DB::table('events')->where('status', 'registration_open')->first();
        
        $teamSmp = DB::table('official_teams')->where('institution', 'SMPN 1 Jakarta')->first();
        $teamSma = DB::table('official_teams')->where('institution', 'SMAN 5 Bandung')->first();

        $levelSmp = 2;
        $levelSma = 3;

        $eventLevelSmp = DB::table('event_levels')->where('event_id', $event->event_id)->where('level_id', $levelSmp)->value('event_level_id');
        $eventLevelSma = DB::table('event_levels')->where('event_id', $event->event_id)->where('level_id', $levelSma)->value('event_level_id');

        // Cari harga berdasarkan event_levels
        $feeSmp = DB::table('event_levels')->where('event_id', $event->event_id)->where('level_id', $levelSmp)->value('registration_fees');
        $feeSma = DB::table('event_levels')->where('event_id', $event->event_id)->where('level_id', $levelSma)->value('registration_fees');

        // 1. Tim SMP Mendaftar tapi BELUM divalidasi admin (Status Pending)
        DB::table('participations')->insert([
            'public_id' => Str::uuid(),
            'event_id' => $event->event_id,
            'official_team_id' => $teamSmp->official_team_id,
            'event_level_id' => $eventLevelSmp,
            'pic_name' => 'Ahmad',
            'pic_phone_number' => '087808972890',
            'team_name' => 'Pasukan Garuda Muda',
            'status' => 'pending',
            'payment_proof_path' => 'payment_proofs/dummy_proof.png',
            'billed_amount' => $feeSmp, // Mengambil harga 150rb
            'created_at' => $now, 'updated_at' => $now
        ]);

        // 2. Tim SMA Mendaftar dan SUDAH divalidasi admin (Status Approved)
        $participationSmaId = DB::table('participations')->insertGetId([
            'public_id' => Str::uuid(),
            'event_id' => $event->event_id,
            'official_team_id' => $teamSma->official_team_id,
            'event_level_id' => $eventLevelSma,
            'pic_name' => 'Ahmad',
            'pic_phone_number' => '087808972890',
            'team_name' => 'Cobra Paskibra SMAN 5',
            'status' => 'approved',
            'payment_proof_path' => 'payment_proofs/dummy_proof.png',
            'billed_amount' => $feeSma, // Mengambil harga 200rb
            'created_at' => $now, 'updated_at' => $now
        ]);

        // 3. Masukkan Anggota Tim untuk Tim SMA (1 Danton, 15 Anggota)
        $members = [];
        // Danton
        $members[] = [
            'participation_id' => $participationSmaId, 'member_name' => 'Budi Santoso', 'member_role' => 'commander', 'member_position' => 'Danton Utama', 'created_at' => $now, 'updated_at' => $now
        ];
        // 15 anggota
        for ($i = 1; $i <= 15; $i++) {
            $members[] = [
                'participation_id' => $participationSmaId, 'member_name' => "Anggota Pasukan $i", 'member_role' => 'member', 'member_position' => "Banjar $i", 'created_at' => $now, 'updated_at' => $now
            ];
        }
        DB::table('team_members')->insert($members);
    }
}