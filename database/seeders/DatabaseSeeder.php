<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $now = Carbon::now();
        $password = Hash::make('password123'); // Password default untuk semua akun testing

        // 1. Buat Akun Admin
        $adminUserId = DB::table('users')->insertGetId([
            'public_id' => Str::uuid(), 
            'name' => 'Super Admin', 
            'email' => 'admin@lomba.com', 
            'role' => 'admin', 'password' => $password, 
            'created_at' => $now, 
            'updated_at' => $now,
            'email_verified_at' => $now
        ]);
        DB::table('admins')->insert(['user_id' => $adminUserId]);

        $this->call([
            LevelSeeder::class,
            ScoringSeeder::class,
            ChampionSeeder::class,
            // UserSeeder::class,
            // EventSeeder::class,
            // ParticipationSeeder::class,
        ]);
    }
}