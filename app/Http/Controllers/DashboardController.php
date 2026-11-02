<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Event;
use App\Models\Participation;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $stats = [];

        // 1. STATISTIK ADMIN
        if ($role === 'admin') {
            $stats = [
                'total_events' => Event::count(),
                'active_events' => Event::where('status', 'active')->count(),
                'total_teams' => Participation::count(),
                'total_users' => \App\Models\User::count(),
            ];
        } 
        // 2. STATISTIK PANITIA
        elseif ($role === 'committee') {
            $committeeId = $user->committee?->committee_id;
            
            // Ambil event yang sedang dikelola panitia ini
            $activeEvents = Event::whereHas('eventCommittees', function($q) use ($committeeId) {
                $q->where('committee_id', $committeeId);
            })->whereIn('status', ['registration_open', 'active', 'ongoing'])->get();

            $stats = [
                'managed_events_count' => $activeEvents->count(),
                'active_events' => $activeEvents,
                'pending_verifications' => Participation::whereIn('event_id', $activeEvents->pluck('event_id'))->where('status', 'pending')->count(),
            ];
        } 
        // 3. STATISTIK OFFICIAL TEAM
        elseif ($role === 'official_team') {
            $officialTeamId = $user->officialTeam?->official_team_id;
            
            $stats = [
                'my_participations' => Participation::with('event')
                    ->where('official_team_id', $officialTeamId)
                    ->latest()
                    ->take(5)
                    ->get(),
                'total_registered' => Participation::where('official_team_id', $officialTeamId)->count(),
            ];
        }
        // 4. STATISTIK JURI
        elseif ($role === 'judge') {
            $judgeId = $user->judge?->judge_id;
            
            $stats = [
                'assigned_events' => Event::whereHas('eventJudges', function($q) use ($judgeId) {
                    $q->where('judge_id', $judgeId);
                })->withCount('participations')->get(),
            ];
        }

        return inertia('dashboards/Index', [
            'stats' => $stats
        ]);
    }
}