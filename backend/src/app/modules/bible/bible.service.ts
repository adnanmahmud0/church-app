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
  { id: 97, name: 'The Message', abbreviation: 'MSG', isActive: true },
  { id: 12, name: 'American Standard Version', abbreviation: 'ASV', isActive: true },
  { id: 42, name: 'Catholic Public Domain Version', abbreviation: 'CPDV', isActive: true },
  { id: 2163, name: 'Geneva Bible', abbreviation: 'enggnv', isActive: true },
  { id: 130, name: 'The Orthodox Jewish Bible', abbreviation: 'TOJB2011', isActive: true },
  { id: 2660, name: 'Literal Standard Version', abbreviation: 'LSV', isActive: true },
  { id: 3034, name: 'Berean Standard Bible', abbreviation: 'BSB', isActive: true },
  { id: 1207, name: 'World Messianic Bible British Edition', abbreviation: 'WMBBE', isActive: true },
  { id: 1209, name: 'World Messianic Bible', abbreviation: 'WMB', isActive: true },
  { id: 3427, name: 'The Text-Critical English New Testament', abbreviation: 'TCENT', isActive: true },
  { id: 1932, name: 'Free Bible Version', abbreviation: 'FBV', isActive: true },
  { id: 206, name: 'World English Bible', abbreviation: 'engWEBUS', isActive: true }
];

const YOUVERSION_BASE_URL = 'https://api.youversion.com/v1';

const fetchYouVersion = async (endpoint: string): Promise<any> => {
  const YOUVERSION_API_KEY = config.youversion_api_key;
  if (!YOUVERSION_API_KEY) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'YouVersion API key is not configured');
  }

  const url = `${YOUVERSION_BASE_URL}${endpoint}`;
  console.log(`[Bible] Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'X-YVP-App-Key': YOUVERSION_API_KEY,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Bible] API Error: ${response.status} for ${url} — ${errorBody}`);
    
    let errorMessage = 'YouVersion API Error';
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.message) {
        errorMessage = parsed.message;
      }
    } catch (e) {
      errorMessage = errorBody || `HTTP ${response.status}`;
    }

    if (errorMessage.includes('Access denied for')) {
      const match = errorMessage.match(/Access denied for (\d+)/);
      if (match) {
        const id = parseInt(match[1], 10);
        try {
          const settings = await BibleSettings.findOne();
          const version = settings?.versions.find((v: any) => v.id === id) || DEFAULT_VERSIONS.find((v) => v.id === id);
          if (version) {
            errorMessage = `Access denied for ${version.name} (${version.abbreviation})`;
          }
        } catch (dbError) {
          // Fallback if DB fetch fails
        }
      }
    }

    const statusCode = (response.status === 403 || response.status === 401) ? 403 : 502;
    throw new ApiError(statusCode, errorMessage);
  }

  return response.json();
};

const STANDARD_ABBREVIATIONS: Record<string, string> = {
  GEN: 'Gen', EXO: 'Exo', LEV: 'Lev', NUM: 'Num', DEU: 'Deut', JOS: 'Josh', JDG: 'Judg', RUT: 'Ruth',
  '1SA': '1 Sam', '2SA': '2 Sam', '1KI': '1 Kgs', '2KI': '2 Kgs', '1CH': '1 Chr', '2CH': '2 Chr',
  EZR: 'Ezra', NEH: 'Neh', EST: 'Esth', JOB: 'Job', PSA: 'Ps', PRO: 'Prov', ECC: 'Eccl', SNG: 'Song',
  ISA: 'Isa', JER: 'Jer', LAM: 'Lam', EZK: 'Ezek', DAN: 'Dan', HOS: 'Hos', JOL: 'Joel', AMO: 'Amos',
  OBA: 'Obad', JON: 'Jonah', MIC: 'Mic', NAM: 'Nah', HAB: 'Hab', ZEP: 'Zeph', HAG: 'Hag', ZEC: 'Zech',
  MAL: 'Mal', MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Rom', '1CO': '1 Cor',
  '2CO': '2 Cor', GAL: 'Gal', EPH: 'Eph', PHP: 'Phil', COL: 'Col', '1TH': '1 Thes', '2TH': '2 Thes',
  '1TI': '1 Tim', '2TI': '2 Tim', TIT: 'Titus', PHM: 'Phlm', HEB: 'Heb', JAS: 'Jas', '1PE': '1 Pet',
  '2PE': '2 Pet', '1JN': '1 John', '2JN': '2 John', '3JN': '3 John', JUD: 'Jude', REV: 'Rev'
};

const getBooks = async (versionId: number) => {
  const cacheKey = `books_${versionId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // API returns: { data: [{ id: "GEN", title: "Genesis", abbreviation: "Gen.", canon: "old_testament", chapters: [...] }] }
  const response = await fetchYouVersion(`/bibles/${versionId}/books`);
  const booksData = response.data || [];

  const books = booksData.map((book: any) => ({
    id: book.id,               // e.g. "GEN"
    name: book.title,          // e.g. "Genesis"
    full_title: book.full_title || book.title || '',
    abbreviation: book.abbreviation || STANDARD_ABBREVIATIONS[book.id] || book.id,
    testament: book.canon === 'old_testament' ? 'OT' : 'NT',
    chapters_count: book.chapters ? book.chapters.length : 0,
    intro: book.intro || null,
  }));

  cache.set(cacheKey, books, 86400); // 24 hours
  return books;
};

const getChapters = async (versionId: number, bookId: string) => {
  const cacheKey = `chapters_${versionId}_${bookId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // API returns books with chapters embedded. We need to fetch books and find the specific one.
  const response = await fetchYouVersion(`/bibles/${versionId}/books`);
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
  const response = await fetchYouVersion(`/bibles/${versionId}/passages/${passageId}?format=html`);

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

  // Fetch YouVersion bibles metadata to enrich the versions list
  let yvBibles: any[] = [];
  try {
    const cacheKey = 'yv_bibles_metadata';
    let cached = cache.get(cacheKey) as any[];
    if (!cached) {
      const response = await fetchYouVersion('/bibles?language_ranges[]=eng');
      cached = response.data || [];
      cache.set(cacheKey, cached, 86400); // 24 hours
    }
    yvBibles = cached;
  } catch (error) {
    console.error('Failed to fetch YouVersion bibles metadata:', error);
  }

  const versionsWithMetadata = activeVersions.map((v) => {
    const vObj = typeof (v as any).toObject === 'function' ? (v as any).toObject() : v;
    const metadata = yvBibles.find((item: any) => Number(item.id) === Number(v.id));
    return {
      id: vObj.id,
      name: vObj.name,
      abbreviation: vObj.abbreviation,
      isActive: vObj.isActive,
      _id: vObj._id,
      copyright: metadata?.copyright || null,
      publisher_url: metadata?.publisher_url || null,
      language_tag: metadata?.language_tag || 'en',
      youversion_deep_link: metadata?.youversion_deep_link || `https://www.bible.com/versions/${v.id}`,
    };
  });

  return versionsWithMetadata;
};

const getVersionMetadata = async (versionId: number) => {
  const versions = await getVersions();
  const version = versions.find(v => Number(v.id) === Number(versionId));
  return version || { id: versionId };
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
    const response = await fetchYouVersion(`/search?query=${encodeURIComponent(query)}&version_id=${versionId}`);
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

const testVersionAccess = async (versionId: number) => {
  try {
    await fetchYouVersion(`/bibles/${versionId}/passages/GEN.1?format=html`);
    return { hasAccess: true, versionId };
  } catch (error: any) {
    return { hasAccess: false, versionId, error: error.message };
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
  getVersionMetadata,
  searchBible,
  testVersionAccess,
  checkHealth,
  getAdminSettings,
  updateAdminSettings,
  getCacheStats,
  clearCache,
};
