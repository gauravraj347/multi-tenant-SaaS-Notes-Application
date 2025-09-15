const express = require('express');
const Tenant = require('../models/Tenant');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Upgrade tenant subscription (Admin only)
router.post('/:slug/upgrade', requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Verify the user belongs to the tenant they're trying to upgrade
    if (req.user.tenantId.slug !== slug) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tenant = await Tenant.findOneAndUpdate(
      { slug },
      { subscription: 'pro' },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json({
      message: 'Tenant upgraded to Pro successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        noteLimit: tenant.noteLimit
      }
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tenant info
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Verify the user belongs to the tenant they're trying to access
    if (req.user.tenantId.slug !== slug) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tenant = await Tenant.findOne({ slug });
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json({
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        noteLimit: tenant.noteLimit
      }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
