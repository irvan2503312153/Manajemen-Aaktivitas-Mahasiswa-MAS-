// src/hooks/useMotivationalQuote.ts
// Kutipan motivasi yang berganti setiap hari

const QUOTES = [
  { text: 'Mulailah dari mana kamu berada, gunakan apa yang kamu miliki.', author: 'Arthur Ashe' },
  { text: 'Sukses adalah jumlah usaha-usaha kecil yang diulang setiap hari.', author: 'Robert Collier' },
  { text: 'Jangan tunggu motivasi datang. Ambil tindakan dulu, motivasi akan mengikuti.', author: 'Anonymous' },
  { text: 'Setiap hari adalah kesempatan baru untuk belajar dan berkembang.', author: 'Anonymous' },
  { text: 'Ilmu tanpa amal seperti pohon tanpa buah.', author: 'Pepatah Arab' },
  { text: 'Bukan tentang seberapa pintar kamu, tapi seberapa keras kamu berusaha.', author: 'Anonymous' },
  { text: 'Mahasiswa terbaik bukan yang paling pintar, tapi yang paling konsisten.', author: 'Anonymous' },
  { text: 'Investasi terbaik adalah investasi pada dirimu sendiri.', author: 'Warren Buffett' },
  { text: 'Sedikit demi sedikit, lama-lama menjadi bukit.', author: 'Peribahasa Indonesia' },
  { text: 'Fokus pada prosesnya, hasilnya akan mengikuti.', author: 'Anonymous' },
];

export function useMotivationalQuote() {
  // Kutipan berganti setiap hari berdasarkan index tanggal
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];
  return quote;
}
