
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';
import { DEPARTMENTS, BATCHES } from '../constants';
import { registerUser } from '../services/databaseService';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Display error if not strong password
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!passwordRegex.test(formData.password)) {
       alert("Please enter a strong password with letters, numbers, and symbols");
       return;
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.fullName,
      email: formData.email,
      role: formData.role,
      rollNumber: formData.role === UserRole.STUDENT ? formData.identifier : undefined,
      facultyId: formData.role === UserRole.FACULTY ? formData.identifier : undefined,
      adminId: formData.role === UserRole.SUPER_ADMIN ? formData.identifier : undefined,
      department: formData.department,
      phone: formData.phone,
      gender: formData.gender,
      batch: formData.batch,
      password: formData.password
    };
    
    try {
      const response = await registerUser(newUser);
      if (response.success) {
        alert('Registration successful! Click OK to go to login page.');
        navigate('/login');
      } else {
        alert(response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Register failed:', error);
      alert(error?.message || 'Database error. Unable to register.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 my-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {formData.role === UserRole.STUDENT ? 'Student' : formData.role === UserRole.FACULTY ? 'Faculty' : 'Super Admin'} Registration
          </h2>
          <p className="text-gray-500 mt-2">Create your institutional academic account</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="fullName" type="text" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {formData.role === UserRole.STUDENT ? 'Roll Number' : formData.role === UserRole.FACULTY ? 'Faculty ID' : 'Admin ID'}
            </label>
            <input name="identifier" type="text" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select name="department" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Batch / Academic Year</label>
            <select name="batch" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none">
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Account Role</label>
            <select name="role" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" value={formData.role}>
              <option value={UserRole.STUDENT}>Student</option>
              <option value={UserRole.FACULTY}>Faculty</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Institutional Email</label>
            <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input name="phone" type="tel" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map(g => (
                <label key={g} className="flex items-center gap-2">
                  <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="accent-primary" />
                  <span className="text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input name="password" type="password" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-lg hover:bg-primary-dark transition-all">
              Register {formData.role === UserRole.STUDENT ? 'Student' : formData.role === UserRole.FACULTY ? 'Faculty' : 'Super Admin'} Account
            </button>
            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
