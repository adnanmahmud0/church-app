import NodeCache from 'node-cache';
import { BibleSettings } from './bibleSettings.model';
import { IBibleVersion } from './bibleSettings.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import * as cheerio from 'cheerio';
import config from '../../../config';

const cache = new NodeCache();

// The translations the user actually has access to via the YouVersion API key.
// Copyrighted versions like KJV/NIV require explicit YouVersion approval.
const DEFAULT_VERSIONS: IBibleVersion[] = [
  { id: 12, name: 'American Standard Version', abbreviation: 'ASV', isActive: true },
  { id: 3034, name: 'Berean Standard Bible', abbreviation: 'BSB', isActive: true },
  { id: 2660, name: 'Literal Standard Version', abbreviation: 'LSV', isActive: true },
  { id: 1932, name: 'Free Bible Version', abbreviation: 'FBV', isActive: true },
  { id: 206, name: 'World English Bible', abbreviation: 'WEBUS', isActive: true },
];

const YOUVERSION_BASE_URL = 'https://api.youversion.com/v1';
const FALLBACK_BIBLE_ID = 206; // WEBUS - World English Bible (public domain, available on all keys)

const fetchYouVersion = async (endpoint: string, fallbackToPublic = false): Promise<any> => {
  const YOUVERSION_API_KEY = config.youversion_api_key;
  if (!YOUVERSION_API_KEY) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'YouVersion API key is not configured');
  }

  const url = `${YOUVERSION_BASE_URL}${endpoint}`;
  let response = await fetch(url, {
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

  const json = await response.json();
  return json.data ? json : { data: json.response?.data || json };
};

const getBooks = async (versionId: number) => {
  const cacheKey = `books_${versionId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Uses v1 endpoint /bibles/{id}/books
  const data = await fetchYouVersion(`/bibles/${versionId}/books`, true);
  
  const booksData = Array.isArray(data.data) ? data.data : (data.data?.items || []);
  const books = booksData.map((book: any) => ({
    id: book.id || book.usfm,
    name: book.name || book.human,
    abbreviation: book.abbreviation || book.human_long,
    testament: book.testament || (book.id && ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL'].includes(book.id) ? 'OT' : 'NT'),
    chapters_count: book.chapters ? book.chapters.length : 0,
  }));

  cache.set(cacheKey, books, 86400); // 24 hours
  return books;
};

const getChapters = async (versionId: number, bookId: string) => {
  const cacheKey = `chapters_${versionId}_${bookId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // v1 /books endpoint returns chapters inside each book
  const data = await fetchYouVersion(`/bibles/${versionId}/books`, true);
  const booksData = Array.isArray(data.data) ? data.data : (data.data?.items || []);
  
  const book = booksData.find((b: any) => b.id === bookId);
  if (!book || !book.chapters) return [];

  const chapters = book.chapters.map((ch: any) => ({
    chapter_number: ch.id || ch.number || ch.reference || ch.usfm,
  }));

  cache.set(cacheKey, chapters, 86400); // 24 hours
  return chapters;
};

const getVerses = async (versionId: number, bookId: string, chapter: string) => {
  const cacheKey = `verses_${versionId}_${bookId}_${chapter}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch passage in HTML format so we can parse verses
  const data = await fetchYouVersion(`/bibles/${versionId}/passages/${bookId}.${chapter}?format=html`, true);
  
  const contentHtml = data.data?.content || data.content || '';
  
  // Parse HTML into verses using cheerio
  const $ = cheerio.load(contentHtml);
  const versesMap = new Map<string, string>();
  
  // v1 HTML structure uses <span class="yv-v" v="1"></span><span class="yv-vlbl">1</span> Verse Text...
  // We can just iterate through text nodes and associate them with the most recent verse number.
  let currentVerse = "1";
  
  // Select all top-level elements or text within paragraphs
  $('*').contents().each((_, el) => {
    if (el.type === 'tag' && el.tagName === 'span' && $(el).hasClass('yv-v')) {
      const v = $(el).attr('v');
      if (v) currentVerse = v;
    } else if (el.type === 'text') {
      const text = $(el).text().trim();
      // Ignore verse labels like "1" directly, though usually they are in yv-vlbl
      if (text.length > 0 && el.parent && el.parent.type === 'tag' && !$(el.parent).hasClass('yv-vlbl') && !$(el.parent).hasClass('yv-c')) {
         const existing = versesMap.get(currentVerse) || '';
         versesMap.set(currentVerse, existing + (existing ? ' ' : '') + text);
      }
    }
  });

  const parsedVerses = Array.from(versesMap.entries()).map(([verse_number, text]) => ({
    verse_number,
    text: text.replace(/\s+/g, ' ').trim()
  })).filter(v => v.text.length > 0);

  const verses = {
    book: bookId,
    chapter: chapter,
    version: versionId,
    verses: parsedVerses.length > 0 ? parsedVerses : [{ verse_number: "1", text: contentHtml.replace(/<[^>]*>?/gm, '').trim() }],
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
  
  // Fetch books for each version
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
  // Fallback search mechanism since /search might not exist in v1 the same way.
  try {
     const data = await fetchYouVersion(`/search?query=${encodeURIComponent(query)}&version_id=${versionId}`, true);
     const stripHtml = (html: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, '').trim();
     };
     const resultsList = Array.isArray(data.data) ? data.data : (data.data?.results || []);
     return {
        results: resultsList.map((item: any) => ({
           book: item.book?.id || item.book || '',
           chapter: item.chapter?.number || item.chapter || '',
           verse: item.verse?.number || item.verse || item.reference || '',
           text: stripHtml(item.text || item.content),
        })),
     };
  } catch(e) {
     return { results: [] };
  }
};

const checkHealth = async () => {
  try {
    const data = await fetchYouVersion('/bibles?language_ranges[]=eng');
    return { status: 'Connected', versionsCount: Array.isArray(data.data) ? data.data.length : 0 };
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
    total: keys.length
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
