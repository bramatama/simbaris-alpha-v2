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
    public function update(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        $this->validateEventAccess($event, ['administration'], ['committee']);

        $messages = [
            'methods.*.type.required'              => 'Tipe metode pembayaran wajib dipilih.',
            'methods.*.type.in'                    => 'Tipe metode pembayaran tidak valid.',
            'methods.*.bank_name.required_if'      => 'Nama bank wajib diisi untuk transfer bank.',
            'methods.*.bank_name.max'              => 'Nama bank maksimal 100 karakter.',
            'methods.*.account_number.required_if' => 'Nomor rekening wajib diisi untuk transfer bank.',
            'methods.*.account_number.max'         => 'Nomor rekening maksimal 100 karakter.',
            'methods.*.account_holder.required_if' => 'Nama pemilik rekening wajib diisi untuk transfer bank.',
            'methods.*.account_holder.max'         => 'Nama pemilik rekening maksimal 255 karakter.',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'methods'                   => 'nullable|array',
            'methods.*.payment_method_id' => 'nullable|exists:event_payment_methods,payment_method_id',
            'methods.*.type'            => 'required|in:bank_transfer,qris',
            'methods.*.bank_name'       => 'required_if:methods.*.type,bank_transfer|nullable|string|max:100',
            'methods.*.account_number'  => 'required_if:methods.*.type,bank_transfer|nullable|string|max:100',
            'methods.*.account_holder'  => 'required_if:methods.*.type,bank_transfer|nullable|string|max:255',
            'methods.*.temp_qris_path'  => 'nullable|string',
            'methods.*.is_active'       => 'boolean',
        ], $messages);

        $validator->after(function ($validator) use ($request, $event) {
            $methods = $request->input('methods', []);
            if (!is_array($methods)) {
                return;
            }

            $submittedIds = collect($methods)
                ->pluck('payment_method_id')
                ->filter()
                ->toArray();

            $seenCombinations = [];

            foreach ($methods as $index => $method) {
                if (($method['type'] ?? null) !== 'bank_transfer') {
                    continue;
                }

                $bankName = strtolower(trim($method['bank_name'] ?? ''));
                // Normalisasi nomor rekening (hapus spasi/tanda hubung jika ada)
                $accountNumber = preg_replace('/[\s\-]+/', '', trim($method['account_number'] ?? ''));

                if ($bankName === '' || $accountNumber === '') {
                    continue;
                }

                $comboKey = $bankName . '|' . $accountNumber;

                // 1. Cek duplikasi sesama input di form
                if (isset($seenCombinations[$comboKey])) {
                    $validator->errors()->add(
                        "methods.{$index}.account_number",
                        'Kombinasi nama bank dan nomor rekening ini duplikat dengan baris lain di form.'
                    );
                    continue;
                }
                $seenCombinations[$comboKey] = true;

                // 2. Cek duplikasi di database pada event ini (mengecualikan record sendiri)
                $currentId = $method['payment_method_id'] ?? null;

                $existsInDb = EventPaymentMethod::where('event_id', $event->event_id)
                    ->where('type', 'bank_transfer')
                    ->whereRaw('LOWER(TRIM(bank_name)) = ?', [$bankName])
                    ->whereRaw("REPLACE(REPLACE(TRIM(account_number), ' ', ''), '-', '') = ?", [$accountNumber])
                    ->when($currentId, fn($q) => $q->where('payment_method_id', '!=', $currentId))
                    ->whereIn('payment_method_id', $submittedIds)
                    ->exists();

                if ($existsInDb) {
                    $validator->errors()->add(
                        "methods.{$index}.account_number",
                        'Nama bank dan nomor rekening tersebut sudah terdaftar pada event ini.'
                    );
                }
            }
        });

        $validated = $validator->validate();

        DB::transaction(function () use ($validated, $event) {
            $submittedMethods = $validated['methods'] ?? [];
            
            // 1. Dapatkan ID yang dikirim dari form
            $submittedIds = collect($submittedMethods)
                ->pluck('payment_method_id')
                ->filter()
                ->toArray();

            // 2. Hapus metode pembayaran yang ada di DB tetapi tidak dikirim lagi di form
            $methodsToDelete = EventPaymentMethod::where('event_id', $event->event_id)
                ->whereNotIn('payment_method_id', $submittedIds)
                ->get();

            foreach ($methodsToDelete as $method) {
                if ($method->type === 'qris' && $method->qris_image_path) {
                    if (Storage::disk('public')->exists($method->qris_image_path)) {
                        Storage::disk('public')->delete($method->qris_image_path);
                    }
                }
                $method->delete();
            }

            // 3. Upsert (Create / Update) data metode pembayaran
            foreach ($submittedMethods as $index => $methodData) {
                $methodId = $methodData['payment_method_id'] ?? null;
                $qrisPath = null;

                // Tangani file temporary QRIS jika ada yang di-upload
                if (!empty($methodData['temp_qris_path'])) {
                    $tempPath = $methodData['temp_qris_path'];
                    if (Storage::disk('public')->exists($tempPath)) {
                        $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
                        $qrisPath = 'qris_codes/' . Str::random(20) . '.' . $extension;
                        Storage::disk('public')->move($tempPath, $qrisPath);
                    }
                }

                if ($methodId) {
                    // Update Record Lama
                    $existing = EventPaymentMethod::where('event_id', $event->event_id)
                        ->where('payment_method_id', $methodId)
                        ->first();

                    if ($existing) {
                        $updatePayload = [
                            'type'           => $methodData['type'],
                            'bank_name'      => $methodData['type'] === 'bank_transfer' ? trim($methodData['bank_name']) : null,
                            'account_number' => $methodData['type'] === 'bank_transfer' ? trim($methodData['account_number']) : null,
                            'account_holder' => $methodData['type'] === 'bank_transfer' ? trim($methodData['account_holder']) : null,
                            'is_active'      => $methodData['is_active'] ?? true,
                        ];

                        if ($qrisPath) {
                            if ($existing->qris_image_path && Storage::disk('public')->exists($existing->qris_image_path)) {
                                Storage::disk('public')->delete($existing->qris_image_path);
                            }
                            $updatePayload['qris_image_path'] = $qrisPath;
                        }

                        $existing->update($updatePayload);
                    }
                } else {
                    // Buat Record Baru
                    EventPaymentMethod::create([
                        'event_id'        => $event->event_id,
                        'type'            => $methodData['type'],
                        'bank_name'       => $methodData['type'] === 'bank_transfer' ? trim($methodData['bank_name']) : null,
                        'account_number'  => $methodData['type'] === 'bank_transfer' ? trim($methodData['account_number']) : null,
                        'account_holder'  => $methodData['type'] === 'bank_transfer' ? trim($methodData['account_holder']) : null,
                        'qris_image_path' => $qrisPath,
                        'is_active'       => $methodData['is_active'] ?? true,
                    ]);
                }
            }
        });

        return redirect()->route('committee.events.payment-methods.index', $public_id)->with('success', 'Konfigurasi metode pembayaran berhasil diperbarui.');
    }
}