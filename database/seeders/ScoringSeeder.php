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
                "Jalan di Tempat",
                "Langkah Biasa",
                "Langkah Biasa ke Langkah Tegap",
                "Langkah Biasa ke Lari",
                "Langkah Biasa ke Langkah Perlahan",
                "Langkah Merdeka",
                "Langkah Perlahan",
                "Langkah Perlahan Maju",
                "Langkah Perlahan ke Langkah Biasa",
                "Langkah Tegap",
                "Langkah Tegap Maju",
                "Langkah Tegap ke Langkah Biasa",
                "Lari",
                "Lari Maju",
                "Lari ke Langkah Biasa",
                "Lencang Depan", "Lencang Kanan", "Lencang Kiri", "Maju Jalan",
                "Melintang Kanan", "Melintang Kanan Maju", "Melintang Kiri", "Melintang Kiri Maju",
                "Periksa Kerapihan (Biasa)", "Periksa Kerapihan (Parade)",
                "Setengah Lengan Lencang Kanan", "Setengah Lengan Lencang Kiri",
                "Sikap Sempurna (Berdiri)", "Sikap Sempurna (Bersila)", "Sikap Sempurna (Duduk)",
                "Tiap-tiap Banjar 2x Belok Kanan", "Tiap-tiap Banjar 2x Belok Kanan Maju", "Tiap-tiap Banjar 2x Belok Kiri", "Tiap-tiap Banjar 2x Belok Kiri Maju",
                "Tutup Barisan", "Ulangi"
            ],
            'Danton' => [
                'Sikap dan Postur',
                'Artikulasi', 'Intonasi', 'Volume Suara',
                'Penguasaan Materi',
                'Penguasaan Pasukan',
                'Penguasaan Lapangan',
                'Suara'
            ],
            'Danton Variasi Formasi' => [
                'Penjiwaan', 'Ekspresi', 'Artikulasi', 'Sikap',
                'Penjiwaan, Ekspresi, Artikulasi dan Sikap',
                'Kolaborasi dengan Pasukan',
                'Penguasaan Materi',
                'Pemberian Instruksi',
            ],
            'Variasi' => [
                'Opening', 'Ending',
                "Opening & Ending Variasi",
                "Pembawaan Tema & Konsep",
                "Kesesuaian Gerakan dengan Tema & Konsep",
                "Estetika dan Kreativitas Gerakan",
                "Tingkat Kesulitan dan Detail Gerakan",
                "Kerapihan & Kekompakan Gerakan",
                "Kerapihan Saf & Banjar",
                "Penjiwaan, Ekspresi, Artikulasi & Sikap",
                "Semangat & Kestabilan Penampilan",
                "Penguasaan Lapangan & Materi",
                "Unsur PBB",
            ],
            'Formasi' => [
                "Opening Formasi",
                "Pembawaan Tema & Konsep",
                "Kesesuaian Gerakan dengan Tema & Konsep",
                "Proses Buka Tutup Formasi",
                "Tingkat Kesulitan dan Detail Gerakan",
                "Kerapihan Saf & Banjar",
                "Penjiwaan, Ekspresi, Artikulasi & Sikap",
                "Semangat & Kestabilan Penampilan",
                "Penguasaan Lapangan & Materi",
                "Unsur PBB",
                "Ending Celebration",
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
            "Persyaratan Administrasi Tidak Lengkap/Tidak Sesuai",
            "Melakukan kecurangan administrasi/identitas",
            "Terlambat mengumpulkan berkas administrasi",
            "Terlambat melakukan daftar ulang",
            "Melewati/Menginjak garis batas tampil",
            "Menggunakan atribut yang dilarang",
            "Danton/Pasukan Pingsan saat tampil/didalam arena",
            "Kekurangan Anggota pada saat tampil",
            "Merusak Fasilitas Venue atau Event",
            "Atribut terlepas/Terjatuh pada saat tampil",
            "Melewati Batas Waktu Tampil",
            "Tampil setelah 3x pemanggilan DP",
            "Tidak menggunakan Tanda Nomor Urut saat tampil",
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