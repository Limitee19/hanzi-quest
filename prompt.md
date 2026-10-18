Tolong rombak total (complete redesign & refactor) UI aplikasi "Hanzi Quest" ini. Saat ini tampilannya terlalu kaku, generik (terlihat seperti AI-generated template standar dengan tumpukan kartu vertikal lebar penuh), dan menggunakan elemen form bawaan browser yang merusak suasana.

Kita akan mengubah arah desainnya menjadi **"Tactile Eastern Botanical / Cozy RPG Adventure"**—perpaduan antara estetika kartu fisik di atas kertas tradisional, jurnal petualangan RPG yang hangat, dan interaksi tombol 3D yang *juicy* (membal dan responsif).

Tolong terapkan seluruh spesifikasi arsitektur UI, aset eksternal, layout, dan interaktivitas berikut secara menyeluruh TANPA menghapus teks, data, maupun fungsi yang sudah ada:

---

### 1. INTEGRASI ASET EKSTERNAL, FONT, & TEKSTUR
- **Google Fonts:** Import dan terapkan kombinasi font berikut:
  - Heading & Judul Pos: `'Fraunces'` atau `'Playfair Display'` (memberikan kesan ukiran/buku klasik).
  - Karakter Mandarin/Hanzi: `'Noto Serif SC'` (agar karakter `漢` dan Hanzi lainnya tampil seperti kaligrafi cetak yang indah).
  - Body, UI, & Angka: `'Plus Jakarta Sans'` atau `'Nunito'` (ramah, membulat, dan mudah dibaca).
- **Icon Library Eksternal:** Import **Phosphor Icons** (via CDN `@phosphor-icons/web` dengan style `duotone` atau `fill`). Gunakan ikon yang relevan di semua tab navigasi atas, pengaturan sesi, dan tombol aksi.
- **Tekstur Kertas (Xuan Paper Grain):** Jangan gunakan background warna rata yang mati. Buat *subtle noise/paper grain overlay* menggunakan SVG `<feTurbulence>` dengan `opacity: 0.035` (`pointer-events: none`) di seluruh layar agar terasa seperti lembaran kertas fisik.

---

### 2. SISTEM WARNA & DESIGN TOKENS
- **Latar Belakang Utama:** Kertas Perkamen Hangat (`#F5F0E6`).
- **Permukaan Kartu (Surface):** Krem Bersih (`#FFFDF9`) untuk kartu aktif, dan Abu-abu Kertas Hangat (`#EAE4D7`) untuk pos yang belum terbuka/masih kosong.
- **Warna Tinta & Border Utama:** Arang Tua (`#231F20`) — jangan gunakan `#000000` murni.
- **Warna Aksen Berkarakter:**
  - *Cinnabar Red / Merah Stempel* (`#D94E34`): Fokus utama, Pos HSK aktif, stempel, dan tombol "Drill mirip".
  - *Jade Botanical / Hijau Giok* (`#2E6F40`): Indikator kata "mekar", progress bar, dan tombol "Ulas kesalahan".
  - *Ochre Gold / Emas Oker* (`#D99B26`): Mode arkade, target harian, dan tombol "Kebun & statistik".

---

### 3. TATA LETAK (LAYOUT): DARI "TUMPUKAN BARIS" KE "BENTO & JALUR PETA"
- **Container Utama:** `max-width: 1120px`, *centered*, dengan *padding* yang lega.
- **Layout Desktop (Asymmetric 12-Column Grid):**
  - **Kolom Kiri (4 Kolom - Sticky Sidebar "Kemah & Tas Bekal"):** Tempatkan kartu Hero *"Hanzi Quest (324 kata di tas bekalmu)"*, kontrol pengaturan sesi (*Mode arkade, Bunyi ketuk, Target*), serta 5 tombol aksi (*Ulas kesalahan, Kebun & statistik, Drill mirip, Peta komponen, Impor/ekspor*) yang disusun dalam **Bento Grid 2x3** yang rapi.
  - **Kolom Kanan (8 Kolom - "Jalur Peta HSK"):** Ubah daftar Pos HSK 1–6 dari tumpukan baris vertikal menjadi **Jalur Petualangan Interaktif (Winding Expedition Path / 2-Column Staggered Cards)**. Hubungkan antar kartu Pos HSK dengan garis jalur petualangan putus-putus (`stroke-dasharray`) menggunakan SVG di latar belakangnya.
- **Layout Mobile (Responsive):**
  - Pada layar mobile, susun secara vertikal dengan kartu yang *compact*.
  - Pindahkan 6 menu navigasi utama (*Peta, Drill, Komponen, Leech, Kebun, Data*) menjadi **Floating Bottom Navigation Dock** dengan ikon di atas teks agar nyaman dijangkau ibu jari.

---

### 4. DESAIN ULANG KOMPONEN SECARA SPESIFIK

#### A. Header & Navigasi ("Peta, Drill, Komponen, Leech, Kebun, Data")
- Desain logo **Hanzi Quest** di kiri atas dengan badge karakter `漢` yang menyerupai **Stempel Segel Merah (Chinese Chop Seal)** bertekstur sedikit organik.
- Buat menu navigasi di kanan atas sebagai *Tactile Pill Tabs* yang dilengkapi ikon Phosphor (misal: *Peta* = `ph-map-trifold`, *Drill* = `ph-lightning`, *Komponen* = `ph-puzzle-piece`, *Leech* = `ph-bug-beetle`, *Kebun* = `ph-plant`, *Data* = `ph-database`).

#### B. Kartu "Tas Bekalmu" & Kontrol Sesi (Hapus Default Form!)
- Tampilkan `324 kata di tas bekalmu` sebagai *Inventory Counter Badge* yang menonjol dengan ikon tas bekal/buntalan petualang.
- **Ganti Checkbox Bawaan:** Ubah checkbox *"Mode arkade"* dan *"Bunyi ketuk"* menjadi **Custom Tactile Toggle Pills / Chips** lengkap dengan ikon (ikon *arcade joystick* dan ikon *speaker/ketuk*). Saat aktif, warna pill berubah dengan efek tombol tertekan.
- **Ganti Dropdown Target:** Ubah `<select>` *"Target 10"* menjadi **Segmented Pill Selector** interaktif (`5` | `10` | `20` | `50`) atau *custom stepper* yang estetik.

#### C. Kartu Pos HSK (Pos HSK 1 – Pos HSK 6)
- **Hierarki Visual (Active vs Dormant State):**
  - **Pos HSK 1 (`318 jatuh tempo · 0/324 mekar`):** Karena memiliki 318 kata jatuh tempo, buat kartu ini tampil sebagai **Active Quest Card** yang menonjol! Berikan *border* aksen merah/hijau, *badge* notifikasi berdenyut halus (`318 Jatuh Tempo!`), dan tombol aksi jelas (`Mulai Sesi →`).
  - **Pos HSK 2 s/d HSK 6 (`0 jatuh tempo · 0/0 mekar`):** Tampilkan sebagai **Unexplored Outposts** (tetap sangat estetik namun sedikit lebih *muted*/tenang dibandingkan HSK 1, memberi kesan pos selanjutnya yang menanti dijelajahi).
- **Slot Aset Ilustrasi & Custom SVG Fallback:**
  - Sediakan *container* ilustrasi (`64x64px`) di tiap kartu Pos HSK yang siap memuat gambar eksternal (`/assets/pos-hsk1.png` s/d `pos-hsk6.png`).
  - Sebagai *default fallback* sebelum file gambar dimasukkan, buatkan **Custom Duotone SVG Landmark** yang unik untuk tiap pos (HSK 1: Gerbang Desa, HSK 2: Jembatan Bambu, HSK 3: Paviliun Teh, HSK 4: Menara Lentera, HSK 5: Gunung Berkabut, HSK 6: Pagoda Puncak) yang dikombinasikan dengan stempel `H1`–`H6`.
- **Visualisasi "Mekar" (Botanical Progress Bar):**
  - Jangan hanya menulis teks `0/324 mekar`. Tambahkan **Progress Bar Organik** di dalam tiap kartu beserta deretan 5 ikon kuncup/bunga *Plum Blossom (Meihua)* SVG kecil yang akan ikut mekar (berubah warna) seiring naiknya persentase kata yang dikuasai.

#### D. 5 Tombol Aksi Cepat ("Ulas kesalahan", "Kebun & statistik", dll.)
- **Hapus semua `text-decoration: underline`!**
- Desain menjadi kartu tombol aksi bergaya *Tactile Game Cards* lengkap dengan ikon SVG ekspresif di samping teksnya, *border* tegas, dan warna latar yang kontras namun harmonis dengan palet *earthy/botanical*.

---

### 5. INTERAKTIVITAS & FISIKA TOMBOL (TACTILE MICRO-INTERACTIONS)
- **Tactile 3D Card & Button Style:** Semua kartu interaktif dan tombol wajib menggunakan `border: 2px solid #231F20`, `border-radius: 16px`, dan bayangan keras di bawahnya (`box-shadow: 0 4px 0 #231F20`).
- **Efek Pegas (Spring Physics):** Gunakan `transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)`.
  - **Saat Hover (`:hover`):** Elemen terangkat sedikit (`transform: translateY(-2px)`, `box-shadow: 0 6px 0 #231F20`).
  - **Saat Ditekan (`:active`):** Elemen turun menekan bayangannya (`transform: translateY(3px)`, `box-shadow: 0 1px 0 #231F20`), memberikan sensasi fisik seperti menekan ubin mahjong atau tombol mekanik.
- **Efek Mode Arkade:** Jika *toggle* "Mode arkade" diaktifkan, tambahkan perubahan visual halus pada kartu Hero (misalnya muncul aksen kilau emas/merah dan indikator mode berenergi) agar slogan *"Tenang itu default. Arkade opsional."* benar-benar terasa hidup.