// Teste funcții noi (runda 8, 14 octombrie 2026) — Playwright, Chromium headless, rețea blocată.
// Rulare: node tests/fff-r8.test.mjs   (cere /opt/node-tools cu playwright și /opt/pw-browsers/chromium; axe-core opțional prin AXE_PATH)
// [fff-portable] axe-core: FFF_AXE / AXE_PATH, apoi pachetul `axe-core` (npm i -D axe-core). Dacă lipsește: undefined (testele cu axe pică cu mesaj clar).
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } };
import {createRequire} from 'module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(HERE, '..', 'index.html');
const URL_APP = 'file://' + INDEX;
const AXE = process.env.AXE_PATH || __fffAxe();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (cond, name, info) => { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (info === undefined ? '' : ' ' + JSON.stringify(info).slice(0, 500))); } };
const FLAGS = ['--no-sandbox', '--allow-loopback-in-peer-connection', '--disable-features=WebRtcHideLocalIpsWithMdns'];
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: FLAGS});
const net = [], errs = [];
async function mk(o = {}) {
  const ctx = await browser.newContext({viewport: {width: o.w || 1280, height: o.h || 800}, acceptDownloads: true, colorScheme: o.scheme || 'dark', reducedMotion: o.reduced ? 'reduce' : 'no-preference', locale: o.locale || 'ro-RO', bypassCSP: !!o.bypassCSP});
  await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  if (o.init) await ctx.addInitScript(o.init);
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(t)) errs.push('console: ' + t); });
  if (o.goto !== false) await page.goto(o.url || URL_APP);
  return {ctx, page};
}
async function axeRun(page, sel) {
  if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  return page.evaluate(async s => { const r = await window.axe.run(s ? document.querySelector(s) : document, {resultTypes: ['violations']}); return r.violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')); }, sel || null);
}
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
// sintetizator vocal fals: înregistrează textele „citite”
const TTS_MOCK = () => {
  window.__spoken = [];
  class U { constructor(t) { this.text = t; this.voice = null; this.lang = ''; this.rate = 1; } }
  const V = [{name: 'Test RO', lang: 'ro-RO', voiceURI: 'ro', localService: true, default: true}, {name: 'Test EN', lang: 'en-US', voiceURI: 'en', localService: true, default: false}];
  const synth = {getVoices: () => V, speaking: false, addEventListener() {}, removeEventListener() {}, pause() {}, resume() {},
    cancel() { synth.speaking = false; }, speak(u) { synth.speaking = true; setTimeout(() => { window.__spoken.push({text: u.text, lang: u.lang}); synth.speaking = false; if (u.onstart) u.onstart({}); if (u.onend) u.onend({}); }, 5); }};
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: U, configurable: true}); Object.defineProperty(window, 'speechSynthesis', {value: synth, configurable: true});
};
console.log('Scopone fără frontiere — teste funcții noi (joc în doi pe rețea, citire fișe cu voce, kit)');
// ---------- 1. pornire curată, kit, etichetă ----------
for (const [w, h] of [[1280, 800], [360, 740]]) {
  const {ctx, page} = await mk({w, h, init: TTS_MOCK});
  await page.waitForTimeout(3600);
  ok(await page.evaluate(() => !!(window.FFF && FFF.p2p && FFF.tts && FFF.bundle && FFF.label)), `kit încărcat (${w}x${h})`);
  ok(await noHScroll(page), `fără depășire orizontală ${w}x${h}`);
  ok((await axeRun(page)).length === 0, `axe 0 violări (atlas) ${w}x${h}`, await axeRun(page));
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror/CSP la pornire', errs); ok(net.length === 0, '0 cereri de rețea', net);
{
  const {ctx, page} = await mk({init: TTS_MOCK});
  // ---------- 2. citirea fișei cu voce ----------
  const b = page.locator('article.fiche').first().getByRole('button', {name: /Ascultă fișa/});
  ok(await b.count() === 1, 'buton „Ascultă fișa” în fișă');
  await b.click(); await page.waitForTimeout(300);
  const sp = await page.evaluate(() => window.__spoken);
  ok(sp.length > 0 && sp.some(x => /Scopa/.test(x.text)), 'textul fișei este citit (titlu + origine + reguli)', sp.slice(0, 2));
  ok(sp.every(x => x.lang === 'ro-RO'), 'voce ro-RO aleasă', sp.map(x => x.lang));
  await page.evaluate(() => { const s = document.getElementById('langsel'); s.value = 'en'; s.dispatchEvent(new Event('change')); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__spoken.length = 0; });
  await page.locator('article.fiche').first().getByRole('button', {name: /Listen to the entry/}).click(); await page.waitForTimeout(300);
  const spe = await page.evaluate(() => window.__spoken);
  ok(spe.length > 0 && spe.every(x => x.lang === 'en-US'), 'în EN citește cu voce en-US', spe.map(x => x.lang));
  await page.evaluate(() => { const s = document.getElementById('langsel'); s.value = 'fr'; s.dispatchEvent(new Event('change')); });
  await page.evaluate(() => { window.__spoken.length = 0; });
  await page.locator('article.fiche').first().getByRole('button').filter({hasText: /Écouter/}).click(); await page.waitForTimeout(300);
  ok((await page.evaluate(() => window.__spoken)).every(x => /^en/.test(x.lang)), 'FR: textul lung e în engleză, deci voce en (nota din app)');
  await ctx.close();
}
{
  // fără sintetizator vocal: eșec grațios
  const {ctx, page} = await mk({init: () => { Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true}); }});
  await page.locator('article.fiche').first().getByRole('button', {name: /Ascultă fișa/}).click(); await page.waitForTimeout(300);
  const txt = await page.locator('article.fiche').first().locator('[role=status]').first().innerText();
  ok(txt.length > 3, 'fără voce: mesaj tradus, nu excepție', txt);
  await ctx.close();
}
// ---------- 3. joc în doi pe rețea: conectare prin dialogul real, o mână completă ----------
const D = (p, r) => p.locator('[data-role=' + r + ']');
async function connect(A, B) {
  for (const p of [A, B]) { await p.getByRole('tab', {name: 'Joacă'}).click(); }
  await A.locator('#sv-variant').selectOption('scopa');
  await A.locator('#sv-net').click(); await D(A, 'optin').check(); await D(A, 'mode-host').click(); await D(A, 'gen-offer').click();
  await D(A, 'offer-out').waitFor(); const offer = await D(A, 'offer-out').inputValue();
  await B.locator('#sv-net').click(); await D(B, 'optin').check(); await D(B, 'mode-join').click();
  await D(B, 'offer-in').fill(offer); await D(B, 'gen-answer').click(); await D(B, 'answer-out').waitFor();
  const answer = await D(B, 'answer-out').inputValue();
  await D(A, 'answer-in').fill(answer); await D(A, 'connect').click();
  await Promise.all([A, B].map(p => p.waitForFunction(() => { const g = window.__sff && __sff.state(); return g && g.net && g.st; }, null, {timeout: 25000})));
}
const snap = p => p.evaluate(() => { const g = __sff.state(); return g ? {me: g.net.me, turn: g.st.turn, phase: g.phase, over: g.st.over, hand: g.handNo, scores: g.match.scores.slice(), table: g.st.table.slice().sort((a, b) => a - b), hands: g.st.hands.map(h => h.slice().sort((a, b) => a - b)), plays: g.st.plays, status: g.status, up: g.net.up} : null; });
async function playOne(P) {
  const s = await snap(P); if (!s || s.phase !== 'play' || s.turn !== s.me) return false;
  await P.locator('#boardwrap .hand button.card').first().click();
  const o = P.locator('[data-fk=o0][aria-checked=false]'); if (await o.count()) await o.click();
  await P.locator('[data-fk=ok]').click();
  return true;
}
{
  const a = await mk({w: 1100}), b = await mk({w: 1100});
  const A = a.page, B = b.page;
  await connect(A, B);
  const sa = await snap(A), sb = await snap(B);
  ok(sa.me === 0 && sb.me === 1, 'gazdă = locul 0, oaspete = locul 1', [sa.me, sb.me]);
  ok(JSON.stringify(sa.hands[0]) === JSON.stringify(sb.hands[0]) && JSON.stringify(sa.hands[1]) === JSON.stringify(sb.hands[1]) && JSON.stringify(sa.table) === JSON.stringify(sb.table), 'aceeași împărțire la ambii (seed comun)');
  // interfața ascunde adversarul: oaspetele vede doar spatele cărților adversarului
  ok(await B.locator('.seat.top .fan .card').count() === sb.hands[0].length && await B.locator('.seat.top .fan.open').count() === 0, 'mâna adversarului rămâne ascunsă în UI');
  ok(await B.locator('[data-fk=hint]').count() === 0 && await A.locator('[data-fk=hint]').count() === 0, 'sugestia AI este oprită în jocul pe rețea');
  // o mutare ilegală (în afara rândului) este refuzată de gazdă
  const turnHost = sa.turn === 0;
  const P0 = turnHost ? A : B, P1 = turnHost ? B : A;
  const illegal = await P1.evaluate(async () => { const n = __sff.net(); try { await n.ls.move({k: 'm', card: __sff.state().st.hands[__sff.state().net.me][0], take: []}); return 'accepted'; } catch (e) { return e.code || 'rejected'; } });
  ok(illegal !== 'accepted', 'mutare în afara rândului respinsă', illegal);
  // o mână completă prin UI
  let guard = 0;
  while (guard++ < 120) {
    const x = await snap(A); if (x.phase !== 'play') break;
    const P = x.turn === 0 ? A : B;
    await playOne(P);
    await P.waitForFunction(() => !__sff.state().busy, null, {timeout: 8000}).catch(() => {});
    const other = x.turn === 0 ? B : A;
    await other.waitForFunction(n => __sff.state().st.plays >= n, x.plays + 1, {timeout: 8000}).catch(() => {});
  }
  const ea = await snap(A), eb = await snap(B);
  ok(ea.phase !== 'play' && eb.phase === ea.phase, 'mâna s-a încheiat la ambii (' + ea.phase + ')', [ea.phase, eb.phase]);
  ok(JSON.stringify(ea.scores) === JSON.stringify(eb.scores) && ea.plays === eb.plays, 'scoruri și număr de mutări identice', [ea.scores, eb.scores, ea.plays, eb.plays]);
  ok(ea.scores[0] + ea.scores[1] > 0, 'scorul mâinii a fost calculat', ea.scores);
  ok(await A.locator('#endwrap table').count() === 1 && await B.locator('#endwrap table').count() === 1, 'tabelul de puncte apare la ambii');
  // mâna următoare declanșată de oaspete
  if (ea.phase === 'handEnd') {
    await B.locator('[data-fk=nh]').click();
    await A.waitForFunction(h => __sff.state().handNo === h, ea.hand + 1, {timeout: 8000});
    const na = await snap(A), nb = await snap(B);
    ok(na.hand === nb.hand && JSON.stringify(na.hands) === JSON.stringify(nb.hands), 'mâna următoare pornește sincron, aceeași împărțire');
  }
  ok((await axeRun(A)).length === 0, 'axe 0 violări în masa de joc pe rețea (gazdă)', await axeRun(A));
  // întreruperea conexiunii
  await b.page.close();
  await A.waitForFunction(() => /Nu mai primim|întrerupt/.test(document.querySelector('#status').textContent), null, {timeout: 25000}).catch(() => {});
  ok(/Nu mai primim|întrerupt/.test(await A.locator('#status').innerText()), 'conexiune pierdută: mesaj clar în stare, fără blocaj', await A.locator('#status').innerText());
  await a.ctx.close();
}
{ // resincronizare: oaspetele repornește jocul din jurnal (replay) și ajunge în aceeași stare
  const a = await mk({w: 1100}), b = await mk({w: 1100});
  await connect(a.page, b.page);
  for (let i = 0; i < 6; i++) { const x = await snap(a.page); const P = x.turn === 0 ? a.page : b.page; await playOne(P); const O = x.turn === 0 ? b.page : a.page; await O.waitForFunction(n => __sff.state().st.plays >= n, x.plays + 1, {timeout: 8000}); }
  const before = await snap(b.page);
  await b.page.evaluate(() => __sff.net().ls.resync());
  await b.page.waitForTimeout(1500);
  const after = await snap(b.page), host = await snap(a.page);
  ok(JSON.stringify(after.hands) === JSON.stringify(host.hands) && after.plays === host.plays && JSON.stringify(after.table) === JSON.stringify(host.table), 'resincronizare prin reluarea jurnalului: stare identică', [after.plays, host.plays]);
  ok(before.plays === after.plays, 'după resincronizare nu se pierd mutări');
  await a.ctx.close(); await b.ctx.close();
}
// ---------- 4. regresie: jocul contra AI merge neschimbat ----------
{
  const {ctx, page} = await mk({});
  await page.getByRole('tab', {name: 'Joacă'}).click();
  await page.locator('#sv-seed').fill('regres'); await page.locator('#sv-start').click();
  const s = await page.evaluate(() => { const g = __sff.state(); return {net: g.net, turn: g.st.turn}; });
  ok(s.net === null, 'meciul contra AI nu are sesiune de rețea');
  // un meci AI complet cu mutări automate, ca să nu apară excepții
  let guard = 0;
  while (guard++ < 200) {
    const st = await page.evaluate(() => { const g = __sff.state(); return {phase: g.phase, turn: g.st.turn, busy: g.busy}; });
    if (st.phase !== 'play') break;
    if (st.turn === 0 && !st.busy) { await page.locator('#boardwrap .hand button.card').first().click(); const o = page.locator('[data-fk=o0][aria-checked=false]'); if (await o.count()) await o.click(); await page.locator('[data-fk=ok]').click(); }
    else await page.waitForTimeout(150);
  }
  ok((await page.evaluate(() => __sff.state().phase)) !== 'play', 'mână completă contra AI fără erori');
  await ctx.close();
}
// ---------- 5. copie de siguranță (kit): statisticile se exportă în .fff.json ----------
{
  const {ctx, page} = await mk({});
  await page.evaluate(() => localStorage.setItem('sff.stats.v1', JSON.stringify({scopa: {w: 3, l: 1}})));
  const bundle = await page.evaluate(() => FFF.bundle.build());
  ok(bundle && bundle.app === 'scopone' && bundle.data['sff.stats.v1'] && /"w":3/.test(bundle.data['sff.stats.v1']), 'exportul .fff.json conține statisticile locale', bundle && Object.keys(bundle.data));
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror/CSP în tot setul de teste', errs.slice(0, 5)); ok(net.length === 0, '0 cereri de rețea în tot setul', net.slice(0, 3));
await browser.close(); console.log(`\n${pass} ok, ${fail} eșuate`); process.exit(fail ? 1 : 0);
