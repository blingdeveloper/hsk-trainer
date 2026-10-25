// ORIGINAL HSK 1 practice questions written for this app. NOT official HSK questions.
// Format: official HSK 3.0 Level 1 sample paper, Reading Parts 2–4.
// Status: checked by the author (Claude) against the HSK 1 word and character lists. Not yet reviewed by a native speaker.
import { hsk1Groups, inGroup, type PracticeSet } from '../types';

const groups = hsk1Groups('h1-c', {
  replies: [
    { key: 'A', text: '坐飞机去。', pinyin: 'Zuò fēijī qù.' },
    { key: 'B', text: '我也很高兴认识你。', pinyin: 'Wǒ yě hěn gāoxìng rènshi nǐ.' },
    { key: 'C', text: '好的，明天见！', pinyin: 'Hǎo de, míngtiān jiàn!' },
    { key: 'D', text: '她生病了，在医院。', pinyin: 'Tā shēngbìng le, zài yīyuàn.' },
    { key: 'E', text: '七点半。', pinyin: 'Qī diǎn bàn.' },
    { key: 'F', text: '我有两个妹妹。', pinyin: 'Wǒ yǒu liǎng gè mèimei.' },
  ],
  wordBank: [
    { key: 'A', text: '正在', pinyin: 'zhèngzài' },
    { key: 'B', text: '哪儿', pinyin: 'nǎr' },
    { key: 'C', text: '些', pinyin: 'xiē' },
    { key: 'D', text: '先生', pinyin: 'xiānsheng' },
    { key: 'E', text: '和', pinyin: 'hé' },
    { key: 'F', text: '多少', pinyin: 'duōshao' },
  ],
});
const [p2, p3, p4] = groups;

const questions = [
  ...inGroup(
    p2,
    [
      { id: 'h1-c-p2-1', prompt: '你怎么去中国？', pinyin: 'Nǐ zěnme qù Zhōngguó?', correctAnswer: 'A', explanation: '怎么去 asks how you travel. The reply: 坐飞机去 (by plane).' },
      { id: 'h1-c-p2-2', prompt: '你好！很高兴认识你。', pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ.', correctAnswer: 'B', explanation: 'When someone says 很高兴认识你, you can reply 我也很高兴认识你 ("nice to meet you too").' },
      { id: 'h1-c-p2-3', prompt: '我回家了，明天见！', pinyin: 'Wǒ huí jiā le, míngtiān jiàn!', correctAnswer: 'C', explanation: 'Someone says goodbye with 明天见 (see you tomorrow). The reply agrees: 好的，明天见！' },
      { id: 'h1-c-p2-4', prompt: '你女儿今天怎么没来上学？', pinyin: 'Nǐ nǚ\'ér jīntiān zěnme méi lái shàngxué?', correctAnswer: 'D', explanation: '怎么没来 asks why someone didn\'t come. The reply gives the reason: she is ill and in hospital.' },
      { id: 'h1-c-p2-5', prompt: '你明天早上几点起床？', pinyin: 'Nǐ míngtiān zǎoshang jǐ diǎn qǐchuáng?', correctAnswer: 'E', explanation: '几点 asks the time. The reply gives one: 七点半 (7:30).' },
    ],
    1,
  ),
  ...inGroup(
    p3,
    [
      { id: 'h1-c-p3-1', prompt: '你看，小狗（ ）睡觉呢。', pinyin: 'Nǐ kàn, xiǎo gǒu ( ) shuìjiào ne.', correctAnswer: 'A', explanation: '正在 + verb + 呢 means something is happening right now: "Look, the puppy is sleeping."' },
      { id: 'h1-c-p3-2', prompt: '你的书在（ ）？', pinyin: 'Nǐ de shū zài ( )?', correctAnswer: 'B', explanation: '在哪儿 asks where something is: "Where is your book?"' },
      { id: 'h1-c-p3-3', prompt: '我买了一（ ）水果。', pinyin: 'Wǒ mǎile yì ( ) shuǐguǒ.', correctAnswer: 'C', explanation: '一些 means "some": "I bought some fruit."' },
      { id: 'h1-c-p3-4', prompt: '李（ ）是我们公司的医生。', pinyin: 'Lǐ ( ) shì wǒmen gōngsī de yīshēng.', correctAnswer: 'D', explanation: 'Surname + 先生 means "Mr …": "Mr Li is our company\'s doctor."' },
      { id: 'h1-c-p3-5', prompt: '我（ ）妈妈一起去超市。', pinyin: 'Wǒ ( ) māma yìqǐ qù chāoshì.', correctAnswer: 'E', explanation: 'A 和 B 一起 + verb: "I go to the supermarket together with Mum."' },
    ],
    1,
  ),
  ...inGroup(
    p4,
    [
      {
        id: 'h1-c-p4-1', prompt: '今天中午我们在饭店吃了米饭和鸡蛋，非常好吃。',
        pinyin: 'Jīntiān zhōngwǔ wǒmen zài fàndiàn chīle mǐfàn hé jīdàn, fēicháng hǎochī.',
        question: '★ 他们中午吃了什么？',
        options: [
          { key: 'A', text: '面条儿', pinyin: 'miàntiáor' },
          { key: 'B', text: '米饭和鸡蛋', pinyin: 'mǐfàn hé jīdàn' },
          { key: 'C', text: '包子', pinyin: 'bāozi' },
        ],
        correctAnswer: 'B',
        explanation: '吃了米饭和鸡蛋: they ate rice and eggs.',
      },
      {
        id: 'h1-c-p4-2', prompt: '我的手机找不到了，你能给我打个电话吗？',
        pinyin: 'Wǒ de shǒujī zhǎo bu dào le, nǐ néng gěi wǒ dǎ gè diànhuà ma?',
        question: '★ 说话人想：',
        options: [
          { key: 'A', text: '找手机', pinyin: 'zhǎo shǒujī' },
          { key: 'B', text: '买手机', pinyin: 'mǎi shǒujī' },
          { key: 'C', text: '看电视', pinyin: 'kàn diànshì' },
        ],
        correctAnswer: 'A',
        explanation: '找不到 means "can\'t find". They ask you to call their phone so they can find it.',
      },
      {
        id: 'h1-c-p4-3', prompt: '我是中学生，我妹妹是小学生，她今年七岁。',
        pinyin: 'Wǒ shì zhōngxuéshēng, wǒ mèimei shì xiǎoxuéshēng, tā jīnnián qī suì.',
        question: '★ 妹妹：',
        options: [
          { key: 'A', text: '是中学生', pinyin: 'shì zhōngxuéshēng' },
          { key: 'B', text: '今年七岁', pinyin: 'jīnnián qī suì' },
          { key: 'C', text: '是老师', pinyin: 'shì lǎoshī' },
        ],
        correctAnswer: 'B',
        explanation: '她今年七岁: the younger sister is seven. She is a primary school pupil (小学生); the speaker is the secondary school pupil.',
      },
      {
        id: 'h1-c-p4-4', prompt: '明天是我的生日，我想请朋友们来我家吃饭。',
        pinyin: 'Míngtiān shì wǒ de shēngrì, wǒ xiǎng qǐng péngyoumen lái wǒ jiā chīfàn.',
        question: '★ 明天：',
        options: [
          { key: 'A', text: '是他的生日', pinyin: 'shì tā de shēngrì' },
          { key: 'B', text: '他去朋友家', pinyin: 'tā qù péngyou jiā' },
          { key: 'C', text: '他要上班', pinyin: 'tā yào shàngbān' },
        ],
        correctAnswer: 'A',
        explanation: '明天是我的生日: tomorrow is his birthday. Friends come to his home, not the other way round.',
      },
      {
        id: 'h1-c-p4-5', prompt: '现在是下午五点，商店里人很多。',
        pinyin: 'Xiànzài shì xiàwǔ wǔ diǎn, shāngdiàn li rén hěn duō.',
        question: '★ 现在几点？',
        options: [
          { key: 'A', text: '下午三点', pinyin: 'xiàwǔ sān diǎn' },
          { key: 'B', text: '下午五点', pinyin: 'xiàwǔ wǔ diǎn' },
          { key: 'C', text: '早上九点', pinyin: 'zǎoshang jiǔ diǎn' },
        ],
        correctAnswer: 'B',
        explanation: '现在是下午五点: it is 5 pm.',
      },
    ],
    1,
  ),
];

export const H1_SET_C: PracticeSet = { id: 'c', level: 1, title: 'Practice set C', groups, questions };
