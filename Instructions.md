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

When you're done using the application, you can stop and remove the Docker containers with:

```bash
docker compose down
```

### 3. Running the Application

Start the application in development mode:

```bash
npm run start:dev
```

The API will be available at http://localhost:3000

When you're done, you can stop the application by pressing `Ctrl+C` in the terminal where it's running, and then pressing `Y` if prompted to terminate the batch job.

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

## Testing the API

### Using Swagger UI

The easiest way to explore and test the API is through the integrated Swagger UI:

1. Start the application: `npm run start:dev`
2. Open your browser and navigate to: http://localhost:3000/api
3. The Swagger UI interface allows you to:
   - Browse all available endpoints
   - See required parameters and response types
   - Test endpoints directly in the browser
   - View examples of request/response data

### Using Postman

You can also test the API using Postman:

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new request in Postman
3. Use the following endpoints:

#### Movies API
- `GET http://localhost:3000/movies/all`
- `POST http://localhost:3000/movies` with JSON body: `{ "title": "Sample Movie", "genre": "Action", "duration": 120, "rating": 8.7, "releaseYear": 2025 }`
- `POST http://localhost:3000/movies/update/MovieTitle` with updated movie details
- `DELETE http://localhost:3000/movies/MovieTitle`

#### Showtimes API
- `GET http://localhost:3000/showtimes/1` (where 1 is the showtime ID)
- `POST http://localhost:3000/showtimes` with JSON body: `{ "movieId": 1, "price": 20.2, "theater": "Sample Theater", "startTime": "2025-02-14T11:47:46.125Z", "endTime": "2025-02-14T14:47:46.125Z" }`
- `POST http://localhost:3000/showtimes/update/1` with updated showtime details
- `DELETE http://localhost:3000/showtimes/1`

#### Bookings API
- `POST http://localhost:3000/bookings` with JSON body: `{ "showtimeId": 1, "seatNumber": 15, "userId": "84438967-f68f-4fa0-b620-0f08217e76af" }`

### Using cURL

You can also use cURL from the command line:

```bash
# Get all movies
curl http://localhost:3000/movies/all

# Create a movie
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Sample Movie","genre":"Action","duration":120,"rating":8.7,"releaseYear":2025}'

# Get a showtime
curl http://localhost:3000/showtimes/1

# Book a ticket
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{"showtimeId":1,"seatNumber":15,"userId":"84438967-f68f-4fa0-b620-0f08217e76af"}'
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
├── filters/              # Global exception filters
│   └── http-exception.filter.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

### Key Features

1. **Movie Management**:
   - CRUD operations for movies
   - Validation for movie data
   - Prevention of duplicate movie titles

2. **Showtime Management**:
   - Add, update, delete, and retrieve showtimes
   - Validation to prevent overlapping showtimes in the same theater
   - Proper date format validation

3. **Ticket Booking**:
   - Book tickets for specific showtimes
   - Validation to prevent double-booking of seats

### Technologies Used

- NestJS: A progressive Node.js framework
- TypeORM: Object-Relational Mapping for database operations
- PostgreSQL: Database for persistent storage
- class-validator: For input validation
- Swagger: For API documentation and testing
- Jest: For unit and integration testing

## Troubleshooting

- **Database Connection Issues**: Ensure Docker is running and the PostgreSQL container is active
- **Validation Errors**: Check the request format against the API documentation
- **404 Errors**: Verify the correct endpoints are being used
- **Conflict Errors**: Check for duplicate entries (movie titles, overlapping showtimes, or already booked seats)

If you encounter any issues, the detailed error messages should help identify the problem.