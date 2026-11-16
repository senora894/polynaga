# POLYNAGA – Petualangan Nilai & Budaya Kampung Naga (web game)

## Cara menjalankan di VS Code
1. Buka folder `polynaga` di VS Code (File → Open Folder).
2. Pasang ekstensi **Live Server** (Ritwick Dey), klik kanan `index.html` → *Open with Live Server*.
   (Atau cukup klik dua kali `index.html`; game ini tidak butuh internet.)

## Struktur
- `index.html`        kerangka halaman
- `css/style.css`     tampilan (meniru desain foto)
- `js/data.js`        **semua isi game**: petak, soal, Kartu Pamali, Fun Fact, pengaturan poin
- `js/game.js`        logika permainan
- `assets/`           gambar (avatar, maskot, ilustrasi kampung) + `audio/` untuk musik opsional

## Mengubah isi / aturan
- Tambah/ubah soal: `QUESTIONS` di `js/data.js` (kunci = nomor petak).
- Ubah poin, bonus, durasi, biaya penjara: objek `CONFIG` di `js/data.js`.
- Tambah petak (mis. jadi 20 petak seperti panduan): tambah entri di `TILES` + sesuaikan grid di CSS.

## Kontrol
Klik dadu (atau tekan Spasi/Enter) untuk melempar. Klik petak mana pun untuk melihat infonya.
