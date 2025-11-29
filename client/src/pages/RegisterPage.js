import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, Lock, CheckCircle, UserPlus } from 'lucide-react';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
      });
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputField = (icon: any, label: string, type: string, key: string, required: boolean = true, placeholder: string = '') => (
    <div key={key}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
        <input
          type={type}
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg mb-4">
            <UserPlus className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Create Account</h1>
          <p className="text-gray-500 mt-2">Join WABA BSP today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputField(<User size={20} />, 'Full Name', 'text', 'name', true, 'John Doe')}
          {inputField(<Mail size={20} />, 'Email Address', 'email', 'email', true, 'you@example.com')}
          {inputField(<Phone size={20} />, 'Phone Number', 'tel', 'phone', true, '+1234567890')}
          {inputField(<Building2 size={20} />, 'Company (Optional)', 'text', 'company', false, 'Your Company')}
          {inputField(<Lock size={20} />, 'Password', 'password', 'password', true, '••••••••')}
          {inputField(<CheckCircle size={20} />, 'Confirm Password', 'password', 'confirmPassword', true, '••••••••')}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            <UserPlus size={20} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <p className="text-sm text-gray-500">Have an account?</p>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <p className="text-center mt-6">
          <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline">
            Sign in instead
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
