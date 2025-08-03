const express = require('express');
const { handleVisitor } = require('../controllers/Visitor');
const Visitor = require('../models/Visitor');

const router = express.Router();

// POST - increments (if told) and returns count
router.post('/updatevisitors', handleVisitor);

// GET - just returns current stats, no increment
router.get('/fetchvisitors', async (req, res) => {
  try {
    const visitor = await Visitor.findOne();

    if (!visitor) {
      return res.status(200).json({
        totalVisits: 0,
        uniqueVisitors: 0
      });
    }

    res.status(200).json({
      totalVisits: visitor.totalVisits,
      uniqueVisitors: visitor.uniqueIPs.length
    });
  } catch (err) {
    console.error("Error fetching visitor stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
