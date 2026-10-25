import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Save } from 'lucide-react';

interface TrophyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventPublicId: string;
    userRole: string;
    mode: 'create' | 'edit';
    trophyData: any | null;
    eventCategories: any[];
    eventLevels: any[];
    activeLevelId: number | null;
}

export function TrophyDialog({
    open,
    onOpenChange,
    eventPublicId,
    userRole,
    mode,
    trophyData,
    eventCategories,
    eventLevels,
    activeLevelId,
}: TrophyDialogProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        event_champion_category_id: '',
        champion_name: '',
        rank_position: '',
        prize_money: '',
        certificate: false,
        prize_descriptions: '',
        event_level_ids: activeLevelId ? [activeLevelId] : [], // Default ke jenjang yang aktif
    });

    useEffect(() => {
        if (open && mode === 'edit' && trophyData) {
            setData({
                event_champion_category_id:
                    trophyData.champion?.champion_category_id?.toString() || '',
                champion_name: trophyData.champion?.champion_name || '',
                rank_position:
                    trophyData.champion?.rank_position?.toString() || '',
                prize_money: trophyData.prize_money?.toString() || '',
                certificate: !!trophyData.certificate,
                prize_descriptions: trophyData.prize_descriptions || '',
                event_level_ids: [], // Edit hanya memperbarui 1 jenjang sesuai ID endpoint
            });
        } else if (open && mode === 'create') {
            setData('event_level_ids', activeLevelId ? [activeLevelId] : []);
        }
    }, [open, mode, trophyData, activeLevelId]);

    const handleLevelToggle = (levelId: number) => {
        const current = data.event_level_ids;
        if (current.includes(levelId)) {
            setData(
                'event_level_ids',
                current.filter((id) => id !== levelId),
            );
        } else {
            setData('event_level_ids', [...current, levelId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(`/${userRole}/events/${eventPublicId}/champions/trophies`, {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            put(
                `/${userRole}/events/${eventPublicId}/champions/trophies/${trophyData.event_champion_id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        onOpenChange(false);
                        reset();
                    },
                },
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) reset();
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create'
                            ? 'Tambah Piala Baru'
                            : 'Update Data Piala'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    {mode === 'create' && (
                        <div className="space-y-2">
                            <Label
                                htmlFor="event_champion_category_id"
                                requirement="required"
                            >
                                Kategori Juara
                            </Label>
                            <Select
                                value={data.event_champion_category_id}
                                onValueChange={(val) =>
                                    setData('event_champion_category_id', val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kategori Juara" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventCategories.map((ec: any) => (
                                        <SelectItem
                                            key={ec.event_champion_category_id}
                                            value={ec.event_champion_category_id.toString()}
                                        >
                                            {
                                                ec.champion_category
                                                    ?.champion_category_name
                                            }
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.event_champion_category_id}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="champion_name"
                                requirement="required"
                            >
                                Nama Piala
                            </Label>
                            <Input
                                id="champion_name"
                                value={data.champion_name}
                                onChange={(e) =>
                                    setData('champion_name', e.target.value)
                                }
                                placeholder="Contoh: Juara 1 Utama"
                            />
                            <InputError message={errors.champion_name} />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="rank_position"
                                requirement="required"
                            >
                                Peringkat (Angka)
                            </Label>
                            <Input
                                id="rank_position"
                                type="number"
                                onWheel={(e) => e.currentTarget.blur()}
                                min="1"
                                value={data.rank_position}
                                onChange={(e) =>
                                    setData('rank_position', e.target.value)
                                }
                                placeholder="1"
                            />
                            <InputError message={errors.rank_position} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prize_money">
                                Uang Pembinaan (Rp)
                            </Label>
                            <Input
                                id="prize_money"
                                type="number"
                                onWheel={(e) => e.currentTarget.blur()}
                                min="0"
                                value={data.prize_money}
                                onChange={(e) =>
                                    setData('prize_money', e.target.value)
                                }
                                placeholder="0"
                            />
                            <InputError message={errors.prize_money} />
                        </div>
                        <div className="flex flex-col justify-end space-y-2 pb-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="certificate"
                                    checked={data.certificate}
                                    onCheckedChange={(checked) =>
                                        setData('certificate', checked)
                                    }
                                />
                                <Label
                                    htmlFor="certificate"
                                    className="cursor-pointer font-medium"
                                >
                                    Termasuk Sertifikat
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prize_descriptions">
                            Deskripsi Hadiah Tambahan (Opsional)
                        </Label>
                        <Textarea
                            id="prize_descriptions"
                            value={data.prize_descriptions}
                            onChange={(e) =>
                                setData('prize_descriptions', e.target.value)
                            }
                            placeholder="Contoh: Trofi Bergilir Gubernur, Beasiswa Pendidikan..."
                            rows={2}
                        />
                        <InputError message={errors.prize_descriptions} />
                    </div>

                    {mode === 'create' && (
                        <div className="space-y-3 rounded-lg border border-border/50 bg-muted/10 p-3">
                            <Label>Tambahkan piala ini ke jenjang:</Label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {eventLevels.map((level) => (
                                    <div
                                        key={level.event_level_id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`level-${level.event_level_id}`}
                                            checked={data.event_level_ids.includes(
                                                level.event_level_id,
                                            )}
                                            onCheckedChange={() =>
                                                handleLevelToggle(
                                                    level.event_level_id,
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor={`level-${level.event_level_id}`}
                                            className="cursor-pointer text-xs font-medium"
                                        >
                                            {level.level?.level_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.event_level_ids} />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" /> Simpan Piala
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
