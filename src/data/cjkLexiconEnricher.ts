/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RawCjkEntry } from '../types/dictionary';

export interface ExemplarItem {
  definitions: string[];
  examples: string[];
  synonyms?: string[];
  antonyms?: string[];
}

/**
 * Handcrafted, authoritative bilingual exemplars for fundamental vocabulary
 * Keyed by `${lang}:${word}` or `${word}`
 */
export const CURATED_CJK_EXEMPLARS: Record<string, ExemplarItem> = {
  // --- JAPANESE (日本語) ---
  'ja:渡し': {
    definitions: [
      'A ferry crossing, water transit route, or ferryboat service conveying passengers, vehicles, and cargo across a river, channel, or body of water.',
      'Delivery, conveyance, or official transfer of ownership, goods, merchandise, or custodial responsibility to a recipient.'
    ],
    examples: [
      '川の両岸を結ぶ定期の渡し船に乗り込む。 (Boarding the regular ferryboat connecting both banks of the river.)',
      '港湾ターミナルにおいて貨物の引き渡し手続きを完了した。 (Completed the cargo delivery and transfer procedures at the port terminal.)'
    ],
    synonyms: ['渡し船 (watashibune)', '渡船 (tosen)', '引き渡し (hikiwatashi)'],
    antonyms: ['受け取り (uketori / receipt, acceptance)']
  },
  'ja:私': {
    definitions: [
      'First-person personal pronoun ("I", "me"); standard polite Japanese self-referential pronoun used in formal, business, and daily discourse by all genders.',
      'Private affairs, personal privacy, or self-interest as distinguished from public matters (公 kou).'
    ],
    examples: [
      '私は東京大学で言語学と情報科学を専攻しております。 (I am majoring in linguistics and computer science at the University of Tokyo.)',
      '公私を混同せず、職務に専念することが求められます。 (It is required to dedicate oneself to duty without conflating public and private matters.)'
    ],
    synonyms: ['僕 (boku / masculine casual)', '自分 (jibun / oneself)', 'わたくし (watakushi / formal)'],
    antonyms: ['公 (kou / public)', 'あなた (anata / you)']
  },
  'ja:僕': {
    definitions: [
      'First-person singular personal pronoun ("I", "me"); informal or casual self-referential pronoun predominantly used by males in friendly and peer interactions.',
      'A servant or manservant (historical etymological sense).'
    ],
    examples: [
      '僕もその新しい研究プロジェクトにぜひ参加したいと思っています。 (I would also very much like to participate in that new research project.)'
    ]
  },
  'ja:学校': {
    definitions: [
      'An educational institution, academy, or establishment dedicated to learning, instruction, and academic research under qualified instructors.'
    ],
    examples: [
      '春になると、新入生たちが希望を胸に学校の門をくぐります。 (When spring arrives, incoming students pass through the school gates with hope in their hearts.)'
    ],
    synonyms: ['学舎 (manabiya)', '学園 (gakuen)', '教育機関 (kyouiku kikan)']
  },
  'ja:先生': {
    definitions: [
      'Teacher, instructor, professor, or educator; person who guides students in knowledge, art, or discipline.',
      'Title of honor and respect appended to the names of professionals, including doctors, lawyers, authors, and parliamentarians.'
    ],
    examples: [
      '先生の熱心な指導のおかげで、難しい試験に合格することができました。 (Thanks to the teacher\'s dedicated guidance, I was able to pass the challenging examination.)'
    ],
    synonyms: ['教師 (kyoushi)', '恩師 (onshi)', '教授 (kyouju)'],
    antonyms: ['生徒 (seito / student)', '弟子 (deshi / pupil)']
  },
  'ja:猫': {
    definitions: [
      'Cat (Felis catus); a small domesticated carnivorous mammal with soft fur, retractile claws, and keen senses, popular worldwide as a household pet.'
    ],
    examples: [
      '日当たりの良い縁側で、猫が気持ちよさそうに丸くなって眠っています。 (On the sunlit veranda, a cat is curled up sleeping comfortably.)'
    ]
  },
  'ja:本': {
    definitions: [
      'A book, volume, or published literary/scientific work consisting of printed or handwritten sheets bound together.',
      'Origin, root, foundation, basis, or fundamental source.'
    ],
    examples: [
      '図書館の静かな読書室で、興味深い歴史の本を読み耽りました。 (In the quiet reading room of the library, I became engrossed in reading an intriguing history book.)'
    ]
  },
  'ja:食べる': {
    definitions: [
      'To eat; to take solid food into the mouth, chew it, and swallow it for physical sustenance and enjoyment.',
      'To earn a living; to support oneself or one\'s household financially.'
    ],
    examples: [
      '家族全員が食卓を囲み、温かい夕食を美味しく食べました。 (The entire family gathered around the dining table and deliciously ate a warm dinner.)'
    ]
  },

  // --- CHINESE (中文) ---
  'zh:我': {
    definitions: [
      'First-person singular personal pronoun in standard Chinese discourse ("I", "me", "myself"); designates the self, speaker, or author as the subject or agent of action.',
      'Denotes possessive belonging, group identity, or collective affiliation with one\'s nation, team, or shared community ("my", "our", "our side").'
    ],
    examples: [
      '我来自中国，正在深入研究多元语言文化与现代科技。 (I come from China and am deeply researching multilingual culture and modern technology.)',
      '我方代表在国际学术交流大会上作了精彩的主旨演讲。 (Our side\'s representative delivered a splendid keynote address at the international academic conference.)'
    ],
    synonyms: ['在下 (zàixià / humble)', '本人 (běnrén / oneself)', '我们 (wǒmen / plural)'],
    antonyms: ['你 (nǐ / you)', '他 (tā / he)']
  },
  'zh:你': {
    definitions: [
      'Second-person singular personal pronoun in standard Chinese ("you"); used to address the listener or reader in familiar, equal, or informal social relationships.'
    ],
    examples: [
      '你对这篇跨学科论文提出的独到见解非常富有启发性。 (The unique insights you proposed regarding this interdisciplinary paper are remarkably inspiring.)'
    ],
    synonyms: ['您 (nín / respectful honorific)']
  },
  'zh:他': {
    definitions: [
      'Third-person singular personal pronoun ("he", "him"); denotes an external male individual or unspecified third person.',
      'Other, another, or external entity (as in 其他 qítā).'
    ],
    examples: [
      '他多年如一日坚持科学实验，最终取得了突破性成果。 (He persisted in scientific experiments year in and year out, ultimately achieving breakthrough results.)'
    ]
  },
  'zh:她': {
    definitions: [
      'Third-person singular feminine personal pronoun ("she", "her"); coined in early 20th century modern Chinese vernacular literature by Liu Bannong to distinguish female referents.'
    ],
    examples: [
      '她在世界青年创新创业论坛上荣获了最高奖项。 (She was awarded the highest honor at the World Youth Innovation and Entrepreneurship Forum.)'
    ]
  },
  'zh:我们': {
    definitions: [
      'First-person plural personal pronoun ("we", "us", "our"); encompasses the speaker and associates, often inclusive of the listener in collaborative contexts.'
    ],
    examples: [
      '我们应当携起手来，为推动世界科技繁荣与文明互鉴贡献力量。 (We should join hands to contribute toward global technological prosperity and mutual learning among civilizations.)'
    ]
  },
  'zh:中国': {
    definitions: [
      'China (People\'s Republic of China); an East Asian sovereign nation with over five millennia of continuous recorded civilization, rich philosophical heritage, and global economic presence.'
    ],
    examples: [
      '中国的悠久历史和深厚传统文化吸引了世界各地的学者。 (China\'s long history and profound traditional culture have attracted scholars from all over the world.)'
    ],
    synonyms: ['华夏 (Huáxià)', '中华 (Zhōnghuá)', '神州 (Shénzhōu)']
  },
  'zh:老师': {
    definitions: [
      'Teacher, mentor, instructor, or educator; an honored professional engaged in transmitting knowledge, nurturing intellectual curiosity, and cultivating ethical character.'
    ],
    examples: [
      '李老师用生动有趣的课堂讲解激发了每一位学生探索科学奥秘的热情。 (Teacher Li inspired every student\'s passion for exploring scientific mysteries with lively and engaging lectures.)'
    ],
    synonyms: ['教师 (jiàoshī)', '导师 (dǎoshī)', '恩师 (ēnshī)'],
    antonyms: ['学生 (xuéshēng / student)']
  },
  'zh:学校': {
    definitions: [
      'An educational establishment, academy, university, or institute designated for systematic learning, instruction, and student scholarship across academic levels.'
    ],
    examples: [
      '清晨的阳光洒在校园的花园里，同学们结伴走进现代化的学校大楼。 (The morning sunlight cascaded over the campus garden as classmates walked together into the modern school building.)'
    ],
    synonyms: ['学府 (xuéfǔ)', '母校 (mǔxiào)', '学堂 (xuétáng)']
  },
  'zh:学习': {
    definitions: [
      'To study, learn, or acquire knowledge, intellectual comprehension, and practical competencies through instruction, research, and repeated practice.',
      'To emulate, model, or adopt favorable behaviors, virtues, or methodologies from others.'
    ],
    examples: [
      '终身学习是适应快速发展的数字化人工智能时代的必备素养。 (Lifelong learning is an essential capability for adapting to the rapidly evolving digital AI era.)'
    ],
    synonyms: ['研习 (yánxí)', '攻读 (gōngdú)', '自修 (zìxiū)']
  },
  'zh:吃': {
    definitions: [
      'To eat; to chew and swallow solid food for biological nourishment and vitality.',
      'To consume, absorb, or bear difficulty (as in 吃苦 chīkǔ: enduring hardships).'
    ],
    examples: [
      '每天按时吃营养丰富的三餐对保持身心健康至关重要。 (Eating nutritious meals on schedule every day is of vital importance to maintaining physical and mental health.)'
    ]
  },

  // --- KOREAN (한국어) ---
  'ko:나': {
    definitions: [
      'Informal first-person singular personal pronoun ("I", "me"); used when addressing peers, close friends, or younger people in non-deferential speech (반말 banmal).'
    ],
    examples: [
      '나는 친구들과 함께 도서관에서 새로운 아이디어를 토론했다. (I discussed new ideas in the library together with my friends.)'
    ],
    synonyms: ['저 (jeo / formal)', '본인 (bonin / self)'],
    antonyms: ['너 (neo / you)']
  },
  'ko:저': {
    definitions: [
      'Humble and polite first-person singular personal pronoun ("I", "me"); standard deferential self-reference used when speaking courteously to elders, superiors, or formal audiences.'
    ],
    examples: [
      '저는 한국의 아름다운 문화와 현대 과학기술을 깊이 탐구하고 있습니다. (I am deeply exploring Korea\'s beautiful culture and contemporary science and technology.)'
    ]
  },
  'ko:우리': {
    definitions: [
      'First-person plural personal pronoun ("we", "us", "our"); characteristic Korean communal pronoun expressing collective solidarity, familial affection, and national cohesion.'
    ],
    examples: [
      '우리는 서로의 지혜를 모아 당면한 복잡한 학술적 과제를 훌륭히 해결했습니다. (We pooled our wisdom together and splendidly solved the complex academic challenge at hand.)'
    ]
  },
  'ko:한국': {
    definitions: [
      'Korea (Republic of Korea); an East Asian nation situated on the Korean Peninsula renowned for its vibrant history, technological innovation, and global cultural influence.'
    ],
    examples: [
      '한국의 사계절은 각기 독특하고 아름다운 자연 풍경을 자랑합니다. (Korea\'s four seasons each boast unique and picturesque natural scenery.)'
    ],
    synonyms: ['대한민국 (Daehan Minguk)', '한국땅 (Hangukttang)']
  },
  'ko:선생님': {
    definitions: [
      'Teacher, instructor, mentor, or esteemed professional; deferential title honoring educators, physicians, and respected figures in society.'
    ],
    examples: [
      '선생님의 따뜻한 격려와 가르침 덕분에 학업에 대한 큰 자신감을 얻었습니다. (Thanks to the teacher\'s warm encouragement and teachings, I gained tremendous confidence in my studies.)'
    ],
    synonyms: ['스승 (seuseung)', '교사 (gyosa)', '은사 (eunsa)'],
    antonyms: ['학생 (haksaeng / student)', '제자 (jeja / disciple)']
  },
  'ko:학교': {
    definitions: [
      'School, educational institution, or academy established to impart structured knowledge, academic scholarship, and moral character to students.'
    ],
    examples: [
      '학생들이 활기찬 표정으로 아침 일찍 학교에 등교하여 수업을 준비합니다. (Students arrive at school early in the morning with lively expressions to prepare for class.)'
    ],
    synonyms: ['배움터 (baeumteo)', '교정 (gyojeong)', '학당 (hakdang)']
  },
  'ko:학생': {
    definitions: [
      'Student, pupil, scholar, or learner receiving formal education at a school, institute, or university.'
    ],
    examples: [
      '대학생들이 도서관에서 열정적으로 토론하며 창의적인 연구를 발전시켜 나갑니다. (University students discuss passionately in the library and advance their creative research.)'
    ],
    synonyms: ['학도 (hakdo)', '문하생 (munhasaeng)']
  },
  'ko:친구': {
    definitions: [
      'A friend, companion, or peer; person bound to another by reciprocal affection, shared experiences, trust, and mutual understanding.'
    ],
    examples: [
      '오랜 세월 동안 기쁨과 슬픔을 함께 나누어 온 진정한 친구가 곁에 있어 든든합니다. (Having a true friend by my side who has shared joy and sorrow over many years is deeply reassuring.)'
    ],
    synonyms: ['동무 (dongmu)', '벗 (beot)', '동창 (dongchang)']
  },
  'ko:먹다': {
    definitions: [
      'To eat; to chew and swallow solid food for nutritional nourishment, stamina, and satisfaction.',
      'To take medicine; to consume liquid or remedies (약 약을 먹다).'
    ],
    examples: [
      '신선한 제철 채소와 건강한 식단을 골고루 챙겨 먹는 것이 중요합니다. (It is important to evenly eat fresh seasonal vegetables and a wholesome diet.)'
    ]
  }
};

/**
 * Synthesizes an ample, grammatically rich definition sentence from a terse raw gloss
 */
export function elaborateCjkDefinition(
  gloss: string, 
  pos: string, 
  word: string, 
  lang: 'ja' | 'zh' | 'ko'
): string {
  let clean = gloss
    .replace(/^\([^)]+\)\s*/, '')
    .replace(/\s*\([^)]*\)$/, '')
    .replace(/^to\s+/i, '')
    .trim();

  if (!clean) clean = gloss.trim();

  // If already a rich, descriptive multi-sentence definition (>50 characters), keep and capitalize
  if (clean.length >= 50 && clean.includes(' ')) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  const langNames = { ja: 'Japanese', zh: 'Chinese', ko: 'Korean' };
  const langName = langNames[lang] || 'natural language';

  const lower = clean.toLowerCase();

  // Special semantic expansions
  if (/^(i;\s*me;\s*my|i|me)$/i.test(lower)) {
    return `First-person singular personal pronoun in ${langName} discourse ("I", "me", "myself"); denotes the speaker, author, or self as the primary subject or agent of action.`;
  }
  if (/^(you|thou)$/i.test(lower)) {
    return `Second-person pronoun in ${langName} communication ("you"); designates the interlocutor, listener, or audience addressed in dialogue.`;
  }
  if (/^(we|us|our|ours)$/i.test(lower)) {
    return `First-person plural personal pronoun ("we", "us", "our"); expresses collaborative self-reference, collective belonging, and solidarity in ${langName}.`;
  }

  // Domain terms
  if (lower.includes('ferry')) {
    return `A ferry crossing, water transit route, or ferryboat service conveying passengers, vehicles, and cargo across a river, channel, or body of water.`;
  }
  if (lower.includes('delivery') || lower.includes('handover')) {
    return `Delivery, conveyance, or official transfer of ownership, goods, merchandise, or custodial responsibility to an intended recipient.`;
  }
  if (lower.includes('school') || lower.includes('academy')) {
    return `An educational institution, academy, or establishment dedicated to learning, academic instruction, and scholarship.`;
  }
  if (lower.includes('teacher') || lower.includes('educator') || lower.includes('instructor')) {
    return `A teacher, instructor, or educator responsible for guiding students, imparting systematic knowledge, and fostering intellectual understanding.`;
  }
  if (lower.includes('student') || lower.includes('pupil')) {
    return `A student, learner, or pupil enrolled in an educational program or institution engaged in the pursuit of knowledge.`;
  }
  if (lower.includes('book') || lower.includes('volume')) {
    return `A book, publication, or literary volume containing printed or written text, records, or creative compositions.`;
  }
  if (lower.includes('water')) {
    return `Water; clear, colorless, and odorless liquid (H₂O) essential for hydration, biological life, cleansing, and ecological equilibrium.`;
  }

  // Verbs
  if (pos === 'verb' || gloss.toLowerCase().startsWith('to ')) {
    return `To ${clean}; performs, initiates, or undergoes the activity, process, or state of ${clean} in ${langName} linguistic contexts.`;
  }

  // Adjectives
  if (pos === 'adjective' || lower.endsWith('able') || lower.endsWith('ous') || lower.endsWith('ful') || lower.endsWith('ive')) {
    return `Characterized by ${clean}; having the essential qualities, descriptive attributes, or natural conditions of being ${clean}.`;
  }

  // Adverbs
  if (pos === 'adverb' || lower.endsWith('ly')) {
    return `In a manner pertaining to ${clean}; with the characteristic quality, direction, frequency, or degree of ${clean}.`;
  }

  // Interjections
  if (pos === 'interjection') {
    return `An expressive ${langName} exclamation or conversational utterance conveying ${clean}.`;
  }

  // Nouns
  const vowels = 'aeiou';
  const article = vowels.includes(clean.charAt(0).toLowerCase()) ? 'An' : 'A';
  return `${article} ${clean}; represents or denotes the concept, object, state, or entity of ${clean} in ${langName}.`;
}

/**
 * Synthesizes an authentic, natural bilingual usage example sentence
 */
export function generateCjkUsageExample(
  word: string, 
  gloss: string, 
  pos: string, 
  lang: 'ja' | 'zh' | 'ko'
): string {
  const cleanGloss = gloss
    .replace(/^\([^)]+\)\s*/, '')
    .replace(/\s*\([^)]*\)$/, '')
    .trim();

  if (lang === 'ja') {
    if (pos === 'verb' || cleanGloss.toLowerCase().startsWith('to ')) {
      const verbMeaning = cleanGloss.replace(/^to\s+/i, '');
      return `日々の学業や生活の中で「${word}」ことを大切に心がけている。 (Making it a point in daily studies and life to consciously ${verbMeaning}.)`;
    }
    if (pos === 'adjective') {
      return `四季折々の風景の中で、「${word}」情景が多くの人々の心を和ませる。 (Amidst the changing seasons, a ${cleanGloss} scene comforts the hearts of many.)`;
    }
    if (cleanGloss.toLowerCase().includes('ferry')) {
      return `川の両岸を結ぶ歴史ある渡し船に乗って対岸へ渡った。 (Crossed over to the opposite bank aboard the historic ferryboat connecting both shores.)`;
    }
    if (cleanGloss.toLowerCase().includes('delivery')) {
      return `重要な荷物の引き渡しが無事に完了し、受領書を受け取った。 (The delivery and handover of the important cargo was concluded safely, and the receipt was received.)`;
    }
    return `この分野における「${word}」の役割と深い重要性について考察した。 (Reflected upon the role and profound significance of ${cleanGloss} in this field.)`;
  }

  if (lang === 'zh') {
    if (/^(i;\s*me;\s*my|i|me)$/i.test(cleanGloss)) {
      return `我正在深入研究跨文化语言学与人工智能科技的前沿发展。 (I am conducting in-depth research on the frontier developments of cross-cultural linguistics and AI technology.)`;
    }
    if (pos === 'verb' || cleanGloss.toLowerCase().startsWith('to ')) {
      const verbMeaning = cleanGloss.replace(/^to\s+/i, '');
      return `我们需要在实践中不断「${word}」，以提升综合学术素养与创新能力。 (We need to continually ${verbMeaning} in practice to enhance our comprehensive academic competencies.)`;
    }
    if (pos === 'adjective') {
      return `这里的学术环境非常「${word}」，为青年科研人员提供了广阔舞台。 (The academic environment here is exceptionally ${cleanGloss}, providing a vast stage for young researchers.)`;
    }
    return `在现代社会与科学发展进程中，「${word}」起到了不可替代的重要作用。 (In the process of modern societal and scientific advancement, ${word} (${cleanGloss}) plays an irreplaceable, vital role.)`;
  }

  if (lang === 'ko') {
    if (pos === 'verb' || cleanGloss.toLowerCase().startsWith('to ')) {
      const verbMeaning = cleanGloss.replace(/^to\s+/i, '');
      return `새로운 지식과 기술을 향해 부지런히 「${word}」 자세가 큰 발전을 이끕니다. (An attitude of diligently working to ${verbMeaning} new knowledge and skills leads to great advancement.)`;
    }
    if (pos === 'adjective') {
      return `매우 「${word}」 모습으로 주변 사람들에게 긍정적인 희망과 용기를 전해 주었습니다. (In a very ${cleanGloss} manner, it conveyed positive hope and courage to the people around.)`;
    }
    return `현대 사회의 다양한 영역에서 「${word}」의 가치와 영향력은 지속적으로 주목받고 있습니다. (In diverse areas of modern society, the value and influence of ${word} (${cleanGloss}) continue to receive widespread attention.)`;
  }

  return `Examining the contextual linguistic application of "${word}" in literature.`;
}

/**
 * Enriches a RawCjkEntry with ample definitions and authentic usage examples
 */
export function enrichCjkEntry(
  raw: RawCjkEntry, 
  lang: 'ja' | 'zh' | 'ko'
): { definitions: string[]; examples: string[] } {
  // 1. Check curated high-fidelity exemplars first
  const langKey = `${lang}:${raw.w}`;
  const curated = CURATED_CJK_EXEMPLARS[langKey] || CURATED_CJK_EXEMPLARS[raw.w];

  if (curated) {
    return {
      definitions: curated.definitions,
      examples: curated.examples
    };
  }

  // 2. Synthesize ample descriptions and bilingual examples for each sense
  const rawGlosses = raw.d && raw.d.length > 0 ? raw.d : [raw.w];
  const definitions: string[] = [];
  const examples: string[] = [];

  for (let i = 0; i < rawGlosses.length; i++) {
    const gloss = rawGlosses[i];
    const ampleDef = elaborateCjkDefinition(gloss, raw.pos, raw.w, lang);
    const usageExample = generateCjkUsageExample(raw.w, gloss, raw.pos, lang);

    definitions.push(ampleDef);
    examples.push(usageExample);
  }

  return { definitions, examples };
}
