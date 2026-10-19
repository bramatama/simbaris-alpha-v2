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
        /*
        |--------------------------------------------------------------------------
        | 1. MASTER KATEGORI PENILAIAN
        |--------------------------------------------------------------------------
        */

        Schema::create('master_scoring_categories', function (Blueprint $table) {
            $table->id('master_category_id');
            $table->string('category_name')->unique(); // Contoh: PBB, Danton, Variasi, Formasi
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 2. KATEGORI PENILAIAN PER EVENT
        |--------------------------------------------------------------------------
        */

        Schema::create('scoring_categories', function (Blueprint $table) {
            $table->id('scoring_category_id');
            $table->foreignId('event_level_id')->index()->constrained('event_levels', 'event_level_id')->cascadeOnDelete();            
            $table->foreignId('master_category_id')->constrained('master_scoring_categories','master_category_id')->restrictOnDelete();
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 3. MASTER PENALTY
        |--------------------------------------------------------------------------
        | Menyimpan jenis pelanggaran yang dapat digunakan kembali.
        */

        Schema::create('master_penalties', function (Blueprint $table) {
            $table->id('master_penalty_id');
            $table->string('penalty_name')->unique();
            $table->text('description')->nullable();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 4. ATURAN PENALTY PER EVENT
        |--------------------------------------------------------------------------
        | Menentukan besaran pengurangan yang berlaku pada suatu event.
        |
        | scoring_category_id:
        | - Berisi kategori jika penalty khusus untuk kategori tersebut.
        | - NULL jika penalty berlaku pada nilai akhir secara umum.
        |
        | calculation_type:
        | - fixed: pengurangan dilakukan satu kali.
        | - per_occurrence: pengurangan dikalikan jumlah kejadian.
        */

        Schema::create('event_penalties', function (Blueprint $table) {
            $table->id('event_penalty_id');

            $table->foreignId('event_id')->index()->constrained('events', 'event_id')->cascadeOnDelete();
            $table->foreignId('master_penalty_id')->constrained('master_penalties','master_penalty_id')->restrictOnDelete();
            $table->foreignId('scoring_category_id')->nullable()->index()->constrained('scoring_categories','scoring_category_id')->restrictOnDelete();
            $table->decimal('penalty_value', 8, 2);
            $table->enum('calculation_type', ['fixed','per_occurrence',])->default('fixed');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['event_id', 'is_active'],'event_penalties_active_index');
        });

        /*
        |--------------------------------------------------------------------------
        | 5. FORMULA PERHITUNGAN JUARA
        |--------------------------------------------------------------------------
        | component_type:
        | - score   : kontribusi nilai kategori penilaian.
        | - penalty : kontribusi pengurangan penalty.
        |
        | scoring_category_id:
        | - Wajib untuk komponen score.
        | - NULL untuk penalty umum.
        | - Terisi untuk penalty yang dibatasi pada kategori tertentu.
        |
        | weight_multiplier:
        | - Mengalikan nilai komponen sebelum dijumlahkan/dikurangkan.
        */

        Schema::create('event_champion_formulas', function (Blueprint $table) {
            $table->id('formula_id');
            $table->foreignId('event_level_id')->constrained('event_levels', 'event_level_id')->cascadeOnDelete();
            $table->foreignId('champion_category_id')->constrained('champion_categories','champion_category_id')->cascadeOnDelete();
            $table->enum('component_type', ['score','penalty',])->default('score');
            $table->foreignId('scoring_category_id')->nullable()->constrained('scoring_categories','scoring_category_id')->restrictOnDelete();
            $table->decimal('weight_multiplier', 5, 2)->default(1.00);
            $table->timestamps();
            $table->index(['event_level_id','champion_category_id','component_type',],'champion_formula_lookup_index');
        });

        /*
        |--------------------------------------------------------------------------
        | 6. KEAHLIAN JURI
        |--------------------------------------------------------------------------
        */

        Schema::create('judge_expertises',function(Blueprint $table){
            $table->id('judge_expertise_id');
            $table->foreignId('event_judge_id')->index()->constrained('event_judges','event_judge_id')->onDelete('cascade');
            $table->foreignId('scoring_category_id')->index()->constrained('scoring_categories','scoring_category_id');
            $table->unique(['event_judge_id', 'scoring_category_id']);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 7. KRITERIA PENILAIAN
        |--------------------------------------------------------------------------
        */

        Schema::create('assessment_criteria', function (Blueprint $table) {
            $table->id('criteria_id');
            $table->foreignId('scoring_category_id')->constrained('scoring_categories', 'scoring_category_id')->onDelete('cascade');
            $table->string('criteria_name'); // Nama gerakan/penilaian
            $table->integer('order_index'); // Urutan tampil di UI (1, 2, 3...)
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 8. KATEGORI RUBRIK
        |--------------------------------------------------------------------------
        | Contoh: Kurang, Cukup, Baik.
        */

        Schema::create('rubric_categories', function (Blueprint $table) {
            $table->id('rubric_category_id');
            $table->foreignId('criteria_id')->constrained('assessment_criteria', 'criteria_id')->onDelete('cascade');
            $table->string('category_label'); // 'Kurang', 'Cukup', 'Baik'
            $table->integer('category_order'); // Urutan kategori (1 untuk Kurang, 2 untuk Cukup)
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 9. PILIHAN NILAI RUBRIK
        |--------------------------------------------------------------------------
        */

        Schema::create('rubric_scores', function (Blueprint $table) {
            $table->id('rubric_score_id');
            $table->foreignId('rubric_category_id')->constrained('rubric_categories', 'rubric_category_id')->onDelete('cascade');
            $table->decimal('score_value', 8, 2); // Pilihan angka spesifik (10, 11, 14, 15...)
            $table->integer('display_order'); // Urutan tombol angka di dalam kategori UI
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 10. DETAIL NILAI PESERTA
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | 12. AUDIT TRAIL PENILAIAN
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | 13. TOTAL NILAI PER KATEGORI DAN JURI
        |--------------------------------------------------------------------------
        */

        Schema::create('team_scores', function (Blueprint $table) {
            $table->id('score_id');
            $table->foreignId('participation_id')->index()->constrained('participations','participation_id')->onDelete('cascade');
            $table->foreignId('scoring_category_id')->index()->constrained('scoring_categories','scoring_category_id');
            $table->foreignId('judge_id')->nullable()->index()->constrained('judges','judge_id')->onDelete('set null');
            $table->decimal('total_score', 8, 2); 
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | 14. REKAP NILAI FINAL
        |--------------------------------------------------------------------------
        | final_score merupakan hasil perhitungan formula juara,
        | setelah nilai kategori dan penalty diproses.
        */

        Schema::create('score_recaps', function (Blueprint $table) {
            $table->id('recap_id');
            $table->foreignId('participation_id')->index()->constrained('participations','participation_id')->onDelete('cascade');
            $table->foreignId('champion_category_id')->index()->constrained('champion_categories','champion_category_id');
            $table->decimal('final_score', 10, 2); 
            $table->timestamps();

            $table->unique([
                'participation_id',
                'champion_category_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
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
        Schema::dropIfExists('event_penalties');
        Schema::dropIfExists('scoring_categories');
        Schema::dropIfExists('master_penalties');
        Schema::dropIfExists('master_scoring_categories');
    }
};