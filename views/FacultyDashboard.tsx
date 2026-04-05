
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllPredictions, verifyPrediction } from '../services/databaseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PredictionRecord {
  id: number;
  studentName: string;
  studentEmail: string;
  department: string;
  attendance: number;
  internalMarks: number;
  riskLevel: string;
  predictionScore: number;
  createdAt: string;
  status: string;
}

interface FacultyDashboardProps {
  user: User;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user }) => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const response = await getAllPredictions(user.department);
      if (response.success) {
        setPredictions(response.data);
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      const response = await verifyPrediction(id, user.department);
      if (response.success) {
        setPredictions(predictions.map(p => 
          p.id === id ? { ...p, status: 'verified' } : p
        ));
      } else {
        console.error('Verify failed:', response.error || response.message);
        alert(response.error || response.message || 'Unable to verify this student');
      }
    } catch (error) {
      console.error('Error verifying prediction:', error);
      alert('Unable to verify student. Make sure the student is in your department.');
    }
  };

  const filteredStudents = predictions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (filterRisk === 'All' || s.riskLevel === filterRisk)
  );

  const stats = [
    { name: 'Low Risk', value: predictions.filter(p => p.riskLevel === 'Low Risk').length, color: '#10b981' },
    { name: 'Med Risk', value: predictions.filter(p => p.riskLevel === 'Medium Risk').length, color: '#f59e0b' },
    { name: 'High Risk', value: predictions.filter(p => p.riskLevel === 'High Risk').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-500">Monitor all student predictions and performance</p>
          <p className="text-xs text-gray-400 mt-1">{user.department}</p>
        </div>
        <button onClick={loadPredictions} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-dark transition-all">
          🔄 Refresh Data
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
          <div key={s.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">{s.name}</p>
              <h3 className="text-3xl font-black mt-1" style={{ color: s.color }}>{s.value}</h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-20" style={{ backgroundColor: s.color }}>
              <div className="w-6 h-6 rounded-full" style={{ border: `3px solid ${s.color}` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
          <h2 className="text-lg font-bold">Student Prediction Records ({filteredStudents.length})</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option>All</option>
              <option>Low Risk</option>
              <option>Medium Risk</option>
              <option>High Risk</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-2">Loading predictions...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No predictions found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Attendance</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((pred) => (
                  <tr key={pred.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold">{pred.studentName}</td>
                    <td className="px-6 py-4 text-sm">{pred.studentEmail}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold">{pred.attendance}%</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-primary">{pred.predictionScore}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        pred.riskLevel === 'Low Risk' ? 'bg-green-100 text-green-700' :
                        pred.riskLevel === 'Medium Risk' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {pred.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(pred.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {pred.status === 'verified' ? (
                        <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Verified
                        </span>
                      ) : (
                        <button onClick={() => handleVerify(pred.id)} className="text-primary hover:text-primary-dark font-bold text-sm">Verify</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
