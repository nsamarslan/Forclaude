#!/usr/bin/env python3
"""Soru arşivi JSON'undan data/questions.js üretir.

Kullanım:
    python3 tools/build_questions.py soru_arsivi.json

- Yalnızca kategorisi "Uzay" olan soruları alır.
- OCR kaynaklı yazım bozukluklarını mümkün olduğunca düzeltir
  (ı/i karışıklığı, "D2 3) 4)" gibi önekler, eksik tırnaklar...).
- Her soruyu tools/question_map.json'daki eşleşmeye göre bir zaman
  durağına (data/events.js içindeki id) bağlar. Eşleşmeyen yeni sorular
  "diger" durağına düşer ve ekrana listelenir.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAP_PATH = ROOT / 'tools' / 'question_map.json'
OUT_PATH = ROOT / 'data' / 'questions.js'

TR_FOLD = str.maketrans({'ı': 'i', 'İ': 'i', 'I': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
                         'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c',
                         'â': 'a', 'î': 'i', 'û': 'u'})
LOWER = str.maketrans({'I': 'ı', 'İ': 'i'})
UPPER = str.maketrans({'i': 'İ', 'ı': 'I'})


def key(s):
    """Soru metninden eşleştirme anahtarı (ham metin üzerinden)."""
    s = s.translate(TR_FOLD).lower()
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return ' '.join(s.split())


def tr_lower(s):
    return s.translate(LOWER).lower()


def tr_upper_first(s):
    if not s:
        return s
    return s[0].translate(UPPER).upper() + s[1:]


# --- Temizlik kuralları ----------------------------------------------------

PREFIXES = [
    r'^D2\s*3?\)?\s*4?\)?\s*', r'^\(6s\)\s*', r'^s0\)\s*', r'^NN\s+', r'^\+\s*',
    r'^Anladım, sorular[ıi]n[ıi]? bekliyorum\.\s*', r'^Kanlı ay tutulması\.\s*', r'^Kanopus\.\s*',
]
SUFFIXES = [r'\s+5$', r'\s+\+$', r'\s+D\)$']

# Doğrudan düzeltmeler (OCR hataları)
REPLACE = [
    ('(1Sss)', '(ISS)'), ('(1SS)', '(ISS)'), ('(1sS)', '(ISS)'), ('1Sss', 'ISS'),
    ('1şık', 'ışık'), ('1SInir', 'ısınır'), ('130.00O', '130.000'), ('384.40O', '384.400'),
    ('30500O', '305000'), ('65000o', '650000'), ('1gün', '1 gün'), ('Lung-9', 'Luna-9'),
    ('Christing Koch', 'Christina Koch'), ('Gaynmede', 'Ganymede'), ('EI Cezeri', 'El Cezeri'),
    ('ik dördün', 'İlk dördün'), ('İlk dördün', 'İlk dördün'), ('Meteor nedir2', 'Meteor nedir?'),
    ('Dünyg-Venüs', 'Dünya-Venüs'), ('Persevarance', 'Perseverance'), ('3Ocak', '3 Ocak'),
    ('Mariner9', 'Mariner 9'), ('Mariner6', 'Mariner 6'), ('Mariner3', 'Mariner 3'), ('Falcon9', 'Falcon 9'),
    ('°24 Güney', '24° Güney'), ('Einstain', 'Einstein'),
    ('ne acverilig?', 'ne ad verilir?'), ('he gisidir', 'hangisidir'), ('gezegern', 'gezegen'),
    ('Astromoni', 'Astronomi'), ('Astrononmi', 'Astronomi'), ('astrononmik', 'astronomik'),
    ('kalmiştır', 'kalmıştır'), ('Ükemiz', 'Ülkemiz'), ('Hidrojen ve Helyunm', 'Hidrojen ve Helyum'),
    ('Starbasse', 'Starbase'), ('Afmosfer', 'Atmosfer'), ('Kizgın', 'Kızgın'),
    ('Valantina', 'Valentina'), ('Maona Kea', 'Mauna Kea'),
    ('Nilola', 'Nikola'),
    ('Svetlena', 'Svetlana'), ('Centarus', 'Centaurus'), ('lğdır', 'Iğdır'), ('Asimov Gagari', 'Asimov Gagarin'),
    ('Nell Kelly', 'Neil Kelly'), ('aracI', 'aracı'), ('Ay vil', 'Ay yılı'), ('boşs yere', 'boş yere'),
    ('kan Dünya saatine', 'kaç Dünya saatine'), ('ne nedir?', 'ne denir?'), ('uygularının', 'uydularının'),
    ('anmaçlı', 'amaçlı'), ('açılını', 'açılımı'), ('nmaliyetiyle', 'maliyetiyle'),
    ('kinmdir', 'kimdir'), ('uzakliğıl astronomi', 'uzaklığı 1 astronomi'), ('ang halkası', 'ana halkası'),
    ('Güneş işğının', 'Güneş ışığının'), ('Günes işğının', 'Güneş ışığının'), ('yaprya', 'yapıya'),
    ('Kutup Yildizi\'nı Y göremiyorsanız', 'Kutup Yıldızı\'nı göremiyorsanız'),
    ('Yildızi\'nı Y', 'Yıldızı\'nı'), ('tamnamen', 'tamamen'),
    ('aldiğı', 'aldığı'), ('adlandırlan', 'adlandırılan'),
    ('çalşma', 'çalışma'), ('kullanılr?', 'kullanılır?'), ('meteor çarpmas,', 'meteor çarpması,'),
    ('Güneş tutulm asI', 'Güneş tutulması'), ('ne acverilig', 'ne ad verilir'), ('iIk ', 'İlk '),
    ('UIlusal', 'Ulusal'), ("NASA'nn", "NASA'nın"), ('"Valles Marinaris\'', '"Valles Marinaris"'),
    ('Çin\'de Gümüş Nehir"', 'Çin\'de "Gümüş Nehir"'), ('kraterine Sinan"', 'kraterine "Sinan"'),
]

# Ekrana daha iyi otursun diye bazı kırpık kayıtların metnini tamamlıyoruz.
# Anahtar: ham metnin key() çıktısının başı.
TEXT_OVERRIDE = {
    'yapma elektronik iletisim gibi amaclarla': '(Kırpık kayıt) Dünya\'nın çevresinde dolanan; gözlem yapma, elektronik iletişim gibi amaçlarla tasarlanan araca ne ad verilir?',
    'adlandirlan gokyuzundeki beyaz alana': '(Kırpık kayıt) Avrupa\'da "Milky Way", Çin\'de "Gümüş Nehir" olarak adlandırılan gökyüzündeki beyaz alana ne denilmektedir?',
    'astronot olan peggy whitson': '(Kırpık kayıt) ISS\'te en uzun süre kalan astronot olan Peggy Whitson kaç gün ISS\'de kalmıştır?',
    'hangisi uzay calismalarina katilan astronotlarin': '(Kırpık kayıt) Hangisi uzay çalışmalarına katılan astronotların karşılaşacağı zorluklardan biridir?',
    'hangisi yapay uydularin kullanim amaclarindan biri': '(Kırpık kayıt) Hangisi yapay uyduların kullanım amaçlarından biri değildir?',
    'asagidaki ulkelerden hangisi uluslararasi uzay istasyonu': 'Aşağıdaki ülkelerden hangisi Uluslararası Uzay İstasyonu programında yer almaz?',
    'basit hacim hesabina gore gunes icerisine': 'Basit hacim hesabına göre Güneş\'in içine kaç adet Dünya sığar?',
    'uranus un uydulari isimlendirilirken hangileri kullanilmistir': 'Uranüs\'ün uyduları isimlendirilirken hangileri kullanılmıştır?',
    'uranus un uydulari isimlendirilirken hangileri': 'Uranüs\'ün uyduları isimlendirilirken hangileri kullanılmıştır?',
    'yuzyil ile baslayan uzay calismalarinda': '20. yüzyıl ile başlayan uzay çalışmalarında kullanılan astronot giysilerinin dış katmanı genellikle hangi renktedir?',
    'astronot giysilerinin dis katmani genellikle': 'Astronot giysilerinin dış katmanı genellikle hangi renktedir?',
    'hangisi hava ve uzay fotograflari ile': 'Hava ve uzay fotoğrafları ile yeryüzünün jeolojik özelliklerinin saptanmasına yönelik çalışmaların yapıldığı bilim dalı hangisidir?',
    'nasa nin insanli uzay ucus kontrol egitim': 'NASA\'nın insanlı uzay uçuş kontrol, eğitim ve araştırmalarını yürüttüğü yerin adı nedir?',
    'gok cisimlerinin isimlendirilmesi ile ilgili onay': 'Gök cisimlerinin isimlendirilmesi ile ilgili onay yetkisi hangi kuruluşa aittir?',
    'starlink uydu internetinden faydalanabilmek': 'Starlink uydu internetinden faydalanabilmek için hangisine sahip olmak gerekir?',
}
OPTION_OVERRIDE = {
    'Starlink terminali (uydu': 'Starlink terminali (uydu anteni)',
    'Uluslararası Astronomi': 'Uluslararası Astronomi Birliği',
    'William Shakespeare\'in': 'William Shakespeare\'in karakterleri',
    'NASA Johnson Space': 'NASA Johnson Space (Center)',
    'Center': 'Center',
    'lo': 'Io',
    '/3': '1/3',
    'l yıl': '1 yıl',
    'yüzyıl': '11. yüzyıl',
    'Frans': 'Fransa',
    'Galie': 'Galilei',
    'Einstain': 'Einstein',
    'İbn Sin': 'İbn-i Sina',
    'Kızıl ay utulması': 'Kızıl ay tutulması',
    '7500 C': '7500 °C',
    'ik dördün': 'İlk dördün',
    'Dönenc': 'Dönence',
    '1işik yılı': '1 ışık yılı',
    'io': 'Io',
    'MaxwelI': 'Maxwell',
    'Kabin': 'Kabin',
}

# Oyunda kabul edilen cevap ile bilinen gerçek farklı ya da soru bozuksa not.
NOTES = {
    'alfraganus adiyla bildigi ilk turk': 'Oyun bu soruda "El Cezeri" cevabını kabul etti. Gerçekte Alfraganus, El-Fergânî\'dir; diğer soruda doğru cevap El-Fergânî.',
    'insanli uzay ucus kontrol egitim ve arastirmalarini': 'Seçenekler bozuk geliyor. Doğrusu Houston\'daki NASA Johnson Uzay Merkezi; oyun "ESA" cevabını kabul etti.',
    'milli imkanlarla turkiye de birlestirilip': 'Oyunun kabul ettiği cevap Türksat 4A. Gerçekte bu tanım 2024\'te Falcon 9 ile fırlatılan Türksat 6A\'ya uyar; 4A 2014\'te Proton roketiyle gitti.',
    'dunya daki en buyuk gok tasi krateri nerededir': 'Oyun "Amerika" cevabını kabul ediyor (Arizona\'daki Meteor Krateri). Doğrulanmış en büyük krater Güney Afrika\'daki Vredefort.',
    'new horizons uzay araci nerede bulunmaktadir': 'Oyun "Yıldızlararası bölgede" cevabını kabul etti. New Horizons bilimsel olarak hâlâ Kuiper Kuşağı\'nda ilerliyor.',
    'gunes in icine yaklasik kac tane dunya sigar': 'Oyun bu soruda "10 Milyon" cevabını kabul ediyor. Diğer soruda (basit hacim hesabı) cevap 1,3 milyon; gerçek değer de ~1,3 milyon.',
    'basit hacim hesabina gore gunes icerisine': 'Dikkat: benzer diğer soruda oyun "10 Milyon" cevabını kabul ediyor.',
    'bir venus gununun uzunlugu kac dunya gunune esittir': 'Seçeneklerin hiçbiri tam doğru değil; oyun "2" cevabını kabul ediyor. Venüs\'te bir güneş günü ~117 Dünya günü, yani bir Venüs yılında yaklaşık 2 gün yaşanır.',
    'kirmizi super dev olarak tanimlanan': 'Oyunun kabul ettiği cevap "İkizlerevi". Bilinen kırmızı süper dev örnekleri: Betelgeuse, Antares.',
    'bir supernova sonucu ortaya cikan ve parlayan gaz bulutuna': 'Oyun "Gezegensel nebula" cevabını kabul ediyor. Bilimsel adı süpernova kalıntısı; gezegensel nebula küçük yıldızların ölümünde oluşur.',
    'samanyolu na en yakin galaksi hangisidir': 'Andromeda en yakın büyük sarmal gökadadır; daha yakında küçük cüce gökadalar da var.',
    'mars in yuzeyine inen ilk uzay araclari hangisidir': 'Seçenekler içinde doğrusu Pathfinder/Sojourner (Mars\'taki ilk rover). Yüzeye ilk başarılı iniş Viking 1\'e (1976) aittir.',
    'dolunay evresinden yaklasik 3 hafta sonra': 'Oyun "Son dördün" cevabını kabul ediyor (dolunaydan ~1 hafta sonra son dördün gelir).',
    'm o 1054 yilindaki supernovanin': 'Patlama aslında MS 1054\'te (4 Temmuz) gözlendi.',
    '2004 yilinda hangi gezegen gunes in onunden 223': 'Bir önceki Venüs geçişi 1882\'deydi; soru metnindeki süre oyundan geldiği gibi.',
    'hangisi mars in yuzeyinde gorev yapan uzay araclarindan degildir': 'Oyun "Mars 5" cevabını kabul ediyor (Mars 5 yörünge aracıydı).',
    'batlamyus un gokyuzu haritasindaki hatalari': 'Oyunun kabul ettiği cevap Ömer Hayyam.',
    'bir venus gununun': '',
    'yildizlara en yakin nokta hangi dag': 'Chimborazo, Dünya\'nın merkezine en uzak noktadır; bu yüzden "yıldızlara en yakın" denir.',
    'ukemiz haberlesme uydularinin': '',
}


def _keep_case(rep):
    def f(m):
        w = m.group(0)
        return tr_upper_first(rep) if w[0].isupper() else rep
    return f


# Sık görülen OCR ı/i hataları (kök bazında)
_STEMS = [
    (r'y[ıi]ı?ld[ıi]z', 'yıldız'), (r's[ıi]cakl[ıi]k', 'sıcaklık'), (r's[ıi]cakl[ıi]ğ', 'sıcaklığ'),
    (r'sicak', 'sıcak'), (r'hizi\b', 'hızı'), (r'hiz(?=\b|l|ı|a)', 'hız'), (r'f[ıi]?rlat[iı]l', 'fırlatıl'), (r'f[iı]?rlat', 'fırlat'),
    (r'frtına', 'fırtına'), (r'f[iı]rt[iı]na', 'fırtına'), (r'[iı]ş[iı]k', 'ışık'), (r'[iı]ş[iı]ğ', 'ışığ'), (r'[iı]ş[iı]n', 'ışın'),
    (r'kisa', 'kısa'), (r'k[iı]saltma', 'kısaltma'), (r's[iı]n[iı]f', 'sınıf'),
    (r'taraf[iı]ndan', 'tarafından'), (r'etraf[iı]nda', 'etrafında'), (r'yaklaş[iı]k', 'yaklaşık'),
    (r'aydınl[iı]k', 'aydınlık'), (r'çal[iı]ş', 'çalış'), (r'd[iı]ş[iı]nda', 'dışında'), (r'kapsam[iı]nda', 'kapsamında'),
    (r'ç[iı]kan', 'çıkan'), (r'ç[iı]kıp', 'çıkıp'), (r'ç[iı]plak', 'çıplak'), (r'yan[iı]ndan', 'yanından'),
    (r'kism', 'kısm'), (r'b[iı]rak[iı]l', 'bırakıl'), (r'anisina', 'anısına'), (r'saptanmasina', 'saptanmasına'),
    (r'yanstan', 'yansıtan'), (r'amacyla', 'amacıyla'), (r'tan[iı]mlanan', 'tanımlanan'), (r'an[iı]lan', 'anılan'),
    (r'kullan[iı]lab', 'kullanılab'), (r'adland[iı]r[iı]lan', 'adlandırılan'), (r'uzakl[iı]k', 'uzaklık'),
    (r'büyüklüğů', 'büyüklüğü'), (r'uydular[iı]n[iı]n', 'uydularının'), (r'dolaşan', 'dolaşan'),
    (r'kaplumbağa', 'kaplumbağa'), (r'gökyüz', 'gökyüz'), (r'parçalar[iı]nda', 'parçalarında'),
    (r'tasarlanmiş', 'tasarlanmış'), (r'yaptiğı', 'yaptığı'), (r'kalmiştır', 'kalmıştır'), (r'aydinl', 'aydınl'),
]
WORD_RULES = []
for _pat, _rep in _STEMS:
    WORD_RULES.append((re.compile(r'(?<![A-Za-zÇĞİÖŞÜçğıöşü])' + _pat), _rep))
    _cap = _pat[0].upper() + _pat[1:] if _pat[0].isalpha() else _pat.replace('[iı]', '[İI]', 1)
    WORD_RULES.append((re.compile(r'(?<![A-Za-zÇĞİÖŞÜçğıöşü])' + _cap), tr_upper_first(_rep)))
# kelime olarak "yil", "yili", "yilında"
WORD_RULES += [
    (re.compile(r'\b([Yy])il(ı|i|ında|inda|lık|da)?\b'), lambda m: m.group(1) + 'ıl' + {'i': 'ı', 'inda': 'ında'}.get(m.group(2) or '', m.group(2) or '')),
    # kalın ünlüden sonra kesme işaretli eklerde uyum: Ay'in -> Ay'ın, NASA'nin -> NASA'nın
    (re.compile(r"([A-Za-zÇĞİÖŞÜçğıöşü]*[aıouAOU][^aeıioöuüAEIİOÖUÜ'\s]*)'(n?)i(n|)\b"), lambda m: m.group(0) if m.group(1).isupper() else f"{m.group(1)}'{m.group(2)}ı{m.group(3)}"),
    (re.compile(r'Ajansi\b'), 'Ajansı'), (re.compile(r'Uluslararasi'), 'Uluslararası'),
]


def build_vocab(texts):
    c = Counter()
    for t in texts:
        for w in re.findall(r"[A-Za-zÇĞİÖŞÜçğıöşüâîû]+", t):
            c[tr_lower(w)] += 1
    return c


def fix_ii(word, vocab):
    """ı/i karışıklığını sözlük sıklığına göre düzelt."""
    lw = tr_lower(word)
    if len(lw) < 3 or ('i' not in lw and 'ı' not in lw):
        return word
    positions = [i for i, ch in enumerate(lw) if ch in 'iı']
    if len(positions) > 6:
        return word
    best, best_n = lw, vocab.get(lw, 0)
    for mask in range(1 << len(positions)):
        cand = list(lw)
        for bit, p in enumerate(positions):
            cand[p] = 'ı' if mask >> bit & 1 else 'i'
        cand = ''.join(cand)
        n = vocab.get(cand, 0)
        if n > best_n:
            best, best_n = cand, n
    if best == lw or best_n < 3 or best_n < 2 * max(1, vocab.get(lw, 0)):
        return word
    # büyük/küçük harf düzenini koru
    out = []
    for orig, new in zip(word, best):
        if orig.isupper():
            out.append('İ' if new == 'i' else 'I' if new == 'ı' else new.upper())
        else:
            out.append(new)
    return ''.join(out)


KEEP_MIXED = {'SpaceX', 'OSIRIS', 'REx', 'LunaH', 'CubeSats', 'BepiColombo', 'TinySats', 'ClearSpace',
              'ExoMars', 'CHEOPs', 'NASA', 'ISS', 'TESS', 'GMT', 'DART', 'SOFIA', 'WFIRST', 'JAXA', 'ESA',
              'ESO', 'VLT', 'DAG', 'TUA', 'JPL', 'UFO', 'SETI', 'NGC', 'CIA', 'ATOM', 'UAM', 'DMT', 'BMT',
              'TÜBİTAK', 'TÜRKSAT', 'BİLSAT', 'GÖKTÜRK', 'RASAT', 'ARES', 'TUSAŞ', 'HAVELSAN', 'BAYKAR', 'İTÜ',
              'ASELSAN', 'ŞİMŞEK', 'FİŞEK', 'TOSUN', 'MARS', 'LUNAR', 'CERES', 'COBE', 'ABD', 'BAE', 'SSCB',
              'CNSA', 'ISRO', 'KPLO', 'LISA', 'InSight', 'McDonald', 'SpaceArm', 'AmericArm', 'SmartArm', 'NewShepard', 'NASA\'nın'}


def fix_case(word):
    if word in KEEP_MIXED or len(word) < 3:
        return word
    uppers = sum(1 for ch in word[1:] if ch.isupper())
    lowers = sum(1 for ch in word if ch.islower())
    if uppers == 0 or lowers < 2 or uppers > 2:
        return word
    return word[0] + tr_lower(word[1:])


def clean(text, vocab, question=False):
    t = ' '.join(str(text).split())
    if question:
        for p in PREFIXES:
            t = re.sub(p, '', t)
        for p in SUFFIXES:
            t = re.sub(p, '', t)
    for a, b in REPLACE:
        t = t.replace(a, b)
    t = t.replace('\'"', '"').replace('"\'', '"')
    t = t.replace('ıi', 'ı').replace('iı', 'ı')
    t = re.sub(r"[A-Za-zÇĞİÖŞÜçğıöşüâîû]+", lambda m: fix_case(m.group(0)), t)
    t = t.replace('ıı', 'ı')
    for pat, rep in WORD_RULES:
        t = re.sub(pat, rep, t)
    if t.count('"') % 2 == 1:
        t = '"' + t
    t = re.sub(r'\s+([?.,!])', r'\1', t)
    t = re.sub(r'\s*°\s*C\b', '\u00a0°C', t)
    t = t.strip()
    if t == 'pH':
        return t
    t = tr_upper_first(t)
    if t.startswith('İk defa'):
        t = 'İlk defa' + t[len('İk defa'):]
    return t


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    allq = data['sorular']
    vocab = build_vocab([q['soru'] for q in allq] + [s for q in allq for s in (q.get('siklar') or []) if s])
    qmap = json.load(open(MAP_PATH, encoding='utf-8'))
    space = [q for q in allq if (q.get('kategori') or '').strip().lower() == 'uzay']

    out, unmapped = [], []
    for q in space:
        k = key(q['soru'])
        ev = qmap.get(k)
        if not ev:
            ev = 'diger'
            unmapped.append(q['soru'])
        text = next((v for kk, v in TEXT_OVERRIDE.items() if k.startswith(kk)), None) or clean(q['soru'], vocab, question=True)
        opts = [clean(OPTION_OVERRIDE.get(o, o), vocab) if o else '' for o in q['siklar']]
        a = q.get('dogruIndeks')
        if a is None or not (0 <= a < len(opts)):
            continue
        item = {'id': len(out), 'q': text, 'o': opts, 'a': a, 'e': ev,
                'k': q.get('kacKezCikti') or 0, 'b': q.get('basariYuzde')}
        note = next((v for kk, v in NOTES.items() if kk in k and v), None)
        if note:
            item['n'] = note
        out.append(item)

    OUT_PATH.write_text(
        '// Otomatik üretildi: tools/build_questions.py — elle düzenleme.\n'
        'window.QUESTIONS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8')
    print(f'{len(out)} uzay sorusu yazıldı -> {OUT_PATH.relative_to(ROOT)}')
    if unmapped:
        print(f'{len(unmapped)} soru bir durağa eşlenmedi ("diger" durağına kondu):')
        for s in unmapped:
            print('  -', s)


if __name__ == '__main__':
    main()
