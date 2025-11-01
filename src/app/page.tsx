import ExploreForm from "./components/ExploreForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 font-sans dark:from-zinc-950 dark:to-black">
      <main className="w-full max-w-2xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-bold tracking-tight text-black dark:text-white">
              CourseOS
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Transform any web tool into comprehensive courses and documentation
            </p>
          </div>

          <ExploreForm />

          <div className="mt-8 max-w-md text-sm text-zinc-500 dark:text-zinc-500">
            <p>
              Enter the URL of any web application and our AI agent will explore it,
              creating detailed courses and documentation automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
