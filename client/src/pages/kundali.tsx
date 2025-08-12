import { useState } from "react";
import KundaliForm from "@/components/kundali/KundaliForm";
import PaymentSection from "@/components/kundali/PaymentSection";
import ResultSection from "@/components/kundali/ResultSection";
import { Loader2 } from "lucide-react";
import type { KundaliFormData, KundaliData } from "@/types/kundali";

export default function KundaliPage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'loading' | 'result'>('form');
  const [formData, setFormData] = useState<KundaliFormData | null>(null);
  const [kundaliData, setKundaliData] = useState<KundaliData | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleFormSubmit = (data: KundaliFormData) => {
    setFormData(data);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (razorpayPaymentId: string) => {
    setPaymentId(razorpayPaymentId);
    setCurrentStep('loading');
  };

  const handleKundaliGenerated = (data: KundaliData) => {
    setKundaliData(data);
    setCurrentStep('result');
  };

  return (
    <div className="cosmic-bg min-h-screen">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black gradient-text mb-4 animate-float">
            Know Your Kundali
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover your cosmic destiny through authentic Vedic astrology. Generate your personalized birth chart with precise planetary positions and divine insights.
          </p>
          
          {/* Privacy Notice */}
          <div className="glassmorphism rounded-2xl p-4 mt-6 border border-mystical-500/30">
            <p className="text-white/90 text-sm">
              🔒 Your personal information is completely secure and will never be stored or shared. All data is processed in real-time and deleted immediately after chart generation.
            </p>
          </div>
        </header>

        {/* Form Step */}
        {currentStep === 'form' && (
          <KundaliForm onSubmit={handleFormSubmit} />
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && formData && (
          <PaymentSection 
            formData={formData}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {/* Loading Step */}
        {currentStep === 'loading' && formData && paymentId && (
          <div className="glassmorphism rounded-2xl p-8 text-center">
            <div className="spinner mb-4"></div>
            <p className="text-magical-500 font-semibold text-xl mb-2">
              Calculating cosmic positions...
            </p>
            <p className="text-white/70 text-sm">
              Please wait while we generate your personalized Kundali using traditional Vedic astrology methods
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-magical-500" />
              <span className="text-magical-500 text-sm">
                Processing payment and connecting to astronomical servers...
              </span>
            </div>
            {/* Auto-trigger kundali generation */}
            <KundaliGenerator 
              formData={formData}
              paymentId={paymentId}
              onGenerated={handleKundaliGenerated}
            />
          </div>
        )}

        {/* Result Step */}
        {currentStep === 'result' && kundaliData && formData && (
          <ResultSection 
            kundaliData={kundaliData}
            formData={formData}
            paymentId={paymentId}
          />
        )}
      </div>
    </div>
  );
}

// Component to handle automatic kundali generation after payment
function KundaliGenerator({ 
  formData, 
  paymentId, 
  onGenerated 
}: { 
  formData: KundaliFormData;
  paymentId: string;
  onGenerated: (data: KundaliData) => void;
}) {
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateKundali = async () => {
    if (hasGenerated) return;
    setHasGenerated(true);

    try {
      const response = await fetch('/api/kundali/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          paymentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate kundali');
      }

      const data = await response.json();
      onGenerated(data);
    } catch (error) {
      console.error('Error generating kundali:', error);
      alert('Failed to generate kundali. Please contact support with your payment ID: ' + paymentId);
    }
  };

  // Auto-generate kundali when component mounts
  useState(() => {
    const timer = setTimeout(generateKundali, 2000);
    return () => clearTimeout(timer);
  });

  return null;
}
