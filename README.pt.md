# Scopone fără frontiere

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versão:** 1.2.0 · **Última atualização:** 2026-10-19

Idiomas da interface: **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

Atlas da família Scopa/Scopone com o baralho italiano de 40 cartas: 8 variantes jogáveis contra a IA, num único ficheiro HTML offline.

**Online:** https://chiuta.github.io/Scopone-fara-frontiere/

![Captura de ecrã](screenshot.png)

## O que é

Um atlas (15 fichas: origem, regras, diferenças regionais, aproximações, fontes) e um jogo propriamente dito contra um adversário de IA local (heurístico / Monte-Carlo, não um LLM). Os naipes (Denari, Coppe, Spade, Bastoni) são desenhados em SVG próprio, sem copiar baralhos regionais; existe também o modo com naipes franceses ♦♥♠♣ para quem não conhece o baralho.

## Funcionalidades (verificadas no código e nos testes)

- Motor separado da interface (funções puras: estado → jogadas legais → estado novo), testado em Node.
- Gerador exaustivo de capturas legais (DFS com poda), verificado com enumeração por força bruta 2^n.
- Seleção da captura: depois de escolher uma carta, as capturas possíveis são pré-listadas e as cartas da mesa ficam realçadas; havendo várias combinações, escolhe você; também pode assinalar cartas na mesa (validação: a seleção tem de ser uma captura legal).
- Teclado completo: ← → cartas, Enter/Espaço seleciona, ↑ ↓ ou 1–9 escolhem a captura, Enter confirma, Esc cancela.
- **Sugestão (💡 / tecla H)** na sua vez: realça a carta e a captura que a heurística simples da IA escolheria, aplicada apenas ao que você vê (não às cartas ocultas). Usa um gerador aleatório separado, pelo que não altera a baralhação nem as jogadas da IA; não entra nas estatísticas e não garante a jogada ótima. Os textos estão nos 8 idiomas.
- Pontuação: vassouras, cartas, denari, settebello, primiera (7=21, 6=18, Ás=16, 5=15, 4=14, 3=13, 2=12, figuras=10; sem um naipe não se pontua), opcionais Re bello e Napola/Napoleone; Cirulla: bónus de mão/dador, piccola, grande, cappotto.
- Interface em 8 idiomas (RO/EN/FR/IT/ES/PT/DE/HU) com autodeteção; textos longos do atlas: RO + EN (em FR/IT/ES/PT/DE/HU mostra-se o inglês, com a nota «texto em inglês»). A paridade das chaves é verificada por script.
- Baralhação com `crypto.getRandomValues` (amostragem por rejeição) ou semente reprodutível (mulberry32).
- Acessibilidade: aria-live, foco visível, alvos ≥44 px (exceto a pastilha fixa de donativos no rodapé, copiada da série), contraste ≥4,5:1 (medido), `prefers-reduced-motion`, 390 px sem deslocação horizontal, `<noscript>`.

## Variantes

| Nome | Jogável? | ⚠ Aproximações |
|---|---|---|
| Scopa (2 jogadores) | sim | — (fiel a Pagat; falta «chiamarsi fuori») |
| Scopone 9 cartas + 4 na mesa (4 jogadores em pares) | sim | ⚠ só o NOME é disputado entre as fontes (veja abaixo); as regras são as das fontes |
| Scopone 10 cartas, mesa vazia (4 jogadores) — «scientifico» em Pagat/Aranzulla, «a 10 carte» na Wikipédia | sim | ⚠ só o NOME é disputado; scopa na última carta: opção (por omissão não conta) |
| Scopa a 15 (versões a e b de Pagat; b = carta igual, conjunto do mesmo valor ou conjunto que dá 15) | sim | versão 3 e «mínimo de cartas» só no atlas |
| Asso piglia tutto | sim | ⚠ com vários ases na mesa, o ás leva um à escolha (Pagat não o diz) |
| Scopa d'assi (4 jogadores, 10 cartas) | sim | ⚠ as fontes diferem nos detalhes |
| Cirulla | sim | ⚠ bónus declarados automaticamente; piccola/grande segundo um único resumo |
| Rubamazzo | sim | ⚠ regras regionais variáveis, IA simples |
| Scopa Bazzica, scalette/Napola, Sbarazzina/Piva, Scopa corsa, Chkobba, Hurrikan, Cicera/Cirullone | só no atlas | — |

Sobre os nomes: «9 cartas cada um e a mesa vazia» é impossível (4×9=36). Existem dois jogos: 9 cartas + 4 na mesa e 10 cartas com a mesa vazia. O Pagat e um guia italiano (Aranzulla) chamam «Scopone scientifico» à variante de 10 cartas; a Wikipédia italiana e inglesa chamam «scientifico» à variante 9+4 e «Scopone a 10 carte» à de 10. Por isso a aplicação etiqueta-as pelo número de cartas e assinala-as com ⚠. Os pontos por mão não somam um total constante de 11; «11» é o objetivo do jogo (opcionalmente 21).

## Manual de utilização

1. No separador «Atlas» leia a ficha de uma variante e carregue em «▶ Jogar», ou vá a «Jogar».
2. Escolha a variante, o nível da IA, o objetivo, as opções de regra; «Seed» vazio = baralhação aleatória. «▶ Iniciar a partida».
3. Na sua vez escolha uma carta da mão; as capturas possíveis aparecem em baixo e ficam realçadas na mesa. Escolha uma (clique, ↑↓ ou o algarismo) e carregue em «Confirmar» / Enter. Se não houver captura, a carta é pousada na mesa. A captura é obrigatória quando é possível.
4. No fim da mão aparece a tabela de pontos; «Mão seguinte» ou «Nova partida».
5. Opcional: «Mostrar as mãos da IA» (apenas para aprender) e «Mostrar as cartas jogadas» (ajuda de memória).

## IA (descrição honesta)

Não é um LLM. «Heurístico»: valor por jogada + estimativa do risco de scopa a partir das cartas não vistas. «Monte-Carlo»: determinização (possíveis distribuições das cartas não vistas) + simulações com política heurística. A IA recebe apenas uma observação (a mesa, a própria mão, as vazas, o número de cartas dos outros): o teste verifica que as observações e as decisões são idênticas quando as cartas ocultas são permutadas. Medido (auditoria independente, 40 amostras com orçamento de trabalho determinista, partidas com lugares alternados, MC contra heurístico): Scopa 136/200 (68% ±6,5), Scopone 9+4 103/160 (64% ±7,4), Scopone 10 cartas 90/160 (56% ±7,7 — vantagem não demonstrada estatisticamente), Cirulla 100/150 (67% ±7,5), Scopa d'assi 128/200 (64% ±6,7), Scopa a 15 132/200 (66% ±6,6), Asso piglia tutto 130/200 (65% ±6,6; as três últimas com um orçamento ligeiramente maior); o heurístico vence um adversário aleatório 185/200 na Scopa. Não é um jogador de nível de torneio. (Atenção: com 10 amostras por jogada, o MC perdia no Scopone — 38% e 31%; por isso há agora até 40, limitadas por um orçamento de trabalho: no Chromium ~99% das jogadas abaixo de ~115 ms, raramente um pico de ~200 ms.)

## Testes (fora do pacote)

53 testes do motor (incluindo 500 partidas IA contra IA em cada uma das 7 variantes com jogadas validadas a cada passo, o invariante das 40 cartas, pontuação comparada com uma implementação independente, 60 000 comparações gerador contra enumeração por força bruta), 17 testes de interface Playwright (partida completa pela interface para cada variante, CSP, rede, telemóvel, teclado, contraste, localStorage bloqueado) e a paridade i18n.

## Privacidade e rede

Sem rede, conta nem telemetria; CSP rigorosa (`default-src 'none'`, script permitido apenas por hash SHA-256, sem `connect-src`). `localStorage` (em try/catch) apenas para o idioma, o baralho, a última variante e as estatísticas locais. As ligações Buy Me a Coffee do rodapé só se abrem ao clicar (`rel=noopener`).

## Limites e avisos

- As regras foram lidas em Pagat.com, na Wikipédia italiana e em guias italianos; o regulamento da Federação Italiana de Scopone não pôde ser consultado.
- Onde as fontes diferem (nomes Scopone/scientifico — verificados em Pagat, Aranzulla, Sisal, Wikipédia IT/EN; objetivo 11 contra 21; scopa na última carta) a ficha diz o que foi implementado; as opções estão expostas.
- Cirulla e Rubamazzo têm aproximações ⚠; a IA não é de torneio.
- As cartas são desenhos originais, não reproduzem baralhos regionais.

## Fontes

pagat.com/fishing/scopa.html · scopone.html · cirulla.html · it.wikipedia.org (Scopone scientifico, Rubamazzetto) · en.wikipedia.org (Scopone) · aranzulla.it (Scopone scientifico) · sisal.it (Scopone) · qualcherisposta.it (Rubamazzo).

## Execução local

Transfira `index.html` e abra-o no navegador; funciona sem internet.

## Licença

MIT — veja o ficheiro LICENSE

## Autor

Alexio — Alexandru-Ionuț Chiuță · alexio@trom.tf

## English summary

Single-file offline atlas of the Scopa/Scopone family with a 40-card Italian pack (original SVG suits, French-suit mode): 8 variants playable against a local AI (Scopa, Scopone 9+4 ⚠name, Scopone 10-card ⚠name — sources disagree which one is "scientifico", Scopa a 15, Asso piglia tutto ⚠, Scopa d'assi ⚠, Cirulla ⚠, Rubamazzo ⚠), 7 atlas-only. UI in 8 languages, long texts RO+EN. Exhaustive legal-capture generator verified against brute force; 500 AI-vs-AI matches per variant without violations. No network, no telemetry. MIT licence.

## Novidades (v1.1.0)

- **Jogo a dois em rede** (botão «Jogar a dois, em rede»): uma partida de Scopone entre duas pessoas, o anfitrião tem o lugar 0, o convidado o lugar 1. A distribuição é idêntica para ambos (semente comum), a mão do adversário permanece oculta, as jogadas fora de vez são rejeitadas, a sugestão da IA fica desativada. A ligação faz-se diretamente entre os dois navegadores (WebRTC), sem servidor nosso: trocam-se dois textos (oferta/resposta), como texto ou código QR, por qualquer canal à sua escolha. Por omissão não se contacta nenhum servidor STUN; um STUN pode ser introduzido manualmente na janela de ligação, apenas se o quiser (é a única saída possível para a rede e só acontece por sua escolha). Se a ligação se interromper, a aplicação mostra-o e pode retomar o jogo a partir do registo das jogadas.
- **Leitura em voz alta das fichas** (botão «Ouvir a ficha» no atlas): título, origem e regras, através da síntese de voz do navegador (FFF.tts), com seletor de voz em «Acerca de»; se não houver voz, surge uma mensagem, não um erro. Os textos longos estão em inglês, pelo que são lidos com voz inglesa (indicado na aplicação).
- **Kit comum** (core, label, bundle, p2p, qr, tts): a etiqueta de versão, cópia de segurança .fff.json com as estatísticas locais.
- Os textos novos estão nos 8 idiomas (ro, en, fr, it, es, pt, hu, de); as traduções fr/it/es/pt/hu/de são automáticas e não verificadas por nativos.
- Testes: `tests/fff-r8.test.mjs` (Playwright, rede bloqueada, dois contextos ligados pela caixa de diálogo real, axe 0 violações a 1280 e 360 px).

## Histórico / Changelog

### 14 de outubro de 2026 (v1.1.0)
- Novo: jogo a dois em rede (WebRTC, sem servidor), leitura em voz alta das fichas, kit comum (etiqueta, cópia .fff.json), 8 idiomas para as funcionalidades novas, testes.

### 12 de outubro de 2026 (v1.0.0)
- 1.0.0 — 2026-10-12: a versão e a data da última atualização são mostradas na aplicação

### 11 de outubro de 2026
- A linha sob o seletor de variante em «Jogar» mostrava o número de jogadores em romeno nos outros idiomas («2 (3 ou 4 em pares: só no atlas)») e um duplo «⚠ ⚠»; agora está traduzida nos 7 idiomas e surge um único ⚠ nas aproximações.
- A pastilha de donativos («Apoie:», etiquetas ARIA, títulos) segue agora o idioma da interface (7 idiomas), já não fica em romeno.
- Botão de **sugestão** (💡, tecla H) para a jogada do jogador, em todas as variantes jogáveis (incluindo Rubamazzo) e em 7 idiomas.
- As etiquetas do atlas (o filtro «Todas», o número de jogadores, as etiquetas das fichas, as etiquetas ARIA) estão agora traduzidas nos 7 idiomas, sem mistura RO/EN.
- Em ecrãs ≤560 px a pastilha de donativos é por omissão um pequeno botão ♥ (expande-se ao toque/Espaço) e a página tem margem inferior.
- Estrutura: `nav` sem a função `tablist` no próprio ponto de referência (o tablist está no interior), `aside` para os donativos, títulos h1→h2 por ordem, h1 também na vista «Jogar» (axe: 0 violações nas 4 vistas); o hash CSP do script foi recalculado.
