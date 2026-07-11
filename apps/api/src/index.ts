import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import orgRoutes from './routes/org';
import eventRoutes from './routes/event';
import registrationRoutes from './routes/registration';
import profileRoutes from './routes/profile';
import commentRoutes from './routes/comment';
import adminRoutes from './routes/admin';
import donationRoutes from './routes/donation';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/community', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donations', donationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sevantra-api' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
