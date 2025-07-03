import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  MessageCircle, 
  User, 
  Home, 
  Menu, 
  X,
  Bell,
  Star
} from 'lucide-react';

const DevSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const routes = [
    { 
      title: 'عام',
      links: [
        { name: 'الرئيسية', path: '/', icon: <Home /> },
        { name: 'الخدمات', path: '/services', icon: <Settings /> },
        { name: 'الرسائل', path: '/messages', icon: <MessageCircle /> },
      ]
    },
    {
      title: 'العميل',
      links: [
        { name: 'لوحة التحكم', path: '/client/dashboard', icon: <LayoutDashboard /> },
        { name: 'المواعيد', path: '/client/appointments', icon: <Calendar /> },
        { name: 'حجز موعد', path: '/client/booking', icon: <Calendar /> },
        { name: 'التقييمات', path: '/client/feedback', icon: <Star /> },
        { name: 'الملف الشخصي', path: '/client/profile', icon: <User /> },
      ]
    },
    {
      title: 'المدير',
      links: [
        { name: 'لوحة التحكم', path: '/admin', icon: <LayoutDashboard /> },
        { name: 'المستخدمين', path: '/admin/users', icon: <Users /> },
        { name: 'الخدمات', path: '/admin/services', icon: <Settings /> },
        { name: 'المواعيد', path: '/admin/appointments', icon: <Calendar /> },
        { name: 'الإعلانات', path: '/admin/announcements', icon: <Bell /> },
        { name: 'الموظفين', path: '/admin/staff', icon: <Users /> },
        { name: 'التقييمات', path: '/admin/feedback', icon: <Star /> },
        { name: 'الملف الشخصي', path: '/admin/profile', icon: <User /> },
      ]
    },
    {
      title: 'الموظف',
      links: [
        { name: 'لوحة التحكم', path: '/staff', icon: <LayoutDashboard /> },
        { name: 'الجدول', path: '/staff/schedule', icon: <Calendar /> },
        { name: 'الملف الشخصي', path: '/staff/profile', icon: <User /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-primary-200 text-white rounded-full shadow-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 transition-all duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'w-64' : 'w-0 md:w-64'
        }`}
      >
        <div className="p-4 bg-primary-100">
          <h2 className="text-xl font-bold text-primary-200">وضع التطوير</h2>
          <p className="text-sm text-gray-600">تنقل بين الصفحات بسهولة</p>
        </div>

        <div className="p-4">
          {routes.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-200 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="ml-2">{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DevSidebar;