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
        Schema::create(table: 'users', callback: function (Blueprint $table) {
            $table->id('user_id');
            $table->uuid('public_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->enum('role', ['admin', 'official_team', 'judge', 'committee'])->default('official_team');
            $table->string('contact_info')->nullable();
            $table->string('profile_picture_path')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('admins', function (Blueprint $table) {
            $table->id('admin_id');
            $table->foreignId('user_id')->index()->constrained('users','user_id')->onDelete('cascade');
        });

        Schema::create('official_teams', function (Blueprint $table) {
            $table->id('official_team_id');
            $table->foreignId('user_id')->index()->constrained('users','user_id')->onDelete('cascade');
            $table->string('province');
            $table->string('city');
            $table->string('institution');
        });
        
        Schema::create('committees', function (Blueprint $table) {
            $table->id('committee_id');
            $table->foreignId('user_id')->index()->constrained('users','user_id')->onDelete('cascade');
            $table->string('department');
        });

        Schema::create('judges', function (Blueprint $table) {
            $table->id('judge_id');
            $table->foreignId('user_id')->index()->constrained('users','user_id')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committees');
        Schema::dropIfExists('judges');
        Schema::dropIfExists('official_teams'); 
        Schema::dropIfExists('admins');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
