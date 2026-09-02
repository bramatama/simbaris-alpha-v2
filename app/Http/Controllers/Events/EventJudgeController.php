<?php

namespace App\Http\Controllers;

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

class EventJudgeController extends Controller
{
    public function index($public_id)
    {
        // $event = Event::select('event_id', 'event_name', 'public_id')
        //         ->where('public_id', $public_id)
        //         ->with([
        //             'eventJudges:event_judge_id,event_id,judge_id,expertise,secondary_expertise',
        //             'eventJudges.judge:judge_id,user_id',
        //             'eventJudges.judge.user:user_id,name,email',
        //         ])
        //         ->firstOrFail();

        $event = Event::where('public_id', $public_id)->with('eventJudges.judge.user')->firstOrFail();


        $existingJudges = Judge::with('user:user_id,name,email')->get();

        $role = auth()->user()?->role;
        $view = match ($role) {
            'admin' => 'admin/EventManagement/Judges/Index',
            'committee' => 'committee/HostedEvents/Judges/Index',
            default => abort(403, 'Unauthorized access'),
        };

        return inertia($view, [
            'event' => $event,
            'existingJudges' => $existingJudges
        ]);
    }

    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        // Validasi input, pastikan ada opsi force_create
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'expertise' => 'string|max:255',
            'secondary_expertise' => 'nullable|string|max:255',
            'force_create' => 'nullable|boolean',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // Tolak jika email dipakai oleh role selain panitia (misal juri/admin)
            if ($user->role !== 'judge') {
                throw ValidationException::withMessages([
                    'email' => 'Email ini sudah digunakan oleh akun dengan peran (role) lain.',
                ]);
            }

            $judge = Judge::where('user_id', $user->user_id)->first();

            if ($judge) {
                $isAlreadyAssigned = EventJudge::where('event_id', $event->event_id)
                    ->where('judge_id', $judge->judge_id)
                    ->exists();

                if ($isAlreadyAssigned) {
                    throw ValidationException::withMessages([
                        'email' => 'Juri ini sudah ditugaskan pada acara ini sebelumnya.',
                    ]);
                }

                // Lempar konfirmasi jika akun ada tapi belum dikonfirmasi (force_create)
                if (empty($validated['force_create'])) {
                    throw ValidationException::withMessages([
                        'confirmation' => 'Akun juri ditemukan: ' . $user->name . '. Lanjutkan menugaskan ke acara ini?',
                    ]);
                }
            }
        }

        DB::transaction(function () use ($validated, $event) {
            // Gunakan firstOrCreate layaknya di EventController
            $user = User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'public_id' => Str::uuid()->toString(),
                    'name' => $validated['name'],
                    'role' => 'judge', 
                    'password' => Hash::make('password123'),
                ]
            );

            $judge = Judge::firstOrCreate(
                ['user_id' => $user->user_id],
            );

            EventJudge::create([
                'event_id' => $event->event_id,
                'judge_id' => $judge->judge_id, 
                'expertise' => $validated['expertise'], 
                'secondary_expertise' => $validated['secondary_expertise'], 
            ]);
        });

        return back()->with('status', 'Juri berhasil ditugaskan ke acara ini!');
    }

    public function destroy($public_id, $event_judge_id)
    {
        EventJudge::where('event_judge_id', $event_judge_id)->delete();

        return back()->with('status', 'Juri berhasil diberhentikan dari acara ini.');
    }
}