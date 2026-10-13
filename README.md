# Uzay Kronolojisi

Soru arşivindeki **Uzay** kategorisindeki 862 sorunun hepsini, Büyük Patlama'dan bugüne uzanan
animasyonlu bir zaman yolculuğuna yerleştiren site.

Her durakta önce o döneme ait bir animasyon oynar (bilim insanı ve buluşu, roket fırlatışı,
Ay'a iniş, Mars roverı...), ardından bilgilendirme paneli açılır:

- **Hikâye**: o anda ne oldu?
- **Bilmen gerekenler**: sorulara cevap veren bilgiler, oyundaki cevaplar **kalın**.
- **Bu duraktaki sorular**: soru, dört şık ve doğru cevap. "Cevapları gizle" ile kendini dene.

## Kullanım

- **Zaman çizgisi** (alt kısım): sürükle ya da tıkla, istediğin döneme git. Üstteki dönem
  düğmeleri (Kozmik Şafak, Antik Gökyüzü, İslam Bilim Çağı, Bilim Devrimi, Modern Astronomi,
  Uzay Yarışı, Mekikler ve İstasyonlar, Yeni Uzay Çağı, Yarın) doğrudan o döneme atlar.
- **Oklar / kaydırma / ← → tuşları**: bir önceki ya da sonraki durağa geç.
- **Otomatik yolculuk**: her 12 saniyede bir sonraki durağa ilerler.
- **Ara** (`/` tuşu): konu, kişi, araç ya da sorudan birkaç kelime yaz.
  - "ay rover" → Lunokhod 1, Apollo 17, Chandrayaan-3.
  - Bir **konu turu** seçince (ör. "Ay'a giden araçlar", "Roverlar", "Türkiye") zaman
    çizgisi o konunun duraklarını vurgular ve oklar yalnızca onlar arasında gezdirir.
    Arama sonuçlarından da "Bu duraklarla tur yap" diyerek kendi turunu oluşturabilirsin.
- **Sına**: bu durak, bu dönem, aktif konu, oyunda sık çıkanlar, hiç çözmediklerin,
  yanlışların ya da tüm sorular üzerinden çoktan seçmeli sınav. İlerleme yalnızca kendi
  tarayıcında saklanır; zaman çizgisindeki yeşil çizgiler tamamladığın durakları gösterir.

Oyunun kabul ettiği cevabın bilinen gerçekten farklı olduğu birkaç soruda sarı bir not var
(ör. "Alfraganus" sorusunda oyun "El Cezeri" cevabını kabul ediyor).

## Çalıştırma

Derleme gerekmez; düz HTML, CSS ve JavaScript.

```bash
python3 -m http.server 8000
# tarayıcıda http://localhost:8000
```

`index.html` dosyasını doğrudan açmak da çalışır. GitHub Pages ile yayımlamak için depo
ayarlarından Pages'i bu dalın kök dizinine yönlendirmen yeterli.

## Yeni soru arşivi ekleme

Oyundan yeni bir `soru_arsivi_*.json` dışa aktardığında:

```bash
python3 tools/build_questions.py soru_arsivi_YYYYMMDD_HHMM.json
```

Betik yalnızca `kategori: "Uzay"` olan soruları alır, OCR kaynaklı yazım bozukluklarını
düzeltir ve her soruyu `tools/question_map.json` eşlemesine göre bir durağa bağlar.
Eşlemede olmayan yeni sorular "Henüz yerleştirilmemiş sorular" durağında görünür ve betik
bunları listeler; `tools/question_map.json` içine soru anahtarı → durak kimliği ekleyerek
yerleştirebilirsin.

## Dosyalar

| Dosya | İçerik |
| --- | --- |
| `index.html` | Sayfa iskeleti |
| `css/style.css` | Tasarım ve sahne animasyonları |
| `data/events.js` | 157 durak: dönem, yıl, hikâye, bilgiler, sahne ve konu etiketleri |
| `data/questions.js` | 862 soru (betikle üretilir) |
| `js/scene-parts.js` | SVG çizim parçaları: gezegenler, roketler, uydular, figürler... |
| `js/scenes-a.js`, `js/scenes-b.js` | Her durak türü için animasyonlu sahneler |
| `js/fx.js` | Sahnenin üstündeki parçacık katmanı: roket alevi ve dumanı, iniş tozu, patlamalar, toplanma diskleri, kamera sarsıntısı |
| `js/app.js` | Zaman yolculuğu, zaman çizgisi, arama, konu turu, sınav |
| `tools/build_questions.py` | JSON arşivinden soru verisini üreten betik |
| `tools/question_map.json` | Soru → durak eşlemesi |
