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

        // Struktur data: 'Nama Kategori Master' => ['Kriteria 1', 'Kriteria 2', ...]
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
            // 1. Simpan atau perbarui Kategori Master
            DB::table('master_scoring_categories')->updateOrInsert(
                ['category_name' => $categoryName],
                [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            // Ambil ID dari Kategori Master yang baru saja diproses
            $masterCategory = DB::table('master_scoring_categories')
                ->where('category_name', $categoryName)
                ->first();

            // 2. Simpan atau perbarui Kriteria Penilaian yang berelasi dengan Kategori tersebut
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
    }
}