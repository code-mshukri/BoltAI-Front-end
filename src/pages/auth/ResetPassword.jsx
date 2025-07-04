import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, Check, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState('idle'); // idle, success, error
  const [userEmail, setUserEmail] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Extract email and verification status from location state
  useEffect(() => {
    const email = location.state?.email || '';
    const verified = location.state?.verified || false;
    
    if (!email || !verified) {
      // Redirect to forgot password if not properly verified
      navigate('/auth/forgot-password');
      return;
    }
    
    setUserEmail(email);
  }, [location, navigate]);

  const password = watch('password', '');

  // Password requirements
  const passwordRequirements = [
    { text: 'على الأقل 8 أحرف', met: password?.length >= 8 },
    { text: 'يحتوي على حرف كبير', met: /[A-Z]/.test(password) },
    { text: 'يحتوي على حرف صغير', met: /[a-z]/.test(password) },
    { text: 'يحتوي على رقم', met: /\d/.test(password) },
    { text: 'يحتوي على رمز خاص', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  // Check if all password requirements are met
  const allRequirementsMet = passwordRequirements.every(req => req.met);

  // Handle form submission
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    if (!allRequirementsMet) {
      toast.error('كلمة المرور لا تستوفي جميع المتطلبات');
      return;
    }
    
    if (data.password !== data.password_confirm) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('new_password', data.password);
      formData.append('password_confirm', data.password_confirm);
      
      const response = await api.post('/Auth/resetPassword.php', formData);
      
      if (response.status === 'success' || response.status === 'success!') {
        setResetStatus('success');
        toast.success('تم إعادة تعيين كلمة المرور بنجاح');
        
        // Redirect to login after successful reset
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              resetSuccess: true,
              email: userEmail
            } 
          });
        }, 2000);
      } else {
        setResetStatus('error');
        toast.error(response.message || 'فشل في إعادة تعيين كلمة المرور');
      }
    } catch (error) {
      setResetStatus('error');
      toast.error('حدث خطأ أثناء إعادة تعيين كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/auth/forgot-password"
        className="absolute top-6 right-6 flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-primary-200 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 transform rotate-180" />
        <span>العودة للخلف</span>
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
            {resetStatus === 'success' ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : resetStatus === 'error' ? (
              <XCircle className="w-10 h-10 text-red-500" />
            ) : (
              <div className="text-4xl font-bold text-primary-200">3/3</div>
            )}
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600">
            أدخل كلمة المرور الجديدة لحسابك
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
          {resetStatus === 'success' ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
                <p className="font-medium">تم إعادة تعيين كلمة المرور بنجاح</p>
                <p className="text-sm mt-1">يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('password', {
                      required: 'كلمة المرور مطلوبة',
                      minLength: {
                        value: 8,
                        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">متطلبات كلمة المرور:</h3>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Check className={`w-3 h-3 ${req.met ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('password_confirm', {
                      required: 'تأكيد كلمة المرور مطلوب',
                      validate: value => value === password || 'كلمات المرور غير متطابقة'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-field pr-12 ${errors.password_confirm ? 'border-red-500' : ''}`}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !allRequirementsMet}
                className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" text="جاري الإرسال..." />
                ) : (
                  'إعادة تعيين كلمة المرور'
                )}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;