import dns from 'node:dns/promises'
import net from 'node:net'

const PRIVATE = [/^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^::1$/, /^f[cd]/i, /^fe80/i, /^::ffff:/i]
const isPrivate = (ip) => PRIVATE.some((r) => r.test(ip))

export async function assertPublicUrl(raw) {
  let u
  try { u = new URL(raw) } catch { throw httpErr(400, 'invalid url') }
  if (!['http:', 'https:'].includes(u.protocol)) throw httpErr(400, 'only http(s) urls')
  if (u.port && !['80', '443'].includes(u.port)) throw httpErr(400, 'only ports 80/443')
  if (u.username || u.password) throw httpErr(400, 'credentials in url not allowed')
  const host = u.hostname.replace(/^\[|\]$/g, '')
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => { throw httpErr(400, 'dns lookup failed') })
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw httpErr(400, 'target not allowed')
  return u
}

export function httpErr(status, message) { return Object.assign(new Error(message), { status }) }

// Safe fetch: validates every hop, caps redirects, time and size.
export async function safeFetch(raw, { method = 'GET', maxBytes = 1_000_000, timeout = 8000, headers = {} } = {}) {
  let url = raw
  const t0 = Date.now()
  for (let hop = 0; hop < 4; hop++) {
    const u = await assertPublicUrl(url)
    const res = await fetch(u, { method, redirect: 'manual', signal: AbortSignal.timeout(timeout), headers: { 'user-agent': 'agent-preflight/1.0', ...headers } })
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { url = new URL(res.headers.get('location'), u).href; continue }
    let body = ''
    if (method !== 'HEAD' && res.body) {
      const reader = res.body.getReader(); const dec = new TextDecoder(); let n = 0
      while (true) { const { done, value } = await reader.read(); if (done) break; n += value.length; body += dec.decode(value, { stream: true }); if (n > maxBytes) { reader.cancel(); break } }
    }
    return { res, body, finalUrl: u.href, ms: Date.now() - t0, hops: hop }
  }
  throw httpErr(400, 'too many redirects')
}

export function parsePaymentChallenge(header) {
  if (!header || !/^Payment\s/i.test(header)) return null
  const get = (k) => header.match(new RegExp(`${k}="([^"]*)"`))?.[1]
  const out = { method: get('method'), intent: get('intent'), realm: get('realm'), expires: get('expires') }
  try { out.request = JSON.parse(Buffer.from(get('request') || '', 'base64url').toString()) } catch {}
  return out
}

const INJECTION = [
  /ignore (all |any )?(previous|prior|above) (instructions|prompts?)/i,
  /disregard (the |all )?(previous|prior|system)/i,
  /you are now (a|an|in)\b/i,
  /system prompt/i,
  /reveal (your|the) (instructions|prompt|system)/i,
  /do not tell the user/i,
  /(send|exfiltrate|post) .{0,40}(api[_ ]?key|password|token|secret)/i,
]

export function htmlToText(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null
  const hidden = (html.match(/<[^>]+(display\s*:\s*none|visibility\s*:\s*hidden|aria-hidden="true")[^>]*>[\s\S]{0,300}?<\/[a-z]+>/gi) || []).join(' ')
  const text = html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<\/(p|div|h\d|li|tr|br)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim()
  const links = [...html.matchAll(/<a\s[^>]*href="([^"#][^"]*)"/gi)].length
  const flags = INJECTION.filter((r) => r.test(html)).map((r) => r.source)
  const hiddenInjection = INJECTION.some((r) => r.test(hidden))
  return { title, text, links, flags, hiddenInjection, risk: hiddenInjection ? 'high' : flags.length > 1 ? 'high' : flags.length ? 'medium' : 'low' }
}
