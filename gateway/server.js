require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const {
  logger,
  middleware: { ErrorHandler },
  helpers: { ResponseFormatter },
  constants: { httpStatus }
} = require('@rent-a-car/shared-utils');

const app = express();

// 🛡️ Security & Performance Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// 🚦 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 📝 Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// 🏥 Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(httpStatus.OK).json(
    ResponseFormatter.success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    }, 'Gateway is healthy')
  );
});

// 📊 Service Status Endpoint
app.get('/status', async (req, res) => {
  const services = {
    'auth-service': process.env.AUTH_SERVICE_URL || 'http://rentacar-auth-service:5001',
    // Diğer servisler buraya eklenecek
  };

  const serviceStatuses = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
      serviceStatuses[serviceName] = {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        url: serviceUrl,
        responseTime: response.headers['x-response-time'] || '< 100ms'
      };
    } catch (error) {
      serviceStatuses[serviceName] = {
        status: 'unreachable',
        url: serviceUrl,
        error: error.message
      };
    }
  }

  res.status(httpStatus.OK).json(
    ResponseFormatter.success({
      gateway: 'healthy',
      services: serviceStatuses,
      timestamp: new Date().toISOString()
    }, 'Service status check')
  );
});

// 🔐 Auth Service Proxy
const authServiceProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://rentacar-auth-service:5001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth' // Keep the path as is
  },
  onError: (err, req, res) => {
    logger.error('Auth Service Proxy Error:', err.message);
    res.status(httpStatus.SERVICE_UNAVAILABLE || 503).json(
      ResponseFormatter.error('Auth service is currently unavailable', httpStatus.SERVICE_UNAVAILABLE || 503)
    );
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying to Auth Service: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Auth Service Response: ${proxyRes.statusCode}`);
  }
});

app.use('/api/auth', authServiceProxy);



const carServiceProxy = createProxyMiddleware({
  target: process.env.CAR_SERVICE_URL || 'http://car-service:5002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/cars': '/api/cars'
  }
});
app.use('/api/cars', carServiceProxy);


// 📝 Booking Service Proxy (Gelecekte eklenecek)
/*
const bookingServiceProxy = createProxyMiddleware({
  target: process.env.BOOKING_SERVICE_URL || 'http://booking-service:5003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/bookings': '/api/bookings'
  }
});
app.use('/api/bookings', bookingServiceProxy);
*/

// 💳 Payment Service Proxy (Gelecekte eklenecek)
/*
const paymentServiceProxy = createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': '/api/payments'
  }
});
app.use('/api/payments', paymentServiceProxy);
*/

// 📚 API Documentation Route
app.get('/api', (req, res) => {
  res.status(httpStatus.OK).json(
    ResponseFormatter.success({
      name: 'Rent-a-Car API Gateway',
      version: '1.0.0',
      description: 'Central API Gateway for all microservices',
      endpoints: {
        health: 'GET /health - Gateway health check',
        status: 'GET /status - All services status',
        auth: 'POST /api/auth/* - Authentication service',
        // cars: 'GET /api/cars/* - Car management service (Coming Soon)',
        // bookings: 'GET /api/bookings/* - Booking service (Coming Soon)',
        // payments: 'GET /api/payments/* - Payment service (Coming Soon)'
      },
      documentation: 'https://api-docs.rent-a-car.com'
    }, 'API Gateway Information')
  );
});

// 🚫 404 Handler
app.use(ErrorHandler.notFound);

// 🚨 Global Error Handler
app.use(ErrorHandler.handle);

// 🚀 Start Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`🚪 API Gateway is running on port ${PORT}`);
      logger.info(`🔗 Auth Service URL: ${process.env.AUTH_SERVICE_URL || 'http://rentacar-auth-service:5001'}`);
      logger.info(`🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start Gateway:', error);
    process.exit(1);
  }
};

startServer();