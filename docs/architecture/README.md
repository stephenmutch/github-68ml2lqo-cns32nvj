# Architecture Overview

## System Architecture

The Offset Commerce Dashboard follows a modern React-based architecture with the following key characteristics:

### Core Principles
1. **Component-Based Architecture**
   - Modular, reusable components
   - Clear separation of concerns
   - Consistent patterns and conventions

2. **State Management**
   - Zustand for global state
   - React hooks for local state
   - Optimized re-renders and performance

3. **Data Flow**
   - Unidirectional data flow
   - Props for component communication
   - Events for child-to-parent communication

### Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # Shared UI components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── lib/                # Core utilities and services
│   ├── api/           # API clients and services
│   ├── auth/          # Authentication logic
│   └── utils/         # Shared utilities
├── stores/            # Zustand stores
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── styles/            # Global styles and Tailwind config
```

### Key Technologies

#### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- React Router

#### Backend Integration
- Supabase
- Custom API Clients
- WebSocket Support

#### Development Tools
- Vite
- ESLint
- Prettier
- Vitest

### Security Considerations
1. Authentication via Supabase
2. API token management
3. CORS handling
4. Input validation
5. XSS prevention