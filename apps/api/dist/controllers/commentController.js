"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postComment = exports.getComments = void 0;
const database_1 = require("database");
const getComments = async (req, res) => {
    try {
        const { eventId } = req.params;
        const comments = await database_1.prisma.eventComment.findMany({
            where: { eventId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ comments });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getComments = getComments;
const postComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;
        const { content, mediaUrl } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content cannot be empty' });
        }
        const comment = await database_1.prisma.eventComment.create({
            data: {
                content,
                mediaUrl,
                eventId,
                userId
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
            }
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.postComment = postComment;
