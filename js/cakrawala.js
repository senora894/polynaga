
(() => {
    'use strict';

    const menuKategori = document.getElementById('cakrawalaKategori');
    const tombolMulai = document.getElementById('btnKlikCakrawala');
    const tombolTutup = document.getElementById('btnTutupCakrawala');
    const tombolKembali = document.getElementById('tutupKategori');

    if (!menuKategori || !tombolMulai) {
        console.error('Menu Kartu Cakrawala tidak ditemukan.');
        return;
    }

    // Panel dibuat langsung di BODY, bukan di dalam poster.
    const overlay = document.createElement('div');
    overlay.id = 'cakrawalaLibraryOverlay';
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="cakrawala-library-window">
            <button class="cakrawala-library-close" type="button">✕</button>
            <div class="cakrawala-library-content"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const content = overlay.querySelector('.cakrawala-library-content');

    let kategoriAktif = '';
    let kartuAktif = [];
    let indeksAktif = 0;

    const kategori = {
        pancasila: {
            nama: 'Kartu Kuis Pancasila',
            folder: 'pancasila',
            file: 'Pancasila'
        },
        sejarah: {
            nama: 'Kartu Sejarah',
            folder: 'sejarah',
            file: 'Sejarah'
        },
        pamali: {
            nama: 'Kartu Pamali',
            folder: 'pamali',
            file: 'Pamali'
        },
        funfact: {
            nama: 'Kartu Fun Fact',
            folder: 'fun-fact',
            file: 'Fun Fact'
        }
    };

    function escapeHTML(teks) {
        return String(teks ?? '').replace(/[&<>"']/g, karakter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[karakter]);
    }

    function ambilKartu(jenis) {
        if (jenis === 'pancasila') {
            return (QUESTIONS[4] || []).map((data, i) => ({
                judul: `Kartu Pancasila ${i + 1}`,
                gambar: `assets/kartu/pancasila/Kartu Pancasila (${i + 1}).png`
            }));
        }

        if (jenis === 'sejarah') {
            return (QUESTIONS[13] || []).map((data, i) => ({
                judul: `Kartu Sejarah ${i + 1}`,
                gambar: `assets/kartu/sejarah/Kartu Sejarah (${i + 1}).png`
            }));
        }

        if (jenis === 'pamali') {
            return (PAMALI_CARDS || []).map((data, i) => ({
                judul: data.title || `Kartu Pamali ${i + 1}`,
                gambar: `assets/kartu/pamali/Kartu Pamali (${i + 1}).png`
            }));
        }

        if (jenis === 'funfact') {
            return (FUN_FACTS || []).map(data => ({
                judul: data.title || `Kartu Fun Fact ${data.id}`,
                gambar: data.image
            }));
        }

        return [];
    }

    function bukaOverlay() {
        overlay.hidden = false;
        document.body.classList.add('cakrawala-library-open');
    }

    function tutupOverlay() {
        overlay.hidden = true;
        document.body.classList.remove('cakrawala-library-open');
    }

    function kembaliKategori() {
        content.innerHTML = '';
        tutupOverlay();
        menuKategori.hidden = false;
    }

    function tampilkanDaftar(jenis) {
        kategoriAktif = jenis;
        kartuAktif = ambilKartu(jenis);

        if (!kartuAktif.length) {
            alert('Kartu untuk kategori ini belum ditemukan.');
            return;
        }

        menuKategori.hidden = true;
        bukaOverlay();

        content.innerHTML = `
            <h2>${escapeHTML(kategori[jenis].nama)}</h2>
            <p class="cakrawala-library-instruction">
                Pilih gambar kartu untuk melihat ukuran lengkapnya.
            </p>

            <div class="cakrawala-image-grid">
                ${kartuAktif.map((kartu, i) => `
                    <button
                        class="cakrawala-image-item"
                        type="button"
                        data-index="${i}"
                        aria-label="Buka ${escapeHTML(kartu.judul)}">

                        <img
                            src="${escapeHTML(kartu.gambar)}"
                            alt="${escapeHTML(kartu.judul)}"
                            loading="lazy"
                        >

                        <span>${escapeHTML(kartu.judul)}</span>
                    </button>
                `).join('')}
            </div>

            <button class="cakrawala-library-back" type="button">
                ← Kembali ke Kategori
            </button>
        `;

        content.querySelectorAll('.cakrawala-image-item').forEach(tombol => {
            tombol.addEventListener('click', () => {
                tampilkanDetail(Number(tombol.dataset.index));
            });
        });

        content.querySelector('.cakrawala-library-back')
            .addEventListener('click', kembaliKategori);
    }

    function tampilkanDetail(index) {
        if (!kartuAktif[index]) return;

        indeksAktif = index;
        const kartu = kartuAktif[index];

        content.innerHTML = `
            <h2>${escapeHTML(kategori[kategoriAktif].nama)}</h2>

            <div class="cakrawala-full-card">
                <img
                    src="${escapeHTML(kartu.gambar)}"
                    alt="${escapeHTML(kartu.judul)}"
                >
            </div>

            <div class="cakrawala-detail-caption">
                ${escapeHTML(kartu.judul)}
                <span>${index + 1} / ${kartuAktif.length}</span>
            </div>

            <div class="cakrawala-detail-navigation">
                <button
                    class="cakrawala-library-back"
                    id="cakrawalaPrev"
                    type="button"
                    ${index === 0 ? 'disabled' : ''}>
                    ← Sebelumnya
                </button>

                <button
                    class="cakrawala-library-back"
                    id="cakrawalaToList"
                    type="button">
                    Daftar Kartu
                </button>

                <button
                    class="cakrawala-library-back"
                    id="cakrawalaNext"
                    type="button"
                    ${index === kartuAktif.length - 1 ? 'disabled' : ''}>
                    Berikutnya →
                </button>
            </div>
        `;

        content.querySelector('#cakrawalaToList')
            .addEventListener('click', () => tampilkanDaftar(kategoriAktif));

        content.querySelector('#cakrawalaPrev')
            .addEventListener('click', () => tampilkanDetail(indeksAktif - 1));

        content.querySelector('#cakrawalaNext')
            .addEventListener('click', () => tampilkanDetail(indeksAktif + 1));
    }

    // Buka pilihan kategori dari poster.
    tombolMulai.addEventListener('click', () => {
        menuKategori.hidden = false;
    });

    // Buka kumpulan gambar kartu.
    menuKategori.querySelectorAll('.pilih-kartu').forEach(tombol => {
        tombol.addEventListener('click', () => {
            const jenis = tombol.dataset.category;
            if (kategori[jenis]) tampilkanDaftar(jenis);
        });
    });

    // Kembali dari kategori ke poster.
    tombolKembali?.addEventListener('click', () => {
        menuKategori.hidden = true;
        tutupOverlay();
    });

    // Tutup jendela perpustakaan.
    overlay.querySelector('.cakrawala-library-close')
        .addEventListener('click', () => {
            kembaliKategori();
        });

    // Tutup poster.
    tombolTutup?.addEventListener('click', () => {
        menuKategori.hidden = true;
        tutupOverlay();
    });

})();
