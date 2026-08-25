import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes'; // Menggabungkan import route

type WelcomePageProps = {
    auth: {
        user: Record<string, unknown> | null;
    };
};

export default function Welcome() {
    const { auth } = usePage<WelcomePageProps>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">

                {/* Main Content Area */}
                <main className="grow flex flex-col items-center pt-24 px-6 lg:p-8">
                    
                    {/* HERO SECTION */}
                    <section className="w-full max-w-4xl text-center py-20 lg:py-32 flex flex-col items-center justify-center">
                        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl mb-6">
                            Welcome to <span className="text-blue-600 dark:text-blue-500">Your App</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
                            A modern, fast, and secure platform to help you build and scale your ideas. Start your journey with us today and experience the difference.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {auth.user ? (
                                <Link 
                                    href={dashboard()} 
                                    className="rounded-lg bg-blue-600 px-8 py-3 text-white font-semibold shadow hover:bg-blue-500 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        href={login()} 
                                        className="rounded-lg bg-blue-600 px-8 py-3 text-white font-semibold shadow hover:bg-blue-500 transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                    <Link 
                                        href={register()} 
                                        className="rounded-lg bg-transparent border-2 border-gray-200 dark:border-gray-800 px-8 py-3 font-semibold hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                                    >
                                        Create an Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </section>

                    {/* ABOUT SECTION */}
                    <section className="w-full max-w-6xl py-16 mt-8 border-t border-gray-200 dark:border-gray-800/50">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About Us</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                We provide the best tools to streamline your workflow. Here is what makes our platform stand out from the rest.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature Card 1 */}
                            <div className="rounded-2xl bg-white dark:bg-[#111111] p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:-translate-y-1 transition-transform duration-300">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Built on modern architecture with Inertia.js and React, delivering a single-page app experience without the complexity.
                                </p>
                            </div>

                            {/* Feature Card 2 */}
                            <div className="rounded-2xl bg-white dark:bg-[#111111] p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:-translate-y-1 transition-transform duration-300">
                                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Highly Secure</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Your data is protected with industry-standard encryption and robust authentication mechanisms out of the box.
                                </p>
                            </div>

                            {/* Feature Card 3 */}
                            <div className="rounded-2xl bg-white dark:bg-[#111111] p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:-translate-y-1 transition-transform duration-300">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">User Centric</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Designed with user experience in mind. Clean interfaces, intuitive navigation, and accessible components.
                                </p>
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </>
    );
}
