import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 font-semibold text-gray-800">
            <div className="scale-100 p-6 bg-white bg-opacity-50 from-gray-700/50 via-transparent rounded-lg shadow-2xl shadow-gray-500/20 motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500 w-full sm:max-w-md mt-6 px-6 py-4 overflow-hidden sm:rounded-lg">
                <div>
                    <Link href="/">
                        <ApplicationLogo className="w-20 h-20 fill-current mx-auto" />
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
