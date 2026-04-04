
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import Login from './views/Login';
import Register from './views/Register';
import StudentDashboard from './views/StudentDashboard';
import FacultyDashboard from './views/FacultyDashboard';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import Profile from './views/Profile';
import EditProfile from './views/EditProfile';
import Notifications from './views/Notifications';
import { Icons } from './constants';
import { getStudentPredictions } from './services/databaseService';

const Sidebar = ({ user, logout }: { user: User; logout: () => void }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user.role === UserRole.STUDENT) {
      loadUnread();
    }
  }, [user]);

  const loadUnread = async () => {
    try {
      const response = await getStudentPredictions(user.id);
      if (response.success && response.data) {
        const unread = response.data.filter((p: any) => p.status === 'verified' && !p.isRead);
        setUnreadCount(unread.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <Icons.Dashboard /> },
  ];

  if (user.role === UserRole.STUDENT) {
    menuItems.push({ 
      label: 'Notifications', 
      path: '/notifications', 
      icon: (
        <div className="relative">
          <Icons.Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )
    });
  }

  menuItems.push({ label: 'Profile', path: '/profile', icon: <Icons.Profile /> });

  if (user.role === UserRole.SUPER_ADMIN) {
    menuItems.push({ label: 'System Analytics', path: '/analytics', icon: <Icons.Chart /> });
  }

  return (
    <div className="w-64 h-screen bg-white shadow-xl flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">S</div>
          Forecasting
        </h1>
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <Icons.Logout />
          Logout
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('app_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-primary font-bold">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen">
        {user ? (
          <div className="pl-64">
            <Sidebar user={user} logout={logout} />
            <main className="p-8">
              <Routes>
                <Route path="/" element={
                  user.role === UserRole.STUDENT ? <StudentDashboard user={user} /> :
                  user.role === UserRole.FACULTY ? <FacultyDashboard user={user} /> :
                  <SuperAdminDashboard user={user} />
                } />
                <Route path="/profile" element={<Profile user={user} />} />
                <Route path="/edit-profile" element={<EditProfile user={user} />} />
                <Route path="/notifications" element={user.role === UserRole.STUDENT ? <Notifications user={user} /> : <Navigate to="/" />} />
                <Route path="/analytics" element={user.role === UserRole.SUPER_ADMIN ? <SuperAdminDashboard user={user} /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={login} />} />
            <Route path="/register" element={<Register onRegister={login} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;

