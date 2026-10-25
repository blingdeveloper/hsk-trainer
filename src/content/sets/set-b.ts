// ORIGINAL practice questions written for this app. NOT official HSK questions.
// Status: checked by the author (Claude) against the HSK 1–2 word list. Not yet reviewed by a native speaker.
import { inGroup, standardGroups, type PracticeSet } from '../types';

const groups = standardGroups('b', {
  r2: [
    { key: 'A', text: '再', pinyin: 'zài' },
    { key: 'B', text: '就', pinyin: 'jiù' },
    { key: 'C', text: '比', pinyin: 'bǐ' },
    { key: 'D', text: '从', pinyin: 'cóng' },
    { key: 'E', text: '对', pinyin: 'duì' },
    { key: 'F', text: '最', pinyin: 'zuì' },
  ],
  r3: [
    { key: 'A', text: '谢谢，我自己能做。', pinyin: 'Xièxie, wǒ zìjǐ néng zuò.' },
    { key: 'B', text: '在桌子上，你看看。', pinyin: 'Zài zhuōzi shang, nǐ kànkan.' },
    { key: 'C', text: '十二点了，我们去吃饭吧。', pinyin: 'Shí\'èr diǎn le, wǒmen qù chīfàn ba.' },
    { key: 'D', text: '我坐飞机去，两个小时就到了。', pinyin: 'Wǒ zuò fēijī qù, liǎng gè xiǎoshí jiù dào le.' },
    { key: 'E', text: '没关系，明天再来吧。', pinyin: 'Méi guānxi, míngtiān zài lái ba.' },
    { key: 'F', text: '我也很喜欢那个商店。', pinyin: 'Wǒ yě hěn xǐhuan nàge shāngdiàn.' },
  ],
  w1: [
    { key: 'A', text: '亻' },
    { key: 'B', text: '扌' },
    { key: 'C', text: '女' },
    { key: 'D', text: '讠' },
    { key: 'E', text: '口' },
    { key: 'F', text: '日' },
  ],
});
const [r2, r3, r4, w1, w2] = groups;

const questions = [
  ...inGroup(r2, [
    {
      id: 'b-r2-1', prompt: '我（ ）喜欢的水果是苹果。', pinyin: 'Wǒ ( ) xǐhuan de shuǐguǒ shì píngguǒ.', correctAnswer: 'F',
      explanation: '最 (most) goes before an adjective or a verb like 喜欢: "My favourite fruit is the apple."',
    },
    {
      id: 'b-r2-2', prompt: '今天（ ）昨天冷一点儿。', pinyin: 'Jīntiān ( ) zuótiān lěng yìdiǎnr.', correctAnswer: 'C',
      explanation: 'A 比 B + adjective compares two things: "Today is a bit colder than yesterday." 一点儿 comes after the adjective.',
    },
    {
      id: 'b-r2-3', prompt: '我们（ ）八点到十点上课。', pinyin: 'Wǒmen ( ) bā diǎn dào shí diǎn shàngkè.', correctAnswer: 'D',
      explanation: '从…到… means "from… to…": "We have class from 8 to 10."',
    },
    {
      id: 'b-r2-4', prompt: '你说得（ ），他是我哥哥。', pinyin: 'Nǐ shuō de ( ), tā shì wǒ gēge.', correctAnswer: 'E',
      explanation: '说得对 means "you\'re right". 得 links the verb 说 to a comment on how it was done.',
    },
    {
      id: 'b-r2-5', prompt: '这个电影很好看，我想（ ）看一次。', pinyin: 'Zhège diànyǐng hěn hǎokàn, wǒ xiǎng ( ) kàn yí cì.', correctAnswer: 'A',
      explanation: '再 means "again" for something that hasn\'t happened yet: "I want to watch it once more."',
    },
  ]),
  ...inGroup(r3, [
    { id: 'b-r3-1', prompt: '我的手机呢？你看见了吗？', pinyin: 'Wǒ de shǒujī ne? Nǐ kànjiàn le ma?', correctAnswer: 'B', explanation: '"Where\'s my phone?" The reply says where it is: on the table.' },
    { id: 'b-r3-2', prompt: '现在几点了？', pinyin: 'Xiànzài jǐ diǎn le?', correctAnswer: 'C', explanation: '几点 asks the time. The reply: "It\'s twelve o\'clock, let\'s go and eat."' },
    { id: 'b-r3-3', prompt: '要不要我帮你？', pinyin: 'Yào bu yào wǒ bāng nǐ?', correctAnswer: 'A', explanation: '"Do you want me to help?" The reply thanks them but says they can do it alone (我自己能做).' },
    { id: 'b-r3-4', prompt: '你怎么去北京？', pinyin: 'Nǐ zěnme qù Běijīng?', correctAnswer: 'D', explanation: '怎么去 asks how you travel. The reply says by plane.' },
    { id: 'b-r3-5', prompt: '对不起，我今天太忙了，不能去你家了。', pinyin: 'Duìbuqǐ, wǒ jīntiān tài máng le, bù néng qù nǐ jiā le.', correctAnswer: 'E', explanation: '对不起 is answered with 没关系 (it doesn\'t matter), and the reply suggests coming tomorrow.' },
  ]),
  ...inGroup(r4, [
    {
      id: 'b-r4-1', prompt: '我哥哥在医院工作，他是医生。他每天都很忙，有时候晚上也不能回家。',
      pinyin: 'Wǒ gēge zài yīyuàn gōngzuò, tā shì yīshēng. Tā měi tiān dōu hěn máng, yǒu shíhou wǎnshang yě bù néng huí jiā.',
      question: '★ 哥哥：',
      options: [
        { key: 'A', text: '是老师', pinyin: 'shì lǎoshī' },
        { key: 'B', text: '工作很忙', pinyin: 'gōngzuò hěn máng' },
        { key: 'C', text: '每天在家', pinyin: 'měi tiān zài jiā' },
      ],
      correctAnswer: 'B',
      explanation: 'He is a doctor (医生), not a teacher, and 每天都很忙 (busy every day). Sometimes he can\'t even go home, so C is wrong.',
    },
    {
      id: 'b-r4-2', prompt: '小王，你的汉字写得真好看！你学了多长时间了？',
      pinyin: 'Xiǎo Wáng, nǐ de Hànzì xiě de zhēn hǎokàn! Nǐ xuéle duō cháng shíjiān le?',
      question: '★ 小王：',
      options: [
        { key: 'A', text: '字写得好', pinyin: 'zì xiě de hǎo' },
        { key: 'B', text: '是老师', pinyin: 'shì lǎoshī' },
        { key: 'C', text: '不想学习', pinyin: 'bù xiǎng xuéxí' },
      ],
      correctAnswer: 'A',
      explanation: 'The speaker praises Xiao Wang\'s handwriting (汉字写得真好看), so A is right. Nothing says Xiao Wang is a teacher, and he has been learning, so C is wrong.',
    },
    {
      id: 'b-r4-3', prompt: '昨天我去商店买了两件衣服，一件红色的，一件白色的。红色的比白色的贵。',
      pinyin: 'Zuótiān wǒ qù shāngdiàn mǎile liǎng jiàn yīfu, yí jiàn hóngsè de, yí jiàn báisè de. Hóngsè de bǐ báisè de guì.',
      question: '★ 哪件衣服贵？',
      options: [
        { key: 'A', text: '红色的', pinyin: 'hóngsè de' },
        { key: 'B', text: '白色的', pinyin: 'báisè de' },
        { key: 'C', text: '一样贵', pinyin: 'yíyàng guì' },
      ],
      correctAnswer: 'A',
      explanation: '红色的比白色的贵: the red one is more expensive than the white one.',
    },
    {
      id: 'b-r4-4', prompt: '我家有一只小狗，它很喜欢跟我一起出去跑步。',
      pinyin: 'Wǒ jiā yǒu yì zhī xiǎo gǒu, tā hěn xǐhuan gēn wǒ yìqǐ chūqù pǎobù.',
      question: '★ 小狗喜欢：',
      options: [
        { key: 'A', text: '睡觉', pinyin: 'shuìjiào' },
        { key: 'B', text: '吃东西', pinyin: 'chī dōngxi' },
        { key: 'C', text: '跑步', pinyin: 'pǎobù' },
      ],
      correctAnswer: 'C',
      explanation: '它很喜欢…出去跑步: the dog likes going out running with the speaker.',
    },
    {
      id: 'b-r4-5', prompt: '明天是星期六，我不去学校，所以想在家里多睡一会儿。',
      pinyin: 'Míngtiān shì xīngqīliù, wǒ bú qù xuéxiào, suǒyǐ xiǎng zài jiā li duō shuì yíhuìr.',
      question: '★ 他明天：',
      options: [
        { key: 'A', text: '要去学校', pinyin: 'yào qù xuéxiào' },
        { key: 'B', text: '想多睡觉', pinyin: 'xiǎng duō shuìjiào' },
        { key: 'C', text: '要去工作', pinyin: 'yào qù gōngzuò' },
      ],
      correctAnswer: 'B',
      explanation: '不去学校 means he isn\'t going to school, and he wants to 多睡一会儿 (sleep a bit longer).',
    },
  ]),
  ...inGroup(w1, [
    { id: 'b-w1-1', prompt: '你好', component: { word: '你好', pinyin: 'nǐ hǎo', index: 0, shown: '尔' }, correctAnswer: 'A', explanation: '你 = 亻 (person) + 尔. People words often have 亻: 他, 们, 作.' },
    { id: 'b-w1-2', prompt: '姐姐', component: { word: '姐姐', pinyin: 'jiějie', index: 0, shown: '且' }, correctAnswer: 'C', explanation: '姐 (older sister) = 女 (woman) + 且.' },
    { id: 'b-w1-3', prompt: '请问', component: { word: '请问', pinyin: 'qǐngwèn', index: 0, shown: '青' }, correctAnswer: 'D', explanation: '请 = 讠 (speech) + 青 (qīng, gives the sound).' },
    { id: 'b-w1-4', prompt: '明天', component: { word: '明天', pinyin: 'míngtiān', index: 0, shown: '月' }, correctAnswer: 'F', explanation: '明 (bright) = 日 (sun) + 月 (moon).' },
    { id: 'b-w1-5', prompt: '打车', component: { word: '打车', pinyin: 'dǎchē', index: 0, shown: '丁' }, correctAnswer: 'B', explanation: '打 = 扌 (hand) + 丁. Actions done with the hand often have 扌: 打, 找, 拿.' },
  ]),
  ...inGroup(w2, [
    { id: 'b-w2-1', prompt: '我今年八（ ）了。', pinyin: 'Wǒ jīnnián bā (suì) le.', correctAnswer: '岁', explanation: '岁 (suì) means years of age: 八岁 = eight years old.' },
    { id: 'b-w2-2', prompt: '这本（ ）很有意思。', pinyin: 'Zhè běn (shū) hěn yǒu yìsi.', correctAnswer: '书', explanation: '书 (shū) means book. 本 is the measure word for books.' },
    { id: 'b-w2-3', prompt: '下（ ）我们去看电影吧。', pinyin: 'Xià (wǔ) wǒmen qù kàn diànyǐng ba.', correctAnswer: '午', explanation: '下午 (xiàwǔ) means afternoon. 午 also appears in 上午 and 中午.' },
    { id: 'b-w2-4', prompt: '我是（ ）国人。', pinyin: 'Wǒ shì (Zhōng) guó rén.', correctAnswer: '中', explanation: '中国 (Zhōngguó) means China. 中 is a box with a line through the middle.' },
    { id: 'b-w2-5', prompt: '我（ ）爸是医生。', pinyin: 'Wǒ (bà) ba shì yīshēng.', correctAnswer: '爸', explanation: '爸爸 (bàba) means dad. The top part 父 means father.' },
  ]),
];

export const SET_B: PracticeSet = { id: 'b', title: 'Practice set B', groups, questions };
