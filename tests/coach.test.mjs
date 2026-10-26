// Teste v2.0.0 — Antrenor de strategie (verdict după fiecare mutare + revizuirea mâinii). Rulare: node tests/coach.test.mjs
import {createRequire} from 'module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = 'file://' + path.join(HERE, '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 500))); } };
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const net = [], errs = [];
const ctx = await browser.newContext({viewport: {width: 1100, height: 900}, reducedMotion: 'reduce'});
await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
const page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message));
await page.goto(URL_APP);
console.log('Scopone — antrenor de strategie');
// 1. motor: scenariu construit
const eng = await page.evaluate(() => {
  const SC = window.__sff.SC, rules = SC.rulesFor('scopa', {});
  // masa: 7♦(6) + 3♠(22) ; mână: 7♠ (26) și 4♣ (33) ... 7♠ poate lua 7♦ (egal) => settebello
  const obs = {rules, n: 2, me: 0, dealer: 1, turn: 0, hand: [26, 33, 31], table: [6, 22, 12], handSizes: [3, 3], stockSize: 31, piles: [[], []], scope: [0, 0], bonus: [0, 0], lastCap: -1, round: 1};
  const rng = SC.makeRNG('t-engine');
  const bad = SC.coachReview(obs, {card: 33, take: []}, rng, 0);   // pune 4 pe masă și lasă settebello
  const best = SC.coachReview(obs, bad.best, SC.makeRNG('t-engine2'), 0);
  return {bad, best};
});
ok(eng.bad && eng.bad.grade !== 'best' && eng.bad.grade !== 'good', 'ignorarea settebello e marcată ca greșeală', eng.bad && eng.bad.grade);
ok(eng.bad.reasons.some(r => r.k === 'sette'), 'motivul „sette” e indicat', eng.bad.reasons);
ok(eng.bad.best.take.includes(6), 'mutarea recomandată ia settebello', eng.bad.best);
ok(eng.best && eng.best.grade === 'best' && eng.best.reasons.length === 0, 'mutarea recomandată primește „best”', eng.best && eng.best.grade);
// 2. determinism
const d = await page.evaluate(() => {
  const SC = window.__sff.SC, rules = SC.rulesFor('scopa', {});
  const obs = {rules, n: 2, me: 0, dealer: 1, turn: 0, hand: [26, 33, 31], table: [6, 22, 12], handSizes: [3, 3], stockSize: 31, piles: [[], []], scope: [0, 0], bonus: [0, 0], lastCap: -1, round: 1};
  const a = SC.coachReview(obs, {card: 33, take: []}, SC.makeRNG('x'), 0), b = SC.coachReview(obs, {card: 33, take: []}, SC.makeRNG('x'), 0);
  return a.loss === b.loss && a.grade === b.grade;
});
ok(d, 'verdictul e determinist pentru același seed');
// 3. UI: o mână întreagă cu antrenor activ (Scopone, 4 jucători)
await page.evaluate(() => window.__sff.startGame({variant: 'scopone', opts: {}, level: 'h', seed: 'coach-ui-1', showHands: false, showMem: false, coach: true}));
let guard = 0, sawMsg = false;
while (guard++ < 400) {
  const st = await page.evaluate(() => { const G = window.__sff.state(); return {phase: G.phase, over: G.st.over, turn: G.st.turn, busy: G.busy}; });
  if (st.phase !== 'play') break;
  if (st.turn === 0 && !st.busy && !st.over) {
    await page.evaluate(() => { const S = window.__sff, G = S.state(), L = S.SC.legalMoves(G.st, 0); S.playMove(L[(G.st.plays * 7) % L.length]); });
    if (await page.locator('#coachwrap .coach').count()) sawMsg = true;
  } else await page.waitForTimeout(60);
}
ok(sawMsg, 'după mutare apare panoul antrenorului');
const info = await page.evaluate(() => { const G = window.__sff.state(); return {n: G.coach.length, phase: G.phase, grades: G.coach.map(e => e.r.grade)}; });
ok(info.n >= 5, 'mutările jucătorului au fost analizate', info);
ok(info.grades.some(g => g !== 'best' && g !== 'good'), 'cu mutări aleatoare apar greșeli etichetate', info.grades);
ok(await page.locator('#endwrap .coach-review').count() === 1, 'revizuirea mâinii apare la final');
const items = await page.locator('#endwrap .coach-review li').count();
ok(items >= 1, 'lista de greșeli are intrări cu explicații', items);
const txt = await page.locator('#endwrap .coach-review').innerText();
ok(/Mai bine era|Better was/.test(txt) || txt.length > 40, 'textul revizuirii e în limba interfeței');
// 4. dezactivat: nicio analiză
await page.evaluate(() => window.__sff.startGame({variant: 'scopone', opts: {}, level: 'h', seed: 'coach-ui-2', showHands: false, showMem: false, coach: false}));
await page.evaluate(() => { const S = window.__sff, G = S.state(); if (G.st.turn === 0) S.playMove(S.SC.legalMoves(G.st, 0)[0]); });
ok(await page.evaluate(() => window.__sff.state().coach.length) === 0 && await page.locator('#coachwrap .coach').count() === 0, 'cu antrenorul oprit nu se analizează nimic');
// 5. setup: casetă + preferință
await page.evaluate(() => { document.querySelector('#setup') && (document.querySelector('#setup').hidden = false); });
ok(await page.locator('#sv-coach').count() === 1, 'caseta „Antrenor” există în setup');
for (const l of ['ro', 'en', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
  const t = await page.evaluate(l => { window.__sff.setLang(l); return null; }, l);
  const has = await page.evaluate(() => document.body.innerText.length > 0);
  ok(has, 'limba ' + l + ' se randează');
}
ok(errs.length === 0, 'fără erori JS', errs); ok(net.length === 0, '0 cereri de rețea', net);
await browser.close();
console.log(`${pass} ok, ${fail} fail`); process.exit(fail ? 1 : 0);
