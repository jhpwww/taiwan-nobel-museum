#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
copy-galleries.py — editorial material for each gallery.

Written for the site's audience: high-school and undergraduate students and the
general public. Facts here are the kind that do not change; the counted numbers
live in data/prize-facts.json and come from the official Nobel API.

Rewrite freely, then run: python3 scripts/build-catalog.py
"""

GALLERIES = {
"physics": dict(
  intro_zh="諾貝爾物理學獎表彰「對人類帶來最大貢獻」的物理發現或發明。名單起自 X 光（X-ray）與放射性（radioactivity），經過量子力學（quantum mechanics），延伸至宇宙加速膨脹與重力波（gravitational waves）。一個世紀的物理學，大致都在其中。",
  intro_en="The Nobel Prize in Physics recognises the discovery or invention of greatest benefit to humankind. The list opens with X-rays and radioactivity, passes through quantum mechanics, and reaches the accelerating universe and gravitational waves. A century of physics is more or less contained in it.",
  history_zh="1901 年首屆頒給發現 X 射線的倫琴（Wilhelm Röntgen）。此後六度從缺，多在兩次世界大戰期間。",
  history_en="First awarded in 1901 to Wilhelm Röntgen, for the discovery of X-rays. It has since been withheld six times, mostly during the two world wars.",
),

"chemistry": dict(
  intro_zh="化學獎表彰化學領域最重要的發現或改良。其範圍遠比課堂上的化學寬廣：週期表（periodic table）上的新元素、塑膠與藥物的合成，以及生命分子立體結構的解析。",
  intro_en="The Chemistry prize recognises the most important discovery or improvement in chemistry. Its reach extends well beyond the school subject: new elements on the periodic table, the synthesis of plastics and medicines, and the three-dimensional structures of the molecules of life.",
  history_zh="1901 年首屆頒給范特荷夫（Jacobus van 't Hoff），表彰其化學動力學（chemical dynamics）與滲透壓（osmotic pressure）研究。生命科學有相當部分屬於化學，這個獎也時常頒給生物學家。",
  history_en="First awarded in 1901 to Jacobus van 't Hoff, for chemical dynamics and osmotic pressure. Much of life science is chemistry, and the prize has often gone to biologists.",
),

"medicine": dict(
  intro_zh="生理學或醫學獎表彰在生命與疾病上的重大發現。歷屆名單記錄了人體如何逐步被理解：細菌與抗生素（antibiotics）、DNA 的雙螺旋（double helix）、免疫系統（immune system），以及大腦為空間繪製地圖的方式。",
  intro_en="The prize in Physiology or Medicine recognises a major discovery in life and disease. Its list records how the body came to be understood: bacteria and antibiotics, the double helix, the immune system, and the way the brain maps space.",
  history_zh="1901 年首屆頒給貝林（Emil von Behring），表彰其以血清療法（serum therapy）對抗白喉（diphtheria）。「生理學或醫學」（Physiology or Medicine）的並列出自諾貝爾遺囑，基礎研究與臨床治療因此同列。",
  history_en="First awarded in 1901 to Emil von Behring, for serum therapy against diphtheria. The pairing “physiology or medicine” is Nobel’s own wording, which is why laboratory research and clinical treatment both belong here.",
),

"literature": dict(
  intro_zh="文學獎頒給在文學領域寫出「具理想傾向之最傑出作品」（the most outstanding work in an idealistic direction）的作家。六個獎項之中，只有這一項表彰的是一整個創作生涯，而非單一成果。",
  intro_en="The Literature prize goes to the author of “the most outstanding work in an idealistic direction”. Alone among the six, it honours a body of work rather than a single result.",
  history_zh="1901 年首屆頒給法國詩人蘇利‧普魯東（Sully Prudhomme）。得主由瑞典學院（Svenska Akademien）十八位院士選出，提名紀錄封存五十年。",
  history_en="First awarded in 1901 to the French poet Sully Prudhomme. Laureates are chosen by the eighteen members of the Swedish Academy, and the nomination records stay sealed for fifty years.",
),

"peace": dict(
  intro_zh="和平獎頒給為國與國之間的情誼、裁減軍備，以及推動和平會議（peace congresses）貢獻最多的個人或組織。六個獎項之中，只有這一項由挪威諾貝爾委員會（Norwegian Nobel Committee）評選，也只有這一項可以頒給組織。",
  intro_en="The Peace Prize goes to whoever has done most for fraternity between nations, the reduction of standing armies, and the holding of peace congresses. Alone among the six it is decided by a Norwegian committee, and alone among the six it may go to an organisation.",
  history_zh="1901 年首屆由紅十字會（Red Cross）創辦人杜南（Henry Dunant）與和平運動者帕西（Frédéric Passy）共同獲得。它從缺的年份多於其他五項。",
  history_en="First shared in 1901 by Red Cross founder Henry Dunant and the peace campaigner Frédéric Passy. It has been withheld in more years than any of the other five.",
),

"economics": dict(
  intro_zh="全名為「瑞典中央銀行紀念阿佛烈‧諾貝爾經濟學獎」（Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel）。它不在諾貝爾的遺囑之列，而是瑞典中央銀行（Sveriges Riksbank）於 1968 年成立三百週年時設置；評選仍由瑞典皇家科學院（Kungliga Vetenskapsakademien）負責，與物理、化學兩獎相同。",
  intro_en="Its full name is the Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel. It was not among the prizes in Nobel’s will; Sweden’s central bank established it in 1968, on its three-hundredth anniversary. Selection rests with the Royal Swedish Academy of Sciences, as it does for physics and chemistry.",
  history_zh="1969 年首屆由弗里希（Ragnar Frisch）與丁伯根（Jan Tinbergen）共同獲得，表彰其分析經濟過程的動態模型（dynamic models）。六個獎項中它最年輕，也從未從缺。",
  history_en="First shared in 1969 by Ragnar Frisch and Jan Tinbergen, for dynamic models of economic processes. It is the youngest of the six, and the only one never withheld.",
),
}

# Shown in every gallery, after the category's own official links.
SHARED_LINKS = [
    dict(url="https://www.nobelprize.org/educational/",
         zh="諾貝爾獎教育資源", en="Nobel Prize Education",
         dzh="官方為學生設計的互動教材、遊戲與課程", den="Games, teaching material and lessons made for students"),
    dict(url="https://www.nobelprize.org/prizes/facts/nobel-prize-facts/",
         zh="諾貝爾獎總覽統計", en="Nobel Prize facts",
         dzh="所有獎項的整體統計：最年輕、最年長、得過兩次的人", den="Across all prizes: youngest, oldest, and those who won twice"),
]

LINK_LABELS = {
    "hub":   dict(zh="官方獎項專頁", en="Official prize page",
                  dzh="諾貝爾基金會的類別首頁", den="This category's home on nobelprize.org"),
    "all":   dict(zh="歷屆得主完整名單", en="All laureates",
                  dzh="從 1901 年至今，逐年可查", den="Every year since 1901, searchable"),
    "facts": dict(zh="本獎項統計資料", en="Facts and figures",
                  dzh="官方整理的得獎統計與紀錄", den="Official statistics and records for this prize"),
}

STAT_LABELS = {
    "first_year":        dict(zh="首次頒發",   en="First awarded"),
    "prizes_awarded":    dict(zh="已頒發次數", en="Prizes awarded"),
    "laureates":         dict(zh="得主人數",   en="Laureates"),
    "women_laureates":   dict(zh="女性得主",   en="Women laureates"),
    "years_not_awarded": dict(zh="從缺年數",   en="Years not awarded"),
}
