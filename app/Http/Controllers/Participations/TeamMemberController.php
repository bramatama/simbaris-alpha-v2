<?php

namespace App\Http\Controllers\Participations;

use App\Http\Controllers\Controller;
use App\Models\Participation;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TeamMemberController extends Controller
{
    /**
     * Menampilkan daftar anggota tim (Form Edit Batch).
     */
    public function index($public_id)
    {
        $role = auth()->user()->role;
        $myOfficialTeamId = auth()->user()->officialTeam->official_team_id ?? null;
        
        $participation = Participation::with([
            'event:event_id,public_id,event_name',
            'teamMembers' => function($query) {
                $query->orderBy('member_role', 'asc')->latest();
            }
        ])->where('public_id', $public_id)->firstOrFail();

        if ($role === 'official_team') {
            if ($participation->official_team_id !== $myOfficialTeamId) {
                abort(403, 'Anda tidak memiliki akses untuk melihat anggota tim ini.');
            }
            $view = 'events/participations/members/official_team/Index';
        } elseif ($role === 'committee') {
            $view = 'events/participations/members/committee/Index';
        } else {
            abort(403, 'Unauthorized access');
        }

        return inertia($view, [
            'participation' => $participation,
        ]);
    }

    /**
     * Sinkronisasi (Batch Update/Create/Delete) seluruh anggota tim sekaligus.
     */
    public function sync(Request $request, $public_id)
    {
        $participation = Participation::where('public_id', $public_id)->firstOrFail();

        $officialTeamId = auth()->user()->officialTeam->official_team_id ?? null;
        if ($participation->official_team_id !== $officialTeamId) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah anggota tim pada pendaftaran ini.');
        }

        $validated = $request->validate([
            'members' => 'nullable|array',
            'members.*.team_member_id' => 'nullable|exists:team_members,team_member_id',
            'members.*.member_name' => 'required|string|max:255',
            'members.*.member_role' => 'required|in:commander,member,reserve',
            'members.*.member_position' => 'nullable|string|max:255',
            'members.*.photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            DB::transaction(function () use ($request, $validated, $participation) {
                
                $submittedMembers = $validated['members'] ?? [];
                
                // 1. Kumpulkan semua ID yang dikirim dari form (Abaikan yang null/baru)
                $submittedIds = collect($submittedMembers)
                                    ->pluck('team_member_id')
                                    ->filter()
                                    ->toArray();

                // 2. Hapus anggota yang ada di DB tetapi TIDAK ADA di form
                $membersToDelete = TeamMember::where('participation_id', $participation->participation_id)
                    ->whereNotIn('team_member_id', $submittedIds)
                    ->get();

                foreach ($membersToDelete as $member) {
                    // Hapus fisik foto
                    if ($member->member_photo_path && Storage::disk('local')->exists($member->member_photo_path)) {
                        Storage::disk('local')->delete($member->member_photo_path);
                    }
                    $member->delete(); // Hapus dari DB
                }

                // 3. Update atau Create anggota berdasarkan data dari form
                foreach ($submittedMembers as $index => $memberData) {
                    $memberId = $memberData['team_member_id'] ?? null;
                    $photoPath = null;

                    // Cek apakah ada file foto baru yang diunggah untuk anggota di index ini
                    if ($request->hasFile("members.{$index}.photo")) {
                        $photoPath = $request->file("members.{$index}.photo")->store('team_members', 'local');
                    }

                    if ($memberId) {
                        // UPDATE ANGGOTA LAMA
                        $existingMember = TeamMember::where('participation_id', $participation->participation_id)
                            ->where('team_member_id', $memberId)
                            ->first();

                        if ($existingMember) {
                            $updateData = [
                                'member_name' => $memberData['member_name'],
                                'member_role' => $memberData['member_role'],
                                'member_position' => $memberData['member_position'] ?? null,
                            ];

                            // Jika ada foto baru, hapus foto lama dan update dengan path baru
                            if ($photoPath) {
                                if ($existingMember->member_photo_path && Storage::disk('local')->exists($existingMember->member_photo_path)) {
                                    Storage::disk('local')->delete($existingMember->member_photo_path);
                                }
                                $updateData['member_photo_path'] = $photoPath;
                            }

                            $existingMember->update($updateData);
                        }
                    } else {
                        // BUAT ANGGOTA BARU
                        TeamMember::create([
                            'participation_id' => $participation->participation_id,
                            'member_name' => $memberData['member_name'],
                            'member_role' => $memberData['member_role'],
                            'member_position' => $memberData['member_position'] ?? null,
                            'member_photo_path' => $photoPath,
                        ]);
                    }
                }
            });
        } catch (\Exception $e) {
            throw $e;
        }

        return redirect()->back()->with('success', 'Data seluruh anggota tim berhasil disinkronisasi!');
    }
}