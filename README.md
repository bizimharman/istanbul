<div align="center">

# 🏙️ İstanbul Akıllı Şehir Platformu
### *Istanbul Smart City Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#lisans--license)

**Vatandaşlar, belediyeler ve işletmeler arasında dijital köprü kuran,
yapay zeka destekli kentsel hizmet ekosistemi.**

*An AI-powered urban service ecosystem bridging citizens, municipalities, and businesses.*

[Türkçe](#-türkçe) · [English](#-english)

</div>

---

## 🇹🇷 Türkçe

### Vizyon

İstanbul — 16 milyonluk nüfusu, 39 ilçesi ve binlerce yıllık tarihiyle dünyanın en karmaşık ve en canlı metropollerinden biri. Bu platform, İstanbul'u başlangıç noktası alarak **Türkiye'nin büyük şehirleri için ölçeklenebilir bir akıllı şehir altyapısı** inşa etmeyi hedefliyor.

Temel felsefemiz:
- 🏛️ **Şeffaf belediyecilik** — Vatandaş bildirimleri takip edilebilir, belediye yanıtları görünür
- 🤝 **İşletme ekosistemi** — Yerel işletmeler keşfedilebilir, güvenilir ve talep-teklif döngüsüne entegre
- 🤖 **Yapay zeka destekli** — Şikâyet sınıflandırma, akıllı eşleştirme, içerik üretimi
- 📱 **Vatandaş merkezli** — Her şey vatandaşın günlük hayatını kolaylaştırmak için

### Mevcut Özellikler (v0.1)

#### 🎫 Belediye Bildirim Sistemi
- Vatandaşlar altyapı, ulaşım, temizlik, park vb. kategorilerde bildirim oluşturur
- AI destekli otomatik kategori sınıflandırma ve önceliklendirme
- Belediye yöneticileri bildirimleri inceler, durumunu günceller, not ekler
- Tam olay geçmişi ve durum takibi (Açık → İşlemde → Çözüldü / Reddedildi)
- İlçe bazlı filtreleme ve istatistikler

#### 🏢 İşletme Keşif ve Sahiplik Platformu
- İşletme sahipleri profil oluşturur (kategori, hizmet ilçeleri, çalışma saatleri, iletişim)
- Platform yöneticisi sahiplik doğrulaması ve yayın onayı verir
- Herkese açık keşif sayfası: ada, kategoriye ve ilçeye göre filtreleme
- SEO dostu profil sayfaları (LocalBusiness JSON-LD, dinamik sitemap)
- Durum akışı: TASLAK → İNCELEMEDE → YAYINDA / DÜZELTMEBEKLENİYOR / DURDURULDU
- Stale-revision koruması (409 Conflict), eş zamanlı düzenleme güvenliği

#### 📋 Hizmet Talep → Teklif Akışı
- Vatandaş hizmet talebi oluşturur (kategori, ilçe, bütçe aralığı, süre beklentisi)
- Sistem otomatik olarak uygun işletmeleri eşleştirir (kategori + hizmet ilçesi)
- Eşleşen işletmeler teklif gönderir (fiyat, süre, açıklama)
- Vatandaş teklifleri karşılaştırır, kabul veya reddeder
- Kabul edilen teklif dışında bekleyenler otomatik reddedilir

#### 📢 Duyuru Sistemi
- Su kesintisi, elektrik kesintisi, yol çalışması, etkinlik, genel duyurular
- İlçe bazlı hedefleme
- Vatandaş bildirimi ve takibi

#### 🛡️ Güvenlik ve Yetkilendirme
- Rol bazlı erişim kontrolü: Vatandaş / İşletme Sahibi / Belediye Yöneticisi / Platform Yöneticisi
- NextAuth.js credentials tabanlı kimlik doğrulama
- Platform yöneticisi belediye rolünden bağımsız (ayrı `isPlatformAdmin` yetkisi)
- Rate limiting (kayan 24 saat penceresi, aktör bazlı)
- Origin kontrolü, CSRF koruması
- Advisory lock ile race condition önleme

### Gelecek Vizyon (Yol Haritası)

```
📍 Faz 1 — Temel Platform ✅ (Mevcut)
│  Bildirim sistemi, işletme keşfi, talep-teklif akışı
│
📍 Faz 2 — Güven ve Etkileşim Katmanı (Sırada)
│  ├── İşletme yorum ve değerlendirme sistemi
│  ├── Teklif sonrası mesajlaşma (vatandaş ↔ işletme)
│  ├── Randevu planlama
│  ├── Şikâyet çözüm süreci (moderasyonlu)
│  └── İşletme yanıt/itiraz mekanizması
│
📍 Faz 3 — Yapay Zeka ve Veri Katmanı
│  ├── AI destekli akıllı talep-işletme eşleştirme
│  ├── Doğal dil ile bildirim oluşturma
│  ├── Otomatik önceliklendirme ve aciliyet tespiti
│  ├── Şehir veri analitik panosu
│  └── Tahminsel bakım önerileri (altyapı)
│
📍 Faz 4 — Turizm ve Kültür
│  ├── İstanbul günlük rota planlayıcı (AI destekli)
│  ├── Tarihi mekan rehberi
│  ├── Etkinlik takvimi
│  └── Çok dilli destek (TR/EN/AR/KU)
│
📍 Faz 5 — IoT ve Akıllı Altyapı
│  ├── Gerçek zamanlı şehir veri paneli (trafik, hava kalitesi, kalabalık)
│  ├── IoT sensör entegrasyonu (enerji, su, atık)
│  ├── Akıllı aydınlatma ve park yönetimi
│  └── Afet erken uyarı sistemi
│
📍 Faz 6 — Şeffaflık ve Katılım
│  ├── Blockchain tabanlı şeffaf ihale takibi
│  ├── Kamu harcaması görselleştirme
│  ├── Vatandaş oy ve referandum sistemi
│  ├── Belediye performans karnesi
│  └── Açık veri portalı (API)
│
📍 Faz 7 — Mobil ve Erişilebilirlik
│  ├── React Native mobil uygulama
│  ├── Entegre harita ve CBS (Coğrafi Bilgi Sistemi)
│  ├── Sesli bildirim oluşturma
│  ├── Görme engelli uyumlu arayüz
│  └── Offline mod (temel özellikler)
│
🌍 Uzun Vadeli Hedef
   Türkiye'nin tüm büyükşehirleri için ölçeklenebilir SaaS modeli
```

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|----------|
| Frontend | Next.js 16 (App Router, Server Components, Turbopack) |
| Stil | Tailwind CSS 3 + shadcn/ui bileşenleri |
| Dil | TypeScript 5.x (strict mode) |
| Veritabanı | PostgreSQL 16 + Prisma ORM |
| Kimlik Doğrulama | NextAuth.js (Credentials Provider) |
| Durum Yönetimi | React Server Components + Client hooks |
| AI | Abacus.AI LLM API (GPT-4o / Claude entegrasyonu) |
| Dağıtım | Abacus.AI Platform / Vercel / Docker |

### Proje Yapısı

```
├── app/                          # Next.js App Router
│   ├── (city)/                   # Ana şehir layout grubu
│   │   ├── akademi/              # 🎓 Akademi (Yakında)
│   │   ├── basvuru/              # Başvuru sayfaları
│   │   ├── basvurular/           # Başvuru listeleri
│   │   ├── duyurular/            # 📢 Duyuru sayfaları
│   │   ├── isletme/              # 🏢 İşletme yönetim paneli
│   │   ├── isletmeler/           # 🔍 İşletme keşif ve profil
│   │   ├── platform/             # 🛡️ Platform yönetici paneli
│   │   ├── profil/               # 👤 Kullanıcı profili
│   │   ├── talep/                # 📋 Hizmet talebi oluşturma
│   │   ├── taleplerim/           # 📋 Taleplerim listesi
│   │   ├── turizm/               # ✈️ Turizm (Yakında)
│   │   └── yonetim/              # 🏛️ Belediye yönetim paneli
│   ├── api/                      # API Route Handler'ları
│   │   ├── auth/                 # NextAuth.js endpoint'leri
│   │   ├── businesses/           # İşletme CRUD API
│   │   ├── business-requests/    # İşletmelere gelen talepler
│   │   ├── directory/            # Herkese açık dizin API
│   │   ├── platform/             # Platform yönetimi API
│   │   ├── requests/             # Hizmet talepleri API
│   │   └── ...                   # Diğer API'ler
│   ├── layout.tsx                # Kök layout
│   ├── page.tsx                  # Ana sayfa
│   ├── robots.ts                 # Dinamik robots.txt
│   └── sitemap.ts                # Dinamik sitemap.xml
├── components/                   # React bileşenleri
│   ├── ui/                       # shadcn/ui temel bileşenleri
│   ├── layouts/                  # Layout bileşenleri
│   ├── city-shell.tsx            # Ana şehir kabuğu
│   ├── dashboard.tsx             # Kontrol paneli
│   ├── business-requests.tsx     # İşletme talep listesi
│   ├── request-form.tsx          # Hizmet talep formu
│   ├── request-detail.tsx        # Talep detay görünümü
│   └── ...                       # Diğer bileşenler
├── lib/                          # Yardımcı kütüphaneler
│   ├── db.ts                     # Prisma client singleton
│   ├── business-server.ts        # İşletme sunucu yardımcıları
│   ├── request-server.ts         # Talep sunucu yardımcıları
│   ├── request-shared.ts         # Talep paylaşılan tipler
│   └── utils.ts                  # Genel yardımcılar
├── prisma/
│   └── schema.prisma             # 📐 Veritabanı şeması (kaynak dosya)
├── scripts/
│   ├── seed.ts                   # Veritabanı seed verisi
│   ├── business-indexes.ts       # Veritabanı indeks oluşturma
│   └── ...                       # Test ve kontrol scriptleri
├── .env.example                  # Ortam değişkenleri şablonu
├── tailwind.config.ts            # Tailwind yapılandırması
├── tsconfig.json                 # TypeScript yapılandırması
└── next.config.js                # Next.js yapılandırması
```

### Veritabanı Şeması (Özet)

```
User            — Kullanıcılar (vatandaş/işletme/belediye/yönetici)
Ticket          — Belediye bildirimleri
TicketEvent     — Bildirim durum geçmişi
Announcement    — Belediye duyuruları
Business        — İşletme profilleri
BusinessEvent   — İşletme denetim geçmişi
ServiceRequest  — Hizmet talepleri
Offer           — İşletme teklifleri
Upload          — Dosya yüklemeleri
TourismPlace    — Turizm noktaları (Yakında)
AcademyCourse   — Akademi kursları (Yakında)
ClassificationCache — AI sınıflandırma önbelleği
RateLimitBucket — Oran sınırlama
```

### Roller ve Yetkiler

| Rol | Yetkiler |
|-----|----------|
| `CITIZEN` | Bildirim oluşturma, hizmet talebi, işletme keşfi, teklif alma |
| `BUSINESS` | İşletme profili yönetimi, gelen talepleri görme, teklif gönderme |
| `MUNICIPAL_ADMIN` | Bildirim yönetimi, duyuru oluşturma, belediye paneli |
| Platform Yönetici | İşletme onay/ret, platform moderasyonu (ayrı `isPlatformAdmin` flag) |

### Kurulum

```bash
# 1. Depoyu klonla
git clone https://github.com/bizimharman/istanbul.git
cd istanbul

# 2. Bağımlılıkları yükle
yarn install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle — kendi PostgreSQL bağlantı bilgilerini gir

# 4. Veritabanını oluştur
yarn prisma db push

# 5. (İsteğe bağlı) Veritabanı indekslerini oluştur
yarn tsx scripts/business-indexes.ts

# 6. Admin kullanıcı oluştur (seed)
yarn prisma db seed

# 7. Geliştirme sunucusunu başlat
yarn dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

### Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `NEXTAUTH_SECRET` | NextAuth.js oturum şifreleme anahtarı (32+ karakter) |
| `NEXTAUTH_URL` | Uygulama URL'si (geliştirmede `http://localhost:3000`) |
| `ABACUSAI_API_KEY` | (İsteğe bağlı) AI özellikler için Abacus.AI API anahtarı |

---

## 🇬🇧 English

### Vision

Istanbul — one of the world's most complex and vibrant metropolises with 16 million residents, 39 districts, and thousands of years of history. This platform takes Istanbul as its starting point to build a **scalable smart city infrastructure for Turkey's major cities**.

Core philosophy:
- 🏛️ **Transparent governance** — Citizen reports are trackable, municipal responses visible
- 🤝 **Business ecosystem** — Local businesses are discoverable, verifiable, and integrated into a demand-offer cycle
- 🤖 **AI-powered** — Complaint classification, smart matching, content generation
- 📱 **Citizen-centric** — Everything designed to simplify the citizen's daily life

### Current Features (v0.1)

#### 🎫 Municipal Ticketing System
- Citizens create reports across categories: infrastructure, transport, cleaning, parks
- AI-powered automatic categorization and prioritization
- Municipal admins review, update status, and add notes to tickets
- Full event history and status tracking (Open → In Progress → Resolved / Rejected)
- District-based filtering and statistics

#### 🏢 Business Discovery & Ownership Platform
- Business owners create profiles (category, service districts, hours, contact info)
- Platform admins verify ownership and approve publication
- Public discovery page with name, category, and district filtering
- SEO-friendly profiles (LocalBusiness JSON-LD, dynamic sitemap)
- Status flow: DRAFT → PENDING → PUBLISHED / CHANGES_REQUESTED / SUSPENDED
- Stale-revision protection (409 Conflict), concurrent edit safety

#### 📋 Service Request → Offer Flow
- Citizens create service requests (category, district, budget range, timeline)
- System automatically matches eligible businesses (category + service district)
- Matched businesses send offers (price, timeline, description)
- Citizens compare offers, accept or decline
- Non-accepted pending offers are automatically declined

#### 📢 Announcement System
- Water/electricity outages, road work, events, general announcements
- District-based targeting
- Citizen notifications and tracking

#### 🛡️ Security & Authorization
- Role-based access control: Citizen / Business Owner / Municipal Admin / Platform Admin
- NextAuth.js credentials-based authentication
- Platform admin is independent from municipal role (separate `isPlatformAdmin` flag)
- Rate limiting (sliding 24-hour window, actor-based)
- Origin validation, CSRF protection
- Advisory locks for race condition prevention

### Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Core Platform (tickets, businesses, request-offer) | ✅ Complete |
| **Phase 2** | Trust Layer (reviews, messaging, appointments, dispute resolution) | 🔜 Next |
| **Phase 3** | AI & Data (smart matching, NLP reports, predictive maintenance, city analytics) | 📋 Planned |
| **Phase 4** | Tourism & Culture (AI route planner, historical guide, events, i18n) | 📋 Planned |
| **Phase 5** | IoT & Infrastructure (real-time dashboards, sensors, smart lighting) | 📋 Planned |
| **Phase 6** | Transparency & Participation (blockchain procurement, public spending, voting) | 📋 Planned |
| **Phase 7** | Mobile & Accessibility (React Native app, GIS, voice input, offline mode) | 📋 Planned |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router, Server Components, Turbopack) |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Language | TypeScript 5.x (strict) |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | NextAuth.js (Credentials Provider) |
| AI | Abacus.AI LLM API |
| Deployment | Abacus.AI Platform / Vercel / Docker |

### Quick Start

```bash
git clone https://github.com/bizimharman/istanbul.git
cd istanbul
yarn install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
yarn prisma db push
yarn prisma db seed
yarn dev
```

Open `http://localhost:3000` in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Session encryption key (32+ chars) |
| `NEXTAUTH_URL` | App URL (use `http://localhost:3000` for dev) |
| `ABACUSAI_API_KEY` | (Optional) Abacus.AI API key for AI features |

### Database Schema

The complete schema is defined in `prisma/schema.prisma`. Key models:

- **User** — citizens, business owners, municipal admins, platform admins
- **Ticket / TicketEvent** — municipal reports with full audit trail
- **Business / BusinessEvent** — business profiles with ownership verification
- **ServiceRequest / Offer** — demand-offer marketplace
- **Announcement** — municipal announcements
- **TourismPlace / AcademyCourse** — future modules (tourism, education)

---

## 🤝 Katkıda Bulunma / Contributing

Bu proje aktif geliştirme aşamasındadır. Katkıda bulunmak için:

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/ozellik-adi`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik'`)
4. Branch'inizi push edin (`git push origin feature/ozellik-adi`)
5. Pull Request açın

---

## 📄 Lisans / License

MIT License — Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<div align="center">

**İstanbul'u birlikte akıllı yapıyoruz. 🌉**

*Building a smarter Istanbul, together.*

</div>