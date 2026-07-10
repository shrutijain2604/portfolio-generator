// Landing point for Vercel's redirect-url callback after the customer
// completes the clone+deploy flow. portfolioId is our own param, baked into
// the redirect-url we constructed before sending them to Vercel; everything
// else on the query string is appended by Vercel itself (see
// https://vercel.com/docs/deploy-button/callback).
import Link from "next/link";
import { publishPortfolio } from "@/lib/portfolios";

export const dynamic = "force-dynamic";

export default async function DeployedPage({ searchParams }) {
  const params = await searchParams;
  const portfolioId = params.portfolioId;
  const rawDeploymentUrl = params["deployment-url"];
  const projectDashboardUrl = params["project-dashboard-url"];

  const deploymentUrl = rawDeploymentUrl
    ? rawDeploymentUrl.startsWith("http")
      ? rawDeploymentUrl
      : `https://${rawDeploymentUrl}`
    : null;

  const result =
    portfolioId && rawDeploymentUrl
      ? await publishPortfolio(portfolioId, rawDeploymentUrl)
      : { ok: false, error: "Missing deployment info in the redirect from Vercel." };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      {result.ok ? (
        <>
          <span className="text-4xl">🎉</span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your portfolio is live
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            It&rsquo;s deployed under your own Vercel account — your repo, your dashboard, your domain to configure
            whenever you want.
          </p>
          <a
            href={deploymentUrl}
            className="mt-6 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            View your portfolio
          </a>
          {projectDashboardUrl && (
            <a
              href={projectDashboardUrl}
              className="mt-3 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Open project in Vercel →
            </a>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{result.error}</p>
          <Link
            href="/"
            className="mt-6 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to templates
          </Link>
        </>
      )}
    </div>
  );
}
