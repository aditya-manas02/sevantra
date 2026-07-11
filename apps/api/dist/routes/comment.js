"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commentController_1 = require("../controllers/commentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/:eventId/comments', commentController_1.getComments);
router.post('/:eventId/comments', auth_1.authMiddleware, commentController_1.postComment);
exports.default = router;
