import api from './api'

export const staffService = {
  async getStaffList() {
    return await api.get('/staff/getStaffList.php')
  },

  async getStaffSchedule(staffId, dateFrom, dateTo) {
    const params = new URLSearchParams()
    if (staffId) params.append('staff_id', staffId)
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    
    return await api.get(`/staff/viewStaffSchedule.php?${params.toString()}`)
  },

  async checkIn() {
    const formData = new FormData()
    
    return await api.post('/staff/check_in.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async checkOut() {
    const formData = new FormData()
    
    return await api.post('/staff/check_out.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async updateBookingStatus(bookingId, status, notes = '') {
    const formData = new FormData()
    formData.append('booking_id', bookingId)
    formData.append('status', status)
    if (notes) formData.append('notes', notes)
    
    return await api.post('/booking/staffUpdateBookingStatus.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}