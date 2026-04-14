import { NextRequest, NextResponse } from 'next/server'

// ── SURGICAL INJECTION ────────────────────────────────────────────────────────
function injectIntoPage(originalHtml: string, analysis: any, lpUrl?: string): string {
  let html = originalHtml
  const accent = analysis.colorAccent || '#6E56CF'

  // Fix all relative links — open real domain in new tab, no 404s
  try {
    const origin = new URL(lpUrl || 'https://example.com').origin
    if (!html.includes('<base ')) {
      html = html.replace(/<head>/i, `<head><base href="${origin}" target="_blank">`)
    }
  } catch(e) {}

  // 1. URGENCY BANNER — inject right after <body>
  const urgencyBanner = `
<div id="adsync-urgency" style="
  background:${accent};color:#fff;text-align:center;
  padding:10px 16px;font-size:13px;font-weight:500;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  position:sticky;top:0;z-index:99999;letter-spacing:.1px;
">
  ${analysis.urgency || '⚡ Limited time offer — act now'}
  <button onclick="this.parentElement.remove()" style="
    background:none;border:none;color:rgba(255,255,255,.7);
    cursor:pointer;float:right;font-size:16px;line-height:1;margin-top:-1px;
  ">×</button>
</div>`

  if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/(<body[^>]*>)/i, `$1${urgencyBanner}`)
  }

  // 2. REPLACE FIRST H1 with ad-matched headline
  if (analysis.heroHeadline && /<h1[^>]*>/i.test(html)) {
    html = html.replace(
      /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/i,
      `$1${analysis.heroHeadline}$3`
    )
  }

  // 3. RISK REVERSAL — inject after first </button> or </a>
  const riskReversal = `<div id="adsync-risk" style="
    text-align:center;padding:8px 0 4px;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    font-size:12px;color:#6B7280;
  ">${analysis.ctaSecondary || '✓ No credit card · ✓ Cancel anytime · ✓ 14-day guarantee'}</div>`

  html = html.replace(/(<\/button>)/i, `$1${riskReversal}`)

  // 4. SOCIAL PROOF BUBBLE — fixed bottom-left
  const socialProof = `
<div id="adsync-proof" style="
  position:fixed;bottom:24px;left:24px;z-index:99998;max-width:280px;
  background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.14);
  padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  border-left:3px solid ${accent};animation:adsyncSlideIn .4s ease .8s both;
">
  <div style="font-size:12px;color:#111;line-height:1.5;font-style:italic;">
    "${(analysis.socialProof || 'This changed our conversion rate from 2.1% to 7.4% in one week.').replace(/^"|"$/g,'')}"
  </div>
  <div style="font-size:11px;color:#6B7280;margin-top:6px;font-weight:500;">⭐⭐⭐⭐⭐ Verified customer</div>
  <button onclick="this.parentElement.remove()" style="
    position:absolute;top:8px;right:10px;background:none;
    border:none;color:#9CA3AF;cursor:pointer;font-size:14px;
  ">×</button>
</div>`

  // 5. STICKY CTA — fixed bottom-right
  const stickyCta = `
<div id="adsync-cta" style="
  position:fixed;bottom:24px;right:24px;z-index:99998;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  animation:adsyncSlideIn .4s ease 1.2s both;
">
  <a href="#" style="
    display:inline-flex;align-items:center;gap:8px;
    padding:13px 22px;background:${accent};color:#fff;
    border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;
    box-shadow:0 4px 20px rgba(0,0,0,.2);
  ">${analysis.ctaText || 'Get Started →'}</a>
</div>`

  // 6. AUDIT PANEL — collapsible sidebar showing all changes
  const auditPanel = `
<div id="adsync-panel" data-hidden="1" style="
  position:fixed;top:80px;right:0;z-index:999999;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  transition:transform .3s ease;transform:translateX(210px);
">
  <div style="
    background:#0A0A0B;border:1px solid #2A2A32;border-right:none;
    border-radius:10px 0 0 10px;padding:14px;width:210px;
    max-height:75vh;overflow-y:auto;box-shadow:-4px 0 20px rgba(0,0,0,.3);
  ">
    <div style="font-size:10px;font-weight:700;color:#EDEDF0;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase;">
      ⚡ AdSync · ${analysis.changes?.length || 6} Changes
    </div>
    ${(analysis.changes || []).map((c: any) => `
      <div style="margin-bottom:7px;padding:8px;background:#18181C;border-radius:6px;border:1px solid #2A2A32;">
        <div style="font-size:11px;font-weight:600;color:#EDEDF0;margin-bottom:2px;">${c.icon || '•'} ${c.title}</div>
        <div style="font-size:10px;color:#6B7280;line-height:1.4;">${c.desc}</div>
      </div>`).join('')}
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #2A2A32;font-size:10px;color:#5C5C6E;text-align:center;">
      Match <strong style="color:${accent}">${analysis.matchScore || 78}%</strong> ·
      Lift <strong style="color:#86EFAC">+${analysis.liftEstimate || '20–35%'}</strong>
    </div>
  </div>
  <button id="adsync-toggle" onclick="
    const p=document.getElementById('adsync-panel');
    const hidden=p.getAttribute('data-hidden')==='1';
    p.style.transform=hidden?'translateX(0)':'translateX(210px)';
    p.setAttribute('data-hidden',hidden?'0':'1');
    this.textContent=hidden?'›':'‹';
  " style="
    position:absolute;left:-26px;top:12px;
    background:#0A0A0B;border:1px solid #2A2A32;border-right:none;
    border-radius:6px 0 0 6px;padding:6px 8px;
    color:#EDEDF0;cursor:pointer;font-size:13px;
    box-shadow:-4px 0 8px rgba(0,0,0,.2);
  ">‹</button>
</div>`

  // 7. KEYFRAMES
  const keyframes = `
<style id="adsync-styles">
@keyframes adsyncSlideIn {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:none; }
}
</style>`

  // Inject everything before </body>
  const injections = keyframes + socialProof + stickyCta + auditPanel

  if (html.includes('</body>')) {
    html = html.replace('</body>', `${injections}</body>`)
  } else {
    html += injections
  }

  return html
}

// ── DEMO PAGE — when real page can't be scraped ───────────────────────────────
function buildDemoPage(analysis: any, meta: any) {
  const accent = analysis.colorAccent || '#6E56CF'
  const ctaParts = (analysis.ctaSecondary || '✓ No credit card · ✓ Cancel anytime · ✓ 14-day guarantee')
    .split('·').map((s: string) => `<span>✓ ${s.replace(/✓/g,'').trim()}</span>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${analysis.heroHeadline}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
:root{--a:${accent};}*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;color:#0D0D0F;background:#fff;-webkit-font-smoothing:antialiased;}
.urgency{background:var(--a);color:#fff;text-align:center;padding:10px 16px;font-size:13px;font-weight:500;position:sticky;top:0;z-index:100;}
nav{padding:14px 40px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:41px;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);z-index:99;}
.brand{font-size:15px;font-weight:700;color:var(--a);}
.nav-cta{padding:8px 18px;background:var(--a);color:#fff;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;}
.note{background:#FFFBEB;border:1px solid #F59E0B;border-radius:6px;padding:10px 16px;font-size:12px;color:#92400E;margin:16px 40px;text-align:center;}
.hero{padding:64px 40px 48px;max-width:820px;margin:0 auto;text-align:center;}
h1{font-size:clamp(28px,4vw,50px);font-weight:700;line-height:1.1;letter-spacing:-1.5px;margin-bottom:16px;}
h1 em{font-style:normal;color:var(--a);}
.sub{font-size:17px;color:#6B7280;max-width:520px;margin:0 auto 28px;line-height:1.7;}
.btn{display:inline-flex;align-items:center;padding:13px 32px;background:var(--a);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 2px 14px rgba(0,0,0,.12);}
.trust{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-size:12px;color:#6B7280;margin-top:10px;}
.proof-bar{background:#F9FAFB;border-top:1px solid #E5E7EB;border-bottom:1px solid #E5E7EB;padding:18px 40px;text-align:center;}
.pq{font-size:15px;font-style:italic;max-width:620px;margin:0 auto;line-height:1.6;}
.pa{font-size:12px;color:#6B7280;margin-top:7px;font-weight:500;}
.feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:48px 40px;max-width:920px;margin:0 auto;}
.feat{padding:22px;border:1px solid #E5E7EB;border-radius:10px;}
.fi{font-size:22px;margin-bottom:10px;}
.ft{font-size:14px;font-weight:600;margin-bottom:5px;}
.fd{font-size:13px;color:#6B7280;line-height:1.5;}
.faq{max-width:620px;margin:0 auto;padding:28px 40px 44px;}
.faq h2{font-size:22px;font-weight:700;margin-bottom:18px;text-align:center;}
.fi2{border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:10px;}
.fq{font-weight:600;font-size:13px;margin-bottom:5px;}
.fa{font-size:13px;color:#6B7280;line-height:1.5;}
.final{background:var(--a);color:#fff;text-align:center;padding:56px 40px;}
.final h2{font-size:28px;font-weight:700;margin-bottom:12px;}
.final p{font-size:15px;opacity:.82;margin-bottom:24px;}
.btn-w{display:inline-block;padding:13px 36px;background:#fff;color:var(--a);border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;}
footer{padding:18px 40px;text-align:center;font-size:12px;color:#6B7280;border-top:1px solid #E5E7EB;}
@keyframes adsyncSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(max-width:600px){.hero,nav,.proof-bar,.faq,.final,footer{padding-left:20px;padding-right:20px;}.feats{padding:32px 20px;}.note{margin:12px 20px;}}
</style>
</head>
<body>
<div class="urgency">${analysis.urgency || '⚡ Limited time offer — act now'}</div>
<nav>
  <div class="brand">${(analysis.industryVertical||'Brand').split('/')[0].trim()}</div>
  <a href="#cta" class="nav-cta">${analysis.ctaText}</a>
</nav>
<div class="note">ℹ️ <strong>Demo mode</strong> — the target page blocked scraping (common with JS-heavy SPAs like Notion). In production, a headless browser (Puppeteer/Playwright) fetches the real page for surgical injection. This is a CRO-enhanced equivalent showing all changes.</div>
<section class="hero">
  <h1>${analysis.heroHeadline.replace(/(—[^<]*)/, '<em>$1</em>')}</h1>
  <p class="sub">${analysis.heroSubheadline}</p>
  <div id="cta">
    <a href="#" class="btn">${analysis.ctaText} →</a>
    <div class="trust">${ctaParts}</div>
  </div>
</section>
<div class="proof-bar">
  <div class="pq">"${(analysis.socialProof||'').replace(/^"|"$/g,'')}"</div>
  <div class="pa">⭐⭐⭐⭐⭐ Verified customer · ${analysis.industryVertical}</div>
</div>
<div class="feats">
  <div class="feat"><div class="fi">⚡</div><div class="ft">Instant Results</div><div class="fd">Measurable impact from day one. No lengthy onboarding required.</div></div>
  <div class="feat"><div class="fi">🎯</div><div class="ft">Precision Targeting</div><div class="fd">Match your exact audience with pinpoint accuracy.</div></div>
  <div class="feat"><div class="fi">📈</div><div class="ft">Proven ROI</div><div class="fd">Average ${analysis.liftEstimate} lift in conversions. Backed by data.</div></div>
</div>
<div class="faq">
  <h2>Frequently Asked</h2>
  <div class="fi2"><div class="fq">How quickly will I see results?</div><div class="fa">Most customers see measurable improvement within 48 hours of activation.</div></div>
  <div class="fi2"><div class="fq">Is there a long-term commitment?</div><div class="fa">None. Month-to-month pricing with freedom to cancel anytime.</div></div>
</div>
<div class="final">
  <h2>Ready to ${(analysis.ctaText||'Get Started').replace(/→/g,'').trim()}?</h2>
  <p>${analysis.heroSubheadline}</p>
  <a href="#cta" class="btn-w">${analysis.ctaText} →</a>
</div>
<footer>© 2025 ${(analysis.industryVertical||'Brand').split('/')[0].trim()} · Privacy · Terms · All rights reserved</footer>

<!-- AdSync Injections -->
<div id="adsync-proof" style="position:fixed;bottom:24px;left:24px;z-index:99998;max-width:280px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.14);padding:14px 16px;font-family:-apple-system,sans-serif;border-left:3px solid ${accent};animation:adsyncSlideIn .4s ease .8s both;">
  <div style="font-size:12px;color:#111;line-height:1.5;font-style:italic;">"${(analysis.socialProof||'').replace(/^"|"$/g,'')}"</div>
  <div style="font-size:11px;color:#6B7280;margin-top:6px;font-weight:500;">⭐⭐⭐⭐⭐ Verified customer</div>
  <button onclick="this.parentElement.remove()" style="position:absolute;top:8px;right:10px;background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:14px;">×</button>
</div>
<div id="adsync-cta" style="position:fixed;bottom:24px;right:24px;z-index:99998;animation:adsyncSlideIn .4s ease 1.2s both;">
  <a href="#cta" style="display:inline-flex;align-items:center;padding:13px 22px;background:${accent};color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,.2);">${analysis.ctaText||'Get Started →'}</a>
</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { analysis, adUrl, adCopy, lpUrl, audience, goal, originalHtml } = await req.json()
  const meta = { adUrl, adCopy, lpUrl, audience, goal }

  let finalHtml = ''

  if (originalHtml && originalHtml.length > 500) {
    // Real page scraped — surgical injection
    finalHtml = injectIntoPage(originalHtml, analysis, lpUrl)
  } else {
    // Page blocked or unavailable — enhanced demo
    finalHtml = buildDemoPage(analysis, meta)
  }

  return NextResponse.json({ html: finalHtml })
}