
import React, { useState, useEffect } from 'react';
import { User, AcademicDetails, PredictionResult, PerformanceLevel } from '../types';
import { THEME_COLOR, Icons } from '../constants';
import { predictPerformance } from '../services/predictionEngine';
import { storePrediction, getStudentPredictions } from '../services/databaseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [details, setDetails] = useState<AcademicDetails>({
    attendance: 85,
    internalMarks: 75,
    assignmentScores: 80,
    projectMarks: 80,
    previousGPA: 7.8,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadPastPredictions();
  }, []);

  const loadPastPredictions = async () => {
    try {
      const response = await getStudentPredictions(user.id);
      if (response.success && response.data) {
        const verified = response.data.filter((p: any) => p.status === 'verified');
        setNotifications(verified);
      }
    } catch (error) {
      console.error('Error loading past predictions:', error);
    }
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setSaveStatus('');
    try {
      // Standardized on Random Forest logic in the engine
      const result = await predictPerformance(details, 'random_forest');
      setPrediction(result);

      // Store prediction in database
      try {
        const response = await storePrediction({
          student: {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department || 'Unknown',
          },
          academicDetails: details,
          prediction: result,
        });

        if (response.success) {
          setSaveStatus('✅ Prediction saved to database');
        } else {
          setSaveStatus(`⚠️ Database save failed: ${response.error || 'Unknown error'}`);
        }
      } catch (dbError: any) {
        console.error('Database error:', dbError);
        setSaveStatus(`⚠️ Database error: ${dbError.message || 'Ensure backend is running on http://localhost:3001'}`);
      }
    } catch (error: any) {
      console.error('Prediction error:', error);
      setSaveStatus(`❌ Prediction failed: ${error.message}`);
    }
    setIsPredicting(false);
  };

  const chartData = [
    { name: 'Attendance', value: details.attendance, full: 100 },
    { name: 'Internal Marks', value: details.internalMarks, full: 100 },
    { name: 'Assignments', value: details.assignmentScores, full: 100 },
    { name: 'Prev GPA', value: details.previousGPA * 10, full: 100 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-500">Ensemble Random Forest Intelligence active</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Download PDF</button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-dark transition-all">Support</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Performance Indicators
          </h2>
          <div className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
              <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">Active Prediction Engine</p>
              <p className="text-sm font-bold text-primary-dark">Random Forest Classifier (5-Tree Ensemble)</p>
            </div>
            
            {(Object.keys(details) as Array<keyof AcademicDetails>).map((key) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <span className="text-xs font-black text-primary">{details[key]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={key === 'projectMarks' ? '100' : key === 'previousGPA' ? '10' : '100'}
                  step={key === 'previousGPA' ? '0.1' : '1'}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  value={details[key]}
                  onChange={(e) => setDetails({ ...details, [key]: parseFloat(e.target.value) })}
                />
              </div>
            ))}

            <button
              onClick={handlePredict}
              disabled={isPredicting}
              className="w-full mt-6 bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 border-b-4 border-primary-dark active:border-b-0 active:translate-y-1 disabled:opacity-50"
            >
              {isPredicting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Run Random Forest Forecast'}
            </button>

            {saveStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-medium text-center ${
                saveStatus.includes('✅') ? 'bg-green-50 text-green-700' :
                saveStatus.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-2 space-y-8">
          {notifications.length > 0 && (
            <div className="bg-green-50 p-6 rounded-3xl border border-green-200">
              <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Faculty Verification Notifications
              </h2>
              <div className="space-y-4">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Prediction Verification Approved</p>
                      <p className="text-xs text-gray-500">Risk Level: {notif.riskLevel} | Date: {new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Record Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prediction ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-8 rounded-3xl border ${
                prediction.level === PerformanceLevel.LOW_RISK ? 'bg-green-50 border-green-200' :
                prediction.level === PerformanceLevel.MEDIUM_RISK ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
              }`}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Assessment</p>
                <h3 className={`text-4xl font-black mt-2 ${
                  prediction.level === PerformanceLevel.LOW_RISK ? 'text-green-700' :
                  prediction.level === PerformanceLevel.MEDIUM_RISK ? 'text-orange-700' : 'text-red-700'
                }`}>
                  {prediction.level}
                </h3>
                <div className="mt-6 flex items-center gap-3 bg-white/60 p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <span className="text-xs font-black text-primary">{prediction.score}%</span>
                  </div>
                  <p className="text-xs font-bold text-gray-600">Model Confidence Factor</p>
                </div>
              </div>

              <div className="bg-primary text-white p-8 rounded-3xl shadow-2xl shadow-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Icons.Dashboard />
                  AI Optimization Guide
                </h3>
                <ul className="space-y-4">
                  {prediction.suggestions.map((s, idx) => (
                    <li key={idx} className="text-sm font-medium flex gap-3 leading-snug">
                      <span className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0">{idx + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 h-64 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 text-gray-400">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Icons.Chart />
              </div>
              <p className="font-bold text-sm">Waiting for input data...</p>
              <p className="text-xs">Parameters will be processed by Random Forest Ensemble</p>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-8">Feature Importance Analysis</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill={THEME_COLOR} radius={[8, 8, 8, 8]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
