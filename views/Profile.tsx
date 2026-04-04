
import React from 'react';
import { User, UserRole } from '../types';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-primary relative">
          <div className="absolute -bottom-12 left-8 border-4 border-white rounded-2xl overflow-hidden shadow-lg">
            <div className="w-24 h-24 bg-primary-light flex items-center justify-center text-white text-4xl font-bold uppercase">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 font-medium">{user.role} • {user.department}</p>
            </div>
            <Link 
              to="/edit-profile"
              className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email / Username</p>
                <p className="text-gray-900 font-medium mt-1">{user.email}</p>
              </div>
              {user.rollNumber && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</p>
                  <p className="text-gray-900 font-medium mt-1">{user.rollNumber}</p>
                </div>
              )}
              {user.phone && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-gray-900 font-medium mt-1">{user.phone}</p>
                </div>
              )}
              {user.batch && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Batch / Year</p>
                  <p className="text-gray-900 font-medium mt-1">{user.batch}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Skills & Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {['Data Analysis', 'Python', 'Critical Thinking', 'Project Management'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
              <button className="px-3 py-1 border border-dashed border-primary text-primary rounded-lg text-sm font-bold">
                + Add Skill
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Profile Strength</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-light/20">
                    Advanced
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary">
                    85%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
              </div>
              <p className="text-xs text-gray-500 italic">Complete academic history to reach 100%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
