<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\Committee;
use App\Models\EventCommittee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EventCommitteeController extends Controller
{
    public function index($public_id)
    {
        $event = Event::select('event_id', 'event_name', 'public_id')
                ->where('public_id', $public_id)
                ->with([
                    'eventCommittees:event_committee_id,event_id,committee_id,position',
                    'eventCommittees.committee:committee_id,user_id,department',
                    'eventCommittees.committee.user:user_id,name,email',
                ])
                ->firstOrFail();

        $existingCommittees = Committee::with('user:user_id,name,email')->get();

        $role = auth()->user()?->role;
        $view = match ($role) {
            'admin' => 'admin/EventManagement/Committees/Index',
            'committee' => 'committee/HostedEvents/Committees/Index',
            default => abort(403, 'Unauthorized access'),
        };

        // TAMBAHKAN existingCommittees KE DALAM ARRAY PENGIRIMAN
        return inertia($view, [
            'event' => $event,
            'existingCommittees' => $existingCommittees
        ]);
    }

    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        // Validasi input, pastikan ada opsi force_create
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255', 
            'force_create' => 'nullable|boolean',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // Tolak jika email dipakai oleh role selain panitia (misal juri/admin)
            if ($user->role !== 'committee') {
                throw ValidationException::withMessages([
                    'email' => 'Email ini sudah digunakan oleh akun dengan peran (role) lain.',
                ]);
            }

            $committee = Committee::where('user_id', $user->user_id)->first();

            if ($committee) {
                // Cek apakah panitia ini sudah pernah ditugaskan di event INI
                $isAlreadyAssigned = EventCommittee::where('event_id', $event->event_id)
                    ->where('committee_id', $committee->committee_id)
                    ->exists();

                if ($isAlreadyAssigned) {
                    throw ValidationException::withMessages([
                        'email' => 'Panitia ini sudah ditugaskan pada acara ini sebelumnya.',
                    ]);
                }

                // Lempar konfirmasi jika akun ada tapi belum dikonfirmasi (force_create)
                if (empty($validated['force_create'])) {
                    throw ValidationException::withMessages([
                        'confirmation' => 'Akun panitia ditemukan: ' . $user->name . ' (' . $committee->department . '). Lanjutkan menugaskan ke acara ini?',
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
                    'role' => 'committee', 
                    'password' => Hash::make('password123'),
                ]
            );

            $committee = Committee::firstOrCreate(
                ['user_id' => $user->user_id],
                ['department' => $validated['department']]
            );

            EventCommittee::create([
                'event_id' => $event->event_id,
                'committee_id' => $committee->committee_id, 
                'position' => $validated['position'], 
            ]);
        });

        return back()->with('status', 'Panitia berhasil ditugaskan ke acara ini!');
    }

    public function destroy($public_id, $event_committee_id)
    {
        EventCommittee::where('event_committee_id', $event_committee_id)->delete();

        return back()->with('status', 'Panitia berhasil diberhentikan dari acara ini.');
    }
}