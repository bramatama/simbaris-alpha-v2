<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
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

        // 2. Buat Akun Juri (3 Orang)
        for ($i = 1; $i <= 3; $i++) {
            $judgeUserId = DB::table('users')->insertGetId([
                'public_id' => Str::uuid(), 
                'name' => "Juri $i", 
                'email' => "juri$i@lomba.com", 
                'role' => 'judge', 'password' => $password, 
                'created_at' => $now, 
                'updated_at' => $now,
                'email_verified_at' => $now
            ]);
            DB::table('judges')->insert(['user_id' => $judgeUserId]);
        }

        // 3. Buat Akun Panitia (2 Orang)
        $komiteUserId1 = DB::table('users')->insertGetId([
            'public_id' => Str::uuid(), 
            'name' => 'Panitia Pendaftaran', 
            'email' => 'panitia1@lomba.com', 
            'role' => 'committee', 'password' => $password, 
            'created_at' => $now, 
            'updated_at' => $now,
            'email_verified_at' => $now
        ]);
        DB::table('committees')->insert(['user_id' => $komiteUserId1, 'department' => 'Administrasi']);

        // 4. Buat Akun Official Tim (Peserta lomba)
        // Tim SMP (Menggunakan level_id = 2 berdasarkan LevelSeeder)
        $timSmpUserId = DB::table('users')->insertGetId([
            'public_id' => Str::uuid(), 
            'name' => 'Pembina SMPN 1', 
            'email' => 'smpn1@sekolah.com', 
            'role' => 'official_team', 
            'contact_info' => '081234567890', 
            'password' => $password, 
            'created_at' => $now, 
            'updated_at' => $now,
            'email_verified_at' => $now
        ]);
        DB::table('official_teams')->insert([
            'user_id' => $timSmpUserId, 'province' => 'DKI Jakarta', 'city' => 'Jakarta Selatan', 'institution' => 'SMPN 1 Jakarta'
        ]);

        // Tim SMA (Menggunakan level_id = 3)
        $timSmaUserId = DB::table('users')->insertGetId([
            'public_id' => Str::uuid(), 
            'name' => 'Pelatih SMAN 5', 
            'email' => 'sman5@sekolah.com', 
            'role' => 'official_team', 
            'contact_info' => '089876543210', 
            'password' => $password, 
            'created_at' => $now, 
            'updated_at' => $now,
            'email_verified_at' => $now
        ]);
        DB::table('official_teams')->insert([
            'user_id' => $timSmaUserId, 'province' => 'Jawa Barat', 'city' => 'Bandung', 'institution' => 'SMAN 5 Bandung'
        ]);
    }
}