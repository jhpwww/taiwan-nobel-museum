import raw from './lectures.json';
import type { Lang } from '../i18n/ui';

/** The six Nobel prize categories. */
export type CategoryKey = 'physics' | 'chemistry' | 'medicine' | 'literature' | 'peace' | 'economics';
/** Every gallery the museum has, including the introduction room. */
export type GalleryKey = CategoryKey | 'nobel';
/** The introduction room — not a prize category; the hall shows it on its own. */
export const INTRO: GalleryKey = 'nobel';

export interface Bilingual { zh: string; en: string }

export interface Lecture {
  id: string;
  no: number;
  series: string;
  laureate: Bilingual;
  prize: { category: CategoryKey; year: number };
  affiliation: { institution: string; country: string };
  event: { date: string; host_key: string; host_en: string; host_zh: string; city: string };
  title: { en: string; zh: string };
  description: Bilingual;
  hook: Bilingual;
  video: {
    lecture: string | null;
    lecture_ntu: string | null;
    guide: string | null;
    extra_sessions: { id: string; label: string }[];
  };
  interviews: { source: string; source_en: string; source_zh: string; id: string }[];
  links: {
    nobel_facts: string;
    nobel_lecture: string;
    cw_hub: string;
    instagram?: string;
    ntu_epaper?: string;
    ntu_spotlight?: string;
  };
  topic_tags: string[];
}

export interface Stat { key: string; value: number; zh: string; en: string }
export interface MaterialLink { url: string; zh: string; en: string; dzh: string; den: string }
export interface CategoryMeta extends Bilingual {
  order: number;
  intro: Bilingual;
  history: Bilingual;
  stats: Stat[];
  links: MaterialLink[];
}

export interface StandaloneRecord {
  id: string; source: string; yt: string;
  person_en: string; person_zh: string;
  role_en: string; role_zh: string; date: string;
}

export interface SpecialEvent {
  id: string; kind: string; date: string; yt: string;
  title_en: string; title_zh: string;
  host?: string | null; host_en?: string; host_zh?: string;
  laureate?: string; note_zh?: string;
}

interface Catalog {
  lectures: Lecture[];
  special_events: SpecialEvent[];
  standalone_records: StandaloneRecord[];
  hosts: Record<string, { en: string; zh: string; city: string }>;
  tags: Record<string, Bilingual>;
  categories: Record<CategoryKey, CategoryMeta>;
  prize_facts_asof: string;
  intro: Bilingual & { key: string; parts: { zh: string[]; en: string[] } };
}

export const catalog = raw as unknown as Catalog;

export const lectures = catalog.lectures;
export const specialEvents = catalog.special_events;
export const standaloneRecords = catalog.standalone_records ?? [];
export const hosts = catalog.hosts;
export const tags = catalog.tags;
export const categories = catalog.categories;
export const intro = catalog.intro;
export const factsAsOf = catalog.prize_facts_asof;

/** [subject, connector, subject] — the connector is rendered smaller. */
export const introParts = (lang: Lang): [string, string, string] =>
  intro.parts[lang] as [string, string, string];

/** Display name of a prize category in the given language. */
export const catName = (key: GalleryKey, lang: Lang) =>
  key === INTRO ? intro[lang] : categories[key as CategoryKey][lang];
/**
 * The same category name in the other language, to sit under the first. The
 * halls and the gallery headings carry both, the way the lecture titles do.
 */
export const catNameAlt = (key: GalleryKey, lang: Lang) =>
  catName(key, lang === 'zh' ? 'en' : 'zh');

/** Display name of a topic tag in the given language. */
export const tagName = (key: string, lang: Lang) => tags[key]?.[lang] ?? key;

/** Prize categories in museum order, with how many lectures each holds. */
export function categoryList() {
  return (Object.keys(categories) as CategoryKey[])
    .sort((a, b) => categories[a].order - categories[b].order)
    .map((key) => ({
      key,
      order: categories[key].order,
      count: lectures.filter((l) => l.prize.category === key).length,
    }));
}

/** Every routable gallery: the six categories plus the introduction room. */
export const galleryKeys = (): GalleryKey[] =>
  [...categoryList().map((c) => c.key), INTRO];

export const byCategory = (key: GalleryKey) =>
  lectures.filter((l) => l.prize.category === key)
          .sort((a, b) => a.event.date.localeCompare(b.event.date));

export const byDateAsc  = () => [...lectures].sort((a, b) => a.event.date.localeCompare(b.event.date));
export const byDateDesc = () => [...lectures].sort((a, b) => b.event.date.localeCompare(a.event.date));

/** Every video this lecture offers, for the "n videos" badge. */
export function videoCount(l: Lecture) {
  return (l.video.lecture ? 1 : 0) + (l.video.guide ? 1 : 0) +
         (l.video.lecture_ntu ? 1 : 0) + l.interviews.length + l.video.extra_sessions.length;
}

export const totalVideos = () =>
  lectures.reduce((n, l) => n + videoCount(l), 0) + specialEvents.length;

/** Onward viewing: same prize category first, then shared topics. */
export function relatedTo(l: Lecture, n = 3) {
  const others = lectures.filter((x) => x.id !== l.id);
  return [
    ...others.filter((x) => x.prize.category === l.prize.category),
    ...others.filter((x) => x.topic_tags.some((t) => l.topic_tags.includes(t))),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, n);
}

/**
 * The next lecture still to come, or null when the schedule is exhausted.
 *
 * `today` is the BUILD date, not the visitor's — this is a static site. A
 * lecture therefore stops being "upcoming" at the next rebuild after it
 * happens, not at midnight. Rebuild from the Actions tab to refresh it.
 */
export function nextUpcoming(today: string): Lecture | null {
  return byDateAsc().find((l) => l.event.date > today) ?? null;
}

/** Every lecture still to come, earliest first. */
export const allUpcoming = (today: string) => byDateAsc().filter((l) => l.event.date > today);

/**
 * What to show when nothing is upcoming: the richest lecture on the site —
 * most videos, guide video preferred — so the slot is never empty.
 */
export function recommended(): Lecture {
  return [...lectures].sort((a, b) => {
    const g = Number(!!b.video.guide) - Number(!!a.video.guide);
    return g !== 0 ? g : videoCount(b) - videoCount(a);
  })[0];
}

/* ------------------------------------------------------------------ *
 * Every video the museum holds, as one flat list.
 *
 * Three kinds, which is what the 影片類別 filter switches between:
 *   guide   導讀影片 — the short introduction filmed for each lecture
 *   lecture 講座     — the lecture itself
 *   record  專訪     — the interviews by 天下雜誌 and 風傳媒
 * ------------------------------------------------------------------ */
export type VideoKind = 'guide' | 'lecture' | 'record';

export interface VideoItem {
  key: string;                 // unique within the list
  yt: string;                  // youtube id
  kind: VideoKind;
  lecture: Lecture | null;     // null for records not tied to one laureate
  personZh: string;
  personEn: string;
  category: CategoryKey | null;
  topics: string[];
  date: string;
  /** 天下雜誌 / 風傳媒, for records only */
  sourceZh?: string;
  sourceEn?: string;
  /** a second upload of the same lecture, shown as a note */
  altOf?: string;
}

export function videoList(): VideoItem[] {
  const out: VideoItem[] = [];

  for (const l of byDateAsc()) {
    const base = {
      lecture: l,
      personZh: l.laureate.zh,
      personEn: l.laureate.en,
      category: l.prize.category,
      topics: l.topic_tags,
      date: l.event.date,
    };
    if (l.video.guide) out.push({ key: `${l.id}-guide`, yt: l.video.guide, kind: 'guide', ...base });
    // one 講座 row per lecture: 31. Second-day sessions and alternate uploads
    // stay on the lecture page rather than doubling up in the list.
    if (l.video.lecture) out.push({ key: `${l.id}-lecture`, yt: l.video.lecture, kind: 'lecture', ...base });
    for (const iv of l.interviews) {
      out.push({
        key: `${l.id}-${iv.id}`, yt: iv.id, kind: 'record',
        sourceZh: iv.source_zh, sourceEn: iv.source_en, ...base,
      });
    }
  }

  for (const r of standaloneRecords) {
    out.push({
      key: r.id, yt: r.yt, kind: 'record', lecture: null,
      personZh: r.person_zh, personEn: r.person_en,
      category: null, topics: [], date: r.date,
      sourceZh: r.source === 'cw' ? '天下雜誌' : '風傳媒',
      sourceEn: r.source === 'cw' ? 'CommonWealth Magazine' : 'The Storm Media',
    });
  }
  return out;
}

export const videoCounts = () => {
  const v = videoList();
  return {
    all: v.length,
    guide: v.filter((x) => x.kind === 'guide').length,
    lecture: v.filter((x) => x.kind === 'lecture').length,
    record: v.filter((x) => x.kind === 'record').length,
  };
};

export const localDate = (iso: string, lang: Lang, long = false) =>
  new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-GB', {
    year: 'numeric', month: long ? 'long' : 'short', day: 'numeric',
  });
