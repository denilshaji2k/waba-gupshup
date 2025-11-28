import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Wallet, TrendingUp, History } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const walletResponse = await api.get('/wallet/balance');
      const transactionsResponse = await api.get('/wallet/transactions');
      
      setWallet(walletResponse.data.data);
      setTransactions(transactionsResponse.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch wallet data');
      // Set mock data for demo
      setWallet({
        balance: 1250.50,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      });
      setTransactions([
        {
          _id: '1',
          type: 'credit',
          amount: 500,
          description: 'Package purchase',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '2',
          type: 'debit',
          amount: 150.50,
          description: 'Messages sent',
          date: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await api.post('/wallet/add-funds', { amount: parseFloat(amount) });
      toast.success('Funds added successfully');
      setAmount('');
      setShowAddFunds(false);
      fetchWalletData();
    } catch (error) {
      toast.error('Failed to add funds');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600 mt-1">Manage your account balance</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddFunds(!showAddFunds)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Funds
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Current Balance</h2>
          </div>
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-4xl font-bold mb-2">
          {wallet?.currency === 'USD' ? '$' : '₹'}{wallet?.balance?.toFixed(2) || '0.00'}
        </p>
        <p className="text-purple-100 text-sm">
          Last updated: {wallet?.lastUpdated ? new Date(wallet.lastUpdated).toLocaleString() : 'N/A'}
        </p>
      </div>

      {/* Add Funds Form */}
      {showAddFunds && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Funds to Wallet</h2>
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({wallet?.currency || 'USD'})
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>Total to pay:</strong> {wallet?.currency === 'USD' ? '$' : '₹'}{(parseFloat(amount) || 0).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Proceed to Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddFunds(false);
                  setAmount('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <History className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {transaction.date ? new Date(transaction.date).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className={`text-right font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {wallet?.currency === 'USD' ? '$' : '₹'}{transaction.amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Pricing Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Regular messages: $0.05 per message</li>
          <li>• Template messages: $0.03 per message</li>
          <li>• Incoming messages: Free</li>
          <li>• Minimum recharge: $10 (USD)</li>
        </ul>
      </div>
    </div>
  );
}
