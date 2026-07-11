"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOrganization = exports.getPendingOrganizations = exports.getOrganizations = exports.createOrganization = void 0;
const database_1 = require("database");
const shared_1 = require("shared");
const createOrganization = async (req, res) => {
    try {
        const data = shared_1.CreateOrganizationInputSchema.parse(req.body);
        const userId = req.user.id;
        const existing = await database_1.prisma.organization.findUnique({ where: { name: data.name } });
        if (existing) {
            return res.status(400).json({ error: 'Organization name already in use' });
        }
        const org = await database_1.prisma.organization.create({
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                website: data.website || null,
                verificationDocUrl: data.verificationDocUrl,
                verificationStatus: 'PENDING',
                members: {
                    create: {
                        userId: userId,
                        role: 'ADMIN',
                    }
                }
            }
        });
        res.status(201).json({ organization: org });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createOrganization = createOrganization;
const getOrganizations = async (req, res) => {
    try {
        const orgs = await database_1.prisma.organization.findMany({
            where: { verificationStatus: 'VERIFIED' }
        });
        res.status(200).json({ organizations: orgs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrganizations = getOrganizations;
const getPendingOrganizations = async (req, res) => {
    try {
        const orgs = await database_1.prisma.organization.findMany({
            where: { verificationStatus: 'PENDING' }
        });
        res.status(200).json({ organizations: orgs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPendingOrganizations = getPendingOrganizations;
const verifyOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'VERIFIED' or 'REJECTED'
        if (status !== 'VERIFIED' && status !== 'REJECTED') {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const org = await database_1.prisma.organization.update({
            where: { id },
            data: { verificationStatus: status }
        });
        res.status(200).json({ organization: org });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.verifyOrganization = verifyOrganization;
