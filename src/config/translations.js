const translations = {
  // Home Menu
  'menu.play': { EN: 'Play', BM: 'Main' },
  'menu.rules': { EN: 'Rules', BM: 'Peraturan' },
  'menu.settings': { EN: 'Settings', BM: 'Tetapan' },
  'menu.title': { EN: 'Congkak', BM: 'Congkak' },
  'menu.subtitle': { EN: 'Traditional Malaysian Game', BM: 'Permainan Tradisional Malaysia' },
  'menu.quickMatch': { EN: 'Quick Match', BM: 'Perlawanan Pantas' },
  'menu.traditional': { EN: 'Traditional', BM: 'Tradisional' },

  // Game UI
  'game.start': { EN: 'START', BM: 'MULA' },
  'game.restart': { EN: 'RESTART', BM: 'ULANG' },
  'game.upperTurn': { EN: "P1's TURN", BM: 'GILIRAN P1' },
  'game.lowerTurn': { EN: "P2's TURN", BM: 'GILIRAN P2' },
  'game.bothTurn': { EN: 'BOTH TURN', BM: 'GILIRAN KEDUA' },
  'game.darkWins': { EN: 'P1 WINS', BM: 'P1 MENANG' },
  'game.whiteWins': { EN: 'P2 WINS', BM: 'P2 MENANG' },
  'game.draw': { EN: 'DRAW', BM: 'SERI' },
  'game.freeplay': { EN: 'FREEPLAY', BM: 'MAIN BEBAS' },
  'game.turnBased': { EN: 'TURN-BASED', BM: 'BERGILIR' },

  // Rules Modal
  'rules.title': { EN: 'Congkak Rules', BM: 'Peraturan Congkak' },
  'rules.intro': {
    EN: 'Congkak begins with two rows of 7 holes, each filled with 7 seeds. The large holes on the sides are "houses" where players collect their seeds.',
    BM: 'Congkak bermula dengan dua baris 7 lubang, setiap satunya diisi dengan 7 biji. Lubang besar di sisi adalah "rumah" di mana pemain mengumpul biji mereka.'
  },
  'rules.startSimultaneous': {
    EN: 'After countdown, both players can start sowing from any hole on their side.',
    BM: 'Selepas undur detik, kedua-dua pemain boleh mula menabur dari mana-mana lubang di sisi mereka.'
  },
  'rules.upperControls': {
    EN: 'P1 uses WASD keys',
    BM: 'P1 menggunakan kekunci WASD'
  },
  'rules.lowerControls': {
    EN: 'P2 uses ARROW keys',
    BM: 'P2 menggunakan kekunci ANAK PANAH'
  },
  'rules.sowingBasic': {
    EN: 'When you select a hole, you pick up all seeds and drop one in each subsequent hole (counter-clockwise).',
    BM: 'Apabila anda memilih lubang, anda mengambil semua biji dan menjatuhkan satu di setiap lubang berikutnya (lawan arah jam).'
  },
  'rules.landingNonEmpty': {
    EN: 'If the last seed lands in a non-empty hole, pick up all seeds and continue.',
    BM: 'Jika biji terakhir jatuh di lubang yang tidak kosong, ambil semua biji dan teruskan.'
  },
  'rules.landingHouse': {
    EN: 'If the last seed lands in your house, you get another turn.',
    BM: 'Jika biji terakhir jatuh di rumah anda, anda mendapat giliran lagi.'
  },
  'rules.capturing': {
    EN: 'If your last seed lands in an empty hole on your side (after passing your house at least once), you capture that seed plus all seeds in the opposite hole.',
    BM: 'Jika biji terakhir anda jatuh di lubang kosong di sisi anda (selepas melepasi rumah anda sekurang-kurangnya sekali), anda mengambil biji itu serta semua biji di lubang bertentangan.'
  },
  'rules.winCondition': {
    EN: 'The player who first reaches 50+ seeds in their house, or has the most seeds when all holes are empty, wins!',
    BM: 'Pemain yang pertama mencapai 50+ biji di rumah mereka, atau mempunyai paling banyak biji apabila semua lubang kosong, menang!'
  },

  // Settings
  'settings.title': { EN: 'Settings', BM: 'Tetapan' },
  'settings.language': { EN: 'Language', BM: 'Bahasa' },
  'settings.close': { EN: 'Close', BM: 'Tutup' },

  // Round end (Traditional mode)
  'round.end': { EN: 'Round Complete', BM: 'Pusingan Selesai' },
  'round.continue': { EN: 'Continue', BM: 'Teruskan' },
  'round.endMatch': { EN: 'End Match', BM: 'Tamat Perlawanan' },
  'round.upperSeeds': { EN: 'P1 Seeds', BM: 'Biji P1' },
  'round.lowerSeeds': { EN: 'P2 Seeds', BM: 'Biji P2' },
  'round.number': { EN: 'Round', BM: 'Pusingan' },

  // Match end (Traditional mode)
  'match.winner': { EN: 'Match Winner', BM: 'Pemenang Perlawanan' },
  'match.domination': { EN: 'Total Domination!', BM: 'Penguasaan Penuh!' },
  'match.conceded': { EN: 'Conceded', BM: 'Mengalah' },
  'match.playAgain': { EN: 'Play Again', BM: 'Main Lagi' },
  'match.mainMenu': { EN: 'Main Menu', BM: 'Menu Utama' },

  // Concede
  'game.concede': { EN: 'Concede', BM: 'Mengalah' },
};

export const t = (key, language) => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }
  return translation[language] || translation['EN'] || key;
};

export default translations;
