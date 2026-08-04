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
import publicRoutes from './routes/public';
import teamRoutes from './routes/team';
import feedRoutes from './routes/feed';
import messageRoutes from './routes/message';
import issueRoutes from './routes/issue';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'https://sevantra.vercel.app', 'http://localhost:4000'],
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
app.use('/api/public', publicRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/issues', issueRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sevantra-api' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
