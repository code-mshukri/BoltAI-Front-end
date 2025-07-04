// /src/pages/admin/AdminAppointments.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Eye, Edit2, User } from 'lucide-react'
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
      formData.append('user_id', user.user_id)
      formData.append('role', user.role)
      const res = await api.post('/staff/getStaffDetails.php', formData, { withCredentials: true })
      setStaffList(res.data)
    } catch (error) {
      toast.error('فشل تحميل الموظفين')
    }
  }


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
    formData.append('user_id', user.user_id)
    formData.append('role', user.role)
    formData.append('appointment_id', appointmentId)
    formData.append('status', status)
    formData.append('csrf_token', localStorage.getItem('csrf_token') || '')
    const response = await api.post('/staff/staffUpdateBookingStatus.php', formData, { withCredentials: true })
    return response
  }, {
    onSuccess: () => {
      toast.success('تم تحديث الحالة بنجاح')
      refetch()
    },
    onError: () => toast.error('فشل تحديث الحالة')
  })

  const assignStaff = useMutation(async ({ appointmentId, staffId }) => {
    const formData = new FormData()
    formData.append('user_id', user.user_id)
    formData.append('role', user.role)
    formData.append('appointment_id', appointmentId)
    formData.append('staff_id', staffId)
    formData.append('csrf_token', localStorage.getItem('csrf_token') || '')
    const response = await api.post('/staff/assignStaff.php', formData, { withCredentials: true })
    return response
  }, {
    onSuccess: () => {
      toast.success('تم تعيين الموظف بنجاح')
      refetch()
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

  if (isLoading) return <div className="min-h-screen gradient-bg"><Header /><LoadingSpinner /><Footer /></div>
  if (isError) return <div className="min-h-screen gradient-bg"><Header /><div className="p-8 text-center">حدث خطأ أثناء تحميل المواعيد</div><Footer /></div>


  {
    showDetailsModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h3 className="text-xl font-bold mb-4">تفاصيل الموعد</h3>
          <p><strong>العميل:</strong> {selectedAppointment.client_name}</p>
          <p><strong>الخدمة:</strong> {selectedAppointment.service_name}</p>
          <p><strong>الموظف:</strong> {selectedAppointment.staff_name || 'غير معين'}</p>
          <p><strong>التاريخ:</strong> {selectedAppointment.date}</p>
          <p><strong>الوقت:</strong> {selectedAppointment.time}</p>
          <p><strong>الملاحظات:</strong> {selectedAppointment.notes || '—'}</p>

          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-outline" onClick={() => setShowDetailsModal(false)}>إغلاق</button>
          </div>
        </div>
      </div>
    )
  }

  {
    showStatusModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h3 className="text-xl font-bold mb-4">تحديث حالة الموعد</h3>
          <p className="mb-2">اختر الحالة الجديدة:</p>
          <div className="grid grid-cols-2 gap-2">
            {['confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                className="btn"
                onClick={() => {
                  updateStatus.mutate({
                    appointmentId: selectedAppointment.appointment_id,
                    status
                  })
                  setShowStatusModal(false)
                }}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
          <div className="mt-4 text-right">
            <button className="btn-outline" onClick={() => setShowStatusModal(false)}>إلغاء</button>
          </div>
        </div>
      </div>
    )
  }

  {
    showAssignModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h3 className="text-xl font-bold mb-4">تعيين موظف للموعد</h3>

          <select
            className="w-full border border-gray-300 p-2 rounded"
            onChange={(e) => {
              const selectedStaffId = e.target.value
              if (selectedStaffId) {
                assignStaff.mutate({
                  appointmentId: selectedAppointment.appointment_id,
                  staffId: selectedStaffId
                })
                setShowAssignModal(false)
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>اختر الموظف</option>
            {staffList.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name}
              </option>
            ))}
          </select>

          <div className="mt-4 text-right">
            <button className="btn-outline" onClick={() => setShowAssignModal(false)}>إلغاء</button>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen gradient-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* STEP 3: Header and Navigation */}
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

        {/* STEP 2: Weekly Calendar Grid */}
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
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowDetailsModal(true)
                            }}
                            className="btn-icon text-primary-500"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowStatusModal(true)
                            }}
                            className="btn-icon text-green-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              fetchStaff() // make sure this function exists
                              setShowAssignModal(true)
                            }}
                            className="btn-icon text-indigo-500"
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

       {
    showDetailsModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h3 className="text-xl font-bold mb-4">تفاصيل الموعد</h3>
          <p><strong>العميل:</strong> {selectedAppointment.client_name}</p>
          <p><strong>الخدمة:</strong> {selectedAppointment.service_name}</p>
          <p><strong>الموظف:</strong> {selectedAppointment.staff_name || 'غير معين'}</p>
          <p><strong>التاريخ:</strong> {selectedAppointment.date}</p>
          <p><strong>الوقت:</strong> {selectedAppointment.time}</p>
          <p><strong>الملاحظات:</strong> {selectedAppointment.notes || '—'}</p>

          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-outline" onClick={() => setShowDetailsModal(false)}>إغلاق</button>
          </div>
        </div>
      </div>
    )
  }

  {
    showStatusModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h3 className="text-xl font-bold mb-4">تحديث حالة الموعد</h3>
          <p className="mb-2">اختر الحالة الجديدة:</p>
          <div className="grid grid-cols-2 gap-2">
            {['confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                className="btn"
                onClick={() => {
                  updateStatus.mutate({
                    appointmentId: selectedAppointment.appointment_id,
                    status
                  })
                  setShowStatusModal(false)
                }}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
          <div className="mt-4 text-right">
            <button className="btn-outline" onClick={() => setShowStatusModal(false)}>إلغاء</button>
          </div>
        </div>
      </div>
    )
  }

  {
    showAssignModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h3 className="text-xl font-bold mb-4">تعيين موظف للموعد</h3>

          <select
            className="w-full border border-gray-300 p-2 rounded"
            onChange={(e) => {
              const selectedStaffId = e.target.value
              if (selectedStaffId) {
                assignStaff.mutate({
                  appointmentId: selectedAppointment.appointment_id,
                  staffId: selectedStaffId
                })
                setShowAssignModal(false)
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>اختر الموظف</option>
            {staffList.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name}
              </option>
            ))}
          </select>

          <div className="mt-4 text-right">
            <button className="btn-outline" onClick={() => setShowAssignModal(false)}>إلغاء</button>
          </div>
        </div>
      </div>
    )
  }

      <Footer />
    </div>
  )

  
}

export default AdminAppointments
