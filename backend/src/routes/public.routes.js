const express = require("express");
const router = express.Router();
const { getPublicSettings } = require("../controllers/public.controller");
const { getActiveBanners } = require("../controllers/banner.controller");

// GET /api/v2/public/settings — no auth required
router.get("/settings", getPublicSettings);

// GET /api/v2/public/banners — no auth required
router.get("/banners", getActiveBanners);

module.exports = router;
