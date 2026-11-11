const RPC = process.env.TEMPO_RPC || 'https://rpc.moderato.tempo.xyz'
const TOKENS = [
  ['pathUSD', '0x20c0000000000000000000000000000000000000'],
  ['OUSD', '0x20c0000000000000000000006a37DA5C996874BE'],
]
const rpc = (method, params) => fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(6000), body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }).then((r) => r.json()).then((j) => j.result)

let cache = { t: 0, v: null }
export async function walletInfo(address) {
  if (cache.v && Date.now() - cache.t < 15000) return cache.v
  const data = '0x70a08231' + address.toLowerCase().replace('0x', '').padStart(64, '0')
  const balances = await Promise.all(TOKENS.map(async ([symbol, token]) => {
    const hex = await rpc('eth_call', [{ to: token, data }, 'latest']).catch(() => null)
    return { symbol, token, balance: hex ? Number(BigInt(hex)) / 1e6 : null }
  }))
  const v = { address, network: 'Tempo testnet (Moderato, chain 42431)', balances, updated: new Date().toISOString() }
  cache = { t: Date.now(), v }
  return v
}

export const walletPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wallet · Agent Preflight</title>
<style>
:root{--primary:#ff385c;--ink:#222;--muted:#6a6a6a;--hair:#ddd;--soft:#f7f7f7}
*{box-sizing:border-box}body{margin:0;font-family:'Airbnb Cereal VF',Circular,-apple-system,system-ui,sans-serif;color:#3f3f3f;background:#fff}
nav{display:flex;justify-content:space-between;align-items:center;padding:18px 28px;border-bottom:1px solid var(--hair)}nav a{color:var(--primary);font-weight:800;font-size:22px;text-decoration:none}nav span{font-size:13px;font-weight:600;color:var(--ink);border:1px solid var(--hair);border-radius:99px;padding:8px 16px}
main{max-width:720px;margin:0 auto;padding:48px 24px}h1{color:var(--ink);font-size:34px;letter-spacing:-.8px;margin:0 0 6px}p.sub{color:var(--muted);margin:0 0 28px}
.card{border:1px solid var(--hair);border-radius:20px;padding:28px;box-shadow:0 6px 24px rgba(0,0,0,.06)}
.bal{display:flex;justify-content:space-between;align-items:baseline;padding:16px 0;border-bottom:1px solid #ebebeb}.bal:last-child{border:0}.bal b{font-size:30px;color:var(--ink);letter-spacing:-1px}
code{background:var(--soft);border-radius:8px;padding:6px 10px;font-size:13px;word-break:break-all;display:block;margin:6px 0 18px;color:var(--ink)}
button{font:inherit;font-weight:700;color:#fff;border:0;border-radius:10px;padding:12px 22px;cursor:pointer;background:linear-gradient(90deg,#ff385c,#e61e4d 50%,#d70466)}
small{color:var(--muted);display:block;margin-top:14px}
</style></head><body><nav><a href="/">preflight</a><span>Wallet</span></nav>
<main><h1>Receiving wallet</h1><p class="sub">Where every paid call is settled. Public on-chain data, testnet money only.</p>
<div class="card"><b style="color:var(--ink);font-size:13px">ADDRESS</b><code id="addr">loading...</code><div id="bals"></div>
<button id="r">Refresh</button><small id="meta"></small></div></main>
<script>
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){fetch('/api/wallet').then(function(r){return r.json()}).then(function(j){
document.getElementById('addr').textContent=j.address;
document.getElementById('bals').innerHTML=j.balances.map(function(b){return '<div class="bal"><span>'+esc(b.symbol)+'</span><b>'+(b.balance==null?'n/a':b.balance.toLocaleString())+'</b></div>'}).join('');
document.getElementById('meta').textContent=j.network+' · updated '+new Date(j.updated).toLocaleTimeString()}).catch(function(){document.getElementById('addr').textContent='Could not load wallet'})}
document.getElementById('r').onclick=load;load();setInterval(load,20000)
</script></body></html>`
