// ORIGINAL HSK 1 practice questions written for this app. NOT official HSK questions.
// Format: official HSK 3.0 Level 1 sample paper, Reading Parts 2–4.
// Status: checked by the author (Claude) against the HSK 1 word and character lists. Not yet reviewed by a native speaker.
import { hsk1Groups, inGroup, type PracticeSet } from '../types';

const groups = hsk1Groups('h1-b', {
  replies: [
    { key: 'A', text: '是的，他是我爸爸。', pinyin: 'Shì de, tā shì wǒ bàba.' },
    { key: 'B', text: '我在家看电视。', pinyin: 'Wǒ zài jiā kàn diànshì.' },
    { key: 'C', text: '没关系。', pinyin: 'Méi guānxi.' },
    { key: 'D', text: '我喜欢喝茶。', pinyin: 'Wǒ xǐhuan hē chá.' },
    { key: 'E', text: '星期天。', pinyin: 'Xīngqītiān.' },
    { key: 'F', text: '不太好，有点儿热。', pinyin: 'Bú tài hǎo, yǒudiǎnr rè.' },
  ],
  wordBank: [
    { key: 'A', text: '认识', pinyin: 'rènshi' },
    { key: 'B', text: '前', pinyin: 'qián' },
    { key: 'C', text: '会', pinyin: 'huì' },
    { key: 'D', text: '吃', pinyin: 'chī' },
    { key: 'E', text: '给', pinyin: 'gěi' },
    { key: 'F', text: '太', pinyin: 'tài' },
  ],
});
const [p2, p3, p4] = groups;

const questions = [
  ...inGroup(
    p2,
    [
      { id: 'h1-b-p2-1', prompt: '那个人是你爸爸吗？', pinyin: 'Nàge rén shì nǐ bàba ma?', correctAnswer: 'A', explanation: 'A yes/no question with 吗. The reply answers yes: 是的，他是我爸爸.' },
      { id: 'h1-b-p2-2', prompt: '你在哪儿呢？', pinyin: 'Nǐ zài nǎr ne?', correctAnswer: 'B', explanation: '在哪儿 asks where someone is. The reply: 我在家 (at home), watching TV.' },
      { id: 'h1-b-p2-3', prompt: '对不起，我来晚了。', pinyin: 'Duìbuqǐ, wǒ lái wǎn le.', correctAnswer: 'C', explanation: 'The usual reply to 对不起 is 没关系 ("it doesn\'t matter").' },
      { id: 'h1-b-p2-4', prompt: '你喜欢喝什么？', pinyin: 'Nǐ xǐhuan hē shénme?', correctAnswer: 'D', explanation: '喜欢喝什么 asks what you like to drink. The reply: 我喜欢喝茶 (tea).' },
      { id: 'h1-b-p2-5', prompt: '你哪天去商店？', pinyin: 'Nǐ nǎ tiān qù shāngdiàn?', correctAnswer: 'E', explanation: '哪天 asks which day. The reply names one: 星期天 (Sunday).' },
    ],
    1,
  ),
  ...inGroup(
    p3,
    [
      { id: 'h1-b-p3-1', prompt: '很高兴（ ）你。', pinyin: 'Hěn gāoxìng ( ) nǐ.', correctAnswer: 'A', explanation: '很高兴认识你 means "nice to meet you". 认识 means to know or meet someone.' },
      { id: 'h1-b-p3-2', prompt: '我（ ）说一点儿汉语。', pinyin: 'Wǒ ( ) shuō yìdiǎnr Hànyǔ.', correctAnswer: 'C', explanation: '会 + verb means "can" for a learned skill: "I can speak a little Chinese."' },
      { id: 'h1-b-p3-3', prompt: '妈妈（ ）我买了一本书。', pinyin: 'Māma ( ) wǒ mǎile yì běn shū.', correctAnswer: 'E', explanation: 'A 给 B 买… means "A buys … for B": "Mum bought me a book."' },
      { id: 'h1-b-p3-4', prompt: '这件衣服（ ）贵了，我不买。', pinyin: 'Zhè jiàn yīfu ( ) guì le, wǒ bù mǎi.', correctAnswer: 'F', explanation: '太…了 means "too…": "This piece of clothing is too expensive, I won\'t buy it."' },
      { id: 'h1-b-p3-5', prompt: '我们中午去饭店（ ）饺子吧。', pinyin: 'Wǒmen zhōngwǔ qù fàndiàn ( ) jiǎozi ba.', correctAnswer: 'D', explanation: '吃饺子 means "eat dumplings": "Let\'s go to a restaurant at noon and eat dumplings."' },
    ],
    1,
  ),
  ...inGroup(
    p4,
    [
      {
        id: 'h1-b-p4-1', prompt: '我家有四口人：爸爸、妈妈、哥哥和我。',
        pinyin: 'Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ.',
        question: '★ 他家有几口人？',
        options: [
          { key: 'A', text: '三口', pinyin: 'sān kǒu' },
          { key: 'B', text: '四口', pinyin: 'sì kǒu' },
          { key: 'C', text: '五口', pinyin: 'wǔ kǒu' },
        ],
        correctAnswer: 'B',
        explanation: '四口人: four people (dad, mum, older brother and the speaker). 口 is the measure word for family members.',
      },
      {
        id: 'h1-b-p4-2', prompt: '王先生是我的汉语老师，他的课很好玩儿。',
        pinyin: 'Wáng xiānsheng shì wǒ de Hànyǔ lǎoshī, tā de kè hěn hǎowánr.',
        question: '★ 王先生是：',
        options: [
          { key: 'A', text: '学生', pinyin: 'xuéshēng' },
          { key: 'B', text: '医生', pinyin: 'yīshēng' },
          { key: 'C', text: '老师', pinyin: 'lǎoshī' },
        ],
        correctAnswer: 'C',
        explanation: '我的汉语老师: Mr Wang is the speaker\'s Chinese teacher.',
      },
      {
        id: 'h1-b-p4-3', prompt: '我的猫叫"小白"，它很喜欢睡觉。',
        pinyin: 'Wǒ de māo jiào "Xiǎobái", tā hěn xǐhuan shuìjiào.',
        question: '★ "小白"是：',
        options: [
          { key: 'A', text: '一只猫', pinyin: 'yì zhī māo' },
          { key: 'B', text: '一个人', pinyin: 'yí gè rén' },
          { key: 'C', text: '一只狗', pinyin: 'yì zhī gǒu' },
        ],
        correctAnswer: 'A',
        explanation: '我的猫叫"小白": Xiaobai is the speaker\'s cat. 它 (it) is used for animals.',
      },
      {
        id: 'h1-b-p4-4', prompt: '我明天上午坐火车去北京，下午三点到。',
        pinyin: 'Wǒ míngtiān shàngwǔ zuò huǒchē qù Běijīng, xiàwǔ sān diǎn dào.',
        question: '★ 他明天下午：',
        options: [
          { key: 'A', text: '到北京', pinyin: 'dào Běijīng' },
          { key: 'B', text: '去学校', pinyin: 'qù xuéxiào' },
          { key: 'C', text: '在家里', pinyin: 'zài jiā li' },
        ],
        correctAnswer: 'A',
        explanation: 'He leaves in the morning by train and arrives (到) in Beijing at 3 in the afternoon.',
      },
      {
        id: 'h1-b-p4-5', prompt: '你看，外边下雪了，今天真冷！',
        pinyin: 'Nǐ kàn, wàibian xià xuě le, jīntiān zhēn lěng!',
        question: '★ 今天：',
        options: [
          { key: 'A', text: '很热', pinyin: 'hěn rè' },
          { key: 'B', text: '很冷', pinyin: 'hěn lěng' },
          { key: 'C', text: '下雨了', pinyin: 'xià yǔ le' },
        ],
        correctAnswer: 'B',
        explanation: '真冷 (really cold), and it\'s snowing (下雪), not raining (下雨).',
      },
    ],
    1,
  ),
];

export const H1_SET_B: PracticeSet = { id: 'b', level: 1, title: 'Practice set B', groups, questions };
