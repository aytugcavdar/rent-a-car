import { Link } from 'react-router-dom'
import Container from '../shared/components/layout/Container'

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Hayalinizdeki Arabayı Kiralayın
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Türkiye'nin en geniş araç filosu ile güvenli ve konforlu yolculuklar
            </p>
            <Link
              to="/cars"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Araçları İncele
            </Link>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container>
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Neden Bizi Tercih Etmelisiniz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenilir Hizmet</h3>
              <p className="text-gray-600">
                Tüm araçlarımız düzenli bakımlı ve sigortalıdır. Yolculuğunuz güvende.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Uygun Fiyatlar</h3>
              <p className="text-gray-600">
                Rekabetçi fiyatlarımız ve özel kampanyalarımızla bütçenize uygun seçenekler.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-600">
                Online rezervasyon yapın, aracınızı hızlıca teslim alın.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-50 rounded-lg p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Araç Filosu</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Şube</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">7/24</div>
              <div className="text-gray-600">Destek</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Hemen Rezervasyon Yapın</h2>
          <p className="text-gray-600 mb-8">
            Binlerce araç arasından size en uygun olanı seçin ve yolculuğa çıkın.
          </p>
          <Link
            to="/cars"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Araçları Keşfet
          </Link>
        </div>
      </Container>
    </div>
  )
}

export default Home