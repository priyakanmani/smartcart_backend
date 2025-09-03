# Smart Shopping Cart Backend API

A comprehensive backend system for a smart shopping cart application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Multi-role Authentication** (Admin, Manager, Customer)
- **Store Management** with multiple store support
- **Product Management** with inventory tracking
- **Smart Cart System** with real-time updates
- **Order Management** with status tracking
- **Promotion System** with various discount types
- **Analytics & Reporting** for business insights
- **Rate Limiting** for API protection
- **Input Validation** and sanitization
- **Comprehensive Error Handling**
- **JWT-based Authentication**
- **Database Seeding** for quick setup

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartcart-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartcart
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 👥 Default Accounts (After Seeding)

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@smartcart.com | admin123 | System administrator |
| Manager | manager@smartcart.com | manager123 | Store manager |
| Customer | john@example.com | customer123 | Test customer 1 |
| Customer | jane@example.com | customer123 | Test customer 2 |

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/refresh` | Refresh JWT token | Public |
| POST | `/logout` | User logout | Public |
| GET | `/verify` | Verify JWT token | Public |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password` | Reset password with token | Public |
| POST | `/change-password` | Change password | Authenticated |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Admin dashboard data | Admin |
| GET | `/users` | Get all users | Admin |
| POST | `/users` | Create new user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/stores` | Get all stores | Admin |
| POST | `/stores` | Create new store | Admin |
| GET | `/settings` | Get system settings | Admin |
| PUT | `/settings` | Update system settings | Admin |
| POST | `/backup` | Create system backup | Admin |
| GET | `/analytics` | Get system analytics | Admin |

### Manager Routes (`/api/manager`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Manager dashboard | Manager/Admin |
| GET | `/products` | Get store products | Manager/Admin |
| POST | `/products` | Add new product | Manager/Admin |
| PUT | `/products/:id` | Update product | Manager/Admin |
| DELETE | `/products/:id` | Delete product | Manager/Admin |
| GET | `/analytics` | Store analytics | Manager/Admin |
| GET | `/customers` | Store customers | Manager/Admin |
| GET | `/promotions` | Store promotions | Manager/Admin |
| POST | `/promotions` | Create promotion | Manager/Admin |
| PUT | `/promotions/:id` | Update promotion | Manager/Admin |
| GET | `/carts` | Active carts | Manager/Admin |
| GET | `/reports/:type` | Generate reports | Manager/Admin |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/cart` | Get user cart | Authenticated |
| POST | `/cart/add` | Add item to cart | Authenticated |
| PUT | `/cart/update` | Update cart item | Authenticated |
| DELETE | `/cart/remove/:productId` | Remove cart item | Authenticated |
| GET | `/promotions` | Available promotions | Authenticated |
| POST | `/checkout` | Process checkout | Authenticated |
| GET | `/orders` | Order history | Authenticated |
| GET | `/orders/:id` | Get specific order | Authenticated |
| PUT | `/orders/:id/cancel` | Cancel order | Authenticated |
| GET | `/profile` | User profile | Authenticated |
| PUT | `/profile` | Update profile | Authenticated |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request/Response Examples

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

### Add Product (Manager)
```bash
POST /api/manager/products
Authorization: Bearer <manager-token>
Content-Type: application/json

{
  "name": "Fresh Apples",
  "category": "fruits",
  "price": 120.00,
  "unit": "kg",
  "stock": 100,
  "sku": "FRUIT001"
}
```

### Add to Cart
```bash
POST /api/user/cart/add
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789012345",
  "quantity": 2,
  "storeId": "64a1b2c3d4e5f6789012346"
}
```

## 🗄️ Database Schema

### User Model
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: Enum ['customer', 'manager', 'admin']
- `phone`: String (optional)
- `address`: Object (optional)
- `storeId`: ObjectId (required for managers)
- `status`: Enum ['active', 'inactive', 'suspended']

### Product Model
- `name`: String (required)
- `category`: Enum ['fruits', 'vegetables', 'dairy', 'meat', 'beverages', 'snacks', 'household', 'personal_care', 'other']
- `price`: Number (required, min: 0)
- `unit`: Enum ['kg', 'grams', 'liters', 'ml', 'pieces', 'packets', 'bottles']
- `stock`: Number (required, min: 0)
- `sku`: String (required, unique)
- `storeId`: ObjectId (required)
- `isActive`: Boolean (default: true)

### Cart Model
- `userId`: ObjectId (required)
- `storeId`: ObjectId (required)
- `items`: Array of cart items
- `subtotal`: Number
- `cgst`: Number (9%)
- `sgst`: Number (9%)
- `discount`: Number
- `total`: Number
- `status`: Enum ['active', 'completed', 'abandoned']

### Order Model
- `orderId`: String (auto-generated)
- `userId`: ObjectId (required)
- `storeId`: ObjectId (required)
- `items`: Array of order items
- `total`: Number (required)
- `status`: Enum ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
- `paymentMethod`: Enum ['cash', 'card', 'upi', 'wallet']
- `deliveryAddress`: Object

## 🛡️ Security Features

- **Rate Limiting**: Different limits for various endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **XSS Protection**: Input sanitization to prevent XSS attacks
- **CORS**: Configured for specific origins
- **Helmet**: Security headers for protection
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage

## 📊 Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/smartcart |
| `JWT_SECRET` | JWT signing secret | fallback_secret |
| `JWT_EXPIRE` | JWT expiration time | 24h |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | 10 |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | 15 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Rate Limits

| Endpoint Type | Window | Max Requests |
|---------------|--------|--------------|
| General API | 15 minutes | 100 |
| Authentication | 15 minutes | 5 |
| Cart Operations | 1 minute | 30 |
| Admin Operations | 5 minutes | 50 |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

For testing individual endpoints, you can use tools like:
- **Postman**: Import the provided collection
- **curl**: Command line testing
- **Insomnia**: REST client

### Sample curl requests:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartcart.com","password":"admin123"}'

# Get dashboard (with token)
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Performance & Monitoring

### Database Indexes
The application includes optimized indexes for:
- User email lookups
- Product searches by store and category
- Order queries by user and date
- Cart lookups by user and status

### Logging
Uses Winston for structured logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure proper MongoDB URI
   - Set up email service credentials

2. **Security**
   - Enable HTTPS
   - Configure proper CORS origins
   - Set up rate limiting
   - Enable security headers

3. **Database**
   - Set up MongoDB replica set
   - Configure proper backup strategy
   - Optimize indexes

4. **Monitoring**
   - Set up log aggregation
   - Configure health checks
   - Monitor performance metrics

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the test suite
6. Submit a pull request

## 📜 API Response Examples

### Successful Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Cart Response
```json
{
  "cart": {
    "id": "64a1b2c3d4e5f6789012346",
    "items": [
      {
        "id": "64a1b2c3d4e5f6789012347",
        "name": "Fresh Apples",
        "price": 120.00,
        "originalPrice": 150.00,
        "quantity": 2,
        "unit": "kg",
        "image": "🍎",
        "savings": 30.00
      }
    ],
    "totals": {
      "subtotal": 240.00,
      "cgst": 21.60,
      "sgst": 21.60,
      "discount": 12.00,
      "total": 271.20,
      "totalSavings": 60.00
    }
  }
}
```

### Error Response
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long",
      "value": ""
    }
  ]
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Errors**
   - Check if JWT_SECRET is set
   - Verify token format in Authorization header
   - Ensure token hasn't expired

3. **Validation Errors**
   - Check request body format
   - Verify required fields are included
   - Ensure data types match schema

4. **Rate Limiting**
   - Check if you're exceeding rate limits
   - Wait for the rate limit window to reset
   - Consider adjusting limits for development

### Debug Mode

Enable debug logging:
```bash
DEBUG=smartcart:* npm run dev
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the Smart Shopping Cart System**