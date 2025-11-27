import React from 'react';
import { BarChart3, MessageSquare, Send, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    { icon: Send, label: 'Messages Sent', value: '1,234', color: 'blue' },
    { icon: MessageSquare, label: 'Messages Received', value: '567', color: 'green' },
    { icon: TrendingUp, label: 'Conversion Rate', value: '34.2%', color: 'purple' },
    { icon: BarChart3, label: 'Active Journeys', value: '12', color: 'orange' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-500">Chart and activity log would appear here</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
              Create new template
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
              Start new journey
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
              View analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
