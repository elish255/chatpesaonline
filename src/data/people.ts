export type Person = {
  name: string;
  age: number;
  job: string;
  duration: string;
  price: string;
  online: boolean;
  photo: string;
};

// Mada maalum ya kuzungumzia kwa kila mzungu (kwa mpangilio wa orodha hapo chini)
export const topics: string[] = [
  "Kiswahili cha kisasa kinachotumika mitaani na kazini",
  "Mafundisho ya Kiingereza ya kila siku",
  "Uandishi wa habari na taarifa",
  "Biashara na maisha ya kila siku Tanzania",
  "Afya na huduma za kiafya",
  "Picha na utamaduni wa Tanzania",
  "Maisha ya chuo kikuu na masomo",
  "Safari na ndege za abiria",
  "Lishe na chakula bora cha kitamaduni",
  "Masoko na biashara mtandaoni",
  "Muziki wa Bongo Fleva na dansi",
  "Wanyamapori na mbuga za Tanzania",
  "Mavazi na mtindo wa kisasa",
  "Ujenzi na makazi ya watu",
  "Huduma za afya na malezi ya wagonjwa",
  "Mpira wa miguu na michezo",
  "Utalii na maandishi ya safari",
  "Fedha na uhasibu wa biashara",
  "Kujifunza Kiswahili kutoka mwanzo",
  "Ushauri wa kuanzisha biashara ndogo",
  "Ufafanuzi wa lugha na utamaduni",
  "Historia na urithi wa Tanzania",
  "Sanaa na michoro ya kisasa",
  "Uchumi na fursa za ajira",
  "Redio na utangazaji",
  "Kilimo na ufugaji",
  "Yoga na maisha yenye afya",
  "Sheria na haki za raia",
  "Kahawa na kilimo cha kahawa",
  "Muziki na ala za muziki",
];

const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=240&h=240&fit=crop&crop=faces&q=80`;

export const people: Person[] = [
  { name: "Emma Johnson", age: 28, job: "Mwalimu wa Kiingereza", duration: "Dakika 10", price: "TZS 70,000", online: true, photo: u("photo-1494790108377-be9c29b29330") },
  { name: "Lucas Müller", age: 34, job: "Mhandisi wa Programu", duration: "Dakika 20", price: "TZS 80,000", online: true, photo: u("photo-1500648767791-00dcc994a43e") },
  { name: "Sophie Martin", age: 26, job: "Mwandishi wa Habari", duration: "Dakika 30", price: "TZS 90,000", online: true, photo: u("photo-1534528741775-53994a69daeb") },
  { name: "Daniel Brown", age: 31, job: "Mfanyabiashara", duration: "Dakika 45", price: "TZS 100,000", online: false, photo: u("photo-1517841905240-472988babdf9") },
  { name: "Anna Kowalski", age: 29, job: "Daktari wa Meno", duration: "Saa 1", price: "TZS 120,000", online: false, photo: u("photo-1506794778202-cad84cf45f1d") },
  { name: "James Wilson", age: 37, job: "Mpiga Picha", duration: "Masaa 2", price: "TZS 150,000", online: true, photo: u("photo-1544005313-94ddf0286df2") },
  { name: "Laura Rossi", age: 24, job: "Mwanafunzi wa Chuo", duration: "Dakika 10", price: "TZS 70,000", online: true, photo: u("photo-1552374196-c4e7ffc6e126") },
  { name: "Peter Hansen", age: 41, job: "Rubani", duration: "Dakika 20", price: "TZS 80,000", online: false, photo: u("photo-1531123897727-8f129e1688ce") },
  { name: "Chloe Dubois", age: 27, job: "Mtaalam wa Lishe", duration: "Dakika 30", price: "TZS 90,000", online: true, photo: u("photo-1524504388940-b1c1722653e1") },
  { name: "Mark Taylor", age: 33, job: "Mkurugenzi wa Masoko", duration: "Dakika 45", price: "TZS 100,000", online: false, photo: u("photo-1508214751196-bcfd4ca60f91") },
  { name: "Nina Petrova", age: 30, job: "Mwalimu wa Muziki", duration: "Saa 1", price: "TZS 120,000", online: true, photo: u("photo-1492562080023-ab3db95bfbce") },
  { name: "Oliver Smith", age: 36, job: "Mtafiti wa Wanyama", duration: "Masaa 2", price: "TZS 150,000", online: false, photo: u("photo-1521119989659-a83eee488004") },
  { name: "Isabella Silva", age: 25, job: "Mbunifu wa Mavazi", duration: "Dakika 10", price: "TZS 70,000", online: true, photo: u("photo-1519345182560-3f2917c472ef") },
  { name: "Thomas Meyer", age: 39, job: "Mkandarasi", duration: "Dakika 20", price: "TZS 80,000", online: true, photo: u("photo-1529626455594-4ff0802cfb7e") },
  { name: "Grace Miller", age: 32, job: "Muuguzi", duration: "Dakika 30", price: "TZS 90,000", online: false, photo: u("photo-1541823709867-1b206113eafd") },
  { name: "Ethan Clark", age: 28, job: "Mwanasoka", duration: "Dakika 45", price: "TZS 100,000", online: true, photo: u("photo-1517070208541-6ddc4d3efbcb") },
  { name: "Marie Laurent", age: 35, job: "Mtalii na Mwandishi", duration: "Saa 1", price: "TZS 120,000", online: false, photo: u("photo-1546525848-3ce03ca516f6") },
  { name: "Henry Adams", age: 44, job: "Mhasibu", duration: "Masaa 2", price: "TZS 150,000", online: true, photo: u("photo-1487412720507-e7ab37603c6f") },
  { name: "Julia Novak", age: 23, job: "Mwanafunzi wa Kiswahili", duration: "Dakika 10", price: "TZS 70,000", online: true, photo: u("photo-1499996860823-5214fcc65f8f") },
  { name: "Robert King", age: 47, job: "Mshauri wa Biashara", duration: "Dakika 20", price: "TZS 80,000", online: false, photo: u("photo-1502378735452-bc7d86632805") },
  { name: "Elena Garcia", age: 31, job: "Mtafsiri", duration: "Dakika 30", price: "TZS 90,000", online: true, photo: u("photo-1503443207922-dff7d543fd0e") },
  { name: "William Scott", age: 38, job: "Mwalimu wa Historia", duration: "Dakika 45", price: "TZS 100,000", online: false, photo: u("photo-1513956589380-bad6acb9b9d4") },
  { name: "Hannah Berg", age: 26, job: "Mbunifu wa Michoro", duration: "Saa 1", price: "TZS 120,000", online: true, photo: u("photo-1504257432389-52343af06ae3") },
  { name: "David Lee", age: 40, job: "Mchumi", duration: "Masaa 2", price: "TZS 150,000", online: true, photo: u("photo-1507003211169-0a1dd7228f2d") },
  { name: "Camille Moreau", age: 29, job: "Mtangazaji wa Radio", duration: "Dakika 10", price: "TZS 70,000", online: false, photo: u("photo-1524250502761-1ac6f2e30d43") },
  { name: "George Evans", age: 34, job: "Mfugaji", duration: "Dakika 20", price: "TZS 80,000", online: true, photo: u("photo-1463453091185-61582044d556") },
  { name: "Sara Lindberg", age: 27, job: "Mwalimu wa Yoga", duration: "Dakika 30", price: "TZS 90,000", online: false, photo: u("photo-1535713875002-d1d0cf377fde") },
  { name: "Michael Fox", age: 42, job: "Mwanasheria", duration: "Dakika 45", price: "TZS 100,000", online: true, photo: u("photo-1517841905240-472988babdf9") },
  { name: "Alice Turner", age: 30, job: "Mkulima wa Kahawa", duration: "Saa 1", price: "TZS 120,000", online: true, photo: u("photo-1547425260-76bcadfb4f2c") },
  { name: "Victor Silva", age: 36, job: "Mwanamuziki", duration: "Masaa 2", price: "TZS 150,000", online: false, photo: u("photo-1520813792240-56fc4a3765a7") },
];

export const testimonials = [
  {
    text: "Nimechati na wazungu watatu leo, malipo yalisoma kwenye salio langu papo hapo. Mfumo ni wa kuaminika kabisa.",
    author: "Joseph Mwakyusa",
  },
  {
    text: "Nilifungua akaunti asubuhi, jioni nikatoa TZS 150,000 kupitia M-Pesa. Huduma kwa wateja wanajibu haraka.",
    author: "Fatuma Hassan",
  },
  {
    text: "Kufundisha Kiswahili kwa dakika 20 tu na kupata malipo mazuri. Chatpesa imenibadilishia maisha ya kila siku.",
    author: "Emmanuel Kileo",
  },
  {
    text: "Napenda jinsi chati inavyojifunga yenyewe na pesa kuingia moja kwa moja. Hakuna usumbufu wowote.",
    author: "Zainabu Ally",
  },
];

export const transactions = [
  "Juma M. ametoka kutoa TZS 150,000 kupitia M-Pesa",
  "Neema K. ametoka kutoa TZS 90,000 kupitia Airtel Money",
  "Baraka S. ametoka kutoa TZS 120,000 kupitia Mixx by Yas",
  "Halima R. ametoka kutoa TZS 70,000 kupitia Halopesa",
  "Peter M. ametoka kutoa TZS 100,000 kupitia CRDB",
  "Asha J. ametoka kutoa TZS 80,000 kupitia NMB",
];
