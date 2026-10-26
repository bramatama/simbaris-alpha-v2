<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScoringSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $scoringData = [
            'PBB' => [
                'Berkumpul',
                'Berhimpun',
                'Hitung (Saf)',
                'Hormat',
                'Istirahat di Tempat (Biasa)',
            ],
            'Danton' => [
                'Vokal dan Intonasi (Suara)',
                'Penguasaan Pasukan',
                'Penguasaan Lapangan',
                'Postur dan Sikap',
                'Ketepatan Waktu Aba-aba',
            ],
            'Variasi' => [
                'Tingkat Kesulitan',
                'Kekompakan dan Dinamika',
                'Kreativitas Gerak',
                'Estetika',
            ],
            'Formasi' => [
                'Kerumitan Bentuk',
                'Kerapian Transisi',
                'Kesesuaian Ruang (Blocking)',
                'Makna dan Tema Formasi',
            ],
        ];

        foreach ($scoringData as $categoryName => $criteriaList) {
            DB::table('master_scoring_categories')->updateOrInsert(
                ['category_name' => $categoryName],
                [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $masterCategory = DB::table('master_scoring_categories')
                ->where('category_name', $categoryName)
                ->first();

            foreach ($criteriaList as $criteriaName) {
                DB::table('master_assessment_criteria')->updateOrInsert(
                    [
                        'master_category_id' => $masterCategory->master_category_id,
                        'criteria_name' => $criteriaName,
                    ],
                    [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

        $penalties = [
            'Mengganti Personil Di Luar Formulir Peserta',
            'Barisan Tidak Lengkap',
            'Menginjak/Melewati Garis Batas Lapangan',
            'Melebihi Batas Waktu Penampilan',
            'Personil Pingsan Saat Penampilan',
            'Terlambat Daftar Ulang',
            'Administrasi Tidak Lengkap',
            'Administrasi Tidak Sesuai',
        ];

        foreach ($penalties as $penalty) {
            DB::table('master_penalties')->updateOrInsert(
                [
                    'penalty_name' => $penalty,
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}