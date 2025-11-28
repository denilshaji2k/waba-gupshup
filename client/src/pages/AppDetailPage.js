import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, MessageSquare, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AppDetailPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

  const fetchAppDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/apps/${appId}`);
      setApp(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch app details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading app details...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">App not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/apps')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{app.name}</h1>
            <p className="text-gray-600 mt-1">App ID: {app._id}</p>
          </div>
        </div>
      </div>

      {/* App Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phone Number */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Phone Number</h3>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-semibold text-gray-900">{app.phoneNumber || 'N/A'}</p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Status</h3>
            <Zap className="w-4 h-4 text-green-500" />
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            app.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {app.status || 'Inactive'}
          </span>
        </div>

        {/* Messages Sent */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Messages Sent</h3>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-semibold text-gray-900">{app.messageCount || 0}</p>
        </div>

        {/* Created Date */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Created</h3>
            <Settings className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/apps/${appId}/messages`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            View Messages
          </button>
          <button
            onClick={() => navigate(`/apps/${appId}/templates`)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Manage Templates
          </button>
          <button
            onClick={() => navigate(`/apps/${appId}/journey-builder`)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Journey Builder
          </button>
          <button
            onClick={() => navigate(`/apps/${appId}/analytics`)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
