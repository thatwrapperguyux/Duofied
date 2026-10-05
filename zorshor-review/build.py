"""Build zorshor review site: 2 themes x (client with comments | internal).

dist/live/<theme>/          -> artifact pages (index.html + site.css + app.js [+ comments.js])
dist/files/<theme>-client.html, <theme>-internal.html -> single-file standalone builds
"""
import base64, re, pathlib, shutil

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'

FONTS = {
    'premium': 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400..700&family=Inter+Tight:wght@300..600&display=swap',
    'draft': 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..700&family=Caveat+Brush&family=Instrument+Sans:wght@400..600&display=swap',
}


def read(name):
    return (SRC / name).read_text()


def logo_symbol():
    svg = read('assets/zorshor-logo.svg')
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    d = re.search(r' d="([^"]+)"', svg).group(1)
    return f'<symbol id="logo" viewBox="{vb}"><path fill="currentColor" d="{d}"/></symbol>'


def font_face():
    b = base64.b64encode((SRC / 'assets/chickendinner-sub.ttf').read_bytes()).decode()
    return ('/* Chicken Dinner — brand secondary font (subset from the brand kit; used for the page-change "action") */\n'
            f'@font-face{{font-family:"Chicken Dinner";src:url(data:font/ttf;base64,{b}) format("truetype");font-display:swap}}\n')


def css(theme):
    return font_face() + read('base.css') + '\n' + read(f'{theme}.css')


def page(theme, styles, script, comments):
    html = read('index.html')
    html = html.replace('{{FONTS}}', f'<link rel="stylesheet" href="{FONTS[theme].replace("&", "&amp;")}">')
    html = html.replace('{{STYLES}}', styles)
    html = html.replace('{{THEME}}', theme)
    html = html.replace('<title>zorshor</title>', '<title>zorshor · ' + ('Premium' if theme == 'premium' else 'Draft 1') + '</title>')
    html = html.replace('{{LOGO_SYMBOL}}', logo_symbol())
    html = html.replace('{{HATHI}}', read('assets/hathi.svg'))
    html = html.replace('{{COMMENTS}}', comments)
    html = html.replace('{{SCRIPT}}', script)
    return html


def build():
    if DIST.exists():
        shutil.rmtree(DIST)
    for theme in ('premium', 'draft'):
        # live (artifact) pages: client build, files alongside
        live = DIST / 'live' / theme
        live.mkdir(parents=True)
        (live / 'site.css').write_text(css(theme))
        (live / 'app.js').write_text(read('app.js'))
        (live / 'comments.js').write_text(read('comments.js'))
        (live / 'index.html').write_text(page(theme, '<link rel="stylesheet" href="site.css">',
                                               '<script src="app.js"></script>', '<script src="comments.js"></script>'))
        # standalone single files
        files = DIST / 'files'
        files.mkdir(parents=True, exist_ok=True)
        for kind in ('client', 'internal'):
            comments = f'<script>\n{read("comments.js")}\n</script>' if kind == 'client' else ''
            body = page(theme, f'<style>\n{css(theme)}\n</style>', f'<script>\n{read("app.js")}\n</script>', comments)
            i = body.index('<script>document.documentElement')
            head, rest = body[:i], body[i:]
            doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                   '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
                   f'{head}</head>\n<body>\n{rest}\n</body>\n</html>\n')
            (files / f'zorshor-{theme}-{kind}.html').write_text(doc)
    print('built', sorted(str(p.relative_to(DIST)) for p in DIST.rglob('*') if p.is_file()))


if __name__ == '__main__':
    build()
