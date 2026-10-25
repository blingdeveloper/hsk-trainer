// ORIGINAL practice questions written for this app. NOT official HSK questions.
// Status: checked by the author (Claude) against the HSK 1–2 word list. Not yet reviewed by a native speaker.
import { ORIGINAL, type PracticeSet, type Question, type QuestionGroup } from '../types';

const groups: QuestionGroup[] = [
  {
    id: 'a-r2',
    skill: 'reading',
    taskType: 'reading-2-word-bank',
    officialPart: 'Reading Part 2',
    instructions: 'Choose the word that fills the gap. One word is not used.',
    options: [
      { key: 'A', text: '离', pinyin: 'lí' },
      { key: 'B', text: '一起', pinyin: 'yìqǐ' },
      { key: 'C', text: '已经', pinyin: 'yǐjīng' },
      { key: 'D', text: '因为', pinyin: 'yīnwèi' },
      { key: 'E', text: '还是', pinyin: 'háishi' },
      { key: 'F', text: '快', pinyin: 'kuài' },
    ],
  },
  {
    id: 'a-r3',
    skill: 'reading',
    taskType: 'reading-3-response-match',
    officialPart: 'Reading Part 3',
    instructions: 'Choose the best reply to each sentence. One reply is not used.',
    options: [
      { key: 'A', text: '坐地铁去，很快。', pinyin: 'Zuò dìtiě qù, hěn kuài.' },
      { key: 'B', text: '不贵，五十块钱。', pinyin: 'Bú guì, wǔshí kuài qián.' },
      { key: 'C', text: '就是"学习"的"学"。', pinyin: 'Jiù shì "xuéxí" de "xué".' },
      { key: 'D', text: '好啊，几点见？', pinyin: 'Hǎo a, jǐ diǎn jiàn?' },
      { key: 'E', text: '他生病了，在医院。', pinyin: 'Tā shēngbìng le, zài yīyuàn.' },
      { key: 'F', text: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.' },
    ],
  },
  {
    id: 'a-r4',
    skill: 'reading',
    taskType: 'reading-4-short-passage',
    officialPart: 'Reading Part 4',
    instructions: 'Read the passage, then choose the answer to the ★ question.',
  },
  {
    id: 'a-w1',
    skill: 'writing',
    taskType: 'writing-1-component',
    officialPart: 'Writing Part 1',
    instructions: 'Each word has one character with a part missing. Choose the missing part. One part is not used.',
    options: [
      { key: 'A', text: '口' },
      { key: 'B', text: '女' },
      { key: 'C', text: '日' },
      { key: 'D', text: '木' },
      { key: 'E', text: '氵' },
      { key: 'F', text: '讠' },
    ],
  },
  {
    id: 'a-w2',
    skill: 'writing',
    taskType: 'writing-2-character',
    officialPart: 'Writing Part 2',
    instructions: 'Write the character for the pinyin in brackets. Type it or draw it on the pad.',
  },
];


const questions: Question[] = [
  // ---- Reading Part 2: word bank ----
  {
    ...ORIGINAL, id: 'a-r2-1', groupId: 'a-r2', skill: 'reading', taskType: 'reading-2-word-bank',
    prompt: '我（ ）吃过午饭了。',
    pinyin: 'Wǒ ( ) chīguo wǔfàn le.',
    correctAnswer: 'C',
    explanation: '已经 (already) goes before the verb, and 了 at the end shows the action is finished: "I have already eaten lunch."',
  },
  {
    ...ORIGINAL, id: 'a-r2-2', groupId: 'a-r2', skill: 'reading', taskType: 'reading-2-word-bank',
    prompt: '我家（ ）学校很近，走路五分钟就到。',
    pinyin: 'Wǒ jiā ( ) xuéxiào hěn jìn, zǒulù wǔ fēnzhōng jiù dào.',
    correctAnswer: 'A',
    explanation: 'A 离 B 很近/很远 means "A is close to / far from B". Here: "My home is close to the school."',
  },
  {
    ...ORIGINAL, id: 'a-r2-3', groupId: 'a-r2', skill: 'reading', taskType: 'reading-2-word-bank',
    prompt: '（ ）今天下雨，所以我们不出去玩了。',
    pinyin: '( ) jīntiān xià yǔ, suǒyǐ wǒmen bù chūqù wán le.',
    correctAnswer: 'D',
    explanation: '因为…所以… is the "because… so…" pattern. 所以 in the second half signals 因为 in the first.',
  },
  {
    ...ORIGINAL, id: 'a-r2-4', groupId: 'a-r2', skill: 'reading', taskType: 'reading-2-word-bank',
    prompt: '你今天去，（ ）明天去？',
    pinyin: 'Nǐ jīntiān qù, ( ) míngtiān qù?',
    correctAnswer: 'E',
    explanation: '还是 (or) joins two choices in a question: "Are you going today or tomorrow?"',
  },
  {
    ...ORIGINAL, id: 'a-r2-5', groupId: 'a-r2', skill: 'reading', taskType: 'reading-2-word-bank',
    prompt: '我想跟你（ ）去看电影。',
    pinyin: 'Wǒ xiǎng gēn nǐ ( ) qù kàn diànyǐng.',
    correctAnswer: 'B',
    explanation: '跟…一起 + verb means "do something together with…": "I want to go and see a film with you." 一起 goes before the verb.',
  },

  // ---- Reading Part 3: match the reply ----
  {
    ...ORIGINAL, id: 'a-r3-1', groupId: 'a-r3', skill: 'reading', taskType: 'reading-3-response-match',
    prompt: '这件衣服多少钱？', pinyin: 'Zhè jiàn yīfu duōshao qián?',
    correctAnswer: 'B',
    explanation: '多少钱 asks a price. The answer gives one: 五十块钱 (50 kuai).',
  },
  {
    ...ORIGINAL, id: 'a-r3-2', groupId: 'a-r3', skill: 'reading', taskType: 'reading-3-response-match',
    prompt: '你明天怎么去机场？', pinyin: 'Nǐ míngtiān zěnme qù jīchǎng?',
    correctAnswer: 'A',
    explanation: '怎么去 asks "how do you get there". The answer gives a way to travel: 坐地铁 (by subway).',
  },
  {
    ...ORIGINAL, id: 'a-r3-3', groupId: 'a-r3', skill: 'reading', taskType: 'reading-3-response-match',
    prompt: '王明今天怎么没来上课？', pinyin: 'Wáng Míng jīntiān zěnme méi lái shàngkè?',
    correctAnswer: 'E',
    explanation: 'Here 怎么没… asks "why didn\'t…". The answer gives a reason: he is ill and in hospital.',
  },
  {
    ...ORIGINAL, id: 'a-r3-4', groupId: 'a-r3', skill: 'reading', taskType: 'reading-3-response-match',
    prompt: '晚上我们一起吃饭，怎么样？', pinyin: 'Wǎnshang wǒmen yìqǐ chīfàn, zěnmeyàng?',
    correctAnswer: 'D',
    explanation: '…怎么样？ after a plan is a suggestion. 好啊 accepts it, and 几点见 asks when to meet.',
  },
  {
    ...ORIGINAL, id: 'a-r3-5', groupId: 'a-r3', skill: 'reading', taskType: 'reading-3-response-match',
    prompt: '这个字怎么读？', pinyin: 'Zhège zì zěnme dú?',
    correctAnswer: 'C',
    explanation: '"How do you read this character?" A common way to answer is to name a word that uses it: "It\'s the 学 in 学习", so it\'s read xué.',
  },

  // ---- Reading Part 4: short passages ----
  {
    ...ORIGINAL, id: 'a-r4-1', groupId: 'a-r4', skill: 'reading', taskType: 'reading-4-short-passage',
    prompt: '我每天早上七点起床，吃了早饭就去公司，八点半到公司。',
    pinyin: 'Wǒ měi tiān zǎoshang qī diǎn qǐchuáng, chīle zǎofàn jiù qù gōngsī, bā diǎn bàn dào gōngsī.',
    question: '★ 他每天几点到公司？',
    options: [
      { key: 'A', text: '七点', pinyin: 'qī diǎn' },
      { key: 'B', text: '八点', pinyin: 'bā diǎn' },
      { key: 'C', text: '八点半', pinyin: 'bā diǎn bàn' },
    ],
    correctAnswer: 'C',
    explanation: '七点 is when he gets up. The passage says 八点半到公司, so he arrives at 8:30.',
  },
  {
    ...ORIGINAL, id: 'a-r4-2', groupId: 'a-r4', skill: 'reading', taskType: 'reading-4-short-passage',
    prompt: '今天是妹妹的生日，妈妈给她买了一个新书包，她非常高兴。',
    pinyin: 'Jīntiān shì mèimei de shēngrì, māma gěi tā mǎile yí gè xīn shūbāo, tā fēicháng gāoxìng.',
    question: '★ 妹妹为什么高兴？',
    options: [
      { key: 'A', text: '考试考得好', pinyin: 'kǎoshì kǎo de hǎo' },
      { key: 'B', text: '有了新书包', pinyin: 'yǒule xīn shūbāo' },
      { key: 'C', text: '去了商店', pinyin: 'qùle shāngdiàn' },
    ],
    correctAnswer: 'B',
    explanation: 'Mum bought her a new schoolbag for her birthday. That\'s why she is happy.',
  },
  {
    ...ORIGINAL, id: 'a-r4-3', groupId: 'a-r4', skill: 'reading', taskType: 'reading-4-short-passage',
    prompt: '这家饭馆的菜很好吃，也不贵，所以每天来吃饭的人都很多。',
    pinyin: 'Zhè jiā fànguǎn de cài hěn hǎochī, yě bú guì, suǒyǐ měi tiān lái chīfàn de rén dōu hěn duō.',
    question: '★ 这家饭馆：',
    options: [
      { key: 'A', text: '人很少', pinyin: 'rén hěn shǎo' },
      { key: 'B', text: '菜很贵', pinyin: 'cài hěn guì' },
      { key: 'C', text: '菜好吃', pinyin: 'cài hǎochī' },
    ],
    correctAnswer: 'C',
    explanation: '菜很好吃，也不贵 (tasty and not expensive). A and B say the opposite of the passage.',
  },
  {
    ...ORIGINAL, id: 'a-r4-4', groupId: 'a-r4', skill: 'reading', taskType: 'reading-4-short-passage',
    prompt: '我想去中国学习，所以现在每天晚上都去学校上中文课。',
    pinyin: 'Wǒ xiǎng qù Zhōngguó xuéxí, suǒyǐ xiànzài měi tiān wǎnshang dōu qù xuéxiào shàng Zhōngwén kè.',
    question: '★ 说话人现在：',
    options: [
      { key: 'A', text: '在中国工作', pinyin: 'zài Zhōngguó gōngzuò' },
      { key: 'B', text: '在学中文', pinyin: 'zài xué Zhōngwén' },
      { key: 'C', text: '是中文老师', pinyin: 'shì Zhōngwén lǎoshī' },
    ],
    correctAnswer: 'B',
    explanation: 'They take Chinese classes every evening, so they are learning Chinese now. China is only where they want to go.',
  },
  {
    ...ORIGINAL, id: 'a-r4-5', groupId: 'a-r4', skill: 'reading', taskType: 'reading-4-short-passage',
    prompt: '今天外面很冷，你出去的时候多穿点儿衣服。',
    pinyin: 'Jīntiān wàimiàn hěn lěng, nǐ chūqù de shíhou duō chuān diǎnr yīfu.',
    question: '★ 说话人让他：',
    options: [
      { key: 'A', text: '多穿衣服', pinyin: 'duō chuān yīfu' },
      { key: 'B', text: '早点回家', pinyin: 'zǎo diǎn huí jiā' },
      { key: 'C', text: '去买衣服', pinyin: 'qù mǎi yīfu' },
    ],
    correctAnswer: 'A',
    explanation: '多穿点儿衣服 means "wear more clothes", because it\'s cold. C is a trap: 衣服 appears, but nobody says to buy any.',
  },

  // ---- Writing Part 1: missing component ----
  {
    ...ORIGINAL, id: 'a-w1-1', groupId: 'a-w1', skill: 'writing', taskType: 'writing-1-component',
    prompt: '妈妈', component: { word: '妈妈', pinyin: 'māma', index: 0, shown: '马' },
    correctAnswer: 'B',
    explanation: '妈 = 女 (woman) + 马 (mǎ, gives the sound). Many family words for women use 女: 妈, 姐, 妹, 奶.',
  },
  {
    ...ORIGINAL, id: 'a-w1-2', groupId: 'a-w1', skill: 'writing', taskType: 'writing-1-component',
    prompt: '好吗', component: { word: '好吗', pinyin: 'hǎo ma', index: 1, shown: '马' },
    correctAnswer: 'A',
    explanation: '吗 = 口 (mouth) + 马 (sound). Compare with 妈 = 女 + 马. Same sound part, different meaning part. Many particles have 口: 吗, 吧, 呢.',
  },
  {
    ...ORIGINAL, id: 'a-w1-3', groupId: 'a-w1', skill: 'writing', taskType: 'writing-1-component',
    prompt: '时间', component: { word: '时间', pinyin: 'shíjiān', index: 0, shown: '寸' },
    correctAnswer: 'C',
    explanation: '时 (time) = 日 (sun/day) + 寸. Time words often contain 日: 时, 明, 晚, 昨.',
  },
  {
    ...ORIGINAL, id: 'a-w1-4', groupId: 'a-w1', skill: 'writing', taskType: 'writing-1-component',
    prompt: '说话', component: { word: '说话', pinyin: 'shuōhuà', index: 0, shown: '兑' },
    correctAnswer: 'F',
    explanation: '说 (speak) has the speech radical 讠, like 话, 语, 请 and 谁.',
  },
  {
    ...ORIGINAL, id: 'a-w1-5', groupId: 'a-w1', skill: 'writing', taskType: 'writing-1-component',
    prompt: '汉语', component: { word: '汉语', pinyin: 'Hànyǔ', index: 0, shown: '又' },
    correctAnswer: 'E',
    explanation: '汉 has the water radical 氵 (from the Han River), like 河, 洗 and 没.',
  },

  // ---- Writing Part 2: write the character ----
  {
    ...ORIGINAL, id: 'a-w2-1', groupId: 'a-w2', skill: 'writing', taskType: 'writing-2-character',
    prompt: '我们（ ）校很大。', pinyin: 'Wǒmen (xué) xiào hěn dà.',
    correctAnswer: '学',
    explanation: '学校 (xuéxiào) means school. 学 also appears in 学习 and 学生.',
  },
  {
    ...ORIGINAL, id: 'a-w2-2', groupId: 'a-w2', skill: 'writing', taskType: 'writing-2-character',
    prompt: '今（ ）很冷。', pinyin: 'Jīn (tiān) hěn lěng.',
    correctAnswer: '天',
    explanation: '今天 (jīntiān) means today. 天 also appears in 明天, 昨天 and 天气.',
  },
  {
    ...ORIGINAL, id: 'a-w2-3', groupId: 'a-w2', skill: 'writing', taskType: 'writing-2-character',
    prompt: '我（ ）吃米饭。', pinyin: 'Wǒ (ài) chī mǐfàn.',
    correctAnswer: '爱',
    explanation: '爱 (ài): to love, or to really like doing something. 我爱吃… means "I love eating…".',
  },
  {
    ...ORIGINAL, id: 'a-w2-4', groupId: 'a-w2', skill: 'writing', taskType: 'writing-2-character',
    prompt: '你（ ）什么名字？', pinyin: 'Nǐ (jiào) shénme míngzi?',
    correctAnswer: '叫',
    explanation: '叫 (jiào): to be called. 你叫什么名字？ means "What is your name?". It has the mouth radical 口.',
  },
  {
    ...ORIGINAL, id: 'a-w2-5', groupId: 'a-w2', skill: 'writing', taskType: 'writing-2-character',
    prompt: '她是我（ ）姐。', pinyin: 'Tā shì wǒ (jiě) jie.',
    correctAnswer: '姐',
    explanation: '姐姐 (jiějie) means older sister. It has the woman radical 女, like 妈 and 妹.',
  },
];

export const SET_A: PracticeSet = { id: 'a', level: 2, title: 'Practice set A', groups, questions };
