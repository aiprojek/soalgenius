# SoalGenius: Pembuat Soal Ujian Cerdas

SoalGenius adalah Progressive Web App (PWA) canggih yang dirancang khusus untuk para pendidik—guru, dosen, dan tutor—untuk merevolusi cara mereka membuat, mengelola, dan mendistribusikan materi ujian. Dibangun dengan filosofi **offline-first**, aplikasi ini memastikan semua data Anda tersimpan aman di perangkat Anda, dapat diakses kapan saja dan di mana saja tanpa memerlukan koneksi internet.

## Sebuah Kolaborasi Unik: Manusia & AI

SoalGenius bukan hanya sebuah aplikasi, tetapi juga merupakan hasil dari eksperimen kolaborasi yang unik antara **pengembang manusia (sutradara proyek)** dan **rekayasawan frontend AI (penulis kode)**.

- **Peran AI (Asisten Kode):** Saya, sebagai AI, bertanggung jawab untuk menerjemahkan ide, permintaan, dan umpan balik menjadi kode yang fungsional. Tugas saya meliputi penulisan komponen React, implementasi logika state management dengan hooks, perancangan antarmuka menggunakan Tailwind CSS, dan melakukan refactoring untuk menjaga kualitas kode. Saya mempercepat proses pengembangan secara drastis dengan menghasilkan boilerplate dan fitur-fitur kompleks dalam hitungan detik.

- **Peran Manusia (Sutradara Proyek):** AI Projek, sebagai pengembang manusia, bertindak sebagai visioner, arsitek produk, dan penguji kualitas. Anda yang memberikan ide-ide awal, menentukan arah pengembangan aplikasi, meminta fitur-fitur baru, dan memberikan umpan balik kritis untuk perbaikan. Anda juga yang menemukan bug, mengevaluasi pengalaman pengguna (UX), dan mengarahkan saya (AI) untuk menyempurnakan setiap detail hingga aplikasi ini sesuai dengan visi yang diinginkan.

Proses ini menunjukkan bagaimana sinergi antara kreativitas dan arahan manusia dengan kecepatan eksekusi AI dapat menghasilkan produk yang solid dan bermanfaat.

## Fitur Unggulan

SoalGenius dilengkapi dengan serangkaian fitur canggih untuk menyederhanakan alur kerja Anda.

### 1. Editor Soal yang Powerfull
- **Editor Teks Kaya (WYSIWYG):** Format teks (bold, italic, underline), atur warna, dan perataan (kiri, tengah, kanan, justifikasi) dengan mudah.
- **Beragam Tipe Soal:** Tambahkan soal **Pilihan Ganda**, **Isian Singkat**, dan **Uraian** dalam satu dokumen ujian.
- **Dukungan Multimedia:** Sisipkan gambar ke dalam soal untuk memperjelas pertanyaan.
- **Struktur Kompleks:** Buat **sub-pertanyaan** di dalam soal utama (misal: 1a, 1b, 1c) untuk soal yang lebih terstruktur.
- **Manajemen Bagian:** Kelompokkan soal ke dalam beberapa bagian (misal: Bagian A, Bagian B) dengan instruksi pengerjaan yang berbeda untuk setiap bagian.
- **Drag & Drop:** Susun ulang urutan soal dan bagian dengan mudah hanya dengan menyeretnya.

### 2. Bank Soal Terintegrasi
- **Simpan & Gunakan Kembali:** Simpan soal-soal favorit Anda ke dalam **Bank Soal** pribadi hanya dengan satu klik.
- **Impor Cepat:** Tambahkan soal dari bank ke ujian yang sedang Anda kerjakan melalui modal pencarian yang intuitif.
- **Manajemen Metadata:** Kelola soal di bank dengan menambahkan informasi **Mata Pelajaran**, **Kelas/Jenjang**, dan **Tags** untuk pemfilteran dan pencarian yang lebih mudah.

### 3. Pratinjau & Ekspor Profesional
- **Pratinjau Real-time:** Lihat tampilan akhir lembar soal dan kunci jawaban sebelum mencetak.
- **Kustomisasi Kop Surat:** Atur kop surat secara detail, termasuk **logo institusi** dan beberapa baris teks (misal: nama sekolah, dinas, alamat).
- **Pengaturan Dokumen:** Sesuaikan ukuran kertas (**A4/F4**), jenis huruf (Serif/Sans-serif), margin, dan spasi baris.
- **Kunci Jawaban Otomatis:** Hasilkan halaman kunci jawaban yang rapi secara otomatis.
- **Ekspor Fleksibel:**
  - **Cetak Langsung** atau simpan sebagai **PDF** melalui dialog cetak browser.
  - **Ekspor ke HTML:** Unduh ujian sebagai file HTML mandiri yang bisa dibuka di browser mana pun.

### 4. Manajemen Ujian yang Komprehensif
- **Arsip Terpusat:** Semua ujian Anda tersimpan dalam satu arsip yang mudah diakses.
- **Filter & Cari:** Temukan ujian dengan cepat berdasarkan Mata Pelajaran, Kelas, atau Status (Draft/Selesai).
- **Duplikasi & Variasi:**
  - **Salin Ujian:** Buat duplikat ujian dengan satu klik.
  - **Buat Varian Acak:** Hasilkan versi baru dari ujian yang sama dengan urutan soal dan opsi jawaban yang diacak secara otomatis.

### 5. Privasi & Bekerja Offline
- **100% Offline:** Setelah dimuat pertama kali, aplikasi bekerja sepenuhnya tanpa internet.
- **Penyimpanan Lokal:** Semua data ujian, bank soal, dan pengaturan disimpan dengan aman di `localStorage` browser Anda, bukan di server cloud.
- **Backup & Restore:** Amankan seluruh data Anda dengan fitur **ekspor ke file JSON**. Pulihkan data Anda kapan saja di perangkat mana pun.

## Menjalankan Secara Lokal

Untuk menjalankan atau mengembangkan aplikasi ini di komputer Anda, ikuti langkah-langkah berikut.

**Prasyarat:**
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- npm (biasanya terinstal bersama Node.js)

**Langkah-langkah:**

1.  **Clone Repositori (atau unduh ZIP):**
    ```bash
    git clone https://github.com/aiprojek/soalgenius.git
    cd soalgenius
    ```

2.  **Instal Dependensi:**
    Jalankan perintah ini untuk menginstal semua paket yang diperlukan (seperti React dan Vite).
    ```bash
    npm install
    ```

3.  **Jalankan Server Pengembangan:**
    Perintah ini akan memulai server lokal (biasanya di `http://localhost:5173`) dan secara otomatis memuat ulang halaman saat Anda membuat perubahan pada kode.
    ```bash
    npm run dev
    ```

## Deployment

Aplikasi ini dibangun menggunakan Vite dan perlu di-*build* sebelum di-deploy. Proses build akan mengompilasi semua kode menjadi file statis yang optimal untuk produksi.

1.  **Build Aplikasi:**
    Jalankan perintah berikut untuk membuat folder `dist` yang berisi file-file produksi.
    ```bash
    npm run build
    ```

2.  **Deploy ke Cloudflare Pages (Disarankan):**
    
    **Opsi A: Integrasi dengan Git (Cara Terbaik)**
    - Unggah proyek Anda ke repositori GitHub/GitLab.
    - Di dashboard Cloudflare Pages, pilih `Connect to Git`.
    - Pilih repositori Anda.
    - Konfigurasikan pengaturan build sebagai berikut:
      - **Framework preset:** Pilih **`Vite`** dari daftar.
      - Cloudflare akan otomatis mengisi pengaturan di bawah ini untuk Anda:
      - **Build command:** `npm run build`
      - **Build output directory:** `dist`
    - Klik `Save and Deploy`. Cloudflare akan secara otomatis men-deploy setiap kali Anda melakukan push ke repositori Anda.

    **Opsi B: Unggah Manual (Drag & Drop)**
    - Masuk ke dashboard Cloudflare.
    - Buka `Workers & Pages` > `Create application` > `Pages` > `Upload assets`.
    - Seret **folder `dist`** (bukan seluruh folder proyek) ke dalam kotak unggah.
    - Klik `Deploy site`.

## Rencana Pengembangan (Roadmap)

Kami terus berupaya untuk meningkatkan SoalGenius. Berikut adalah beberapa fitur yang sedang kami kembangkan:

- [ ] **Dukungan Rumus Matematika (KaTeX):** Mengimplementasikan editor rumus matematika yang stabil dan andal.
- [ ] **Dukungan Tabel:** Menambahkan kemampuan untuk membuat dan menyunting tabel di dalam editor soal.
- [ ] **Dukungan Teks Kanan-ke-Kiri (RTL):** Menambahkan dukungan penuh untuk bahasa yang ditulis dari kanan ke kiri, seperti Bahasa Arab.
- [ ] **Penomoran Otomatis:** Opsi untuk penomoran soal dan opsi jawaban yang sepenuhnya otomatis.
- [ ] **Impor dari Word/Teks:** Kemampuan untuk mengimpor soal dari format dokumen lain.
- [ ] **Tema & Tampilan:** Opsi untuk mengubah tema (misal: mode gelap).

## Masukan & Kontribusi

Masukan Anda sangat berharga bagi kami. Jika Anda memiliki saran fitur, laporan bug, atau ingin berkontribusi, jangan ragu untuk:
- **Bergabung di Grup Telegram:** [AI Projek Community](https://t.me/aiprojek_community/32)
- **Lihat Kode Sumber di GitHub:** [aiprojek/soalgenius](https://github.com/aiprojek/soalgenius)
- **Dukung Pengembang:** [Traktir Kopi](https://lynk.id/aiprojek/s/bvBJvdA)

## Lisensi
Aplikasi ini dilisensikan di bawah **GNU General Public License v3.0**.