# 🚗 Rent-a-Car Microservices Platform

Modern, ölçeklenebilir ve güvenli araç kiralama sistemi. Node.js, Docker ve mikroservis mimarisi kullanarak geliştirilmiştir.

## 🏗️ Mimari Genel Bakış

### Mikroservisler
- **🚪 API Gateway** (Port 3000) - Merkezi giriş noktası ve yönlendirme
- **🔐 Auth Service** (Port 5001) - Kullanıcı kimlik doğrulama ve yetkilendirme
- **🚗 Car Service** (Port 5002) - Araç yönetimi ve envanter
- **📅 Booking Service** (Port 5003) - Rezervasyon yönetimi
- **💳 Payment Service** (Port 5004) - Ödeme işlemleri ve faturalama
- **📧 Notification Service** (Port 5005) - E-posta, SMS ve push bildirimleri

### Altyapı Bileşenleri
- **🗄️ MongoDB** - Ana veritabanı
- **🐰 RabbitMQ** - Mesaj kuyruğu sistemi
- **🔍 Redis** - Önbellek ve oturum yönetimi
- **🐘 PostgreSQL** - Analitik veriler için (opsiyonel)

## 🚀 Hızlı Başlangıç

### Ön Koşullar
- Docker & Docker Compose
- Node.js 18+ (geliştirme için)
- Git

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd rent-a-car-microservices
```

### 2. Ortam Değişkenlerini Ayarlayın
```bash
cp .env.example .env
# .env dosyasını ihtiyaçlarınıza göre düzenleyin
```

### 3. Servisleri Başlatın
```bash
# Tüm servisleri başlat
docker-compose up --build

# Sadece temel servisleri başlat (analytics hariç)
docker-compose --profile default up --build

# Analitik servisleriyle birlikte başlat
docker-compose --profile analytics up --build
```

### 4. Sağlık Kontrolü
```bash
curl http://localhost:3000/health
curl http://localhost:3000/status
```

## 📋 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register    - Kullanıcı kaydı
POST   /api/auth/login       - Kullanıcı girişi
GET    /api/auth/profile     - Profil bilgileri
PUT    /api/auth/profile     - Profil güncelleme
```

### 🚗 Cars
```
GET    /api/cars             - Araç listesi
GET    /api/cars/:id         - Araç detayı
POST   /api/cars             - Yeni araç ekleme (Admin)
PUT    /api/cars/:id         - Araç güncelleme (Admin)
DELETE /api/cars/:id         - Araç silme (Admin)
GET    /api/cars/categories  - Araç kategorileri
```

### 📅 Bookings
```
GET    /api/bookings         - Rezervasyon listesi
POST   /api/bookings         - Yeni rezervasyon
GET    /api/bookings/:id     - Rezervasyon detayı
DELETE /api/bookings/:id     - Rezervasyon iptali
POST   /api/bookings/check-availability - Müsaitlik kontrolü
```

### 💳 Payments
```
GET    /api/payments         - Ödeme listesi
POST   /api/payments         - Ödeme işlemi
GET    /api/payments/:id     - Ödeme detayı
POST   /api/payments/:id/refund - İade işlemi (Admin)
```

### 📧 Notifications
```
GET    /api/notifications    - Bildirim listesi
POST   /api/notifications/send - Bildirim gönder (Admin)
PUT    /api/notifications/:id/read - Bildirimi okundu işaretle
```

## 🔧 Geliştirme

# Auth service geliştirme
cd services/auth-service && npm install && npm run dev

# Car service geliştirme
cd services/car-service && npm install && npm run dev

# Gateway geliştirme
cd gateway && npm install && npm run dev
```

### Test Etme
```bash
# Tüm testleri çalıştır
npm test

# Belirli bir servisi test et
cd services/auth-service && npm test

# E2E testler
npm run test:e2e
```

### Veritabanı Migration
```bash
# Örnek verileri yükle
npm run seed

# Veritabanını sıfırla
npm run db:reset
```

## 🐳 Docker Compose Profilleri

### Default Profile
```bash
docker-compose up
```
İçerik: Gateway, Auth, Car, Booking, Payment, Notification servisleri + MongoDB + RabbitMQ + Redis

### Analytics Profile
```bash
docker-compose --profile analytics up
```
İçerik: Tüm temel servisler + Analytics Service + PostgreSQL

### Development Profile
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```
Geliştirme için ek araçlar: Adminer, RabbitMQ Management, Redis Commander

## 🔒 Güvenlik

### JWT Authentication
- RS256 algoritması ile imzalanmış tokenler
- Access token süresi: 15 dakika
- Refresh token süresi: 7 gün
- Token rotation desteği

### API Rate Limiting
- IP bazlı: 1000 request / 15 dakika
- User bazlı: 100 request / dakika
- Endpoint bazlı özel limitler

### Data Validation
- Joi şema validasyonu
- SQL injection koruması
- XSS koruması
- CSRF koruması

### Encryption
- Şifreler: bcrypt (12 rounds)
- Hassas veriler: AES-256-GCM
- Database field encryption

## 📊 Monitoring & Logging

### Health Checks
```bash
GET /health                 - Gateway sağlık durumu
GET /status                 - Tüm servislerin durumu
GET /api/{service}/health   - Spesifik servis durumu
```

### Logging
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation ID ile request tracking
- ELK Stack entegrasyonu hazır

### Metrics
- Prometheus metrics endpoint: `/metrics`
- Business metrics: rezervasyon sayısı, gelir, müşteri sayısı
- Technical metrics: response time, error rate, CPU, memory

## 🔧 Konfigürasyon

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://user:pass@host:port/db
REDIS_URI=redis://:pass@host:port
POSTGRES_URI=postgresql://user:pass@host:port/db

# Services
JWT_SECRET=your-256-bit-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
STRIPE_SECRET_KEY=sk_test_...

# Notifications
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
```

### Feature Flags
```javascript
const features = {
  ENABLE_SMS_NOTIFICATIONS: process.env.ENABLE_SMS === 'true',
  ENABLE_PAYMENT_GATEWAY: process.env.ENABLE_PAYMENT === 'true',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true'
};
```

## 📱 Frontend Integration

### React/Vue.js Client
```javascript
// API Client örneği
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Araç listesi al
const cars = await apiClient.get('/cars');

// Rezervasyon oluştur
const booking = await apiClient.post('/bookings', {
  carId: '...',
  startDate: '2024-01-15',
  endDate: '2024-01-20'
});
```

### Mobile App (React Native)
```javascript
// Push notification setup
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function(notification) {
    // Rezervasyon bildirimleri
    if (notification.data.type === 'booking_confirmed') {
      NavigationService.navigate('BookingDetails', {
        bookingId: notification.data.bookingId
      });
    }
  }
});
```

## 🚀 Deployment

### Production Deployment
```bash
# Production build
NODE_ENV=production docker-compose -f docker-compose.prod.yml up -d

# Kubernetes deployment
kubectl apply -f k8s/

# AWS ECS deployment
aws ecs create-service --cli-input-json file://ecs-service.json
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Deploy to production
        run: |
          docker build -t rentacar:${{ github.sha }} .
          docker push rentacar:${{ github.sha }}
```

### Database Backup
```bash
# MongoDB backup
mongodump --uri="$MONGODB_URI" --out=/backup/$(date +%Y%m%d)

# Automated daily backup
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

## 🔍 Troubleshooting

### Common Issues

**Service bağlantı hatası**
```bash
# Container'ları kontrol et
docker-compose ps

# Log'ları incele
docker-compose logs auth-service

# Network'ü kontrol et
docker network ls
```

**MongoDB bağlantı hatası**
```bash
# MongoDB container'ını yeniden başlat
docker-compose restart mongodb

# Bağlantı test et
docker-compose exec mongodb mongo --eval "db.runCommand('ping')"
```

**RabbitMQ mesaj kuyruğu problemi**
```bash
# RabbitMQ management interface
http://localhost:15672 (guest/guest)

# Kuyrukları temizle
docker-compose exec rabbitmq rabbitmqctl purge_queue booking_created
```

### Performance Optimization

**MongoDB İndeksleme**
```javascript
// Kritik sorgular için compound index
db.bookings.createIndex({ userId: 1, status: 1, createdAt: -1 });
db.cars.createIndex({ category: 1, status: 1, pricePerDay: 1 });
```

**Redis Caching**
```javascript
// Araç listesi cache (5 dakika TTL)
const cacheKey = `cars:${category}:${page}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const cars = await Car.find(query);
await redis.setex(cacheKey, 300, JSON.stringify(cars));
```

## 📚 API Documentation

### Swagger/OpenAPI
- **Gateway Docs**: http://localhost:3000/docs
- **Auth Service**: http://localhost:5001/docs
- **Car Service**: http://localhost:5002/docs

### Postman Collection
```bash
# Import collection
curl -o rentacar.postman_collection.json \
  https://api.postman.com/collections/{collection-id}
```

## 🤝 Contributing

### Development Workflow
1. Issue oluştur veya mevcut issue'yu seç
2. Feature branch oluştur: `git checkout -b feature/new-feature`
3. Kodunu yaz ve testleri geç
4. Commit message formatı: `feat: add new feature`
5. Pull request oluştur

### Code Style
```bash
# ESLint & Prettier
npm run lint
npm run format

# Pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

### Testing Standards
- Unit test coverage: >80%
- Integration testler her endpoint için
- E2E testler kritik user journey'ler için

## 📄 License

MIT License - detaylar için [LICENSE](LICENSE) dosyasını inceleyiniz.


---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!