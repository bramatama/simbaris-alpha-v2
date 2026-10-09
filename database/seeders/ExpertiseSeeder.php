<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExpertiseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('expertises')->insert([
            ['expertise_name' => 'PBB', 'created_at' => $now, 'updated_at' => $now],
            ['expertise_name' => 'Danton', 'created_at' => $now, 'updated_at' => $now],
            ['expertise_name' => 'Variasi', 'created_at' => $now, 'updated_at' => $now],
            ['expertise_name' => 'Formasi', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}