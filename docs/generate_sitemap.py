import datetime
import os

url = 'https://flexigpt.site/#'
exclude_files = [
    'coverpage', 'navbar', 'README', 'sidebar'
]


def create_sitemap():
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    txt = ''
    for path, dirs, files in os.walk("./"):
        for file in files:
            if not file.endswith('.md'):
                continue
            try:
                if not path.endswith('/'):
                    path += '/'
                new_path = (path.replace('\\', '/') + file)[2:-3]
                if new_path in exclude_files:
                    continue
                print(new_path)
                txt += f'{url}/{new_path}\n'
                xml += '  <url>\n'
                xml += f'    <loc>{url}/{new_path}</loc>\n'
                lastmod = datetime.datetime.utcfromtimestamp(os.path.getmtime(path + file)).strftime('%Y-%m-%d')
                xml += f'    <lastmod>{lastmod}</lastmod>\n'
                xml += '    <changefreq>monthly</changefreq>\n'
                xml += '    <priority>0.5</priority>\n'
                xml += '  </url>\n'
            except Exception as e:
                print(path, file, e)
                break
    xml += f'</urlset>\n'

    with open('./sitemap.xml', 'w', encoding='utf-8') as sitemap:
        sitemap.write(xml)
    with open('./sitemap.txt', 'w', encoding='utf-8') as sitemap:
        sitemap.write(txt)


if __name__ == '__main__':
    create_sitemap()