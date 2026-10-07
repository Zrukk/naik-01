// Daftar tugas. Tambah tugas baru di sini.
// Tiap bidang punya 3 level: [ringan], [sedang], [menantang].
var T={
fokus:{n:"Fokus",d:"Kerja lebih dalam, lebih sedikit gangguan",t:[
["Taruh HP di ruangan lain selama 10 menit saat mengerjakan sesuatu.","Tulis 1 hal terpenting yang harus selesai hari ini.","Tarik napas dalam 10 kali sebelum mulai bekerja.","Kerjakan satu hal selama 5 menit saja, lalu boleh berhenti."],
["Kerjakan satu tugas tanpa membuka aplikasi lain selama 25 menit.","Matikan semua notifikasi selama 1 jam.","Tulis 3 tugas hari ini, lalu kerjakan yang tersulit lebih dulu.","Bersihkan meja kerja sebelum mulai bekerja."],
["Lakukan 2 sesi fokus 25 menit tanpa HP, jeda 5 menit di antaranya.","Selesaikan tugas yang sudah kamu tunda lebih dari seminggu.","Kerjakan 1 jam penuh pada satu tugas tanpa berpindah.","Tulis rencana jam demi jam untuk hari ini, lalu ikuti."]]},
kesehatan:{n:"Kesehatan",d:"Tubuh yang lebih bertenaga",t:[
["Minum 1 gelas air putih sekarang.","Berjalan kaki santai 10 menit.","Peregangan leher dan bahu selama 3 menit.","Berdiri dan bergerak 2 menit setiap satu jam duduk."],
["Berjalan kaki 20 menit tanpa headphone, perhatikan sekitarmu.","Tidur sebelum jam 22.30 malam ini.","Ganti satu minuman manis hari ini dengan air putih.","Makan satu porsi sayur atau buah."],
["Olahraga 30 menit (lari, senam, atau push up bertahap).","Tanpa layar 1 jam sebelum tidur.","Siapkan makanan sehat sendiri untuk seharian.","Jalan cepat 15 menit tanpa berhenti."]]},
belajar:{n:"Belajar",d:"Pengetahuan dan keterampilan baru",t:[
["Baca 5 halaman buku apa saja.","Tulis 1 hal baru yang kamu pelajari hari ini.","Tonton 1 video edukasi pendek, lalu ringkas dalam 2 kalimat.","Pelajari 3 kata atau istilah baru."],
["Pelajari satu topik 25 menit, lalu jelaskan dengan kata-katamu sendiri.","Baca 15 halaman dan catat 3 poin penting.","Latih satu keterampilan (mengetik, menggambar, coding) selama 20 menit.","Rangkum satu artikel dalam 5 kalimat."],
["Belajar 1 jam, lalu buat 5 pertanyaan kuis untuk dirimu sendiri.","Buat proyek kecil dari apa yang baru kamu pelajari.","Ajarkan satu konsep kepada orang lain.","Selesaikan satu bab buku atau satu modul kursus."]]},
mental:{n:"Mental",d:"Pikiran lebih tenang dan berani",t:[
["Tulis 3 hal yang kamu syukuri hari ini.","Diam 2 menit tanpa melakukan apa pun.","Rapikan tempat tidur atau mejamu.","Saat merasa kesal, berhenti sejenak dan tarik napas 5 kali."],
["Tulis perasaanmu hari ini selama 5 menit.","Ucapkan terima kasih kepada seseorang.","Mulai satu hal yang kamu takuti, cukup 10 menit.","Tulis satu hal yang kamu khawatirkan dan satu langkah kecil untuk mengatasinya."],
["Diam atau meditasi penuh selama 10 menit.","Tinjau hari ini: tulis 1 kesalahan, 1 pelajaran, 1 rencana perbaikan.","Lakukan satu hal tidak nyaman yang kamu hindari minggu ini.","Seharian penuh tanpa media sosial."]]},
keuangan:{n:"Keuangan",d:"Kebiasaan uang yang lebih sehat",t:[
["Catat semua pengeluaranmu hari ini, sekecil apa pun.","Cek saldo dan satu pengeluaran terbesar minggu ini.","Tunda satu pembelian yang tidak mendesak selama 24 jam.","Sisihkan sedikit uang, berapa pun, ke tabungan."],
["Tulis anggaran sederhana untuk minggu ini.","Berhenti berlangganan satu layanan yang jarang kamu pakai.","Bandingkan harga di dua tempat sebelum membeli sesuatu.","Hitung berapa uang yang kamu keluarkan untuk jajan minggu ini."],
["Buat anggaran bulanan: pemasukan, kebutuhan, tabungan.","Tentukan target tabungan beserta tanggal tercapainya.","Seharian tidak membeli apa pun yang bukan kebutuhan.","Pelajari satu konsep keuangan (misalnya dana darurat) selama 20 menit."]]},
hubungan:{n:"Hubungan",d:"Keluarga, teman, dan cara berkomunikasi",t:[
["Kirim pesan singkat menanyakan kabar seseorang.","Dengarkan orang yang bicara denganmu tanpa memotong.","Beri satu pujian tulus kepada seseorang.","Letakkan HP saat mengobrol dengan orang di depanmu."],
["Hubungi teman lama yang sudah lama tidak kamu sapa.","Tanyakan pada seseorang tentang hal yang dia sukai, lalu dengarkan.","Bantu seseorang tanpa diminta.","Minta maaf atau berterima kasih atas hal yang lama tertunda."],
["Ajak seseorang bertemu atau menelepon selama 30 menit.","Sampaikan satu hal jujur namun baik yang selama ini kamu simpan.","Selesaikan satu kesalahpahaman dengan bicara langsung.","Tulis pesan panjang untuk orang yang berarti bagimu."]]}
};
