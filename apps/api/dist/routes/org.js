"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orgController_1 = require("../controllers/orgController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.get('/', orgController_1.getOrganizations);
router.post('/', auth_1.authMiddleware, orgController_1.createOrganization);
// Admin routes
router.get('/pending', auth_1.authMiddleware, (0, rbac_1.requireRole)(['PLATFORM_ADMIN']), orgController_1.getPendingOrganizations);
router.put('/:id/verify', auth_1.authMiddleware, (0, rbac_1.requireRole)(['PLATFORM_ADMIN']), orgController_1.verifyOrganization);
exports.default = router;
