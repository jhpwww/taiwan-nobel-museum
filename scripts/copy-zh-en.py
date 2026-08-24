#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
copy-zh-en.py — editorial copy for the 31 lectures, drafted for the site's
audience (high-school and undergraduate students, general public).

Sources used as reference, never quoted verbatim onto the page:
  · the lecture titles from the IPF programme book
  · the 31 導讀 narration scripts (reference only, per the project owner)
  · each laureate's official Nobel Prize citation

Fields per lecture:
  title_zh  — Chinese rendering of the English lecture title (English stays primary)
  hook      — one tempting line; this is what makes someone click
  summary   — 2-3 sentences, no assumed background, no undefined jargon
  tags      — taxonomy keys, see TAGS below

Rewrite freely. Nothing here is generated at build time; it is all reviewable text.
"""

TAGS = {
  "physics-fundamental": ("基礎物理", "Fundamental physics"),
  "physics-applied":     ("應用物理", "Applied physics"),
  "chemistry-molecular": ("分子化學", "Molecular chemistry"),
  "life-science":        ("生命科學", "Life science"),
  "medicine-clinical":   ("臨床醫學", "Medicine & therapy"),
  "economics":           ("經濟學",   "Economics"),
  "peace-society":       ("和平與社會", "Peace & society"),
  "climate-energy":      ("氣候與能源", "Climate & energy"),
  "ai-computation":      ("人工智慧與計算", "AI & computation"),
  "method-discovery":    ("科學方法與發現歷程", "How discovery happens"),
  "ethics-responsibility":("科學倫理與社會責任", "Science & responsibility"),
  "education-career":    ("教育與生涯", "Education & careers"),
}

COPY = {
"geim": dict(
  title_zh="神奇材料",
  hook_zh="一支鉛筆、一捲膠帶，換來一座諾貝爾獎。",
  hook_en="A pencil, a roll of sticky tape, and a Nobel Prize.",
  summary_zh="你摸得到的每一樣東西都有三個維度——但蓋姆偏偏做出了只有一顆原子厚的材料：石墨烯（graphene）。它極強韌、極導電，裡頭的電子跑起來像沒有質量，讓相對論（relativity）可以在實驗桌上被看見。這堂課講的不是更貴的儀器，而是一個愛玩的念頭能走多遠。",
  summary_en="Everything you can touch has three dimensions — but Andre Geim made a material just one atom thick. Graphene is extraordinarily strong, highly conductive, and its electrons behave as if they have no mass, letting you watch relativity on a lab bench. The lecture is less about better machines than about how far a playful idea can travel.",
  tags=["physics-applied","method-discovery"]),

"thooft": dict(
  title_zh="以基礎科學的教育與合作，作為國與國之間的橋樑",
  hook_zh="在一個分裂的世界裡，還有什麼能把人聚在一起？",
  hook_en="In a divided world, what can still bring people together?",
  summary_zh="特胡夫特用一生研究最微小的粒子，卻在這堂課談最大的問題：科學能不能成為國與國之間的橋。對他而言，物理從來不只是粒子，而是一種跨越國界、共用同一套語言的合作方式。",
  summary_en="Gerardus 't Hooft spent his career on the smallest particles in nature, and uses this lecture to ask the largest question: can science be a bridge between nations? For him physics was never only about particles — it is a way of working together in one shared language, across borders.",
  tags=["physics-fundamental","education-career","peace-society"]),

"karman": dict(
  title_zh="永續發展與共享的未來",
  hook_zh="如果人們仍活在戰爭與壓迫之中，綠色的未來還有意義嗎？",
  hook_en="What is a green future worth, if people are still trapped in war?",
  summary_zh="卡曼提醒我們，永續（sustainability）從來不只是碳排放的問題。當戰爭摧毀生活、貧窮把人排除在外、利潤被放在人權之前，一個國家不可能真正成長。她主張的未來，要更乾淨，也要更公平、更能共享。",
  summary_en="Tawakkol Karman argues that sustainability was never only about carbon. No country truly grows while war destroys lives, poverty shuts people out, and profit comes before human rights. The future she describes has to be cleaner — and also fairer, and shared.",
  tags=["peace-society","climate-energy","ethics-responsibility"]),

"kornberg": dict(
  title_zh="疾病的終點？——生物醫學的非凡進展及其對人類的意義",
  hook_zh="有一天，人類會不會真的把疾病終結掉？",
  hook_en="Could humanity actually bring disease to an end?",
  summary_zh="康柏格解開了細胞如何讀取基因、把訊息轉錄出來的分子細節——那是所有生命運作的第一步。從這個基礎出發，他在這堂課談生物醫學（biomedicine）近年的爆炸性進展，以及當醫學真的走到那一步時，人類要面對什麼。",
  summary_en="Roger Kornberg worked out the molecular detail of how a cell reads its genes and copies the message out — the first step in everything a living thing does. From that foundation he looks at the recent explosion of progress in biomedicine, and at what humanity has to face if medicine really does get that far.",
  tags=["life-science","medicine-clinical","ethics-responsibility"]),

"queloz": dict(
  title_zh="科學在建立全球和平議程中的角色",
  hook_zh="發現第一顆系外行星的人，為什麼開始談和平？",
  hook_en="The man who found the first exoplanet — now talking about peace.",
  summary_zh="奎洛茲與同事找到第一顆繞著類太陽恆星運行的系外行星（exoplanet），從此我們知道太陽系並不孤單。在這堂課裡，他把望遠鏡轉回地球，談科學社群如何跨越國界運作，以及這種合作方式能為全球議題帶來什麼。",
  summary_en="Didier Queloz and his colleague found the first planet orbiting another Sun-like star, and with it the knowledge that our solar system is not alone. Here he turns the telescope back towards Earth, on how the scientific community works across borders and what that way of working offers the world's shared problems.",
  tags=["physics-fundamental","peace-society","method-discovery"]),

"murad": dict(
  title_zh="誰能終結全球的衝突相關性暴力？——個人故事的力量與行動者的角色",
  hook_zh="當世界不願意聽，一個人的故事能改變什麼？",
  hook_en="When the world won't listen, what can one person's story change?",
  summary_zh="穆拉德是戰爭中性暴力（conflict-related sexual violence, CRSV）的倖存者，她選擇把自己的經歷說出來，讓一件長期被沉默包圍的罪行被看見。這堂課談的是：個人的證詞如何成為國際行動的起點，而我們每一個人在其中能站在哪裡。",
  summary_en="Nadia Murad survived sexual violence used as a weapon of war, and chose to tell her own story so that a crime long surrounded by silence could be seen. This lecture is about how one person's testimony becomes the starting point for international action — and where the rest of us can stand in it.",
  tags=["peace-society","ethics-responsibility"]),

"pissarides": dict(
  title_zh="AI 與工作和福祉的未來",
  hook_zh="AI 會不會搶走你的工作？他說，沒那麼簡單。",
  hook_en="Will AI take your job? He says it's not that simple.",
  summary_zh="皮薩里德斯研究的是勞動市場（labour market）如何媒合人與工作。他認為 AI 不會拿走每一份工作，而是拿走某些工作裡的某些部分；在判斷、溝通、照顧、臨場決策上，人仍然重要。真正的問題不在技術，而在人們能不能得到轉換跑道所需的訓練。",
  summary_en="Christopher Pissarides studies how labour markets match people to work. His view: AI will not take every job — it will take parts of some jobs, while judgement, communication, care and split-second decisions still need people. The real question is not the technology but whether people get the training to move with it.",
  tags=["economics","ai-computation","education-career"]),

"maskin": dict(
  title_zh="為什麼全球化沒有縮小不平等",
  hook_zh="全球化本來該讓差距變小，為什麼反而變大了？",
  hook_en="Globalization was supposed to shrink the gap. It widened it.",
  summary_zh="今天的全球化不只是買賣，而是跨國分工（global value chains）：一個產品，很多工種，很多技能層級。高技能的工作接上了世界，低技能的沒有；於是經濟成長的同時，差距也一起長大。馬斯金的結論不是停止全球化，而是讓更多人具備坐上這張桌子的能力。",
  summary_en="Globalization today is not just trade but teamwork across countries: one product, many jobs, many skill levels. High-skill work plugs into the world and wins; low-skill work does not. So as the economy grows, the gap grows with it. Eric Maskin's answer is not to stop globalization, but to help more people gain a seat at the table.",
  tags=["economics","education-career"]),

"sudhof": dict(
  title_zh="神經退化性疾病的藥物開發：邁向更便宜、更可持續的治療",
  hook_zh="能治好的藥，如果沒人付得起，算治好了嗎？",
  hook_en="A cure nobody can afford — is it a cure?",
  summary_zh="聚德霍夫解開了神經細胞之間如何在千分之一秒內精準傳遞訊號（synaptic transmission）。這堂課他把焦點放在阿茲海默症（Alzheimer's disease）、帕金森氏症（Parkinson's disease）這類神經退化疾病（neurodegenerative diseases）的用藥困境：不只是要開發得出來，還要開發得便宜、供得起、走得久。",
  summary_en="Thomas Südhof worked out how nerve cells pass signals to each other with millisecond precision. Here he focuses on the hard part of treating neurodegenerative diseases such as Alzheimer's and Parkinson's: not only developing a drug, but developing one that is cheap enough, available enough, and sustainable enough to matter.",
  tags=["life-science","medicine-clinical","ethics-responsibility"]),

"ciechanover": dict(
  title_zh="個人化醫療革命：我們能治好所有疾病嗎？代價又是什麼？",
  hook_zh="一樣的病，一樣的藥，結果卻完全不同。",
  hook_en="Same disease. Same drug. Completely different results.",
  summary_zh="切哈諾沃發現了細胞如何標記並分解不需要的蛋白質（ubiquitin-mediated protein degradation）——這套機制一旦出錯，就可能演變成癌症。他在這堂課談醫學正在離開「一體適用」：兩個人診斷相同，基因與體質卻不同，同一種藥可能有效、可能無效、也可能帶來嚴重副作用。",
  summary_en="Aaron Ciechanover discovered how cells tag unwanted proteins for destruction — a system that, when it goes wrong, can end in cancer. His lecture is about medicine leaving one-size-fits-all behind: two people can share a diagnosis but not their genes, and the same drug may work, miss, or do real harm.",
  tags=["chemistry-molecular","medicine-clinical","ethics-responsibility"]),

"strickland": dict(
  title_zh="為什麼信任科學很重要",
  hook_zh="當科學改了答案，你就不再相信它了嗎？",
  hook_en="When science updates its answer — do you stop trusting it?",
  summary_zh="GPS（全球定位系統）、網路、你手上的筆電，都來自需要很多年才做對的科學。疫情期間，科學第一次在所有人面前即時修正自己，有人把那叫做失敗。史崔克蘭說，那不是失敗，那正是科學在公開場合學習的樣子。",
  summary_en="GPS, the internet, the laptop in front of you — all came from science that took years to get right. During the pandemic, science revised itself in public for the first time, and some people called that failure. Donna Strickland's answer: it wasn't. That is what science learning in real time looks like.",
  tags=["physics-applied","ethics-responsibility","method-discovery"]),

"stiglitz": dict(
  title_zh="通往自由之路：經濟學與美好社會",
  hook_zh="市場愈自由，人就愈自由嗎？",
  hook_en="Does a freer market make a freer person?",
  summary_zh="史迪格里茲長期研究一件事：當買賣雙方掌握的資訊不一樣（information asymmetry），市場會出什麼問題。他在這堂課處理一個更大的題目——「自由」到底是誰的自由，以及一個社會要怎麼安排規則，才能讓自由不只屬於最有力量的人。",
  summary_en="Joseph Stiglitz built his career on what goes wrong in markets when one side knows more than the other. Here he takes on something larger: whose freedom we actually mean when we say the word, and how a society can arrange its rules so that freedom is not reserved for the most powerful.",
  tags=["economics","ethics-responsibility","peace-society"]),

"haroche": dict(
  title_zh="雷射科學與量子光學、電子學及運算的新發展與應用",
  hook_zh="他學會了看一顆光子，而不把它弄壞。",
  hook_en="He learned to look at a single photon without destroying it.",
  summary_zh="要測量一個量子系統，通常就會毀掉它。阿羅什設計出方法，能反覆觀察被困住的單顆光子（photon）而不將它摧毀，讓量子世界的怪異行為第一次被直接看見。這堂課從那裡出發，談雷射（laser）、量子光學（quantum optics）與量子運算（quantum computing）正在往哪裡去。",
  summary_en="Measuring a quantum system usually destroys it. Serge Haroche devised a way to watch a single trapped photon over and over without wrecking it, making the strangeness of the quantum world directly visible for the first time. From there, the lecture looks at where lasers, quantum optics and quantum computing are heading.",
  tags=["physics-fundamental","ai-computation","method-discovery"]),

"schmidt": dict(
  title_zh="科學：人類共通的橋樑",
  hook_zh="宇宙不只在膨脹，而且愈脹愈快——沒有人預料到。",
  hook_en="The universe isn't just expanding. It's speeding up.",
  summary_zh="施密特的團隊測量遙遠的超新星（supernova），本來想知道宇宙膨脹減慢了多少，結果發現它反而在加速。這個沒人預期的答案，打開了暗能量（dark energy）的問題。他以此為例，談科學作為一種全人類共用的方法，能跨過多少界線。",
  summary_en="Brian Schmidt's team measured distant supernovae expecting to find how much the universe's expansion had slowed — and found it speeding up instead. That unwanted answer opened the question of dark energy. He uses it to talk about science as a method the whole of humanity shares, and how many borders it can cross.",
  tags=["physics-fundamental","method-discovery","peace-society"]),

"mayor": dict(
  title_zh="有沒有 B 行星？——人類會移民到系外行星嗎？",
  hook_zh="如果地球壞了，我們真的能搬去別的星球嗎？",
  hook_en="If Earth breaks, can we really move somewhere else?",
  summary_zh="麥耶找到了第一顆繞著類太陽恆星的系外行星（exoplanet），從此我們知道銀河系裡有無數個世界。也正因為他最清楚那些世界有多遠、多不適合居住，他在這堂課給出一個冷靜的答案：沒有 B 行星，地球是我們唯一的家。",
  summary_en="Michel Mayor found the first planet orbiting another Sun-like star, and with it the knowledge that the galaxy holds countless worlds. Precisely because he knows how far away and how hostile those worlds are, his answer here is a sober one: there is no Planet B. Earth is the only home we have.",
  tags=["physics-fundamental","climate-energy","ethics-responsibility"]),

"meldal": dict(
  title_zh="為永續世界而生的化學——萬物皆化學，以及它如何影響我們的選擇",
  hook_zh="如果化學可以更乾淨，地球會不會也更好？",
  hook_en="What if better chemistry meant a better planet?",
  summary_zh="梅爾達爾是「點擊化學」（click chemistry）的奠基者之一：讓分子像扣子一樣快速、乾淨地扣在一起，減少廢棄物、耗能與副反應。這代表更好的製藥方式、更好的新材料，以及真正精準地造出想要的分子。他留下的挑戰很簡單——不是做更多，而是做得更好。",
  summary_en="Morten Meldal is one of the fathers of click chemistry: letting molecules snap together fast and cleanly, with less waste, less energy and fewer side reactions. That means better ways to make drugs, better materials, and real precision in building the molecule you actually want. His challenge is simple — not to make more, but to make better.",
  tags=["chemistry-molecular","climate-energy","method-discovery"]),

"engle": dict(
  title_zh="以金融方法看氣候風險",
  hook_zh="氣候變遷，可能已經在你的退休金裡了。",
  hook_en="Climate change may already be inside your pension fund.",
  summary_zh="恩格爾發明了衡量金融市場「波動會群聚」（volatility clustering）的方法，成為風險管理的基礎工具。他把同一套思路轉向氣候：如果乾旱、洪水與政策轉向都會衝擊資產價格，那麼氣候風險就是財務風險，而且是現在就該定價的風險。",
  summary_en="Robert Engle invented the method for measuring how financial volatility clusters, now a basic tool of risk management. He turns the same thinking on the climate: if droughts, floods and policy shifts move asset prices, then climate risk is financial risk — and it is a risk to be priced now, not later.",
  tags=["economics","climate-energy"]),

"roberts": dict(
  title_zh="你為什麼應該喜歡基因改造食品",
  hook_zh="一位諾貝爾獎得主，替基改作物辯護。",
  hook_en="A Nobel laureate makes the case for GMOs.",
  summary_zh="羅伯茨發現基因並不是一段連續的文字，中間夾著必須被剪掉的片段（introns，內含子）——這個發現改寫了我們對基因如何運作的理解。在這堂課，他直接處理一個爭議話題：他認為對基改作物的恐懼，正在讓最需要糧食的人付出代價。",
  summary_en="Richard Roberts discovered that a gene is not one continuous piece of text but is interrupted by stretches that have to be cut out — a finding that rewrote how we understand genes. Here he takes on a genuinely contested subject, arguing that fear of genetically modified crops is costing the people who need food most.",
  tags=["life-science","ethics-responsibility","climate-energy"]),

"mbmoser": dict(
  title_zh="大腦的導航與記憶系統，及其與阿茲海默症的關聯",
  hook_zh="你的大腦裡，有一套自己的 GPS。",
  hook_en="Your brain has its own GPS.",
  summary_zh="在大腦的內嗅皮質（entorhinal cortex）裡，有一群神經細胞會以規律的網格形式放電，幫你知道自己在哪裡、要往哪裡去，也把空間和記憶連在一起。莫瑟指出，這套系統在阿茲海默症的早期就會受損——所以失去的不只是方向感，還有你記得的那個世界。",
  summary_en="Deep in the brain's entorhinal cortex, certain neurons fire in a regular grid, helping you know where you are and where you are going, and tying space to memory. May-Britt Moser shows that this system is damaged early in Alzheimer's disease — so what starts to go is not only your sense of direction, but the world you remember.",
  tags=["life-science","medicine-clinical"]),

"nurse": dict(
  title_zh="生命是什麼？",
  hook_zh="一個看似幼稚、其實沒人答得完整的問題。",
  hook_en="A question that sounds childish, and nobody has fully answered.",
  summary_zh="納斯找到了控制細胞週期（cell cycle）何時推進的關鍵開關——這套機制從酵母菌到人類幾乎完全相同，也正是癌症研究的核心。他用一生累積的答案，回到那個最原始的問題：到底什麼才算活著？",
  summary_en="Paul Nurse found the master switch that controls when a cell divides — a mechanism almost identical from yeast to humans, and central to cancer research. With a career's worth of answers behind him, he returns to the most basic question of all: what does it actually mean to be alive?",
  tags=["life-science","method-discovery"]),

"winter": dict(
  title_zh="抗體革命",
  hook_zh="讓身體自己的武器，變成處方藥。",
  hook_en="Turning the body's own weapon into a prescription.",
  summary_zh="溫特找到辦法，讓實驗室能像演化一樣（phage display，噬菌體展示），一輪一輪篩選出愈來愈精準的抗體。今天許多治療癌症與自體免疫疾病（autoimmune diseases）的藥物，都是這樣造出來的。這堂課講的就是這場從免疫學走進藥局的革命。",
  summary_en="Gregory Winter found a way to let a laboratory run evolution itself, selecting round after round for ever more precise antibodies. Many of today's cancer and autoimmune drugs are made exactly this way. This lecture is that revolution — from immunology to the pharmacy shelf.",
  tags=["chemistry-molecular","medicine-clinical","method-discovery"]),

"mcdonald": dict(
  title_zh="回答關於宇宙及其演化的根本問題",
  hook_zh="兩公里深的地底礦坑，是為了看見太陽。",
  hook_en="Two kilometres underground — to see the Sun.",
  summary_zh="太陽送來的微中子（neutrino），我們只數到預期的三分之一，這個謎題困擾了物理學家三十年。麥克唐納在地底深處的實驗證明：它們沒有消失，只是變身了——而這代表微中子有質量，粒子物理的標準模型（Standard Model）並不完整。",
  summary_en="We were counting only a third of the neutrinos the Sun should send us, a puzzle that troubled physicists for thirty years. Arthur McDonald's experiment, deep underground, showed they had not vanished but changed identity — which means neutrinos have mass, and the Standard Model of particle physics is incomplete.",
  tags=["physics-fundamental","method-discovery"]),

"noyori": dict(
  title_zh="化學是創造價值的科學",
  hook_zh="同一個分子的左手與右手，一個治病，一個致命。",
  hook_en="Left hand or right hand: one molecule heals, its mirror kills.",
  summary_zh="很多分子有兩種互為鏡像的形式，就像左手與右手——在人體內，往往只有一種有用，另一種可能有害。野依良治開發出不對稱催化（asymmetric catalysis）的方法，能選擇性地只造出想要的那一隻手。他認為化學的價值，就在於此。",
  summary_en="Many molecules come in two mirror-image forms, like a left and a right hand — and inside the body often only one is useful, while the other can do harm. Ryoji Noyori developed catalysts that build only the hand you want. That, he argues, is where chemistry creates its value.",
  tags=["chemistry-molecular","method-discovery"]),

"emoser": dict(
  title_zh="大腦的 GPS：我們如何知道自己在哪裡",
  hook_zh="你怎麼知道，你現在正站在哪裡？",
  hook_en="How do you know where you're standing right now?",
  summary_zh="莫瑟與研究團隊發現了「網格細胞」（grid cells）：它們在大腦裡鋪出一張規律的座標網，讓你在移動時始終知道自己的位置。這是大腦替空間建立地圖的方式，也是記憶得以附著其上的骨架。",
  summary_en="Edvard Moser and his colleagues discovered grid cells: neurons that lay down a regular coordinate mesh inside the brain so that you always know where you are as you move. It is how the brain maps space — and the scaffold that memory hangs on.",
  tags=["life-science","method-discovery"]),

"rice": dict(
  title_zh="全球傳染病：勝利與挑戰",
  hook_zh="一種曾經無藥可醫的病毒，現在幾週就能治好。",
  hook_en="A virus with no cure — now treatable in a few weeks.",
  summary_zh="C 型肝炎（hepatitis C）曾經在全球感染數千萬人，最後導致肝硬化（cirrhosis）與肝癌。萊斯的研究讓這個病毒第一次能在實驗室裡被完整培養，直接打開了治癒藥物的大門。他以這個成功為起點，談人類面對下一場傳染病時還缺什麼。",
  summary_en="Hepatitis C infected tens of millions worldwide and ended in cirrhosis and liver cancer. Charles Rice's work made it possible to grow the virus in the laboratory for the first time, which opened the door directly onto a cure. He takes that success as a starting point for what humanity still lacks facing the next outbreak.",
  tags=["life-science","medicine-clinical"]),

"wuthrich": dict(
  title_zh="生命的分子、AI 與人類健康",
  hook_zh="看不見的分子，要怎麼知道它長什麼樣子？",
  hook_en="How do you see the shape of something you can never see?",
  summary_zh="蛋白質的形狀決定它的功能，但它太小，看不見。維特里希開發出用核磁共振（nuclear magnetic resonance, NMR）在溶液中解出蛋白質三維結構的方法——也就是在接近生命實際狀態的環境下觀察它。這堂課談這條路如何一路走到今天的 AI 結構預測（protein structure prediction）。",
  summary_en="A protein's shape decides what it does, but it is far too small to see. Kurt Wüthrich developed a way to work out a protein's three-dimensional structure in solution using nuclear magnetic resonance — that is, close to the state life actually keeps it in. The lecture follows that road all the way to today's AI structure prediction.",
  tags=["chemistry-molecular","ai-computation","method-discovery"]),

"semenza": dict(
  title_zh="氧氣、二氧化碳，與地球上的永續生命",
  hook_zh="你的身體每一刻都在數氧氣，而它知道該怎麼辦。",
  hook_en="Your body counts its oxygen every moment — and knows what to do.",
  summary_zh="塞門薩找到了細胞感測氧氣濃度的分子開關（HIF，缺氧誘導因子）：缺氧時，它會啟動一整套反應，例如長出新血管。這套機制關係到貧血、心血管疾病，也被腫瘤拿來為自己開路。他從這裡談起氧氣、二氧化碳與地球生命的長期平衡。",
  summary_en="Gregg Semenza found the molecular switch by which a cell senses how much oxygen it has: when oxygen runs short, it triggers a whole programme of responses, such as growing new blood vessels. The same system underlies anaemia and heart disease — and tumours hijack it to feed themselves. From there he turns to oxygen, carbon dioxide and the long-term balance of life on Earth.",
  tags=["life-science","medicine-clinical","climate-energy"]),

"roth": dict(
  title_zh="市場、市場設計與醫療",
  hook_zh="有些東西不能買賣，但還是需要被好好分配。",
  hook_en="Some things can't be bought — but still must be allocated well.",
  summary_zh="腎臟不能買賣，學校名額也不該標價，但這些配對還是得做，而且做得好不好會決定有沒有人活下來。羅斯把經濟學變成一種設計工作（market design，市場設計）：重新設計規則本身，讓捐贈者與病患能配對成功。這套方法已經真的在救人。",
  summary_en="You cannot buy a kidney, and school places should not go to the highest bidder — but these matches still have to be made, and how well they are made decides whether people live. Alvin Roth turned economics into a design discipline: redesigning the rules themselves so that donors and patients can be matched. It is already saving lives.",
  tags=["economics","medicine-clinical","ethics-responsibility"]),

"kobilka": dict(
  title_zh="藥物開發的新時代",
  hook_zh="你吃的藥，有三分之一都打在同一種標靶上。",
  hook_en="A third of all medicines aim at the same kind of target.",
  summary_zh="細胞表面有一群受體（G 蛋白偶合受體，G protein-coupled receptors, GPCR），負責把外界的訊號傳進細胞裡；市面上大約三分之一的藥物都作用在它們身上。科比爾卡拍下了這些受體在傳遞訊號那一瞬間的立體結構，讓藥物設計從碰運氣，變成看著標靶下手。",
  summary_en="A family of receptors sits on the cell surface, carrying signals from the outside world in — and roughly a third of all drugs on the market act on them. Brian Kobilka captured the three-dimensional structure of these receptors at the instant they pass a signal, turning drug design from guesswork into aiming at a target you can see.",
  tags=["chemistry-molecular","medicine-clinical","method-discovery"]),

"kajita": dict(
  title_zh="科學對建立和平的重要性",
  hook_zh="每一秒，都有數兆個微中子穿過你的身體。",
  hook_en="Trillions of neutrinos pass through your body every second.",
  summary_zh="梶田隆章證明微中子會在飛行途中改變身分（neutrino oscillation，微中子振盪）——這代表它們有質量，而粒子物理原本認為沒有。這項發現需要跨國、跨世代的合作才能完成，他也因此在這堂課談科學合作本身，如何成為建立和平的一種方式。",
  summary_en="Takaaki Kajita showed that neutrinos change identity in mid-flight — which means they have mass, where particle physics had assumed none. The discovery took collaboration across nations and across generations, and that is what he speaks about here: scientific cooperation itself as a way of building peace.",
  tags=["physics-fundamental","peace-society","method-discovery"]),

"frank": dict(
  title_zh="冷凍電子顯微鏡：分子醫學與藥物設計的新基礎",
  hook_zh="把分子凍住，就能看清它的長相。",
  hook_en="Freeze a molecule, and you can finally see its face.",
  summary_zh="法蘭克發展出影像處理方法，把成千上萬張模糊的電子顯微鏡（electron microscope）照片，組合成生物分子清晰的立體結構。加上急速冷凍技術，也就是冷凍電子顯微鏡（cryo-electron microscopy, cryo-EM），我們第一次能看見蛋白質在接近自然狀態下的樣子——這已經成為現代藥物設計的基礎。",
  summary_en="Joachim Frank developed the image processing that turns thousands of blurry electron-microscope pictures into one sharp three-dimensional structure of a biological molecule. Combined with flash-freezing, it let us see proteins close to their natural state for the first time — and it is now a foundation of modern drug design.",
  tags=["chemistry-molecular","medicine-clinical","method-discovery"]),
}
