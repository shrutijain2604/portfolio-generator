// Cookie names and settings shared by the three GitHub routes.
//
// The access token lives in a cookie rather than in a server-side session
// store because there is no store to put it in and nothing here is worth
// building one for: the token is needed for the few seconds between the
// customer approving on GitHub and their repository existing, and then it is
// deleted. Nothing about the connection is meant to outlive that.

export const GITHUB_TOKEN_COOKIE = "dpb_gh_token";
export const GITHUB_STATE_COOKIE = "dpb_gh_state";
export const RETURN_COOKIE = "dpb_gh_return";

// httpOnly so no script on the page can read the token, including anything
// that ever manages to inject itself onto it. sameSite "lax" rather than
// "strict" because the cookie has to survive GitHub redirecting the browser
// back to us, which strict would drop. secure everywhere except local http,
// where the browser would otherwise refuse to store it at all.
export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

// Deliberately short. A token that can create repositories in somebody's
// account should not sit in their browser for a day because they wandered off
// mid-deploy; fifteen minutes covers the flow with room to spare, and
// reconnecting costs one click.
export const TOKEN_TTL_SECONDS = 900;
