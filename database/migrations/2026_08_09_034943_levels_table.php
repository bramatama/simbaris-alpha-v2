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
        Schema::create('levels',function(Blueprint $table){
            $table->id('level_id');
            $table->string('level_name');
            $table->timestamps();
        });

        Schema::create('event_levels',function(Blueprint $table){
            $table->id('event_level_id');
            $table->foreignId('event_id')->index()->constrained('events','event_id')->onDelete('cascade');
            $table->foreignId('level_id')->index()->constrained('levels','level_id');
            $table->integer('registration_fees')->default('0');
            $table->integer('quota')->nullable('0');
            $table->timestamps();
        });

        Schema::table('participations', function(Blueprint $table){
            $table->foreignId('event_level_id')->index()->constrained('event_levels','event_level_id')->onDelete('restrict');
            $table->unique(
                ['event_level_id', 'appearance_order'],'participations_level_order_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_levels');
        Schema::dropColumns('participations', ['level_id']);
        Schema::dropIfExists('levels');
    }
};