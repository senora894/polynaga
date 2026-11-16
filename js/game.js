/* =====================================================================
   POLYNAGA – LOGIKA PERMAINAN
   Alur satu giliran (sesuai catatan desain):
   lempar dadu → bidak melangkah → info petak → soal/kartu/aksi → ganti pemain
   ===================================================================== */
(() => {
'use strict';

/* ---------- Utilitas ---------- */
const $  = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => Math.round(n).toLocaleString('id-ID');
const rand = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LEVEL_NAME = ['', 'Mudah', 'Sedang', 'Sulit'];
const LETTER = ['A', 'B', 'C', 'D', 'E'];

// Kunci jawaban berdasarkan urutan kartu 1–12
const CARD_ANSWER_KEYS = {
  pancasila: [
    'C', 'B', 'D', 'E', 'A', 'B',
    'A', 'E', 'C', 'D', 'B', 'D'
  ],

  sejarah: [
    'C', 'A', 'B', 'E', 'D', 'B',
    'A', 'E', 'C', 'D', 'A', 'B'
  ],

  pamali: [
    'C', 'E', 'B', 'D', 'A', 'C',
    'E', 'B', 'D', 'A', 'C', 'E'
  ]
};
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, v + amt));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/* ---------- State ---------- */
const S = {
  players: [], cur: 0, decks: {},
  over: false, timeUp: false, forceEnd: false, running: false,
  endAt: 0, minutes: CONFIG.DEFAULT_DURATION,
  rollResolve: null, infoResolve: null, chain: 0,
  sound: true,
music: true,
musicVolume: 0.25,
tiles: TILES.length
};
const stage = $('#stage');

/* ==========================================
   POLYNAGA - RESPONSIVE GAME DISPLAY
========================================== */

function fit() {

    const baseWidth = 1672;
    const baseHeight = 941;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Skala agar seluruh game terlihat
    const scale = Math.min(
        screenWidth / baseWidth,
        screenHeight / baseHeight
    );

    // Posisi game di tengah layar
    stage.style.position = 'fixed';
    stage.style.width = baseWidth + 'px';
    stage.style.height = baseHeight + 'px';

    stage.style.left = '50%';
    stage.style.top = '50%';

    stage.style.transformOrigin = 'center center';

    stage.style.transform =
        `translate(-50%, -50%) scale(${scale})`;

}

// Penyesuaian ukuran layar
window.addEventListener('resize', fit);

window.addEventListener('orientationchange', () => {
    setTimeout(fit, 300);
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fit);
}

document.addEventListener('fullscreenchange', fit);

fit();

/* ---------- Suara (disintesis, tanpa file) ---------- */
let AC;
function tone(freq, dur, type = 'sine', vol = .12, delay = 0) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + delay;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur);
  } catch (e) { /* audio tidak tersedia */ }
}
const SFX = {
  step: () => tone(520, .07, 'triangle', .07),
  dice: () => [0, 1, 2, 3, 4, 5].forEach(i => tone(180 + Math.random() * 220, .06, 'square', .05, i * .12)),
  right: () => { tone(660, .12, 'sine', .14); tone(880, .22, 'sine', .14, .1); },
  wrong: () => tone(170, .28, 'sawtooth', .09),
  coin: () => { tone(988, .08, 'square', .06); tone(1319, .16, 'square', .06, .08); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .28, 'sine', .14, i * .15))
};
const sfx = n => SFX[n] && SFX[n]();

// Musik latar opsional: taruh file di assets/audio/bgm.mp3 (jika tidak ada, diabaikan)
const bgm = new Audio('assets/audio/bgm.mpeg');

bgm.loop = true;
bgm.volume = S.musicVolume;

bgm.addEventListener('error', () => {});

function bgmSync() {
    bgm.volume = S.musicVolume;

    if (S.music) {
        const p = bgm.play();

        if (p && p.catch) {
            p.catch(() => {});
        }
    } else {
        bgm.pause();
    }
}

/* ---------- Papan ---------- */
function buildBoard() {
    const b = $('#board');
    b.innerHTML = '';

    TILES.forEach(t => {
        const d = el('div', `tile ${t.css}`);

        d.dataset.id = t.id;

        d.style.gridRow = t.pos[0];
        d.style.gridColumn = t.pos[1];

        d.innerHTML = `
            <img
                class="tile-art"
                src="${t.image}"
                alt="${t.name}"
                draggable="false"
            >

            <div class="pawns"></div>
        `;

        b.appendChild(d);
    });

    b.appendChild(el('div', 'center'));
}
$('#board').addEventListener('click', e => {
  const t = e.target.closest('.tile');
  if (t && !S.infoResolve) showInfo(TILES[+t.dataset.id], false);
});


function renderPawns() {
  // Bersihkan pion dari semua petak
  document.querySelectorAll('.pawns').forEach(container => {
    container.innerHTML = '';
  });

  S.players.forEach((p, i) => {
    const host = $(`.tile[data-id="${p.pos}"] .pawns`);

    if (!host) return;

    const d = el(
      'div',
      'pawn' + (i === S.cur ? ' active' : '')
    );

    // Semua karakter menggunakan sistem sprite yang sama
    if (p.pawnIdle && p.pawnWalk) {
      const isWalking = p.isMoving === true;

      const sprite = el(
        'div',
        'pawn-sprite ' + (isWalking ? 'walking' : 'idle')
      );

      // Pilih gambar sesuai kondisi gerakan
      const image = isWalking ? p.pawnWalk : p.pawnIdle;

      sprite.style.backgroundImage = `url("${image}")`;

      sprite.setAttribute('role', 'img');
      sprite.setAttribute('aria-label', p.name);

      d.appendChild(sprite);

    } else {
      // Cadangan jika aset karakter belum tersedia
      const img = el('img', 'pawn-image');

      img.src = p.img;
      img.alt = p.name;

      img.onerror = () => {
        console.error('Gambar pion tidak ditemukan:', img.src);
      };

      d.appendChild(img);
    }

    host.appendChild(d);
  });
}

/* ---------- HUD ---------- */

/* ---------- HUD ---------- */
function renderHUD() {
  const box = $('#players');
  box.innerHTML = '';

  S.players.forEach((p, i) => {
    const c = el('div', 'pcard' + (i === S.cur ? ' on' : ''));

    c.style.setProperty('--c1', shade(p.color, 40));
    c.style.setProperty('--c2', shade(p.color, -25));

    c.title = `${p.name} – ${p.role}`;
    
    c.innerHTML = `
    <img class="avatar" src="${p.img}" alt="${p.name}">

    <div class="pi">
        <b>${p.name}</b>

        <span class="star">
            <img class="star-icon" src="assets/star-point.png" alt="">
            ${fmt(p.points)}
        </span>
    </div>
` + (
    p.jail > 0
        ? '<span class="tag">🚫</span>'
        : (p.streak >= 2 ? '<span class="tag">🔥</span>' : '')
);


    box.appendChild(c);
  });

  const cp = S.players[S.cur];

  if (cp) {
    $('#sgName').textContent = cp.name;
    $('#sgPts').textContent = fmt(cp.points);
  }
}

function say(text) { $('#bubble').textContent = text; }
function note(text) {
  const n = el('div', 'note', text); $('#toasts').appendChild(n);
  setTimeout(() => n.remove(), 2400);
}
function floatPts(p, amount) {
  const i = S.players.indexOf(p), card = $('#players').children[i]; if (!card) return;
  const f = el('div', 'float' + (amount < 0 ? ' neg' : ''), (amount > 0 ? '+' : '') + fmt(amount));
  f.style.left = ($('#players').offsetLeft + card.offsetLeft + card.offsetWidth / 2) + 'px';
  f.style.top = ($('#players').offsetTop + card.offsetTop + card.offsetHeight - 6) + 'px';
  $('#toasts').appendChild(f); setTimeout(() => f.remove(), 1400);
}
function addPoints(p, n, reason) {
  n = Math.round(n); if (!n) return 0;
  if (n < 0) n = -Math.min(-n, p.points);           // poin tidak pernah di bawah 0
  p.points += n; p.earned += Math.max(0, n);
  renderHUD(); floatPts(p, n); sfx(n > 0 ? 'coin' : 'wrong');
  if (reason) note(`${p.name}: ${n > 0 ? '+' : ''}${fmt(n)} • ${reason}`);
  return n;
}
function confetti() {
  for (let i = 0; i < 26; i++) {
    const c = el('div', 'confetti', rand(['🎉', '⭐', '🎊', '✨', '🏆']));
    c.style.left = Math.random() * 1640 + 'px'; c.style.animationDelay = Math.random() * .8 + 's'; c.style.fontSize = 24 + Math.random() * 24 + 'px';
    $('#toasts').appendChild(c); setTimeout(() => c.remove(), 3800);
  }
}

/* ---------- Timer ---------- */
function tickTimer() {
  if (!S.running) return;
  const left = Math.max(0, S.endAt - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
  $('#timer span').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  $('#timer').classList.toggle('low', left < 60000);
  if (left <= 0 && !S.timeUp) { S.timeUp = true; note('⏰ Waktu habis! Ini ronde terakhir.'); say('Waktu habis! Selesaikan ronde ini ya.'); }
}
setInterval(tickTimer, 500);

/* ---------- Modal ---------- */
function modal(html, cls = '', ovCls = '') {
  const ov = el('div', 'overlay ' + ovCls), card = el('div', 'mcard ' + cls, html);
  ov.appendChild(card); $('#layers').appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('show'));
  return { ov, card, close() { ov.classList.remove('show'); setTimeout(() => ov.remove(), 180); } };
}
const whoBadge = p => `<img class="who" src="${p.img}" alt=""><b style="font-size:22px">${p.name}</b>`;
const waitClick = (btn, close) => new Promise(r => btn.addEventListener('click', () => { if (close) close(); r(); }, { once: true }));

/* ---------- Panel informasi petak ---------- */

/* ---------- Panel informasi petak ---------- */
function showInfo(tile, wait) {
    const f = tile.focus;
    const pic = $('#infoPic');

    if (tile.infoImage) {
        // Gambar khusus panel informasi
        pic.style.backgroundImage = `url('${tile.infoImage}')`;
        pic.style.backgroundSize = '130% auto';
        pic.style.backgroundPosition = 'center center';
    } else {
        // Gambar petak lainnya tetap memakai pengaturan lama
        pic.style.backgroundImage = 'url(assets/i.jpg)';
        pic.style.backgroundSize = f[2] + '% auto';
        pic.style.backgroundPosition = `${f[0]}% ${f[1]}%`;
    }

    $('#infoTitle').textContent = tile.name;
    $('#infoDesc').textContent = tile.desc;
    $('#infoMsg').textContent = ' ' + tile.pesan;

    $('#info').classList.remove('hidden');
    $('#info').style.animation = 'none';
    void $('#info').offsetWidth;
    $('#info').style.animation = '';

    if (!wait) return Promise.resolve();

    return new Promise(res => {
        S.infoResolve = res;
    });
}

function closeInfo() {
    $('#info').classList.add('hidden');

    if (S.infoResolve) {
        const r = S.infoResolve;
        S.infoResolve = null;
        r();
    }
}

$('#infoOk').onclick = closeInfo;
$('#infoX').onclick = closeInfo;

/* ---------- Dadu ---------- */
const setFace = n => $('#dice .die').dataset.v = n;
function waitRoll() {
  $('#dice').classList.add('ready');
  return new Promise(res => {
    S.rollResolve = abort => { S.rollResolve = null; $('#dice').classList.remove('ready'); res(!abort); };
  });
}
async function rollDice() {
  const d = $('#dice'); d.classList.add('rolling'); sfx('dice');
  const t0 = performance.now();
  while (performance.now() - t0 < 850) { setFace(1 + Math.floor(Math.random() * 6)); await sleep(75); }
  const v = 1 + Math.floor(Math.random() * 6); setFace(v); d.classList.remove('rolling');
  return v;
}
$('#dice').onclick = () => { if (S.rollResolve) S.rollResolve(false); };
addEventListener('keydown', e => { if ((e.code === 'Space' || e.code === 'Enter') && S.rollResolve && !$('#layers').children.length) { e.preventDefault(); S.rollResolve(false); } });


/* ---------- Gerak bidak ---------- */
async function movePawn(p, steps) {
    const dir = steps > 0 ? 1 : -1;
    const totalSteps = Math.abs(steps);

    p.isMoving = true;

    // Gerakkan bidak sesuai angka dadu
    for (let i = 0; i < totalSteps; i++) {
        const nextPos = (p.pos + dir + S.tiles) % S.tiles;
        const nextTile = TILES[nextPos];

        // Hutan Larangan tidak boleh dimasuki.
        // Bidak berhenti di petak sebelumnya dan sisa langkah hangus.
        if (nextTile && nextTile.type === 'blocked') {
            note('🚫 Hutan Larangan tidak boleh dimasuki!');
            break;
        }

        p.pos = nextPos;

        renderPawns();
        sfx('step');

        await sleep(500);
    }

    // Jika dadu berakhir tepat di Hutan Larangan Hanya Lewat,
    // bidak wajib maju satu petak lagi agar tidak berhenti di sana.
    if (TILES[p.pos]?.type === 'pass') {
        const nextPos = (p.pos + dir + S.tiles) % S.tiles;
        const nextTile = TILES[nextPos];

        if (!nextTile || nextTile.type !== 'blocked') {
            p.pos = nextPos;

            renderPawns();
            sfx('step');

            await sleep(500);
        }
    }

    p.isMoving = false;
    renderPawns();
}
/* ---------- Pindah ke petak pilihan (Bebas Singgah) ---------- */
async function teleport(p, targetId) {
  if (!p || !TILES[targetId]) return;

  // Pastikan bidak tidak sedang bergerak
  p.isMoving = true;

  // Pindahkan bidak langsung ke petak tujuan
  p.pos = targetId;

  renderPawns();
  sfx('step');

  await sleep(500);

  p.isMoving = false;
  renderPawns();
}

/* ---------- Kartu / soal (tanpa pengulangan sampai habis) ---------- */
function draw(key, source) {
  if (!S.decks[key] || !S.decks[key].length) S.decks[key] = shuffle(source.map((_, i) => i));
  return source[S.decks[key].pop()];
}

function questionModal({ tile, qq, opts, base, p, owner, practice }) {
  return new Promise(res => {
    const lvl = tile.level;
    const M = modal(
      `<div class="qhead">${whoBadge(p)}<span class="chip">${tile.icon} ${tile.name}</span>` +
      `<span class="chip l${lvl}">${LEVEL_NAME[lvl]}${practice ? '' : ' • +' + base}</span><span class="sp"></span>` +
    `</div>` +
      `<h2 class="qtext">${qq.q}</h2><div class="opts">` +
      opts.map((o, i) => `<button class="opt" data-i="${i}"><b>${LETTER[i]}</b><span>${o.t}</span></button>`).join('') +
      `</div><div class="qfeed"></div><div class="qfoot"><button class="btn green" id="qnext" hidden>Lanjut ➜</button></div>`, 'qcard');
    const btns = [...M.card.querySelectorAll('.opt')], feed = $('.qfeed', M.card), next = $('#qnext', M.card);
    let tries = 0, done = false;
    const finish = ok => {
      done = true; btns.forEach(b => b.disabled = true);
      btns.forEach((b, i) => { if (opts[i].ok) b.classList.add('right'); });
      feed.className = 'qfeed ' + (ok ? 'ok' : 'bad');
      feed.innerHTML = (ok ? '✔ Benar! ' : '✘ Belum tepat. ') + qq.e;
      next.hidden = false; next.focus();
      next.onclick = () => { M.close(); res({ correct: ok, tries }); };
    };
    btns.forEach((b, i) => b.onclick = () => {
      if (done) return; tries++;
      if (opts[i].ok) { sfx('right'); say(rand(MASCOT.right)); finish(true); return; }
      b.classList.add('wrong'); b.disabled = true; sfx('wrong');
      if (tries < 2) { feed.className = 'qfeed bad'; feed.textContent = 'Belum tepat. Coba lagi! 💪'; say(rand(MASCOT.wrong)); }
      else finish(false);
    });
  });
}

/* ---------- Penanganan soal ---------- */

/* ---------- PENANGANAN KARTU KUIS ---------- */

async function handleQuestion(p, tile) {

  const base = tile.points ?? CONFIG.POINTS_BY_LEVEL[tile.level];

  const category = tile.cardCategory;

  // Ambil nomor kartu secara acak tanpa pengulangan
  const cardNumber = draw(
    'interactive-' + category,
    Array.from({ length: 12 }, (_, i) => i + 1)
  );

  const answerKey = CARD_ANSWER_KEYS[category]?.[cardNumber - 1];

  if (!answerKey) {
    console.error('Kunci jawaban tidak ditemukan:', category, cardNumber);
    note('Kartu tidak dapat dimuat. Periksa kategori dan kunci jawaban.');
    return;
  }

  const result = await cardQuestionModal({
    tile,
    category,
    cardNumber,
    answerKey,
    base,
    p
  });

  if (result.correct) {

    p.correct++;
    p.streak++;

    const points = result.tries === 1
      ? base
      : Math.max(
          5,
          Math.round(base * CONFIG.RETRY_FACTOR / 5) * 5
        );

    addPoints(
      p,
      points,
      result.tries === 1
        ? 'Jawaban benar'
        : 'Benar di percobaan ke-2'
    );

    await sleep(700);

    if (p.streak % CONFIG.STREAK_NEEDED === 0) {

      addPoints(
        p,
        CONFIG.STREAK_BONUS,
        `Bonus ${CONFIG.STREAK_NEEDED}x berturut-turut! 🔥`
      );

      say(MASCOT.streak);
      confetti();

      await sleep(900);
    }

  } else {

    p.wrong++;
    p.streak = 0;

    renderHUD();

    note('Jawaban belum tepat. Poin tidak dikurangi.');

    await sleep(700);
  }
}

async function handlePamali(p) {
  const card = draw('pamali', PAMALI_CARDS);
  const opts = shuffle(card.options);
  const best = Math.max(...card.options.map(o => o.pts));
  const M = modal(
    `<div class="qhead">${whoBadge(p)}<span class="chip">🃏 Kartu Pamali</span><span class="chip l3">Sulit • maks +${best}</span><span class="sp"></span></div>` +
    `<h2 class="qtext">${card.icon} ${card.title}</h2><p style="margin-bottom:6px">${card.story}</p>` +
    `<p class="pill" style="margin:6px 0 12px">💬 Diskusikan dulu bersama temanmu, lalu pilih tindakan terbaik!</p>` +
    `<div class="opts">${opts.map((o, i) => `<button class="opt pamali-opt" data-i="${i}"><b>${LETTER[i]}</b><span>${o.t}</span></button>`).join('')}</div>` +
    `<div class="qfeed"></div><div class="qfoot"><button class="btn green" id="qnext" hidden>Lanjut ➜</button></div>`, 'qcard');
  const btns = [...M.card.querySelectorAll('.opt')], feed = $('.qfeed', M.card), next = $('#qnext', M.card);
  const idx = await new Promise(res => btns.forEach((b, i) => b.onclick = () => res(i)));
  btns.forEach(b => b.disabled = true);
  btns.forEach((b, i) => { if (opts[i].pts === best) b.classList.add('right'); else if (i === idx) b.classList.add('wrong'); });
  const chosen = opts[idx];
  feed.className = 'qfeed ' + (chosen.pts === best ? 'ok' : 'bad');
  feed.innerHTML = `${chosen.pts === best ? '✔ Pilihan terbaik!' : (chosen.pts > 0 ? '△ Cukup baik.' : '✘ Kurang tepat.')} ${chosen.why}`;
  chosen.pts === best ? sfx('right') : sfx('wrong');
  next.hidden = false; await waitClick(next, M.close);
  if (chosen.pts === best) { p.correct++; p.streak++; } else { p.wrong++; p.streak = 0; }
  addPoints(p, chosen.pts, chosen.pts ? 'Analisis Pamali' : null);
  await sleep(600);
  if (chosen.pts === best && p.streak % CONFIG.STREAK_NEEDED === 0) { addPoints(p, CONFIG.STREAK_BONUS, 'Bonus berturut-turut! 🔥'); confetti(); await sleep(900); }
}

/* ---------- PILIH PEMAIN PENDAMPING FUN FACT ---------- */
async function chooseFunFactPartner(p, mode) {
    const others = S.players.filter(q => q !== p);

    if (!others.length) return null;

    const title = mode === 'right'
        ? 'Pilih pemain yang duduk di sebelah kanan pemain aktif'
        : 'Pilih satu pemain untuk menjawab bersama';

    const M = modal(`
        <h2 class="qtext center-t">👥 Pilih Pemain</h2>
        <p class="center-t">${title}</p>
        <div class="opts">
            ${others.map((q, i) => `
                <button class="opt ff-partner" data-index="${i}">
                    <img class="who" src="${q.img}" alt="">
                    <span>${q.name}</span>
                </button>
            `).join('')}
        </div>
    `, 'qcard');

    return await new Promise(resolve => {
        M.card.querySelectorAll('.ff-partner').forEach(btn => {
            btn.onclick = () => {
                const selected = others[Number(btn.dataset.index)];
                M.close();
                resolve(selected);
            };
        });
    });
}

/* ---------- CATAT HASIL TANTANGAN FUN FACT ---------- */
function recordFunFactAnswer(player, correct) {
    if (correct) {
        player.correct++;
        player.streak++;

        if (player.streak % CONFIG.STREAK_NEEDED === 0) {
            addPoints(
                player,
                CONFIG.STREAK_BONUS,
                'Bonus jawaban benar berturut-turut! 🔥'
            );

            say(MASCOT.streak);
            confetti();
        }
    } else {
        player.wrong++;
        player.streak = 0;
        renderHUD();
    }
}

/* ---------- PROSES PERGERAKAN DARI KARTU ---------- */
async function applyFunFactMove(p, steps) {
    if (!steps) return;

    if (S.chain >= 2) {
        note('Batas gerakan berantai sudah tercapai.');
        return;
    }

    S.chain++;

    await sleep(300);
    await movePawn(p, steps);
    await landOn(p);
}

/* ---------- SISTEM KARTU FUN FACT ---------- */
async function handleFunFact(p) {

    // Ambil kartu tanpa pengulangan sampai semua kartu habis
    const f = draw('fact', FUN_FACTS);

    let partner = null;

    // Kartu yang melibatkan pemain lain
    if (f.kind === 'partner') {
        partner = await chooseFunFactPartner(p, f.partnerMode);

        if (!partner) return;
    }

    const needsAnswer =
        f.kind === 'challenge' ||
        f.kind === 'partner';

    const facilitatorText = f.id === 2
        ? 'Guru/fasilitator mengajukan pertanyaan lisan terkait informasi Bumi Ageung. Kartu tidak mencantumkan pertanyaan spesifik.'
        : f.question;

    const actionText = f.kind === 'reroll'
        ? 'Lempar dadu kembali untuk melanjutkan permainan.'
        : f.kind === 'move'
            ? `Jalankan instruksi: maju ${f.move} langkah.`
            : needsAnswer
                ? 'Guru/fasilitator menilai jawaban lisan pemain.'
                : 'Baca dan ikuti instruksi kartu.';

    const M = modal(`
        <div class="qhead">
            ${whoBadge(p)}
            <span class="chip">🌿 Kartu Fun Fact</span>
        </div>

        <div style="text-align:center; margin:10px 0;">
            <img
                src="${f.image}"
                alt="Kartu Fun Fact ${f.title}"
                style="
                    display:block;
                    width:100%;
                    max-width:850px;
                    max-height:500px;
                    object-fit:contain;
                    margin:auto;
                    border-radius:14px;
                "
            >
        </div>

        <h3 class="center-t">${f.title}</h3>

        ${needsAnswer ? `
            <div class="pill" style="
                display:block;
                white-space:normal;
                padding:14px;
                margin:10px 0;
                text-align:center;
            ">
                ${facilitatorText}
            </div>
            <p class="center-t">
                Jawaban dinilai oleh guru atau fasilitator.
            </p>
            <div class="qfeed" id="ffFeedback" aria-live="polite"></div>

<div class="qfoot ff-button-group">
            <div class="qfoot ff-button-group">
    <button class="ff-image-button" id="ffCorrect" aria-label="Jawaban Benar">
        <img
            src="assets/tombol-baru/tombol-jawaban benar.png"
            alt="Jawaban Benar"
        >
    </button>

    <button class="ff-image-button" id="ffWrong" aria-label="Belum Tepat">
        <img
            src="assets/tombol-baru/tombol-belum tepat.png"
            alt="Belum Tepat"
        >
    </button>
</div>
        ` : `
            <p class="center-t">${actionText}</p>
           <div class="qfoot ff-button-group">
    <button
        type="button"
        class="ff-image-button"
        id="ffContinue"
        aria-label="${f.kind === 'reroll' ? 'Lempar Dadu' : 'Jalankan Instruksi'}"
    >
        <img
            src="assets/tombol-baru/tombol-jalankan instruksi.png"
            alt="Jalankan Instruksi"
        >
    </button>
</div>
        `}
    `, 'qcard');

    let correct = true;

    if (needsAnswer) {

        const feedback = $('#ffFeedback', M.card);
        const correctBtn = $('#ffCorrect', M.card);
        const wrongBtn = $('#ffWrong', M.card);

       correct = await new Promise(resolve => {
    let attempts = 0;

    correctBtn.type = 'button';
    wrongBtn.type = 'button';

    correctBtn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        M.close();
        resolve(true);
    };

    wrongBtn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        attempts++;

        if (attempts === 1) {
            // Tampilkan pesan jawaban belum tepat
            feedback.className = 'qfeed bad';
            feedback.textContent =
                'Belum tepat. Silakan coba sekali lagi. Poin tidak dikurangi!';

            // Ganti gambar tombol menjadi Lanjut Tanpa Hadiah
            wrongBtn.setAttribute(
                'aria-label',
                'Lanjut Tanpa Hadiah'
            );

            wrongBtn.querySelector('img').src =
                'assets/tombol-baru/tombol-lanjut tanpa hadiah.png';

            wrongBtn.querySelector('img').alt =
                'Lanjut Tanpa Hadiah';

        } else {
            // Klik kedua: tutup kartu tanpa hadiah
            M.close();
            resolve(false);
        }
    };
});

    } else {
        await waitClick($('#ffContinue', M.card), M.close);
    }

    // Jika jawaban belum tepat, tidak ada poin atau langkah tambahan
    if (!correct) {
        const responder = f.kind === 'partner' &&
            f.partnerMode === 'choose' ? partner : p;

        recordFunFactAnswer(responder, false);

        note('Tidak ada pengurangan poin. Tantangan selesai.');
        return;
    }

    // Catat jawaban benar
    if (needsAnswer) {
        const responder = f.kind === 'partner' &&
            f.partnerMode === 'choose' ? partner : p;

        recordFunFactAnswer(responder, true);
    }

    // Bonus poin
    if (f.points !== undefined && f.points !== null) {

        if (f.kind === 'partner') {
            addPoints(p, f.points, 'Bonus Kartu Fun Fact');
            addPoints(partner, f.points, 'Bonus Kartu Fun Fact');
        } else {
            addPoints(p, f.points, 'Bonus Kartu Fun Fact');
        }

    } else if (f.points === null) {
        note('Nominal bonus kartu ini belum ditentukan. Tidak ada poin yang ditambahkan.');
    }

    // Kartu yang meminta lempar dadu kembali
    if (f.kind === 'reroll') {

        if (S.chain >= 2) {
            note('Batas gerakan berantai sudah tercapai.');
            return;
        }

        S.chain++;

        say('Ayo lempar dadu kembali!');
        const alive = await waitRoll();

        if (!alive) return;

        const dice = await rollDice();

        note(`Dadu tambahan: ${dice}`);

        await movePawn(p, dice);
        await landOn(p);

        return;
    }

    // Gerakan otomatis atau gerakan setelah jawaban benar
    if (f.move) {
        await applyFunFactMove(p, f.move);
    }
}
async function handleBale(p) {

  // Dua jenis aktivitas berdasarkan kartu komponen Bale Patemon
  const activities = [
    {
      title: 'Manfaat Musyawarah',
      question: 'Sebutkan salah satu manfaat musyawarah dalam kehidupan bermasyarakat!',
      answer: 'Musyawarah membantu warga menyampaikan pendapat, menghargai perbedaan, dan mengambil keputusan bersama.',
      instruction: 'Perwakilan kelompok menyampaikan manfaat musyawarah dengan bahasanya sendiri.'
    },
    {
      title: 'Musyawarah dan Pancasila',
      question: 'Musyawarah untuk mencapai mufakat merupakan pengamalan sila ke berapa dalam Pancasila?',
      answer: 'Sila ke-4 Pancasila: Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan.',
      instruction: 'Perwakilan kelompok menyebutkan nomor dan bunyi sila yang tepat.'
    }
  ];

  const activity = rand(activities);

  // Tahap 1: Memilih perwakilan
  const M = modal(
    `<div class="qhead">
       <span class="chip">🛖 Aktivitas Bale Patemon</span>
     </div>
     <h2 class="qtext center-t">Pilih Perwakilan Kelompok</h2>
     <p class="center-t">
       Semua pemain berdiskusi. Pilih satu pemain untuk menyampaikan jawaban.
     </p>
     <div class="opts">
       ${S.players.map((q, i) => `
         <button class="opt bale-player" data-index="${i}">
           <img class="who" src="${q.img}" alt="">
           <span>${q.name}</span>
         </button>
       `).join('')}
     </div>`,
    'qcard'
  );

  const representativeIndex = await new Promise(resolve => {
    M.card.querySelectorAll('.bale-player').forEach(button => {
      button.onclick = () => resolve(Number(button.dataset.index));
    });
  });

  const representative = S.players[representativeIndex];

  // Tahap 2: Menampilkan pertanyaan
  M.card.innerHTML = `
    <div class="qhead">
      ${whoBadge(representative)}
      <span class="chip">🛖 Bale Patemon</span>
    </div>

    <h2 class="qtext center-t">${activity.title}</h2>

    <p class="center-t" style="margin:12px 0">
      ${activity.instruction}
    </p>

    <div class="pill" style="display:block; padding:18px; text-align:center; white-space:normal">
      ${activity.question}
    </div>

    <div class="qfoot">
      <button class="btn green" id="showAnswer">
        Lihat Panduan Jawaban
      </button>
    </div>
  `;

  // Tahap 3: Guru/fasilitator memeriksa jawaban
  $('#showAnswer', M.card).onclick = () => {

    M.card.innerHTML = `
      <div class="qhead">
        ${whoBadge(representative)}
        <span class="chip">🛖 Bale Patemon</span>
      </div>

      <h2 class="qtext center-t">Panduan Jawaban</h2>

      <p class="center-t" style="margin:12px 0">
        ${activity.answer}
      </p>

      <p class="center-t">
        Apakah jawaban perwakilan sudah tepat?
      </p>

      <div class="qfoot">
        <button class="btn green" id="baleCorrect">
          ✔ Benar
        </button>

        <button class="btn grey" id="baleWrong">
          ✘ Belum Tepat
        </button>
      </div>
    `;

    // Jawaban benar: semua pemain mendapatkan 5 poin
    $('#baleCorrect', M.card).onclick = async () => {

      M.close();

      for (const player of S.players) {
        addPoints(player, 5, 'Bonus aktivitas Bale Patemon');
        await sleep(250);
      }

      sfx('right');
      confetti();

      note('🛖 Semua pemain memperoleh bonus 5 poin!');
    };

    // Jawaban belum tepat: tidak ada bonus
    $('#baleWrong', M.card).onclick = () => {

      M.close();

      note('Jawaban belum tepat. Tidak ada bonus poin.');

    };

  };

  // Menunggu sampai aktivitas selesai
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (!M.ov.isConnected) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });

}
async function handleGotong(p) {
  const min = Math.min(...S.players.map(x => x.points));
  const lows = S.players.filter(x => x.points === min);
  const receiver = lows.includes(p) ? p : lows[0];
  let total = 0; const lines = [];
  for (const q of S.players) {
    if (q === receiver) continue;
    const g = Math.min(CONFIG.GOTONG_ROYONG_GIFT, q.points); q.points -= g; total += g; lines.push(`${q.name} → ${fmt(g)}`);
  }
  receiver.points += total; renderHUD(); floatPts(receiver, total); sfx('coin');
  const M = modal(`<div class="qhead">${whoBadge(p)}<span class="chip">🤝 Gotong Royong</span></div>` +
    `<h2 class="qtext center-t">Semua warga membantu <u>${receiver.name}</u>!</h2>` +
    `<p class="center-t">Pemain dengan poin paling sedikit mendapat sumbangan ${CONFIG.GOTONG_ROYONG_GIFT} poin dari tiap pemain lain.</p>` +
    `<p class="center-t" style="margin-top:8px"><span class="pill">${lines.join(' • ') || 'Tidak ada sumbangan'}</span></p>` +
    `<div class="qfoot ff-button-group">
  <button type="button" class="ff-image-button" id="ok" aria-label="Mengerti">
    <img src="assets/tombol-baru/tombol-mengerti.png" alt="Mengerti">
  </button>
</div>`, 'qcard');
  await waitClick($('#ok', M.card), M.close);
}
async function handleFree(p) {
  const M = modal(`
    <p class="center-t">Pilih petak tujuanmu!</p>
    <div class="tilepick"></div>
  `, 'free-modal');

  const grid = $('.tilepick', M.card);

  TILES.forEach(t => {

    // Tidak boleh memilih petak sendiri, penjara,
    // maupun Hutan Larangan
    if (
      t.id === p.pos ||
      t.type === 'jail' ||
      t.type === 'blocked'
    ) return;

    const freeTileImages = [
  'petak 01.jpeg',
  'petak 02.png',
  'petak 03.jpeg',
  'petak 04.jpeg',
  'petak 05.png',
  'petak 06.jpeg',
  'petak 07.png',
  'petak 08.png',
  'petak 09.jpeg',
  'petak 10.png',
  'petak 11.jpeg',
  'petak 12.jpeg',
  'petak 13.jpeg',
  'petak 14.jpeg',
  'petak 15.jpeg',
  'petak 16.jpeg',
  'petak 17.jpeg',
  'petak 18.jpeg',
  'petak 19.jpeg',
  'petak 20.jpeg'
];

const imagePath = `assets/bebas-singgah/${freeTileImages[t.id]}`;

const b = el(
  'button',
  '',
  `<img src="${imagePath}" alt="${t.name}">`
);

    b.onclick = () => {
      M.close();
      grid.dispatchEvent(
        new CustomEvent('pick', { detail: t.id })
      );
    };

    grid.appendChild(b);
  });

  const id = await new Promise(resolve => {
    grid.addEventListener(
      'pick',
      e => resolve(e.detail),
      { once: true }
    );
  });

  await teleport(p, id);

  if (S.chain < 2) {
    S.chain++;
    await landOn(p);
  }
}

/* ---------- PENDARATAN DI PETAK ---------- */
async function landOn(p) {
    const t = TILES[p.pos];

    if (!t) return;

    renderHUD();

    // Hutan Larangan dan Hutan Larangan Hanya Lewat
    // tidak membuka panel informasi maupun memberikan efek.
    if (t.type === 'pass' || t.type === 'blocked') {
        return;
    }

    // Tampilkan panel informasi SATU KALI.
    // Permainan menunggu sampai pemain menekan Mengerti.
    await showInfo(t, true);

    // Petak START tidak memberikan soal atau efek tambahan.
    if (t.type === 'start') {
        return;
    }

    // Jalankan efek sesuai jenis petak.
    switch (t.type) {
        case 'q':
            await handleQuestion(p, t);
            break;

        case 'pamali':
            await handlePamali(p);
            break;

        case 'funfact':
            await handleFunFact(p);
            break;

        case 'bale':
            await handleBale(p);
            break;

        case 'gotong':
            await handleGotong(p);
            break;

        case 'free':
            await handleFree(p);
            break;

        case 'finish':
            addPoints(p, CONFIG.FINISH_BONUS, 'Garis Finish! 🏆');
            confetti();
            sfx('win');
            await sleep(1500);
            break;

        case 'jail':
            p.jail = CONFIG.JAIL_MAX_TURNS;
            renderHUD();
            note(`🚫 ${p.name} terkena sanksi adat (Di-Dibuang)`);
            await sleep(1500);
            break;

        default:
            break;
    }
}


/* ---------- Giliran ---------- */
async function normalTurn(p) {
  say(rand(MASCOT.roll));

  const alive = await waitRoll();
  if (!alive) return;

  const v = await rollDice();

  note(`🎲 ${p.name} mendapat ${v}`);
  await sleep(500);

  await movePawn(p, v);
  await landOn(p);
}

async function jailTurn(p) {
  const canPay = p.points >= CONFIG.JAIL_FEE;
  const M = modal(`<div class="qhead">${whoBadge(p)}<span class="chip">🚫 Di-Dibuang</span></div>` +
    `<h2 class="qtext center-t">${p.name} sedang menjalani sanksi adat</h2>` +
    `<p class="center-t">Lempar dadu dan dapatkan angka <b>${CONFIG.JAIL_ESCAPE_ROLL}</b> atau lebih untuk keluar, atau bayar <b>${CONFIG.JAIL_FEE} poin</b>. ` +
    `Sisa sanksi: <b>${p.jail}</b> giliran.</p>` +
    `<div class="qfoot"><button class="btn gold" id="pay" ${canPay ? '' : 'disabled'}>💰 Bayar ${CONFIG.JAIL_FEE} poin</button> ` +
    `<button class="btn blue" id="roll">🎲 Lempar dadu</button></div>`, 'qcard', 'clear');
  M.ov.style.background = 'rgba(10,25,10,.35)'; M.ov.style.pointerEvents = 'auto';
  say('Kamu sedang dikucilkan. Pilih cara keluar!');
  const choice = await new Promise(res => {
    $('#pay', M.card).onclick = () => res('pay'); $('#roll', M.card).onclick = () => res('roll');
  });
  M.close();
  if (choice === 'pay') {
    addPoints(p, -CONFIG.JAIL_FEE, 'Bayar keluar dari Di-Dibuang'); p.jail = 0; renderHUD(); await sleep(900);
    return normalTurn(p);
  }
  const v = await rollDice(); note(`🎲 ${p.name} mendapat ${v}`); await sleep(600);
  p.jail--;
  if (v >= CONFIG.JAIL_ESCAPE_ROLL) {
    p.jail = 0; renderHUD(); note(`✅ ${p.name} bebas dari Di-Dibuang!`); await sleep(1000);
    await movePawn(p, v); await landOn(p);
  } else if (p.jail <= 0) {
    renderHUD(); note('Sanksi berakhir. Giliran berikutnya kamu bebas bergerak.'); await sleep(1200);
  } else { renderHUD(); note('Belum berhasil keluar…'); await sleep(900); }
}

async function gameLoop() {
  while (!S.over) {
    const p = S.players[S.cur]; S.chain = 0;
    renderHUD(); renderPawns();
    if (p.jail > 0) await jailTurn(p); else await normalTurn(p);
    if (S.over) break;
    S.cur = (S.cur + 1) % S.players.length;
    if (S.forceEnd || (S.timeUp && S.cur === 0)) { await endGame(); break; }
    await sleep(350);
  }
}

/* ---------- Akhir permainan ---------- */
async function endGame() {
    S.over = true;
    S.running = false;

    renderHUD();
    sfx('win');
    confetti();
    say(MASCOT.end);

    // Urutan pemain berdasarkan total poin
    const rank = S.players.slice().sort((a, b) => b.points - a.points);

    // Memeriksa apakah pemain teratas memiliki poin seri
    const tie = rank.length > 1 &&
        rank[0].points === rank[1].points;

const medals = [
    'assets/ikon-hasil-akhir/medali-emas.png',
    'assets/ikon-hasil-akhir/medali-silver.png',
    'assets/ikon-hasil-akhir/medali-perunggu.png',
    'assets/ikon-hasil-akhir/medali-bintang.png'
];
    const M = modal(
        `<div class="end-content">

            <p class="end-winner">
                ${
                    tie
                    ? 'Permainan berakhir seri! Selamat kepada para pemain dengan poin tertinggi!'
                    : `<b>${rank[0].name}</b> dinobatkan sebagai <b>“Warga Sanaga Teladan”</b>!`
                }
            </p>

            <div class="end-ranking">
                ${
                    rank.map((q, i) => `
                        <div class="end-rank ${i === 0 ? 'first' : ''}">

                            <span class="end-medal">
    <img
        src="${medals[i] || medals[3]}"
        alt="Medali peringkat ${i + 1}"
    >
</span>

                            <img
                                class="end-avatar"
                                src="${q.img}"
                                alt=""
                            >

                            <div class="end-player-info">
                                <span class="end-player-name">
                                    ${q.name}
                                </span>

                                <small class="end-player-score">
                                    ✔ ${q.correct} benar
                                    <span>•</span>
                                    ✘ ${q.wrong} salah
                                </small>
                            </div>

                            <span class="end-points">
                                ★ ${fmt(q.points)}
                            </span>

                        </div>
                    `).join('')
                }
            </div>

            <div class="end-reflection">

                <h2>Refleksi bersama</h2>

                <ul>
                    <li>
                        Nilai kearifan lokal Kampung Naga apa yang paling berkesan bagimu?
                    </li>

                    <li>
                        Bagaimana nilai gotong royong dan musyawarah dapat kamu terapkan di sekolah dan lingkunganmu?
                    </li>

                    <li>
                        Sila Pancasila mana yang paling sering muncul selama permainan, dan mengapa?
                    </li>
                </ul>

            </div>

            <div class="end-button-area">
                <button
                    type="button"
                    id="again"
                    aria-label="Main Lagi"
                >
                    <img
                        src="assets/tombol-baru/tombol-main lagi.png"
                        alt="Main Lagi"
                    >
                </button>
            </div>

        </div>`,
        'qcard, end-modal'
    );

    $('#again', M.card).onclick = () => location.reload();
}

/* ---------- Pengaturan, aturan, perpustakaan kartu, latihan ---------- */
function rulesHTML() {
  return `<div class="rules-content">
  
    <ol class="rules">
      <li>
        Setiap pemain memulai permainan dari petak <b>Start</b>.
        Urutan giliran bermain ditentukan secara otomatis oleh sistem.
        Pemain yang namanya muncul pertama pada sistem mendapat giliran
        bermain pertama, kemudian diikuti oleh pemain lainnya sesuai
        urutan yang ditampilkan.
      </li>

      <li>
        Pemain secara bergiliran melempar dadu dan menggerakkan pion
        sesuai dengan angka yang diperoleh.
      </li>

      <li>
        Pemain wajib mengikuti instruksi dan ketentuan yang berlaku
        pada petak tempat pion berhenti.
      </li>

      <li value="5">
        Pemain yang berhasil menjawab pertanyaan dapat memperoleh
        poin sesuai aturan petak.
      </li>

      <li value="6">
        Setiap pemain harus mengikuti mekanisme khusus yang berlaku
        pada petak <b>Fun Fact, Bebas Singgah, dan Hutan Larangan.</b>
      </li>

      <li value="7">
        Permainan berakhir ketika waktu yang telah ditentukan habis.
      </li>

      <li value="8">
        Pemenang ditentukan berdasarkan jumlah poin atau skor yang
        diperoleh setiap pemain selama permainan berlangsung.
        Pemain dengan skor tertinggi dinyatakan sebagai pemenang.
      </li>

      <li value="9">
        Seluruh pemain wajib menjaga ketertiban, bersikap sportif,
        dan menghargai setiap peserta selama permainan berlangsung.
      </li>
    </ol>
  </div>`;
}
function openRules() {
  const M = modal(
    `<button class="close-x">✕</button>
     <h1>📜 Cara Bermain</h1>
     ${rulesHTML()}`,
    'qcard',
    'rules-overlay'
  );

  $('.close-x', M.card).onclick = M.close;
}

function openPamaliLibrary() {
  const M = modal(`<button class="close-x">✕</button><h1>🃏 Kartu Pamali</h1><p class="center-t" style="margin:4px 0">Pamali = pantangan adat. Ketuk kartu untuk membaca dilema dan jawaban terbaiknya.</p>` +
    PAMALI_CARDS.map(c => { const b = c.options.reduce((x, y) => y.pts > x.pts ? y : x);
      return `<div class="acc"><button>${c.icon} ${c.title}</button><div><p>${c.story}</p><p style="margin-top:6px"><b>Pilihan terbaik:</b> ${b.t}<br><i>${b.why}</i></p></div></div>`; }).join(''), 'qcard');
  $('.close-x', M.card).onclick = M.close;
  M.card.querySelectorAll('.acc button').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
}
/* ---------- KARTU KUIS INTERAKTIF ---------- */

function cardQuestionModal({ tile, category, cardNumber, answerKey, base, p }) {
  return new Promise(resolve => {

    const categoryNames = {
      pancasila: 'Kartu Pancasila',
      sejarah: 'Kartu Sejarah',
      pamali: 'Kartu Pamali'
    };

    const fileNames = {
      pancasila: 'Pancasila',
      sejarah: 'Sejarah',
      pamali: 'Pamali'
    };

    const imagePath =
      `assets/kartu/${category}/Kartu ${fileNames[category]} (${cardNumber}).png`;

    const letters = ['A', 'B', 'C', 'D', 'E'];

    const M = modal(`
      <div class="qhead">
        ${whoBadge(p)}
        <span class="chip">${categoryNames[category]}</span>
        <span class="chip l${tile.level}">+${base} poin</span>
      </div>

      <div class="interactive-card-wrap cat-${category}">
        <img
          src="${imagePath}"
          class="interactive-card-image"
          alt="${categoryNames[category]} nomor ${cardNumber}"
        >

        ${letters.map(letter => `
          <button
            class="card-hotspot"
            data-answer="${letter}"
            aria-label="Pilih jawaban ${letter}"
            type="button">
          </button>
        `).join('')}

        <button
          class="card-check"
          type="button"
          disabled>
        </button>
      </div>

      <div class="card-question-feedback"></div>

      <div class="qfoot">
        <button class="btn green" id="cardQuestionNext" hidden>
          Lanjut ➜
        </button>
      </div>
    `, 'qcard card-question-modal');

    const choices = [...M.card.querySelectorAll('.card-hotspot')];
    const check = M.card.querySelector('.card-check');
    const feed = M.card.querySelector('.card-question-feedback');
    const next = M.card.querySelector('#cardQuestionNext');

    let selected = null;
    let tries = 0;
    let finished = false;

    // Pemain memilih A, B, C, D, atau E
    choices.forEach(button => {
      button.addEventListener('click', () => {
        if (finished || button.disabled) return;

        choices.forEach(item => item.classList.remove('selected'));

        button.classList.add('selected');
        selected = button.dataset.answer;

        check.disabled = false;
      });
    });

    // Tombol CEK JAWABAN pada gambar kartu
    check.addEventListener('click', () => {
      if (!selected || finished) return;

      tries++;

      if (selected === answerKey) {
        finished = true;

        sfx('right');
        say(rand(MASCOT.right));

        choices.forEach(button => {
          button.disabled = true;

          if (button.dataset.answer === answerKey) {
            button.classList.add('right');
          }
        });

        check.disabled = true;

        feed.className = 'card-question-feedback ok';
        feed.textContent = `✔ Benar! Jawaban yang tepat adalah ${answerKey}.`;

        next.hidden = false;

      } else {
        sfx('wrong');

        const wrongButton = choices.find(
          button => button.dataset.answer === selected
        );

        wrongButton.classList.add('wrong');
        wrongButton.disabled = true;

        if (tries < 2) {
          feed.className = 'card-question-feedback bad';
          feed.textContent = '✘ Belum tepat. Silakan coba pilihan lainnya!';

          selected = null;
          check.disabled = true;

          choices.forEach(button => {
            button.classList.remove('selected');
          });

        } else {
          finished = true;

          choices.forEach(button => {
            button.disabled = true;

            if (button.dataset.answer === answerKey) {
              button.classList.add('right');
            }
          });

          check.disabled = true;

          feed.className = 'card-question-feedback bad';
          feed.textContent =
            `✘ Jawaban belum tepat. Jawaban yang benar adalah ${answerKey}.`;

          next.hidden = false;
        }
      }
    });

    // Lanjut setelah jawaban diperiksa
    next.addEventListener('click', () => {
      M.close();

      resolve({
        correct: selected === answerKey,
        tries
      });
    });

  });
}

 /* ---------- LATIHAN KUIS ---------- */
async function practiceQuiz() {
    const who = S.players[S.cur] || {
        name: 'Latihan',
        img: CHARACTERS[0].img
    };

    const tile = TILES[4];
    const source = QUESTIONS[4];

    if (!Array.isArray(source) || source.length === 0) {
        note('Soal latihan belum tersedia.');
        return;
    }

    const qs = shuffle(source).slice(0, 5);
    let ok = 0;

    // Tampilkan soal satu per satu
    for (const qq of qs) {
        const opts = shuffle(
            qq.o.map((t, i) => ({
                t,
                ok: i === qq.a
            }))
        );

        const result = await questionModal({
            tile,
            qq,
            opts,
            base: 0,
            p: who,
            practice: true
        });

        if (result.correct) {
            ok++;
        }
    }

    // Tampilkan hasil latihan
    const M = modal(
        `<h1>📖 Latihan Selesai</h1>
         <h2 class="center-t" style="margin:10px 0">
            Skor: ${ok} / ${qs.length}
         </h2>
         <p class="center-t">
            Latihan ini tidak memengaruhi poin permainan.
         </p>
         <div class="qfoot">
            <button class="btn green" id="ok">Tutup</button>
         </div>`,
        'qcard'
    );

    await waitClick($('#ok', M.card), M.close);
}

function openSettings() {
    const t0 = Date.now();

    const M = modal(`
        <button class="close-x" aria-label="Tutup">✕</button>

        <div class="settings-body">

            <!-- EFEK SUARA -->
            <div class="settings-row sound-row">
                <div class="settings-icon sound-icon">
                    <img src="assets/pengaturan/ikon-efek-suara.png" alt="">
                </div>

                <span class="settings-label">Efek Suara</span>

                <button class="settings-toggle" id="sSnd"></button>
            </div>

            <!-- MUSIK LATAR -->
            <div class="settings-row music-row">
                <div class="settings-icon music-icon">
                    <img src="assets/pengaturan/ikon-musik.png" alt="">
                </div>

                <span class="settings-label">Musik Latar</span>

                <button class="settings-toggle" id="sMusic"></button>
            </div>

            <!-- VOLUME MUSIK -->
            <div class="settings-row volume-row">
                <div class="settings-icon volume-icon">
                    <img src="assets/pengaturan/ikon-volume-baru.png" alt="">
                </div>

                <span class="settings-label">Volume Musik</span>

                <div class="volume-control">
                    <input type="range"
                        id="sVolume"
                        min="0"
                        max="100"
                        value="${Math.round(S.musicVolume * 100)}">

                    <span id="sVolumeValue">
                        ${Math.round(S.musicVolume * 100)}%
                    </span>
                </div>
            </div>

            <!-- UKURAN TEKS -->
            <div class="settings-row text-row">
                <div class="settings-icon text-icon">
                    <img src="assets/pengaturan/ikon-teks-baru.png" alt="">
                </div>

                <span class="settings-label">Ukuran Teks</span>

                <div class="settings-size-picker">

                    <button type="button"
                        id="sTextTrigger"
                        class="settings-select-trigger"
                        aria-expanded="false">

                        <span id="sTextCurrent">Normal</span>
                        <span class="select-arrow">▼</span>
                    </button>

                    <div class="settings-size-menu"
                        id="sTextMenu" hidden>

                        <button type="button"
                            class="size-option size-small"
                            data-size="small">Kecil</button>

                        <button type="button"
                            class="size-option size-normal"
                            data-size="normal">Normal</button>

                        <button type="button"
                            class="size-option size-big"
                            data-size="big">Besar</button>
                    </div>

                    <select id="sText" hidden>
                        <option value="small">Kecil</option>
                        <option value="normal">Normal</option>
                        <option value="big">Besar</option>
                    </select>
                </div>
            </div>

            <!-- CARA BERMAIN -->
            <div class="settings-row rules-row">
                <div class="settings-icon rules-icon">
                    <img src="assets/pengaturan/ikon-panduan.png" alt="">
                </div>

                <span class="settings-label">Cara Bermain</span>

                <button class="settings-guide" id="sRules">
                    Lihat Panduan
                </button>
            </div>
           

<!-- AKHIRI SETELAH GILIRAN INI -->
<div class="settings-row end-turn-row">
    <button type="button"
        class="settings-end"
        id="sEndTurn"
        aria-label="Akhiri setelah giliran ini">
    </button>
</div>

<!-- MULAI ULANG DARI AWAL -->
<div class="settings-row restart-row">
    <button type="button"
        class="settings-restart"
        id="sRestart"
        aria-label="Mulai ulang dari awal">
    </button>
</div>

<!-- KEMBALI KE GAME -->
<button type="button" class="settings-back" id="sBack"
    aria-label="Kembali ke Game">
    <img
    src="assets/pengaturan/tombol-kembali-baru.png"
    alt="Kembali ke Permainan">
</button>

    `, 'qcard settings-popup');

    // =================================
    // UPDATE TAMPILAN
    // =================================

    function updateSettings() {
        const snd = $('#sSnd', M.card);
        const music = $('#sMusic', M.card);

        snd.classList.toggle('active', S.sound);
        snd.textContent = S.sound ? 'Hidup' : 'Mati';

        music.classList.toggle('active', S.music);
        music.textContent = S.music ? 'Hidup' : 'Mati';
    }

    // =================================
    // UKURAN TEKS
    // =================================

    const textTrigger = $('#sTextTrigger', M.card);
    const textMenu = $('#sTextMenu', M.card);
    const textCurrent = $('#sTextCurrent', M.card);
    const textSelect = $('#sText', M.card);

    const sizeButtons = [
        ...M.card.querySelectorAll('.size-option')
    ];

    const sizeNames = {
        small: 'Kecil',
        normal: 'Normal',
        big: 'Besar'
    };

    function applyTextSize(size) {
        stage.classList.remove('small', 'big');

        if (size === 'small') {
            stage.classList.add('small');
        } else if (size === 'big') {
            stage.classList.add('big');
        }

        textSelect.value = size;
        textCurrent.textContent = sizeNames[size];

        sizeButtons.forEach(button => {
            button.classList.toggle(
                'is-selected',
                button.dataset.size === size
            );
        });
    }

    // Dropdown
    textTrigger.onclick = (e) => {
        e.stopPropagation();

        textMenu.hidden = !textMenu.hidden;

        textTrigger.setAttribute(
            'aria-expanded',
            String(!textMenu.hidden)
        );
    };

    // Pilih ukuran
    sizeButtons.forEach(button => {
        button.onclick = (e) => {
            e.stopPropagation();

            applyTextSize(button.dataset.size);

            textMenu.hidden = true;
            textTrigger.setAttribute('aria-expanded', 'false');
        };
    });

    // Tutup dropdown jika klik di luar
    M.card.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-size-picker')) {
            textMenu.hidden = true;
            textTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    // Ambil ukuran yang sedang aktif
    const currentSize = stage.classList.contains('small')
        ? 'small'
        : stage.classList.contains('big')
            ? 'big'
            : 'normal';

    applyTextSize(currentSize);

    // =================================
    // TOMBOL PENGATURAN
    // =================================

    updateSettings();

    $('#sSnd', M.card).onclick = () => {
        S.sound = !S.sound;
        updateSettings();
    };

    $('#sMusic', M.card).onclick = () => {
        S.music = !S.music;
        bgmSync();
        updateSettings();
    };

    $('#sVolume', M.card).oninput = (e) => {
        S.musicVolume = Number(e.target.value) / 100;

        bgm.volume = S.musicVolume;

        $('#sVolumeValue', M.card).textContent =
            e.target.value + '%';
    };

    function closeSettings() {
        if (S.running) {
            S.endAt += Date.now() - t0;
        }

        M.close();
    }

    $('.close-x', M.card).onclick = closeSettings;

    $('#sRules', M.card).onclick = () => {
        closeSettings();
        openRules();
    };
// =================================
// AKHIRI SETELAH GILIRAN INI
// =================================

$('#sEndTurn', M.card).onclick = () => {

    if (!S.running || S.over) {
        alert('Permainan belum dimulai.');
        return;
    }

    const yakin = confirm(
        'Apakah kamu yakin ingin mengakhiri permainan setelah giliran pemain yang sedang berjalan selesai?'
    );

    if (!yakin) return;

    S.forceEnd = true;

    closeSettings();

    note('Permainan akan berakhir setelah giliran ini selesai.');
};


// =================================
// MULAI ULANG DARI AWAL
// =================================

$('#sRestart', M.card).onclick = () => {

    const yakin = confirm(
        'Apakah kamu yakin ingin memulai ulang permainan? Semua poin dan progres permainan akan direset.'
    );

    if (!yakin) return;

    closeSettings();

    location.reload();

};

    $('#sBack', M.card).onclick = closeSettings;
}

$('#gear').onclick = openSettings;
$('#btnPamali').onclick = openPamaliLibrary;
$('#btnKuis').onclick = practiceQuiz;


/* ---------- Layar awal ---------- */
function showSetup() {
  let chosen = new Set(CHARACTERS.map(c => c.id));
  let minutes = CONFIG.DEFAULT_DURATION;

  const M = modal(
    `<div class="setup-content">

     
<div class="charpick">
    ${CHARACTERS.map(c => `
        <button data-id="${c.id}" class="sel" style="--c:${c.color}">
            <img src="${c.setupImg || c.img}" alt="${c.name}">
        </button>
    `).join('')}
</div>


      <div class="durs">
        ${CONFIG.DURATIONS.map(d => `
          <button data-d="${d}" class="${d === minutes ? 'sel' : ''}">
            ${d} menit
          </button>
        `).join('')}
      </div>
<div class="qfoot setup-buttons">
    <!-- TOMBOL MULAI PETUALANGAN -->
    <button class="btn green" id="start">
        <img
            src="assets/ikon play.png"
            class="play-icon"
            alt=""
        >
        <span>Mulai Petualangan</span>
    </button>
    <!-- TOMBOL CARA BERMAIN -->
    <button class="btn gold" id="how">
        <img
           src="assets/pengaturan/ikon-panduan.png"
            class="how-icon"
            alt=""
        >
        <span>Cara Bermain</span>

    </button>
</div>
    </div>`,
    'qcard',
    'setup'
  );

  const startBtn = $('#start', M.card);

  M.card.querySelectorAll('.charpick button').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.id;

      chosen.has(id)
        ? chosen.delete(id)
        : chosen.add(id);

      b.classList.toggle('sel', chosen.has(id));
      startBtn.disabled = chosen.size < 2;
    };
  });

  M.card.querySelectorAll('.durs button').forEach(b => {
    b.onclick = () => {
      minutes = +b.dataset.d;

      M.card.querySelectorAll('.durs button')
        .forEach(x => x.classList.toggle('sel', x === b));
    };
  });

  $('#how', M.card).onclick = openRules;

  startBtn.onclick = () => {

  // Cegah klik tombol Mulai berulang
  if (S.running) return;

  startBtn.disabled = true;

  const root = document.documentElement;

  if (!document.fullscreenElement && root.requestFullscreen) {
    root.requestFullscreen().then(() => {
      fit();
    }).catch(() => {
      fit();
    });
  }

  M.close();
  startGame([...chosen], minutes);
};
}


function startGame(ids, minutes) {

  // Cegah permainan dimulai lebih dari satu kali
  if (S.running) return;

  S.players = CHARACTERS.filter(c => ids.includes(c.id)).map(c => ({
    ...c,
    points: CONFIG.START_POINTS,
    pos: 0,
    streak: 0,
    jail: 0,
    correct: 0,
    wrong: 0,
    earned: 0
  }));

  S.cur = 0;
  S.decks = {};
  S.over = false;
  S.timeUp = false;
  S.forceEnd = false;

  S.minutes = minutes;
  S.endAt = Date.now() + minutes * 60000;

  // Tandai permainan sudah berjalan sebelum gameLoop dipanggil
  S.running = true;

  buildBoard();
  renderHUD();
  renderPawns();
  tickTimer();
  bgmSync();

  say(MASCOT.start);
  showInfo(TILES[0], false);

  gameLoop();
}


/* ---------- Mulai ---------- */
buildBoard(); setFace(5); showSetup();
window.__POLY = { S, CONFIG, TILES, startGame };   // untuk pengujian/debug di konsol
})();
