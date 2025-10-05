// frontend/src/features/cars/components/forms/CarForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Button, Textarea } from '../../../../shared/components/ui/base';
import type { CreateCarDto } from '../../api/carsApi';

interface CarFormProps {
  initialData?: Partial<CreateCarDto>;
  onSubmit: (data: CreateCarDto) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

const CarForm = ({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  submitButtonText = 'Kaydet'
}: CarFormProps) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CreateCarDto>({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    plateNumber: initialData?.plateNumber || '',
    category: initialData?.category || 'economy',
    fuelType: initialData?.fuelType || 'gasoline',
    transmission: initialData?.transmission || 'manual',
    seats: initialData?.seats || 5,
    doors: initialData?.doors || 4,
    pricePerDay: initialData?.pricePerDay || 0,
    currency: initialData?.currency || 'TRY',
    mileage: initialData?.mileage || 0,
    features: initialData?.features || [],
    location: {
      branch: initialData?.location?.branch || '',
      address: initialData?.location?.address || '',
    },
    insurance: {
      company: initialData?.insurance?.company || '',
      policyNumber: initialData?.insurance?.policyNumber || '',
      expiryDate: initialData?.insurance?.expiryDate || '',
    },
  });

  const [featuresInput, setFeaturesInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateCarDto] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['year', 'seats', 'doors', 'pricePerDay', 'mileage'].includes(name) 
          ? Number(value) 
          : value
      }));
    }
  };

  const handleAddFeature = () => {
    if (featuresInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featuresInput.trim()]
      }));
      setFeaturesInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const categoryOptions = [
    { value: 'economy', label: 'Ekonomi' },
    { value: 'compact', label: 'Kompakt' },
    { value: 'intermediate', label: 'Orta' },
    { value: 'standard', label: 'Standart' },
    { value: 'premium', label: 'Premium' },
    { value: 'luxury', label: 'Lüks' },
    { value: 'suv', label: 'SUV' },
    { value: 'minivan', label: 'Minivan' },
  ];

  const fuelTypeOptions = [
    { value: 'gasoline', label: 'Benzin' },
    { value: 'diesel', label: 'Dizel' },
    { value: 'hybrid', label: 'Hibrit' },
    { value: 'electric', label: 'Elektrik' },
  ];

  const transmissionOptions = [
    { value: 'manual', label: 'Manuel' },
    { value: 'automatic', label: 'Otomatik' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Marka"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            fullWidth
          />
          
          <Input
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            fullWidth
          />
          
          <Input
            label="Yıl"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            required
            fullWidth
            min={1900}
            max={new Date().getFullYear() + 1}
          />
          
          <Input
            label="Plaka"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            required
            fullWidth
            placeholder="34 ABC 1234"
          />
          
          <Select
            label="Kategori"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
            required
            fullWidth
          />
          
          <Select
            label="Yakıt Tipi"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            options={fuelTypeOptions}
            required
            fullWidth
          />
          
          <Select
            label="Vites"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            options={transmissionOptions}
            required
            fullWidth
          />
          
          <Input
            label="Koltuk Sayısı"
            name="seats"
            type="number"
            value={formData.seats}
            onChange={handleChange}
            required
            fullWidth
            min={2}
            max={9}
          />
          
          <Input
            label="Kapı Sayısı"
            name="doors"
            type="number"
            value={formData.doors}
            onChange={handleChange}
            fullWidth
            min={2}
            max={5}
          />
          
          <Input
            label="Günlük Fiyat (₺)"
            name="pricePerDay"
            type="number"
            value={formData.pricePerDay}
            onChange={handleChange}
            required
            fullWidth
            min={0}
          />
          
          <Input
            label="Kilometre"
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={handleChange}
            required
            fullWidth
            min={0}
          />
        </div>
      </div>

      {/* Özellikler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Özellikler</h2>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Özellik ekleyin (örn: Klima, ABS)"
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            fullWidth
          />
          <Button type="button" onClick={handleAddFeature} variant="secondary">
            Ekle
          </Button>
        </div>
        
        {formData.features && formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lokasyon Bilgileri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Lokasyon Bilgileri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Şube"
            name="location.branch"
            value={formData.location.branch}
            onChange={handleChange}
            required
            fullWidth
            placeholder="İstanbul Atatürk Havalimanı"
          />
          
          <Input
            label="Adres"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            fullWidth
            placeholder="Yeşilköy Mah. Atatürk Cad."
          />
        </div>
      </div>

      {/* Sigorta Bilgileri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Sigorta Bilgileri (Opsiyonel)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Sigorta Şirketi"
            name="insurance.company"
            value={formData.insurance?.company}
            onChange={handleChange}
            fullWidth
          />
          
          <Input
            label="Poliçe Numarası"
            name="insurance.policyNumber"
            value={formData.insurance?.policyNumber}
            onChange={handleChange}
            fullWidth
          />
          
          <Input
            label="Son Kullanma Tarihi"
            name="insurance.expiryDate"
            type="date"
            value={formData.insurance?.expiryDate}
            onChange={handleChange}
            fullWidth
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/admin/cars')}
          disabled={isLoading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default CarForm;