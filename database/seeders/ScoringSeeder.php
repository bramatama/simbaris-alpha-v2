<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScoringSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $categories = [
            'PBB',
            'Danton',
            'Variasi',
            'Formasi',
        ];

        foreach ($categories as $categoryName) {
            DB::table('master_scoring_categories')->updateOrInsert(
                ['category_name' => $categoryName],
                [
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }
}