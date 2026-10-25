import { Head, Link, useForm } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ChampionsCreate({
    event,
    eventLevels,
    masterChampionCategories,
}: any) {
    const { data, setData, post, processing, errors } = useForm({
        champion_category_id: '',
        champion_category_name_ui: '', // Menyimpan teks UI kategori
        event_level_ids: [] as number[],
        champions: [
            {
                champion_id: '',
                champion_name_ui: '', // Menyimpan teks UI piala per baris
                rank_position: 1,
                prize_money: '',
                certificate: false,
                prize_descriptions: '',
            },
        ],
    });

    const selectedCategory = masterChampionCategories.find(
        (mc: any) =>
            mc.champion_category_id.toString() === data.champion_category_id,
    );
    const availableChampions = selectedCategory?.champions || [];

    const [categorySearch, setCategorySearch] = useState('');
    const [champSearch, setChampSearch] = useState<Record<number, string>>({});

    const filteredCategories = masterChampionCategories.filter((mc: any) =>
        mc.champion_category_name
            .toLowerCase()
            .includes(categorySearch.toLowerCase()),
    );

    const getFilteredChampions = (index: number) => {
        const query = champSearch[index] || '';
        return availableChampions.filter((c: any) =>
            c.champion_name.toLowerCase().includes(query.toLowerCase()),
        );
    };

    const isLevelDisabled = (level: any) => {
        if (!data.champion_category_id) return true;

        const selectedCategoryId = Number(data.champion_category_id);
        const champions = level.event_champions || level.eventChampions || [];

        return champions.some(
            (eventChampion: any) =>
                Number(eventChampion.champion?.champion_category_id) ===
                selectedCategoryId,
        );
    };

    const isChampionSelected = (championId: string, currentIndex: number) => {
        return data.champions.some(
            (champ, idx) =>
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

    const handleLevelToggle = (levelId: number) => {
        const current = data.event_level_ids;
        setData(
            'event_level_ids',
            current.includes(levelId)
                ? current.filter((id) => id !== levelId)
                : [...current, levelId],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/committee/events/${event.public_id}/champions`);
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, 'committee')}
        >
            <Head title={`Tambah Penghargaan - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                    <div>
                        <Link
                            href={`/committee/events/${event.public_id}/champions`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Batal &
                            Kembali
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Susun Daftar Penghargaan Baru
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tentukan kategori, jenjang, dan susun rincian piala.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12"
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
                                    disabled={!data.champion_category_id}
                                >
                                    <Plus className="h-4 w-4" /> Tambah Baris
                                    Piala
                                </Button>
                            )}
                        </div>

                        {!data.champion_category_id ? (
                            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                Silakan pilih <strong>Kategori Juara</strong> di
                                sebelah kanan terlebih dahulu untuk menyusun
                                piala.
                            </div>
                        ) : (
                            <>
                                <InputError
                                    message={errors.champions as string}
                                />

                                {data.champions.map((champ, index) => (
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
                                                        removeChampionField(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />{' '}
                                                    Hapus
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label requirement="required">
                                                        Nama Piala (Master)
                                                    </Label>
                                                    <Combobox
                                                        value={
                                                            champ.champion_name_ui
                                                        }
                                                        onValueChange={(
                                                            val: any,
                                                        ) => {
                                                            const selectedChamp =
                                                                availableChampions.find(
                                                                    (c: any) =>
                                                                        c.champion_name ===
                                                                        val,
                                                                );
                                                            const newChampions =
                                                                [
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
                                                            champSearch[index]
                                                        }
                                                        onInputValueChange={(
                                                            val: string,
                                                        ) =>
                                                            setChampSearch(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [index]:
                                                                        val,
                                                                }),
                                                            )
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
                                                                {getFilteredChampions(
                                                                    index,
                                                                ).length ===
                                                                    0 && (
                                                                    <ComboboxEmpty>
                                                                        Belum
                                                                        ada
                                                                        master
                                                                        piala.
                                                                    </ComboboxEmpty>
                                                                )}
                                                                <ComboboxGroup>
                                                                    {getFilteredChampions(
                                                                        index,
                                                                    ).map(
                                                                        (
                                                                            c: any,
                                                                        ) => {
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
                                                    {errors[
                                                        `champions.${index}.champion_id`
                                                    ] && (
                                                        <span className="text-xs text-red-500">
                                                            {
                                                                errors[
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
                                                        value={
                                                            champ.rank_position
                                                        }
                                                        onChange={(e) =>
                                                            updateChampion(
                                                                index,
                                                                'rank_position',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="1"
                                                    />
                                                    {errors[
                                                        `champions.${index}.rank_position`
                                                    ] && (
                                                        <span className="text-xs text-red-500">
                                                            {
                                                                errors[
                                                                    `champions.${index}.rank_position`
                                                                ]
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Uang Pembinaan (Rp)
                                                    </Label>
                                                    <Input
                                                        inputMode="numeric"
                                                        min="0"
                                                        value={
                                                            champ.prize_money
                                                        }
                                                        onChange={(e) =>
                                                            updateChampion(
                                                                index,
                                                                'prize_money',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="0"
                                                    />
                                                    {errors[
                                                        `champions.${index}.prize_money`
                                                    ] && (
                                                        <span className="text-xs text-red-500">
                                                            {
                                                                errors[
                                                                    `champions.${index}.prize_money`
                                                                ]
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-end space-y-2 pb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={
                                                                champ.certificate
                                                            }
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
                                                        Deskripsi Tambahan
                                                        Hadiah
                                                    </Label>
                                                    <Textarea
                                                        rows={2}
                                                        value={
                                                            champ.prize_descriptions
                                                        }
                                                        onChange={(e) =>
                                                            updateChampion(
                                                                index,
                                                                'prize_descriptions',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Cth: Beasiswa Pendidikan"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {data.champions.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addChampionField}
                                        className="mt-2 w-full gap-2 border-2 border-dashed bg-transparent py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Plus className="h-5 w-5" /> Tambah
                                        Baris Piala Berikutnya
                                    </Button>
                                )}
                            </>
                        )}

                        <div className="mt-6 flex flex-col gap-3 border-t border-border/50 pt-6 lg:hidden">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full gap-2"
                            >
                                <Save className="h-4 w-4" /> Simpan Semua
                                Penghargaan
                            </Button>
                            <Link
                                href={`/committee/events/${event.public_id}/champions`}
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

                    <div className="top-6 order-2 flex flex-col space-y-4 lg:sticky lg:order-1 lg:col-span-4">
                        <h3 className="text-lg font-bold">Konfigurasi Umum</h3>
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="space-y-5 p-5">
                                {/* Kategori Master Combobox */}
                                <div className="space-y-2">
                                    <Label requirement="required">
                                        Kategori Juara
                                    </Label>
                                    <Combobox
                                        value={data.champion_category_name_ui}
                                        onValueChange={(val: any) => {
                                            const selectedCat =
                                                masterChampionCategories.find(
                                                    (mc: any) =>
                                                        mc.champion_category_name ===
                                                        val,
                                                );
                                            setData((prevData) => ({
                                                ...prevData,
                                                champion_category_name_ui:
                                                    val ?? '',
                                                champion_category_id:
                                                    selectedCat
                                                        ? selectedCat.champion_category_id.toString()
                                                        : '',
                                                event_level_ids: [],
                                                champions: [
                                                    {
                                                        champion_id: '',
                                                        champion_name_ui: '',
                                                        rank_position: 1,
                                                        prize_money: '',
                                                        certificate: false,
                                                        prize_descriptions: '',
                                                    },
                                                ],
                                            }));
                                        }}
                                        inputValue={categorySearch}
                                        onInputValueChange={(val: string) =>
                                            setCategorySearch(val)
                                        }
                                    >
                                        <ComboboxInput
                                            placeholder="Cari kategori piala..."
                                            showClear={
                                                !!data.champion_category_name_ui
                                            }
                                        />
                                        <ComboboxContent>
                                            <ComboboxList>
                                                {filteredCategories.length ===
                                                    0 && (
                                                    <ComboboxEmpty>
                                                        Kategori tidak
                                                        ditemukan.
                                                    </ComboboxEmpty>
                                                )}
                                                <ComboboxGroup>
                                                    {filteredCategories.map(
                                                        (mc: any) => (
                                                            <ComboboxItem
                                                                key={
                                                                    mc.champion_category_id
                                                                }
                                                                value={
                                                                    mc.champion_category_name
                                                                }
                                                                className="rounded-none px-4 py-2 text-xs"
                                                            >
                                                                {
                                                                    mc.champion_category_name
                                                                }
                                                            </ComboboxItem>
                                                        ),
                                                    )}
                                                </ComboboxGroup>
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <InputError
                                        message={errors.champion_category_id}
                                    />
                                </div>

                                {/* Checkbox Jenjang */}
                                <div className="space-y-3 rounded-lg border border-border/50 bg-muted/10 p-4">
                                    <Label requirement="required">
                                        Terapkan Pada Jenjang
                                    </Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {!data.champion_category_id && (
                                            <p className="w-full py-2 text-center text-xs text-muted-foreground italic">
                                                Pilih kategori induk terlebih
                                                dahulu.
                                            </p>
                                        )}
                                        {eventLevels.map((level: any) => {
                                            const disabled =
                                                isLevelDisabled(level);
                                            return (
                                                <div
                                                    key={level.event_level_id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id={`level-${level.event_level_id}`}
                                                            checked={data.event_level_ids.includes(
                                                                level.event_level_id,
                                                            )}
                                                            disabled={disabled}
                                                            onCheckedChange={() =>
                                                                handleLevelToggle(
                                                                    level.event_level_id,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`level-${level.event_level_id}`}
                                                            className={`text-sm font-medium ${disabled ? 'cursor-not-allowed text-muted-foreground line-through' : 'cursor-pointer'}`}
                                                        >
                                                            {
                                                                level.level
                                                                    ?.level_name
                                                            }
                                                        </label>
                                                    </div>
                                                    {disabled &&
                                                        data.champion_category_id && (
                                                            <span className="text-[10px] font-bold text-destructive italic">
                                                                (Sudah Ada)
                                                            </span>
                                                        )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={errors.event_level_ids}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* DESKTOP ACTION BUTTONS */}
                        <div className="hidden flex-col gap-3 lg:flex">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full gap-2"
                            >
                                <Save className="h-4 w-4" /> Simpan Semua
                                Penghargaan
                            </Button>
                            <Link
                                href={`/committee/events/${event.public_id}/champions`}
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
