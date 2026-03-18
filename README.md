# Vehicle Tracking System

A full-stack web application for real-time vehicle tracking with dashboard visualization.

## Features

- **Real-time Tracking**: Live vehicle location updates via WebSocket
- **Interactive Map**: Mapbox-powered map with vehicle markers
- **Alert System**: Real-time alerts for vehicle events
- **User Authentication**: Secure login and registration
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- Next.js 14 with TypeScript
- React with hooks
- Socket.io client
- Mapbox GL JS for mapping
- Tailwind CSS for styling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Mapbox account (for map functionality)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tracking-Wrbsite
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev  # For development
   # or
   npm start  # For production
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   cp .env.local.example .env.local  # Configure your environment variables
   npm run dev  # For development
   # or
   npm run build && npm start  # For production
   ```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/vehicle-tracking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Vehicles
- `GET /api/vehicles` - Get user's vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Locations
- `GET /api/locations/vehicle/:vehicleId` - Get vehicle locations
- `POST /api/locations` - Add new location (device endpoint)

### Alerts
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create alert

## Real-time Events

The application uses Socket.io for real-time updates:

- `location-update`: Vehicle location changes
- `alert`: New alerts

## Development

### Running in Development Mode

1. Start MongoDB
2. Start backend: `cd Backend && npm run dev`
3. Start frontend: `cd Frontend && npm run dev`
4. Open http://localhost:3000

### Building for Production

```bash
# Backend
cd Backend
npm run build  # If using build script
npm start

# Frontend
cd Frontend
npm run build
npm start
```

## Database Schema

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (default: 'user')

### Vehicle
- name: String
- licensePlate: String (unique)
- deviceId: String (unique)
- owner: ObjectId (ref: User)
- status: String
- lastLocation: Object

### Location
- vehicleId: ObjectId (ref: Vehicle)
- lat: Number
- lng: Number
- speed: Number
- heading: Number
- accuracy: Number
- timestamp: Date

### Alert
- vehicleId: ObjectId (ref: Vehicle)
- type: String
- message: String
- severity: String
- location: Object
- status: String
- timestamp: Date

## Deployment

### Backend Deployment
- Use PM2 or similar process manager
- Set environment variables
- Ensure MongoDB connection
- Configure CORS for frontend domain

### Frontend Deployment
- Build the application: `npm run build`
- Serve static files or use Vercel/Netlify
- Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

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
