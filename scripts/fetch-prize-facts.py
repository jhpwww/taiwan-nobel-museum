#!/usr/bin/env python3
"""
fetch-prize-facts.py — pull per-category facts from the official Nobel Prize API.

  python3 scripts/fetch-prize-facts.py   ->  data/prize-facts.json

Run this once a year, after the October announcements. The numbers are stamped
with the date they were fetched so the page can say "as of". Nothing is fetched
at build time — the site stays fully static.

API: https://api.nobelprize.org/2.1/  (public, no key)
"""
import json, pathlib, urllib.request, urllib.parse, datetime, sys, time

API = "https://api.nobelprize.org/2.1/"
CATS = {"physics": "phy", "chemistry": "che", "medicine": "med",
        "literature": "lit", "peace": "pea", "economics": "eco"}

B = "https://www.nobelprize.org/prizes/"
HUB_URL = {
    "physics": B + "physics/", "chemistry": B + "chemistry/", "medicine": B + "medicine/",
    "literature": B + "literature/", "peace": B + "peace/", "economics": B + "economic-sciences/",
}
LIST_URL = {
    "physics":    B + "lists/all-nobel-prizes-in-physics/",
    "chemistry":  B + "lists/all-nobel-prizes-in-chemistry/",
    "medicine":   B + "lists/all-nobel-prizes-in-physiology-or-medicine/",
    "literature": B + "lists/all-nobel-prizes-in-literature/",
    "peace":      B + "lists/all-nobel-peace-prizes/",
    "economics":  B + "lists/all-prizes-in-economic-sciences/",
}
FACTS_URL = {
    "physics":    B + "facts/facts-on-the-nobel-prize-in-physics/",
    "chemistry":  B + "facts/facts-on-the-nobel-prize-in-chemistry/",
    "medicine":   B + "facts/facts-on-the-nobel-prize-in-physiology-or-medicine/",
    "literature": B + "facts/facts-on-the-nobel-prize-in-literature/",
    "peace":      B + "facts/facts-on-the-nobel-peace-prize/",
    "economics":  B + "facts/facts-on-the-prize-in-economic-sciences/",
}

def get(path, **params):
    u = API + path + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(u, headers={"User-Agent": "taiwan-nobel-museum/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

out = {}
for key, code in CATS.items():
    prizes = get("nobelPrizes", nobelPrizeCategory=code, limit=200, sort="asc")["nobelPrizes"]
    awarded = [p for p in prizes if p.get("laureates")]
    not_awarded = [p["awardYear"] for p in prizes if not p.get("laureates")]
    laureates = sum(len(p.get("laureates", [])) for p in awarded)

    women = get("laureates", nobelPrizeCategory=code, gender="female", limit=1)["meta"]["count"]

    years = [int(p["awardYear"]) for p in prizes]
    out[key] = {
        "code": code,
        "first_year": min(years),
        "latest_year": max(int(p["awardYear"]) for p in awarded),
        "prizes_awarded": len(awarded),
        "laureates": laureates,
        "women_laureates": women,
        "years_not_awarded": len(not_awarded),
        # Peace and Economic Sciences do not follow the "…-nobel-prize-in-X" pattern;
        # every URL below was checked with a live request, so do not "tidy" them.
        "links": {"all": LIST_URL[key], "facts": FACTS_URL[key], "hub": HUB_URL[key]},
    }
    print(f"{key:<11} {out[key]['prizes_awarded']:>3} prizes  "
          f"{out[key]['laureates']:>3} laureates  {women:>2} women  "
          f"{out[key]['years_not_awarded']:>2} years not awarded  since {out[key]['first_year']}")
    time.sleep(0.3)

doc = {"fetched": datetime.date.today().isoformat(), "source": "https://api.nobelprize.org/2.1/", "categories": out}
p = pathlib.Path(__file__).resolve().parent.parent / "data" / "prize-facts.json"
p.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"\nwrote {p.name}  (as of {doc['fetched']})")
