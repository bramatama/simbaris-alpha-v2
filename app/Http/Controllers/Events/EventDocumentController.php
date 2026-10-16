<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EventDocumentController extends Controller
{
    /**
     * Menampilkan daftar dokumen untuk event tertentu.
     */
    public function index($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $documents = EventDocument::where('event_id', $event->event_id)
            ->latest()
            ->get();

        // Sesuaikan path view ini dengan struktur folder di resource/js/Pages kamu
        return inertia('events/documents/committee/DocumentManagement', [
            'event' => $event,
            'documents' => $documents,
        ]);
    }

    /**
     * Menyimpan banyak dokumen PDF sekaligus untuk event tertentu.
     */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        // Validasi: documents harus berupa array, dan setiap isinya wajib file PDF
        $request->validate([
        'file' => 'required|file|mimes:pdf|max:10240', // PDF Maks 10MB
        ], [
            'file.required' => 'File dokumen wajib dipilih.',
            'file.mimes' => 'Format file harus berupa PDF.',
            'file.max' => 'Ukuran file tidak boleh melebihi 10MB.',
        ]);


        try {
            DB::transaction(function () use ($request, $event, &$uploadedPaths) {
                if ($request->hasFile('file')) {
                    $uploadedFile = $request->file('file');
                    
                    // Simpan file ke storage
                    $path = $uploadedFile->store('event_documents', 'public');

                    // Simpan record ke database
                    EventDocument::create([
                        'event_id' => $event->event_id,
                        'document_name' => $uploadedFile->getClientOriginalName(),
                        'document_path' => $path,
                    ]);
                }
            });
            return response()->json([
                    'status' => 'success',
                    'message' => 'Dokumen juknis berhasil diunggah.',
                ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunggah dokumen: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Menghapus dokumen tunggal.
     */
    public function destroy($public_id, $document_id)
    {
        $document = EventDocument::findOrFail($document_id);
        
        DB::transaction(function () use ($document) {
            $document->delete();
        });

        if ($document->document_path && Storage::disk('public')->exists($document->document_path)) {
            Storage::disk('public')->delete($document->document_path);
        }

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }
}