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
            'documents' => 'required|array|min:1',
            'documents.*' => 'required|file|extensions:pdf|max:10240', // Maksimal 10MB per file
        ], [
            'documents.*.extensions' => 'Semua dokumen yang diunggah harus berformat PDF.',
            'documents.*.max' => 'Ukuran setiap dokumen tidak boleh melebihi 10MB.',
        ]);

        $uploadedPaths = []; // Menyimpan jejak file untuk dihapus jika transaksi gagal

        try {
            DB::transaction(function () use ($request, $event, &$uploadedPaths) {
                if ($request->hasFile('documents')) {
                    foreach ($request->file('documents') as $file) {
                        
                        // Menyimpan file ke folder storage/app/public/event_documents
                        $path = $file->store('event_documents', 'public');
                        $uploadedPaths[] = $path; 
                        
                        // Mengambil nama asli file dari komputer uploader (misal: "Juknis-PBB.pdf")
                        $originalName = $file->getClientOriginalName();

                        EventDocument::create([
                            'event_id' => $event->event_id,
                            'document_name' => $originalName,
                            'document_path' => $path,
                        ]);
                    }
                }
            });
        } catch (\Exception $e) {
            // Jika database gagal, hapus semua file PDF yang sudah terlanjur diunggah di perulangan sebelumnya
            foreach ($uploadedPaths as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
            throw $e;
        }

        return back()->with('success', 'Dokumen event berhasil diunggah!');
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