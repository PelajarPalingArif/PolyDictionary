/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordOfTheDayItem } from '../types/dictionary';

export const WORD_OF_THE_DAY_ARCHIVE: WordOfTheDayItem[] = [
  {
    date: 'Today',
    word: 'serendipity',
    language: 'en',
    phonetic: '/ˌsɛrənˈdɪpɪti/',
    partOfSpeech: 'noun',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way; fortunate accidental discoveries.',
    example: 'Alexander Fleming discovered penicillin through pure scientific serendipity.',
    etymology: 'Coined in 1754 by Horace Walpole from the Persian fairy tale "The Three Princes of Serendip".',
    quote: {
      text: 'Serendipity is looking in a haystack for a needle and discovering a farmer’s daughter.',
      author: 'Julius Comroe Jr.'
    },
    difficulty: 'Advanced'
  },
  {
    date: 'Yesterday',
    word: 'resilience',
    language: 'en',
    phonetic: '/rɪˈzɪliəns/',
    partOfSpeech: 'noun',
    definition: 'The capacity of a person or living system to recover quickly from difficulties, stress, or change; inner toughness.',
    example: 'The community showed inspiring resilience as it rebuilt after the winter storm.',
    etymology: 'From Latin resilientia, from resilire ("to spring back, rebound").',
    quote: {
      text: 'Do not judge me by my successes, judge me by how many times I fell down and got back up again.',
      author: 'Nelson Mandela'
    },
    difficulty: 'Elementary'
  },
  {
    date: '2 Days Ago',
    word: 'ephemeral',
    language: 'en',
    phonetic: '/ɪˈfɛmərəl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very brief period of time; fleeting, transitory, or impermanent.',
    example: 'The desert blooms with ephemeral blossoms immediately following spring rains.',
    etymology: 'From Greek ephēmeros ("lasting only one day").',
    quote: {
      text: 'All that is ephemeral is only a symbol.',
      author: 'Johann Wolfgang von Goethe'
    },
    difficulty: 'Intermediate'
  }
];
