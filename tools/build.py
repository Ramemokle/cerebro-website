#!/usr/bin/env python3
"""Build the published site from the bilingual sources in _src/.

Each _src page holds both languages (<span lang="ka"> / <span lang="en">).
This script writes one page per language:
  Georgian  -> /<path>/index.html      (e.g. /services/google-ads/)
  English   -> /en/<path>/index.html   (e.g. /en/services/google-ads/)
plus redirect stubs for the old *.html URLs, sitemap.xml and robots.txt.

Edit pages in _src/, then run:  python3 tools/build.py
"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_src')
SITE = 'https://cerebro.ge'
OG_IMAGE = SITE + '/assets/cerebro-logo-white.png'
PHONE = '+995 599 74 28 00'

# source file -> (path without language prefix, svc icon key, meta per language)
PAGES = {
  'index.html': ('', None, {
    'ka': ('მარკეტინგული სააგენტო თბილისში · Cerebro',
           'Cerebro — მარკეტინგული სააგენტო თბილისში: რეკლამა Facebook-სა და Google-ში, სოციალური მედია მარკეტინგი, უძრავი ქონების გაყიდვები და ბრენდინგი.'),
    'en': ('Marketing Agency in Tbilisi · Cerebro',
           'Cerebro is a marketing agency in Tbilisi: Meta and Google ads, social media marketing, real-estate sales and branding, all in one media plan.')}),
  'services.html': ('services/', None, {
    'ka': ('მარკეტინგული მომსახურება · Cerebro',
           'მარკეტინგული მომსახურება ერთ გუნდთან: სოციალური მედია, Google Ads, უძრავი ქონების მარკეტინგი, კონტენტი, ბრენდინგი და ანალიტიკა.'),
    'en': ('Marketing Services in Tbilisi · Cerebro',
           'Marketing services from one team: social media, Google Ads, real-estate marketing, content, branding and analytics, in one media plan and one report.')}),
  'service-social-media.html': ('services/social-media-marketing/', 'social-media', {
    'ka': ('სოციალური მედია მარკეტინგი (SMM) · Cerebro',
           'სოციალური მედია მარკეტინგი თბილისში: Facebook და Instagram რეკლამა, საგანმანათლებლო და გასართობი კონტენტი და კამპანიები მთელ Funnel-ზე.'),
    'en': ('Social Media Marketing (SMM) in Tbilisi · Cerebro',
           'Social media marketing in Tbilisi: Facebook and Instagram ads, educational and entertaining content, and campaigns across the full funnel.')}),
  'service-paid-ads.html': ('services/google-ads/', 'paid-ads', {
    'ka': ('Google Ads — რეკლამა გუგლში · Cerebro',
           'Google Ads რეკლამა: Search, Performance Max და YouTube. მიაღწიეთ ადამიანებს, რომლებიც უკვე გეძებენ — სტრატეგია, გამართვა და ოპტიმიზაცია.'),
    'en': ('Google Ads Management in Tbilisi · Cerebro',
           'Google Ads management: Search, Performance Max and YouTube. Reach people already searching for you, with strategy, setup and optimization.')}),
  'service-real-estate.html': ('services/real-estate-marketing/', 'real-estate', {
    'ka': ('უძრავი ქონების მარკეტინგი · Cerebro',
           'უძრავი ქონების მარკეტინგი დეველოპერებისთვის: პროექტის გაშვება, ლიდების გენერაცია და CRM-თან კავშირი. 22 გაყიდული პროექტი.'),
    'en': ('Real Estate Marketing for Developers · Cerebro',
           'Real estate marketing for developers in Georgia: project launches, lead generation and CRM hand-off. 22 projects sold.')}),
  'service-branding.html': ('services/branding/', 'branding', {
    'ka': ('ბრენდინგი და ლოგოს დამზადება · Cerebro',
           'ბრენდინგი თბილისში: ბრენდის სტრატეგია, სახელი, ლოგოს დამზადება, ფერები და ტონი — ვიზუალური იდენტობა, რომელიც ბაზარზე გამოირჩევა.'),
    'en': ('Branding Agency in Tbilisi · Cerebro',
           'Branding in Tbilisi: brand strategy, naming, logo design, colors and tone of voice, for a visual identity that stands out in its market.')}),
  'service-content.html': ('services/content-creation/', 'content', {
    'ka': ('სარეკლამო ვიდეო და კონტენტი · Cerebro',
           'სარეკლამო ვიდეოები, რენდერები, კარუსელები და ლენდინგები, რომლებიც კონვერსიისთვისაა შექმნილი. კონტენტი და კრეატივი ერთ გუნდთან.'),
    'en': ('Ad Video and Content Creation · Cerebro',
           'Ad videos, renders, carousels and landing pages built to convert. Content and creative from the same team that runs your ads.')}),
  'service-analytics.html': ('services/analytics/', 'analytics', {
    'ka': ('მარკეტინგული ანალიტიკა და რეპორტინგი · Cerebro',
           'მარკეტინგული ანალიტიკა: Google Analytics, Meta პიქსელი, კონვერსიების თრექინგი და ყოველკვირეული რეპორტი მარტივი ენით.'),
    'en': ('Marketing Analytics and Reporting · Cerebro',
           'Marketing analytics: Google Analytics, Meta pixel, conversion tracking and a weekly report in plain language on what works and where to move budget.')}),
  'case-studies.html': ('case-studies/', None, {
    'ka': ('მარკეტინგის ქეისები · Cerebro',
           'Cerebro-ს ქეისები: საცხოვრებელი კომპლექსის გაშვება, ლიდის ღირებულების შემცირება, ბრენდი და სოციალური მედია.'),
    'en': ('Marketing Case Studies · Cerebro',
           'Cerebro case studies: a residential complex launch, lowering cost per lead, and brand plus social media work for real clients.')}),
  'blog.html': ('blog/', None, {
    'ka': ('მარკეტინგის ბლოგი · Cerebro',
           'პრაქტიკული ჩანაწერები ციფრულ რეკლამაზე, უძრავი ქონების მარკეტინგსა და outreach-ზე Cerebro-ს გუნდისგან.'),
    'en': ('Marketing Blog · Cerebro',
           'Practical notes on paid ads, real-estate marketing and outreach from the Cerebro team.')}),
  'blog-funnel-budget.html': ('blog/funnel-budget/', None, {
    'ka': ('სარეკლამო ბიუჯეტის განაწილება Funnel-ზე · Cerebro',
           '35 / 40 / 10 / 15: როგორ ვანაწილებთ სარეკლამო ბიუჯეტს ცნობადობაზე, განხილვაზე, რემარკეტინგსა და კონვერსიაზე ახალ პროექტებში.'),
    'en': ('How to Split an Ad Budget Across the Funnel · Cerebro',
           '35 / 40 / 10 / 15: how we split an ad budget across awareness, consideration, remarketing and conversion on new projects.')}),
  'blog-remarketing-consideration.html': ('blog/remarketing/', None, {
    'ka': ('რემარკეტინგი განხილვის ეტაპზე · Cerebro',
           'ბინის ყიდვას თვეები სჭირდება. რატომ ეკუთვნის რემარკეტინგი განხილვის ეტაპს და რას ვაჩვენებთ მყიდველს ამ დროს.'),
    'en': ('Why Remarketing Belongs in Consideration · Cerebro',
           'Buying property takes months. Why remarketing belongs in the consideration stage, and what we show buyers while they compare.')}),
  'blog-cold-email.html': ('blog/cold-email/', None, {
    'ka': ('ცივი იმეილები სპამის გარეშე · Cerebro',
           'ოთხი წესი B2B ცივი იმეილებისთვის, რომ წერილები სპამში არ მოხვდეს და ანგარიში არ დაიბლოკოს.'),
    'en': ('Cold Emails That Stay Out of Spam · Cerebro',
           "Four rules for B2B cold email outreach that keep your messages out of spam and your account from being blocked.")}),
  'contact.html': ('contact/', None, {
    'ka': ('კონტაქტი · Cerebro მარკეტინგული სააგენტო',
           'დაგვიკავშირდით: Cerebro, მარკეტინგული სააგენტო თბილისში. უფასო კონსულტაცია, ტელეფონი ' + PHONE + '.'),
    'en': ('Contact · Cerebro Marketing Agency',
           'Contact Cerebro, a marketing agency in Tbilisi. Book a free consultation or call ' + PHONE + '.')}),
}
CRUMB = {'services': ('სერვისები', 'Services'), 'blog': ('ბლოგი', 'Blog')}

# alt texts are written in English in _src; Georgian pages get these translations
ALT_KA = {
  'Aprons with logo': 'წინსაფრები ლოგოთი', 'Aprons': 'წინსაფრები', 'Bags, beige': 'ჩანთები, ბეჟი',
  'Business card': 'სავიზიტო ბარათი', 'Business card, brown': 'სავიზიტო ბარათი, ყავისფერი',
  'Business card, green': 'სავიზიტო ბარათი, მწვანე', 'Business cards': 'სავიზიტო ბარათები', 'Caps': 'კეპები',
  'Cups, beige': 'ჭიქები, ბეჟი', 'Folder': 'საქაღალდე', 'Folder, green': 'საქაღალდე, მწვანე',
  'Notebooks': 'რვეულები', 'Notebooks, beige': 'რვეულები, ბეჟი', 'Paper bags': 'ქაღალდის ჩანთები',
  'Pen': 'კალამი', 'T-shirt, front and back': 'მაისური, წინა და უკანა მხარე', 'T-shirts': 'მაისურები',
  'Takeaway cups': 'ერთჯერადი ჭიქები',
  'Mounjaro product photo': 'Mounjaro — პროდუქტის ფოტო',
  'Woman pushing a wheelbarrow with plants through a garden': 'ქალი ბაღში მცენარეებით სავსე ურიკას მიაგორებს',
  'URUS apartment building at dusk': 'URUS-ის საცხოვრებელი კორპუსი შებინდებისას',
  'Potted plants, gardening tools and gloves on soil': 'ქოთნის მცენარეები, ბაღის ხელსაწყოები და ხელთათმანები მიწაზე',
  'Garden table and chairs covered in autumn leaves': 'ბაღის მაგიდა და სკამები შემოდგომის ფოთლებში',
  'FORIS Development residential building, evening render': 'FORIS Development-ის საცხოვრებელი კორპუსი, საღამოს რენდერი',
  'Apartment on Chikia street, 68.60 m² floor plan': 'ბინა ჩიქიას ქუჩაზე, 68.60 მ² გეგმარება',
}


def alt_ka(t):
    if t in ALT_KA: return ALT_KA[t]
    m = re.match(r'(.+) branding: (.+)$', t)
    if m: return '%s ბრენდინგი: %s' % (m.group(1), ALT_KA.get(m.group(2), m.group(2)))
    m = re.match(r'(.+) logo$', t)
    if m: return '%s — ლოგო' % m.group(1)
    m = re.match(r'Apartment floor plan, ([\d.]+) m²$', t)
    if m: return 'ბინის გეგმარება, %s მ²' % m.group(1)
    return t
LANGS = ('ka', 'en')


def url(path, lang):
    return '/' + ('en/' if lang == 'en' else '') + path


def strip_lang(s, drop):
    """Remove every <span lang="drop">…</span> (they never nest)."""
    tag = '<span lang="%s">' % drop
    out, i = [], 0
    while True:
        a = s.find(tag, i)
        if a < 0:
            out.append(s[i:]); return ''.join(out)
        out.append(s[i:a])
        j, depth = a + len(tag), 1
        while depth:
            o, c = s.find('<span', j), s.find('</span>', j)
            if o != -1 and o < c: depth += 1; j = o + 5
            else: depth -= 1; j = c + 7
        i = j


def fix_links(s, lang):
    def repl(m):
        attr, target = m.group(1), m.group(2)
        base, sep, rest = re.match(r'([^?#]*)([?#]?)(.*)', target).groups()
        if base in PAGES:
            return '%s="%s%s%s"' % (attr, url(PAGES[base][0], lang), sep, rest)
        return m.group(0)
    s = re.sub(r'(href)="([a-z-]+\.html[^"]*)"', repl, s)
    # root-relative assets so pages work at any depth
    s = re.sub(r'((?:src|href|poster|data-src|srcset)=")(assets/|styles\.css|main\.js)', r'\1/\2', s)
    s = re.sub(r"url\((['\"]?)assets/", r"url(\1/assets/", s)
    return s


def svc_keys(s):
    # service cards keep their icon after the URL change
    def repl(m):
        a = m.group(0); href = re.search(r'href="([^"]+)"', a).group(1)
        for src, (path, key, _) in PAGES.items():
            if key and href.rstrip('/').endswith(path.rstrip('/')):
                return a.replace('class="svc-card"', 'class="svc-card" data-svc="%s"' % key, 1)
        return a
    return re.sub(r'<a class="svc-card"[^>]*>', repl, s)


def schema(src, lang):
    path = PAGES[src][0]
    title = PAGES[src][2][lang][0].split(' · ')[0]
    org = {'@type': 'ProfessionalService', '@id': SITE + '/#org', 'name': 'Cerebro',
           'url': SITE + '/', 'logo': OG_IMAGE, 'image': OG_IMAGE, 'telephone': PHONE,
           'address': {'@type': 'PostalAddress', 'addressLocality': 'Tbilisi', 'addressCountry': 'GE'},
           'areaServed': 'GE', 'description': PAGES['index.html'][2][lang][1]}
    if src in ('index.html', 'contact.html'):
        data = org
    else:
        home = 'მთავარი' if lang == 'ka' else 'Home'
        items = [(home, SITE + url('', lang))]
        parts = path.strip('/').split('/')
        if len(parts) > 1 and parts[0] in CRUMB:
            items.append((CRUMB[parts[0]][0 if lang == 'ka' else 1], SITE + url(parts[0] + '/', lang)))
        items.append((title, SITE + url(path, lang)))
        data = {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': n + 1, 'name': nm, 'item': it} for n, (nm, it) in enumerate(items)]}
    data = dict({'@context': 'https://schema.org'}, **data)
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'


def head(src, lang):
    path, _, meta = PAGES[src]
    title, desc = meta[lang]
    esc = lambda t: t.replace('&', '&amp;').replace('"', '&quot;')
    canon = SITE + url(path, lang)
    lines = [
        '<title>%s</title>' % title.replace('&', '&amp;'),
        '<meta name="description" content="%s">' % esc(desc),
        '<link rel="canonical" href="%s">' % canon,
        '<link rel="alternate" hreflang="ka" href="%s">' % (SITE + url(path, 'ka')),
        '<link rel="alternate" hreflang="en" href="%s">' % (SITE + url(path, 'en')),
        '<link rel="alternate" hreflang="x-default" href="%s">' % (SITE + url(path, 'ka')),
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Cerebro">',
        '<meta property="og:locale" content="%s">' % ('ka_GE' if lang == 'ka' else 'en_US'),
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s">' % canon,
        '<meta property="og:image" content="%s">' % OG_IMAGE,
        '<meta name="twitter:card" content="summary_large_image">',
        schema(src, lang),
    ]
    return '\n'.join(lines)


def build_page(src, lang):
    s = open(os.path.join(SRC, src), encoding='utf-8').read()
    s = strip_lang(s, 'en' if lang == 'ka' else 'ka')
    s = s.replace('<html lang="ka">', '<html lang="%s" data-lang="%s">' % (lang, lang), 1)
    # replace title/description/og:image with the generated SEO head
    s = re.sub(r'<title>.*?</title>\n', '', s, count=1, flags=re.S)
    s = re.sub(r'<meta name="description"[^>]*>\n', '', s, count=1)
    s = re.sub(r'<meta property="og:image"[^>]*>\n', '', s)
    s = s.replace('</head>', head(src, lang) + '\n</head>', 1)
    s = fix_links(s, lang)
    s = svc_keys(s)
    if lang == 'ka':
        s = re.sub(r'((?:alt|data-alt)=")([^"]+)"', lambda m: m.group(1) + alt_ka(m.group(2)) + '"', s)
    # language switch: each button knows its counterpart URL
    path = PAGES[src][0]
    for l in LANGS:
        s = s.replace('data-set="%s"' % l, 'data-set="%s" data-href="%s"' % (l, url(path, l)), 1)
    return s


def write(rel, text):
    full = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(text)


def redirect_stub(src):
    path = PAGES[src][0]
    ka, en = url(path, 'ka'), url(path, 'en')
    return ('<!doctype html>\n<html lang="ka">\n<head>\n<meta charset="utf-8">\n'
            '<title>Cerebro</title>\n<meta name="robots" content="noindex">\n'
            '<link rel="canonical" href="%s%s">\n<meta http-equiv="refresh" content="0; url=%s">\n'
            '<script>(function(){var en=location.hash==="#en";try{en=en||localStorage.getItem("cerebro-lang")==="en";}catch(e){}'
            'var h=location.hash==="#en"?"":location.hash;location.replace((en?%s:%s)+location.search+h);})();</script>\n'
            '</head>\n<body><a href="%s">Cerebro</a></body>\n</html>\n') % (
            SITE, ka, ka, json.dumps(en), json.dumps(ka), ka)


def main():
    # clear previously generated output (never touches _src, assets or other files)
    for d in ['en', 'services', 'case-studies', 'blog', 'contact']:
        shutil.rmtree(os.path.join(ROOT, d), ignore_errors=True)
    urls = []
    for src, (path, _, _) in PAGES.items():
        for lang in LANGS:
            write(os.path.join(url(path, lang).lstrip('/'), 'index.html'), build_page(src, lang))
        if src != 'index.html':
            write(src, redirect_stub(src))
        urls.append(path)
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for path in urls:
        for lang in LANGS:
            sm.append('  <url>\n    <loc>%s</loc>' % (SITE + url(path, lang)))
            for l in LANGS:
                sm.append('    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (l, SITE + url(path, l)))
            sm.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>\n  </url>' % (SITE + url(path, 'ka')))
    sm.append('</urlset>')
    write('sitemap.xml', '\n'.join(sm) + '\n')
    write('robots.txt', 'User-agent: *\nDisallow: /_src/\nDisallow: /tools/\n\nSitemap: %s/sitemap.xml\n' % SITE)
    print('built %d pages x %d languages' % (len(PAGES), len(LANGS)))


if __name__ == '__main__':
    main()
