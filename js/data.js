/* =====================================================================
   POLYNAGA – DATA GAME
   Semua isi (petak, soal, kartu) ada di file ini supaya mudah diedit
   oleh tim konten tanpa menyentuh kode permainan.
   ===================================================================== */

/* ---------- PENGATURAN (silakan diubah sesuai kebutuhan kelas) ---------- */
const CONFIG = {
  START_POINTS: 0,                  // Poin Modal Sosial awal (sesuai gambar)
  POINTS_BY_LEVEL: { 1: 10, 2: 20, 3: 30 }, // mudah / sedang / sulit (catatan evaluasi 31/10)
  RETRY_FACTOR: 0.5,                   // jawab benar di percobaan ke-2 = setengah poin
  STREAK_BONUS: 30,                    // bonus jawab benar 3x berturut-turut
  STREAK_NEEDED: 3,
  PASS_START_BONUS: 0,                // tiap melewati START (panduan: 200, "dapat disesuaikan")
  FINISH_BONUS: 100,                   // bonus mendarat di FINISH
  PENALTY_BY_LEVEL: { 1: 20, 2: 40, 3: 60 }, // salah di petak milik pemain lain -> poin ke pemilik
  JAIL_FEE: 50,                        // bayar untuk keluar dari Di-Dibuang
  JAIL_ESCAPE_ROLL: 5,                 // lempar >= angka ini untuk keluar
  JAIL_MAX_TURNS: 3,                   // otomatis bebas setelah n giliran
  GOTONG_ROYONG_GIFT: 10,              // tiap pemain menyumbang ke pemain poin terendah
  DURATIONS: [15, 30, 45],             // pilihan durasi (menit)
  DEFAULT_DURATION: 45
};

/* ---------- PEMAIN (bidak karakter) ---------- */

const CHARACTERS = [
  {
    id: 'kuncen',
    name: 'Kuncen',
    role: 'Pemimpin adat & penjaga leluhur',
    color: '#2f7dd8',

    // GAMBAR TAMPILAN AWAL PEMILIHAN KARAKTER
    setupImg: 'assets/karakter-kuncen.png',

    // GAMBAR AVATAR SAAT PERMAINAN BERLANGSUNG
    img: 'assets/kuncen.png',

    pawnIdle: 'assets/karakter/kuncen-idle.png',
    pawnWalk: 'assets/karakter/kuncen-walk.png',
    walkFrames: 6
  },
  {
    id: 'lebe',
    name: 'Lebe',
    role: 'Pengurus urusan keagamaan',
    color: '#f0a020',

    setupImg: 'assets/karakter-lebe.jpeg',
    img: 'assets/lebe.png',

    pawnIdle: 'assets/karakter/lebe-idle.png',
    pawnWalk: 'assets/karakter/lebe-walk.png',
    walkFrames: 6
  },
  {
    id: 'punduh',
    name: 'Punduh',
    role: 'Pengurus urusan kemasyarakatan',
    color: '#5aa83a',

    setupImg: 'assets/karakter-punduh.png',
    img: 'assets/punduh.png',

    pawnIdle: 'assets/karakter/punduh-idle.png',
    pawnWalk: 'assets/karakter/punduh-walk.png',
    walkFrames: 6
  },
  {
    id: 'sanaga',
    name: 'Warga Sanaga',
    role: 'Warga yang gemar bergotong royong',
    color: '#8b4fc4',

    setupImg: 'assets/karakter-sanaga.png',
    img: 'assets/sanaga.png',

    pawnIdle: 'assets/karakter/sanaga-idle.png',
    pawnWalk: 'assets/karakter/sanaga-walk.png',
    walkFrames: 6
  }
];


/* ---------- PETAK (urut searah jarum jam dari START) ----------
   pos = [baris, kolom] pada grid 5x5 papan.
   type: start | q (soal) | pamali | funfact | bale | gotong | finish | jail | pass | free
   level: 1 mudah, 2 sedang, 3 sulit (hanya untuk type q)
   focus: posisi gambar kampung untuk panel informasi (x% y% zoom%)
*/

const TILES = [

  // ==========================================
  // SISI KIRI PAPAN
  // ==========================================
{
    id: 0,
    name: 'START (AYO PERGI)',
    type: 'start',
    pos: [6,1],
    image: 'assets/petak/petak 01.jpeg',
     infoImage: 'assets/petak/start-info.jpg',

    desc: 'START merupakan titik awal perjalanan seluruh pemain dalam menjelajahi Kampung Naga. Setiap pemain memulai permainan dari petak ini.',

    pesan: 'Ayo mulai petualanganmu! Jelajahi Kampung Naga, pelajari budayanya, dan kumpulkan poin melalui setiap tantangan.',

    focus: [10, 90, 160]
  },   

{
    id: 1,
    name: 'Masjid Kampung',
    type: 'q',
    pos: [5,1],
    image: 'assets/petak/petak 02.png',
    infoImage: 'assets/petak/masjid-kampung-info.png',

    cardCategory: 'sejarah',
    icon: '📜',
    level: 1,
    points: 10,

    desc: 'Petak budaya Masjid Kampung.',
    pesan: 'Masjid Kampung menjadi bagian penting kehidupan masyarakat. Pelajari nilai kehidupan beragama dan kerukunan masyarakat melalui Kartu Kuis Pancasila.',

    focus: [80, 85, 180]
},

  {
    id: 2,
    name: 'FUN FACT',
    type: 'funfact',
    pos: [4,1],
    image: 'assets/petak/petak 03.jpeg',
     infoImage: 'assets/petak/fun-fact-info.jpg',
   desc: 'Petak khusus Kartu Fun Fact yang menyajikan informasi menarik tentang kehidupan, budaya, adat istiadat, dan nilai-nilai masyarakat Kampung Naga.',

    pesan: 'Selamat datang di petak Fun Fact! Ambil satu Kartu Fun Fact, baca informasi budaya, dan jalankan instruksi yang terdapat pada kartu.',

    focus: [5, 30, 170]
  },

{
    id: 3,
    name: 'Kawasan Budidaya',
    type: 'q',
    pos: [3,1],
    image: 'assets/petak/petak 04.jpeg',
     infoImage: 'assets/petak/kawasan-budidaya.jpg',
     cardCategory: 'pamali',
icon: '🌱',
level: 3,
points: 30,

    desc: 'Kawasan Budidaya merupakan area yang dimanfaatkan masyarakat Kampung Naga untuk mengelola dan mengembangkan berbagai kebutuhan kehidupan sehari-hari.',

    pesan: 'Mari belajar menghargai pemanfaatan alam secara bijaksana, menjaga kelestarian lingkungan, dan memanfaatkan sumber daya alam secara bertanggung jawab.',

    focus: [5, 30, 170]
}, 
{
    id: 4,
    name: 'Bumi Ageung',
    type: 'q',
    level: 2,
    pos: [2,1],
    image: 'assets/petak/petak 05.png',
     infoImage: 'assets/petak/bumi-ageung.jpg',

     cardCategory: 'pancasila',
icon: '🏛️',
level: 2,
points: 20,
    desc: 'Bumi Ageung merupakan salah satu bangunan penting dan dihormati oleh masyarakat Kampung Naga. Bangunan ini menjadi bagian dari warisan sejarah dan tradisi leluhur.',

    pesan: 'Kenali sejarah Bumi Ageung dan pelajari pentingnya menjaga warisan budaya serta menghormati adat istiadat masyarakat Kampung Naga.',

    focus: [20, 20, 160]
},
  // ==========================================
  // SISI ATAS PAPAN
  // ==========================================
  {
  id: 5,
  name: 'Hutan Larangan',
  type: 'pass',
  pos: [1,1],
  image: 'assets/petak/petak 06.jpeg',
  infoImage: 'assets/petak/hutan-larangan.jpg',
  desc: 'Hutan Larangan merupakan kawasan hutan yang dijaga dan dihormati oleh masyarakat Kampung Naga. Kawasan ini memiliki aturan adat yang harus dipatuhi dan tidak boleh dimasuki sembarangan.',
  pesan: 'Hormati aturan adat dan jagalah kelestarian alam. Hutan bukan untuk dirusak, melainkan untuk dilestarikan.',
  focus: [95, 80, 200]
},
{
  id: 6,
  name: 'Rumah Panggung',
  type: 'q',
  level: 2,
  pos: [1,2],
  image: 'assets/petak/petak 07.png',
   infoImage: 'assets/petak/rumah-panggung.jpg',
  cardCategory: 'pamali',
icon: '🏡',
level: 3,
points: 30,
  desc: 'Rumah Panggung merupakan bentuk rumah tradisional masyarakat Kampung Naga yang dibangun dengan struktur panggung. Bentuk bangunan ini mencerminkan kearifan lokal dalam menyesuaikan tempat tinggal dengan kondisi lingkungan.',
  pesan: 'Mari mengenal keunikan Rumah Panggung dan menghargai kearifan lokal sebagai bagian dari warisan budaya Indonesia.',
  focus: [50, 50, 100]
},

 {
  id: 7,
  name: 'Lumbung Padi Bersama',
  type: 'q',
  level: 2,
  pos: [1,3],
  image: 'assets/petak/petak 08.png',
  infoImage: 'assets/petak/lumbung-padi.jpg',
  cardCategory: 'sejarah',
icon: '🌾',
level: 1,
points: 10,
  desc: 'Lumbung Padi Bersama merupakan tempat penyimpanan hasil panen masyarakat Kampung Naga. Keberadaannya membantu menjaga persediaan pangan dan mencerminkan kebiasaan masyarakat dalam mengelola hasil pertanian secara bersama-sama.',
  pesan: 'Mari belajar menjaga ketahanan pangan, berbagi dengan sesama, dan menghargai kebersamaan dalam kehidupan masyarakat.',
  focus: [30, 40, 150]
},

 {
  id: 8,
  name: 'FUN FACT',
  type: 'funfact',
  pos: [1,4],
  image: 'assets/petak/petak 09.jpeg',
  desc: 'Petak Fun Fact berisi informasi menarik seputar kehidupan, tradisi, adat istiadat, dan kebudayaan masyarakat Kampung Naga.',
  pesan: 'Yuk, temukan fakta-fakta menarik tentang Kampung Naga! Bacalah kartu Fun Fact dan tambahkan pengetahuan baru tentang kekayaan budaya Indonesia.',
  focus: [95, 75, 190]
},
  {
  id: 9,
  name: 'Bangunan Penumbuk Padi',
  type: 'q',
  level: 2,
  pos: [1,5],
  image: 'assets/petak/petak 10.png',
   infoImage: 'assets/petak/bangunan-penumbuk-padi.jpg',
 cardCategory: 'pancasila',
icon: '🌾',
level: 2,
points: 20,
  desc: 'Bangunan Penumbuk Padi merupakan tempat masyarakat mengolah hasil panen dengan menggunakan alat tradisional seperti lisung dan alu. Kegiatan ini juga mencerminkan kebersamaan dan gotong royong warga Kampung Naga.',
  pesan: 'Mari menghargai tradisi pengolahan padi dan semangat gotong royong yang diwariskan oleh masyarakat Kampung Naga.',
  focus: [40, 55, 190]
},
  // ==========================================
  // SISI KANAN PAPAN
  // ==========================================
{
  id: 10,
  name: 'BEBAS SINGGAH',
  type: 'free',
  pos: [1,6],
  image: 'assets/petak/petak 11.jpeg',
  infoImage: 'assets/petak/bebas-singgah.jpg',
  desc: 'Petak Bebas Singgah memberikan kesempatan kepada pemain untuk memilih petak tujuan sesuai strategi permainan.',
  pesan: 'Manfaatkan kesempatan ini dengan bijak! Pilih petak tujuanmu dan susun strategi terbaik untuk melanjutkan petualangan.',
  focus: [40, 100, 200]
},
 {
  id: 11,
  name: 'FUN FACT',
  type: 'funfact',
  pos: [2,6],
  image: 'assets/petak/petak 12.jpeg',
   infoImage: 'assets/petak/fun-fact-info.jpg',
  desc: 'Petak Fun Fact berisi berbagai informasi unik dan menarik mengenai kehidupan sehari-hari, tradisi, serta kebudayaan masyarakat Kampung Naga.',
  pesan: 'Ayo tambah pengetahuanmu! Baca kartu Fun Fact dan temukan hal-hal menarik yang mungkin belum pernah kamu ketahui tentang Kampung Naga.',
  focus: [60, 70, 150]
},

  {
  id: 12,
  name: 'Sungai Ciwulan',
  type: 'q',
  level: 1,
  pos: [3,6],
  image: 'assets/petak/petak 13.jpeg',
  infoImage: 'assets/petak/sungai-ciwulan.jpg',
  cardCategory: 'sejarah',
icon: '🌊',
level: 1,
points: 10,
  desc: 'Sungai Ciwulan merupakan sungai yang berada di sekitar kawasan Kampung Naga. Sungai ini memiliki peran penting bagi kehidupan masyarakat dan lingkungan sekitarnya.',
  pesan: 'Mari menjaga kebersihan sungai dan menggunakan sumber daya air secara bertanggung jawab demi kehidupan bersama.',
  focus: [70, 55, 190]
},

 {
  id: 13,
  name: 'Kawasan Budidaya',
  type: 'q',
  level: 2,
  pos: [4,6],
  image: 'assets/petak/petak 14.jpeg',
   infoImage: 'assets/petak/kawasan-budidaya.jpg',
 cardCategory: 'pamali',
icon: '🌱',
level: 3,
points: 30,
  desc: 'Kawasan Budidaya merupakan area yang dimanfaatkan masyarakat Kampung Naga untuk mengelola dan mengembangkan sumber daya alam sesuai kebutuhan kehidupan sehari-hari.',
  pesan: 'Mari memanfaatkan alam secara bijaksana, menjaga keseimbangan lingkungan, dan bertanggung jawab terhadap kelestarian sumber daya alam.',
  focus: [55, 35, 180]
},

  {
  id: 14,
  name: 'Bekas Tempat Beribadah',
  type: 'q',
  level: 2,
  pos: [5,6],
  image: 'assets/petak/petak 15.jpeg',
  infoImage: 'assets/petak/bekas-tempat.jpg',
 cardCategory: 'pancasila',
icon: '🕌',
level: 2,
points: 20,
  desc: 'Bekas Tempat Beribadah merupakan lokasi yang memiliki nilai sejarah dan berkaitan dengan kehidupan spiritual masyarakat pada masa lalu. Keberadaannya menjadi bagian dari jejak sejarah dan budaya Kampung Naga.',
  pesan: 'Mari menghargai peninggalan sejarah dan memahami bahwa tempat-tempat bersejarah menyimpan cerita serta nilai kehidupan masyarakat terdahulu.',
  focus: [5, 15, 190]
},
  // ==========================================
  // SISI BAWAH PAPAN
  // ==========================================

  {
  id: 15,
  name: 'Hutan Larangan',
  type: 'blocked',
  pos: [6,6],
  image: 'assets/petak/petak 16.jpeg',
   infoImage: 'assets/petak/hutan-larangan.jpg',
  desc: 'Hutan Larangan merupakan kawasan yang dijaga kelestariannya dan dihormati oleh masyarakat Kampung Naga. Kawasan ini memiliki aturan adat yang harus dipatuhi.',
  pesan: 'Hormati aturan adat dan jagalah kelestarian alam. Tidak semua kawasan boleh dimanfaatkan secara bebas.',
  focus: [30, 95, 150]
},

  {
  id: 16,
  name: 'Tangga dan Teras Rumah',
  type: 'q',
  level: 2,
  pos: [6,5],
  image: 'assets/petak/petak 17.jpeg',
   infoImage: 'assets/petak/rumah-panggung.jpg',
 cardCategory: 'pamali',
icon: '🏡',
level: 3,
points: 30,
  desc: 'Tangga dan teras rumah merupakan bagian dari rumah tradisional masyarakat Kampung Naga. Area ini menjadi bagian penting dari aktivitas sehari-hari, seperti menerima tamu dan berinteraksi dengan keluarga maupun tetangga.',
  pesan: 'Mari menghargai bentuk rumah tradisional dan kebiasaan masyarakat dalam menjaga kebersamaan serta kerukunan.',
  focus: [45, 85, 170]
},

  {
  id: 17,
  name: 'Sanitasi Bersama',
  type: 'q',
  level: 2,
  pos: [6,4],
  image: 'assets/petak/petak 18.jpeg',
   infoImage: 'assets/petak/sanitasi-bersama.jpg',
 cardCategory: 'sejarah',
icon: '💧',
level: 1,
points: 10,
  desc: 'Sanitasi Bersama merupakan fasilitas yang mendukung kebersihan dan kesehatan lingkungan masyarakat Kampung Naga. Pengelolaan sanitasi yang baik membantu menjaga kualitas air dan mencegah pencemaran lingkungan.',
  pesan: 'Menjaga kebersihan dan sanitasi merupakan tanggung jawab bersama. Mari membiasakan hidup bersih demi kesehatan seluruh masyarakat.',
  focus: [15, 80, 160]
},

 {
  id: 18,
  name: 'FUN FACT',
  type: 'funfact',
  pos: [6,3],
  image: 'assets/petak/petak 19.jpeg',
   infoImage: 'assets/petak/fun-fact-info.jpg',
  desc: 'Petak Fun Fact menyajikan informasi unik dan menarik seputar kehidupan, tradisi, adat istiadat, serta kebudayaan masyarakat Kampung Naga.',
  pesan: 'Yuk, baca kartu Fun Fact dan temukan pengetahuan baru tentang keunikan kehidupan masyarakat Kampung Naga!',
  focus: [50, 45, 170]
},

  {
 id: 19,
name: 'Hutan Keramat',
type: 'q',
level: 2,
cardCategory: 'pancasila',
icon: '🌳',
points: 20,
  pos: [6,2],
  image: 'assets/petak/petak 20.jpeg',
  infoImage: 'assets/petak/hutan-keramat.jpg',
  desc: 'Hutan Keramat merupakan kawasan yang disakralkan dan dihormati oleh masyarakat Kampung Naga. Kawasan ini memiliki nilai adat dan kepercayaan sehingga keberadaannya harus dijaga serta tidak boleh dimasuki sembarangan.',
  pesan: 'Hormati kawasan yang disakralkan dan patuhi aturan adat. Menjaga kelestarian alam juga berarti menghargai warisan leluhur.',
  focus: [10, 20, 180]
},

];


/* ---------- BANK SOAL (tiap petak punya beberapa soal, muncul bergantian) ----------
   answer = indeks jawaban benar (0-3). Urutan pilihan diacak otomatis saat tampil.
   CATATAN: soal ini draf awal. Mohon divalidasi guru/dosen PPKn sebelum dipakai di kelas. */
const QUESTIONS = {
  1: [ // Pancuran MCK (mudah)
    { q: 'MCK adalah singkatan dari…', o: ['Mandi, Cuci, Kakus', 'Makan, Cuci, Kerja', 'Masak, Cuci, Kebun', 'Mandi, Cukur, Kakus'], a: 0,
      e: 'MCK = Mandi, Cuci, Kakus: fasilitas umum yang perlu dijaga bersama.' },
    { q: 'Sikap yang tepat saat memakai fasilitas umum seperti pancuran adalah…', o: ['Menjaga kebersihan dan bergantian', 'Memakai selama mungkin', 'Meninggalkan sampah untuk dibersihkan orang lain', 'Mendahului antrean'], a: 0,
      e: 'Fasilitas umum dipakai bersama, sehingga kebersihan dan giliran harus dijaga.' },
    { q: 'Menghemat air dan tidak mencemari sumber air merupakan wujud…', o: ['Tanggung jawab bersama terhadap lingkungan', 'Kewajiban hanya petugas kebersihan', 'Kebiasaan yang tidak penting', 'Aturan khusus orang dewasa'], a: 0,
      e: 'Menjaga air adalah tanggung jawab seluruh warga, bukan hanya sebagian orang.' },
    { q: 'Setelah memakai fasilitas umum, sebaiknya kita…', o: ['Memastikan tempat tetap bersih untuk pengguna berikutnya', 'Langsung pergi tanpa memeriksa', 'Membiarkan keran terbuka', 'Meminta orang lain membersihkan'], a: 0,
      e: 'Peduli pada pengguna berikutnya adalah wujud tenggang rasa.' }
  ],
  4: [ // Kuis Pancasila (sedang)
    { q: 'Bunyi sila ke-4 Pancasila adalah…', o: ['Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan', 'Persatuan Indonesia', 'Kemanusiaan yang adil dan beradab', 'Keadilan sosial bagi seluruh rakyat Indonesia'], a: 0,
      e: 'Sila ke-4 menekankan musyawarah untuk mufakat.' },
    { q: 'Lambang sila ke-3 Pancasila pada Garuda Pancasila adalah…', o: ['Pohon beringin', 'Kepala banteng', 'Rantai', 'Padi dan kapas'], a: 0,
      e: 'Pohon beringin melambangkan persatuan Indonesia (sila ke-3).' },
    { q: 'Musyawarah mufakat di Bale Patemon paling mencerminkan sila ke…', o: ['4', '1', '2', '5'], a: 0,
      e: 'Musyawarah adalah inti dari sila ke-4.' },
    { q: 'Siapa yang menyampaikan pidato tentang dasar negara pada 1 Juni 1945?', o: ['Ir. Soekarno', 'Drs. Moh. Hatta', 'Prof. Soepomo', 'Moh. Yamin'], a: 0,
      e: '1 Juni 1945 diperingati sebagai Hari Lahir Pancasila.' },
    { q: 'Hidup sederhana dan tidak saling memamerkan kekayaan selaras dengan sila ke…', o: ['5 (Keadilan sosial)', '1 (Ketuhanan)', '2 (Kemanusiaan)', '3 (Persatuan)'], a: 0,
      e: 'Kesederhanaan mencegah kesenjangan dan mendukung keadilan sosial.' }
  ],
  5: [ // Saung Lisung (sedang)
    { q: 'Lisung (lesung) dipakai warga untuk…', o: ['Menumbuk padi', 'Menenun kain', 'Menyimpan air', 'Menangkap ikan'], a: 0,
      e: 'Lisung adalah alat tradisional untuk menumbuk padi.' },
    { q: 'Kegiatan menumbuk padi bersama-sama mencerminkan nilai…', o: ['Gotong royong', 'Persaingan', 'Individualisme', 'Kemewahan'], a: 0,
      e: 'Kerja bersama meringankan beban dan mempererat kebersamaan.' },
    { q: 'Leuit (lumbung padi) bersama berfungsi untuk…', o: ['Menyimpan cadangan padi untuk kebutuhan bersama', 'Tempat tinggal tamu', 'Tempat menjual padi dengan harga tinggi', 'Tempat bermain anak'], a: 0,
      e: 'Cadangan pangan bersama menjaga ketahanan pangan warga.' },
    { q: 'Ada warga menimbun beras saat panen kurang. Sikap yang sesuai sila ke-5 adalah…', o: ['Mengajak berbagi cadangan agar semua tercukupi', 'Ikut menimbun juga', 'Menjual beras dengan harga setinggi-tingginya', 'Membiarkannya saja'], a: 0,
      e: 'Keadilan sosial berarti memastikan kebutuhan dasar semua warga terpenuhi.' }
  ],
  9: [ // Imah Panggung (sedang)
    { q: 'Atap rumah adat Kampung Naga umumnya terbuat dari…', o: ['Ijuk, alang-alang, atau tepus', 'Seng', 'Beton', 'Kaca'], a: 0,
      e: 'Bahan alami lokal dipakai untuk atap rumah adat.' },
    { q: 'Dinding rumah adat Kampung Naga biasanya dibuat dari…', o: ['Bilik bambu', 'Batu bata', 'Kaca', 'Besi'], a: 0,
      e: 'Bilik bambu adalah anyaman bambu yang menjadi dinding rumah panggung.' },
    { q: 'Rumah warga dibuat seragam. Nilai yang diajarkan adalah…', o: ['Kesetaraan dan kesederhanaan', 'Persaingan kemewahan', 'Perbedaan status sosial', 'Keinginan untuk menonjol'], a: 0,
      e: 'Keseragaman mengurangi kesenjangan dan menumbuhkan kesetaraan (Sila ke-5).' },
    { q: 'Kampung Naga menjaga aturan adat tentang listrik di rumah. Sikap pengunjung yang tepat adalah…', o: ['Menghormati aturan adat setempat', 'Memasang listrik diam-diam', 'Mengabaikan aturan karena merasa lebih modern', 'Memaksa warga mengubah aturan'], a: 0,
      e: 'Menghormati adat setempat adalah bagian dari Bhinneka Tunggal Ika dan Sila ke-3.' }
  ],
  10: [ // Sungai Ciwulan (mudah)
    { q: 'Sungai yang mengalir di dekat Kampung Naga bernama…', o: ['Ciwulan', 'Citarum', 'Cisadane', 'Cimanuk'], a: 0,
      e: 'Sungai Ciwulan berada di dekat Kampung Naga, Tasikmalaya.' },
    { q: 'Perilaku yang tepat untuk menjaga sungai adalah…', o: ['Tidak membuang sampah ke sungai', 'Membuang sampah kecil saja', 'Membuang sampah malam hari', 'Mencuci dengan bahan kimia berlebihan'], a: 0,
      e: 'Sungai yang bersih menjaga kesehatan dan kehidupan bersama.' },
    { q: 'Jika melihat sampah di sungai, sikap terbaik adalah…', o: ['Mengajak orang lain bergotong royong membersihkannya', 'Pura-pura tidak melihat', 'Menyalahkan orang lain tanpa bertindak', 'Menambah sampah'], a: 0,
      e: 'Peduli dan bertindak bersama lebih efektif daripada hanya menyalahkan.' },
    { q: '"Leuweung lain ruksakeun tapi rawateun" mengajarkan bahwa hutan…', o: ['Jangan dirusak, tetapi dirawat', 'Boleh ditebang sebebasnya', 'Tidak perlu dipedulikan', 'Hanya milik pemerintah'], a: 0,
      e: 'Pepatah ini menekankan merawat alam agar tetap lestari.' }
  ],
  12: [ // Masjid (mudah)
    { q: 'Bunyi sila ke-1 Pancasila adalah…', o: ['Ketuhanan Yang Maha Esa', 'Persatuan Indonesia', 'Kemanusiaan yang adil dan beradab', 'Keadilan sosial bagi seluruh rakyat Indonesia'], a: 0,
      e: 'Sila ke-1 dilambangkan dengan bintang.' },
    { q: 'Agama Islam dan adat berjalan selaras di Kampung Naga. Ini menunjukkan nilai…', o: ['Keharmonisan dan toleransi', 'Perpecahan', 'Persaingan antarwarga', 'Ketidakpedulian'], a: 0,
      e: 'Agama dan kearifan lokal dapat saling melengkapi.' },
    { q: 'Sikap tepat terhadap teman yang sedang beribadah adalah…', o: ['Menghormati dan tidak mengganggu', 'Menertawakan', 'Mengajak bermain', 'Memaksa ikut'], a: 0,
      e: 'Toleransi beragama adalah pengamalan sila ke-1.' },
    { q: 'Mayoritas masyarakat Kampung Naga memeluk agama…', o: ['Islam', 'Hindu', 'Buddha', 'Kristen'], a: 0,
      e: 'Masyarakat Kampung Naga memadukan ajaran Islam dengan adat.' }
  ],
  13: [ // Bumi Ageung (sulit – sejarah)
    { q: 'BPUPKI dibentuk untuk…', o: ['Menyelidiki usaha-usaha persiapan kemerdekaan Indonesia', 'Menyusun anggaran negara', 'Memimpin perang kemerdekaan', 'Mengatur pemilu pertama'], a: 0,
      e: 'BPUPKI = Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia.' },
    { q: 'Sidang pertama BPUPKI berlangsung pada…', o: ['29 Mei – 1 Juni 1945', '10 – 17 Juli 1945', '17 Agustus 1945', '18 Agustus 1945'], a: 0,
      e: 'Pada sidang pertama inilah rumusan dasar negara dibahas.' },
    { q: 'Piagam Jakarta (22 Juni 1945) disusun oleh…', o: ['Panitia Sembilan', 'Panitia Lima', 'Panitia Tujuh', 'Panitia Persiapan Pemuda'], a: 0,
      e: 'Panitia Sembilan merumuskan Piagam Jakarta.' },
    { q: 'Siapa ketua PPKI (Panitia Persiapan Kemerdekaan Indonesia)?', o: ['Ir. Soekarno', 'Drs. Moh. Hatta', 'Dr. Radjiman Wedyodiningrat', 'Ki Hajar Dewantara'], a: 0,
      e: 'Soekarno menjadi ketua dan Moh. Hatta wakil ketua PPKI.' },
    { q: 'Pancasila disahkan sebagai dasar negara dalam sidang PPKI pada…', o: ['18 Agustus 1945', '1 Juni 1945', '17 Agustus 1945', '22 Juni 1945'], a: 0,
      e: 'Sehari setelah proklamasi, PPKI mengesahkan UUD 1945 beserta Pembukaannya.' }
  ]
};

/* ---------- KARTU PAMALI (dilema moral & ekologi) ----------
   Tiap pilihan: pts (poin), why (alasan). Pilihan terbaik = pts tertinggi. */
const PAMALI_CARDS = [
  { id: 1, title: 'Sampah di Sungai Ciwulan', icon: '🌊',
    story: 'Kamu melihat seorang pengunjung membuang bungkus makanan ke Sungai Ciwulan. Warga sekitar memakai air sungai itu setiap hari.',
    options: [
      { t: 'Menegur dengan sopan, menjelaskan aturan adat, lalu mengajak memungut bersama.', pts: 30, why: 'Menegur dengan sopan dan bergotong royong menjaga lingkungan sekaligus menghormati sesama.' },
      { t: 'Memungutnya sendiri diam-diam tanpa berkata apa pun.', pts: 10, why: 'Peduli, tetapi pengunjung tidak belajar dan kebiasaan buruknya bisa terulang.' },
      { t: 'Diam saja, itu bukan urusanku.', pts: 0, why: 'Sikap acuh membuat masalah lingkungan terus berlanjut.' }
    ] },
  { id: 2, title: 'Listrik di Imah Panggung', icon: '🏠',
    story: 'Seorang kerabat dari kota menawarkan memasang listrik dan pengisi daya di rumah panggung, padahal adat setempat membatasinya.',
    options: [
      { t: 'Bermusyawarah dengan warga dan tokoh adat untuk mencari jalan yang tidak melanggar adat.', pts: 30, why: 'Musyawarah (Sila ke-4) menjaga adat sekaligus menghargai niat baik kerabat.' },
      { t: 'Menolak tanpa mendengar alasan kerabat.', pts: 10, why: 'Menjaga adat itu baik, tetapi mendengarkan membuat hubungan tetap harmonis.' },
      { t: 'Memasangnya diam-diam agar praktis.', pts: 0, why: 'Melanggar adat dan merusak kepercayaan warga.' }
    ] },
  { id: 3, title: 'Penimbunan Beras', icon: '🌾',
    story: 'Saat panen kurang baik, seorang warga menimbun beras sehingga tetangga kesulitan mendapatkan pangan.',
    options: [
      { t: 'Mengajak bermusyawarah di Bale Patemon agar cadangan pangan dibagi secara adil.', pts: 30, why: 'Pembagian adil lewat musyawarah mencerminkan Sila ke-4 dan ke-5.' },
      { t: 'Melapor ke Punduh tanpa bicara dulu dengan yang bersangkutan.', pts: 10, why: 'Melapor bisa membantu, tetapi dialog langsung sering lebih menyelesaikan masalah.' },
      { t: 'Ikut menimbun supaya keluargaku aman.', pts: 0, why: 'Mementingkan diri sendiri memperparah ketidakadilan.' }
    ] },
  { id: 4, title: 'Mengajak Masuk Hutan Larangan', icon: '🌲',
    story: 'Temanmu mengajak masuk ke hutan larangan karena ingin berfoto di tempat yang "sepi dan indah".',
    options: [
      { t: 'Menolak dan menjelaskan bahwa hutan larangan dijaga oleh adat.', pts: 30, why: 'Menghormati aturan adat sekaligus mengedukasi teman.' },
      { t: 'Menolak, tetapi tidak menjelaskan apa pun.', pts: 10, why: 'Sudah benar menolak, tetapi edukasi membuat teman ikut paham.' },
      { t: 'Ikut masuk asalkan tidak mengambil apa pun.', pts: 0, why: 'Tetap melanggar larangan adat.' }
    ] },
  { id: 5, title: 'Memotret Tanpa Izin', icon: '📷',
    story: 'Seorang pengunjung memotret warga dan kegiatan adat tanpa meminta izin.',
    options: [
      { t: 'Mengingatkan agar meminta izin kepada warga atau pemandu terlebih dahulu.', pts: 30, why: 'Menghargai privasi dan martabat warga adalah wujud kemanusiaan yang beradab.' },
      { t: 'Ikut memotret karena orang lain juga melakukannya.', pts: 0, why: 'Perilaku orang banyak tidak otomatis benar.' },
      { t: 'Marah-marah di depan umum.', pts: 10, why: 'Niatnya benar, tetapi cara yang kasar tidak menyelesaikan masalah.' }
    ] },
  { id: 6, title: 'Menebang Pohon Besar', icon: '🪓',
    story: 'Seorang warga ingin menebang pohon besar di leuweung garapan untuk dijual cepat karena butuh uang.',
    options: [
      { t: 'Mengingatkan prinsip merawat hutan dan mencari cara pemanfaatan lestari, misalnya menanam pohon pengganti.', pts: 30, why: 'Pemanfaatan alam harus berkelanjutan: "leuweung lain ruksakeun tapi rawateun".' },
      { t: 'Melarang keras tanpa menawarkan solusi.', pts: 10, why: 'Tegas itu perlu, tetapi solusi bersama lebih efektif.' },
      { t: 'Membiarkan karena itu urusan pribadinya.', pts: 0, why: 'Kerusakan hutan berdampak pada seluruh warga.' }
    ] }
];


/* ---------- 30 KARTU FUN FACT POLYNAGA ---------- */
const FUN_FACTS = [
  { id: 1, title: 'Rumah Panggung', kind: 'move', move: 2 },

  { id: 2, title: 'Bumi Ageung', kind: 'challenge',
    question: null, move: 1, points: null },

  { id: 3, title: 'Bale Patemon', kind: 'challenge',
    question: 'Sebutkan sila Pancasila yang berkaitan dengan musyawarah!',
    move: 1, points: 5 },

  { id: 4, title: 'Masjid Kampung Naga', kind: 'challenge',
    question: 'Sebutkan bunyi sila pertama Pancasila!',
    points: 5 },

  { id: 5, title: 'Bahan Bangunan Alami', kind: 'move', move: 2 },

  { id: 6, title: 'Bangunan dan Identitas Budaya', kind: 'move', move: 2 },

  { id: 7, title: 'Ruang untuk Bermusyawarah', kind: 'partner',
    question: 'Sebutkan manfaat musyawarah!',
    points: 5, partnerMode: 'choose' },

  { id: 8, title: 'Hutan Larangan', kind: 'move', move: 2 },

  { id: 9, title: 'Menjaga Hutan', kind: 'challenge',
    question: 'Sebutkan tiga tindakan nyata untuk menjaga hutan!',
    points: 5 },

  { id: 10, title: 'Sungai Ciwulan', kind: 'move',
    move: 2, points: null },

  { id: 11, title: 'Leuweung Keramat', kind: 'move', move: 1 },

  { id: 12, title: 'Kebersihan Lingkungan', kind: 'partner',
    question: 'Sebutkan dua contoh gotong royong menjaga lingkungan!',
    points: 5, partnerMode: 'right' },

  { id: 13, title: 'Air Bersih untuk Semua', kind: 'move',
    move: 1, points: 5 },

  { id: 14, title: 'Bahasa Sunda', kind: 'challenge',
    question: 'Ucapkan satu kata atau ungkapan sederhana dalam bahasa Sunda beserta artinya!',
    move: 1 },

  { id: 15, title: 'Warisan Leluhur', kind: 'reroll' },

  { id: 16, title: 'Generasi Penerus Budaya', kind: 'move', move: 3 },

  { id: 17, title: 'Musyawarah untuk Mufakat', kind: 'challenge',
    question: 'Sebutkan sila Pancasila yang berkaitan dengan musyawarah!',
    move: 2, points: null },

  { id: 18, title: 'Gotong Royong', kind: 'challenge',
    question: 'Sebutkan satu contoh gotong royong di sekolah!',
    move: 2 },

  { id: 19, title: 'Menghargai Perbedaan', kind: 'challenge',
    question: 'Sebutkan satu tindakan yang mencerminkan persatuan dalam keberagaman!',
    points: 5 },

  { id: 20, title: 'Adil terhadap Sesama', kind: 'move', move: 1 },

  { id: 21, title: 'Tanggung Jawab Bersama', kind: 'challenge',
    question: 'Sebutkan lima kewajibanmu sebagai warga sekolah atau masyarakat!',
    points: 5 },

  { id: 22, title: 'Menghormati Keyakinan', kind: 'move', move: 2 },

  { id: 23, title: 'Menjaga Alam sebagai Tanggung Jawab', kind: 'challenge',
    question: 'Sebutkan tindakan nyata menjaga lingkungan yang dapat kamu lakukan mulai hari ini dan manfaatnya untuk masa depan!',
    points: 5 },

  { id: 24, title: 'Mengutamakan Kepentingan Bersama', kind: 'challenge',
    question: 'Berikan contoh situasi ketika kepentingan bersama perlu diutamakan!',
    move: 2 },

  { id: 25, title: 'Pancasila dalam Kehidupan Adat', kind: 'challenge',
    question: 'Pilih satu nilai Pancasila yang tercermin dalam kehidupan masyarakat Kampung Naga dan berikan contohnya!',
    points: 5 },

  { id: 26, title: 'Identitas Lokal Kebangsaan Nasional', kind: 'challenge',
    question: 'Sebutkan alasan budaya daerah perlu dilestarikan di tengah perkembangan zaman!',
    points: 5 },

  { id: 27, title: 'Kebersamaan Warga', kind: 'challenge',
    question: 'Sebutkan contoh gotong royong yang dilakukan warga di lingkungan tempat tinggalmu!',
    points: 5 },

  { id: 28, title: 'Menghormati Adat', kind: 'challenge',
    question: 'Sebutkan satu sikap yang menunjukkan penghormatan terhadap tradisi daerah lain!',
    points: 10 },

  { id: 29, title: 'Tradisi dan Identitas Bangsa', kind: 'move', move: 2 },

  { id: 30, title: 'Mengenal Pamali', kind: 'challenge',
    question: 'Sebutkan satu alasan mengapa masyarakat Kampung Naga memiliki aturan dan pantangan (pamali)!',
    move: 2 }
].map(card => ({
  ...card,
  image: `assets/kartu/fun-fact/Kartu Fun Fact (${card.id}).png`
}));


/* ---------- PESAN MASKOT ---------- */
const MASCOT = {
  start: 'Ayo, lempar dadu dan mulai petualangan!',
  roll: ['Semoga beruntung!', 'Dadu sudah di tanganmu!', 'Siap melangkah?'],
  right: ['Hebat! Jawabanmu tepat!', 'Mantap, Warga Sanaga sejati!', 'Betul sekali!'],
  wrong: ['Tidak apa-apa, belajar dari kesalahan.', 'Coba lagi, kamu pasti bisa!', 'Semangat!'],
  streak: 'Luar biasa! Tiga jawaban benar berturut-turut!',
  end: 'Terima kasih sudah menjaga Kampung Naga!'
};
