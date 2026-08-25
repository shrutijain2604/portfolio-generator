// Everything this app does against the GitHub API, server side only.
//
// The access token never leaves this module's callers on the server: it is
// held in an httpOnly cookie the browser cannot read, and it is never returned
// in a response body and never logged. GitHub tokens are credentials to
// somebody's whole account, so the rules here are stricter than for our own
// keys: no token in an error message, no token in a thrown Error, no token in
// a console line, ever.

const API = "https://api.github.com";

// GitHub asks for an explicit API version and a User-Agent, and rejects
// requests without the latter.
function headers(token) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dev-portfolio-builder",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

// Every GitHub failure funnels through here so that no response body, which
// can echo request contents back, ever reaches a log or a client untouched.
async function request(url, token, init = {}) {
  const response = await fetch(url, { ...init, headers: headers(token) });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = typeof body?.message === "string" ? body.message : "";
    } catch {
      detail = "";
    }
    const error = new Error(detail || `GitHub request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

// Step two of the OAuth dance: swap the short-lived code for an access token.
// This is the only place the client secret is used.
export async function exchangeCodeForToken(code) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "dev-portfolio-builder",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const body = await response.json().catch(() => ({}));
  // GitHub answers 200 with an `error` field rather than a failure status, so
  // the status alone is not enough to tell whether this worked.
  if (!response.ok || body.error || !body.access_token) {
    throw new Error("Could not complete the GitHub connection.");
  }
  return body.access_token;
}

export async function getViewer(token) {
  const user = await request(`${API}/user`, token);
  return { login: user.login, name: user.name };
}

// A repository name from the customer's own name, falling back to something
// neutral rather than to an empty string. Lowercased, non-alphanumerics
// collapsed to single hyphens, because GitHub silently rewrites anything else
// and the name we report back would then not be the name that exists.
export function repoNameFor(name) {
  const slug = (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug ? `${slug}-portfolio` : "my-portfolio";
}

// `auto_init: true` matters more than it looks. Created without it, the
// repository has no commits and no default branch, and every Git Database
// endpoint then refuses to touch it: you cannot build a tree in a repository
// that has no root to hang one from. Letting GitHub write the initial commit
// gives the branch something to exist on, and the commit below replaces its
// contents wholesale, so the customer still ends up with exactly our files.
//
// A name already in use comes back as 422; rather than failing, the caller
// gets to try the next candidate, which is why the status is preserved.
export async function createRepo(token, name, description) {
  return request(`${API}/user/repos`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      private: false,
      auto_init: true,
      has_issues: false,
      has_projects: false,
      has_wiki: false,
    }),
  });
}

// Walks candidate names until one is free.
//
// The numbered candidates are tried first because "ada-portfolio-2" is a name
// somebody can read, but they cannot be the whole strategy: anyone who has
// deployed a few times already owns every one of them, and the loop then ran
// out and reported a naming collision as though the whole handoff had failed.
// The last candidate carries a random suffix instead, so there is always one
// more name available and running out stops being a way this can fail.
//
// Still bounded: an unbounded loop against somebody else's API is how you get
// rate limited.
const NUMBERED_ATTEMPTS = 5;

export async function createRepoWithFallback(token, baseName, description) {
  const candidates = [baseName];
  for (let n = 2; n <= NUMBERED_ATTEMPTS; n += 1) candidates.push(`${baseName}-${n}`);
  candidates.push(`${baseName}-${crypto.randomUUID().slice(0, 6)}`);

  for (let attempt = 0; attempt < candidates.length; attempt += 1) {
    try {
      return await createRepo(token, candidates[attempt], description);
    } catch (error) {
      const nameTaken = error.status === 422;
      if (!nameTaken || attempt === candidates.length - 1) throw error;
    }
  }

  // Unreachable: the loop above either returns or throws.
  throw new Error("Could not find an available repository name.");
}

// How many blobs are uploaded at once. Bounded because templates/retro-desktop
// ships fifty-eight images and fonts, and firing all of them at GitHub in one
// go is what secondary rate limits exist to stop.
const BLOB_CONCURRENCY = 8;

async function inBatches(items, size, worker) {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(worker))));
  }
  return results;
}

// One commit containing every file, rather than one commit per file.
//
// Text files ride along inline in the tree, which costs no extra requests. A
// binary file cannot: the tree endpoint reads inline `content` as UTF-8, so
// anything else has to be uploaded as its own blob first and referenced by the
// sha that comes back. Sending a font or a PNG inline corrupts it silently,
// which is worse than failing.
//
// The branch is read from the repository rather than assumed to be "main". It
// follows whatever default the account is configured for, and hardcoding a
// guess would break silently for anyone whose default is still "master".
export async function commitFiles(token, owner, repo, branch, files, message) {
  const base = `${API}/repos/${owner}/${repo}`;

  const ref = await request(`${base}/git/ref/heads/${branch}`, token);
  const headCommit = await request(`${base}/git/commits/${ref.object.sha}`, token);

  const binary = files.filter((file) => file.encoding === "base64");
  const uploaded = new Map(
    await inBatches(binary, BLOB_CONCURRENCY, async (file) => {
      const blob = await request(`${base}/git/blobs`, token, {
        method: "POST",
        body: JSON.stringify({ content: file.content, encoding: "base64" }),
      });
      return [file.path, blob.sha];
    })
  );

  // `base_tree` carries over anything already in the repository that we do not
  // name, which for a freshly initialised repo is just GitHub's own README.
  // Our own README.md is in the file list and overwrites it.
  const tree = await request(`${base}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: files.map((file) => {
        const entry = { path: file.path, mode: "100644", type: "blob" };
        return uploaded.has(file.path)
          ? { ...entry, sha: uploaded.get(file.path) }
          : { ...entry, content: file.content };
      }),
    }),
  });

  const commit = await request(`${base}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }),
  });

  await request(`${base}/git/refs/heads/${branch}`, token, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return commit.sha;
}
