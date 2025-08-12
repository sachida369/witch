import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Shield, Zap } from "lucide-react";
import type { KundaliFormData } from "@/types/kundali";

interface PaymentSectionProps {
  formData: KundaliFormData;
  onPaymentSuccess: (paymentId: string) => void;
  onBack: () => void;
}

export default function PaymentSection({ formData, onPaymentSuccess, onBack }: PaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const initializePayment = async () => {
    setIsProcessing(true);

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5000, // ₹50 in paise
          currency: 'INR',
          description: 'Kundali Generation Service',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay checkout
      const options = {
        key: "rzp_live_Hd6RirzluzFacK", // Live key from env
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Witchcard Astrology",
        description: "Authentic Vedic Kundali Generation",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop&crop=center",
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              onPaymentSuccess(response.razorpay_payment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: "customer@witchcard.shop",
          contact: "9999999999"
        },
        notes: {
          purpose: "Kundali Generation",
          birth_place: formData.placeOfBirth,
          birth_date: formData.dateOfBirth,
        },
        theme: {
          color: "#6c5ce7"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        alert('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="glassmorphism rounded-3xl p-8">
      <div className="text-center mb-8">
        <h3 className="font-orbitron text-3xl text-ethereal-500 mb-4">
          🌟 Complete Your Cosmic Reading
        </h3>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Your birth details are ready. Complete the secure payment to unlock your personalized Kundali with detailed planetary analysis using authentic Vedic astrology methods.
        </p>
      </div>

      {/* Order Summary */}
      <div className="glassmorphism rounded-2xl p-6 mb-8 max-w-md mx-auto">
        <h4 className="font-orbitron text-xl text-ethereal-500 mb-4 text-center">Order Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Service:</span>
            <span className="text-white font-semibold">Vedic Kundali Generation</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Name:</span>
            <span className="text-white font-semibold">{formData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Birth Date:</span>
            <span className="text-white font-semibold">
              {new Date(formData.dateOfBirth).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Location:</span>
            <span className="text-white font-semibold truncate max-w-32" title={formData.placeOfBirth}>
              {formData.placeOfBirth}
            </span>
          </div>
          <hr className="border-white/10" />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-magical-500">Total:</span>
            <span className="text-magical-500">₹50.00</span>
          </div>
        </div>
      </div>

      {/* Payment Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="glassmorphism rounded-xl p-4 text-center">
          <Shield className="h-8 w-8 text-ethereal-500 mx-auto mb-2" />
          <h5 className="text-white font-semibold text-sm mb-1">Secure Payment</h5>
          <p className="text-white/70 text-xs">256-bit SSL encryption</p>
        </div>
        <div className="glassmorphism rounded-xl p-4 text-center">
          <Zap className="h-8 w-8 text-magical-500 mx-auto mb-2" />
          <h5 className="text-white font-semibold text-sm mb-1">Instant Access</h5>
          <p className="text-white/70 text-xs">Immediate kundali generation</p>
        </div>
        <div className="glassmorphism rounded-xl p-4 text-center">
          <CreditCard className="h-8 w-8 text-mystical-500 mx-auto mb-2" />
          <h5 className="text-white font-semibold text-sm mb-1">Multiple Options</h5>
          <p className="text-white/70 text-xs">Card, UPI, Net Banking</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border-mystical-500/50 text-mystical-500 hover:bg-mystical-500/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Form
        </Button>
        
        <Button
          onClick={initializePayment}
          disabled={isProcessing}
          className="w-full sm:w-auto pay-btn px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
        >
          {isProcessing ? (
            <>
              <div className="spinner w-4 h-4 mr-2" />
              Processing...
            </>
          ) : (
            <>
              💳 Pay ₹50 & Get Kundali
            </>
          )}
        </Button>
      </div>

      <p className="text-white/60 text-xs text-center mt-6">
        Powered by Razorpay • Your payment is secure and encrypted
      </p>
    </div>
  );
}
