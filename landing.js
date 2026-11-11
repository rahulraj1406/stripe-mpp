export const landing = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Preflight</title>
<style>
:root{--bg:#0b0f14;--card:#121923;--line:#223042;--tx:#e6edf3;--mut:#8b9bb0;--acc:#6ee7b7;--acc2:#60a5fa}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:radial-gradient(900px 500px at 70% -10%,#16324a,transparent),var(--bg);color:var(--tx);line-height:1.55}
.w{max-width:960px;margin:0 auto;padding:0 20px}header{padding:22px 0;display:flex;justify-content:space-between;align-items:center}
b.logo{font-size:18px;letter-spacing:-.3px}b.logo span{color:var(--acc)}.tag{font-size:12px;padding:4px 10px;border:1px solid var(--line);border-radius:99px;color:var(--mut)}
h1{font-size:clamp(34px,6vw,58px);line-height:1.05;letter-spacing:-1.5px;margin:56px 0 16px}h1 em{font-style:normal;background:linear-gradient(90deg,var(--acc),var(--acc2));-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{color:var(--mut);font-size:19px;max-width:640px;margin:0 0 28px}
.cards{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin:40px 0}
.c{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px}.c h3{margin:0 0 6px}.c code{color:var(--acc)}.price{float:right;color:var(--acc2);font-weight:700}
.c p{color:var(--mut);margin:6px 0 0;font-size:15px}
.flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:12px 0 40px}.flow div{border:1px dashed var(--line);border-radius:12px;padding:14px;font-size:14px;color:var(--mut)}.flow b{color:var(--tx);display:block}
pre{background:#070a0e;border:1px solid var(--line);border-radius:12px;padding:16px;overflow:auto;font-size:13px;color:#cde}
h2{letter-spacing:-.6px;margin:40px 0 10px}a{color:var(--acc2)}footer{padding:40px 0;color:var(--mut);font-size:13px}
</style></head><body><div class="w">
<header><b class="logo">preflight<span>.</span></b><span class="tag">MPP · Tempo testnet</span></header>
<h1>Check it <em>before</em><br>your agent pays or reads it.</h1>
<p class="lead">Pay-per-call safety checks for AI agents. No API keys, no checkout. Your agent gets a 402, pays in the same request, and gets the answer with a receipt.</p>
<div class="cards">
<div class="c"><span class="price">$0.02</span><h3>Preflight</h3><code>GET /api/preflight?url=</code><p>Is this paid API safe to pay? Verifies HTTPS, a valid 402 challenge, price and recipient, discovery files and latency. Returns a 0-100 score and a verdict.</p></div>
<div class="c"><span class="price">$0.01</span><h3>Safe read</h3><code>GET /api/safe-read?url=</code><p>Fetches a page as clean text and scans for prompt-injection and hidden instructions before your agent reads it.</p></div>
</div>
<h2>How a call works</h2>
<div class="flow"><div><b>1. Request</b>Agent calls the endpoint</div><div><b>2. 402</b>Server names the price</div><div><b>3. Pay</b>Agent pays, retries with proof</div><div><b>4. Result</b>JSON plus Payment-Receipt</div></div>
<h2>Try it</h2>
<pre>npx mppx account create
npx mppx account fund --network testnet
npx mppx "\${location.origin}/api/preflight?url=https://example.com" --network testnet</pre>
<p>Discovery: <a href="/openapi.json">/openapi.json</a> · <a href="/llms.txt">/llms.txt</a></p>
<footer>Built for the MPP Hackathon. Payments are Tempo testnet pathUSD, not real money.</footer>
</div><script>document.querySelector('pre').textContent=document.querySelector('pre').textContent.replace('\${location.origin}',location.origin)</script></body></html>`
