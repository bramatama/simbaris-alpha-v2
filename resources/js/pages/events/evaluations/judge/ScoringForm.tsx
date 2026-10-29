import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { debounce, isEqual } from 'lodash';
import EvaluationAppLayout from '@/layouts/evaluation-page-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, CheckCircle2, Loader2, Save, XCircle } from 'lucide-react';

/* ==========================================
   TYPES
========================================== */
interface ScoringProps {
    event: any;
    participation: any;
    activeCategory: any;
    existingScores: any[];
}

interface LocalScore {
    criteria_id: number;
    rubric_score_id: number;
    score_value: number;
    clicked_at: string;
}

export default function ScoringForm({
    event,
    participation,
    activeCategory,
    existingScores,
}: ScoringProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [localScores, setLocalScores] = useState<Record<number, LocalScore>>(
        {},
    );
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'saved' | 'error'
    >('idle');
    const lastSavedPayloadRef = useRef<LocalScore[]>([]);

    const autosaveUrl = `/api/${userRole}/participations/${participation.public_id}/autosave`;
    const submitCategoryUrl = `/${userRole}/events/${event.public_id}/participants/${participation.public_id}/evaluate/${activeCategory.scoring_category_id}/submit`;
    const backUrl = `/${userRole}/events/${event.public_id}/participants/${participation.public_id}`;

    useEffect(() => {
        const activeCriteriaIds = activeCategory.assessment_criteria.map(
            (c: any) => c.criteria_id,
        );
        const newInitialScores: Record<number, LocalScore> = {};

        existingScores.forEach((score) => {
            if (activeCriteriaIds.includes(score.criteria_id)) {
                newInitialScores[score.criteria_id] = {
                    criteria_id: score.criteria_id,
                    rubric_score_id: score.rubric_score_id,
                    score_value: score.score_value,
                    clicked_at: score.created_at || new Date().toISOString(),
                };
            }
        });

        setLocalScores(newInitialScores);
        lastSavedPayloadRef.current = Object.values(newInitialScores);
        setSaveStatus('idle'); // Paksa indikator kembali ke 'idle' setiap ganti kategori
    }, [activeCategory.scoring_category_id, existingScores]);

    /* ==========================================
       AUTOSAVE DEBOUNCE LOGIC (5 DETIK)
    ========================================== */
    const debouncedSave = useCallback(
        debounce(async (scoresToSave: LocalScore[]) => {
            if (isEqual(scoresToSave, lastSavedPayloadRef.current)) return;

            setSaveStatus('saving');
            try {
                await axios.post(autosaveUrl, {
                    category_id: activeCategory.scoring_category_id,
                    scores: scoresToSave,
                });
                lastSavedPayloadRef.current = scoresToSave;
                setSaveStatus('saved');
            } catch (error) {
                setSaveStatus('error');
                console.error('Gagal melakukan autosave:', error);
            }
        }, 10000),
        [],
    );

    useEffect(() => {
        return () => debouncedSave.cancel();
    }, [debouncedSave]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveStatus === 'saving') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveStatus]);

    /* ==========================================
       HANDLER INTERAKSI KLIK NILAI
    ========================================== */
   const handleScoreClick = (
       criteriaId: number,
       rubricScoreId: number,
       scoreValue: number,
   ) => {
       setLocalScores((prev) => {
           const updated = { ...prev };

           // LOGIKA TOGGLE: Jika yang diklik adalah nilai yang sedang aktif, BATALKAN (Hapus)
           if (updated[criteriaId]?.rubric_score_id === rubricScoreId) {
               delete updated[criteriaId];
           } else {
               // Jika baru/berbeda, tetapkan nilainya
               updated[criteriaId] = {
                   criteria_id: criteriaId,
                   rubric_score_id: rubricScoreId,
                   score_value: scoreValue,
                   clicked_at: new Date().toISOString(),
               };
           }

           debouncedSave(Object.values(updated));
           setSaveStatus('idle');
           return updated;
       });
   };

    /* ==========================================
       SUBMIT KATEGORI (DENGAN KONFIRMASI)
    ========================================== */
    const handleSubmitCategory = () => {
        const finalScores = Object.values(localScores);
        const totalCriteria = activeCategory.assessment_criteria.length;

        // Peringatan jika belum lengkap
        if (finalScores.length < totalCriteria) {
            if (
                !window.confirm(
                    `Anda baru mengisi ${finalScores.length} dari ${totalCriteria} kriteria. Yakin ingin menyimpan dan melanjutkan?`,
                )
            ) {
                return;
            }
        } else {
            // Peringatan jika sudah lengkap
            if (
                !window.confirm(
                    'Apakah Anda yakin ingin menyimpan dan beralih dari kategori ini?',
                )
            ) {
                return;
            }
        }

        debouncedSave.cancel();

        router.post(
            submitCategoryUrl,
            { scores: finalScores.map((score) => ({ ...score })) },
            {
                preserveScroll: true,
                onStart: () => setSaveStatus('saving'),
                onFinish: () => setSaveStatus('idle'), 
            },
        );
    };

    return (
        <EvaluationAppLayout>
            <Head
                title={`Penilaian - ${activeCategory.master_category.category_name}`}
            />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-2 pb-32 sm:p-4 md:p-6 lg:p-8">
                <div className="pt-2 sm:pt-0">
                    <Link
                        href={backUrl}
                        onClick={(e) => {
                            if (
                                !window.confirm(
                                    'Apakah Anda yakin ingin kembali ke pratinjau? Pastikan semua perubahan terakhir Anda telah tersimpan otomatis.',
                                )
                            ) {
                                e.preventDefault();
                            }
                        }}
                        className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                        Kembali ke Pratinjau Tim
                    </Link>
                </div>

                {/* STATUS BAR & INFO TIM SPESIFIK KATEGORI */}
                <div className="sticky top-13 z-30 mb-6 flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-sm">
                            {participation.appearance_order ?? '?'}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl leading-tight font-bold text-foreground sm:text-2xl">
                                {participation.team_name}
                            </h1>
                            <span className="text-sm font-semibold text-primary">
                                Sedang Menilai:{' '}
                                {activeCategory.master_category.category_name}
                            </span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-muted/20 px-4 py-2 text-xs font-medium sm:text-sm">
                        {saveStatus === 'saving' && (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />{' '}
                                <span className="text-amber-600">
                                    Menyimpan...
                                </span>
                            </>
                        )}
                        {saveStatus === 'saved' && (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />{' '}
                                <span className="text-emerald-600">
                                    Tersimpan otomatis
                                </span>
                            </>
                        )}
                        {saveStatus === 'error' && (
                            <>
                                <XCircle className="h-4 w-4 text-destructive" />{' '}
                                <span className="text-destructive">
                                    Gagal menyimpan
                                </span>
                            </>
                        )}
                        {saveStatus === 'idle' && (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground opacity-50" />{' '}
                                <span className="text-muted-foreground opacity-70">
                                    Draf aman
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* TABEL PENILAIAN KLIK */}
                <div className="space-y-8">
                    <Card className="overflow-hidden border-border/70 shadow-sm">
                        <div className="bg-primary/10 p-4">
                            <h3 className="text-lg font-bold text-primary">
                                Indikator Penilaian:{' '}
                                {activeCategory.master_category.category_name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                *Kriteria yang dibiarkan kosong akan otomatis
                                bernilai 0 saat disimpan atau dikunci.
                            </p>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-175 text-left text-sm">
                                <thead className="bg-muted/10">
                                    <tr>
                                        <th className="border-b border-border/50 p-4 font-semibold text-muted-foreground">
                                            Kriteria / Materi Gerakan
                                        </th>
                                        {activeCategory.assessment_criteria[0]?.rubric_categories.map(
                                            (rubricCol: any) => (
                                                <th
                                                    key={
                                                        rubricCol.rubric_category_id
                                                    }
                                                    className="border-b border-border/50 p-4 font-semibold text-muted-foreground"
                                                >
                                                    {rubricCol.category_label}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {activeCategory.assessment_criteria.map(
                                        (crit: any) => (
                                            <tr
                                                key={crit.criteria_id}
                                                className="transition-colors hover:bg-muted/5"
                                            >
                                                <td className="p-4 font-medium text-foreground">
                                                    {crit.master_criteria
                                                        ?.criteria_name ||
                                                        crit.masterCriteria
                                                            ?.criteria_name ||
                                                        `Kriteria #${crit.master_criteria_id}`}
                                                </td>
                                                {crit.rubric_categories.map(
                                                    (rubricCol: any) => (
                                                        <td
                                                            key={
                                                                rubricCol.rubric_category_id
                                                            }
                                                            className="p-4"
                                                        >
                                                            <div className="flex flex-wrap gap-2">
                                                                {rubricCol.rubric_scores.map(
                                                                    (
                                                                        score: any,
                                                                    ) => {
                                                                        const isActive =
                                                                            localScores[
                                                                                crit
                                                                                    .criteria_id
                                                                            ]
                                                                                ?.rubric_score_id ===
                                                                            score.rubric_score_id;

                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    score.rubric_score_id
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleScoreClick(
                                                                                        crit.criteria_id,
                                                                                        score.rubric_score_id,
                                                                                        score.score_value,
                                                                                    )
                                                                                }
                                                                                className={`flex h-10 w-12 cursor-pointer items-center justify-center rounded-md border px-7 text-base font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${
                                                                                    isActive
                                                                                        ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1'
                                                                                        : 'border-border/80 bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    score.score_value
                                                                                }
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        </td>
                                                    ),
                                                )}
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* ACTION FOOTER FINAL SUBMIT (FLOATING & FULL WIDTH) */}
                <div className="sticky bottom-6 z-40 mt-8 w-full rounded-xl border border-border/60 bg-background/95 px-4 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md md:px-6">
                    <div className="flex w-full items-center justify-between gap-4">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            *Draf tersimpan otomatis. Tekan tombol untuk beralih
                            ke kategori selanjutnya.
                        </p>
                        <Button
                            size="lg"
                            className="w-full gap-2 font-semibold shadow-md sm:w-auto sm:px-12"
                            onClick={handleSubmitCategory}
                            disabled={saveStatus === 'saving'}
                        >
                            <Save className="h-4 w-4" />
                            {saveStatus === 'saving'
                                ? 'Memproses Draf...'
                                : 'Simpan & Lanjutkan'}
                        </Button>
                    </div>
                </div>
            </div>
        </EvaluationAppLayout>
    );
}
