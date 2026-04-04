
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { THEME_COLOR, DEPARTMENTS } from '../constants';
import { User } from '../types';
import { getAnalytics, getAllPredictions } from '../services/databaseService';

interface SuperAdminDashboardProps {
  user: User;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, predictionsResponse] = await Promise.all([
        getAnalytics(),
        getAllPredictions(),
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse);
      }
      if (predictionsResponse.success) {
        setPredictions(predictionsResponse.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const systemStats = [
    { label: 'Total Predictions', value: analytics?.stats?.totalPredictions || '0', trend: '+25%', color: THEME_COLOR },
    { label: 'Average Score', value: (analytics?.stats?.avgScore || 0).toFixed(1), trend: 'High', color: '#3b82f6' },
    { label: 'Low Risk Students', value: analytics?.stats?.lowRiskCount || '0', trend: '+12%', color: '#10b981' },
    { label: 'High Risk Students', value: analytics?.stats?.highRiskCount || '0', trend: '-8%', color: '#ef4444' },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const riskChartData = analytics?.stats ? [
    { name: 'Low Risk', value: analytics.stats.lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: analytics.stats.mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: analytics.stats.highRiskCount, color: '#ef4444' },
  ] : [];

  const deptData = analytics?.departmentBreakdown || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:items-center md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Console</h1>
          <p className="text-gray-500">Institutional Central Control & Real-time Analytics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAnalytics} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-md hover:bg-primary-dark">🔄 Refresh Analytics</button>
        </div>
      </header>

      {loading ? (
        <div className="bg-white p-8 rounded-xl text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-2">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                  <span className={`text-xs font-bold ${stat.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: '70%', backgroundColor: stat.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6">Risk Distribution</h2>
              <div className="h-80 flex items-center justify-center">
                {riskChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6">Departmental Performance</h2>
              <div className="h-80">
                {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="department" axisLine={false} tickLine={false} fontSize={10} />
                      <YAxis axisLine={false} tickLine={false} fontSize={10} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="avgScore" name="Avg Score" fill={THEME_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6">Recent Predictions Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-xs text-gray-500 font-semibold">Last 24 Hours</p>
                <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="text-xs text-gray-500 font-semibold">Avg Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">{(analytics?.stats?.avgScore || 0).toFixed(1)}</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-xs text-gray-500 font-semibold">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.stats?.totalPredictions || 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
