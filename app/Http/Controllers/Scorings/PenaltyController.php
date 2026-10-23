<?php

namespace App\Http\Controllers\Scorings;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPenalty;
use App\Models\MasterPenalty;
use App\Models\ScoringCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PenaltyController extends Controller
{
    public function index($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $eventPenalties = EventPenalty::where('event_id', $event->event_id)
            ->with([
                'masterPenalty',
                'scoringCategory.masterCategory',
                'scoringCategory.eventLevel.level'
            ])
            ->latest()
            ->get();

        $masterPenalties = MasterPenalty::orderBy('penalty_name', 'asc')->get();

        $scoringCategories = ScoringCategory::whereHas('eventLevel', function ($q) use ($event) {
                $q->where('event_id', $event->event_id);
            })
            ->with(['masterCategory', 'eventLevel.level'])
            ->get();

        return inertia('events/penalties/Index', [
            'event' => $event,
            'eventPenalties' => $eventPenalties,
            'masterPenalties' => $masterPenalties,
            'scoringCategories' => $scoringCategories,
        ]);
    }

    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $validated = $request->validate([
            'penalty_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scoring_category_id' => 'nullable|exists:scoring_categories,scoring_category_id',
            'penalty_value' => 'required|numeric|min:0.01',
            'calculation_type' => ['required', Rule::in(['fixed', 'per_occurrence'])],
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $event) {
            $masterPenalty = MasterPenalty::firstOrCreate(
                ['penalty_name' => $validated['penalty_name']],
                ['description' => $validated['description'] ?? null]
            );

            $exists = EventPenalty::where('event_id', $event->event_id)
                ->where('master_penalty_id', $masterPenalty->master_penalty_id)
                ->where('scoring_category_id', $validated['scoring_category_id'] ?? null)
                ->exists();

            if ($exists) {
                abort(422, 'Aturan penalti ini sudah ada untuk kategori yang dipilih.');
            }

            EventPenalty::create([
                'event_id' => $event->event_id,
                'master_penalty_id' => $masterPenalty->master_penalty_id,
                'scoring_category_id' => $validated['scoring_category_id'] ?? null,
                'penalty_value' => round((float) $validated['penalty_value'], 2),
                'calculation_type' => $validated['calculation_type'],
                'is_active' => $validated['is_active'] ?? true,
            ]);
        });

        return redirect()->back()->with('success', 'Aturan penalti berhasil ditambahkan.');
    }

    public function update(Request $request, $public_id, $event_penalty_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $event_penalty_id)
            ->firstOrFail();

        $validated = $request->validate([
            'penalty_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scoring_category_id' => 'nullable|exists:scoring_categories,scoring_category_id',
            'penalty_value' => 'required|numeric|min:0.01',
            'calculation_type' => ['required', Rule::in(['fixed', 'per_occurrence'])],
        ]);

        DB::transaction(function () use ($validated, $eventPenalty) {
            $masterPenalty = MasterPenalty::firstOrCreate(
                ['penalty_name' => $validated['penalty_name']],
                ['description' => $validated['description'] ?? null]
            );

            $eventPenalty->update([
                'master_penalty_id' => $masterPenalty->master_penalty_id,
                'scoring_category_id' => $validated['scoring_category_id'] ?? null,
                'penalty_value' => round((float) $validated['penalty_value'], 2),
                'calculation_type' => $validated['calculation_type'],
            ]);
        });

        return redirect()->back()->with('success', 'Aturan penalti berhasil diperbarui.');
    }

    public function toggleStatus($public_id, $event_penalty_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $event_penalty_id)
            ->firstOrFail();

        $eventPenalty->update([
            'is_active' => !$eventPenalty->is_active,
        ]);

        $statusText = $eventPenalty->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Penalti berhasil {$statusText}.");
    }

    public function destroy($public_id, $event_penalty_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $event_penalty_id)
            ->firstOrFail();

        $eventPenalty->delete();

        return redirect()->back()->with('success', 'Aturan penalti berhasil dihapus.');
    }
}