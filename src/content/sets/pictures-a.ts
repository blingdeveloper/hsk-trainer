// ORIGINAL practice questions written for this app. NOT official HSK questions.
// Status: checked by the author (Claude) against the HSK 1–2 word list. Not yet reviewed by a native speaker.
// Pictures: free photos under the Unsplash License, registered with their credits in src/content/media.ts.
import { inGroup, pictureGroup, type PracticeSet } from '../types';

const group = pictureGroup('p1a', [
  { key: 'A', text: '', image: 'unsplash-3KgSopqBgYI' }, // talking on the phone
  { key: 'B', text: '', image: 'unsplash-otYC4eoGJGg' }, // children playing football
  { key: 'C', text: '', image: 'unsplash-wuQEpz6uxSw' }, // drinking milk
  { key: 'D', text: '', image: 'unsplash-Co_hWX_XtEk' }, // cat sleeping
  { key: 'E', text: '', image: 'unsplash-KTrov7eujms' }, // cooking (not used)
  { key: 'F', text: '', image: 'unsplash-yDOzSz7YcYE' }, // rain, umbrellas
]);

const questions = inGroup(group, [
  {
    id: 'p1a-r1-1', prompt: '我每天早上喝一杯牛奶。', pinyin: 'Wǒ měi tiān zǎoshang hē yì bēi niúnǎi.', correctAnswer: 'C',
    explanation: '喝一杯牛奶 means "drink a glass of milk", and 每天早上 means "every morning". Picture C shows someone drinking milk.',
  },
  {
    id: 'p1a-r1-2', prompt: '外面下雨了，我们明天再去吧。', pinyin: 'Wàimiàn xià yǔ le, wǒmen míngtiān zài qù ba.', correctAnswer: 'F',
    explanation: '下雨了 means "it\'s raining (now)": 了 marks the new situation. Picture F shows rain and umbrellas.',
  },
  {
    id: 'p1a-r1-3', prompt: '他们在踢足球呢。', pinyin: 'Tāmen zài tī zúqiú ne.', correctAnswer: 'B',
    explanation: '踢足球 means "play football" (literally "kick a football"). 在…呢 shows the action is happening now. Picture B.',
  },
  {
    id: 'p1a-r1-4', prompt: '小猫在睡觉呢。', pinyin: 'Xiǎo māo zài shuìjiào ne.', correctAnswer: 'D',
    explanation: '小猫 is "the little cat" and 在睡觉呢 means "is sleeping". Picture D shows a sleeping cat.',
  },
  {
    id: 'p1a-r1-5', prompt: '她在给妈妈打电话。', pinyin: 'Tā zài gěi māma dǎ diànhuà.', correctAnswer: 'A',
    explanation: '给 + person + 打电话 means "to phone someone": "She is phoning her mum." Picture A shows a woman on the phone.',
  },
]);

export const PICTURES_A: PracticeSet = { id: 'p1a', level: 2, title: 'Picture set 1', groups: [group], questions };
