<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPaymentMethod;
use App\Concerns\HasEventAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventPaymentMethodController extends Controller
{
    use HasEventAccess;

    /** Menampilkan halaman khusus kelola metode pembayaran event. */
    public function index($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

        $paymentMethods = EventPaymentMethod::where('event_id',$event->event_id)
            ->get();

        return inertia('events/payment_methods/Index', [
            'event' => $event,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /** Menyinkronkan (create/update/delete) seluruh metode pembayaran event. */
    public function update(Request $request,$public_id)
    {
        $event = Event::where('public_id',$public_id)->firstOrFail();
        $this->validateEventAccess($event, ['administration'], ['committee']);

        $validated =$request->validate([
            'methods' => 'nullable|array',
            'methods.*.payment_method_id' => 'nullable|exists:event_payment_methods,payment_method_id',
            'methods.*.type' => 'required|in:bank_transfer,qris',
            'methods.*.bank_name' => 'required_if:methods.*.type,bank_transfer|nullable|string|max:100',
            'methods.*.account_number' => 'required_if:methods.*.type,bank_transfer|nullable|string|max:100',
            'methods.*.account_holder' => 'required_if:methods.*.type,bank_transfer|nullable|string|max:255',
            'methods.*.temp_qris_path' => 'nullable|string',
            'methods.*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $validated,$event) {
            $submittedMethods =$validated['methods'] ?? [];
            
            // 1. Dapatkan ID yang dikirim dari form
            $submittedIds = collect($submittedMethods)
                ->pluck('payment_method_id')
                ->filter()
                ->toArray();

            // 2. Hapus metode pembayaran yang ada di DB tetapi tidak dikirim lagi di form
            $methodsToDelete = EventPaymentMethod::where('event_id',$event->event_id)
                ->whereNotIn('payment_method_id', $submittedIds)
                ->get();

            foreach ($methodsToDelete as$method) {
                if ($method->type === 'qris' &&$method->qris_image_path) {
                    if (Storage::disk('public')->exists($method->qris_image_path)) {
                        Storage::disk('public')->delete($method->qris_image_path);
                    }
                }
                $method->delete();
            }

            // 3. Upsert (Create / Update) data metode pembayaran
            foreach ($submittedMethods as $index =>$methodData) {
                $methodId =$methodData['payment_method_id'] ?? null;
                $qrisPath = null;

                // Tangani file temporary QRIS jika ada yang di-upload
                if (!empty($methodData['temp_qris_path'])) {
                    $tempPath =$methodData['temp_qris_path'];
                    if (Storage::disk('public')->exists($tempPath)) {
                        $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
                        $qrisPath = 'qris_codes/' . Str::random(20) . '.' . $extension;
                        Storage::disk('public')->move($tempPath,$qrisPath);
                    }
                }

                if ($methodId) {
                    // Update Record Lama
                    $existing = EventPaymentMethod::where('event_id',$event->event_id)
                        ->where('payment_method_id', $methodId)
                        ->first();

                    if ($existing) {$updatePayload = [
                            'type' => $methodData['type'],
                            'bank_name' => $methodData['type'] === 'bank_transfer' ?$methodData['bank_name'] : null,
                            'account_number' => $methodData['type'] === 'bank_transfer' ?$methodData['account_number'] : null,
                            'account_holder' => $methodData['type'] === 'bank_transfer' ?$methodData['account_holder'] : null,
                            'is_active' => $methodData['is_active'] ?? true,
                        ];

                        if ($qrisPath) {
                            if ($existing->qris_image_path && Storage::disk('public')->exists($existing->qris_image_path)) {
                                Storage::disk('public')->delete($existing->qris_image_path);
                            }
                            $updatePayload['qris_image_path'] =$qrisPath;
                        }

                        $existing->update($updatePayload);
                    }
                } else {
                    // Buat Record Baru
                    EventPaymentMethod::create([
                        'event_id' => $event->event_id,
                        'type' => $methodData['type'],
                        'bank_name' => $methodData['type'] === 'bank_transfer' ?$methodData['bank_name'] : null,
                        'account_number' => $methodData['type'] === 'bank_transfer' ?$methodData['account_number'] : null,
                        'account_holder' => $methodData['type'] === 'bank_transfer' ?$methodData['account_holder'] : null,
                        'qris_image_path' => $qrisPath,
                        'is_active' => $methodData['is_active'] ?? true,
                    ]);
                }
            }
        });

        return redirect()->route('committee.events.payment-methods.index', $public_id)->with('success', 'Konfigurasi metode pembayaran berhasil diperbarui.');
    }
}