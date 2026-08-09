<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('levels')->insert([
            ['level_name' => 'SD/MI Sederajat', 'created_at' => $now, 'updated_at' => $now],
            ['level_name' => 'SMP/MTs Sederajat', 'created_at' => $now, 'updated_at' => $now],
            ['level_name' => 'SMA/SMK/MA Sederajat', 'created_at' => $now, 'updated_at' => $now],
            ['level_name' => 'Purna/Umum', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}