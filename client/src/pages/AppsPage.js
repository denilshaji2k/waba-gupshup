import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MessageCircle, Activity, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const AppsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await API.get('/apps');
      setApps(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch apps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">My Apps</h1>
          <p className="text-gray-500 mt-2">Manage your WhatsApp Business Apps</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg">
          <Plus size={20} /> Create App
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading your apps...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
          <MessageCircle size={48} className="mx-auto text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No apps yet</h3>
          <p className="text-gray-500 mt-2">Create your first WhatsApp Business App to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-pattern"></div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{app.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{app.phoneNumber}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 py-4 border-t border-b border-gray-100">
                  <div className="text-center">
                    <MessageCircle size={18} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-xs text-gray-500">Messages</p>
                  </div>
                  <div className="text-center">
                    <Activity size={18} className="mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                  <div className="text-center">
                    <Settings size={18} className="mx-auto text-orange-600 mb-1" />
                    <p className="text-xs text-gray-500">Config</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppsPage;
