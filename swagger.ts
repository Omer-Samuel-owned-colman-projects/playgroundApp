import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Playground App API',
    version: '1.0.0',
    description: 'API documentation for Playground App - Posts, Comments, and User management',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    },
    schemas: {
      Post: {
        type: 'object',
        required: ['content', 'sender'],
        properties: {
          _id: {
            type: 'string',
            description: 'Post ID',
            example: '507f1f77bcf86cd799439011',
          },
          content: {
            type: 'string',
            description: 'Post content',
            example: 'This is a post content',
          },
          sender: {
            type: 'string',
            description: 'Sender ID or username',
            example: 'user123',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Comment: {
        type: 'object',
        required: ['message', 'sender', 'postId'],
        properties: {
          _id: {
            type: 'string',
            description: 'Comment ID',
            example: '507f1f77bcf86cd799439012',
          },
          message: {
            type: 'string',
            description: 'Comment message',
            example: 'This is a comment',
          },
          sender: {
            type: 'string',
            description: 'Sender ID or username',
            example: 'user123',
          },
          postId: {
            type: 'string',
            description: 'Associated Post ID',
            example: '507f1f77bcf86cd799439011',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      User: {
        type: 'object',
        required: ['email'],
        properties: {
          _id: {
            type: 'string',
            description: 'User ID',
            example: '507f1f77bcf86cd799439013',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          refreshToken: {
            type: 'string',
            description: 'Refresh token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Error description',
          },
        },
      },
    },
  },
};

const options: Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
