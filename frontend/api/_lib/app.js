import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import subjectsRoutes from './routes/subjects.js';
import testsRoutes from './routes/tests.js';
import attemptsRoutes from './routes/attempts.js';
import remindersRoutes from './routes/reminders.js';
import pushRoutes from './routes/push.js';
import adminRoutes from './routes/admin.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});
