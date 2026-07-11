"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const database_1 = require("database");
// Initialize Stripe (use dummy key if not provided)
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2025-01-27.acacia'
});
const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, eventId, organizationId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid donation amount' });
        }
        if (!eventId && !organizationId) {
            return res.status(400).json({ error: 'Must specify eventId or organizationId' });
        }
        // In a real app with real Stripe keys, we'd use stripe.checkout.sessions.create
        // Since we are mocking/testing, if it's a dummy key, we just create the donation record directly
        if ((process.env.STRIPE_SECRET_KEY || 'sk_test_dummy') === 'sk_test_dummy') {
            const donation = await database_1.prisma.donation.create({
                data: {
                    amount,
                    userId,
                    eventId: eventId || null,
                    organizationId: organizationId || null,
                    status: 'SUCCESS',
                    stripeSessionId: 'dummy_session_' + Date.now()
                }
            });
            // Mock redirect URL to success page
            return res.status(200).json({ url: `http://localhost:3000/dashboard?donation=success` });
        }
        // Real Stripe Flow
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Donation to Sevantra',
                        },
                        unit_amount: amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/dashboard?donation=success`,
            cancel_url: `http://localhost:3000/dashboard?donation=canceled`,
            metadata: {
                userId,
                eventId: eventId || '',
                organizationId: organizationId || ''
            }
        });
        // Create pending donation
        await database_1.prisma.donation.create({
            data: {
                amount,
                userId,
                eventId: eventId || null,
                organizationId: organizationId || null,
                status: 'PENDING',
                stripeSessionId: session.id
            }
        });
        res.status(200).json({ url: session.url });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy');
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await database_1.prisma.donation.update({
            where: { stripeSessionId: session.id },
            data: { status: 'SUCCESS' }
        });
    }
    res.status(200).json({ received: true });
};
exports.handleStripeWebhook = handleStripeWebhook;
