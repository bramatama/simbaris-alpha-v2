import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes'; // Menggabungkan import route
import { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    name: string;
    sidebarOpen: boolean;
    isMobileDevice: boolean;
};

export default function Welcome() {
    // const { auth, name } = usePage<PageProps>().props;
    const { props } = usePage();
    const appName = props.name;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col bg-primary-50">
                {/* Main Content Area */}
                <main className="flex grow flex-col items-center px-6 pt-24 lg:p-8">
                    {/* HERO SECTION */}
                    <section className="flex w-full max-w-4xl flex-col items-center justify-center py-20 text-center lg:py-32">
                        <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl">
                            Welcome to{' '}
                            <span className="text-red-600 dark:text-red-500">
                                {appName}
                            </span>
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
                    </section>

                    {/* ABOUT SECTION */}
                    <section className="mt-8 w-full max-w-6xl border-t border-gray-200 py-16 dark:border-gray-800/50">
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
                    </section>
                </main>
            </div>
        </>
    );
}
