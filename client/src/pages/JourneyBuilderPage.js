import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function JourneyBuilderPage() {
  const { appId, journeyId } = useParams();
  const navigate = useNavigate();
  const [journey, setJourney] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'message',
    steps: []
  });

  useEffect(() => {
    fetchJourneys();
    if (journeyId) {
      fetchJourneyDetails();
    }
  }, [appId, journeyId]);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/journeys/${appId}`);
      setJourneys(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch journeys');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneyDetails = async () => {
    try {
      const response = await api.get(`/journeys/${appId}/${journeyId}`);
      setJourney(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch journey details');
      console.error(error);
    }
  };

  const handleCreateJourney = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/journeys/${appId}`, formData);
      toast.success('Journey created successfully');
      setShowForm(false);
      setFormData({ name: '', description: '', trigger: 'message', steps: [] });
      fetchJourneys();
    } catch (error) {
      toast.error('Failed to create journey');
      console.error(error);
    }
  };

  const handleDeleteJourney = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journey?')) return;
    try {
      await api.delete(`/journeys/${appId}/${id}`);
      toast.success('Journey deleted successfully');
      fetchJourneys();
    } catch (error) {
      toast.error('Failed to delete journey');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journeys...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Journey Builder</h1>
            <p className="text-gray-600 mt-1">Create and manage customer journeys</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Journey
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Journey</h2>
          <form onSubmit={handleCreateJourney} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journey Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., Welcome Journey"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Describe this journey..."
                rows="3"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger Type
              </label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="message">Message Received</option>
                <option value="keyword">Keyword Match</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Create Journey
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Journeys List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Journeys</h2>
        </div>
        {journeys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No journeys created yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {journeys.map((j) => (
              <div key={j._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{j.name}</h3>
                  <p className="text-sm text-gray-600">{j.description || 'No description'}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {j.trigger || 'trigger'}
                    </span>
                    {j.steps && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {j.steps.length} steps
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/apps/${appId}/journeys/${j._id}`)}
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteJourney(j._id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
