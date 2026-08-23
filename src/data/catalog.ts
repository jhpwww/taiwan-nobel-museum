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
    cw_hub: string;
    instagram?: string;
    ntu_epaper?: string;
    ntu_spotlight?: string;
  };
  topic_tags: string[];
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
  hosts: Record<string, { en: string; zh: string; city: string }>;
  tags: Record<string, Bilingual>;
  categories: Record<CategoryKey, Bilingual & { order: number }>;
  intro: Bilingual & { key: string };
}

export const catalog = raw as unknown as Catalog;

export const lectures = catalog.lectures;
export const specialEvents = catalog.special_events;
export const hosts = catalog.hosts;
export const tags = catalog.tags;
export const categories = catalog.categories;
export const intro = catalog.intro;

/** Display name of a prize category in the given language. */
export const catName = (key: GalleryKey, lang: Lang) =>
  key === INTRO ? intro[lang] : categories[key as CategoryKey][lang];
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

export const localDate = (iso: string, lang: Lang, long = false) =>
  new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-GB', {
    year: 'numeric', month: long ? 'long' : 'short', day: 'numeric',
  });
