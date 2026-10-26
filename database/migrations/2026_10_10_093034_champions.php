<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('champion_categories', function (Blueprint $table) {
            $table->id('champion_category_id');
            $table->string('champion_category_name')->unique();// Contoh: Peringkat, Danton Terbaik, PBB Terbaik, Variasi dan Formasi Terbaik
            $table->timestamps();
        });

        Schema::create('champions', function (Blueprint $table) {
            $table->id('champion_id');
            $table->foreignId('champion_category_id')->constrained('champion_categories', 'champion_category_id')->restrictOnDelete();
            $table->string('champion_name');// Contoh: Juara Utama 1, Danton Terbaik 1, PBB Terbaik 1
            $table->timestamps();
            $table->unique(
                ['champion_category_id','champion_name'],
                'champions_category_rank_unique'
            );
        });

        /*
         * Kategori juara yang diaktifkan pada suatu event.
         * Relasi ini berlaku untuk semua jenjang dalam event tersebut.
         */
        Schema::create('event_champion_categories', function (Blueprint $table) {
            $table->id('event_champion_category_id');

            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();

            $table->foreignId('champion_category_id')
                ->constrained('champion_categories', 'champion_category_id')
                ->restrictOnDelete();
            $table->enum('calculation_method', [
                'percentage',
                'accumulation',
            ])->default('accumulation');

            $table->timestamps();

            $table->unique(
                ['event_id', 'champion_category_id'],
                'event_champion_categories_event_category_unique'
            );
        });

        /*
         * Penghargaan spesifik yang disediakan untuk jenjang tertentu.
         * Contoh: Juara Utama 1 tingkat SMP pada event tertentu.
         */
        Schema::create('event_champions', function (Blueprint $table) {
            $table->id('event_champion_id');
            $table->foreignId('event_level_id')->index()->constrained('event_levels', 'event_level_id')->cascadeOnDelete();
            $table->foreignId('champion_id')->index()->constrained('champions', 'champion_id')->restrictOnDelete();
            $table->unsignedInteger('rank_position');
            $table->unsignedInteger('prize_money')->nullable();
            $table->boolean('certificate')->default(false);
            $table->string('prize_descriptions')->nullable();
            $table->timestamps();
            $table->unique(
                ['event_level_id', 'champion_id'],
                'event_champions_level_champion_unique'
            );
        });

        Schema::create('team_achievements', function (Blueprint $table) {
            $table->id('achievement_id');
            $table->foreignId('participation_id')->index()->constrained('participations', 'participation_id')->cascadeOnDelete();
            $table->foreignId('event_champion_id')->index()->constrained('event_champions', 'event_champion_id')->restrictOnDelete();
            $table->string('certificate_path')->nullable();
            $table->timestamps();
            $table->unique(
                ['participation_id', 'event_champion_id'],
                'team_achievements_participation_champion_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_achievements');
        Schema::dropIfExists('event_champions');
        Schema::dropIfExists('event_champion_categories');
        Schema::dropIfExists('champions');
        Schema::dropIfExists('champion_categories');
    }
};
