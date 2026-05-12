import Link from "next/link";
import NavBar from "../components/NavBar";

const featureItems = [
  {
    title: "OCR for BHT Forms",
    description: "Extract patient and treatment details from scanned BHT documents with high accuracy.",
  },
  {
    title: "AI Clinical Summaries",
    description: "Generate concise summaries to help consultants review patient history faster.",
  },
  {
    title: "Role-Based Dashboards",
    description: "Separate workflows for Admin, Consultant, and Doctor roles.",
  },
  {
    title: "Ward Management",
    description: "Track wards, patients, and records in a structured interface.",
  },
  {
    title: "Approval Workflow",
    description: "Handle doctor registration approvals and account states in one place.",
  },
  {
    title: "Secure Access",
    description: "Token-based authentication with controlled access per user role.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Platform Features</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              IntelliScan helps Sri Lankan hospital teams digitize and review BHT data with faster, safer workflows.
            </p>
          </section>

          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureItems.map((item) => (
              <article key={item.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-400">{item.description}</p>
              </article>
            ))}
          </section>

          <section className="mt-14 text-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all"
            >
              Create an Account
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
