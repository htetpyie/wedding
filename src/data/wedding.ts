// Wedding details. Replace photo placeholders and configure music before publishing.
export const wedding = {
  names: ['Aung Kyaw Oo', 'Htet Inzali Wai'],
  initials: 'A & H',
  date: '2026-11-15',
  startsAt: '2026-11-15T09:00:00+06:30',
  endsAt: '2026-11-15T11:00:00+06:30',
  timeLabel: '9:00 AM – 11:00 AM',
  dateLabel: 'Sunday, 15 November 2026',
  venue: 'M3 Food Center',
  address: 'အမှတ်(၈), အနောက်ရွှေဂုံတိုင်လမ်း၊ ဗဟန်းအားကစားဝင်းအတွင်း၊ ရွှေတိဂုံဘုရားမြောက်ဘက်မုခ်၊ ဗဟန်းမြို့နယ်။',
  mapUrl: 'https://maps.app.goo.gl/PBq1sFq8RYNz3wKX7',
  musicUrl: '', // Set to a licensed audio file in public/, e.g. /music/our-song.mp3.
};
export const photos = [
  { label: 'Our favourite portrait', color: '#8b987e' },
  { label: 'A moment together', color: '#b4a28d' },
  { label: 'Somewhere with you', color: '#7e8a78' },
  { label: 'The little joys', color: '#beaa98' },
  { label: 'Just us', color: '#929481' },
].map((photo, index) => ({ ...photo, src: `/photos/photo-${index + 1}.JPG` }));
