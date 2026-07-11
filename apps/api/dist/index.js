"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const org_1 = __importDefault(require("./routes/org"));
const event_1 = __importDefault(require("./routes/event"));
const registration_1 = __importDefault(require("./routes/registration"));
const profile_1 = __importDefault(require("./routes/profile"));
const comment_1 = __importDefault(require("./routes/comment"));
const admin_1 = __importDefault(require("./routes/admin"));
const donation_1 = __importDefault(require("./routes/donation"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_1.default);
app.use('/api/orgs', org_1.default);
app.use('/api/events', event_1.default);
app.use('/api/registrations', registration_1.default);
app.use('/api/profiles', profile_1.default);
app.use('/api/community', comment_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/donations', donation_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'sevantra-api' });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
