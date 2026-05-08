export const runtime = 'edge'

export async function GET(req: Request) {
  return Response.json({
    country:   req.headers.get('x-vercel-ip-country')         ?? null,
    city:      req.headers.get('x-vercel-ip-city')            ?? null,
    region:    req.headers.get('x-vercel-ip-country-region')  ?? null,
    latitude:  req.headers.get('x-vercel-ip-latitude')        ?? null,
    longitude: req.headers.get('x-vercel-ip-longitude')       ?? null,
  })
}
