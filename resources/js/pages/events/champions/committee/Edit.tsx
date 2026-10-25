import { Head, Link, useForm } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxGroup,
} from '@/components/ui/combobox';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function ChampionsEdit({
    event,
    eventLevel,
    championCategory,
    existingChampions,
}: any) {
    const availableChampions = championCategory.champions || [];

    const initialChampions =
        existingChampions.length > 0
            ? existingChampions.map((ec: any) => ({
                  champion_id: ec.champion?.champion_id?.toString() || '',
                  champion_name_ui: ec.champion?.champion_name || '', // Menyimpan teks UI piala per baris
                  rank_position: ec.rank_position,
                  prize_money: ec.prize_money || '',
                  certificate: !!ec.certificate,
                  prize_descriptions: ec.prize_descriptions || '',
              }))
            : [
                  {
                      champion_id: '',
                      champion_name_ui: '',
                      rank_position: 1,
                      prize_money: '',
                      certificate: false,
                      prize_descriptions: '',
                  },
              ];

    const { data, setData, put, processing, errors } = useForm({
        champions: initialChampions,
    });
    const championErrors = errors as Record<string, string | undefined>;

    const [champSearch, setChampSearch] = useState<Record<number, string>>({}); // Karena piala ada banyak baris

    const getFilteredChampions = (index: number) => {
        const query = champSearch[index] || '';
        return availableChampions.filter((c: any) =>
            c.champion_name.toLowerCase().includes(query.toLowerCase()),
        );
    };

    const isChampionSelected = (championId: string, currentIndex: number) => {
        return data.champions.some(
            (champ: any, idx: number) =>
                idx !== currentIndex && champ.champion_id === championId,
        );
    };

    const addChampionField = () => {
        setData('champions', [
            ...data.champions,
            {
                champion_id: '',
                champion_name_ui: '',
                rank_position: data.champions.length + 1,
                prize_money: '',
                certificate: false,
                prize_descriptions: '',
            },
        ]);
    };

    const removeChampionField = (index: number) => {
        const newChampions = [...data.champions];
        newChampions.splice(index, 1);
        setData('champions', newChampions);
    };

    const updateChampion = (index: number, field: string, value: any) => {
        const newChampions: any = [...data.champions];
        newChampions[index][field] = value;
        setData('champions', newChampions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/committee/events/${event.public_id}/levels/${eventLevel.event_level_id}/champions/categories/${championCategory.champion_category_id}`,
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, 'committee')}
        >
            <Head title={`Edit Penghargaan - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                    <div>
                        <Link
                            href={`/committee/events/${event.public_id}/champions?level_id=${eventLevel.event_level_id}`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Batal &
                            Kembali
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Edit Susunan Kategori
                        </h1>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
                >
                    <div className="order-1 space-y-4 lg:order-2 lg:col-span-8">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Rincian Piala</h3>

                            {data.champions.length === 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addChampionField}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Tambah Baris
                                    Piala
                                </Button>
                            )}
                        </div>

                        <InputError message={errors.champions as string} />

                        {data.champions.map((champ: any, index: number) => (
                            <Card
                                key={index}
                                className="relative overflow-hidden border-border/60 shadow-sm"
                            >
                                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary"></div>
                                <CardContent className="p-5 pl-6">
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <h4 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                            Piala #{index + 1}
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-destructive"
                                            onClick={() =>
                                                removeChampionField(index)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" /> Hapus
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label requirement="required">
                                                Nama Piala (Master)
                                            </Label>
                                            <Combobox
                                                value={champ.champion_name_ui}
                                                onValueChange={(val: any) => {
                                                    const selectedChamp =
                                                        availableChampions.find(
                                                            (c: any) =>
                                                                c.champion_name ===
                                                                val,
                                                        );
                                                    const newChampions = [
                                                        ...data.champions,
                                                    ];
                                                    newChampions[
                                                        index
                                                    ].champion_name_ui =
                                                        val ?? '';
                                                    newChampions[
                                                        index
                                                    ].champion_id =
                                                        selectedChamp
                                                            ? selectedChamp.champion_id.toString()
                                                            : '';
                                                    setData(
                                                        'champions',
                                                        newChampions,
                                                    );
                                                }}
                                                inputValue={
                                                    champSearch[index] || ''
                                                }
                                                onInputValueChange={(
                                                    val: string,
                                                ) =>
                                                    setChampSearch((prev) => ({
                                                        ...prev,
                                                        [index]: val,
                                                    }))
                                                }
                                            >
                                                <ComboboxInput
                                                    placeholder="Cari referensi piala..."
                                                    showClear={
                                                        !!champ.champion_name_ui
                                                    }
                                                />
                                                <ComboboxContent>
                                                    <ComboboxList>
                                                        {getFilteredChampions(index).length ===
                                                            0 && (
                                                            <ComboboxEmpty>
                                                                Belum ada master
                                                                piala.
                                                            </ComboboxEmpty>
                                                        )}
                                                        <ComboboxGroup>
                                                            {getFilteredChampions(index).map(
                                                                (c: any) => {
                                                                    const champIdStr =
                                                                        c.champion_id.toString();
                                                                    const disabled =
                                                                        isChampionSelected(
                                                                            champIdStr,
                                                                            index,
                                                                        );
                                                                    return (
                                                                        <ComboboxItem
                                                                            key={
                                                                                c.champion_id
                                                                            }
                                                                            value={
                                                                                c.champion_name
                                                                            }
                                                                            disabled={
                                                                                disabled
                                                                            }
                                                                            className="rounded-none px-4 py-2 text-xs"
                                                                        >
                                                                            {
                                                                                c.champion_name
                                                                            }{' '}
                                                                            {disabled &&
                                                                                '(Sudah Dipilih)'}
                                                                        </ComboboxItem>
                                                                    );
                                                                },
                                                            )}
                                                        </ComboboxGroup>
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            {championErrors[
                                                `champions.${index}.champion_id`
                                            ] && (
                                                <span className="text-xs text-red-500">
                                                    {
                                                        championErrors[
                                                            `champions.${index}.champion_id`
                                                        ]
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label requirement="required">
                                                Peringkat (Angka)
                                            </Label>
                                            <Input
                                                inputMode="numeric"
                                                min="1"
                                                value={champ.rank_position}
                                                onChange={(e) =>
                                                    updateChampion(
                                                        index,
                                                        'rank_position',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="1"
                                            />
                                            {championErrors[
                                                `champions.${index}.rank_position`
                                            ] && (
                                                <span className="text-xs text-red-500">
                                                    {
                                                        championErrors[
                                                            `champions.${index}.rank_position`
                                                        ]
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Uang Pembinaan (Rp)</Label>
                                            <Input
                                                inputMode="numeric"
                                                min="0"
                                                value={champ.prize_money}
                                                onChange={(e) =>
                                                    updateChampion(
                                                        index,
                                                        'prize_money',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                            {championErrors[
                                                `champions.${index}.prize_money`
                                            ] && (
                                                <span className="text-xs text-red-500">
                                                    {
                                                        championErrors[
                                                            `champions.${index}.prize_money`
                                                        ]
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-end space-y-2 pb-2">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={champ.certificate}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        updateChampion(
                                                            index,
                                                            'certificate',
                                                            checked,
                                                        )
                                                    }
                                                />
                                                <Label className="cursor-pointer font-medium">
                                                    Termasuk Sertifikat
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>
                                                Deskripsi Tambahan Hadiah
                                            </Label>
                                            <Textarea
                                                rows={2}
                                                value={champ.prize_descriptions}
                                                onChange={(e) =>
                                                    updateChampion(
                                                        index,
                                                        'prize_descriptions',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Tombol Tambah di Bawah */}
                        {data.champions.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addChampionField}
                                className="mt-2 w-full gap-2 border-2 border-dashed bg-transparent py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                            >
                                <Plus className="h-5 w-5" /> Tambah Baris Piala
                                Berikutnya
                            </Button>
                        )}

                        {/* MOBILE ACTION BUTTONS */}
                        <div className="mt-6 flex flex-col gap-3 border-t border-border/50 pt-6 lg:hidden">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full gap-2"
                            >
                                <Save className="h-4 w-4" /> Simpan Perubahan
                            </Button>
                            <Link
                                href={`/committee/events/${event.public_id}/champions?level_id=${eventLevel.event_level_id}`}
                                className="w-full"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="sticky top-4 order-2 space-y-2 lg:order-1 lg:col-span-4">
                        <h3 className="text-lg font-bold">Konfigurasi Umum</h3>

                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="space-y-5 p-5">
                                <div>
                                    <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Kategori Juara
                                    </p>
                                    <p className="font-bold text-foreground">
                                        {
                                            championCategory.champion_category_name
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Untuk Jenjang
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="border-primary/50 text-primary"
                                    >
                                        {eventLevel.level.level_name}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>
                                <strong>Peringatan Sinkronisasi:</strong>{' '}
                                Menghapus baris piala dari form ini dan
                                menyimpannya akan{' '}
                                <strong>
                                    menghapus piala tersebut dari database
                                </strong>{' '}
                                pada jenjang ini secara permanen
                            </p>
                        </div>

                        {/* DESKTOP ACTION BUTTONS */}
                        <div className="hidden flex-col gap-3 lg:flex">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full gap-2"
                            >
                                <Save className="h-4 w-4" /> Simpan Perubahan
                            </Button>
                            <Link
                                href={`/committee/events/${event.public_id}/champions?level_id=${eventLevel.event_level_id}`}
                                className="w-full"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </InnerAppLayout>
    );
}
