# Restaurant Reservation API

This project is a RESTful API for managing restaurant reservations. It allows users to browse restaurants, make reservations, and manage their bookings. Admins can manage restaurant data and view all reservations.

## Features
- User authentication and authorization
- Restaurant CRUD (Create, Read, Update, Delete)
- Reservation CRUD (Create, Read, Update, Delete)
- User can make up to 3 reservations
- Admin can manage all data

## Endpoints
- `/api/v1/restaurants` - Manage restaurants
- `/api/v1/restaurants/:restaurantId/reservations` - Manage reservations for a restaurant
- `/api/v1/reservations` - Manage all reservations
- `/api/v1/auth` - Authentication

## Getting Started
1. Install dependencies: `npm install`
2. Set up your environment variables in `config/config.env`
3. Start the server: `npm run dev`

## Technologies
- Node.js
- Express.js
- MongoDB & Mongoose

## License
ISC
