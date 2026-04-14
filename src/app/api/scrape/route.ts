import { NextRequest, NextResponse } from 'next/server'

function extractPageSnapshot(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch?.[1]?.trim() || ''

  const metaMatch = html.match(/<meta[^>]+name=[\"']description[\"'][^>]+content=[\"']([^\"']+)[\"']/i)
    || html.match(/<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+name=[\"']description[\"']/i)
  const metaDesc = metaMatch?.[1]?.trim() || ''

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)

  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
    .slice(0, 4)

  const btns = [...html.matchAll(/<(?:button|a)[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 1 && t.length < 60)
    .slice(0, 6)

  const bodyText = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600)

  return { title, metaDesc, h1s, h2s, btns, bodyText }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Derive base URL (origin + pathname without filename) for resolving relative paths
  const parsed = new URL(url)
  const baseUrl = parsed.origin  // e.g. https://example.com
  const pathBase = parsed.origin + parsed.pathname.replace(/\/[^/]*$/, '/') // e.g. https://example.com/landing/

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Page returned ${res.status}` }, { status: 422 })
    }

    const html = await res.text()
    const snapshot = extractPageSnapshot(html)

    return NextResponse.json({
      success: true,
      html,
      snapshot,
      url,
      baseUrl,      // ← NEW: origin for absolute URL resolution
      pathBase,     // ← NEW: path-level base for relative URLs
      fetchedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      html: '',
      snapshot: { title: '', metaDesc: '', h1s: [], h2s: [], btns: [], bodyText: '' },
      url,
      baseUrl: '',
      pathBase: '',
      error: e.message,
    })
  }
}