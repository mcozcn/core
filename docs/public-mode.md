# Açık (Auth'siz) Mod ve Web/Mobil Ortak Veri Erişimi

Bu rehber, uygulamayı oturum açma/kayıt ekranı olmadan (her kullanıcı için doğrudan uygulama ekranı) çalıştırmak ve aynı veriyi hem web hem de mobilden (webview/PWA veya native) görebilmek için yapılması gerekenleri anlatır.

## Özet
- Kod tarafında: Artık uygulama ana sayfası doğrudan açılıyor (`/auth` route'u kullanılmıyor).
- Backend tarafında: Veritabanı (Supabase) erişim izinlerini **anonim (anon)** rolüne göre ayarlamak gerekiyor, aksi halde istemciler veriye erişemez.

---

## 1) Güvenlik seçeneği: Açık (Tamamen Public)
Bu seçenekle uygulama herkese açık olur; hiçbir kimlik doğrulama gerektirmez.

Avantaj:
- Hızlı kurulum, kullanıcılar doğrudan uygulamayı açar.

Risk:
- Herkes verileri okuyup değiştirebilir — genellikle küçük, kapalı/yerel iç kullanım için uygundur, üretimde dikkat gerektirir.

Yapılacaklar (Supabase):
1. Supabase projenize gidin.
2. `Table Editor` -> her tablonuz için Policy (RLS) ekleyin. Örnek basit politika:

```sql
-- Herkese okuma/yazma izni (çok gevşek - dikkatli kullanın)
BEGIN;

CREATE POLICY "allow_anonymous_all" ON public.customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;
```

3. Eğer sadece okuma izni istiyorsanız ve yazmayı sınırlamak istiyorsanız, `FOR SELECT` veya `FOR INSERT/UPDATE` şeklinde özel politikalar ekleyin.
4. Supabase -> Settings -> API bölümündeki `anon` (publishable) anahtarını istemcide kullanın (zaten `VITE_SUPABASE_PUBLISHABLE_KEY` ile yapılandırılmış).

Not: Bu yol güvenlik zafiyetlerine açıktır; üretimde kesinlikle iyi düşünün.

---

## 2) Daha Güvenli Seçenekler (Tavsiye)
- Orta seviyede güvenlik: "Public" ancak yazma iznini kısıtlamak; yalnızca belirli IP'lerden veya özel token sahiplerinden yazma izni verilecek şekilde bir arka uç (serverless function) kullanın.
- En güvenli: Sunucu tarafı bir servis (ör. küçük API) oluşturup bu servis aracılığıyla veri yazma işlemlerini yapın; kullanıcı cihazlarında yalnızca Okuma izni verin.

---

## 3) Mobil erişim (Web / PWA / Native)
- Web (tarayıcı/PWA): Aynı Supabase URL ve `anon` anahtarını kullanın. CORS ayarları tarayıcı kaynaklı isteklere göre Supabase tarafından otomatik yönetilir; ancak kendi backend'iniz varsa Allowed Origins listesine domainlerinizi ekleyin.
- Native mobil uygulama (iOS/Android): SUPABASE_URL ve ANON_KEY'yi uygulamanızda environment veya config ile verin. Native uygulama için CORS kısıtları genellikle uygulanmaz, ancak ağ erişimi ve güvenlik kurallarına dikkat edin.

Örnek mobil yapılandırma:
- iOS / Android: `.env` içinde `SUPABASE_URL` ve `SUPABASE_ANON_KEY` kullanın.
- Webview / PWA: mevcut `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` ile aynı projeye bağlanır.

---

## 4) Kod Tarafında Yapılan Değişiklikler
- `src/App.tsx`: `/auth` route'u kaldırıldı ve uygulama ana rota doğrudan açılır.
- `src/pages/Auth.tsx`: Kayıt (signup) sekmesi ve ilgili kod kaldırıldı (signup devre dışı).
- `src/components/auth/AuthGuard.tsx`: Artık permissive (açık modda çocukları doğrudan render eder) olarak bırakıldı.

---

## 5) Nasıl devam etmeliyiz? (Öneriler)
1. Eğer veriler hassas değilse: Açık modu etkinleştirip Supabase politikalarını `anon` için uygun şekilde ayarlayın.
2. Eğer verilerinizi korumak istiyorsanız: bana söyleyin; ben ya yazma izinlerini sınırlayan bir backend endpoint ekleyecek şekilde veya anonim kullanıcıların sadece okumaya izinli olduğu bir RLS yapılandırması oluşturacak şekilde yardımcı olabilirim.

İsterseniz ben:
- Supabase üzerinde önerilen örnek RLS SQL politikalarını dosyaya eklerim, ya da
- Basit bir serverless function (örn. Vercel veya Netlify) ile güvenli yazma uç noktası örneği hazırlayıp deploy adımlarını gösteririm.

---

Herhangi birini tercih edin veya bana tam gereksinimleri (veri gizliliği, kimlerin düzenleme yapması gerekiyor, dış erişim olacak mı vb.) söyleyin — ben uygun adımları uygularım.

## Guest / Admin Kullanıcıları

- **Misafir (guest)**: Uygulamayı deneyebilir ancak **veri kaydetme/düzenleme işlemleri engellenmiştir**.
- **Admin**: Tam yetkili kullanıcı. Varsayılan admin kullanıcı: **kullanıcı adı** `mos`, **şifre** `mos07`.

Admin girişi için uygulamadaki `Giriş` sayfasını kullanabilirsiniz.