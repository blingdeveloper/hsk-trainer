// ORIGINAL HSK 1 practice questions written for this app. NOT official HSK questions.
// Format: official HSK 3.0 Level 1 sample paper, Reading Parts 2–4.
// Status: checked by the author (Claude) against the HSK 1 word and character lists. Not yet reviewed by a native speaker.
import { hsk1Groups, inGroup, type PracticeSet } from '../types';

const groups = hsk1Groups('h1-a', {
  replies: [
    { key: 'A', text: '我叫王小明。', pinyin: 'Wǒ jiào Wáng Xiǎomíng.' },
    { key: 'B', text: '不客气。', pinyin: 'Bú kèqi.' },
    { key: 'C', text: '在桌子上。', pinyin: 'Zài zhuōzi shang.' },
    { key: 'D', text: '二十块钱。', pinyin: 'Èrshí kuài qián.' },
    { key: 'E', text: '我今年八岁。', pinyin: 'Wǒ jīnnián bā suì.' },
    { key: 'F', text: '明天下午。', pinyin: 'Míngtiān xiàwǔ.' },
  ],
  wordBank: [
    { key: 'A', text: '喝', pinyin: 'hē' },
    { key: 'B', text: '漂亮', pinyin: 'piàoliang' },
    { key: 'C', text: '怎么', pinyin: 'zěnme' },
    { key: 'D', text: '有点儿', pinyin: 'yǒudiǎnr' },
    { key: 'E', text: '里', pinyin: 'lǐ' },
    { key: 'F', text: '都', pinyin: 'dōu' },
  ],
});
const [p2, p3, p4] = groups;

const questions = [
  ...inGroup(
    p2,
    [
      { id: 'h1-a-p2-1', prompt: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', correctAnswer: 'A', explanation: '叫什么名字 asks for a name. The reply gives one: 我叫王小明.' },
      { id: 'h1-a-p2-2', prompt: '谢谢你！', pinyin: 'Xièxie nǐ!', correctAnswer: 'B', explanation: 'The usual reply to 谢谢 is 不客气 ("you\'re welcome").' },
      { id: 'h1-a-p2-3', prompt: '我的手机在哪儿？', pinyin: 'Wǒ de shǒujī zài nǎr?', correctAnswer: 'C', explanation: '在哪儿 asks where something is. The reply gives a place: 在桌子上 (on the table).' },
      { id: 'h1-a-p2-4', prompt: '这个杯子多少钱？', pinyin: 'Zhège bēizi duōshao qián?', correctAnswer: 'D', explanation: '多少钱 asks a price. The reply gives one: 二十块钱 (20 kuai).' },
      { id: 'h1-a-p2-5', prompt: '你今年几岁？', pinyin: 'Nǐ jīnnián jǐ suì?', correctAnswer: 'E', explanation: '几岁 asks a child\'s age. The reply: 我今年八岁 (I\'m eight this year).' },
    ],
    1,
  ),
  ...inGroup(
    p3,
    [
      { id: 'h1-a-p3-1', prompt: '我想（ ）一杯牛奶。', pinyin: 'Wǒ xiǎng ( ) yì bēi niúnǎi.', correctAnswer: 'A', explanation: '喝 (to drink) goes with drinks like 牛奶: "I\'d like to drink a glass of milk."' },
      { id: 'h1-a-p3-2', prompt: '你的衣服真（ ）！', pinyin: 'Nǐ de yīfu zhēn ( )!', correctAnswer: 'B', explanation: '真 + adjective: "Your clothes are really pretty!" 漂亮 is the only adjective in the list that fits.' },
      { id: 'h1-a-p3-3', prompt: '你（ ）去学校？', pinyin: 'Nǐ ( ) qù xuéxiào?', correctAnswer: 'C', explanation: '怎么 + verb asks how: "How do you get to school?"' },
      { id: 'h1-a-p3-4', prompt: '今天（ ）冷，你多穿点儿衣服。', pinyin: 'Jīntiān ( ) lěng, nǐ duō chuān diǎnr yīfu.', correctAnswer: 'D', explanation: '有点儿 + adjective means "a bit": "It\'s a bit cold today, wear more clothes."' },
      { id: 'h1-a-p3-5', prompt: '我们（ ）是学生。', pinyin: 'Wǒmen ( ) shì xuéshēng.', correctAnswer: 'F', explanation: '都 (all) goes before the verb: "We are all students."' },
    ],
    1,
  ),
  ...inGroup(
    p4,
    [
      {
        id: 'h1-a-p4-1', prompt: '我有一个姐姐，她是医生，在医院工作。',
        pinyin: 'Wǒ yǒu yí gè jiějie, tā shì yīshēng, zài yīyuàn gōngzuò.',
        question: '★ 姐姐在哪儿工作？',
        options: [
          { key: 'A', text: '学校', pinyin: 'xuéxiào' },
          { key: 'B', text: '医院', pinyin: 'yīyuàn' },
          { key: 'C', text: '商店', pinyin: 'shāngdiàn' },
        ],
        correctAnswer: 'B',
        explanation: '在医院工作: she works in a hospital. She is a doctor (医生).',
      },
      {
        id: 'h1-a-p4-2', prompt: '今天是星期六，我不上班，想在家里睡觉。',
        pinyin: 'Jīntiān shì xīngqīliù, wǒ bú shàngbān, xiǎng zài jiā li shuìjiào.',
        question: '★ 他今天想：',
        options: [
          { key: 'A', text: '上班', pinyin: 'shàngbān' },
          { key: 'B', text: '睡觉', pinyin: 'shuìjiào' },
          { key: 'C', text: '买东西', pinyin: 'mǎi dōngxi' },
        ],
        correctAnswer: 'B',
        explanation: '想在家里睡觉: he wants to sleep at home. 不上班 means he isn\'t working, so A is wrong.',
      },
      {
        id: 'h1-a-p4-3', prompt: '这个苹果很好吃，也很便宜，一块钱一个。',
        pinyin: 'Zhège píngguǒ hěn hǎochī, yě hěn piányi, yí kuài qián yí gè.',
        question: '★ 苹果：',
        options: [
          { key: 'A', text: '很贵', pinyin: 'hěn guì' },
          { key: 'B', text: '不好吃', pinyin: 'bù hǎochī' },
          { key: 'C', text: '很便宜', pinyin: 'hěn piányi' },
        ],
        correctAnswer: 'C',
        explanation: '很便宜 (very cheap): one kuai each. A and B say the opposite of the passage.',
      },
      {
        id: 'h1-a-p4-4', prompt: '我昨天晚上看了一个电影，非常好看。',
        pinyin: 'Wǒ zuótiān wǎnshang kànle yí gè diànyǐng, fēicháng hǎokàn.',
        question: '★ 他昨天晚上：',
        options: [
          { key: 'A', text: '看电影了', pinyin: 'kàn diànyǐng le' },
          { key: 'B', text: '去学校了', pinyin: 'qù xuéxiào le' },
          { key: 'C', text: '在睡觉', pinyin: 'zài shuìjiào' },
        ],
        correctAnswer: 'A',
        explanation: '看了一个电影: he watched a film last night.',
      },
      {
        id: 'h1-a-p4-5', prompt: '下雨了，我们坐出租车回家吧。',
        pinyin: 'Xià yǔ le, wǒmen zuò chūzūchē huí jiā ba.',
        question: '★ 他们要怎么回家？',
        options: [
          { key: 'A', text: '开车', pinyin: 'kāichē' },
          { key: 'B', text: '坐出租车', pinyin: 'zuò chūzūchē' },
          { key: 'C', text: '坐火车', pinyin: 'zuò huǒchē' },
        ],
        correctAnswer: 'B',
        explanation: '坐出租车回家: they\'ll take a taxi home because it\'s raining.',
      },
    ],
    1,
  ),
];

export const H1_SET_A: PracticeSet = { id: 'a', level: 1, title: 'Practice set A', groups, questions };
