import { templates } from "@/lib/portfolioData";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";

const STEPS = [
  {
    step: "1",
    title: "Pick a template",
    desc: "Six distinct styles, from git-log dark mode to a warm personal blog — not five variations of the same card.",
  },
  {
    step: "2",
    title: "Fill in your details",
    desc: "One form. Every template reads from the same data, so you can switch styles without retyping anything.",
  },
  {
    step: "3",
    title: "Preview it live",
    desc: "Your real name, real projects, real links — updating on screen as you type, not after a page reload.",
  },
];

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dev Portfolio Builder
          </span>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#how-it-works" className="hidden hover:text-zinc-900 dark:hover:text-zinc-100 sm:inline">
              How it works
            </a>
            <a
              href="#templates"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Browse templates
            </a>
          </nav>
        </div>
      </header>

      <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40 dark:opacity-25"
          style={{
            background:
              "radial-gradient(600px circle at 12% 0%, #34d399 0%, transparent 60%), radial-gradient(520px circle at 88% 12%, #6366f1 0%, transparent 55%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-5xl px-6 pb-10 pt-14 text-center sm:pt-2">
          <span className="inline-block rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            Built for Developers
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            Your portfolio, without the design decisions.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Pick a template that actually looks like you built it, fill in your details once,
            and watch it come alive — live, in your browser.
          </p>
        </div>

        <div className="relative mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 px-6 pb-20 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="text-center sm:text-left">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white sm:mx-0 dark:bg-zinc-100 dark:text-zinc-900">
                {item.step}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 pb-24">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Choose your template
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplatePreviewCard key={template.id} template={template} />
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 dark:border-zinc-900 dark:text-zinc-600">
        Made with care for developers who&rsquo;d rather ship than fight a website builder.
      </footer>
    </div>
  );
}
