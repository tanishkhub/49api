const Visitor = require('../models/Visitor');

const handleVisitor = async (req, res) => {
  const { clientIp, increment } = req.body;

  if (!clientIp) {
    return res.status(400).json({ error: "clientIp is required" });
  }

  try {
    let visitor = await Visitor.findOne();

    if (!visitor) {
      visitor = new Visitor();
    }

    if (increment) {
      visitor.totalVisits += 1;

      if (!visitor.uniqueIPs.includes(clientIp)) {
        visitor.uniqueIPs.push(clientIp);
      }

      await visitor.save();
    }

    res.status(200).json({
      totalVisits: visitor.totalVisits,
      uniqueVisitors: visitor.uniqueIPs.length
    });

  } catch (err) {
    console.error("Error in visitor handler:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { handleVisitor };
