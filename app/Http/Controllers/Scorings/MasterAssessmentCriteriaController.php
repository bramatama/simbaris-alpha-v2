<?php

namespace App\Http\Controllers\Scorings;

use App\Http\Controllers\Controller;
use App\Models\MasterAssessmentCriteria;
use App\Models\AssessmentCriteria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterAssessmentCriteriaController extends Controller
{
    /**
     * Menyimpan Master Kriteria Penilaian baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_category_id' => 'required|exists:master_scoring_categories,master_category_id',
            'criteria_name' => [
                'required',
                'string',
                'max:255',
                // Mencegah nama kriteria kembar di dalam kategori yang sama
                Rule::unique('master_assessment_criteria', 'criteria_name')->where(function ($query) use ($request) {
                    return $query->where('master_category_id', $request->master_category_id);
                }),
            ],
        ]);

        MasterAssessmentCriteria::create([
            'master_category_id' => $validated['master_category_id'],
            'criteria_name' => str($validated['criteria_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Kriteria Penilaian berhasil ditambahkan.');
    }

    /**
     * Memperbarui Master Kriteria Penilaian.
     */
    public function update(Request $request, $master_criteria_id)
    {
        $criteria = MasterAssessmentCriteria::findOrFail($master_criteria_id);

        $validated = $request->validate([
            'master_category_id' => 'required|exists:master_scoring_categories,master_category_id',
            'criteria_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('master_assessment_criteria', 'criteria_name')
                    ->where(function ($query) use ($request) {
                        return $query->where('master_category_id', $request->master_category_id);
                    })
                    ->ignore($criteria->master_criteria_id, 'master_criteria_id'),
            ],
        ]);

        $criteria->update([
            'master_category_id' => $validated['master_category_id'],
            'criteria_name' => str($validated['criteria_name'])->title()->trim(),
        ]);

        return redirect()->back()->with('success', 'Master Kriteria Penilaian berhasil diperbarui.');
    }

    /**
     * Menghapus Master Kriteria Penilaian (dengan proteksi).
     */
    public function destroy($master_criteria_id)
    {
        $criteria = MasterAssessmentCriteria::findOrFail($master_criteria_id);

        // Proteksi: Cek apakah kriteria master ini sudah telanjur dipakai di form penilaian panitia
        $isUsedInEvents = AssessmentCriteria::where('master_criteria_id', $criteria->master_criteria_id)->exists();

        if ($isUsedInEvents) {
            return redirect()->back()->withErrors([
                'error' => 'Master Kriteria ini tidak dapat dihapus karena sudah ditarik dan digunakan dalam form penilaian event.'
            ]);
        }

        $criteria->delete();

        return redirect()->back()->with('success', 'Master Kriteria Penilaian berhasil dihapus.');
    }
}