import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock global fetch for local node environment
global.fetch = async (url: string) => {
  const relPath = url.replace(/^\//, '');
  const filePath = path.resolve(__dirname, '..', 'public', relPath.replace(/^dict\//, 'dict/'));
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      ok: true,
      json: async () => JSON.parse(data),
      text: async () => data
    } as any;
  }
  return {
    ok: false,
    statusText: 'Not Found'
  } as any;
};

// Mock localStorage
const store: Record<string, string> = {};
global.localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; },
  length: 0,
  key: () => null
};

async function test() {
  const { lookupWordUnified } = await import('../src/services/corpusStorage.ts');

  console.log('--- Testing 渡し (Japanese) ---');
  const watashi = await lookupWordUnified('渡し', 'ja', []);
  console.log('Word:', watashi?.word);
  console.log('Reading:', watashi?.reading);
  console.log('Meanings count:', watashi?.meanings[0].definitions.length);
  watashi?.meanings[0].definitions.forEach((d, i) => {
    console.log(`\n  Def ${i + 1}: ${d}`);
    console.log(`  Ex  ${i + 1}: "${watashi?.meanings[0].examples[i]}"`);
  });

  console.log('\n--- Testing 我 (Chinese) ---');
  const wo = await lookupWordUnified('我', 'zh', []);
  console.log('Word:', wo?.word);
  console.log('Reading:', wo?.reading);
  console.log('Meanings count:', wo?.meanings[0].definitions.length);
  wo?.meanings[0].definitions.forEach((d, i) => {
    console.log(`\n  Def ${i + 1}: ${d}`);
    console.log(`  Ex  ${i + 1}: "${wo?.meanings[0].examples[i]}"`);
  });

  console.log('\n--- Testing 学校 (Korean) ---');
  const hakgyo = await lookupWordUnified('학교', 'ko', []);
  console.log('Word:', hakgyo?.word);
  console.log('Reading:', hakgyo?.reading);
  console.log('Meanings count:', hakgyo?.meanings[0].definitions.length);
  hakgyo?.meanings[0].definitions.forEach((d, i) => {
    console.log(`\n  Def ${i + 1}: ${d}`);
    console.log(`  Ex  ${i + 1}: "${hakgyo?.meanings[0].examples[i]}"`);
  });

  console.log('\n--- Testing mother (English) ---');
  const mother = await lookupWordUnified('mother', 'en', []);
  console.log('Word:', mother?.word);
  console.log('Meanings groups:', mother?.meanings.length);
  mother?.meanings.forEach(m => {
    console.log(`\n[${m.partOfSpeech.toUpperCase()}] (${m.definitions.length} defs, ${m.examples.filter(Boolean).length} examples)`);
    m.definitions.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d}`);
      if (m.examples[i]) {
        console.log(`     "${m.examples[i]}"`);
      }
    });
  });
}

test().catch(console.error);
