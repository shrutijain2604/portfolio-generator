// Step two: GitHub sends the customer back here with a code. Swap it for a
// token, park the token in an httpOnly cookie, and put them back on the page
// they left so the editor can finish the deploy.
//
// The token is never put in the redirect URL and never returned in a body.
// A URL is written to browser history, shared in screenshots, and logged by
// every proxy in between, which makes it the worst possible place for a
// credential.

import { cookies } from "next/headers";
import { exchangeCodeForToken } from "@/lib/github";
import {
  GITHUB_STATE_COOKIE,
  GITHUB_TOKEN_COOKIE,
  RETURN_COOKIE,
  TOKEN_TTL_SECONDS,
  cookieOptions,
} from "@/lib/githubSession";

function backTo(origin, path, error) {
  const url = new URL(path, origin);
  if (error) url.searchParams.set("githubError", error);
  else url.searchParams.set("github", "connected");
  return Response.redirect(url.toString(), 302);
}

export async function GET(request) {
  const url = new URL(request.url);
  const jar = await cookies();

  const returnTo = jar.get(RETURN_COOKIE)?.value || "/";
  const expectedState = jar.get(GITHUB_STATE_COOKIE)?.value;

  jar.delete(GITHUB_STATE_COOKIE);
  jar.delete(RETURN_COOKIE);

  // The customer pressed "Cancel" on GitHub's approval screen. Not an error
  // worth a scary message, just a decision.
  if (url.searchParams.get("error")) {
    return backTo(url.origin, returnTo, "cancelled");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Both halves must be present and equal. A missing cookie means the flow did
  // not start here.
  if (!code || !state || !expectedState || state !== expectedState) {
    return backTo(url.origin, returnTo, "state");
  }

  try {
    const token = await exchangeCodeForToken(code);
    jar.set(GITHUB_TOKEN_COOKIE, token, cookieOptions(TOKEN_TTL_SECONDS));
  } catch {
    // The thrown error may quote GitHub's response, so it is not forwarded.
    return backTo(url.origin, returnTo, "exchange");
  }

  return backTo(url.origin, returnTo);
}
