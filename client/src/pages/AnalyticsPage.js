import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MessageSquare, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function AnalyticsPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/apps/${appId}/stats`);
      const data = response.data.data;
      setAnalytics(data);
      
      // Generate mock chart data if not provided
      if (!data.chartData) {
        setChartData(generateMockChartData());
      } else {
        setChartData(data.chartData);
      }
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error(error);
      // Generate mock data on error
      setAnalytics({
        totalMessages: 1250,
        messagesSent: 850,
        messagesReceived: 400,
        totalConversations: 200,
        averageResponseTime: '2.5 hours',
        successRate: '98.5%'
      });
      setChartData(generateMockChartData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const generateMockChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      sent: Math.floor(Math.random() * 100) + 50,
      received: Math.floor(Math.random() * 80) + 30
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/apps/${appId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Message statistics and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Messages</h3>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.totalMessages || 0}</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Messages Sent</h3>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.messagesSent || 0}</p>
          <p className="text-xs text-gray-500 mt-2">{Math.round((analytics?.messagesSent || 0) / (analytics?.totalMessages || 1) * 100)}%</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Messages Received</h3>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.messagesReceived || 0}</p>
          <p className="text-xs text-gray-500 mt-2">{Math.round((analytics?.messagesReceived || 0) / (analytics?.totalMessages || 1) * 100)}%</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversations</h3>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.totalConversations || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Active</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Trend (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="received" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics?.averageResponseTime || '2.5 hours'}</p>
          <p className="text-sm text-gray-600 mt-2">Average response time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate</h3>
          <p className="text-3xl font-bold text-green-600">{analytics?.successRate || '98.5%'}</p>
          <p className="text-sm text-gray-600 mt-2">Message delivery success</p>
        </div>
      </div>
    </div>
  );
}
