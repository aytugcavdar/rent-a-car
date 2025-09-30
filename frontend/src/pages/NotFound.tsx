import { Link } from 'react-router-dom'
import Container from '../shared/components/layout/Container'

const NotFound = () => {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sayfa Bulunamadı
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Üzgünüz, aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            to="/cars"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Araçları İncele
          </Link>
        </div>

        {/* Decorative SVG */}
        <svg 
          className="w-64 h-64 mt-12 text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
    </Container>
  )
}

export default NotFound