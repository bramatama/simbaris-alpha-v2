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
                "1 Langkah ke Belakang", "1 Langkah ke Depan", "1 Langkah ke Kanan", "1 Langkah ke Kiri",
                "2 Langkah ke Belakang", "2 Langkah ke Depan", "2 Langkah ke Kanan", "2 Langkah ke Kiri",
                "2x Belok Kanan", "2x Belok Kanan Maju", "2x Belok Kiri", "2x Belok Kiri Maju",
                "3 Langkah ke Belakang", "3 Langkah ke Depan", "3 Langkah ke Kanan", "3 Langkah ke Kiri",
                "4 Langkah ke Belakang", "4 Langkah ke Depan", "4 Langkah ke Kanan", "4 Langkah ke Kiri",
                "Balik Kanan", "Balik Kanan Henti", "Balik Kanan Jalan di Tempat", "Balik Kanan Lari Maju", "Balik Kanan Maju",
                "Belok Kanan", "Belok Kanan Maju", "Belok Kiri", "Belok Kiri Maju",
                "Berhimpun", "Berhitung (Berbanjar)", "Berhitung (Bersaf)", "Berkumpul (Berbanjar)", "Berkumpul (Bersaf)",
                "Bubar", "Buka Barisan", "Ganti Langkah",
                "Hadap Kanan", "Hadap Kanan Henti", "Hadap Kanan Jalan di Tempat", "Hadap Kanan Lari Maju", "Hadap Kanan Maju",
                "Hadap Kiri", "Hadap Kiri Henti", "Hadap Kiri Jalan di Tempat", "Hadap Kiri Lari Maju", "Hadap Kiri Maju",
                "Hadap Serong Kanan", "Hadap Serong Kanan Henti", "Hadap Serong Kanan Jalan di Tempat", "Hadap Serong Kanan Lari Maju", "Hadap Serong Kanan Maju",
                "Hadap Serong Kiri", "Hadap Serong Kiri Henti", "Hadap Serong Kiri Jalan di Tempat", "Hadap Serong Kiri Lari Maju", "Hadap Serong Kiri Maju",
                "Haluan Kanan", "Haluan Kanan Maju", "Haluan Kiri", "Haluan Kiri Maju",
                "Henti", "Hormat", "Hormat Kanan", "Hormat Kiri",
                "Istirahat di Tempat (Biasa, Berdiri)", "Istirahat di Tempat (Biasa, Bersila)", "Istirahat di Tempat (Biasa, Duduk)", "Istirahat di Tempat (Parade)", "Istirahat di Tempat (Perhatian)",
                "Jalan di Tempat", "Langkah Biasa", "Langkah Merdeka", "Langkah Perlahan", "Langkah Perlahan Maju", "Langkah Tegap", "Langkah Tegap Maju",
                "Lari", "Lari Maju", "Lencang Depan", "Lencang Kanan", "Lencang Kiri", "Maju Jalan",
                "Melintang Kanan", "Melintang Kanan Maju", "Melintang Kiri", "Melintang Kiri Maju",
                "Periksa Kerapihan (Biasa)", "Periksa Kerapihan (Parade)",
                "Setengah Lengan Lencang Kanan", "Setengah Lengan Lencang Kiri",
                "Sikap Sempurna (Berdiri)", "Sikap Sempurna (Bersila)", "Sikap Sempurna (Duduk)",
                "Tiap-tiap Banjar 2x Belok Kanan", "Tiap-tiap Banjar 2x Belok Kanan Maju", "Tiap-tiap Banjar 2x Belok Kiri", "Tiap-tiap Banjar 2x Belok Kiri Maju",
                "Tutup Barisan", "Ulangi"
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