<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScoringSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('master_scoring_categories')->insert([
            ['category_name' => 'PBB', 'created_at' => $now, 'updated_at' => $now],
            ['category_name' => 'Danton', 'created_at' => $now, 'updated_at' => $now],
            ['category_name' => 'Variasi', 'created_at' => $now, 'updated_at' => $now],
            ['category_name' => 'Formasi', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}