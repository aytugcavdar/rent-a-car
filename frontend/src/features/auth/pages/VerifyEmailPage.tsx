import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useVerifyEmailMutation, useResendVerificationMutation } from '../api/authApi'
import { Button } from '../../../shared/components/ui/base'
import { ErrorMessage, SuccessMessage, Loading } from '../../../shared/components/ui/feedback'
import Container from '../../../shared/components/layout/Container'

const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation()

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  // URL'den token ve email al
  const token = searchParams.get('token')
  const emailFromUrl = searchParams.get('email')
  const emailFromState = location.state?.email

  const email = emailFromUrl || emailFromState

  useEffect(() => {
    // Eğer token varsa otomatik doğrulama yap
    if (token && email) {
      handleVerify()
    }
  }, [token, email])

  const handleVerify = async () => {
    if (!token || !email) {
      setError('Geçersiz doğrulama linki.')
      setStatus('error')
      return
    }

    setStatus('verifying')
    setError('')

    try {
      await verifyEmail({ token, email }).unwrap()
      setStatus('success')
      
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Verify error:', err)
      setError(err?.data?.message || 'E-posta doğrulanamadı.')
      setStatus('error')
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('E-posta adresi bulunamadı.')
      return
    }

    setError('')
    setResendSuccess(false)

    try {
      await resendVerification({ email }).unwrap()
      setResendSuccess(true)
    } catch (err: any) {
      console.error('Resend error:', err)
      setError(err?.data?.message || 'E-posta gönderilemedi.')
    }
  }

  // Doğrulama işlemi devam ediyor
  if (status === 'verifying') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
        <Container size="sm">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Loading message="E-posta adresiniz doğrulanıyor..." />
          </div>
        </Container>
      </div>
    )
  }

  // Doğrulama başarılı
  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
        <Container size="sm">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <SuccessMessage
              title="E-posta Doğrulandı!"
              message="Hesabınız başarıyla aktifleştirildi. Giriş sayfasına yönlendiriliyorsunuz..."
            />

            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              className="mt-6"
            >
              Giriş Sayfasına Git
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  // Doğrulama bekliyor veya hata
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <Container size="sm">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">E-posta Doğrulama</h1>
            <p className="text-gray-600 mt-2">
              {email ? (
                <>
                  <span className="font-semibold">{email}</span> adresine bir doğrulama linki gönderdik.
                </>
              ) : (
                'E-postanızı kontrol edin'
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage 
              message={error} 
              className="mb-6"
            />
          )}

          {/* Resend Success */}
          {resendSuccess && (
            <SuccessMessage
              message="Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin."
              className="mb-6"
            />
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Nasıl doğrularım?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>E-posta gelen kutunuzu kontrol edin</li>
              <li>Bizden gelen e-postayı bulun</li>
              <li>"E-postamı Doğrula" butonuna tıklayın</li>
              <li>Otomatik olarak giriş sayfasına yönlendirileceksiniz</li>
            </ol>
            <p className="text-xs text-blue-700 mt-3">
              💡 E-postayı bulamıyor musunuz? Spam/gereksiz klasörünü kontrol edin.
            </p>
          </div>

          {/* Resend Button */}
          <div className="space-y-4">
            <Button
              onClick={handleResend}
              variant="outline"
              fullWidth
              isLoading={isResending}
              disabled={resendSuccess}
            >
              Doğrulama E-postasını Tekrar Gönder
            </Button>

            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              fullWidth
            >
              Giriş Sayfasına Dön
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Sorun mu yaşıyorsunuz?{' '}
            <a href="mailto:destek@rentacar.com" className="text-blue-600 hover:text-blue-700">
              Destek ekibimize ulaşın
            </a>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default VerifyEmailPage