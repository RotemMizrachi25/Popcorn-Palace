# Popcorn Palace Movie Ticket Booking System - Instructions

## Project Overview

This application is a RESTful API for a movie ticket booking system built with NestJS and TypeScript. It provides endpoints to manage movies, showtimes, and ticket bookings.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Docker and Docker Compose
- Git

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/RotemMizrachi25/Popcorn-Palace.git
cd Popcorn-Palace
npm install
```

### 2. Database Setup

The project uses PostgreSQL database which can be started using Docker Compose:

```bash
docker compose up -d
```

This will create a PostgreSQL instance with the following configuration:
- Host: localhost
- Port: 5432
- Username: popcorn-palace
- Password: popcorn-palace
- Database: popcorn-palace

### 3. Running the Application

Start the application in development mode:

```bash
npm run start:dev
```

The API will be available at http://localhost:3000

## Building the Application

To build the application for production:

```bash
npm run build
```

The compiled JavaScript files will be available in the `dist` directory.

## Testing

Run tests using the following commands:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

### Movies API

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/movies/all` | GET | - | Get all movies |
| `/movies` | POST | `{ "title": "Sample Movie", "genre": "Action", "duration": 120, "rating": 8.7, "releaseYear": 2025 }` | Add a new movie |
| `/movies/update/{movieTitle}` | POST | `{ "title": "Updated Movie", "genre": "Action", "duration": 120, "rating": 8.7, "releaseYear": 2025 }` | Update a movie |
| `/movies/{movieTitle}` | DELETE | - | Delete a movie |

### Showtimes API

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/showtimes/{showtimeId}` | GET | - | Get showtime by ID |
| `/showtimes` | POST | `{ "movieId": 1, "price": 20.2, "theater": "Theater 1", "startTime": "2025-02-14T11:47:46.125Z", "endTime": "2025-02-14T14:47:46.125Z" }` | Add a new showtime |
| `/showtimes/update/{showtimeId}` | POST | `{ "movieId": 1, "price": 50.2, "theater": "Theater 2", "startTime": "2025-02-14T11:47:46.125Z", "endTime": "2025-02-14T14:47:46.125Z" }` | Update a showtime |
| `/showtimes/{showtimeId}` | DELETE | - | Delete a showtime |

### Bookings API

| Endpoint | Method | Request Body | Description |
|----------|--------|--------------|-------------|
| `/bookings` | POST | `{ "showtimeId": 1, "seatNumber": 15, "userId": "84438967-f68f-4fa0-b620-0f08217e76af" }` | Book a ticket |

## Implementation Details

### Project Structure

```
src/
├── movies/               # Movies module
│   ├── dto/              # Data Transfer Objects
│   ├── entities/         # Database entities
│   ├── movies.controller.ts
│   ├── movies.module.ts
│   └── movies.service.ts
├── showtimes/            # Showtimes module
│   ├── dto/
│   ├── entities/
│   ├── showtimes.controller.ts
│   ├── showtimes.module.ts
│   └── showtimes.service.ts
├── bookings/             # Bookings module
│   ├── dto/
│   ├── entities/
│   ├── bookings.controller.ts
│   ├── bookings.module.ts
│   └── bookings.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

### Key Features

1. **Movie Management**:
   - CRUD operations for movies
   - Validation for movie data

2. **Showtime Management**:
   - Add, update, delete, and retrieve showtimes
   - Validation to prevent overlapping showtimes in the same theater

3. **Ticket Booking**:
   - Book tickets for specific showtimes
   - Validation to prevent double-booking of seats

### Technologies Used

- NestJS: A progressive Node.js framework
- TypeORM: Object-Relational Mapping for database operations
- PostgreSQL: Database for persistent storage
- class-validator: For input validation
- Jest: For testing

## Troubleshooting

- If you encounter database connection issues, ensure Docker is running and the PostgreSQL container is active
- For TypeORM errors, verify that entities are properly defined and the database configuration is correct
- If endpoints return 404, check that all controllers are properly registered in their respective modules

## Additional Notes

- The application uses TypeORM's `synchronize: true` option for development, which automatically creates database tables based on entity definitions. This should be disabled in production.
- All endpoints return appropriate HTTP status codes and error messages for invalid operations.