// Step three, and the whole point of the exercise: create a repository in the
// customer's own GitHub account containing the template AND their content, in
// one commit, and hand back the two links they need.
//
// Nothing is written to our database on this path. The data arrives from the
// browser, goes into their repository, and is not kept here: once their repo
// exists we have no reason to hold a copy of somebody's employment history,
// and the safest place for personal data is a system that never stores it.

import { cookies } from "next/headers";
import { createRepoWithFallback, commitFiles, getViewer, repoNameFor } from "@/lib/github";
import { DATA_FILE, buildDataFile, readTemplateFiles, supportsHandoff } from "@/lib/templateFiles";
import { sanitizePortfolioData } from "@/lib/portfolioData";
import { GITHUB_TOKEN_COOKIE } from "@/lib/githubSession";

export async function POST(request) {
  // Checked before anything else, so a server missing its GitHub credentials
  // says so in place rather than sending the customer off on an OAuth round
  // trip that cannot possibly complete.
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return Response.json(
      { error: "Deploying isn't set up on this server yet. Please try again later." },
      { status: 503 }
    );
  }

  const jar = await cookies();
  const token = jar.get(GITHUB_TOKEN_COOKIE)?.value;

  // Not an error state: it is the normal first pass, and the editor answers it
  // by sending the customer through the connect flow.
  if (!token) {
    return Response.json({ needsAuth: true }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const { template, data } = body || {};

  // Validated here and not merely in the browser, because a request body is
  // never evidence of anything.
  if (typeof template !== "string" || !supportsHandoff(template)) {
    return Response.json({ error: "That template can't be deployed this way yet." }, { status: 400 });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return Response.json({ error: "Missing portfolio data." }, { status: 400 });
  }

  const clean = sanitizePortfolioData(data);

  try {
    const viewer = await getViewer(token);

    const repo = await createRepoWithFallback(
      token,
      repoNameFor(clean.name),
      "My portfolio site."
    );

    const files = await readTemplateFiles(template);
    files.push({ path: DATA_FILE, content: buildDataFile(clean) });

    await commitFiles(
      token,
      viewer.login,
      repo.name,
      repo.default_branch,
      files,
      "Add my portfolio"
    );

    // Import, not clone. Vercel's /new/clone is the deploy-button flow for
    // copying somebody else's template into a repo you do not yet have, so
    // pointing it at a repository the customer already owns made it bounce
    // them through an extra "import this instead" step. /new/import is the
    // flow for a repo that exists, and pre-filling the framework and project
    // name means the screen it lands on is already filled in.
    //
    // No env vars in the link, because the site has nothing to configure:
    // there are no services behind it.
    const deployUrl = new URL("https://vercel.com/new/import");
    deployUrl.searchParams.set("s", repo.html_url);
    deployUrl.searchParams.set("framework", "nextjs");
    deployUrl.searchParams.set("project-name", repo.name);

    return Response.json({
      repoUrl: repo.html_url,
      editUrl: `${repo.html_url}/blob/${repo.default_branch}/${DATA_FILE}`,
      deployUrl: deployUrl.toString(),
      owner: viewer.login,
      repo: repo.name,
      // The editor watches this branch's commit status to find out whether
      // Vercel's build actually succeeded.
      branch: repo.default_branch,
    });
  } catch (error) {
    // The message is GitHub's own and may quote what we sent, so it is not
    // returned to the browser. Only a status is worth distinguishing.
    if (error.status === 401 || error.status === 403) {
      jar.delete(GITHUB_TOKEN_COOKIE);
      return Response.json({ needsAuth: true }, { status: 401 });
    }
    // GitHub's own message for these endpoints is a fixed API string such as
    // "Git Repository is empty." and never echoes the payload we sent, so it
    // is safe to record and it is the only thing that makes a failure here
    // diagnosable at all. Nothing from the customer's data is logged.
    console.error(
      "github handoff failed:",
      error.status ?? "no-status",
      error.code ?? error.message ?? "unknown"
    );
    return Response.json(
      { error: "Couldn't create the repository. Please try again." },
      { status: 502 }
    );
  } finally {
    // The token existed to do one job, which is now either done or failed.
    jar.delete(GITHUB_TOKEN_COOKIE);
  }
}
