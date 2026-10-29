<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_scoring_categories', function (Blueprint $table) {
            $table->id('master_category_id');
            $table->string('category_name')->unique(); // PBB, Danton, Variasi, Formasi
            $table->timestamps();
        });

        Schema::create('scoring_categories', function (Blueprint $table) {
            $table->id('scoring_category_id');
            $table->foreignId('event_level_id')->index()->constrained('event_levels', 'event_level_id')->cascadeOnDelete();
            $table->foreignId('master_category_id')->constrained('master_scoring_categories', 'master_category_id')->restrictOnDelete();
            $table->timestamps();
            $table->unique(
                ['event_level_id', 'master_category_id'],
                'scoring_categories_level_master_unique'
            );
        });

        Schema::create('master_penalties', function (Blueprint $table) {
            $table->id('master_penalty_id');
            $table->string('penalty_name')->unique();
            $table->timestamps();
        });

        /*
         * Aturan penalti per event.
         * Target kategori juara ditentukan melalui pivot
         * event_penalty_champion_categories, bukan scoring_category_id.
         */
        Schema::create('event_penalties', function (Blueprint $table) {
            $table->id('event_penalty_id');
            $table->foreignId('event_id')->index()->constrained('events', 'event_id')->cascadeOnDelete();
            $table->foreignId('master_penalty_id')->constrained('master_penalties', 'master_penalty_id')->restrictOnDelete();
            $table->text('description')->nullable();
            $table->decimal('penalty_value', 8, 2)->nullable();
            $table->enum('calculation_type', ['fixed','per_occurrence','per_second',])->default('fixed');
            $table->enum('penalty_action', ['deduction','disqualification',])->default('deduction');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(
                ['event_id', 'is_active'],
                'event_penalties_active_index'
            );
        });

        /*
         * Satu aturan penalti dapat menargetkan banyak kategori juara
         * yang diaktifkan pada event. Target ini berlaku lintas jenjang.
         */
        Schema::create('event_penalty_champion_categories', function (Blueprint $table) {
            $table->id('event_penalty_champion_category_id');
            $table->unsignedBigInteger('event_penalty_id');
            $table->unsignedBigInteger('event_champion_category_id');

            $table->foreign('event_penalty_id', 'epcc_penalty_fk')->references('event_penalty_id')->on('event_penalties')->cascadeOnDelete();            
            $table->foreign('event_champion_category_id', 'epcc_category_fk')->references('event_champion_category_id')->on('event_champion_categories')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(
                ['event_penalty_id', 'event_champion_category_id'],
                'event_penalty_champion_categories_unique'
            );
        });

        /*
         * Formula per kategori juara yang diaktifkan pada event dan jenjang.
         * component_type score menggunakan scoring_category_id.
         * Penalti ditangani lewat pivot target kategori juara, jadi formula
         * tidak menyimpan komponen penalty lagi.
         */
        Schema::create('event_champion_formulas', function (Blueprint $table) {
            $table->id('formula_id');
            $table->foreignId('event_level_id')->constrained('event_levels', 'event_level_id')->cascadeOnDelete();
            $table->foreignId('event_champion_category_id')->constrained('event_champion_categories','event_champion_category_id')->cascadeOnDelete();
            $table->foreignId('scoring_category_id')->constrained('scoring_categories', 'scoring_category_id')->restrictOnDelete();
            $table->decimal('weight_multiplier', 8,4)->default(1.00);
            $table->timestamps();
            $table->unique(
                [
                    'event_level_id',
                    'event_champion_category_id',
                    'scoring_category_id',
                ],
                'event_champion_formula_component_unique'
            );
            $table->index(
                ['event_level_id', 'event_champion_category_id'],
                'champion_formula_lookup_index'
            );
        });

        Schema::create('judge_expertises', function (Blueprint $table) {
            $table->id('judge_expertise_id');
            $table->foreignId('event_judge_id')->index()->constrained('event_judges', 'event_judge_id')->cascadeOnDelete();
            $table->foreignId('scoring_category_id')->index()->constrained('scoring_categories', 'scoring_category_id')->cascadeOnDelete();
            $table->unique(
                ['event_judge_id', 'scoring_category_id'],
                'judge_expertises_judge_category_unique'
            );
            $table->timestamps();
        });

        Schema::create('master_assessment_criteria', function (Blueprint $table) {
            $table->id('master_criteria_id');
            $table->foreignId('master_category_id')->constrained('master_scoring_categories', 'master_category_id')->cascadeOnDelete();
            $table->string('criteria_name'); 
            $table->timestamps();
            
            $table->unique(['master_category_id', 'criteria_name'], 'master_criteria_category_name_unique');
        });

        Schema::create('assessment_criteria', function (Blueprint $table) {
            $table->id('criteria_id');
            $table->foreignId('scoring_category_id')->constrained('scoring_categories', 'scoring_category_id')->cascadeOnDelete();
            $table->foreignId('master_criteria_id')->constrained('master_assessment_criteria', 'master_criteria_id')->restrictOnDelete();
            $table->unsignedInteger('order_index');
            $table->timestamps();

            $table->unique(
                ['scoring_category_id', 'order_index'],
                'assessment_criteria_category_order_unique'
            );
        });

        Schema::create('rubric_categories', function (Blueprint $table) {
            $table->id('rubric_category_id');
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id')->cascadeOnDelete();
            $table->string('category_label');
            $table->unsignedInteger('category_order');
            $table->timestamps();
        });

        Schema::create('rubric_scores', function (Blueprint $table) {
            $table->id('rubric_score_id');
            $table->foreignId('rubric_category_id')->constrained('rubric_categories', 'rubric_category_id')->cascadeOnDelete();
            $table->decimal('score_value', 8, 2);
            $table->unsignedInteger('display_order');
            $table->timestamps();
        });

        Schema::create('team_score_details', function (Blueprint $table) {
            $table->id('score_detail_id');
            $table->foreignId('participation_id')->constrained('participations', 'participation_id')->cascadeOnDelete();
            $table->foreignId('judge_id')->nullable()->constrained('judges', 'judge_id')->nullOnDelete();
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id')->restrictOnDelete();
            $table->foreignId('rubric_score_id')->nullable()->constrained('rubric_scores', 'rubric_score_id')->nullOnDelete();// Snapshot nilai angka agar histori tidak berubah ketika master rubrik berubah.
            $table->decimal('score_value', 8, 2);
            $table->timestamps();
        });

        Schema::create('team_penalties', function (Blueprint $table) {
            $table->id('team_penalty_id');
            $table->foreignId('participation_id')->index()->constrained('participations', 'participation_id')->cascadeOnDelete();
            $table->foreignId('event_penalty_id')->constrained('event_penalties', 'event_penalty_id')->restrictOnDelete();
            $table->foreignId('judge_id')->nullable()->constrained('judges', 'judge_id')->nullOnDelete();// Snapshot aturan pada saat penalti diberikan.
            $table->decimal('penalty_value', 8, 2);
            $table->enum('calculation_type', ['fixed','per_occurrence','per_second',])->default('fixed');
            $table->enum('penalty_action', ['deduction','disqualification',])->default('deduction');
            $table->unsignedInteger('occurrence_count')->default(1);
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(
                ['participation_id', 'event_penalty_id'],
                'team_penalties_participation_rule_index'
            );
        });

        Schema::create('audit_trails', function (Blueprint $table) {
            $table->id('audit_id');
            $table->foreignId('participation_id')->constrained('participations', 'participation_id')->cascadeOnDelete();
            $table->foreignId('judge_id')->nullable()->constrained('judges', 'judge_id')->nullOnDelete();
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id')->restrictOnDelete();
            $table->foreignId('rubric_score_id')->nullable()->constrained('rubric_scores', 'rubric_score_id')->nullOnDelete();
            $table->decimal('score_value', 8, 2);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::create('team_scores', function (Blueprint $table) {
            $table->id('score_id');
            $table->foreignId('participation_id')->index()->constrained('participations', 'participation_id')->cascadeOnDelete();
            $table->foreignId('scoring_category_id')->index()->constrained('scoring_categories', 'scoring_category_id')->restrictOnDelete();
            $table->foreignId('judge_id')->nullable()->index()->constrained('judges', 'judge_id')->nullOnDelete();
            $table->enum('evaluation_status', ['locked','draft','ready','needs_review'])->default('ready');
            $table->decimal('total_score', 8, 2);
            $table->timestamps();
        });

        Schema::create('score_recaps', function (Blueprint $table) {
            $table->id('recap_id');
            $table->foreignId('participation_id')->index()->constrained('participations', 'participation_id')->cascadeOnDelete();
            $table->foreignId('event_champion_category_id')->index()->constrained('event_champion_categories','event_champion_category_id')->cascadeOnDelete();
            $table->decimal('final_score', 10, 2);
            $table->decimal('raw_score', 10, 2);
            $table->decimal('total_penalty_deduction', 10,2);
            $table->boolean('is_disqualified')->default(false);
            $table->timestamps();
            $table->unique(
                ['participation_id', 'event_champion_category_id'],
                'score_recaps_participation_category_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('score_recaps');
        Schema::dropIfExists('team_scores');
        Schema::dropIfExists('audit_trails');
        Schema::dropIfExists('team_penalties');
        Schema::dropIfExists('team_score_details');
        Schema::dropIfExists('rubric_scores');
        Schema::dropIfExists('rubric_categories');
        Schema::dropIfExists('assessment_criteria');
        Schema::dropIfExists('judge_expertises');
        Schema::dropIfExists('event_champion_formulas');
        Schema::dropIfExists('event_penalty_champion_categories');
        Schema::dropIfExists('event_penalties');
        Schema::dropIfExists('master_penalties');
        Schema::dropIfExists('scoring_categories');
        Schema::dropIfExists('master_scoring_categories');
    }
};
