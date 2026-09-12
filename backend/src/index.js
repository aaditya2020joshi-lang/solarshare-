import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import ordersRoutes from './routes/orders.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/orders', ordersRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`PowerGlove API listening on port ${port}`));
