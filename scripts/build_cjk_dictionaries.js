import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DICT_DIR = path.resolve(__dirname, '../public/dict');

if (!fs.existsSync(PUBLIC_DICT_DIR)) {
  fs.mkdirSync(PUBLIC_DICT_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Helper: Pinyin number to diacritics
// -------------------------------------------------------------
function pinyinNumberToDiacritics(pinyin) {
  const vowels = {
    a: ['ā', 'á', 'ǎ', 'à', 'a'],
    e: ['ē', 'é', 'ě', 'è', 'e'],
    i: ['ī', 'í', 'ǐ', 'ì', 'i'],
    o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
    u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
    v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
  };

  return pinyin.split(' ').map(word => {
    const toneMatch = word.match(/([1-5])$/);
    if (!toneMatch) return word;
    const tone = parseInt(toneMatch[1], 10) - 1;
    let cleanWord = word.slice(0, -1);
    if (tone === 4) return cleanWord; // neutral tone

    let targetVowel = '';
    const lower = cleanWord.toLowerCase();
    if (lower.includes('a')) targetVowel = 'a';
    else if (lower.includes('e')) targetVowel = 'e';
    else if (lower.includes('ou')) targetVowel = 'o';
    else {
      for (let i = lower.length - 1; i >= 0; i--) {
        if ('aeiouüv'.includes(lower[i])) {
          targetVowel = lower[i];
          break;
        }
      }
    }

    if (targetVowel && vowels[targetVowel]) {
      const idx = lower.indexOf(targetVowel);
      const isUpper = cleanWord[idx] === cleanWord[idx].toUpperCase();
      const rep = vowels[targetVowel][tone];
      cleanWord = cleanWord.slice(0, idx) + (isUpper ? rep.toUpperCase() : rep) + cleanWord.slice(idx + 1);
    }
    return cleanWord;
  }).join(' ');
}

// -------------------------------------------------------------
// Helper: Kana to Hepburn Romaji
// -------------------------------------------------------------
const KANA_MAP = {
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'キャ':'kya','キュ':'kyu','キョ':'kyo','シャ':'sha','シュ':'shu','ショ':'sho',
  'チャ':'cha','チュ':'chu','チョ':'cho','ニャ':'nya','ニュ':'nyu','ニョ':'nyo',
  'ヒャ':'hya','ヒュ':'hyu','ヒョ':'hyo','ミャ':'mya','ミュ':'myu','ミョ':'myo',
  'リャ':'rya','リュ':'ryu','リョ':'ryo','ギャ':'gya','ギュ':'gyu','ギョ':'gyo',
  'ジャ':'ja','ジュ':'ju','ジョ':'jo','ビャ':'bya','ビュ':'byu','ビョ':'byo',
  'ピャ':'pya','ピュ':'pyu','ピョ':'pyo',
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
  'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
  'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
  'ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
  'ワ':'wa','ヲ':'wo','ン':'n',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ぼ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po'
};

function kanaToRomaji(kana) {
  let res = '';
  let i = 0;
  while (i < kana.length) {
    if (kana[i] === 'っ' || kana[i] === 'ッ') {
      const next = kanaToRomaji(kana.slice(i + 1, i + 3));
      if (next && next[0]) res += next[0];
      i++;
      continue;
    }
    if (kana[i] === 'ー') {
      if (res.length > 0) {
        const lastVowel = res[res.length - 1];
        if ('aeiou'.includes(lastVowel)) {
          res += lastVowel;
        }
      }
      i++;
      continue;
    }
    const pair = kana.slice(i, i + 2);
    if (KANA_MAP[pair]) {
      res += KANA_MAP[pair];
      i += 2;
      continue;
    }
    if (KANA_MAP[kana[i]]) {
      res += KANA_MAP[kana[i]];
    } else {
      res += kana[i];
    }
    i++;
  }
  return res;
}

// -------------------------------------------------------------
// Helper: Hangul to Revised Romanization
// -------------------------------------------------------------
const CHO = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const JONG = ['','k','k','k','n','n','n','t','l','k','m','p','l','t','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];

function hangulToRomaja(hangul) {
  let res = '';
  for (let i = 0; i < hangul.length; i++) {
    const code = hangul.charCodeAt(i);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syl = code - 0xAC00;
      const choIdx = Math.floor(syl / (21 * 28));
      const jungIdx = Math.floor((syl % (21 * 28)) / 28);
      const jongIdx = syl % 28;
      let cho = CHO[choIdx];
      res += cho + JUNG[jungIdx] + JONG[jongIdx];
    } else if (hangul[i] === ' ') {
      res += ' ';
    }
  }
  return res.trim();
}

// -------------------------------------------------------------
// Build Chinese Dictionary (CC-CEDICT)
// -------------------------------------------------------------
async function buildChinese() {
  console.log('Downloading CC-CEDICT from MDBG...');
  const res = await fetch('https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!res.ok) throw new Error(`Failed to fetch CC-CEDICT: ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const unzipped = zlib.gunzipSync(buf).toString('utf8');
  const lines = unzipped.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));

  const zhMap = new Map();

  for (const line of lines) {
    const m = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/);
    if (!m) continue;
    const trad = m[1];
    const simp = m[2];
    const pinyinRaw = m[3];
    const glossRaw = m[4];

    const isProper = /^[A-Z]/.test(pinyinRaw) || glossRaw.includes('surname ');
    const reading = pinyinNumberToDiacritics(pinyinRaw);
    const romanization = pinyinRaw.toLowerCase().replace(/[^a-z]/g, '');
    const glosses = glossRaw
      .split('/')
      .filter(Boolean)
      .map(g => g.trim())
      .filter(g => g.length > 0 && !g.startsWith('CL:') && !g.startsWith('also written '))
      .slice(0, 4);

    if (glosses.length === 0) continue;

    let pos = 'noun';
    const firstGloss = glosses[0].toLowerCase();
    if (firstGloss.startsWith('to ')) pos = 'verb';
    else if (firstGloss.includes('(adjective)') || firstGloss.endsWith('able') || firstGloss.endsWith('ous')) pos = 'adjective';
    else if (firstGloss.startsWith('classifier for') || firstGloss.startsWith('measure word for')) pos = 'noun';

    const item = {
      w: simp,
      r: reading,
      m: romanization,
      pos,
      d: glosses,
      t: trad !== simp ? trad : undefined,
      isProper
    };

    if (!zhMap.has(simp)) {
      zhMap.set(simp, item);
    } else {
      const existing = zhMap.get(simp);
      if (existing.isProper && !isProper) {
        // Prefer common regular meaning over surname / proper noun
        item.d = [...item.d, ...existing.d.filter(d => !item.d.includes(d))].slice(0, 4);
        zhMap.set(simp, item);
      } else {
        // Merge extra definitions
        for (const g of glosses) {
          if (existing.d.length < 4 && !existing.d.includes(g)) {
            existing.d.push(g);
          }
        }
      }
    }
  }

  const zhEntries = Array.from(zhMap.values());
  zhEntries.sort((a, b) => {
    const aProper = a.isProper ? 1 : 0;
    const bProper = b.isProper ? 1 : 0;
    if (aProper !== bProper) return aProper - bProper;
    return a.w.length - b.w.length;
  });
  const finalZh = zhEntries.map(({ isProper, ...rest }) => rest);

  const outPath = path.join(PUBLIC_DICT_DIR, 'zh', 'cc-cedict', 'cc-cedict.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(finalZh));
  const stat = fs.statSync(outPath);
  console.log(`✓ Chinese dictionary built: ${finalZh.length} entries, ${(stat.size / 1024 / 1024).toFixed(2)} MB -> ${outPath}`);
  return { count: finalZh.length, sizeMB: (stat.size / 1024 / 1024).toFixed(1) };
}

// -------------------------------------------------------------
// Build Korean Dictionary (KENGDIC)
// -------------------------------------------------------------
async function buildKorean() {
  console.log('Downloading KENGDIC from GitHub...');
  const res = await fetch('https://raw.githubusercontent.com/garfieldnate/kengdic/master/kengdic.tsv');
  if (!res.ok) throw new Error(`Failed to fetch KENGDIC: ${res.statusText}`);
  const text = await res.text();
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  const koMap = new Map();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    const surface = parts[1] ? parts[1].trim() : '';
    const hanja = parts[2] ? parts[2].trim() : '';
    const gloss = parts[3] ? parts[3].trim() : '';
    if (!surface || !gloss) continue;

    const cleanGloss = gloss.replace(/^[0-9]+\.\s*/, '').trim();
    if (!koMap.has(surface)) {
      koMap.set(surface, { h: hanja, d: [cleanGloss] });
    } else {
      const item = koMap.get(surface);
      if (item.d.length < 3 && !item.d.includes(cleanGloss)) {
        item.d.push(cleanGloss);
      }
      if (!item.h && hanja) {
        item.h = hanja;
      }
    }
  }

  const koEntries = [];
  for (const [w, val] of koMap.entries()) {
    const romanization = hangulToRomaja(w);
    let pos = 'noun';
    const firstGloss = val.d[0].toLowerCase();
    if (firstGloss.startsWith('to ') || w.endsWith('하다') || w.endsWith('되다')) pos = 'verb';
    else if (w.endsWith('스럽다') || w.endsWith('롭다')) pos = 'adjective';

    const isHangulHead = /^[가-힣]/.test(w);
    koEntries.push({
      w,
      r: w,
      m: romanization,
      pos,
      d: val.d,
      h: val.h || undefined,
      isHangulHead
    });
  }

  koEntries.sort((a, b) => {
    if (b.isHangulHead !== a.isHangulHead) return (b.isHangulHead ? 1 : 0) - (a.isHangulHead ? 1 : 0);
    return a.w.length - b.w.length;
  });
  const finalKo = koEntries.map(({ isHangulHead, ...rest }) => rest);

  const outPath = path.join(PUBLIC_DICT_DIR, 'ko', 'kengdic', 'kengdic.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(finalKo));
  const stat = fs.statSync(outPath);
  console.log(`✓ Korean dictionary built: ${finalKo.length} entries, ${(stat.size / 1024 / 1024).toFixed(2)} MB -> ${outPath}`);
  return { count: finalKo.length, sizeMB: (stat.size / 1024 / 1024).toFixed(1) };
}

// -------------------------------------------------------------
// Build Japanese Dictionary (EDICT2)
// -------------------------------------------------------------
async function buildJapanese() {
  console.log('Downloading EDICT2 from EDRDG...');
  const res = await fetch('http://ftp.edrdg.org/pub/Nihongo/edict2.gz');
  if (!res.ok) throw new Error(`Failed to fetch EDICT2: ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const unzipped = zlib.gunzipSync(buf);
  const decoder = new TextDecoder('euc-jp');
  const str = decoder.decode(unzipped);
  const lines = str.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#'));

  const jaMap = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const slashIdx = line.indexOf(' /');
    if (slashIdx === -1) continue;
    const head = line.slice(0, slashIdx).trim();
    const glossPart = line.slice(slashIdx + 2).trim();

    let word = head;
    let reading = '';
    const bOpen = head.indexOf('[');
    const bClose = head.indexOf(']');
    if (bOpen !== -1 && bClose !== -1) {
      word = head.slice(0, bOpen).trim();
      reading = head.slice(bOpen + 1, bClose).trim();
    }
    const cleanWord = word.split(';')[0].replace(/\([^)]*\)/g, '').trim();
    const cleanReading = (reading ? reading.split(';')[0] : cleanWord).replace(/\([^)]*\)/g, '').trim();

    const isPriority = line.includes('(P)') || line.includes('/(P)/') || line.includes(';P;');

    if (!cleanWord || !cleanReading) continue;

    let pos = 'noun';
    const posMatch = glossPart.match(/^\(([^)]+)\)/);
    if (posMatch) {
      const rawPos = posMatch[1];
      if (rawPos.includes('v1') || rawPos.includes('v5') || rawPos.includes('vs') || rawPos.includes('vt') || rawPos.includes('vi')) pos = 'verb';
      else if (rawPos.includes('adj')) pos = 'adjective';
      else if (rawPos.includes('adv')) pos = 'adverb';
      else if (rawPos.includes('int')) pos = 'interjection';
      else if (rawPos.includes('prt')) pos = 'particle';
    }

    const rawGlosses = glossPart.split('/').filter(g => g && !g.startsWith('EntL') && g !== '(P)');
    const defs = [];
    for (const g of rawGlosses) {
      const cleaned = g.replace(/^\([^)]+\)\s*/, '').replace(/^\(\d+\)\s*/, '').trim();
      if (cleaned && cleaned !== '(P)' && !cleaned.startsWith('See ')) {
        defs.push(cleaned);
      }
    }
    if (defs.length === 0) continue;

    const item = {
      r: cleanReading,
      pos,
      d: defs.slice(0, 3),
      isPriority
    };

    if (!jaMap.has(cleanWord)) {
      jaMap.set(cleanWord, item);
    } else {
      const existing = jaMap.get(cleanWord);
      if (!existing.isPriority && isPriority) {
        // Priority standard reading takes precedence
        item.d = [...item.d, ...existing.d.filter(d => !item.d.includes(d))].slice(0, 4);
        jaMap.set(cleanWord, item);
      } else {
        for (const d of defs) {
          if (existing.d.length < 4 && !existing.d.includes(d)) {
            existing.d.push(d);
          }
        }
      }
    }
  }

  const jaEntries = [];
  for (const [w, val] of jaMap.entries()) {
    const romanization = kanaToRomaji(val.r);
    jaEntries.push({
      w,
      r: val.r,
      m: romanization,
      pos: val.pos,
      d: val.d,
      isPriority: val.isPriority
    });
  }

  // Sort priority words first, then shorter common words
  jaEntries.sort((a, b) => {
    const aP = a.isPriority ? 1 : 0;
    const bP = b.isPriority ? 1 : 0;
    if (aP !== bP) return bP - aP;
    return a.w.length - b.w.length;
  });
  const finalJa = jaEntries.map(({ isPriority, ...rest }) => rest);

  const outPath = path.join(PUBLIC_DICT_DIR, 'ja', 'edict2', 'edict2.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(finalJa));
  const stat = fs.statSync(outPath);
  console.log(`✓ Japanese dictionary built: ${finalJa.length} entries, ${(stat.size / 1024 / 1024).toFixed(2)} MB -> ${outPath}`);
  return { count: finalJa.length, sizeMB: (stat.size / 1024 / 1024).toFixed(1) };
}

async function main() {
  console.log('Starting CJK dictionary build...');
  const zh = await buildChinese();
  const ko = await buildKorean();
  const ja = await buildJapanese();

  console.log('\n=== BUILD SUMMARY ===');
  console.log(`Japanese: ${ja.count} entries (${ja.sizeMB} MB)`);
  console.log(`Chinese:  ${zh.count} entries (${zh.sizeMB} MB)`);
  console.log(`Korean:   ${ko.count} entries (${ko.sizeMB} MB)`);
  console.log(`Total CJK entries: ${ja.count + zh.count + ko.count}`);
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
