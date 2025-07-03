import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { 
  Search, Plus, Edit, Eye, RefreshCw, ChevronDown, ChevronUp, 
  User, Phone, Mail, Calendar, DollarSign, Save, X, Briefcase
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const AdminStaff = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' })
  const queryClient = useQueryClient()

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd },
    reset: resetAdd
  } = useForm()

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue
  } = useForm()

  // Fetch staff list
  const { data: staffData, isLoading, isError, refetch } = useQuery(
    'staff-list',
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        status: 'success',
        data: [
          {
            staff_id: 3,
            full_name: 'Test Staff',
            email: 'staff@example.com',
            phone: '0591234567',
            dob: '1990-01-01',
            salary_per_hour: 50,
            notes: 'Specializes in facial treatments',
            created_at: '2023-05-15'
          },
          {
            staff_id: 4,
            full_name: 'Lana Khalil',
            email: 'lana.khalil@example.com',
            phone: '0591234568',
            dob: '1992-03-14',
            salary_per_hour: 60,
            notes: 'Henna & design specialist',
            created_at: '2023-06-20'
          },
          {
            staff_id: 5,
            full_name: 'Maya Odeh',
            email: 'maya.odeh@example.com',
            phone: '0599876543',
            dob: '1988-07-22',
            salary_per_hour: 55,
            notes: 'Facial treatment specialist',
            created_at: '2023-04-10'
          },
          {
            staff_id: 6,
            full_name: 'Noura Hasan',
            email: 'noura.hasan@example.com',
            phone: '0594447777',
            dob: '1995-11-03',
            salary_per_hour: 65,
            notes: 'Laser expert',
            created_at: '2023-07-05'
          },
          {
            staff_id: 7,
            full_name: 'Rania Samir',
            email: 'rania.samir@example.com',
            phone: '0591122334',
            dob: '1991-01-30',
            salary_per_hour: 50,
            notes: 'Junior stylist',
            created_at: '2024-01-15'
          }
        ]
      }
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Create staff mutation
  const createStaffMutation = useMutation(
    async (staffData) => {
      // Simulate API call
      console.log('Creating staff:', staffData)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        status: 'success',
        message: 'تم إضافة الموظف بنجاح',
        data: {
          staff_id: Math.floor(Math.random() * 1000) + 100,
          ...staffData,
          created_at: new Date().toISOString()
        }
      }
    },
    {
      onSuccess: () => {
        toast.success('تم إضافة الموظف بنجاح')
        setShowAddModal(false)
        resetAdd()
        queryClient.invalidateQueries('staff-list')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في إضافة الموظف')
      }
    }
  )

  // Update staff mutation
  const updateStaffMutation = useMutation(
    async (staffData) => {
      // Simulate API call
      console.log('Updating staff:', staffData)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        status: 'success',
        message: 'تم تحديث بيانات الموظف بنجاح'
      }
    },
    {
      onSuccess: () => {
        toast.success('تم تحديث بيانات الموظف بنجاح')
        setShowEditModal(false)
        setSelectedStaff(null)
        queryClient.invalidateQueries('staff-list')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في تحديث بيانات الموظف')
      }
    }
  )

  // Filter and sort staff
  const filteredStaff = useMemo(() => {
    if (!staffData?.data) return []
    
    let filtered = [...staffData.data]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        staff => 
          staff.full_name.toLowerCase().includes(term) ||
          staff.email.toLowerCase().includes(term) ||
          staff.phone.includes(term)
      )
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    
    return filtered
  }, [staffData, searchTerm, sortConfig])

  // Request sort
  const requestSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  // Get sort direction indicator
  const getSortDirectionIndicator = useCallback((key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }, [sortConfig])

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return ''
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  }, [])

  // Handle add staff form submission
  const onSubmitAdd = (data) => {
    createStaffMutation.mutate({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      salary_per_hour: parseFloat(data.salary_per_hour),
      notes: data.notes || ''
    })
  }

  // Handle edit staff form submission
  const onSubmitEdit = (data) => {
    updateStaffMutation.mutate({
      staff_id: selectedStaff.staff_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      salary_per_hour: parseFloat(data.salary_per_hour),
      notes: data.notes || ''
    })
  }

  // Handle edit button click
  const handleEditClick = (staff) => {
    setSelectedStaff(staff)
    resetEdit()
    
    // Set form values
    setValue('full_name', staff.full_name)
    setValue('email', staff.email)
    setValue('phone', staff.phone)
    setValue('dob', staff.dob)
    setValue('salary_per_hour', staff.salary_per_hour)
    setValue('notes', staff.notes)
    
    setShowEditModal(true)
  }

  // Handle view schedule button click
  const handleViewSchedule = (staffId) => {
    // In a real app, this would navigate to the staff schedule page
    toast.info(`عرض جدول الموظف رقم ${staffId}`)
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الموظفين</h1>
          <p className="text-gray-600">عرض وإدارة جميع موظفي الصالون</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-12 w-full"
              />
            </div>
            
            <div className="flex space-x-2 space-x-reverse w-full md:w-auto">
              <button
                onClick={() => setSearchTerm('')}
                className="btn-outline flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تعيين</span>
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة موظف</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Staff Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">لم نتمكن من تحميل بيانات الموظفين</p>
              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <User className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد موظفين</h3>
              <p className="text-gray-600 mb-4">لم يتم العثور على موظفين يطابقون معايير البحث</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('full_name')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الاسم</span>
                        {getSortDirectionIndicator('full_name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('email')}
                    >
                      <div className="flex items-center justify-end">
                        <span>البريد الإلكتروني</span>
                        {getSortDirectionIndicator('email')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('phone')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الهاتف</span>
                        {getSortDirectionIndicator('phone')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('salary_per_hour')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الراتب/ساعة</span>
                        {getSortDirectionIndicator('salary_per_hour')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('created_at')}
                    >
                      <div className="flex items-center justify-end">
                        <span>تاريخ التعيين</span>
                        {getSortDirectionIndicator('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.staff_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-200" />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {staff.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {staff.notes}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.salary_per_hour} ₪</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(staff.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEditClick(staff)}
                            className="text-blue-600 hover:text-blue-900"
                            title="تعديل"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleViewSchedule(staff.staff_id)}
                            className="text-green-600 hover:text-green-900"
                            title="عرض الجدول"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">إضافة موظف جديد</h2>
            
            <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('full_name', { required: 'الاسم الكامل مطلوب' })}
                    type="text"
                    className={`input-field pr-12 ${errorsAdd.full_name ? 'border-red-500' : ''}`}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                {errorsAdd.full_name && <p className="mt-1 text-sm text-red-600">{errorsAdd.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('email', { 
                      required: 'البريد الإلكتروني مطلوب',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'البريد الإلكتروني غير صحيح'
                      }
                    })}
                    type="email"
                    className={`input-field pr-12 ${errorsAdd.email ? 'border-red-500' : ''}`}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                {errorsAdd.email && <p className="mt-1 text-sm text-red-600">{errorsAdd.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('phone', { 
                      required: 'رقم الهاتف مطلوب',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'رقم الهاتف غير صحيح'
                      }
                    })}
                    type="tel"
                    className={`input-field pr-12 ${errorsAdd.phone ? 'border-red-500' : ''}`}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                {errorsAdd.phone && <p className="mt-1 text-sm text-red-600">{errorsAdd.phone.message}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('dob', { required: 'تاريخ الميلاد مطلوب' })}
                    type="date"
                    className={`input-field pr-12 ${errorsAdd.dob ? 'border-red-500' : ''}`}
                  />
                </div>
                {errorsAdd.dob && <p className="mt-1 text-sm text-red-600">{errorsAdd.dob.message}</p>}
              </div>

              {/* Salary Per Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الراتب بالساعة (₪)</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('salary_per_hour', { 
                      required: 'الراتب بالساعة مطلوب',
                      min: {
                        value: 0,
                        message: 'يجب أن يكون الراتب بالساعة أكبر من 0'
                      }
                    })}
                    type="number"
                    step="0.01"
                    className={`input-field pr-12 ${errorsAdd.salary_per_hour ? 'border-red-500' : ''}`}
                    placeholder="أدخل الراتب بالساعة"
                  />
                </div>
                {errorsAdd.salary_per_hour && <p className="mt-1 text-sm text-red-600">{errorsAdd.salary_per_hour.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  {...registerAdd('notes')}
                  rows="3"
                  className="input-field w-full"
                  placeholder="أدخل ملاحظات إضافية (اختياري)"
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createStaffMutation.isLoading}
                  className="btn-primary"
                >
                  {createStaffMutation.isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" text="" />
                      <span className="mr-2">جاري الإضافة...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
            <button
              onClick={() => {
                setShowEditModal(false)
                setSelectedStaff(null)
              }}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">تعديل بيانات الموظف</h2>
            
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('full_name', { required: 'الاسم الكامل مطلوب' })}
                    type="text"
                    className={`input-field pr-12 ${errorsEdit.full_name ? 'border-red-500' : ''}`}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                {errorsEdit.full_name && <p className="mt-1 text-sm text-red-600">{errorsEdit.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('email', { 
                      required: 'البريد الإلكتروني مطلوب',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'البريد الإلكتروني غير صحيح'
                      }
                    })}
                    type="email"
                    className={`input-field pr-12 ${errorsEdit.email ? 'border-red-500' : ''}`}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                {errorsEdit.email && <p className="mt-1 text-sm text-red-600">{errorsEdit.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('phone', { 
                      required: 'رقم الهاتف مطلوب',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'رقم الهاتف غير صحيح'
                      }
                    })}
                    type="tel"
                    className={`input-field pr-12 ${errorsEdit.phone ? 'border-red-500' : ''}`}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                {errorsEdit.phone && <p className="mt-1 text-sm text-red-600">{errorsEdit.phone.message}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('dob', { required: 'تاريخ الميلاد مطلوب' })}
                    type="date"
                    className={`input-field pr-12 ${errorsEdit.dob ? 'border-red-500' : ''}`}
                  />
                </div>
                {errorsEdit.dob && <p className="mt-1 text-sm text-red-600">{errorsEdit.dob.message}</p>}
              </div>

              {/* Salary Per Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الراتب بالساعة (₪)</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('salary_per_hour', { 
                      required: 'الراتب بالساعة مطلوب',
                      min: {
                        value: 0,
                        message: 'يجب أن يكون الراتب بالساعة أكبر من 0'
                      }
                    })}
                    type="number"
                    step="0.01"
                    className={`input-field pr-12 ${errorsEdit.salary_per_hour ? 'border-red-500' : ''}`}
                    placeholder="أدخل الراتب بالساعة"
                  />
                </div>
                {errorsEdit.salary_per_hour && <p className="mt-1 text-sm text-red-600">{errorsEdit.salary_per_hour.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  {...registerEdit('notes')}
                  rows="3"
                  className="input-field w-full"
                  placeholder="أدخل ملاحظات إضافية (اختياري)"
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedStaff(null)
                  }}
                  className="btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updateStaffMutation.isLoading}
                  className="btn-primary"
                >
                  {updateStaffMutation.isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" text="" />
                      <span className="mr-2">جاري الحفظ...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdminStaff