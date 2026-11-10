import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DICT_DIR = path.resolve(__dirname, '../public/dict');

// Mock global fetch for local node environment so it reads from public/dict/*.json
global.fetch = async (url) => {
  const relPath = url.replace(/^\//, '');
  const filePath = path.resolve(__dirname, '..', 'public', relPath.replace(/^dict\//, 'dict/'));
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      ok: true,
      json: async () => JSON.parse(data),
      text: async () => data
    };
  }
  return {
    ok: false,
    statusText: 'Not Found'
  };
};

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};

async function runTests() {
  console.log('--- Testing CJK Integration ---');
  const { 
    lookupWordUnified, 
    getStructuredWordSuggestions, 
    getCorpusPackages,
    installCorpusPackage,
    uninstallCorpusPackage
  } = await import('../src/services/corpusStorage.ts');
  const bundledEntries = [];

  // Test 1: Check Corpus Packages
  console.log('\n[Test 1] Checking Corpus Packages metadata:');
  const packages = getCorpusPackages();
  for (const pkg of packages) {
    console.log(`- ${pkg.name} (${pkg.language}): ${pkg.entryCount.toLocaleString()} entries, ${pkg.sizeFormatted}`);
  }

  const jaPkg = packages.find(p => p.id === 'lang-ja');
  const zhPkg = packages.find(p => p.id === 'lang-zh');
  const koPkg = packages.find(p => p.id === 'lang-ko');

  if (jaPkg.entryCount < 200000) throw new Error('Japanese entry count too low: ' + jaPkg.entryCount);
  if (zhPkg.entryCount < 100000) throw new Error('Chinese entry count too low: ' + zhPkg.entryCount);
  if (koPkg.entryCount < 100000) throw new Error('Korean entry count too low: ' + koPkg.entryCount);
  console.log('✓ Test 1 Passed: All 3 CJK packages have 100k+ entries!');

  // Test 2: Japanese Lookups
  console.log('\n[Test 2] Japanese lookups:');
  const jaWords = ['日本', '学校', '先生', 'gakkou', 'sensei', 'school', 'teacher'];
  for (const q of jaWords) {
    const res = await lookupWordUnified(q, 'ja', bundledEntries);
    if (!res) throw new Error(`Japanese lookup failed for '${q}'`);
    console.log(`✓ '${q}' -> ${res.word} (${res.reading} / ${res.romanization}): ${res.meanings[0].definitions[0]}`);
  }

  // Test 3: Chinese Lookups
  console.log('\n[Test 3] Chinese lookups:');
  const zhWords = ['中国', '学校', '老师', 'xuexiao', 'laoshi', 'china', 'school'];
  for (const q of zhWords) {
    const res = await lookupWordUnified(q, 'zh', bundledEntries);
    if (!res) throw new Error(`Chinese lookup failed for '${q}'`);
    console.log(`✓ '${q}' -> ${res.word} (${res.reading} / ${res.romanization}): ${res.meanings[0].definitions[0]}`);
  }

  // Test 4: Korean Lookups
  console.log('\n[Test 4] Korean lookups:');
  const koWords = ['한국', '학교', '선생님', 'hakgyo', 'seonsaengnim', 'korea', 'teacher'];
  for (const q of koWords) {
    const res = await lookupWordUnified(q, 'ko', bundledEntries);
    if (!res) throw new Error(`Korean lookup failed for '${q}'`);
    console.log(`✓ '${q}' -> ${res.word} (${res.reading} / ${res.romanization}): ${res.meanings[0].definitions[0]}`);
  }

  // Test 5: Autocomplete Suggestions
  console.log('\n[Test 5] Autocomplete Suggestions:');
  const jaSugg = await getStructuredWordSuggestions('gak', 'ja', bundledEntries);
  console.log('JA prefix "gak":', jaSugg.map(s => `${s.word} (${s.reading})`).slice(0, 3));
  if (jaSugg.length === 0) throw new Error('No Japanese suggestions for "gak"');

  const zhSugg = await getStructuredWordSuggestions('xue', 'zh', bundledEntries);
  console.log('ZH prefix "xue":', zhSugg.map(s => `${s.word} (${s.reading})`).slice(0, 3));
  if (zhSugg.length === 0) throw new Error('No Chinese suggestions for "xue"');

  const koSugg = await getStructuredWordSuggestions('hak', 'ko', bundledEntries);
  console.log('KO prefix "hak":', koSugg.map(s => `${s.word} (${s.reading})`).slice(0, 3));
  if (koSugg.length === 0) throw new Error('No Korean suggestions for "hak"');

  // Test 6: Package installation & uninstallation
  console.log('\n[Test 6] Package installation lifecycle:');
  const uninstalled = uninstallCorpusPackage('lang-ko');
  console.log('Uninstalled Korean:', uninstalled);
  const koAfterUninstall = await lookupWordUnified('학교', 'ko', bundledEntries);
  console.log('Lookup after uninstall:', koAfterUninstall ? 'Found' : 'Not Found (expected)');
  if (koAfterUninstall) throw new Error('Korean word should not be found when uninstalled!');

  const installRes = await installCorpusPackage('lang-ko');
  console.log(`Re-installed Korean: ${installRes.entriesAdded.toLocaleString()} entries added`);
  const koAfterReinstall = await lookupWordUnified('학교', 'ko', bundledEntries);
  if (!koAfterReinstall) throw new Error('Korean word should be found after re-install!');
  console.log(`Lookup after reinstall: Found '${koAfterReinstall.word}'!`);

  console.log('\n========================================');
  console.log('ALL INTEGRATION TESTS PASSED CLEANLY! ✨');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
