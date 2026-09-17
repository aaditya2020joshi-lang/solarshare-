import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import subjectsRoutes from './routes/subjects.routes.js';
import testsRoutes from './routes/tests.routes.js';
import attemptsRoutes from './routes/attempts.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import pushRoutes from './routes/push.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { startReminderScheduler } from './services/reminderScheduler.js';

dotenv.config();

const app = express();

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

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Study app API listening on port ${port}`);
  startReminderScheduler();
});
