export const landing = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Preflight</title>
<meta name="description" content="Pay-per-call safety checks for AI agents, charged over MPP.">
<style>
:root{--primary:#ff385c;--primary-d:#e00b41;--ink:#222;--body:#3f3f3f;--muted:#6a6a6a;--hair:#ddd;--soft:#f7f7f7;--r:14px}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font-family:'Airbnb Cereal VF',Circular,-apple-system,system-ui,Roboto,'Helvetica Neue',sans-serif;color:var(--body);background:#fff;line-height:1.5}
a{color:var(--primary-d)}
nav{display:flex;justify-content:space-between;align-items:center;padding:18px 28px;border-bottom:1px solid var(--hair);position:sticky;top:0;background:#fff;z-index:5}
nav b{color:var(--primary);font-size:22px;letter-spacing:-.4px}
nav .tag{font-size:13px;font-weight:600;color:var(--ink);border:1px solid var(--hair);border-radius:99px;padding:8px 16px}
.hero{max-width:1000px;margin:0 auto;padding:72px 24px 32px;text-align:center}
.pill{display:inline-block;font-size:13px;font-weight:600;color:var(--primary-d);background:#fff0f3;border-radius:99px;padding:6px 14px;margin-bottom:20px}
h1{font-size:clamp(36px,6.5vw,64px);line-height:1.05;letter-spacing:-1.5px;color:var(--ink);margin:0 0 18px;font-weight:800}
h1 em{font-style:normal;color:var(--primary)}
.lead{font-size:clamp(16px,2.2vw,20px);color:var(--muted);max-width:620px;margin:0 auto 28px}
.cta{display:inline-block;background:linear-gradient(90deg,#ff385c,#e61e4d 50%,#d70466);color:#fff;font-weight:700;text-decoration:none;padding:16px 32px;border-radius:12px;box-shadow:0 8px 24px rgba(255,56,92,.3);transition:transform .15s}
.cta:hover{transform:translateY(-2px)}
.ghost{display:inline-block;margin-left:10px;color:var(--ink);font-weight:600;text-decoration:none;padding:15px 26px;border:1px solid var(--ink);border-radius:12px}
.stats{max-width:860px;margin:40px auto 0;display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--hair);border-radius:20px;box-shadow:0 8px 30px rgba(0,0,0,.08);overflow:hidden}
.stats div{padding:22px 10px;border-right:1px solid var(--hair)}.stats div:last-child{border:0}
.stats b{display:block;font-size:clamp(24px,4.5vw,36px);color:var(--ink);letter-spacing:-1px}.stats span{font-size:13px;color:var(--muted)}
.wrap{max-width:1000px;margin:0 auto;padding:64px 24px 0}
h2{font-size:clamp(26px,4vw,34px);color:var(--ink);letter-spacing:-.8px;margin:0 0 8px}.sub{color:var(--muted);margin:0 0 28px}
.cards{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.card{border:1px solid var(--hair);border-radius:20px;padding:28px;box-shadow:0 6px 24px rgba(0,0,0,.06);background:#fff}
.card .price{float:right;font-size:28px;font-weight:800;color:var(--ink)}.card h3{margin:0 0 6px;font-size:22px;color:var(--ink);letter-spacing:-.4px}
.card code{display:inline-block;background:var(--soft);border-radius:8px;padding:4px 10px;font-size:13px;color:var(--ink);margin-bottom:10px}
.card p{margin:0;color:var(--muted);font-size:15px}
.steps{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.step{background:var(--soft);border-radius:var(--r);padding:22px}.step i{font-style:normal;display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background:var(--primary);color:#fff;font-weight:700;margin-bottom:10px}
.step b{display:block;color:var(--ink);font-size:17px}.step span{font-size:14px;color:var(--muted)}
pre{background:var(--ink);color:#f7f7f7;border-radius:var(--r);padding:20px;overflow:auto;font-size:13px;line-height:1.7}
footer{margin-top:72px;padding:32px 24px;text-align:center;color:var(--muted);font-size:14px;border-top:1px solid var(--hair)}
@media(max-width:560px){.stats b{font-size:22px}.ghost{margin:10px 0 0}}
</style></head><body>
<nav><b>preflight</b><span class="tag">MPP · Tempo testnet</span></nav>
<header class="hero"><span class="pill">Pay per request. No API keys.</span>
<h1>Check it <em>before</em> your agent pays or reads it.</h1>
<p class="lead">Safety checks for AI agents over HTTP 402. Your agent gets a price, pays in the same request, and gets the answer back with a receipt.</p>
<a class="cta" href="#try">Try it now</a><a class="ghost" href="/openapi.json">View API</a>
<div class="stats"><div><b>$0.01</b><span>from</span></div><div><b>0</b><span>API keys</span></div><div><b>1</b><span>request to pay and get results</span></div></div>
</header>
<section class="wrap"><h2>Three paid endpoints</h2><p class="sub">Each one answers 402 until it's paid.</p>
<div class="cards">
<div class="card"><span class="price">$0.02</span><h3>Preflight</h3><code>GET /api/preflight?url=</code><p>Is this paid API safe to pay? Checks HTTPS, a valid 402 challenge, price and recipient, discovery files and latency. Returns a 0-100 score and a verdict.</p></div>
<div class="card"><span class="price">$0.01</span><h3>Domain report</h3><code>GET /api/domain-report?domain=</code><p>DNS, TLS certificate validity and expiry, and security headers for any domain, graded A to D.</p></div>
<div class="card"><span class="price">$0.01</span><h3>Safe read</h3><code>GET /api/safe-read?url=</code><p>Fetches a web page as clean text and scans it for prompt-injection and hidden instructions before your agent reads it.</p></div>
</div></section>
<section class="wrap"><h2>How a call works</h2><p class="sub">The whole protocol is one request, a payment and a retry.</p>
<div class="steps"><div class="step"><i>1</i><b>Request</b><span>Agent calls the endpoint</span></div><div class="step"><i>2</i><b>402</b><span>Server names the price</span></div><div class="step"><i>3</i><b>Pay</b><span>Agent pays, retries with proof</span></div><div class="step"><i>4</i><b>Result</b><span>JSON plus a Payment-Receipt</span></div></div></section>
<section class="wrap" id="try"><h2>Try it</h2><p class="sub">Free testnet money, nothing real is charged.</p>
<pre id="cmd">npx mppx account create
npx mppx account fund --network testnet
npx mppx "ORIGIN/api/preflight?url=https://example.com" --network testnet</pre>
<p>Discovery: <a href="/openapi.json">/openapi.json</a> · <a href="/llms.txt">/llms.txt</a></p></section>
<footer>Built for the MPP Hackathon. Payments use Tempo testnet pathUSD.</footer>
<script>var c=document.getElementById('cmd');c.textContent=c.textContent.replace('ORIGIN',location.origin)</script>
</body></html>`
