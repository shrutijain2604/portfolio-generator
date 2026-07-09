import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/portfolioData";
import PortfolioEditor from "@/components/PortfolioEditor";

export default async function EditorPage({ params }) {
  const { template: templateId } = await params;
  const template = getTemplate(templateId);

  if (!template) notFound();

  if (template.locked) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold">{template.name} is coming next</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          This template isn&apos;t built yet. The Changelog template is ready to try.
        </p>
        <Link
          href="/"
          className="mt-2 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← Back to templates
        </Link>
      </div>
    );
  }

  return <PortfolioEditor template={template} />;
}
