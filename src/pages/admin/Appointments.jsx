// /src/pages/admin/AdminAppointments.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Eye, Edit2, User, X } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { toast } from 'react-toastify'

const AdminAppointments = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)

  const dateRange = useMemo(() => {
    const base = new Date(currentDate)
    let start, end
    if (viewMode === 'week') {
      const day = base.getDay()
      start = new Date(base)
      start.setDate(base.getDate() - ((day + 1) % 7 + 1))
      end = new Date(start)
      end.setDate(start.getDate() + 6)
    } else {
      start = new Date(base.getFullYear(), base.getMonth(), 1)
      end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
    }
    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    }
  }, [currentDate, viewMode])

  const fetchAppointments = async () => {
    const formData = new FormData()
    formData.append('date_from', dateRange.from)
    formData.append('date_to', dateRange.to)
    formData.append('filter', 'all')

    const response = await api.post('/booking/viewAllAppointments.php', formData, { withCredentials: true })
    return response
  }

  const fetchStaff = async () => {
    try {
      const formData = new FormData()
      formData.append('user_id', user.id)
      formData.append('role', user.role)
      const res = await api.post('/staff/getStaffDetails.php', formData, { withCredentials: true })
      setStaffList(res.data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('فشل تحميل الموظفين')
    }
  }

  // Load staff list when component mounts
  useEffect(() => {
    fetchStaff()
  }, [])

  const { data: result, isLoading, isError, refetch } = useQuery(
    ['admin-appointments', dateRange.from, dateRange.to, viewMode],
    fetchAppointments,
    {
      refetchOnWindowFocus: false
    }
  )

  const schedule = useMemo(() => {
    const grouped = {}
    const appointments = result?.data || []
    appointments.forEach(appt => {
      const date = appt.date
      if (date) {
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(appt)
      }
    })
    return grouped
  }, [result])

  const updateStatus = useMutation(async ({ appointmentId, status }) => {
    const formData = new FormData()
    formData.append('user_id', user.id)
    formData.append('role', user.role)
    formData.append('appointment_id', appointmentId)
    formData.append('status', status)
    formData.append('csrf_token', localStorage.getItem('auth_token') || '')
    const response = await api.post('/staff/staffUpdateBookingStatus.php', formData, { withCredentials: true })
    return response
  }, {
    onSuccess: () => {
      toast.success('تم تحديث الحالة بنجاح')
      queryClient.invalidateQueries(['admin-appointments'])
      setShowStatusModal(false)
    },
    onError: () => toast.error('فشل تحديث الحالة')
  })

  const assignStaff = useMutation(async ({ appointmentId, staffId }) => {
    const formData = new FormData()
    formData.append('user_id', user.id)
    formData.append('role', user.role)
    formData.append('appointment_id', appointmentId)
    formData.append('staff_id', staffId)
    formData.append('csrf_token', localStorage.getItem('auth_token') || '')
    const response = await api.post('/staff/assignStaff.php', formData, { withCredentials: true })
    return response
  }, {
    onSuccess: () => {
      toast.success('تم تعيين الموظف بنجاح')
      queryClient.invalidateQueries(['admin-appointments'])
      setShowAssignModal(false)
    },
    onError: () => toast.error('فشل تعيين الموظف')
  })

  const weekDays = useMemo(() => {
    const days = []
    const start = new Date(dateRange.from)
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }, [dateRange.from])

  const navigateDate = useCallback((direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      else newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }, [viewMode])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغى',
    }
    return labels[status] || status
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = (appointment) => {
    setSelectedAppointment(appointment)
    setShowStatusModal(true)
  }

  const handleAssignStaff = (appointment) => {
    setSelectedAppointment(appointment)
    setShowAssignModal(true)
  }

  if (isLoading) return <div className="min-h-screen gradient-bg"><Header /><LoadingSpinner /><Footer /></div>
  if (isError) return <div className="min-h-screen gradient-bg"><Header /><div className="p-8 text-center">حدث خطأ أثناء تحميل المواعيد</div><Footer /></div>

  return (
    <div className="min-h-screen gradient-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header and Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <button className="btn-outline" onClick={() => navigateDate('prev')}>
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-lg font-bold">
              الأسبوع من {new Date(dateRange.from).toLocaleDateString('ar-EG')} إلى {new Date(dateRange.to).toLocaleDateString('ar-EG')}
            </div>
            <button className="btn-outline" onClick={() => navigateDate('next')}>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayKey = day.toISOString().split('T')[0]
            const appointments = schedule[dayKey] || []
            const isToday = dayKey === new Date().toISOString().split('T')[0]

            return (
              <div key={dayKey} className={`card p-4 ${isToday ? 'ring-2 ring-primary-200' : ''}`}>
                <div className="text-center mb-4">
                  <h3 className={`font-bold ${isToday ? 'text-primary-200' : 'text-gray-900'}`}>
                    {day.toLocaleDateString('ar-SA', { weekday: 'long' })}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {day.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <div key={appointment.appointment_id} className="p-3 bg-gray-50 rounded-lg border-r-4 border-primary-200">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{appointment.client_name}</p>
                        <p className="text-xs text-gray-600">{appointment.service_name}</p>
                        <p className="text-xs text-gray-500">₪{appointment.price}</p>

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="p-1 text-primary-500 hover:bg-primary-50 rounded"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appointment)}
                            className="p-1 text-green-500 hover:bg-green-50 rounded"
                            title="تغيير الحالة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAssignStaff(appointment)}
                            className="p-1 text-indigo-500 hover:bg-indigo-50 rounded"
                            title="تعيين موظف"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm">لا توجد مواعيد</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">تفاصيل الموعد</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">العميل:</div>
                <div className="col-span-2">{selectedAppointment.client_name}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">الخدمة:</div>
                <div className="col-span-2">{selectedAppointment.service_name}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">الموظف:</div>
                <div className="col-span-2">{selectedAppointment.staff_name || 'غير معين'}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">التاريخ:</div>
                <div className="col-span-2">{selectedAppointment.date}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">الوقت:</div>
                <div className="col-span-2">{selectedAppointment.time}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">السعر:</div>
                <div className="col-span-2">{selectedAppointment.price} ₪</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">الحالة:</div>
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusLabel(selectedAppointment.status)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 font-medium text-gray-600">الملاحظات:</div>
                <div className="col-span-2">{selectedAppointment.notes || '—'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="btn-primary"
                onClick={() => {
                  setShowDetailsModal(false)
                  handleUpdateStatus(selectedAppointment)
                }}
              >
                تغيير الحالة
              </button>
              <button 
                className="btn-outline" 
                onClick={() => setShowDetailsModal(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">تحديث حالة الموعد</h3>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="mb-4">
              تغيير حالة الموعد لـ <span className="font-bold">{selectedAppointment.client_name}</span> في تاريخ <span className="font-bold">{selectedAppointment.date}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                className={`p-3 rounded-lg border-2 ${selectedAppointment.status === 'confirmed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => {
                  updateStatus.mutate({
                    appointmentId: selectedAppointment.appointment_id,
                    status: 'confirmed'
                  })
                }}
              >
                <div className="text-blue-600 font-medium">مؤكد</div>
                <p className="text-xs text-gray-500 mt-1">تأكيد الموعد</p>
              </button>
              
              <button
                className={`p-3 rounded-lg border-2 ${selectedAppointment.status === 'completed' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                onClick={() => {
                  updateStatus.mutate({
                    appointmentId: selectedAppointment.appointment_id,
                    status: 'completed'
                  })
                }}
              >
                <div className="text-green-600 font-medium">مكتمل</div>
                <p className="text-xs text-gray-500 mt-1">تم تقديم الخدمة</p>
              </button>
              
              <button
                className={`p-3 rounded-lg border-2 ${selectedAppointment.status === 'pending' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}
                onClick={() => {
                  updateStatus.mutate({
                    appointmentId: selectedAppointment.appointment_id,
                    status: 'pending'
                  })
                }}
              >
                <div className="text-yellow-600 font-medium">قيد الانتظار</div>
                <p className="text-xs text-gray-500 mt-1">في انتظار التأكيد</p>
              </button>
              
              <button
                className={`p-3 rounded-lg border-2 ${selectedAppointment.status === 'cancelled' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                onClick={() => {
                  updateStatus.mutate({
                    appointmentId: selectedAppointment.appointment_id,
                    status: 'cancelled'
                  })
                }}
              >
                <div className="text-red-600 font-medium">ملغى</div>
                <p className="text-xs text-gray-500 mt-1">إلغاء الموعد</p>
              </button>
            </div>

            <div className="flex justify-end">
              <button 
                className="btn-outline" 
                onClick={() => setShowStatusModal(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">تعيين موظف للموعد</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="mb-4">
              اختر موظف لموعد <span className="font-bold">{selectedAppointment.client_name}</span> في تاريخ <span className="font-bold">{selectedAppointment.date}</span> الساعة <span className="font-bold">{selectedAppointment.time}</span>
            </p>

            {staffList.length > 0 ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700">اختر موظف</h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {staffList.map((staff) => (
                      <button
                        key={staff.staff_id}
                        className="w-full text-right p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 space-x-reverse mb-2 border border-gray-100"
                        onClick={() => {
                          assignStaff.mutate({
                            appointmentId: selectedAppointment.appointment_id,
                            staffId: staff.staff_id
                          })
                        }}
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-200" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{staff.full_name}</div>
                          <div className="text-xs text-gray-500">{staff.notes || 'لا توجد ملاحظات'}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">لا يوجد موظفين متاحين</p>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button 
                className="btn-outline" 
                onClick={() => setShowAssignModal(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdminAppointments