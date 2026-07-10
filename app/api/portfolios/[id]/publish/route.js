import { publishPortfolio } from "@/lib/portfolios";

export async function POST(request, { params }) {
  const { id } = await params;
  const { deploymentUrl } = (await request.json()) || {};

  const result = await publishPortfolio(id, deploymentUrl);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true });
}
