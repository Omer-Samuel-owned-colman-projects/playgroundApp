import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import postRoutes from './src/routes/postRoutes';
import commentRoutes from './src/routes/commentRoutes';
import connectDB from './src/db';
import swaggerSpec from './swagger';

const createApp = (): Express => {
  connectDB();
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use('/api/post', postRoutes);
  app.use('/api/comment', commentRoutes);

  return app;
};

const startServer = (): void => {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

export { createApp, startServer };
