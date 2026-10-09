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
        Schema::create('expertises',function (Blueprint $table) {
            $table->id('expertise_id');
            $table->string('expertise_name');
            $table->timestamps();
        });    

        Schema::create('judge_expertises',function(Blueprint $table){
            $table->id('judge_expertise_id');
            $table->foreignId('event_judge_id')->index()->constrained('event_judges','event_judge_id')->onDelete('cascade');
            $table->foreignId('expertise_id')->index()->constrained('expertises','expertise_id');
            $table->unique(['event_judge_id', 'expertise_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
