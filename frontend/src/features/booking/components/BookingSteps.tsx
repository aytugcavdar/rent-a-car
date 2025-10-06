interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface BookingStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

const BookingSteps = ({ currentStep, onStepClick, completedSteps = [] }: BookingStepsProps) => {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Araç Seçimi',
      description: 'Araç ve tarih seçin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      number: 2,
      title: 'Rezervasyon Detayları',
      description: 'Lokasyon ve bilgiler',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'Ödeme',
      description: 'Ödeme bilgileri',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      number: 4,
      title: 'Onay',
      description: 'Rezervasyon tamamlandı',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'text-blue-600',
          circle: 'bg-blue-600 border-blue-600 text-white',
          connector: 'bg-blue-600',
        };
      case 'current':
        return {
          container: 'text-blue-600',
          circle: 'bg-blue-50 border-blue-600 text-blue-600 ring-4 ring-blue-100',
          connector: 'bg-gray-300',
        };
      default:
        return {
          container: 'text-gray-400',
          circle: 'bg-white border-gray-300 text-gray-400',
          connector: 'bg-gray-300',
        };
    }
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number);
            const styles = getStepStyles(status);
            const isClickable = onStepClick && (status === 'completed' || status === 'current');

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle and Content */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <button
                    onClick={() => isClickable && onStepClick(step.number)}
                    disabled={!isClickable}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      styles.circle
                    } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                  >
                    {status === 'completed' ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className={styles.container}>{step.icon}</div>
                    )}
                  </button>
                  <div className={`mt-2 text-center ${styles.container}`}>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs mt-1">{step.description}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-0.5 ${styles.connector} transition-all duration-200`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-900">
            Adım {currentStep} / {steps.length}
          </span>
          <span className="text-sm text-gray-600">{steps[currentStep - 1]?.title}</span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
            ></div>
          </div>
        </div>

        {/* Current Step Details */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
              {steps[currentStep - 1]?.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{steps[currentStep - 1]?.title}</p>
              <p className="text-sm text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>
        </div>

        {/* Mini Steps Indicator */}
        <div className="flex justify-center space-x-2 mt-4">
          {steps.map((step) => {
            const status = getStepStatus(step.number);
            return (
              <button
                key={step.number}
                onClick={() => onStepClick && (status === 'completed' || status === 'current') && onStepClick(step.number)}
                disabled={!(status === 'completed' || status === 'current')}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  status === 'completed' || status === 'current'
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Step Navigation Helper */}
      {currentStep > 1 && currentStep <= steps.length && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {currentStep === steps.length
                  ? 'Rezervasyonunuz tamamlanmak üzere!'
                  : 'Formu doldurmaya devam edin'}
              </span>
            </div>
            {currentStep < steps.length && (
              <span className="text-blue-600 font-medium">
                {steps.length - currentStep} adım kaldı
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSteps;