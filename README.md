# PolyDictionary 📖

A modern, offline-first multilingual dictionary and language workstation built with React, TypeScript, Tailwind CSS, and client-side neural text-to-speech.

---

## ✨ Features

- **Massive Offline Lexicon (650,000+ Entries)**:
  - **English (Webster & WordNet)**: 208,000+ words combining modern WordNet definitions with historical Webster 1913 unabridged entries, partitioned into optimized JSON chunks.
  - **Japanese (EDICT2 / JMdict)**: 215,000+ entries with Kanji orthography, Furigana readings, Hepburn Romaji, part-of-speech tags, detailed definitions, and contextual examples.
  - **Chinese Simplified (CC-CEDICT)**: 121,000+ entries with Simplified/Traditional Hanzi, Pinyin with tone marks, part-of-speech tags, definitions, and example sentences.
  - **Korean (KENGDIC)**: 106,000+ entries with Hangul headwords, Revised Romanization, Hanja etymological roots, definitions, and example sentences.
- **Dual Text-to-Speech Engines**:
  - **Kokoro Neural AI TTS**: 82M-parameter StyleTTS2 model running client-side via ONNX Runtime WebAssembly (`wasm`) with studio-grade natural human cadence. Supports multiple curated American and British voices (Emma, Heart, Bella, Adam, Michael, George, etc.).
  - **Native Browser Speech**: Instant zero-download fallback via standard Web Speech API with support for English, Japanese, Chinese, and Korean.
- **Fast Unified Search & Autocomplete**:
  - Search by native script (e.g. `学校`, `中国`, `한국어`), romanization (e.g. `gakkou`, `xuexiao`, `hanguk`), or English keywords (e.g. `school`, `teacher`).
  - Real-time autocomplete suggestions with script and reading badges.
- **Dictionary Browser & Word of the Day**:
  - A–Z letter browser for English and character frequency navigators for CJK languages.
  - Daily featured word with pronunciation, historical etymology, and inspirational quotes.
- **Personalized Workspace**:
  - Persistent bookmarks and lookup history saved locally in your browser.
  - Configurable UI themes (Dark & Light) and customizable font sizing.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/polydictionary.git
   cd polydictionary
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 🛠️ Build & Scripts

- **`npm run dev`**: Start the Vite development server.
- **`npm run build`**: Create a production build in `dist/`.
- **`npm run preview`**: Preview the production build locally.
- **`npm run lint`**: Run TypeScript type-checking (`tsc --noEmit`).
- **`npm run build:cjk`**: Rebuild CJK dictionary datasets from raw upstream sources.

---

## 📁 Project Structure

```
polydictionary/
├── public/
│   └── dict/                     # Organized dictionary packages
│       ├── en/webster/           # English Webster chunks (a-z, other)
│       ├── ja/edict2/            # Japanese EDICT2 / JMdict
│       ├── ko/kengdic/           # Korean KENGDIC
│       └── zh/cc-cedict/         # Chinese CC-CEDICT
├── scripts/                      # Dictionary builders and test suites
│   ├── build_cjk_dictionaries.js # Upstream CJK data compiler
│   └── test_cjk_integration.js   # Multilingual integration tests
├── src/
│   ├── components/               # React UI views and modals
│   ├── data/                     # Metadata, language configs, exemplars
│   ├── services/
│   │   ├── corpusStorage.ts      # Dictionary loading & search engine
│   │   └── speechService.ts      # Kokoro & Native Speech synthesis
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx                   # Main workstation layout
│   └── main.tsx                  # React entry point
└── package.json
```

---

## 📄 License

This project is open source and available under the [Apache-2.0 License](LICENSE).
