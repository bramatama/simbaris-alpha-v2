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
        Schema::create('master_scoring_categories', function (Blueprint $table) {
            $table->id('master_category_id');
            $table->string('category_name')->unique(); // Contoh: PBB, Danton, Variasi, Formasi
            $table->timestamps();
        });

        Schema::create('scoring_categories', function(Blueprint $table){
            $table->id('scoring_category_id');
            $table->foreignId('event_id')->index()->constrained('events', 'event_id')->onDelete('cascade');
            $table->foreignId('master_category_id')->constrained('master_scoring_categories', 'master_category_id')->onDelete('restrict');
            $table->timestamps();
        });

        Schema::create('event_champion_formulas', function (Blueprint $table) {
            $table->id('formula_id');
            $table->foreignId('event_level_id')->constrained('event_levels', 'event_level_id')->onDelete('cascade');
            $table->foreignId('champion_category_id')->constrained('champion_categories', 'champion_category_id')->onDelete('cascade');
            $table->foreignId('scoring_category_id')->constrained('scoring_categories', 'scoring_category_id')->onDelete('cascade');
            $table->decimal('weight_multiplier', 5, 2)->default(1.00); 
            $table->timestamps();
        });

        Schema::create('judge_expertises',function(Blueprint $table){
            $table->id('judge_expertise_id');
            $table->foreignId('event_judge_id')->index()->constrained('event_judges','event_judge_id')->onDelete('cascade');
            $table->foreignId('scoring_category_id')->index()->constrained('scoring_categories','scoring_category_id');
            $table->unique(['event_judge_id', 'scoring_category_id']);
            $table->timestamps();
        });

        Schema::create('assessment_criteria', function (Blueprint $table) {
            $table->id('criteria_id');
            $table->foreignId('scoring_category_id')->constrained('scoring_categories', 'scoring_category_id')->onDelete('cascade');
            $table->string('criteria_name'); // Nama gerakan/penilaian
            $table->integer('order_index'); // Urutan tampil di UI (1, 2, 3...)
            $table->timestamps();
        });

        Schema::create('rubric_categories', function (Blueprint $table) {
            $table->id('rubric_category_id');
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id')->onDelete('cascade');
            $table->string('category_label'); // 'Kurang', 'Cukup', 'Baik'
            $table->integer('category_order'); // Urutan kategori (1 untuk Kurang, 2 untuk Cukup)
            $table->timestamps();
        });

        // (e.g., Pilihan nilai 10, 11, 12 yang terikat pada kategori "Kurang")
        Schema::create('rubric_scores', function (Blueprint $table) {
            $table->id('rubric_score_id');
            $table->foreignId('rubric_category_id')->constrained('rubric_categories', 'rubric_category_id')->onDelete('cascade');
            $table->decimal('score_value', 8, 2); // Pilihan angka spesifik (10, 11, 14, 15...)
            $table->integer('display_order'); // Urutan tombol angka di dalam kategori UI
            $table->timestamps();
        });
        
        // 5. TRANSAKSI DETAIL NILAI
        Schema::create('team_score_details', function (Blueprint $table) {
            $table->id('score_detail_id');
            $table->foreignId('participation_id')->constrained('participations', 'participation_id')->onDelete('cascade');
            $table->foreignId('judge_id')->nullable()->constrained('judges', 'judge_id')->onDelete('set null');
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id');
            $table->foreignId('rubric_score_id')->nullable()->constrained('rubric_scores', 'rubric_score_id')->onDelete('set null');
            // Menyimpan value angka mentahnya penting untuk sejarah (history) jika sewaktu-waktu data master rubrik berubah
            $table->decimal('score_value', 8, 2); 
            $table->timestamps();
        });

        Schema::create('audit_trails', function (Blueprint $table) {
            $table->id('audit_id');
            $table->foreignId('participation_id')->constrained('participations', 'participation_id')->onDelete('cascade');
            $table->foreignId('judge_id')->nullable()->constrained('judges', 'judge_id')->onDelete('set null');
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id')->onDelete('cascade');
            $table->foreignId('rubric_score_id')->nullable()->constrained('rubric_scores', 'rubric_score_id')->onDelete('set null');
            $table->decimal('score_value', 8, 2); 
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        // 6. TRANSAKSI TOTAL NILAI JURI (Rekap otomatis per Kategori Umum, e.g., Total PBB dari Juri A)
        Schema::create('team_scores', function(Blueprint $table){
            $table->id('score_id');
            $table->foreignId('participation_id')->index()->constrained('participations','participation_id')->onDelete('cascade');
            $table->foreignId('scoring_category_id')->index()->constrained('scoring_categories','scoring_category_id');
            $table->foreignId('judge_id')->nullable()->index()->constrained('judges','judge_id')->onDelete('set null');
            $table->decimal('total_score', 8, 2); 
            $table->timestamps();
        });

        // 7. TRANSAKSI REKAPITULASI FINAL (Nilai gabungan seluruh juri yang dibekukan)
        Schema::create('score_recaps', function(Blueprint $table){
            $table->id('recap_id');
            $table->foreignId('participation_id')->index()->constrained('participations','participation_id')->onDelete('cascade');
            $table->foreignId('champion_category_id')->index()->constrained('champion_categories','champion_category_id');
            $table->decimal('final_score', 10, 2); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tabel harus berurutan terbalik (dari anak ke induk)
        Schema::dropIfExists('score_recaps');
        Schema::dropIfExists('team_scores');
        Schema::dropIfExists('team_score_details');
        Schema::dropIfExists('rubric_scores');
        Schema::dropIfExists('rubric_categories');
        Schema::dropIfExists('assessment_criteria');
        Schema::dropIfExists('judge_expertises');
        Schema::dropIfExists('event_champion_formulas');
        Schema::dropIfExists('scoring_categories');
        Schema::dropIfExists('master_scoring_categories');
    }
};