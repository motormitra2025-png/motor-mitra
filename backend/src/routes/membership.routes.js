const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const membershipController = require('../controllers/membership.controller');

/* ✅ SAFE USAGE */
router.get(
  '/my-memberships',
  protect(['FARMER']),
  membershipController.getMyMemberships
);

module.exports = router;