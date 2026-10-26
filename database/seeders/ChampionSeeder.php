<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChampionSeeder extends Seeder
{
    public function run(): void
    {
        $champions = [
            'Juara Umum' => [
                'Juara Umum',
                'Juara Umum 1',
                'Juara Umum 2',
                'Juara Umum 3'
            ],
            'Peringkat' => [
                'Juara Utama 1',
                'Juara Utama 2',
                'Juara Utama 3',
                'Juara Harapan 1',
                'Juara Harapan 2',
                'Juara Harapan 3',
                'Juara Madya 1',
                'Juara Madya 2',
                'Juara Madya 3',
                'Juara Bina 1',
                'Juara Bina 2',
                'Juara Bina 3',
                'Juara Mula 1',
                'Juara Mula 2',
                'Juara Mula 3',
                'Juara Purwa 1',
                'Juara Purwa 2',
                'Juara Purwa 3',
                'Juara Caraka 1',
                'Juara Caraka 2',
                'Juara Caraka 3',
                'Juara Potensial 1',
                'Juara Potensial 2',
                'Juara Potensial 3',
                'Juara Perintis 1',
                'Juara Perintis 2',
                'Juara Perintis 3',
            ],

            'Danton Terbaik' => [
                'Danton Terbaik 1',
                'Danton Terbaik 2',
                'Danton Terbaik 3',
            ],

            'PBB Terbaik' => [
                'PBB Terbaik 1',
                'PBB Terbaik 2',
                'PBB Terbaik 3',
            ],

            'Variasi Terbaik' => [
                'Variasi Terbaik 1',
                'Variasi Terbaik 2',
                'Variasi Terbaik 3',
            ],

            'Formasi Terbaik' => [
                'Formasi Terbaik 1',
                'Formasi Terbaik 2',
                'Formasi Terbaik 3',
            ],

            'Variasi dan Formasi Terbaik' => [
                'Variasi dan Formasi Terbaik 1',
                'Variasi dan Formasi Terbaik 2',
                'Variasi dan Formasi Terbaik 3',
            ],

            'Make Up Terbaik' => [
                'Make Up Terbaik 1',
                'Make Up Terbaik 2',
                'Make Up Terbaik 3',
            ],

            'Kostum Terbaik' => [
                'Kostum Terbaik 1',
                'Kostum Terbaik 2',
                'Kostum Terbaik 3',
            ],

            'Make Up dan Kostum Terbaik' => [
                'Make Up dan Kostum Terbaik 1',
                'Make Up dan Kostum Terbaik 2',
                'Make Up dan Kostum Terbaik 3',
            ],
        ];

        DB::transaction(function () use ($champions) {
            foreach ($champions as $categoryName => $names) {
                $categoryId = DB::table('champion_categories')
                    ->where('champion_category_name', $categoryName)
                    ->value('champion_category_id');

                if (!$categoryId) {
                    $categoryId = DB::table('champion_categories')
                        ->insertGetId([
                            'champion_category_name' => $categoryName,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ], 'champion_category_id');
                }

                foreach ($names as $name) {
                    DB::table('champions')->updateOrInsert(
                        [
                            'champion_category_id' => $categoryId,
                            'champion_name' => $name,
                        ],
                        [
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        });
    }
}
