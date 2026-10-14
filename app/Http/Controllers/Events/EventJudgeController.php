<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\Judge;
use App\Models\EventJudge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Registered;
class EventJudgeController extends Controller
{
    public function index($public_id)
    {
        $event = Event::where('public_id', $public_id)
            ->with([
                'eventJudges.judge.user',
                'eventJudges.judgeExpertises.scoringCategory.masterCategory',
            ])
            ->firstOrFail();

        $assignedJudgeIds = $event->eventJudges->pluck('judges_id');

        $existingJudges = Judge::with('user:user_id,name,email')
                        ->whereNotIn('judge_id', $assignedJudgeIds)
                        ->get();

        $expertises = $event->scoringCategories
                    ->map(fn ($category) => [
                        'scoring_category_id' => $category->scoring_category_id,
                        'expertise' => [
                            'id' => $category->masterCategory->master_category_id,
                            'name' => $category->masterCategory->category_name,
                        ],
                    ])
                    ->values();

        return inertia('events/judges/Index', [
            'event' => $event,
            'existingJudges' => $existingJudges,
            'expertises' => $expertises,
        ]);
    }

    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'expertise_ids' => 'required|array|min:1',
            'expertise_ids.*' => 'required|integer|distinct|exists:expertises,expertise_id',
            'force_create' => 'nullable|boolean',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            if ($user->role !== 'judge') {
                throw ValidationException::withMessages([
                    'email' => 'Email ini sudah digunakan oleh akun dengan peran lain.',
                ]);
            }

            $judge = Judge::where('user_id', $user->user_id)
                ->first();

            if ($judge) {
                $isAlreadyAssigned = EventJudge::where(
                    'event_id',
                    $event->event_id
                )
                    ->where('judge_id', $judge->judge_id)
                    ->exists();

                if ($isAlreadyAssigned) {
                    throw ValidationException::withMessages([
                        'email' => 'Juri ini sudah ditugaskan pada acara ini sebelumnya.',
                    ]);
                }

                if (empty($validated['force_create'])) {
                    throw ValidationException::withMessages([
                        'confirmation' => 'Akun juri ditemukan: '
                            . $user->name
                            . '. Lanjutkan menugaskan ke acara ini?',
                    ]);
                }
            }
        }

        DB::transaction(function () use ($validated, $event) {
            $user = User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'public_id' => (string) Str::uuid(),
                    'name' => $validated['name'],
                    'role' => 'judge',
                    'password' => Hash::make('password123'),
                ]
            );

            if ($user->wasRecentlyCreated) {
                event(new Registered($user));
            }

            $judge = Judge::firstOrCreate([
                'user_id' => $user->user_id,
            ]);

            $eventJudge = EventJudge::create([
                'event_id' => $event->event_id,
                'judge_id' => $judge->judge_id,
            ]);

            $now = now();

            $judgeExpertises = collect($validated['expertise_ids'])
                ->map(fn ($expertiseId) => [
                    'event_judge_id' => $eventJudge->event_judge_id,
                    'scoring_category_id' => $expertiseId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
                ->all();

            DB::table('judge_expertises')->insert($judgeExpertises);
        });

        return back()->with(
            'success',
            'Juri berhasil ditugaskan ke acara ini!'
        );
    }

    public function destroy($public_id, $event_judge_id)
    {
        $event = Event::where('public_id', $public_id)
            ->firstOrFail();

        $eventJudge = EventJudge::where(
            'event_id',
            $event->event_id
        )
            ->where('event_judge_id', $event_judge_id)
            ->firstOrFail();

        $eventJudge->delete();

        return back()->with(
            'success',
            'Juri berhasil diberhentikan dari acara ini.'
        );
    }
}
