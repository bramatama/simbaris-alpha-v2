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
        $this->call([
            LevelSeeder::class,
            ScoringSeeder::class,
            UserSeeder::class,
            EventSeeder::class,
            ParticipationSeeder::class,
            ChampionSeeder::class,
        ]);
    }
}