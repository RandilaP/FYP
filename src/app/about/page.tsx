import Link from "next/link";
import NavBar from "../components/NavBar";

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <section className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">About IntelliScan</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              IntelliScan is a BHT management platform focused on improving clinical documentation workflows in Sri Lankan hospitals.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-6 mb-10">
            <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Our Mission</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Reduce manual record burden and help clinicians spend more time on patient care.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Who It Helps</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Administrators, consultants, and doctors collaborating across ward-level operations.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Core Value</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Practical AI tools that enhance clarity, speed, and confidence in medical record handling.
              </p>
            </article>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Need Access?</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Create an account as a doctor or consultant and begin managing BHT records in one secure workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/auth/sign-up" className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                Sign Up
              </Link>
              <Link href="/auth/login" className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Sign In
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
