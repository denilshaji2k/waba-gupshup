import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const AppsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Apps</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Create App
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-bold">{app.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{app.phoneNumber}</p>
              <p className="text-xs text-gray-500 mt-1">
                Status: <span className="font-semibold text-green-600">{app.status}</span>
              </p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-100 text-blue-600 py-2 rounded hover:bg-blue-200">
                  <Edit2 size={16} className="inline mr-2" /> Edit
                </button>
                <button className="flex-1 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200">
                  <Trash2 size={16} className="inline mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppsPage;
