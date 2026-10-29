<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ParticipationSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Cari event yang sedang membuka pendaftaran.
        $event = DB::table('events')
            ->where('status', 'registration_open')
            ->first();

        if (!$event) {
            $this->command->error(
                'Event dengan status registration_open tidak ditemukan.'
            );
            return;
        }

        // Ambil official team berdasarkan institusi.
        $teamSmp = DB::table('official_teams')
            ->where('institution', 'SMPN 1 Jakarta')
            ->first();

        $teamSma = DB::table('official_teams')
            ->where('institution', 'SMAN 5 Bandung')
            ->first();

        if (!$teamSmp || !$teamSma) {
            $this->command->error(
                'Official team SMPN 1 Jakarta atau SMAN 5 Bandung tidak ditemukan.'
            );
            return;
        }

        // Ambil jenjang dan biaya pendaftaran.
        $eventLevelSmp = DB::table('event_levels')
            ->where('event_id', $event->event_id)
            ->where('level_id', 2)
            ->first();

        $eventLevelSma = DB::table('event_levels')
            ->where('event_id', $event->event_id)
            ->where('level_id', 3)
            ->first();

        if (!$eventLevelSmp || !$eventLevelSma) {
            $this->command->error(
                'Event belum memiliki jenjang SMP dan SMA.'
            );
            return;
        }

        // Setiap official team mendaftarkan 3 tim berbeda.
        $registrations = [
            [
                'official_team' => $teamSmp,
                'event_level' => $eventLevelSmp,
                'teams' => [
                    [
                        'name' => 'Pasukan Garuda Muda',
                        'status' => 'pending',
                    ],
                    [
                        'name' => 'Pasukan Elang Nusantara',
                        'status' => 'approved',
                    ],
                    [
                        'name' => 'Pasukan Cakra Bhuwana',
                        'status' => 'rejected',
                    ],
                ],
            ],
            [
                'official_team' => $teamSma,
                'event_level' => $eventLevelSma,
                'teams' => [
                    [
                        'name' => 'Cobra Paskibra SMAN 5',
                        'status' => 'approved',
                    ],
                    [
                        'name' => 'Pasukan Ksatria Bandung',
                        'status' => 'pending',
                    ],
                    [
                        'name' => 'Pasukan Garuda Priangan',
                        'status' => 'rejected',
                    ],
                ],
            ],
        ];

        $totalParticipations = 0;
        $totalMembers = 0;

        foreach ($registrations as $registration) {
            foreach ($registration['teams'] as $teamData) {
                // Simpan masing-masing pendaftaran secara terpisah.
                $participationId = DB::table('participations')
                    ->insertGetId([
                        'public_id' => (string) Str::uuid(),
                        'event_id' => $event->event_id,
                        'official_team_id' =>
                            $registration['official_team']->official_team_id,
                        'event_level_id' =>
                            $registration['event_level']->event_level_id,
                        'pic_name' => fake()->name(),
                        'pic_phone_number' =>
                            fake()->numerify('08##########'),
                        'team_name' => $teamData['name'],
                        'status' => $teamData['status'],
                        'payment_proof_path' =>
                            'payment_proofs/dummy_proof.png',
                        'billed_amount' =>
                            $registration['event_level']->registration_fees,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                $totalParticipations++;

                // Anggota hanya dibuat untuk tim yang approved.
                if ($teamData['status'] !== 'approved') {
                    continue;
                }

                $members = [];

                // Danton.
                $members[] = [
                    'participation_id' => $participationId,
                    'member_name' => fake()->name(),
                    'member_role' => 'commander',
                    'member_position' => 'Danton Utama',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                // 15 anggota pasukan.
                for ($i = 1; $i <= 15; $i++) {
                    $members[] = [
                        'participation_id' => $participationId,
                        'member_name' => fake()->name(),
                        'member_role' => 'member',
                        'member_position' => "Banjar {$i}",
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                DB::table('team_members')->insert($members);

                $totalMembers += count($members);
            }
        }
    }
}