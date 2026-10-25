import { useForm } from '@inertiajs/react';
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
import InputError from '@/components/input-error';
import { Save } from 'lucide-react';

interface ChampionCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventPublicId: string;
    userRole: string;
    masterCategories: any[];
}

export function ChampionCategoryDialog({
    open,
    onOpenChange,
    eventPublicId,
    userRole,
    masterCategories,
}: ChampionCategoryDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        champion_category_name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${eventPublicId}/champions/categories`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) reset();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Buat Kategori Juara Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="champion_category_name"
                            requirement="required"
                        >
                            Nama Kategori
                        </Label>
                        <Input
                            id="champion_category_name"
                            value={data.champion_category_name}
                            onChange={(e) =>
                                setData(
                                    'champion_category_name',
                                    e.target.value,
                                )
                            }
                            placeholder="Contoh: Juara Utama, Juara Harapan..."
                            list="master_champion_categories"
                            autoFocus
                        />
                        <datalist id="master_champion_categories">
                            {masterCategories.map((mc: any) => (
                                <option
                                    key={mc.champion_category_id}
                                    value={mc.champion_category_name}
                                />
                            ))}
                        </datalist>
                        <p className="text-[10px] text-muted-foreground">
                            Pilih dari daftar atau ketik baru untuk membuat
                            kategori.
                        </p>
                        <InputError message={errors.champion_category_name} />
                    </div>

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
                            <Save className="h-4 w-4" /> Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
