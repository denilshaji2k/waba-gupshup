import React from 'react';
import { Send, MessageSquare, TrendingUp, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    { icon: Send, label: 'Messages Sent', value: '1,234', trend: '+12.5%', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { icon: MessageSquare, label: 'Messages Received', value: '567', trend: '+8.2%', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { icon: TrendingUp, label: 'Conversion Rate', value: '34.2%', trend: '+4.1%', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { icon: Zap, label: 'Active Journeys', value: '12', trend: '+2', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  const quickActions = [
    { title: 'Create Template', description: 'Design new message template', icon: '📝' },
    { title: 'Start Journey', description: 'Build customer journey', icon: '🚀' },
    { title: 'View Analytics', description: 'Check performance metrics', icon: '📊' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={stat.textColor} size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                {stat.trend}
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
              <p className="text-gray-500 text-sm mt-1">Your message statistics this month</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
          <div className="h-64 flex items-center justify-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-400 text-center">
              <p className="font-semibold mb-2">Chart Visualization</p>
              <p className="text-sm">Real-time analytics will appear here</p>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
