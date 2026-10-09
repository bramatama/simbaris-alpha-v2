import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Auth } from '@/types';
import LandingPageLayout from '@/layouts/landing-page-layout';
import { Calendar, MapPin, Users } from 'lucide-react';

type PageProps = {
    auth: Auth;
    name: string;
};

export default function Welcome() {
    const { props } = usePage<PageProps>();
    const appName = props.name;

    return (
        <LandingPageLayout>
            <Head title="Welcome" />

            {/* Pembungkus utama disederhanakan agar section bisa menyentuh ujung layar */}
            <main className="flex w-full flex-col">
                {/* 1. HERO SECTION (Halaman 1) */}
                <section
                    id="home"
                    className="flex min-h-screen w-full flex-col items-center justify-center px-6 pt-16"
                >
                    <div className="flex w-full max-w-4xl flex-col items-center text-center">
                        <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl">
                            Welcome to <span>{appName}</span>
                        </h1>
                        <p className="mb-10 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-400">
                            A modern, fast, and secure platform to help you
                            build and scale your ideas. Start your journey with
                            us today and experience the difference.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            {props.auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-red-600 px-8 py-3 font-semibold text-white shadow transition-colors hover:bg-red-500"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg bg-red-600 px-8 py-3 font-semibold text-white shadow transition-colors hover:bg-red-500"
                                    >
                                        Get Started
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-lg border-2 border-gray-200 bg-transparent px-8 py-3 font-semibold transition-colors hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-[#1a1a1a]"
                                    >
                                        Create an Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. ABOUT SECTION (Halaman 2) */}
                <section
                    id="about"
                    className="flex min-h-screen w-full rounded-4xl flex-col items-center justify-center border bg-muted/30 px-6 py-16 dark:border-gray-800/50"
                >
                    <div className="w-full max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                About Us
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
                                We provide the best tools to streamline your
                                workflow. Here is what makes our platform stand
                                out from the rest.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {/* Feature Card 1 */}
                            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-transform duration-300 hover:-translate-y-1 dark:bg-[#111111] dark:ring-gray-800">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <svg
                                        className="h-6 w-6 text-red-600 dark:text-red-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        ></path>
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold">
                                    Lightning Fast
                                </h3>
                                <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                    Built on modern architecture with Inertia.js
                                    and React, delivering a single-page app
                                    experience without the complexity.
                                </p>
                            </div>

                            {/* Feature Card 2 */}
                            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-transform duration-300 hover:-translate-y-1 dark:bg-[#111111] dark:ring-gray-800">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <svg
                                        className="h-6 w-6 text-green-600 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        ></path>
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold">
                                    Highly Secure
                                </h3>
                                <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                    Your data is protected with
                                    industry-standard encryption and robust
                                    authentication mechanisms out of the box.
                                </p>
                            </div>

                            {/* Feature Card 3 */}
                            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-transform duration-300 hover:-translate-y-1 dark:bg-[#111111] dark:ring-gray-800">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <svg
                                        className="h-6 w-6 text-purple-600 dark:text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        ></path>
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold">
                                    User Centric
                                </h3>
                                <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                    Designed with user experience in mind. Clean
                                    interfaces, intuitive navigation, and
                                    accessible components.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. EVENTS SECTION (Halaman 3) */}
                <section
                    id="events"
                    className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 dark:border-gray-800/50"
                >
                    <div className="w-full max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Upcoming Events
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
                                Bergabunglah dan ikuti kompetisi marching drill
                                terbaik yang sedang berlangsung maupun yang akan
                                segera hadir.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                            {/* Dummy Event 1 */}
                            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-[#111111] dark:ring-gray-800">
                                <div>
                                    <h3 className="mb-2 text-2xl font-bold">
                                        Grand Championship 2026
                                    </h3>
                                    <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> 15
                                            - 20 November 2026
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />{' '}
                                            Balikpapan Sport Center
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" /> 50+
                                            Tim Terdaftar
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={login()}
                                    className="mt-6 inline-flex w-fit items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
                                >
                                    Daftar Sekarang
                                </Link>
                            </div>

                            {/* Dummy Event 2 */}
                            <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-[#111111] dark:ring-gray-800">
                                <div>
                                    <h3 className="mb-2 text-2xl font-bold">
                                        Regional Marching Drill Festival
                                    </h3>
                                    <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> 12
                                            Desember 2026
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />{' '}
                                            Kaltim Arena
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />{' '}
                                            Registrasi Segera Dibuka
                                        </div>
                                    </div>
                                </div>
                                <button
                                    disabled
                                    className="mt-6 inline-flex w-fit items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400 dark:border-gray-800 dark:bg-[#1a1a1a]"
                                >
                                    Segera Hadir
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </LandingPageLayout>
    );
}
