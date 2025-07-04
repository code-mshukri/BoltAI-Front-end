import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [resendCountdown, setResendCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const inputRefs = Array(6).fill(0).map(() => useRef(null));
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      digit1: '',
      digit2: '',
      digit3: '',
      digit4: '',
      digit5: '',
      digit6: '',
    }
  });

  // Extract email from query params or state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email') || location.state?.email || '';
    setUserEmail(email);
  }, [location]);

  // Watch all digit fields
  const digit1 = watch('digit1');
  const digit2 = watch('digit2');
  const digit3 = watch('digit3');
  const digit4 = watch('digit4');
  const digit5 = watch('digit5');
  const digit6 = watch('digit6');

  // Auto-focus next input field
  useEffect(() => {
    if (digit1) inputRefs[1].current?.focus();
    if (digit2) inputRefs[2].current?.focus();
    if (digit3) inputRefs[3].current?.focus();
    if (digit4) inputRefs[4].current?.focus();
    if (digit5) inputRefs[5].current?.focus();
  }, [digit1, digit2, digit3, digit4, digit5]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    
    const timer = setTimeout(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Handle paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      // If pasted data is exactly 6 digits
      for (let i = 0; i < 6; i++) {
        setValue(`digit${i+1}`, pastedData[i]);
      }
      inputRefs[5].current?.focus();
    }
  };

  // Handle key navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs[index-1].current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      inputRefs[index-1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move to next input on right arrow
      inputRefs[index+1].current?.focus();
    }
  };

  // Handle input change
  const handleInputChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow digits
    if (/^\d*$/.test(value) && value.length <= 1) {
      setValue(`digit${index+1}`, value);
      
      // Auto-submit when all digits are filled
      if (index === 5 && value && 
          digit1 && digit2 && digit3 && digit4 && digit5) {
        setTimeout(() => {
          handleSubmit(onSubmit)();
        }, 300);
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    const verificationCode = Object.values(data).join('');
    
    if (verificationCode.length !== 6) {
      toast.error('الرجاء إدخال الرمز المكون من 6 أرقام');
      return;
    }
    
    setIsSubmitting(true);
    setVerificationStatus('pending');
    
    try {
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('entered_code', verificationCode);
      
      const response = await api.post('/Auth/verify.php', formData);
      
      if (response.status === 'success') {
        setVerificationStatus('success');
        toast.success('تم التحقق من البريد الإلكتروني بنجاح');
        
        // Redirect to login after successful verification
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              verificationSuccess: true,
              email: userEmail
            } 
          });
        }, 2000);
      } else {
        setVerificationStatus('error');
        toast.error(response.message || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      setVerificationStatus('error');
      toast.error('حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (resendCountdown > 0 || !userEmail) return;
    
    try {
      const formData = new FormData();
      formData.append('email', userEmail);
      
      const response = await api.post('/Auth/resend-verification.php', formData);
      
      if (response.status === 'success') {
        toast.success('تم إرسال رمز جديد إلى بريدك الإلكتروني');
        setResendCountdown(60); // Start 60 second countdown
      } else {
        toast.error(response.message || 'فشل في إرسال رمز جديد');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال رمز جديد');
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/login"
        className="absolute top-6 right-6 flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-primary-200 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 transform rotate-180" />
        <span>العودة لتسجيل الدخول</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6"
          >
            {verificationStatus === 'success' ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : verificationStatus === 'error' ? (
              <XCircle className="w-10 h-10 text-red-500" />
            ) : (
              <div className="text-4xl font-bold text-primary-200">6</div>
            )}
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">التحقق من البريد الإلكتروني</h2>
          <p className="text-gray-600">
            أدخل رمز التحقق المكون من 6 أرقام المرسل إلى
            <br />
            <span className="font-medium text-gray-800">{userEmail || 'بريدك الإلكتروني'}</span>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Verification Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                رمز التحقق
              </label>
              <div 
                className="flex justify-between items-center gap-2" 
                onPaste={handlePaste}
              >
                {Array(6).fill(0).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    {...register(`digit${index+1}`, { 
                      required: true,
                      pattern: /^[0-9]$/
                    })}
                    ref={inputRefs[index]}
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent transition-colors ${
                      errors[`digit${index+1}`] 
                        ? 'border-red-500' 
                        : verificationStatus === 'success'
                        ? 'border-green-500'
                        : verificationStatus === 'error'
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || verificationStatus === 'success'}
                  />
                ))}
              </div>
              {errors.digit1 && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  الرجاء إدخال رمز التحقق المكون من 6 أرقام
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || verificationStatus === 'success'}
              className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="جاري التحقق..." />
              ) : verificationStatus === 'success' ? (
                <span className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  تم التحقق بنجاح
                </span>
              ) : (
                'تحقق من الرمز'
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                لم يصلك الرمز؟
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCountdown > 0 || isSubmitting || verificationStatus === 'success'}
                className="text-primary-200 hover:text-primary-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {resendCountdown > 0 ? (
                  <span>إعادة الإرسال بعد {resendCountdown} ثانية</span>
                ) : (
                  <span className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    إعادة إرسال الرمز
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;