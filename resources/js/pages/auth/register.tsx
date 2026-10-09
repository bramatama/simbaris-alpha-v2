import { Form, Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxGroup,
} from '@/components/ui/combobox';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { ArrowLeft } from 'lucide-react';

interface Region {
    id: string;
    name: string;
}

export default function Register() {
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [cities, setCities] = useState<Region[]>([]);

    const [selectedProvinceName, setSelectedProvinceName] =
        useState<string>('');
    const [selectedCityName, setSelectedCityName] = useState<string>('');

    const [provinceSearch, setProvinceSearch] = useState<string>('');
    const [citySearch, setCitySearch] = useState<string>('');

    const [isLoadingCities, setIsLoadingCities] = useState(false);

    const filteredProvinces = provinceSearch
        ? provinces.filter((p) =>
              p.name.toLowerCase().includes(provinceSearch.toLowerCase()),
          )
        : provinces;

    const filteredCities = citySearch
        ? cities.filter((c) =>
              c.name.toLowerCase().includes(citySearch.toLowerCase()),
          )
        : cities;

    useEffect(() => {
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then((res) => res.json())
            .then((data) => setProvinces(data))
            .catch((err) =>
                console.error('Gagal mengambil data provinsi:', err),
            );
    }, []);

    const handleProvinceChange = (provinceName: string | null) => {
        if (!provinceName) return;

        setSelectedProvinceName(provinceName);
        setSelectedCityName('');
        setCities([]);
        setCitySearch('');
        setIsLoadingCities(true);

        const selectedProv = provinces.find(
            (p) => p.name.toLowerCase() === provinceName.toLowerCase(),
        );

        if (selectedProv) {
            fetch(
                `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`,
            )
                .then((res) => res.json())
                .then((data) => {
                    setCities(data);
                    setIsLoadingCities(false);
                })
                .catch((err) => {
                    console.error('Gagal mengambil data kota:', err);
                    setIsLoadingCities(false);
                });
        }
    };

    return (
        <AuthLayout
            title="Buat Akun"
            description="Masukkan informasi anda untuk membuat akun"
            className="max-w-xl"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
                autoComplete="off"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Input Standar */}
                            <div className="grid gap-2">
                                <Label requirement="required" htmlFor="name">
                                    Nama Satuan
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama Satuan"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label requirement="required" htmlFor="email">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    requirement="required"
                                    htmlFor="institution"
                                >
                                    Institusi
                                </Label>
                                <Input
                                    id="institution"
                                    type="text"
                                    required
                                    tabIndex={3}
                                    name="institution"
                                    placeholder="Nama Institusi"
                                />
                                <InputError message={errors.institution} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    requirement="optional"
                                    htmlFor="contact_info"
                                >
                                    Kontak
                                </Label>
                                <Input
                                    id="contact_info"
                                    type="text"
                                    tabIndex={4}
                                    name="contact_info"
                                    placeholder="Kontak"
                                />
                                <InputError message={errors.contact_info} />
                            </div>

                            {/* COMBOBOX PROVINSI */}
                            <div className="grid gap-2">
                                <Label
                                    requirement="required"
                                    htmlFor="province"
                                >
                                    Provinsi
                                </Label>
                                <input
                                    type="hidden"
                                    name="province"
                                    value={selectedProvinceName}
                                />

                                <Combobox
                                    value={selectedProvinceName}
                                    onValueChange={handleProvinceChange}
                                    inputValue={provinceSearch}
                                    onInputValueChange={setProvinceSearch}
                                >
                                    <ComboboxInput
                                        className="w-full"
                                        placeholder="-- Pilih Provinsi --"
                                        tabIndex={5}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredProvinces.length === 0 && (
                                                <ComboboxEmpty>
                                                    Provinsi tidak ditemukan.
                                                </ComboboxEmpty>
                                            )}
                                            <ComboboxGroup>
                                                {filteredProvinces.map(
                                                    (prov) => (
                                                        <ComboboxItem
                                                            key={prov.id}
                                                            value={prov.name}
                                                        >
                                                            {prov.name}
                                                        </ComboboxItem>
                                                    ),
                                                )}
                                            </ComboboxGroup>
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError message={errors.province} />
                            </div>

                            {/* COMBOBOX KOTA */}
                            <div className="grid gap-2">
                                <Label requirement="required" htmlFor="city">
                                    Kota
                                </Label>
                                <input
                                    type="hidden"
                                    name="city"
                                    value={selectedCityName}
                                />

                                <Combobox
                                    value={selectedCityName}
                                    onValueChange={(value) =>
                                        setSelectedCityName(value ?? '')
                                    }
                                    inputValue={citySearch}
                                    onInputValueChange={setCitySearch}
                                >
                                    <ComboboxInput
                                        className="w-full"
                                        disabled={
                                            !selectedProvinceName ||
                                            isLoadingCities
                                        }
                                        placeholder={
                                            isLoadingCities
                                                ? 'Memuat kota...'
                                                : !selectedProvinceName
                                                  ? 'Pilih provinsi terlebih dahulu'
                                                  : '-- Pilih Kota --'
                                        }
                                        tabIndex={6}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredCities.length === 0 && (
                                                <ComboboxEmpty>
                                                    Kota tidak ditemukan.
                                                </ComboboxEmpty>
                                            )}
                                            <ComboboxGroup>
                                                {/* Gunakan array hasil filter */}
                                                {filteredCities.map((city) => (
                                                    <ComboboxItem
                                                        key={city.id}
                                                        value={city.name}
                                                    >
                                                        {city.name}
                                                    </ComboboxItem>
                                                ))}
                                            </ComboboxGroup>
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError message={errors.city} />
                            </div>

                            {/* Password & Konfirmasi */}
                            <div className="flex flex-col items-center justify-center gap-4 md:col-span-2">
                                <Separator />
                                <div className="grid w-full gap-2 md:w-1/2">
                                    <Label
                                        requirement="required"
                                        htmlFor="password"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={7}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid w-full gap-2 md:w-1/2">
                                    <Label
                                        requirement="required"
                                        htmlFor="password_confirmation"
                                    >
                                        Konfirmasi password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={8}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Konfirmasi password"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full md:col-span-2"
                                tabIndex={9}
                                disabled={processing}
                            >
                                {processing && (
                                    <Spinner className="mr-2 h-4 w-4" />
                                )}
                                Buat Akun
                            </Button>
                        </div>

                        {/* Navigasi Bawah */}
                        <div className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={10}>
                                Log in
                            </TextLink>
                        </div>
                        <div className="mt-2 flex justify-center">
                            <Link
                                href="/"
                                className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
