import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Search, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MessagesPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, [appId]);

  useEffect(() => {
    const filtered = messages.filter(msg =>
      msg.phoneNumber?.includes(searchQuery) ||
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/apps/${appId}/messages`);
      setMessages(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
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
          <p className="text-gray-600">Loading messages...</p>
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
            onClick={() => navigate(`/apps/${appId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">View and manage all messages</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by phone number or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((msg) => (
              <div key={msg._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{msg.phoneNumber}</h3>
                    <p className="text-gray-700 mt-2">{msg.content}</p>
                    <div className="mt-3 flex gap-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                        msg.direction === 'inbound'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {msg.direction === 'inbound' ? 'Received' : 'Sent'}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {msg.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  {msg.direction === 'inbound' && (
                    <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
