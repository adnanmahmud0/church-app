import NodeCache from 'node-cache';
import { BibleSettings } from './bibleSettings.model';
import { IBibleVersion } from './bibleSettings.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import * as cheerio from 'cheerio';
import config from '../../../config';

const cache = new NodeCache();

// Client requested versions
const DEFAULT_VERSIONS: IBibleVersion[] = [
  { id: 1, name: 'King James Version', abbreviation: 'KJV', isActive: true },
  { id: 116, name: 'New Living Translation', abbreviation: 'NLT', isActive: true },
  { id: 1588, name: 'Amplified Bible', abbreviation: 'AMP', isActive: true },
  { id: 111, name: 'New International Version', abbreviation: 'NIV', isActive: true },
  { id: 97, name: 'The Message', abbreviation: 'MSG', isActive: true }
];

const FALLBACK_BIBLE_ID = 206; // WEBUS - public domain fallback if KJV/NIV access is denied

const YOUVERSION_BASE_URL = 'https://api.youversion.com/v1';

const fetchYouVersion = async (endpoint: string, fallbackToPublic = false): Promise<any> => {
  const YOUVERSION_API_KEY = config.youversion_api_key;
  if (!YOUVERSION_API_KEY) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'YouVersion API key is not configured');
  }

  const url = `${YOUVERSION_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'X-YVP-App-Key': YOUVERSION_API_KEY,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // If access is denied (e.g. for KJV without permissions), and we allow fallback, try again with public domain WEBUS
    if (response.status === 401 || response.status === 403 || response.status === 404) {
       if (fallbackToPublic && endpoint.includes('/bibles/')) {
         const newEndpoint = endpoint.replace(/\/bibles\/\d+/, `/bibles/${FALLBACK_BIBLE_ID}`);
         if (newEndpoint !== endpoint) {
            return fetchYouVersion(newEndpoint, false); // Don't infinite loop
         }
       }
    }
    const errorBody = await response.text();
    throw new ApiError(StatusCodes.BAD_GATEWAY, `YouVersion API Error: ${response.status} - ${errorBody}`);
  }

  return response.json();
};

const getBooks = async (versionId: number) => {
  const cacheKey = `books_${versionId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // API returns: { data: [{ id: "GEN", title: "Genesis", abbreviation: "Gen.", canon: "old_testament", chapters: [...] }] }
  const response = await fetchYouVersion(`/bibles/${versionId}/books`, true);
  const booksData = response.data || [];

  const books = booksData.map((book: any) => ({
    id: book.id,               // e.g. "GEN"
    name: book.title,          // e.g. "Genesis"
    abbreviation: book.abbreviation, // e.g. "Gen."
    testament: book.canon === 'old_testament' ? 'OT' : 'NT',
    chapters_count: book.chapters ? book.chapters.length : 0,
  }));

  cache.set(cacheKey, books, 86400); // 24 hours
  return books;
};

const getChapters = async (versionId: number, bookId: string) => {
  const cacheKey = `chapters_${versionId}_${bookId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // API returns books with chapters embedded. We need to fetch books and find the specific one.
  const response = await fetchYouVersion(`/bibles/${versionId}/books`, true);
  const booksData = response.data || [];

  const book = booksData.find((b: any) => b.id === bookId);
  if (!book || !book.chapters) return [];

  // Each chapter: { id: "1", passage_id: "GEN.1", title: "1", verses: [{id: "1", ...}] }
  const chapters = book.chapters.map((ch: any) => ({
    chapter_number: ch.id,        // e.g. "1"
    passage_id: ch.passage_id,    // e.g. "GEN.1"
    verses_count: ch.verses ? ch.verses.length : 0,
  }));

  cache.set(cacheKey, chapters, 86400); // 24 hours
  return chapters;
};

const getVerses = async (versionId: number, bookId: string, chapter: string) => {
  const cacheKey = `verses_${versionId}_${bookId}_${chapter}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // API endpoint: /bibles/{id}/passages/{BOOK}.{CHAPTER}?format=html
  const passageId = `${bookId}.${chapter}`;
  const response = await fetchYouVersion(`/bibles/${versionId}/passages/${passageId}?format=html`, true);

  // Response: { id: "GEN.1", content: "<div>...<span class=\"yv-v\" v=\"1\"></span><span class=\"yv-vlbl\">1</span>In the beginning..." }
  const contentHtml = response.content || '';

  // Parse HTML into individual verses using cheerio
  const $ = cheerio.load(contentHtml);
  const versesMap = new Map<string, string>();

  // The HTML structure uses:
  //   <span class="yv-v" v="1"></span>  -- marks the start of verse 1
  //   <span class="yv-vlbl">1</span>   -- the visible verse label
  //   Text content follows...
  let currentVerse = '1';

  $('*').contents().each((_, el) => {
    if (el.type === 'tag' && el.tagName === 'span' && $(el).hasClass('yv-v')) {
      const v = $(el).attr('v');
      if (v) currentVerse = v;
    } else if (el.type === 'text') {
      const text = $(el).text().trim();
      // Skip verse label spans and chapter header spans
      if (
        text.length > 0 &&
        el.parent &&
        el.parent.type === 'tag' &&
        !$(el.parent).hasClass('yv-vlbl') &&
        !$(el.parent).hasClass('yv-c')
      ) {
        const existing = versesMap.get(currentVerse) || '';
        versesMap.set(currentVerse, existing + (existing ? ' ' : '') + text);
      }
    }
  });

  const parsedVerses = Array.from(versesMap.entries()).map(([verse_number, text]) => ({
    verse_number,
    text: text.replace(/\s+/g, ' ').trim(),
  })).filter(v => v.text.length > 0);

  const verses = {
    book: bookId,
    chapter: chapter,
    version: versionId,
    verses: parsedVerses.length > 0
      ? parsedVerses
      : [{ verse_number: '1', text: contentHtml.replace(/<[^>]*>?/gm, '').trim() }],
  };

  cache.set(cacheKey, verses, 3600); // 1 hour
  return verses;
};

const getVersions = async () => {
  let settings = await BibleSettings.findOne();
  if (!settings) {
    settings = await BibleSettings.create({
      defaultVersionId: 1,
      versions: DEFAULT_VERSIONS,
    });
  }
  const activeVersions = settings.versions.filter(v => v.isActive);

  // Fetch books for each active version
  const versionsWithBooks = await Promise.all(activeVersions.map(async (v) => {
    try {
      const books = await getBooks(v.id);
      return { ...(v as any).toObject?.() || v, books };
    } catch (error) {
      return { ...(v as any).toObject?.() || v, books: [] };
    }
  }));

  return versionsWithBooks;
};

const getAdminSettings = async () => {
  let settings = await BibleSettings.findOne();
  if (!settings) {
    settings = await BibleSettings.create({
      defaultVersionId: 1,
      versions: DEFAULT_VERSIONS,
    });
  }
  return settings;
};

const updateAdminSettings = async (payload: { defaultVersionId?: number; versions?: IBibleVersion[] }) => {
  let settings = await BibleSettings.findOne();
  if (!settings) {
    settings = await BibleSettings.create({
      defaultVersionId: payload.defaultVersionId || 1,
      versions: payload.versions || DEFAULT_VERSIONS,
    });
  } else {
    if (payload.defaultVersionId) settings.defaultVersionId = payload.defaultVersionId;
    if (payload.versions) settings.versions = payload.versions;
    await settings.save();
  }
  return settings;
};

const searchBible = async (versionId: number, query: string) => {
  try {
    const response = await fetchYouVersion(`/search?query=${encodeURIComponent(query)}&version_id=${versionId}`, true);
    const resultsList = response.data || [];
    return {
      results: resultsList.map((item: any) => ({
        book: item.book?.id || item.book || '',
        chapter: item.chapter?.number || item.chapter || '',
        verse: item.verse?.number || item.verse || item.reference || '',
        text: (item.text || item.content || '').replace(/<[^>]*>?/gm, '').trim(),
      })),
    };
  } catch (e) {
    return { results: [] };
  }
};

const checkHealth = async () => {
  try {
    const response = await fetchYouVersion('/bibles?language_ranges[]=eng');
    const versions = response.data || [];
    return { status: 'Connected', versionsCount: versions.length };
  } catch (error: any) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Disconnected: ${error.message}`);
  }
};

const getCacheStats = async () => {
  const keys = cache.keys();
  const booksCached = keys.filter(k => k.startsWith('books_')).length;
  const chaptersCached = keys.filter(k => k.startsWith('chapters_')).length;
  const versesCached = keys.filter(k => k.startsWith('verses_')).length;

  return {
    books: booksCached,
    chapters: chaptersCached,
    verses: versesCached,
    total: keys.length,
  };
};

const clearCache = async () => {
  cache.flushAll();
  return { success: true, message: 'Cache cleared successfully' };
};

export const BibleService = {
  getBooks,
  getChapters,
  getVerses,
  getVersions,
  searchBible,
  checkHealth,
  getAdminSettings,
  updateAdminSettings,
  getCacheStats,
  clearCache,
};
