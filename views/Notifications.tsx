import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getStudentPredictions, markNotificationAsRead } from '../services/databaseService';

interface NotificationsProps {
  user: User;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getStudentPredictions(user.id);
      if (response.success && response.data) {
        // We only want to show verified predictions as notifications
        const verified = response.data.filter((p: any) => p.status === 'verified');
        setNotifications(verified);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: 1 } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">View faculty updates and alerts</p>
        </div>
        <button 
          onClick={loadNotifications}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          🔄 Refresh
        </button>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border transition-all ${
                  notif.isRead 
                    ? 'bg-gray-50 border-gray-100' 
                    : 'bg-green-50/50 border-green-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                      )}
                      <h3 className={`text-base font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        Prediction Verification Approved
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your performance prediction of <span className="font-bold text-primary">{notif.predictionScore}% ({notif.riskLevel})</span> has been reviewed and verified by the faculty.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                      <span>Verified At: {new Date((notif.updatedAt || notif.createdAt) + 'Z').toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      notif.isRead ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'
                    }`}>
                      {notif.isRead ? 'Read' : 'New'}
                    </span>
                    {!notif.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs font-bold text-primary hover:text-primary-dark"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <h3 className="text-gray-900 font-bold mb-1">All Caught Up</h3>
            <p className="text-sm font-medium text-gray-500">You have no verified notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
