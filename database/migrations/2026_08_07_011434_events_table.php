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
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->uuid('public_id')->unique();

            $table->string('event_name');
            $table->string('description')->nullable();
            $table->string('location')->nullable();
            $table->string('poster_path')->nullable();

            $table->enum('status', [
                'draft',
                'registration_open',
                'registration_closed',
                'ongoing',
                'finished',
            ])->default('draft');

            $table->dateTime('registration_start_time');
            $table->dateTime('registration_end_time');
            $table->dateTime('start_time');
            $table->dateTime('end_time');

            $table->boolean('is_result_visible')->default(false);
            $table->boolean('is_recap_visible')->default(false);
            $table->boolean('is_leaderboard_visible')->default(false);

            $table->foreignId('created_by')
                ->constrained('admins', 'admin_id')
                ->cascadeOnDelete();

            $table->timestamps();
        });

        Schema::create('participations', function (Blueprint $table) {
            $table->id('participation_id');
            $table->uuid('public_id')->unique();

            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();

            $table->foreignId('official_team_id')
                ->constrained('official_teams', 'official_team_id')
                ->cascadeOnDelete();

            $table->string('team_name')->nullable();
            $table->string('team_logo_path')->nullable();

            $table->string('pic_name');
            $table->string('pic_phone_number');

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
            ])->default('pending');

            $table->string('status_message')->nullable();
            $table->string('payment_proof_path')->nullable();

            $table->unsignedInteger('billed_amount');
            $table->unsignedInteger('appearance_order')->nullable();
            $table->decimal('performance_duration_seconds', 10, 2)->nullable();

            $table->timestamps();
        });

        Schema::create('event_judges', function (Blueprint $table) {
            $table->id('event_judge_id');

            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();

            $table->foreignId('judge_id')
                ->constrained('judges', 'judge_id')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(
                ['event_id', 'judge_id'],
                'event_judges_event_judge_unique'
            );
        });

        Schema::create('event_committees', function (Blueprint $table) {
            $table->id('event_committee_id');

            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();

            $table->foreignId('committee_id')
                ->constrained('committees', 'committee_id')
                ->cascadeOnDelete();

            $table->enum('position', [
                'auditor',
                'administration',
            ])->default('administration');

            $table->timestamps();

            $table->unique(
                ['event_id', 'committee_id'],
                'event_committees_event_committee_unique'
            );
        });

        Schema::create('event_documents', function (Blueprint $table) {
            $table->id('document_id');

            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();

            $table->string('document_name');
            $table->string('document_path');

            $table->timestamps();
        });

        Schema::create('event_payment_methods', function (Blueprint $table) {
            $table->id('payment_method_id');

            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();

            $table->enum('type', [
                'bank_transfer',
                'qris',
            ]);

            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();

            $table->string('qris_image_path')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        Schema::create('participation_documents', function (Blueprint $table) {
            $table->id('document_id');

            $table->foreignId('participation_id')
                ->constrained('participations', 'participation_id')
                ->cascadeOnDelete();

            $table->string('document_name');
            $table->string('document_path');

            $table->timestamps();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id('team_member_id');

            $table->foreignId('participation_id')
                ->constrained('participations', 'participation_id')
                ->cascadeOnDelete();

            $table->string('member_name');

            $table->enum('member_role', [
                'commander',
                'member',
                'reserve',
            ])->default('member');

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
        Schema::dropIfExists('participation_documents');
        Schema::dropIfExists('event_payment_methods');
        Schema::dropIfExists('event_documents');
        Schema::dropIfExists('event_committees');
        Schema::dropIfExists('event_judges');
        Schema::dropIfExists('participations');
        Schema::dropIfExists('events');
    }
};