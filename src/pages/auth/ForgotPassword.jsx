import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState('idle'); // idle, loading, success, error
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setRequestStatus('loading');
    
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('full_name', data.full_name || ''); // Optional in some implementations
      
      const response = await api.post('/Auth/forgotPassword.php', formData);
      
      if (response.status === 'success' || response.status === 'success!') {
        setRequestStatus('success');
        toast.success('تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        
        // Navigate to reset verification page
        setTimeout(() => {
          navigate('/auth/reset-verify', { 
            state: { email: data.email }
          });
        }, 2000);
      } else {
        setRequestStatus('error');
        toast.error(response.message || 'فشل في إرسال رمز إعادة التعيين');
      }
    } catch (error) {
      setRequestStatus('error');
      toast.error('حدث خطأ أثناء معالجة طلبك');
    } finally {
      setIsSubmitting(false);
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
            {requestStatus === 'success' ? (
              <div className="text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : requestStatus === 'error' ? (
              <AlertTriangle className="w-10 h-10 text-red-500" />
            ) : (
              <Mail className="w-10 h-10 text-primary-200" />
            )}
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">استعادة كلمة المرور</h2>
          <p className="text-gray-600">
            أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          {requestStatus === 'success' ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
                <p className="font-medium">تم إرسال رمز التحقق بنجاح</p>
                <p className="text-sm mt-1">يرجى التحقق من بريدك الإلكتروني</p>
              </div>
              <p className="text-gray-600 mb-4">
                تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات لإعادة تعيين كلمة المرور.
              </p>
              <button
                onClick={() => navigate('/auth/reset-verify')}
                className="btn-primary w-full"
              >
                متابعة
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email', {
                      required: 'البريد الإلكتروني مطلوب',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'البريد الإلكتروني غير صحيح'
                      }
                    })}
                    type="email"
                    className={`input-field pr-12 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="أدخل بريدك الإلكتروني"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Full Name (optional in some implementations) */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل (اختياري)
                </label>
                <input
                  {...register('full_name')}
                  type="text"
                  className="input-field"
                  placeholder="أدخل اسمك الكامل"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" text="جاري الإرسال..." />
                ) : (
                  'إرسال رمز التحقق'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-primary-200 hover:text-primary-300 font-medium"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;