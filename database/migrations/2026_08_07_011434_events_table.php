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
        Schema::create('events',function(Blueprint $table) {
            $table->id('event_id');
            $table->uuid('public_id')->unique();
            $table->string('event_name');
            $table->string('description')->nullable();
            $table->string('location')->nullable();
            $table->string('poster_path')->nullable();
            $table->enum('status', [
                'draft','registration_open','registration_closed','ongoing','finished'
                ])->default('draft');
            $table->dateTime('registration_start_time');
            $table->dateTime('registration_end_time');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->foreignId('created_by')->index()->constrained('admins','admin_id')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('participations', function (Blueprint $table) {
            $table->id('participation_id');
            $table->foreignId('event_id')->index()->constrained('events','event_id');
            $table->foreignId('official_team_id')->index()->constrained('official_teams','official_team_id');
            $table->string('team_name')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('status_message')->nullable();
            $table->string('payment_proof_path')->nullable();
            $table->integer('billed_amount');
            $table->string('participation_files')->nullable();
            $table->timestamps();
        });

        Schema::create('event_judges',function (Blueprint $table) {
            $table->id('event_judge_id');
            $table->foreignId('event_id')->index()->constrained('events','event_id')->onDelete('cascade');
            $table->foreignId('judge_id')->index()->constrained('judges','judge_id')->onDelete('cascade');
            $table->string('expertise');
            $table->string('secondary_expertise')->nullable();
            $table->timestamps();
        });

        Schema::create('event_committees',function (Blueprint $table) {
            $table->id('event_committee_id');
            $table->foreignId('event_id')->index()->constrained('events','event_id')->onDelete('cascade');
            $table->foreignId('committee_id')->index()->constrained('committees','committee_id')->onDelete('cascade');
            $table->enum('position', ['auditor', 'administration'])->default('administration');
            $table->timestamps();
        });

        Schema::create('event_documents',function (Blueprint $table) {
            $table->id('document_id');
            $table->foreignId('event_id')->index()->constrained('events','event_id')->onDelete('cascade');
            $table->string('document_name');
            $table->string('document_path');
            $table->timestamps();
        });

        Schema::create('team_members',function (Blueprint $table) {
            $table->id('team_member_id');
            $table->foreignId('participation_id')->index()->constrained('participations','participation_id')->onDelete('cascade');
            $table->string('member_name');
            $table->enum('member_role', ['commander', 'member', 'reserve'])->default('member');
            $table->string('member_position')->nullable();
            $table->string('member_photo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('event_documents');
        Schema::dropIfExists('event_committees');
        Schema::dropIfExists('event_judges');
        Schema::dropIfExists('participations');
        Schema::dropIfExists('events');
    }
};