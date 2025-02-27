# API Integration Documentation

## Overview
The application integrates with two main APIs:
1. Offset Reporting API
2. Offset Management API

## API Clients

### Reporting API Client
```typescript
class OffsetApiClient {
  // Core functionality for reporting data
  // Handles authentication and requests
  // Manages caching and retries
}
```

### Management API Client
```typescript
class OffsetManagementClient {
  // Handles management operations
  // Supports CRUD operations
  // Manages authentication state
}
```

## Authentication

### Token Management
```typescript
// Setting auth token
client.setAuthToken(token);

// Clearing auth token
client.clearAuthToken();
```

### Error Handling
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## Request Handling

### Caching
- In-memory cache for frequently accessed data
- Cache invalidation strategies
- Cache duration configuration

### Retries
- Exponential backoff
- Maximum retry attempts
- Error categorization

### CORS
- Proxy configuration
- Header management
- Error handling

## Available Endpoints

### Reporting API
1. Customer Data
2. Order Information
3. Inventory Levels
4. Analytics

### Management API
1. Customer Management
2. Order Processing
3. Inventory Control
4. System Configuration