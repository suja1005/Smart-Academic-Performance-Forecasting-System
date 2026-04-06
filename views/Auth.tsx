import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { DEPARTMENTS, BATCHES } from '../constants';
import { registerUser, loginUser } from '../services/databaseService';

interface AuthProps {
  onAuth: (user: User) => void;
}

type AuthMode = 'login' | 'register';

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: UserRole.STUDENT,
  });

  // Register state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    identifier: '',
    department: DEPARTMENTS[0],
    email: '',
    phone: '',
    gender: 'Male',
    batch: BATCHES[0],
    password: '',
    role: UserRole.STUDENT,
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email.trim() || !loginData.password.trim()) {
      alert('Please enter both username and password');
      return;
    }

    setIsAuthenticating(true);

    try {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await window.aistudio.openSelectKey();
          }
        } catch (apiError) {
          console.warn("API key check failed, continuing with login", apiError);
        }
      }

      const response = await loginUser({ email: loginData.email, password: loginData.password });

      if (response.success && response.user) {
        if (response.user.role !== loginData.role) {
          alert(`Login failed: Make sure to select the correct account type (You are registered as ${response.user.role})`);
          setIsAuthenticating(false);
          return;
        }
        onAuth(response.user);
      } else {
        alert(response.error || 'Invalid username or password');
      }
    } catch (error: any) {
      console.error("Authentication failed", error);
      alert(error?.message || 'Login failed. Please try again or check the server connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!passwordRegex.test(registerData.password)) {
      alert("Please enter a strong password with letters, numbers, and symbols");
      return;
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: registerData.fullName,
      email: registerData.email,
      role: registerData.role,
      rollNumber: registerData.role === UserRole.STUDENT ? registerData.identifier : undefined,
      facultyId: registerData.role === UserRole.FACULTY ? registerData.identifier : undefined,
      adminId: registerData.role === UserRole.SUPER_ADMIN ? registerData.identifier : undefined,
      department: registerData.department,
      phone: registerData.phone,
      gender: registerData.gender,
      batch: registerData.batch,
      password: registerData.password
    };

    setIsAuthenticating(true);

    try {
      const response = await registerUser(newUser);
      if (response.success) {
        const { password, ...userWithoutPassword } = newUser;
        onAuth(userWithoutPassword as User);
      } else {
        alert(response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Register failed:', error);
      alert(error?.message || 'Database error. Unable to register.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Auth Toggle Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              authMode === 'login'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              authMode === 'register'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Login Form */}
        {authMode === 'login' && (
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>

            <div className="text-center mb-8 relative">
              <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-primary/20 rotate-3">
                S
              </div>
              <h2 className="text-2xl font-black text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setLoginData({ ...loginData, role: UserRole[r] })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      loginData.role === UserRole[r]
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-medium bg-gray-50/50"
                    placeholder="Enter your name or email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-medium bg-gray-50/50"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 border-b-4 border-primary-dark active:border-b-0 active:translate-y-1"
              >
                {isAuthenticating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p className="text-[10px] text-gray-400">Secure access via Google Cloud Billing</p>
            </div>
          </div>
        )}

        {/* Register Form */}
        {authMode === 'register' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2">Set up your institutional academic account</p>
            </div>

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {registerData.role === UserRole.STUDENT
                    ? 'Roll Number'
                    : registerData.role === UserRole.FACULTY
                      ? 'Faculty ID'
                      : 'Admin ID'}
                </label>
                <input
                  name="identifier"
                  type="text"
                  required
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  name="department"
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Batch / Academic Year</label>
                <select
                  name="batch"
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                >
                  {BATCHES.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Account Role</label>
                <select
                  name="role"
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                  value={registerData.role}
                >
                  <option value={UserRole.STUDENT}>Student</option>
                  <option value={UserRole.FACULTY}>Faculty</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Institutional Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <div className="flex gap-4 mt-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={registerData.gender === g}
                        onChange={handleRegisterChange}
                        className="accent-primary"
                      />
                      <span className="text-sm">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Must contain letters, numbers, and special characters</p>
              </div>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-lg hover:bg-primary-dark transition-all disabled:opacity-70"
                >
                  {isAuthenticating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    `Register ${registerData.role === UserRole.STUDENT ? 'Student' : registerData.role === UserRole.FACULTY ? 'Faculty' : 'Super Admin'} Account`
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default Auth;
