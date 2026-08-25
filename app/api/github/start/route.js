// Step one of connecting GitHub: send the customer to GitHub to approve, with
// a one-time `state` value we can recognise when they come back.
//
// The state is stored in an httpOnly cookie and compared on return. Without
// it, anyone could hand a victim a crafted callback URL and have their browser
// finish an OAuth flow against an attacker's code, which is the standard OAuth
// CSRF. It is a random value, not derived from anything, so it cannot be
// guessed from the request.

import { cookies } from "next/headers";
import { GITHUB_STATE_COOKIE, RETURN_COOKIE, cookieOptions } from "@/lib/githubSession";

export async function GET(request) {
  const url = new URL(request.url);

  // Only ever a path on this site. Taking the raw parameter would turn this
  // route into an open redirect: a link to our own domain that lands the
  // visitor on somebody else's.
  const requested = url.searchParams.get("returnTo") || "/";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  // A browser is sent here, not a fetch, so answering with JSON leaves the
  // customer staring at a raw error document with no way back. Send them
  // where they came from and let the editor say what is wrong.
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    const back = new URL(returnTo, url.origin);
    back.searchParams.set("githubError", "unconfigured");
    return Response.redirect(back.toString(), 302);
  }

  const state = crypto.randomUUID();

  const jar = await cookies();
  jar.set(GITHUB_STATE_COOKIE, state, cookieOptions(600));
  jar.set(RETURN_COOKIE, returnTo, cookieOptions(600));

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", `${url.origin}/api/github/callback`);
  // The narrowest scope that can still create a repository. `repo` would also
  // work and would additionally hand us read and write access to every private
  // repository the person owns, which is not ours to ask for.
  authorize.searchParams.set("scope", "public_repo");
  authorize.searchParams.set("state", state);

  return Response.redirect(authorize.toString(), 302);
}
