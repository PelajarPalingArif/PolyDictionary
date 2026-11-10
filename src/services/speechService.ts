/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode } from '../types/dictionary';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public speak(
    text: string, 
    langCode: LanguageCode | string = 'en', 
    accentPreference: 'US' | 'UK' | 'default' = 'default',
    rate: number = 0.95
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth || !this.isSupported) {
        resolve(false);
        return;
      }

      // Stop any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Find best voice match
      const voices = this.synth.getVoices();
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (langCode === 'en') {
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
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }
}

export const speechService = new SpeechService();
