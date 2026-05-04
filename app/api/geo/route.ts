export const runtime = 'edge'

export async function GET(req: Request) {
  const country = req.headers.get('x-vercel-ip-country') ?? null
  return Response.json({ country })
}
