import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useParams } from 'react-router-dom';

const TemplatesPage = () => {
  const { appId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en',
    body: '',
    header: {},
    footer: '',
    buttons: [],
  });

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/templates/apps/${appId}/templates`);
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await API.put(`/templates/apps/${appId}/templates/${editingTemplate._id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await API.post(`/templates/apps/${appId}/templates`, formData);
        toast.success('Template created successfully');
      }
      setShowModal(false);
      setFormData({
        name: '',
        category: 'MARKETING',
        language: 'en',
        body: '',
        header: {},
        footer: '',
        buttons: [],
      });
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/templates/apps/${appId}/templates/${templateId}`);
        toast.success('Template deleted');
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Message Templates</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Create Template
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div key={template._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.category}</p>
                <p className="text-sm text-gray-500 mt-2">{template.body.substring(0, 100)}...</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye size={18} />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="OTP">OTP</option>
                    <option value="ACCOUNT_UPDATE">Account Update</option>
                    <option value="TRANSACTIONAL">Transactional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Body</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="4"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
