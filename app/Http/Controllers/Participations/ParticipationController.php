<?php

namespace App\Http\Controllers\Participations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventLevel;
use App\Models\Participation;
use App\Models\ParticipationDocument;
use App\Models\EventPaymentMethod;
use App\Concerns\HasEventAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ParticipationController extends Controller
{
    use HasEventAccess;

    /**
     * Menampilkan daftar pendaftaran pada event.
     */
    public function index($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name')
            ->where('public_id', $public_id)
            ->firstOrFail();

        // Validasi Akses Panitia Administrasi / Admin
        $this->validateEventAccess($event, ['administration'], ['committee']);

        $participations = Participation::where('event_id', $event->event_id)
            ->with([
                'officialTeam', 
                'eventLevel.level',
            ])
            ->latest()
            ->get();

        return inertia('events/participations/participation_lists/committee/Index', [
            'event' => $event,
            'participations' => $participations,
        ]);
    }

    /**
     * Menampilkan pendaftaran milik tim yang sedang menggunakan akun.
     */
    public function myParticipations()
    {
        $user = auth()->user();
        abort_if($user?->role !== 'official_team', 403, 'Akses khusus Official Team.');

        $myOfficialTeamId = $user->officialTeam?->official_team_id;
        abort_if(!$myOfficialTeamId, 403, 'Profil Official Team Anda tidak ditemukan.');

        $participations = Participation::where('official_team_id', $myOfficialTeamId)
            ->with(['eventLevel.level', 'event']) 
            ->latest()
            ->get();

        return inertia('events/participations/participation_lists/official_team/MyParticipations', [
            'participations' => $participations,
            'myOfficialTeamId' => $myOfficialTeamId
        ]);
    }

    /**
     * Menampilkan formulir pendaftaran tim ke event.
     */
    public function create($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team']);

        $eventLevels = EventLevel::where('event_id', $event->event_id)
            ->with('level:level_id,level_name')
            ->get();
        
        $paymentMethods = EventPaymentMethod::where('event_id', $event->event_id)
        ->where('is_active', true)
        ->get();

        return inertia('events/participations/enroll/Create', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Memeriksa ketersediaan kuota untuk pendaftaran tim.
     */
    public function checkQuota(Request $request, $public_id)
    {
        $request->validate([
            'teams' => 'required|array|min:1',
            'teams.*.event_level_id' => 'required|exists:event_levels,event_level_id',
        ]);

        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $this->validateEventAccess($event, [], ['official_team']);

        $levelCounts = collect($request->teams)->countBy('event_level_id');

        foreach ($levelCounts as $levelId => $requestedQuota) {
            $level = EventLevel::where('event_level_id', $levelId)
                ->where('event_id', $event->event_id)
                ->firstOrFail();

            if (!is_null($level->quota) && (int)$level->quota > 0) {
                $currentParticipations = Participation::where('event_level_id', $level->event_level_id)->count();

                if (($currentParticipations + $requestedQuota) > $level->quota) {
                    $remaining = max(0, $level->quota - $currentParticipations);
                    return response()->json([
                        'message' => "Mohon maaf, sisa kuota untuk jenjang {$level->level->level_name} tidak mencukupi. Sisa slot: {$remaining}"
                    ], 422); 
                }
        }
        }

        return response()->json(['message' => 'Kuota tersedia.']);
    }

    /**
     * Mendaftarkan tim ke event.
     */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team']);

        $officialTeamId = auth()->user()->officialTeam->official_team_id ?? null;

        $rules = [
            'teams' => 'required|array|min:1',
            'teams.*.event_level_id' => 'required|exists:event_levels,event_level_id',
            'teams.*.team_name' => 'required|string|max:255',
            'teams.*.pic_name' => 'required|string|max:255',
            'teams.*.pic_phone_number' => 'required|string|regex:/^[0-9]{12,15}$/',
            'temp_payment_proof_path' => 'required|string',
        ];

        $messages = [
            'teams.required' => 'Minimal daftarkan 1 tim.',
            'teams.min' => 'Minimal daftarkan 1 tim.',
            'teams.*.event_level_id.required' => 'Kategori / Jenjang lomba wajib dipilih.',
            'teams.*.event_level_id.exists' => 'Pilihan jenjang lomba tidak valid.',
            'teams.*.team_name.required' => 'Nama tim / pangkalan wajib diisi.',
            'teams.*.team_name.max' => 'Nama tim maksimal 255 karakter.',
            'teams.*.pic_name.required' => 'Nama PIC wajib diisi.',
            'teams.*.pic_name.max' => 'Nama PIC maksimal 255 karakter.',
            'teams.*.pic_phone_number.required' => 'Nomor HP / WhatsApp PIC wajib diisi.',
            'teams.*.pic_phone_number.regex' => 'Nomor HP harus berupa angka 12 hingga 15 digit.',
            'temp_payment_proof_path.required' => 'Bukti pembayaran wajib diunggah.',
        ];

        $validated = $request->validate($rules, $messages);

        $paymentProofPath = null;

        try {
            DB::transaction(function () use ($validated, $event, $officialTeamId, &$paymentProofPath) {
                $tempPath = $validated['temp_payment_proof_path'];
                
                if (!Storage::disk('public')->exists($tempPath)) {
                    throw ValidationException::withMessages([
                        'temp_payment_proof_path' => 'File bukti pembayaran tidak ditemukan atau sesi telah kadaluarsa.',
                    ]);
                }

                $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
                $paymentProofPath = 'payment_proofs/' . Str::random(20) . '.' . $extension;

                $fileStream = Storage::disk('public')->readStream($tempPath);
                Storage::disk('local')->writeStream($paymentProofPath, $fileStream);

                Storage::disk('public')->delete($tempPath);

                $levelCounts = collect($validated['teams'])->countBy('event_level_id');
                $sortedLevelIds = $levelCounts->keys()->sort();
                $eventLevels = [];

                foreach ($sortedLevelIds as $levelId) {
                    $level = EventLevel::with('level')
                        ->where('event_level_id', $levelId)
                        ->where('event_id', $event->event_id)
                        ->lockForUpdate() 
                        ->firstOrFail();

                    $requestedQuota = $levelCounts[$levelId];

                    if (!is_null($level->quota) && (int)$level->quota > 0) {
                        $currentParticipations = Participation::where('event_level_id', $level->event_level_id)->count();

                        if (($currentParticipations + $requestedQuota) > $level->quota) {
                            $remaining = max(0, $level->quota - $currentParticipations);
                            throw ValidationException::withMessages([
                                'teams' => "Mohon maaf, sisa kuota untuk jenjang {$level->level->level_name} tidak mencukupi. Sisa slot: {$remaining}",
                            ]);
                        }
                    }
                    $eventLevels[$levelId] = $level;
                }

                foreach ($validated['teams'] as $team) {
                    $level = $eventLevels[$team['event_level_id']];

                    Participation::create([
                        'public_id' => Str::uuid(),
                        'event_id' => $event->event_id,
                        'official_team_id' => $officialTeamId,
                        'event_level_id' => $level->event_level_id,
                        'team_name' => $team['team_name'],
                        'pic_name' => $team['pic_name'],
                        'pic_phone_number' => $team['pic_phone_number'],
                        'status' => 'pending', 
                        'billed_amount' => $level->registration_fees, 
                        'payment_proof_path' => $paymentProofPath,
                    ]);
                }
            });
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            if ($paymentProofPath && Storage::disk('local')->exists($paymentProofPath)) {
                Storage::disk('local')->delete($paymentProofPath);
            }
            throw $e;
        }

        $totalTeams = count($validated['teams']);
        return redirect()->route('official_team.participations.myParticipations')
                    ->with('success', "Pendaftaran {$totalTeams} tim berhasil!");
    }

    /**
     * Menampilkan detail pendaftaran tim.
     */
    public function show(Event $event, $public_id)
    {
        $participation = Participation::with([
            'event:event_id,public_id,event_name',
            'officialTeam',
            'eventLevel.level',
            'participationDocuments'
        ])->where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee', 'official_team'], $participation);

        return inertia('events/participations/participation_details/Show', [
            'event' => $event,
            'participation' => $participation,
        ]);
    }

    /**
     * Menampilkan formulir perubahan data pendaftaran.
     */
    public function edit(Event $event, $public_id)
    {
        $participation = Participation::with(['participationDocuments', 'event'])
            ->where('public_id', $public_id)
            ->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee', 'official_team'], $participation);

        $eventLevels = EventLevel::where('event_id', $participation->event_id)
            ->with('level')
            ->get();
            
        return inertia('events/participations/participation_edit/Edit', [
            'event' => $event,
            'participation' => $participation,
            'eventLevels' => $eventLevels,
        ]);
    }

    /**
     * Memperbarui informasi pendaftaran tim.
     */
    public function updateRegistration(Request $request, Event $event, $public_id)
    {
        $participation = Participation::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        $rules = [
            'team_name' => 'required|string|max:255',
            'pic_name' => 'required|string|max:255',
            'pic_phone_number' => 'required|string|regex:/^[0-9]{12,15}$/',
            'temp_payment_proof_path' => 'nullable|string',
            'temp_team_logo_path' => 'nullable|string',
        ];

        $messages = [
            'team_name.required' => 'Nama tim / pangkalan wajib diisi.',
            'team_name.max' => 'Nama tim tidak boleh lebih dari 255 karakter.',
            'pic_name.required' => 'Nama PIC penanggung jawab wajib diisi.',
            'pic_name.max' => 'Nama PIC tidak boleh lebih dari 255 karakter.',
            'pic_phone_number.required' => 'Nomor HP / WhatsApp PIC wajib diisi.',
            'pic_phone_number.regex' => 'Nomor HP harus terdiri dari 12 hingga 15 digit angka.',
        ];

        $validated = $request->validate($rules, $messages);

        if ($participation->status !== 'approved' && $request->filled('temp_payment_proof_path')) {
            $tempPayment = $request->input('temp_payment_proof_path');

            if (Storage::disk('public')->exists($tempPayment)) {
                if ($participation->payment_proof_path && Storage::disk('local')->exists($participation->payment_proof_path)) {
                    Storage::disk('local')->delete($participation->payment_proof_path);
                }

                $extension = pathinfo($tempPayment, PATHINFO_EXTENSION);
                $newPaymentPath = 'payment_proofs/' . Str::random(20) . '.' . $extension;

                $fileStream = Storage::disk('public')->readStream($tempPayment);
                Storage::disk('local')->writeStream($newPaymentPath, $fileStream);

                Storage::disk('public')->delete($tempPayment);

                $validated['payment_proof_path'] = $newPaymentPath;
            }
        }
        unset($validated['temp_payment_proof_path']);

        if ($request->filled('temp_team_logo_path')) {
            $tempLogo = $request->input('temp_team_logo_path');

            if (Storage::disk('public')->exists($tempLogo)) {
                if ($participation->team_logo_path && Storage::disk('public')->exists($participation->team_logo_path)) {
                    Storage::disk('public')->delete($participation->team_logo_path);
                }

                $extension = pathinfo($tempLogo, PATHINFO_EXTENSION);
                $newLogoPath = 'team_logos/' . Str::random(20) . '.' . $extension;

                Storage::disk('public')->move($tempLogo, $newLogoPath);
                $validated['team_logo_path'] = $newLogoPath;
            }
        }
        unset($validated['temp_team_logo_path']);

        if ($participation->status === 'rejected') {
            $validated['status'] = 'pending';
            $validated['status_message'] = null;
        }

        $participation->update($validated);

        return redirect()->back()->with('success', 'Data pendaftaran berhasil diperbarui.');
    }

    /**
     * Memperbarui status pendaftaran tim.
     */    
    public function updateStatus(Request $request, Event $event, $public_id)
    {
        $participation = Participation::where('public_id', $public_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'status_message' => 'nullable|string|max:255',
        ]);

        if ($validated['status'] === 'approved') {
            $validated['status_message'] = null;
        }

        if ($validated['status'] === 'rejected' && empty($validated['status_message'])) {
            return back()->withErrors([
                'status_message' => 'Alasan penolakan wajib diisi.',
            ]);
        }

        $participation->update([
            'status' => $validated['status'],
            'status_message' => $validated['status_message'] ?? null,
        ]);

        return redirect()
            ->route('committee.participations.index', ['event' => $event->public_id])
            ->with('success', 'Status pendaftaran berhasil diperbarui.');
    }

    /**
     * Menampilkan dokumen persyaratan milik pendaftaran.
     */
    public function documentIndex(Event $event, $public_id)
    {        
        $participation = Participation::with([
            'event:event_id,public_id,event_name',
            'participationDocuments'
        ])->where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        return inertia('events/documents/official_team/Documents', [
            'event' => $event,
            'participation' => $participation,
        ]);
    }

    /**
     * Mengunggah dokumen persyaratan pendaftaran.
     */
    public function uploadParticipationDocuments(Request $request, Event $event, $public_id)
    {
        $participation = Participation::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:5120',
        ], [
            'file.required' => 'Silakan pilih setidaknya satu dokumen.',
            'file.mimes' => 'Dokumen yang diunggah wajib berformat PDF.',
            'file.max' => 'Ukuran setiap dokumen tidak boleh melebihi 5MB.',
        ]);

        try {
            DB::transaction(function () use ($request, $participation) {
                if ($request->hasFile('file')) {
                    $uploadedFile = $request->file('file');
                    $path = $uploadedFile->store('participation_documents', 'local');

                    ParticipationDocument::create([
                        'participation_id' => $participation->participation_id,
                        'document_name' => $uploadedFile->getClientOriginalName(),
                        'document_path' => $path,
                    ]);
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Dokumen berhasil diunggah'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan dokumen.'
            ], 500); 
        }
    }

    /**
     * Menghapus dokumen persyaratan dari pendaftaran.
     */
    public function destroyDocument(Event $event, $public_id, $document_id)
    {
        $participation = Participation::where('public_id', $public_id)->firstOrFail();
        $document = ParticipationDocument::where('participation_id', $participation->participation_id)
            ->findOrFail($document_id);

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        $documentPath = $document->document_path;

        DB::transaction(function () use ($document) {
            $document->delete();
        });

        if ($documentPath && Storage::disk('local')->exists($documentPath)) {
            Storage::disk('local')->delete($documentPath);
        }

        return redirect()->back()->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Menghapus pendaftaran beserta berkas terkait.
     */
    public function destroy(Event $event, $public_id)
    {
        $participation = Participation::with(['participationDocuments'])
            ->where('event_id', $event->event_id)
            ->where('public_id', $public_id)
            ->firstOrFail();
        $user = auth()->user();

        $this->validateEventAccess($event, ['administration'], ['official_team', 'committee'], $participation);

        if ($user->role === 'official_team') {
            if ($participation->official_team_id !== $user->officialTeam?->official_team_id) {
                abort(403, 'Anda tidak memiliki hak untuk menghapus pendaftaran tim ini.');
            }

            if ($participation->status === 'approved') {
                return redirect()->back()->with('error', 'Pendaftaran yang sudah terverifikasi tidak dapat dihapus mandiri. Silakan hubungi panitia untuk pengajuan pembatalan.');
        }
    }
        $teamLogoPath = $participation->team_logo_path;
        $paymentProofPath = $participation->payment_proof_path;
        $documentPaths = $participation->participationDocuments->pluck('document_path')->toArray();

        DB::transaction(function () use ($participation) {
            $participation->delete();
        });

        if ($teamLogoPath && Storage::disk('public')->exists($teamLogoPath)) {
            Storage::disk('public')->delete($teamLogoPath);
        }

        if ($paymentProofPath && Storage::disk('local')->exists($paymentProofPath)) {
            Storage::disk('local')->delete($paymentProofPath);
        }

        foreach ($documentPaths as $docPath) {
            if ($docPath && Storage::disk('local')->exists($docPath)) {
                Storage::disk('local')->delete($docPath);
            }
        }

        return redirect()->route('official_team.participations.myParticipations', ['event' => $event->public_id])->with('success', 'Pendaftaran berhasil dihapus.');
    }
}