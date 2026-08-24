export const LANGS = ['zh', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'zh';

export const LANG_LABEL: Record<Lang, string> = { zh: '中文', en: 'English' };
export const HTML_LANG: Record<Lang, string> = { zh: 'zh-Hant-TW', en: 'en' };

/** Every user-facing string on the site. No hardcoded copy in components. */
export const ui = {
  zh: {
    'site.title': '諾貝爾演講博物館',
    'site.university': '國立臺灣大學',
    'site.tagline': '諾貝爾演講博物館',
    'site.description':
      '收錄臺灣橋樑計畫 31 場諾貝爾獎得主演講、導讀影片與專訪，為高中生、大學生與一般大眾打造的線上影音博物館。',

    'nav.hall': '博物館大廳',
    'nav.all': '所有講座',
    'nav.about': '關於本站',
    'nav.skip': '跳到主要內容',
    'a11y.newTab': '（另開新視窗）',

    'hall.enter': '選擇一個展廳',
    'hall.hint': '點選雕塑進入展廳',
    'hall.count': '{n} 場講座',
    'hall.countOne': '{n} 場講座',
    'hall.nobelRoom': '關於這座獎',
    'hall.introDesc': '這座獎從哪裡來？誰來決定？而留下它的那個人，又是誰？',
    'hall.introCta': '進入介紹',
    'hall.soon': '本系列尚無此類講座',
    'cat.emptyTitle': '這個展廳還在等一位得主',
    'cat.emptyBody': '「臺灣橋樑計畫」（Taiwan Bridges Program）邀請的 31 位得主中，沒有文學獎得主。展櫃暫時空著——但諾貝爾文學獎（Nobel Prize in Literature）的故事仍然值得一讀。',
    'cat.emptyLink': '認識歷屆諾貝爾文學獎得主',
    'cat.aboutPrize': '關於這個獎項',
    'cat.materials': '延伸材料',
    'cat.materialsNote': '以下連結全部指向諾貝爾基金會（Nobel Foundation）官方網站，可查詢歷屆得主、得獎理由與統計資料。',
    'cat.asOf': '統計數字取自諾貝爾獎官方應用程式介面（Nobel Prize API），資料日期 {date}。',
    'hall.stat.lectures': '場諾貝爾獎得主演講',
    'hall.stat.laureates': '位諾貝爾獎得主',
    'hall.stat.videos': '支影片',
    'hall.featured': '本館推薦',
    'home.upcoming': '即將登場',
    'home.upcomingCta': '查看講座頁',
    'home.upcomingNone': '本系列演講已全部完成',
    'home.recommendWhy': '影片最完整的一場，適合第一次來的訪客',
    'hall.latest': '最新加入',
    'hall.watch': '觀看',

    'cat.back': '回到大廳',
    'cat.lectures': '本展廳的講座',

    'lec.guide': '導讀影片',
    'lec.guideNote': '三分鐘先看懂這場演講在講什麼',
    'lec.lecture': '完整講座',
    'lec.lectureNote': '演講全長，英語發音',
    'lec.interview': '專訪',
    'lec.session': '其他場次',
    'lec.deeper': '延伸探索',
    'lec.nobelFacts': '諾貝爾獎官方介紹',
    'lec.nobelFactsNote': '得獎理由、生平與官方資料（英文）',
    'lec.ntuCge': '臺大諾貝爾獎得主講座專頁',
    'lec.ntuCgeNote': '共同教育中心（Center for General Education）彙整的六場臺大講座與相關資料',
    'lec.cwHub': '天下雜誌數位專區',
    'lec.cwHubNote': '天下雜誌（CommonWealth Magazine）的中文專題報導',
    'lec.ntuNews': '臺大校訊報導',
    'lec.ntuSpotlight': '臺大焦點',
    'lec.instagram': '講座短影音',
    'lec.next': '接著看',
    'lec.prize': '{year} 年諾貝爾{category}獎得主',
    'lec.at': '主辦單位',
    'lec.date': '演講日期',
    'lec.affiliation': '所屬機構',
    'lec.guideSoon': '本場導讀影片製作中，敬請期待。',
    'lec.playHint': '點擊播放（YouTube）',
    'lec.noVideo': '影片尚未提供',

    'browse.title': '所有講座',
    'browse.filterCat': '獎項類別',
    'browse.filterTopic': '主題',
    'browse.filterAll': '全部',
    'browse.results': '共 {n} 場',
    'browse.empty': '沒有符合條件的講座。',
    'browse.sort': '依日期排序',

    'special.title': '特別活動',
    'special.ceremony': '啟動儀式',
    'special.outreach': '校園講座',
    'special.panel': '對談',
    'special.exhibition': '特展',

    'about.title': '關於本站',
  },
  en: {
    'site.title': 'Nobel Lecture Museum',
    'site.university': 'National Taiwan University',
    'site.tagline': 'Nobel Lecture Museum',
    'site.description':
      '31 Nobel laureate lectures delivered in Taiwan, with guide videos and interviews — an online video museum for students and the curious public.',

    'nav.hall': 'The Great Hall',
    'nav.all': 'All lectures',
    'nav.about': 'About',
    'nav.skip': 'Skip to main content',
    'a11y.newTab': '(opens in a new tab)',

    'hall.enter': 'Choose a gallery',
    'hall.hint': 'Select a sculpture to enter',
    'hall.count': '{n} lectures',
    'hall.countOne': '{n} lecture',
    'hall.nobelRoom': 'About the prize',
    'hall.introDesc': 'Where this prize came from, who decides it, and the man who left it behind.',
    'hall.introCta': 'Enter the room',
    'hall.soon': 'No lectures in this category yet',
    'cat.emptyTitle': 'This gallery is still waiting for a laureate',
    'cat.emptyBody': 'None of the 31 laureates the Taiwan Bridges Program brought to Taiwan was a Literature laureate. The plinth stands empty for now — but the story of the prize for Literature is still worth reading.',
    'cat.emptyLink': 'Meet the Nobel Laureates in Literature',
    'cat.aboutPrize': 'About this prize',
    'cat.materials': 'Go further',
    'cat.materialsNote': 'Every link below goes to the Nobel Foundation\u2019s own site, where you can look up laureates, citations and statistics.',
    'cat.asOf': 'Figures from the official Nobel Prize API, as of {date}.',
    'hall.stat.lectures': 'Nobel laureate lectures',
    'hall.stat.laureates': 'Nobel laureates',
    'hall.stat.videos': 'videos',
    'hall.featured': 'Featured',
    'home.upcoming': 'Coming up',
    'home.upcomingCta': 'See the lecture page',
    'home.upcomingNone': 'The series has finished',
    'home.recommendWhy': 'The fullest set of material on the site — a good place to start',
    'hall.latest': 'Recently added',
    'hall.watch': 'Watch',

    'cat.back': 'Back to the hall',
    'cat.lectures': 'Lectures in this gallery',

    'lec.guide': 'Guide video',
    'lec.guideNote': 'Three minutes on what this lecture is about',
    'lec.lecture': 'Full lecture',
    'lec.lectureNote': 'The complete talk, in English',
    'lec.interview': 'Interview',
    'lec.session': 'Other sessions',
    'lec.deeper': 'Go deeper',
    'lec.nobelFacts': 'Official Nobel Prize page',
    'lec.nobelFactsNote': 'Citation, biography and official material',
    'lec.ntuCge': 'NTU Nobel Laureate Lecture page',
    'lec.ntuCgeNote': 'The six NTU lectures and their material, gathered by NTU CGE',
    'lec.cwHub': 'CommonWealth Magazine hub',
    'lec.cwHubNote': 'Chinese-language coverage of the programme',
    'lec.ntuNews': 'NTU e-Paper report',
    'lec.ntuSpotlight': 'NTU Spotlight',
    'lec.instagram': 'Short clip',
    'lec.next': 'Watch next',
    'lec.prize': 'Nobel Prize in {category}, {year}',
    'lec.at': 'Hosted by',
    'lec.date': 'Date',
    'lec.affiliation': 'Affiliation',
    'lec.guideSoon': 'The guide video for this lecture is in production.',
    'lec.playHint': 'Click to play (YouTube)',
    'lec.noVideo': 'Video not yet available',

    'browse.title': 'All lectures',
    'browse.filterCat': 'Prize category',
    'browse.filterTopic': 'Topic',
    'browse.filterAll': 'All',
    'browse.results': '{n} lectures',
    'browse.empty': 'No lectures match these filters.',
    'browse.sort': 'By date',

    'special.title': 'Special events',
    'special.ceremony': 'Opening ceremony',
    'special.outreach': 'School lecture',
    'special.panel': 'In conversation',
    'special.exhibition': 'Exhibition',

    'about.title': 'About this site',
  },
} as const;

export type UIKey = keyof (typeof ui)['zh'];

export function useT(lang: Lang) {
  return (key: UIKey, vars?: Record<string, string | number>) => {
    let s: string = (ui[lang] as Record<string, string>)[key] ?? (ui.zh as Record<string, string>)[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}
