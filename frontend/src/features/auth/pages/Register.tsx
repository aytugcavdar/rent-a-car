import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../api/authApi'
import { Button, Input } from '../../../shared/components/ui/base'
import { ErrorMessage, SuccessMessage } from '../../../shared/components/ui/feedback'
import Container from '../../../shared/components/layout/Container'

const Register = () => {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseIssuedDate: '',
    licenseExpirationDate: '',
  })
  
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // İlgili alanın hatasını temizle
    setError('')
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Frontend validation
    if (formData.password !== formData.passwordConfirm) {
      setFieldErrors({ passwordConfirm: 'Şifreler eşleşmiyor!' })
      return
    }

    // FormData oluştur
    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('surname', formData.surname)
    submitData.append('email', formData.email)
    submitData.append('password', formData.password)
    submitData.append('phone', formData.phone)
    submitData.append('address', formData.address)
    submitData.append('licenseNumber', formData.licenseNumber)
    submitData.append('licenseIssuedDate', formData.licenseIssuedDate)
    submitData.append('licenseExpirationDate', formData.licenseExpirationDate)

    if (avatar) {
      submitData.append('avatar', avatar)
    }

    try {
      await register(submitData).unwrap()
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/verify-email', { state: { email: formData.email } })
      }, 3000)
    } catch (err: any) {
      console.error('Register error:', err)
      
      // Backend validation hatalarını işle
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const errors: Record<string, string> = {}
        err.data.errors.forEach((error: { field: string; message: string }) => {
          errors[error.field] = error.message
        })
        setFieldErrors(errors)
        setError('Lütfen formdaki hataları düzeltin.')
      } else {
        setError(err?.data?.message || 'Kayıt olurken bir hata oluştu.')
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
        <Container size="sm">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <SuccessMessage
              title="Kayıt Başarılı!"
              message="E-posta adresinize bir doğrulama linki gönderdik. Lütfen e-postanızı kontrol edin."
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                E-posta doğrulama sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <Container size="md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white rounded-lg p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Kayıt Ol</h1>
            <p className="text-gray-600 mt-2">Yeni hesap oluşturun</p>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage 
              message={error} 
              className="mb-6"
            />
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Profil fotoğrafı (İsteğe bağlı)</p>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Ad"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız"
                required
                fullWidth
                error={fieldErrors.name}
              />

              <Input
                label="Soyad"
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Soyadınız"
                required
                fullWidth
                error={fieldErrors.surname}
              />
            </div>

            <Input
              label="E-posta"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
              required
              fullWidth
              error={fieldErrors.email}
            />

            <Input
              label="Telefon"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+90 555 123 4567"
              required
              fullWidth
              error={fieldErrors.phone}
              helperText="Örnek: +905551234567 veya 05551234567"
            />

            <Input
              label="Adres"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Tam adresiniz (en az 10 karakter)"
              required
              fullWidth
              error={fieldErrors.address}
            />

            {/* Driver License Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ehliyet Bilgileri</h3>
              
              <div className="space-y-4">
                <Input
                  label="Ehliyet Numarası"
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="12345678"
                  required
                  fullWidth
                  error={fieldErrors.licenseNumber}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Verilme Tarihi"
                    type="date"
                    name="licenseIssuedDate"
                    value={formData.licenseIssuedDate}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={fieldErrors.licenseIssuedDate}
                    max={new Date().toISOString().split('T')[0]}
                  />

                  <Input
                    label="Geçerlilik Tarihi"
                    type="date"
                    name="licenseExpirationDate"
                    value={formData.licenseExpirationDate}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={fieldErrors.licenseExpirationDate}
                    min={formData.licenseIssuedDate || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Şifre Belirleyin</h3>
              
              <div className="space-y-4">
                <Input
                  label="Şifre"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="En az 8 karakter"
                  required
                  fullWidth
                  error={fieldErrors.password}
                  helperText="En az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
                />

                <Input
                  label="Şifre Tekrar"
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Şifrenizi tekrar girin"
                  required
                  fullWidth
                  error={fieldErrors.passwordConfirm}
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-600">
                <Link to="/terms" className="text-blue-600 hover:text-blue-700">Kullanım koşullarını</Link>
                {' '}ve{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700">gizlilik politikasını</Link>
                {' '}okudum ve kabul ediyorum.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Kayıt Ol
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Register