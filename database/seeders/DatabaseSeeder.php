<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // URUTAN PEMANGGILAN SANGAT PENTING! (Mencegah Error Foreign Key)
        $this->call([
            LevelSeeder::class,           // 1. Master Level (Dibutuhkan oleh Tim & Event)
            // ChampionSeeder::class,        // 2. Master Juara
            UserSeeder::class,            // 3. Users & Profil (Dibutuhkan oleh Event)
            EventSeeder::class,           // 4. Konfigurasi Event (Dibutuhkan oleh Transaksi)
            ParticipationSeeder::class,   // 5. Transaksi Pendaftaran & Anggota Tim
        ]);
    }
}