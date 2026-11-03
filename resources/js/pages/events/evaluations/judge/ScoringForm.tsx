import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { debounce, isEqual } from 'lodash';
import EvaluationAppLayout from '@/layouts/evaluation-page-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, CheckCircle2, Loader2, Save, XCircle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

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

    // STATE CONFIRMATION DIALOGS
    const [showBackDialog, setShowBackDialog] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [submitDialogConfig, setSubmitDialogConfig] = useState({
        title: '',
        description: '',
    });

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
        setSaveStatus('idle');
    }, [activeCategory.scoring_category_id, existingScores]);

    /* ==========================================
       AUTOSAVE DEBOUNCE LOGIC (7.5 DETIK)
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
        }, 7500),
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

            if (updated[criteriaId]?.rubric_score_id === rubricScoreId) {
                delete updated[criteriaId];
            } else {
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
       TRIGGER & CONFIRM SUBMIT KATEGORI
    ========================================== */
    const handleTriggerSubmit = () => {
        const finalScores = Object.values(localScores);
        const totalCriteria = activeCategory.assessment_criteria.length;

        if (finalScores.length < totalCriteria) {
            setSubmitDialogConfig({
                title: 'Kriteria Belum Lengkap',
                description: `Anda baru mengisi ${finalScores.length} dari ${totalCriteria} kriteria. Kriteria yang kosong akan bernilai 0. Yakin ingin menyimpan dan melanjutkan?`,
            });
        } else {
            setSubmitDialogConfig({
                title: 'Simpan Penilaian Kategori?',
                description:
                    'Apakah Anda yakin ingin menyimpan seluruh nilai dan beralih dari kategori ini?',
            });
        }
        setShowSubmitDialog(true);
    };

    const confirmSubmitCategory = () => {
        const finalScores = Object.values(localScores);
        debouncedSave.cancel();

        router.post(
            submitCategoryUrl,
            { scores: finalScores.map((score) => ({ ...score })) },
            {
                preserveScroll: true,
                onStart: () => setSaveStatus('saving'),
                onFinish: () => {
                    setSaveStatus('idle');
                    setShowSubmitDialog(false);
                },
            },
        );
    };

    const confirmBackToPreview = () => {
        setShowBackDialog(false);
        router.visit(backUrl);
    };

    return (
        <EvaluationAppLayout>
            <Head
                title={`Penilaian - ${activeCategory.master_category.category_name}`}
            />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-2 pb-32 sm:p-4 md:p-6 lg:p-8">
                <div className="pt-2 sm:pt-0">
                    <Button
                        variant="ghost"
                        onClick={() => setShowBackDialog(true)}
                        className="inline-flex h-auto items-center p-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                        Kembali ke Pratinjau Tim
                    </Button>
                </div>

                {/* STATUS BAR & INFO TIM */}
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

                {/* FORM PENILAIAN DUAL-MODE */}
                <div className="space-y-6">
                    <div className="rounded-lg bg-primary/10 p-4">
                        <h3 className="text-lg font-bold text-primary">
                            Indikator Penilaian:{' '}
                            {activeCategory.master_category.category_name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            *Kriteria yang dibiarkan kosong akan otomatis
                            bernilai 0 saat disimpan atau dikunci.
                        </p>
                    </div>

                    {/* ===================================================
                       1. TAMPILAN MOBILE & PORTRAIT TABLET (CARD LAYOUT)
                       =================================================== */}
                    <div className="flex flex-col gap-4 sm:hidden">
                        {activeCategory.assessment_criteria.map(
                            (crit: any, cIdx: number) => {
                                const isCritAnswered = Boolean(
                                    localScores[crit.criteria_id],
                                );

                                return (
                                    <Card
                                        key={crit.criteria_id}
                                        className={`overflow-hidden border transition-all ${
                                            isCritAnswered
                                                ? 'border-primary/50 bg-background shadow-sm'
                                                : 'border-border/70 bg-muted/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/20 p-3.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                {cIdx + 1}
                                            </div>
                                            <h4 className="leading-snug font-bold text-foreground">
                                                {crit.master_criteria
                                                    ?.criteria_name ||
                                                    crit.masterCriteria
                                                        ?.criteria_name ||
                                                    `Kriteria #${crit.master_criteria_id}`}
                                            </h4>
                                        </div>

                                        <CardContent className="space-y-4 p-4">
                                            {crit.rubric_categories.map(
                                                (rubricCol: any) => (
                                                    <div
                                                        key={
                                                            rubricCol.rubric_category_id
                                                        }
                                                        className="space-y-2"
                                                    >
                                                        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                            {
                                                                rubricCol.category_label
                                                            }
                                                        </span>
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
                                                                            className={`flex h-11 min-w-14 flex-1 cursor-pointer items-center justify-center rounded-lg border text-base font-bold shadow-sm transition-all active:scale-95 ${
                                                                                isActive
                                                                                    ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/30'
                                                                                    : 'border-border/80 bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
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
                                                    </div>
                                                ),
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            },
                        )}
                    </div>

                    {/* ===================================================
                       2. TAMPILAN DESKTOP & LANDSCAPE TABLET (TABLE LAYOUT)
                       =================================================== */}
                    <Card className="hidden overflow-hidden border-border/70 shadow-sm sm:block">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left text-sm">
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

                {/* ACTION FOOTER */}
                <div className="sticky bottom-6 z-40 mt-8 w-full rounded-xl border border-border/60 bg-background/95 px-4 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md md:px-6">
                    <div className="flex w-full items-center justify-between gap-4">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            *Draf tersimpan otomatis. Tekan tombol untuk beralih
                            ke kategori selanjutnya.
                        </p>
                        <Button
                            size="lg"
                            className="w-full gap-2 font-semibold shadow-md sm:w-auto sm:px-12"
                            onClick={handleTriggerSubmit}
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

            {/* CONFIRMATION DIALOG FOR BACK TO PREVIEW */}
            <ConfirmationDialog
                open={showBackDialog}
                onOpenChange={setShowBackDialog}
                title="Kembali ke Pratinjau Tim?"
                description="Pastikan semua nilai perubahan terakhir Anda telah tersimpan secara otomatis sebelum meninggalkan halaman penilaian ini."
                confirmText="Ya, Kembali"
                cancelText="Batal"
                onConfirm={confirmBackToPreview}
            />

            {/* CONFIRMATION DIALOG FOR SUBMIT CATEGORY */}
            <ConfirmationDialog
                open={showSubmitDialog}
                onOpenChange={setShowSubmitDialog}
                title={submitDialogConfig.title}
                description={submitDialogConfig.description}
                confirmText="Ya, Simpan & Lanjutkan"
                cancelText="Batal"
                isProcessing={saveStatus === 'saving'}
                onConfirm={confirmSubmitCategory}
            />
        </EvaluationAppLayout>
    );
}
