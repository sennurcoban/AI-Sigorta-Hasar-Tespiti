# 🚗 AI Based Vehicle Damage Detection & Cost Estimation App

Bu proje, araç hasarlarını tespit etmek ve onarım maliyetlerini tahmin etmek için geliştirilmiş bir **Yapay Zeka (AI)** destekli mobil uygulamadır. 

React Native (Expo) ile geliştirilen kullanıcı arayüzü, Python (FastAPI) üzerinde çalışan **YOLOv8** tabanlı bir backend ile haberleşir.

---

## 🏗️ Proje Mimarisi ve Çalışma Mantığı

Bu proje, sektördeki MVP (Minimum Viable Product) standartlarına uygun olarak **Hibrit Yaklaşım** kullanır:

### 1. Aşama: Araç Doğrulama (Vehicle Detection)
*   Kullanıcı fotoğraf yüklediğinde, **YOLOv8n** modeli devreye girer.
*   Soru: *"Bu görselde bir araç var mı?"*
*   Cevap: Evet ise süreç devam eder, Hayır ise kullanıcı uyarılır.

### 2. Aşama: Hasar Tespiti (Damage Detection)
*   Sistem, görsel üzerinde "Eğitilmiş Hasar Modeli"ni çalıştırır.
*   Ezikler (Dent), Çizikler (Scratch) veya Kırıklar (Shatter) tespit edilir.

### 3. Aşama: Konum Bazlı Parça Haritalama (Spatial Heuristic)
*   **Mevcut Yaklaşım:** Yapay zeka bize hasarın görseldeki koordinatlarını (x, y) verir.
*   Sistem, bu koordinatları analiz ederek hasarın hangi parçada olduğunu tahmin eder:
    *   *Hasar Alt Kısımda ise:* → Tampon veya Tekerlek
    *   *Hasar Üst Kısımda ise:* → Tavan veya Ön Cam
    *   *Hasar Ortada ise:* → Kapı veya Çamurluk
    
> *Not: Bu yöntem, generic (her markaya uyan) bir çözüm sunar ve MVP için hızlı sonuç üretir.*

---

## 🚀 Gelecek Vizyonu (Roadmap)
Bu projeyi daha ileriye taşımak ve endüstriyel standartlara getirmek için planlanan geliştirme: **"Marka Odaklı Semantik Bölütleme"**

### Semantic Part Segmentation (Hedeflenen Yöntem)
Şu anki "Konum Tahmini" yerine, yapay zekanın parçaları piksel piksel tanımasıdır.

1.  **Özel Veri Seti:** Örneğin sadece **Mercedes** modelleri için binlerce fotoğraf toplanır.
2.  **Etiketleme (Labeling):** Bu fotoğraflar üzerinde parçalar (Ön Tampon, Kaput, Sağ Far) renkli maskelerle işaretlenir.
3.  **Eğitim:** YOLOv8-Seg veya Mask R-CNN gibi modeller bu veriyle eğitilir.

**Sonuç:** Sistem bir çizik gördüğünde, o çiziğin "piksel olarak" hangi parçanın sınırları içinde kaldığını %99 doğrulukla bilir.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Backend (Python)
Görüntü işleme sunucusunu ayağa kaldırmak için:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```
Sunucu `http://0.0.0.0:8000` adresinde çalışacaktır.

### 2. Frontend (React Native)
Mobil uygulamayı başlatmak için:

```bash
npm install
npx expo start
```

---

## ⚠️ Önemli Not: Gerçek Cihazda Test Etme

Bu proje **Client-Server** mimarisi ile çalışır. 
*   **Mobil Uygulama:** Telefonunuzda çalışır.
*   **Yapay Zeka (Backend):** Bilgisayarınızda çalışır.

Bu yüzden **telefonunuzun çökmesi imkansızdır**; çünkü tüm ağır işlem yükü (AI işlemleri) telefonunuzda değil, bilgisayarınızda yapılır. Telefon sadece fotoğrafı çeker ve bilgisayara gönderir.

**Ancak gerçek telefonda test ederken şunlara dikkat etmelisiniz:**
1.  **Aynı Wi-Fi:** Telefonunuz ve Bilgisayarınız **aynı Wi-Fi ağına** bağlı olmalıdır.
2.  **IP Adresi:** `services/DamageService.js` dosyasındaki `API_URL` kısmına bilgisayarınızın yerel IP adresini yazmalısınız (Örn: `192.168.1.XX`).
    *   *localhost* yazarsanız telefon çalışmaz, çünkü telefonun *localhost*'u kendisidir.

---

## 📱 Teknoloji Yığını
*   **Frontend:** React Native, Expo, React Navigation
*   **Backend:** Python, FastAPI
*   **AI/ML:** Ultralytics YOLOv8, OpenCV, NumPy
*   **Design:** Custom UI Components

---

## ⚠️ Yasal Uyarı
Bu uygulama bir **prototiptir**. Üretilen fiyatlar ve hasar tespitleri, 2025 yılı ortalama piyasa verileri baz alınarak simüle edilmiştir. Kesin ekspertiz raporu yerine geçmez.
