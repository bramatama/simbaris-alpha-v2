<?php

namespace App\Http\Controllers\Participations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Participation;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Concerns\HasEventAccess; 
class TeamMemberController extends Controller
{
    use HasEventAccess;

    /**
     * Menampilkan anggota yang terdaftar pada tim peserta.
     */
    public function index(Event $event, $public_id)
    {
        $participation = Participation::with([
            'event:event_id,public_id,event_name',
            'teamMembers' => function($query) {
                $query->orderBy('member_role', 'asc')->latest();
            }
        ])->where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee','official_team'], $participation);

        $role = auth()->user()->role;
        $view = match ($role) {
            'official_team' => 'events/participations/members/official_team/Index',
            'committee', 'admin' => 'events/participations/members/committee/Index',
            default => abort(403, 'Unauthorized access'),
        };

        return inertia($view, [
            'event' => $event,
            'participation' => $participation,
        ]);
    }

    /**
     * Memperbarui daftar anggota tim peserta.
     */
    public function sync(Request $request, Event $event, $public_id)
    {
        $participation = Participation::with([
            'event:event_id,public_id,event_name',
            'teamMembers' => function($query) {
                $query->orderBy('member_role', 'asc')->latest();
            }
        ])->where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        $rules = [
            'members' => 'nullable|array',
            'members.*.team_member_id' => 'nullable|exists:team_members,team_member_id',
            'members.*.member_name' => 'required|string|max:255',
            'members.*.member_role' => 'required|in:commander,member,reserve',
            'members.*.member_position' => 'nullable|string|max:255',
            'members.*.photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];

        $messages = [
            'members.*.member_name.required' => 'Nama lengkap anggota wajib diisi.',
            'members.*.member_name.max' => 'Nama lengkap anggota tidak boleh lebih dari 255 karakter.',
            'members.*.member_role.required' => 'Peran anggota wajib dipilih.',
            'members.*.member_role.in' => 'Pilihan peran anggota tidak valid.',
            'members.*.member_position.max' => 'Keterangan posisi tidak boleh lebih dari 255 karakter.',
            'members.*.photo.image' => 'Berkas foto harus berupa gambar.',
            'members.*.photo.mimes' => 'Format foto anggota harus JPG, JPEG, PNG, atau WEBP.',
            'members.*.photo.max' => 'Ukuran foto anggota tidak boleh melebihi 2 MB.',
        ];

        $validated = $request->validate($rules, $messages);

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
                    // Hapus fisik foto jika ada
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

        return redirect()->route(
            'official_team.participations.members.index',
            [
                'event' => $event,
                'participation' => $participation
            ])->with('success', 'Data seluruh anggota tim berhasil disinkronisasi!');
    }
}