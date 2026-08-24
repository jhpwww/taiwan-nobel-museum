#!/usr/bin/env python3
"""
check-links.py — verify every external link the built site actually contains.

  python3 scripts/check-links.py [dist-dir]

A HEAD request is not enough: it misses dead DNS, soft 404s and redirects to a
home page. This does a real GET, follows redirects, and reports the final URL
and page title so a wrong-but-200 destination is visible.

Run it before shipping any change that touches outbound links.
"""
import concurrent.futures as cf, html, pathlib, re, sys, urllib.error, urllib.request

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
urls = set()
for f in root.rglob("*.html"):
    src = f.read_text(encoding="utf-8")
    # preconnect / dns-prefetch point at bare origins that legitimately 404 on
    # a GET; they are connection hints, not destinations
    hints = set(re.findall(r'<link[^>]+rel="(?:preconnect|dns-prefetch)"[^>]*href="([^"]+)"', src))
    hints |= set(re.findall(r'<link[^>]+href="([^"]+)"[^>]*rel="(?:preconnect|dns-prefetch)"', src))
    for m in re.finditer(r'href="(https?://[^"]+)"', src):
        u = html.unescape(m.group(1))
        if u not in hints:
            urls.add(u)

UA = {"User-Agent": "Mozilla/5.0 (compatible; link-check/1.0)"}

def probe(u):
    try:
        req = urllib.request.Request(u, headers=UA)
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read(90_000).decode("utf-8", "replace")
            t = re.search(r"<title>(.*?)</title>", body, re.S)
            title = html.unescape(t.group(1)).strip()[:64] if t else ""
            return u, r.status, r.geturl(), title
    except urllib.error.HTTPError as e:
        return u, e.code, u, ""
    except Exception as e:
        return u, f"ERR {type(e).__name__}", u, str(e)[:60]

bad = []
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for u, code, final, title in sorted(ex.map(probe, sorted(urls))):
        redirected = final.rstrip("/") != u.rstrip("/")
        ok = code == 200
        # a 200 that landed somewhere else, or on a "page not found" title
        suspect = ok and (re.search(r"not found|404", title, re.I) or
                          (redirected and final.rstrip("/").count("/") <= 2))
        flag = "OK " if ok and not suspect else "BAD"
        if flag == "BAD":
            bad.append((u, code, final, title))
        print(f"{flag} {str(code):>3}  {u}")
        if redirected:
            print(f"          -> {final}")
        if title:
            print(f"          {title}")

print(f"\n{len(urls)} external links checked, {len(bad)} need attention")
for u, code, final, title in bad:
    print(f"  {code}  {u}   {title}")
sys.exit(1 if bad else 0)
