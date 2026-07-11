"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donationController_1 = require("../controllers/donationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/checkout', auth_1.authMiddleware, donationController_1.createCheckoutSession);
// Note: Webhook needs raw body, but for simplicity we rely on standard parsing or handle it specially if needed
router.post('/webhook', donationController_1.handleStripeWebhook);
exports.default = router;
