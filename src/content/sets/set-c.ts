// ORIGINAL practice questions written for this app. NOT official HSK questions.
// Status: checked by the author (Claude) against the HSK 1–2 word list. Not yet reviewed by a native speaker.
import { inGroup, standardGroups, type PracticeSet } from '../types';

const groups = standardGroups('c', {
  r2: [
    { key: 'A', text: '能', pinyin: 'néng' },
    { key: 'B', text: '每', pinyin: 'měi' },
    { key: 'C', text: '但是', pinyin: 'dànshì' },
    { key: 'D', text: '怎么', pinyin: 'zěnme' },
    { key: 'E', text: '准备', pinyin: 'zhǔnbèi' },
    { key: 'F', text: '让', pinyin: 'ràng' },
  ],
  r3: [
    { key: 'A', text: '是的，她是我妹妹。', pinyin: 'Shì de, tā shì wǒ mèimei.' },
    { key: 'B', text: '我想喝茶。', pinyin: 'Wǒ xiǎng hē chá.' },
    { key: 'C', text: '没问题，我们一起去。', pinyin: 'Méi wèntí, wǒmen yìqǐ qù.' },
    { key: 'D', text: '我在家看书呢。', pinyin: 'Wǒ zài jiā kàn shū ne.' },
    { key: 'E', text: '下个月十号。', pinyin: 'Xià gè yuè shí hào.' },
    { key: 'F', text: '三本，都很好看。', pinyin: 'Sān běn, dōu hěn hǎokàn.' },
  ],
  w1: [
    { key: 'A', text: '氵' },
    { key: 'B', text: '口' },
    { key: 'C', text: '亻' },
    { key: 'D', text: '女' },
    { key: 'E', text: '木' },
    { key: 'F', text: '讠' },
  ],
});
const [r2, r3, r4, w1, w2] = groups;

const questions = [
  ...inGroup(r2, [
    {
      id: 'c-r2-1', prompt: '我（ ）天早上都喝一杯牛奶。', pinyin: 'Wǒ ( ) tiān zǎoshang dōu hē yì bēi niúnǎi.', correctAnswer: 'B',
      explanation: '每天…都… means "every day…": 每 before the time word, 都 before the verb.',
    },
    {
      id: 'c-r2-2', prompt: '这个字不好写，（ ）我会写。', pinyin: 'Zhège zì bù hǎo xiě, ( ) wǒ huì xiě.', correctAnswer: 'C',
      explanation: '但是 (but) introduces a contrast: "This character isn\'t easy to write, but I can write it."',
    },
    {
      id: 'c-r2-3', prompt: '你（ ）帮我开一下门吗？', pinyin: 'Nǐ ( ) bāng wǒ kāi yíxià mén ma?', correctAnswer: 'A',
      explanation: '你能…吗？ is a polite request: "Can you open the door for me?"',
    },
    {
      id: 'c-r2-4', prompt: '去火车站（ ）走？', pinyin: 'Qù huǒchēzhàn ( ) zǒu?', correctAnswer: 'D',
      explanation: '怎么走 asks for directions: "How do I get to the train station?"',
    },
    {
      id: 'c-r2-5', prompt: '妈妈（ ）我早点儿睡觉。', pinyin: 'Māma ( ) wǒ zǎo diǎnr shuìjiào.', correctAnswer: 'F',
      explanation: 'A 让 B + verb means "A tells or lets B do something": "Mum tells me to go to bed earlier."',
    },
  ]),
  ...inGroup(r3, [
    { id: 'c-r3-1', prompt: '你想喝点儿什么？', pinyin: 'Nǐ xiǎng hē diǎnr shénme?', correctAnswer: 'B', explanation: '"What would you like to drink?" The reply: "I\'d like tea."' },
    { id: 'c-r3-2', prompt: '你的生日是几月几号？', pinyin: 'Nǐ de shēngrì shì jǐ yuè jǐ hào?', correctAnswer: 'E', explanation: '几月几号 asks for a date. The reply gives one: the 10th of next month.' },
    { id: 'c-r3-3', prompt: '那个女孩儿是你的家人吗？', pinyin: 'Nàge nǚháir shì nǐ de jiārén ma?', correctAnswer: 'A', explanation: 'A yes/no question about family. The reply: "Yes, she\'s my younger sister."' },
    { id: 'c-r3-4', prompt: '你现在在做什么？', pinyin: 'Nǐ xiànzài zài zuò shénme?', correctAnswer: 'D', explanation: '在做什么 asks what you are doing right now. 在…呢 in the reply also marks an action in progress.' },
    { id: 'c-r3-5', prompt: '明天你能和我去医院吗？', pinyin: 'Míngtiān nǐ néng hé wǒ qù yīyuàn ma?', correctAnswer: 'C', explanation: 'A request to go together. 没问题 (no problem) agrees to it.' },
  ]),
  ...inGroup(r4, [
    {
      id: 'c-r4-1', prompt: '今天上午我去商店买了一些水果，还买了一些面包。',
      pinyin: 'Jīntiān shàngwǔ wǒ qù shāngdiàn mǎile yìxiē shuǐguǒ, hái mǎile yìxiē miànbāo.',
      question: '★ 他买了什么？',
      options: [
        { key: 'A', text: '衣服', pinyin: 'yīfu' },
        { key: 'B', text: '水果', pinyin: 'shuǐguǒ' },
        { key: 'C', text: '书', pinyin: 'shū' },
      ],
      correctAnswer: 'B',
      explanation: '买了一些水果: he bought some fruit (and some bread, which isn\'t an option).',
    },
    {
      id: 'c-r4-2', prompt: '我的中国朋友叫李明，他是我的同学，我们常常一起学习、一起吃饭。',
      pinyin: 'Wǒ de Zhōngguó péngyou jiào Lǐ Míng, tā shì wǒ de tóngxué, wǒmen chángcháng yìqǐ xuéxí, yìqǐ chīfàn.',
      question: '★ 李明是说话人的：',
      options: [
        { key: 'A', text: '老师', pinyin: 'lǎoshī' },
        { key: 'B', text: '哥哥', pinyin: 'gēge' },
        { key: 'C', text: '同学', pinyin: 'tóngxué' },
      ],
      correctAnswer: 'C',
      explanation: '他是我的同学: Li Ming is the speaker\'s classmate.',
    },
    {
      id: 'c-r4-3', prompt: '这个房间太小了，你们再找一个大一点儿的吧。',
      pinyin: 'Zhège fángjiān tài xiǎo le, nǐmen zài zhǎo yí gè dà yìdiǎnr de ba.',
      question: '★ 这个房间：',
      options: [
        { key: 'A', text: '很大', pinyin: 'hěn dà' },
        { key: 'B', text: '不大', pinyin: 'bú dà' },
        { key: 'C', text: '很贵', pinyin: 'hěn guì' },
      ],
      correctAnswer: 'B',
      explanation: '太小了 (too small), so 不大 is right. Price isn\'t mentioned.',
    },
    {
      id: 'c-r4-4', prompt: '我昨天晚上十二点睡觉，今天早上起晚了，没吃早饭就去上课了。',
      pinyin: 'Wǒ zuótiān wǎnshang shí\'èr diǎn shuìjiào, jīntiān zǎoshang qǐ wǎn le, méi chī zǎofàn jiù qù shàngkè le.',
      question: '★ 他今天早上：',
      options: [
        { key: 'A', text: '没吃早饭', pinyin: 'méi chī zǎofàn' },
        { key: 'B', text: '起得很早', pinyin: 'qǐ de hěn zǎo' },
        { key: 'C', text: '没去上课', pinyin: 'méi qù shàngkè' },
      ],
      correctAnswer: 'A',
      explanation: '没吃早饭就去上课了: he went to class without eating breakfast. He got up late (起晚了), and he did go to class.',
    },
    {
      id: 'c-r4-5', prompt: '你看，外面下雪了！我们出去玩儿吧！',
      pinyin: 'Nǐ kàn, wàimiàn xià xuě le! Wǒmen chūqù wánr ba!',
      question: '★ 现在：',
      options: [
        { key: 'A', text: '下雨了', pinyin: 'xià yǔ le' },
        { key: 'B', text: '下雪了', pinyin: 'xià xuě le' },
        { key: 'C', text: '天很热', pinyin: 'tiān hěn rè' },
      ],
      correctAnswer: 'B',
      explanation: '下雪了 means it is snowing. Don\'t confuse 雪 (xuě, snow) with 雨 (yǔ, rain): they share the 雨 top.',
    },
  ]),
  ...inGroup(w1, [
    { id: 'c-w1-1', prompt: '没有', component: { word: '没有', pinyin: 'méiyǒu', index: 0, shown: '殳' }, correctAnswer: 'A', explanation: '没 = 氵 (water) + 殳. The water radical has three dots.' },
    { id: 'c-w1-2', prompt: '他们', component: { word: '他们', pinyin: 'tāmen', index: 0, shown: '也' }, correctAnswer: 'C', explanation: '他 (he) = 亻 (person) + 也. Compare 她 (she) = 女 + 也.' },
    { id: 'c-w1-3', prompt: '叫车', component: { word: '叫车', pinyin: 'jiào chē', index: 0, shown: '丩' }, correctAnswer: 'B', explanation: '叫 (to call) has the mouth radical 口, because you use your mouth to call.' },
    { id: 'c-w1-4', prompt: '好的', component: { word: '好的', pinyin: 'hǎo de', index: 0, shown: '子' }, correctAnswer: 'D', explanation: '好 = 女 (woman) + 子 (child).' },
    { id: 'c-w1-5', prompt: '谢谢', component: { word: '谢谢', pinyin: 'xièxie', index: 0, shown: '射' }, correctAnswer: 'F', explanation: '谢 (to thank) = 讠 (speech) + 射. You thank someone with words.' },
  ]),
  ...inGroup(w2, [
    { id: 'c-w2-1', prompt: '我有（ ）个哥哥。', pinyin: 'Wǒ yǒu (liǎng) gè gēge.', correctAnswer: '两', explanation: 'Before a measure word, "two" is 两 (liǎng), not 二: 两个哥哥.' },
    { id: 'c-w2-2', prompt: '我（ ）你一起去。', pinyin: 'Wǒ (hé) nǐ yìqǐ qù.', correctAnswer: '和', explanation: 'A 和 B 一起 + verb means "A does something together with B".' },
    { id: 'c-w2-3', prompt: '现在几（ ）了？', pinyin: 'Xiànzài jǐ (diǎn) le?', correctAnswer: '点', explanation: '几点 asks "what time". 点 means o\'clock.' },
    { id: 'c-w2-4', prompt: '他是我的（ ）学。', pinyin: 'Tā shì wǒ de (tóng) xué.', correctAnswer: '同', explanation: '同学 (tóngxué) means classmate. 同 means "same".' },
    { id: 'c-w2-5', prompt: '我想（ ）一杯茶。', pinyin: 'Wǒ xiǎng (yào) yì bēi chá.', correctAnswer: '要', explanation: '要 (yào) here means "to want or order": "I\'d like a cup of tea."' },
  ]),
];

export const SET_C: PracticeSet = { id: 'c', title: 'Practice set C', groups, questions };
