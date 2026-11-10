/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode } from '../types/dictionary';

export type TTSEngineType = 'kokoro' | 'native';

export type KokoroVoiceId =
  | 'af_heart'
  | 'af_bella'
  | 'af_nicole'
  | 'af_sky'
  | 'af_sarah'
  | 'am_michael'
  | 'am_adam'
  | 'am_echo'
  | 'am_fenrir'
  | 'bf_emma'
  | 'bf_isabella'
  | 'bf_alice'
  | 'bm_george'
  | 'bm_lewis'
  | 'bm_daniel'
  | 'bm_fable';

export interface KokoroVoiceOption {
  id: KokoroVoiceId;
  name: string;
  accent: 'US' | 'UK';
  gender: 'Female' | 'Male';
  description: string;
  recommended?: boolean;
}

export const KOKORO_VOICES: KokoroVoiceOption[] = [
  { id: 'af_heart', name: 'Heart', accent: 'US', gender: 'Female', description: 'Studio Grade A, natural & warm', recommended: true },
  { id: 'af_bella', name: 'Bella', accent: 'US', gender: 'Female', description: 'Grade A-, expressive & clear' },
  { id: 'af_nicole', name: 'Nicole', accent: 'US', gender: 'Female', description: 'Grade B-, energetic' },
  { id: 'af_sky', name: 'Sky', accent: 'US', gender: 'Female', description: 'Grade B, bright & crisp' },
  { id: 'af_sarah', name: 'Sarah', accent: 'US', gender: 'Female', description: 'Grade B, conversational' },
  { id: 'am_michael', name: 'Michael', accent: 'US', gender: 'Male', description: 'Grade B, natural baritone' },
  { id: 'am_adam', name: 'Adam', accent: 'US', gender: 'Male', description: 'Standard American male' },
  { id: 'am_echo', name: 'Echo', accent: 'US', gender: 'Male', description: 'Resonant & clear' },
  { id: 'am_fenrir', name: 'Fenrir', accent: 'US', gender: 'Male', description: 'Strong & articulate' },
  { id: 'bf_emma', name: 'Emma', accent: 'UK', gender: 'Female', description: 'Grade B-, British RP, clear', recommended: true },
  { id: 'bf_isabella', name: 'Isabella', accent: 'UK', gender: 'Female', description: 'Modern British female' },
  { id: 'bf_alice', name: 'Alice', accent: 'UK', gender: 'Female', description: 'Gentle British female' },
  { id: 'bm_george', name: 'George', accent: 'UK', gender: 'Male', description: 'Standard British male' },
  { id: 'bm_lewis', name: 'Lewis', accent: 'UK', gender: 'Male', description: 'Crisp British male' },
  { id: 'bm_daniel', name: 'Daniel', accent: 'UK', gender: 'Male', description: 'Warm British male' },
  { id: 'bm_fable', name: 'Fable', accent: 'UK', gender: 'Male', description: 'Articulate British male' },
];

export interface KokoroStatus {
  state: 'idle' | 'loading' | 'ready' | 'generating' | 'error';
  progress: number; // 0 to 100
  statusText: string;
  error?: string | null;
}

type StatusListener = (status: KokoroStatus) => void;

class SpeechService {
  // Native speech synthesis
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isNativeSupported: boolean = false;

  // Kokoro TTS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private kokoroInstance: any = null;
  private kokoroLoadingPromise: Promise<any> | null = null;
  private engine: TTSEngineType = 'kokoro';
  private kokoroVoice: KokoroVoiceId = 'af_heart';
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // key -> ObjectURL

  // Defaults
  private defaultRate: number = 1.0;
  private defaultAccent: 'US' | 'UK' = 'US';

  // Status tracking
  private kokoroStatus: KokoroStatus = {
    state: 'idle',
    progress: 0,
    statusText: 'Neural engine ready to initialize',
    error: null,
  };
  private statusListeners = new Set<StatusListener>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isNativeSupported = true;
      this.loadNativeVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadNativeVoices();
      }
    }

    // Load saved settings if any
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedEngine = localStorage.getItem('polydict_tts_engine') as TTSEngineType;
        if (savedEngine === 'kokoro' || savedEngine === 'native') {
          this.engine = savedEngine;
        }
        const savedVoice = localStorage.getItem('polydict_kokoro_voice') as KokoroVoiceId;
        if (savedVoice && KOKORO_VOICES.some(v => v.id === savedVoice)) {
          this.kokoroVoice = savedVoice;
        }
        const storedSettings = localStorage.getItem('polydict_settings_v1');
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed.accent === 'US' || parsed.accent === 'UK') {
            this.defaultAccent = parsed.accent;
          }
          if (typeof parsed.speechRate === 'number') {
            this.defaultRate = parsed.speechRate;
          }
        }
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }

  private loadNativeVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableNativeVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getEngine(): TTSEngineType {
    return this.engine;
  }

  public setEngine(engine: TTSEngineType) {
    this.engine = engine;
    try {
      localStorage.setItem('polydict_tts_engine', engine);
    } catch {
      // Ignore
    }
  }

  public getKokoroVoice(): KokoroVoiceId {
    return this.kokoroVoice;
  }

  public setKokoroVoice(voice: KokoroVoiceId) {
    this.kokoroVoice = voice;
    try {
      localStorage.setItem('polydict_kokoro_voice', voice);
    } catch {
      // Ignore
    }
  }

  public setDefaultRate(rate: number) {
    this.defaultRate = rate;
  }

  public getDefaultRate(): number {
    return this.defaultRate;
  }

  public setDefaultAccent(accent: 'US' | 'UK') {
    this.defaultAccent = accent;
  }

  public getDefaultAccent(): 'US' | 'UK' {
    return this.defaultAccent;
  }

  public getKokoroStatus(): KokoroStatus {
    return { ...this.kokoroStatus };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getKokoroStatus());
    return () => this.statusListeners.delete(listener);
  }

  private updateStatus(patch: Partial<KokoroStatus>) {
    this.kokoroStatus = { ...this.kokoroStatus, ...patch };
    const current = this.getKokoroStatus();
    this.statusListeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  /**
   * Preload or initialize Kokoro model
   */
  public async preloadKokoro(): Promise<boolean> {
    if (this.kokoroInstance) return true;
    if (this.kokoroLoadingPromise) return this.kokoroLoadingPromise;

    this.updateStatus({
      state: 'loading',
      progress: 5,
      statusText: 'Loading Kokoro 82M model (~86MB)...',
      error: null,
    });

    this.kokoroLoadingPromise = (async () => {
      try {
        const { KokoroTTS } = await import('kokoro-js');

        const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progressCallback = (info: any) => {
          if (!info) return;
          if (info.status === 'progress' && typeof info.progress === 'number') {
            const pct = Math.round(info.progress);
            this.updateStatus({
              state: 'loading',
              progress: pct,
              statusText: `Downloading neural weights: ${pct}% (${info.file || 'model_q8.onnx'})`,
            });
          } else if (info.status === 'download') {
            this.updateStatus({
              state: 'loading',
              statusText: `Fetching ${info.file || 'model components'}...`,
            });
          }
        };

        let tts;
        try {
          // In web browsers, 'wasm' (WebAssembly SIMD on CPU) is the proper equivalent of Node's 'cpu'.
          // When using quantized 'q8' weights, 'wasm' must be used because WebGPU does not support
          // quantized int8 operators without splitting across CPU and causing execution graph corruption.
          tts = await KokoroTTS.from_pretrained(modelId, {
            dtype: 'q8',
            device: 'wasm',
            progress_callback: progressCallback,
          });
        } catch (deviceErr) {
          console.warn('WASM device init failed, retrying with default runtime:', deviceErr);
          tts = await KokoroTTS.from_pretrained(modelId, {
            dtype: 'q8',
            device: null,
            progress_callback: progressCallback,
          });
        }

        if (!tts) {
          throw new Error('Kokoro TTS model could not be initialized.');
        }

        this.kokoroInstance = tts;
        this.updateStatus({
          state: 'ready',
          progress: 100,
          statusText: 'Kokoro 82M Neural Engine Ready (Cached)',
          error: null,
        });
        return true;
      } catch (err) {
        console.error('Failed to load Kokoro TTS:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        this.updateStatus({
          state: 'error',
          statusText: 'Kokoro model failed to initialize. Falling back to native speech.',
          error: errMsg,
        });
        this.kokoroLoadingPromise = null;
        return false;
      }
    })();

    return this.kokoroLoadingPromise;
  }

  /**
   * Speak text using either Kokoro or Native Speech Synthesis
   */
  public async speak(
    text: string,
    langCode: LanguageCode | string = 'en',
    accentPreference: 'US' | 'UK' | 'default' = 'default',
    rate?: number
  ): Promise<boolean> {
    this.stop();
    const cleanText = text.trim();
    if (!cleanText) return false;

    const effectiveAccent = accentPreference === 'default' ? this.defaultAccent : accentPreference;
    const effectiveRate = rate ?? this.defaultRate;

    // Kokoro currently phonemizes English ('en', 'en-US', 'en-GB').
    // Other languages (ja, zh, ko, es, fr, etc.) automatically route to native browser speech.
    const isEnglish = langCode === 'en' || langCode.startsWith('en-');

    if (this.engine === 'kokoro' && isEnglish) {
      try {
        return await this.speakKokoro(cleanText, effectiveAccent, effectiveRate);
      } catch (err) {
        console.warn('Kokoro speech failed, falling back to native browser speech:', err);
        return await this.speakNative(cleanText, langCode, effectiveAccent, effectiveRate);
      }
    }

    // Default to native browser speech for non-English or when engine is 'native'
    return await this.speakNative(cleanText, langCode, effectiveAccent, effectiveRate);
  }

  private async speakKokoro(
    text: string,
    accentPreference: 'US' | 'UK' | 'default',
    rate: number
  ): Promise<boolean> {
    // Select voice based on accent preference or explicitly configured voice
    let voiceToUse = this.kokoroVoice;
    if (accentPreference === 'UK' && !voiceToUse.startsWith('b')) {
      voiceToUse = 'bf_emma';
    } else if (accentPreference === 'US' && !voiceToUse.startsWith('a')) {
      voiceToUse = 'af_heart';
    }

    // Check cache
    const cacheKey = `${text.toLowerCase()}|${voiceToUse}|${rate.toFixed(2)}`;
    let audioUrl = this.audioCache.get(cacheKey);

    if (!audioUrl) {
      // Ensure model is ready
      if (!this.kokoroInstance) {
        const loaded = await this.preloadKokoro();
        if (!loaded || !this.kokoroInstance) {
          throw new Error('Kokoro model unavailable');
        }
      }

      this.updateStatus({
        state: 'generating',
        statusText: `Synthesizing with Kokoro (${voiceToUse})...`,
      });

      // Kokoro (StyleTTS 2 architecture) requires terminal punctuation for prosodic stop tokens.
      // Isolated single words without punctuation cause the duration predictor to drift or hallucinate.
      const textToSynthesize = /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;

      // Generate audio
      const audio = await this.kokoroInstance.generate(textToSynthesize, {
        voice: voiceToUse,
        speed: rate,
      });

      const blob: Blob = audio.toBlob();
      audioUrl = URL.createObjectURL(blob);
      this.audioCache.set(cacheKey, audioUrl);

      this.updateStatus({
        state: 'ready',
        statusText: 'Playback active',
      });
    }

    return new Promise((resolve) => {
      const audioEl = new Audio(audioUrl);
      this.currentAudioElement = audioEl;

      audioEl.onended = () => {
        this.currentAudioElement = null;
        this.updateStatus({
          state: 'ready',
          statusText: 'Ready',
        });
        resolve(true);
      };

      audioEl.onerror = () => {
        this.currentAudioElement = null;
        this.updateStatus({
          state: 'ready',
          statusText: 'Audio playback failed',
        });
        resolve(false);
      };

      audioEl.play().catch((err) => {
        console.warn('Audio playback was prevented by browser:', err);
        this.currentAudioElement = null;
        resolve(false);
      });
    });
  }

  private speakNative(
    text: string,
    langCode: LanguageCode | string = 'en',
    accentPreference: 'US' | 'UK' | 'default' = 'default',
    rate: number = 0.95
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth || !this.isNativeSupported) {
        resolve(false);
        return;
      }

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = this.synth.getVoices();
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (langCode === 'en' || langCode.startsWith('en')) {
        if (accentPreference === 'UK') {
          matchedVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.includes('Great Britain'));
        } else {
          matchedVoice = voices.find(v => v.lang.startsWith('en-US') || v.name.includes('Google US English'));
        }
        if (!matchedVoice) {
          matchedVoice = voices.find(v => v.lang.startsWith('en'));
        }
      } else {
        const langPrefix = langCode.substring(0, 2);
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = langCode;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.kokoroStatus.state === 'generating') {
      this.updateStatus({ state: 'ready', statusText: 'Ready' });
    }
  }

  public getIsSupported(): boolean {
    return this.isNativeSupported || typeof window !== 'undefined';
  }
}

export const speechService = new SpeechService();
