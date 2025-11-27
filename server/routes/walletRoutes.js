const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const router = express.Router();

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');

    res.status(200).json({
      success: true,
      data: user.wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet balance',
      error: error.message,
    });
  }
});

// Get wallet transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    const total = await WalletTransaction.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message,
    });
  }
});

// Top up wallet
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    // Create transaction record
    const transaction = await WalletTransaction.create({
      userId: req.user._id,
      type: 'topup',
      amount,
      paymentMethod,
      status: 'pending',
      transactionId: `txn_${Date.now()}`,
    });

    // In production, integrate with payment gateway (Stripe, PayPal, etc.)
    // For now, mark as completed
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    // Update user wallet
    const user = await User.findById(req.user._id);
    user.wallet.balance += amount;
    user.wallet.totalTopUps += amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Wallet topped up successfully',
      data: {
        transaction,
        newBalance: user.wallet.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error topping up wallet',
      error: error.message,
    });
  }
});

// Deduct from wallet (internal use)
router.post('/deduct', auth, async (req, res) => {
  try {
    const { amount, description, appId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const user = await User.findById(req.user._id);

    if (user.wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
      });
    }

    // Create transaction record
    const transaction = await WalletTransaction.create({
      userId: req.user._id,
      appId,
      type: 'deduction',
      amount,
      description,
      status: 'completed',
      completedAt: new Date(),
      transactionId: `txn_${Date.now()}`,
    });

    // Update user wallet
    user.wallet.balance -= amount;
    user.wallet.totalSpent += amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Deduction completed',
      data: {
        transaction,
        newBalance: user.wallet.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deducting from wallet',
      error: error.message,
    });
  }
});

module.exports = router;
