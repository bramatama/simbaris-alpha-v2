<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('champion_categories', function (Blueprint $table){
            $table->id('champion_category_id');
            $table->string('champion_category_name'); #Peringkat, Danton Terbaik, PBB Terbaik
        });

        Schema::create('champions', function(Blueprint $table){
            $table->id('champion_id');
            $table->foreignId('champion_category_id')->constrained('champion_categories','champion_category_id');
            $table->string('champion_name'); #Juara Utama 1, Danton Terbaik 1, PBB Terbaik 1
            $table->integer('rank_position');
            $table->timestamps();
        });

        Schema::create('event_champions',function(Blueprint $table){
            $table->id('event_champion_id');
            $table->foreignId('event_level_id')->index()->constrained('event_levels','event_level_id')->onDelete('cascade');
            $table->foreignId('champion_id')->index()->constrained('champions','champion_id');
            $table->integer('prize_money')->nullable();
            $table->boolean('certificate')->default(false);
            $table->string('prize_descriptions')->nullable();
            $table->timestamps();
        });

        Schema::create('team_achievements',function(Blueprint $table){
            $table->id('achievement_id');
            $table->foreignId('participation_id')->index()->constrained('participations','participation_id')->onDelete('cascade');
            $table->foreignId('event_champion_id')->index()->constrained('event_champions','event_champion_id');
            $table->string('certificate_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_achievements');
        Schema::dropIfExists('event_champions');
        Schema::dropIfExists('champions');
        Schema::dropIfExists('champion_categories');
    }
};
