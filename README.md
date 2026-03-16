# Vehicle Tracking Web Application

A comprehensive real-time vehicle tracking system with web interface and mobile app scalability.

## Features

- Real-time GPS location monitoring
- Interactive map interface with Mapbox
- Automated alert system for geofencing, speed violations, etc.
- Responsive web design with PWA capabilities
- User authentication and authorization
- RESTful API with GraphQL support
- Real-time communication via WebSockets

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- bcrypt for password hashing

### Frontend
- Next.js with React
- TypeScript
- Tailwind CSS for styling
- Mapbox GL JS for maps
- Socket.io client for real-time updates

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Mapbox account and access token

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd Backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd Frontend
   npm install
   ```

4. Set up environment variables:
   - Copy `.env` files and update with your values
   - Add your Mapbox access token to frontend `.env`

5. Start MongoDB

6. Start the backend:
   ```bash
   cd Backend
   npm run dev
   ```

7. Start the frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

## API Documentation

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Vehicles
- GET /api/vehicles - Get user's vehicles
- POST /api/vehicles - Create new vehicle
- PUT /api/vehicles/:id - Update vehicle
- DELETE /api/vehicles/:id - Delete vehicle

### Locations
- GET /api/locations/vehicle/:vehicleId - Get vehicle locations
- POST /api/locations - Add new location (device endpoint)

### Alerts
- GET /api/alerts - Get user's alerts
- GET /api/alerts/vehicle/:vehicleId - Get vehicle alerts
- PUT /api/alerts/:id - Update alert status

## Database Schema

### Users
- name, email, password, role

### Vehicles
- name, licensePlate, owner, status, deviceId, lastLocation

### Locations
- vehicleId, lat, lng, speed, heading, accuracy, timestamp

### Alerts
- vehicleId, type, message, severity, location, status, timestamp

## Deployment

### Backend
- Deploy to Heroku, Railway, or AWS
- Use MongoDB Atlas for database

### Frontend
- Deploy to Vercel or Netlify
- Configure PWA settings

## Security Considerations

- HTTPS required for production
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Secure JWT secret

## Scalability

- Horizontal scaling with load balancers
- Redis for session management
- Database indexing and sharding
- CDN for static assets

## Mobile App Conversion

- PWA manifest for app-like experience
- Service workers for offline functionality
- Touch-optimized interface
- Push notifications via service workers

## License

MIT License
