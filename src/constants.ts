import { CalendarDay, DistrictOffset, Dua } from './types';

export const KHOREZM_DISTRICTS: DistrictOffset[] = [
  { name: 'Urganch', sahar: 0, iftor: 0 },
  { name: 'Bog\'ot', sahar: 0, iftor: 0 },
  { name: 'Gurlan', sahar: 0, iftor: 1 },
  { name: 'Xonqa', sahar: 0, iftor: 0 },
  { name: 'Hazorasp', sahar: -1, iftor: -1 },
  { name: 'Xiva', sahar: 1, iftor: 1 },
  { name: 'Qo\'shko\'pir', sahar: 1, iftor: 1 },
  { name: 'Shovot', sahar: 0, iftor: 1 },
  { name: 'Yangiariq', sahar: 0, iftor: 0 },
  { name: 'Yangibozor', sahar: 0, iftor: 0 },
  { name: 'Tuproqqal\'a', sahar: -3, iftor: -1 },
];

export const KHOREZM_2026_CALENDAR: CalendarDay[] = [
  { day: 1, date: '19-Fevral', fajr: '06:29', maghrib: '18:40' },
  { day: 2, date: '20-Fevral', fajr: '06:27', maghrib: '18:41' },
  { day: 3, date: '21-Fevral', fajr: '06:26', maghrib: '18:42' },
  { day: 4, date: '22-Fevral', fajr: '06:25', maghrib: '18:43' },
  { day: 5, date: '23-Fevral', fajr: '06:23', maghrib: '18:44' },
  { day: 6, date: '24-Fevral', fajr: '06:22', maghrib: '18:46' },
  { day: 7, date: '25-Fevral', fajr: '06:20', maghrib: '18:47' },
  { day: 8, date: '26-Fevral', fajr: '06:19', maghrib: '18:48' },
  { day: 9, date: '27-Fevral', fajr: '06:17', maghrib: '18:49' },
  { day: 10, date: '28-Fevral', fajr: '06:16', maghrib: '18:50' },
  { day: 11, date: '1-Mart', fajr: '06:14', maghrib: '18:52' },
  { day: 12, date: '2-Mart', fajr: '06:13', maghrib: '18:53' },
  { day: 13, date: '3-Mart', fajr: '06:11', maghrib: '18:54' },
  { day: 14, date: '4-Mart', fajr: '06:10', maghrib: '18:55' },
  { day: 15, date: '5-Mart', fajr: '06:08', maghrib: '18:56' },
  { day: 16, date: '6-Mart', fajr: '06:06', maghrib: '18:57' },
  { day: 17, date: '7-Mart', fajr: '06:05', maghrib: '18:59' },
  { day: 18, date: '8-Mart', fajr: '06:03', maghrib: '19:00' },
  { day: 19, date: '9-Mart', fajr: '06:02', maghrib: '19:01' },
  { day: 20, date: '10-Mart', fajr: '06:00', maghrib: '19:02' },
  { day: 21, date: '11-Mart', fajr: '05:58', maghrib: '19:03' },
  { day: 22, date: '12-Mart', fajr: '05:56', maghrib: '19:04' },
  { day: 23, date: '13-Mart', fajr: '05:55', maghrib: '19:05' },
  { day: 24, date: '14-Mart', fajr: '05:53', maghrib: '19:07' },
  { day: 25, date: '15-Mart', fajr: '05:51', maghrib: '19:08' },
  { day: 26, date: '16-Mart', fajr: '05:50', maghrib: '19:09' },
  { day: 27, date: '17-Mart', fajr: '05:48', maghrib: '19:10' },
  { day: 28, date: '18-Mart', fajr: '05:46', maghrib: '19:11' },
  { day: 29, date: '19-Mart', fajr: '05:44', maghrib: '19:12' },
  { day: 30, date: '20-Mart', fajr: '05:43', maghrib: '19:13' },
];

export const DUAS: { sahar: Dua; iftar: Dua } = {
  sahar: {
    title: 'Saharlik (Og\'iz yopish) duosi',
    arabic: 'نَوَيْتُ أَنْ أَصُومَ صَوْمَ شَهْرِ رَمَضَانَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ، خَالِصًا لِلهِ تَعَالَى. اللهُ أَكْبَرُ.',
    transliteration: 'Navaytu an asuvma sovma shahri Ramazona minal fajri ilal maghribi, xolisan lillahi ta\'aalaa. Allohu akbar.',
    translation: 'Ramazon oyining ro\'zasini subhdan to kun botguncha xolis Alloh uchun tutishni niyat qildim. Allohu akbar!'
  },
  iftar: {
    title: 'Iftorlik (Og\'iz ochish) duosi',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ، فَاغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ يَا غَفَّارُ.',
    transliteration: 'Allohumma laka sumtu va bika aamantu va \'alayka tavakkaltu va \'alaa rizqika aftortu, fag\'firliy yaa G\'offaru maa qoddamtu va maa axxortu. Birohmatika yaa arhamar rohimiyin.',
    translation: 'Allohim, ushbu ro\'zamni Sen uchun tutdim va Senga iymon keltirdim va Senga tavakkal qildim va Sen bergan rizqing bilan iftor qildim. Ey mehribonlarning eng mehriboni, mening avvalgi va keyingi gunohlarimni mag\'firat qilgin!'
  }
};
