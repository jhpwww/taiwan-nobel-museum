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
  intro_zh="諾貝爾物理學獎頒給「對人類帶來最大貢獻」的物理發現或發明。從 X 光（X-ray）、放射性（radioactivity），到量子力學（quantum mechanics）、宇宙加速膨脹與重力波（gravitational waves）——把歷屆名單讀完一遍，差不多就讀完了一部現代物理簡史。",
  intro_en="The Nobel Prize in Physics goes to the discovery or invention that has conferred the greatest benefit on humankind. From X-rays and radioactivity to quantum mechanics, the accelerating universe and gravitational waves — read the list end to end and you have read a short history of modern physics.",
  history_zh="1901 年首屆頒給發現 X 射線的倫琴（Wilhelm Röntgen）。此後曾六度從缺，大多落在兩次世界大戰期間。",
  history_en="First awarded in 1901 to Wilhelm Röntgen for the discovery of X-rays. It has been withheld six times since, mostly during the two world wars."),

"chemistry": dict(
  intro_zh="化學獎表彰化學領域最重要的發現或改良。它的範圍比課本上的「化學」寬得多：週期表（periodic table）上的新元素、塑膠與藥物的合成，一直到解出生命分子的立體結構。",
  intro_en="The Chemistry prize recognises the most important discovery or improvement in chemistry. Its reach is far wider than the school subject — new elements on the periodic table, the synthesis of plastics and medicines, and working out the three-dimensional shapes of the molecules of life.",
  history_zh="1901 年首屆頒給研究化學動力學（chemical dynamics）與滲透壓（osmotic pressure）的范特荷夫（Jacobus van 't Hoff）。由於生命科學有很大一部分也是化學，這個獎常常頒給生物學家——那是它一場行之有年、也頗為和氣的爭論。",
  history_en="First awarded in 1901 to Jacobus van 't Hoff for chemical dynamics and osmotic pressure. Because so much of life science is chemistry, the prize often goes to biologists — a long-running and fairly good-natured argument."),

"medicine": dict(
  intro_zh="這個獎表彰生理學或醫學上的重大發現。它記錄了人類如何一步一步看懂自己的身體：從細菌與抗生素（antibiotics）、DNA 的雙螺旋（double helix），到免疫系統（immune system）的運作與大腦如何為空間繪製地圖。",
  intro_en="This prize honours a major discovery in physiology or medicine. It records how humanity came to understand its own body, step by step — from bacteria and antibiotics to the double helix, the workings of the immune system, and how the brain maps space.",
  history_zh="1901 年首屆頒給以血清療法（serum therapy）對抗白喉（diphtheria）的貝林（Emil von Behring）。獎項名稱裡「生理學或醫學」（Physiology or Medicine）的並列是諾貝爾遺囑的原話，所以基礎研究與臨床治療都算數。",
  history_en="First awarded in 1901 to Emil von Behring for serum therapy against diphtheria. The pairing \"physiology or medicine\" is Nobel's own wording, which is why both basic research and clinical treatment qualify."),

"literature": dict(
  intro_zh="文學獎頒給「在文學領域創作出具理想傾向之最傑出作品」（the most outstanding work in an idealistic direction）的作家。它是六個獎裡唯一表彰一整個創作生涯、而不是單一發現的獎——這也是每年最難預測結果的一個。",
  intro_en="The Literature prize goes to the author of \"the most outstanding work in an idealistic direction.\" It is the only one of the six that honours a whole body of work rather than a single discovery — which is exactly why it is the hardest to predict.",
  history_zh="1901 年首屆頒給法國詩人蘇利‧普魯東（Sully Prudhomme）。得主由瑞典學院（Svenska Akademien）的十八位院士選出，提名紀錄保密五十年才會公開。",
  history_en="First awarded in 1901 to the French poet Sully Prudhomme. Laureates are chosen by the eighteen members of the Swedish Academy, and the nomination records stay sealed for fifty years."),

"peace": dict(
  intro_zh="和平獎頒給為促進國家之間的友好、裁減軍備或推動和平會議（peace congresses）付出最多努力的人或組織。它是六個獎中唯一由挪威諾貝爾委員會（Norwegian Nobel Committee）頒發的，也是唯一可以頒給一個組織、而不只是個人的獎。",
  intro_en="The Peace Prize goes to whoever has done the most for fraternity between nations, for the reduction of standing armies, and for the holding of peace congresses. It is the only one of the six awarded by a Norwegian committee, and the only one that can go to an organisation rather than a person.",
  history_zh="1901 年首屆由紅十字會（Red Cross）創辦人杜南（Henry Dunant）與和平運動者帕西（Frédéric Passy）共同獲得。它從缺的次數是六個獎中最多的——因為總有些年份，實在找不到可以頒的人。",
  history_en="First shared in 1901 by Red Cross founder Henry Dunant and the peace campaigner Frédéric Passy. It has been withheld more often than any of the others — there were years when there was simply no one to give it to."),

"economics": dict(
  intro_zh="它的全名是「瑞典中央銀行紀念阿佛烈‧諾貝爾經濟學獎」（Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel）。這個獎並不在諾貝爾的遺囑裡，而是瑞典中央銀行（Sveriges Riksbank）在 1968 年慶祝成立三百週年時設立的；不過評選工作同樣交給瑞典皇家科學院（Kungliga Vetenskapsakademien），和物理獎、化學獎一樣。",
  intro_en="Its full name is the Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel. It was not in Nobel's will — Sweden's central bank established it in 1968 for its own 300th anniversary. The Royal Swedish Academy of Sciences selects it all the same, just as it does for physics and chemistry.",
  history_zh="1969 年首屆由弗里希（Ragnar Frisch）與丁伯根（Jan Tinbergen）共同獲得，表彰他們建立分析經濟過程的動態模型（dynamic models）。它是六個獎中最年輕的一個，而且從未從缺。",
  history_en="First shared in 1969 by Ragnar Frisch and Jan Tinbergen for dynamic models of economic processes. It is the youngest of the six — and the only one never to have been withheld."),
}

# Shown in every gallery, after the category's own official links.
SHARED_LINKS = [
    dict(url="https://educational.nobelprize.org/",
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
