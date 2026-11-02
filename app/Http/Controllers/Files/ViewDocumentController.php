<?php
namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use App\Models\ParticipationDocument;
use App\Models\Participation;
use App\Models\TeamMember;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
class ViewDocumentController extends Controller
{
    /** Menampilkan dokumen persyaratan pendaftaran yang diizinkan. */
    public function showRegistrationDocs(ParticipationDocument $document)
    {
        Gate::authorize('view', $document->participation);
        $registration_doc = Storage::disk('local')->path($document->document_path);
        return response()->file($registration_doc);
    }

    /** Menampilkan bukti pembayaran pendaftaran yang diizinkan. */
    public function showPaymentProof(Participation $participation)
    {
        Gate::authorize('view', $participation);
        $payment_proof = $participation->payment_proof_path;

        if (!$payment_proof){
            return null;
        }
        $document = Storage::disk('local')->path($payment_proof);
        return response()->file($document);
    }

    /** Menampilkan foto anggota tim yang diizinkan. */
    public function showMemberPhoto(TeamMember $teamMember)
    {
        Gate::authorize('view', $teamMember->participation);
        $member_photo = Storage::disk('local')->path($teamMember->member_photo_path);

        return response()->file($member_photo);
    }
}