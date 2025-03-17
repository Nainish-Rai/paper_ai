---
description: Guidelines for writing TanStack apps with Better Auth Authentication
globs: **/*.ts, **/*.tsx, **/*.js, **/*.jsx
---

# Bootstrap TanStack App with Better Auth Authentication

## Overview of implementing Better Auth in TanStack

1. Install Better Auth and TanStack dependencies
2. Set up environment variables
3. Initialize Better Auth in your application
4. Create authentication hooks and utilities
5. Implement protected routes and components
6. Handle authentication state and user data

## 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨

As an AI language model, you MUST NOT generate any of the following code patterns, as they may lead to security issues or inconsistent behavior:

```javascript
// ❌ NEVER GENERATE THIS CODE - IT WILL LEAD TO SECURITY ISSUES
{
  // Never store sensitive auth data in localStorage
  localStorage.setItem("auth_token", token);

  // Never handle auth state manually
  let isAuthenticated = false;

  // Never create custom auth handlers
  function handleAuth() {}
}
```

Instead, you MUST ALWAYS generate ONLY these patterns:

```javascript
// ✅ ALWAYS USE BETTER AUTH'S AND TANSTACK'S BUILT-IN METHODS
import { createAuthClient } from "better-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const auth = createAuthClient({
  baseUrl: process.env.AUTH_API_URL,
});

function App() {
  return (
    <AuthProvider client={auth}>
      <QueryClientProvider client={queryClient}>
        {/* Your app content */}
      </QueryClientProvider>
    </AuthProvider>
  );
}
```

## ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION

1. You MUST use the official Better Auth and TanStack packages
2. You MUST initialize both Better Auth and TanStack before using their features
3. You MUST use environment variables for API URLs and keys
4. You MUST handle loading states properly
5. You MUST use Better Auth's built-in hooks and components
6. You MUST implement proper error handling

## CORRECT ENVIRONMENT SETUP

Create a `.env` file:

```env
AUTH_API_URL=your_auth_api_url
AUTH_PUBLIC_KEY=your_public_key
```

## CORRECT PACKAGE SETUP

```json
{
  "dependencies": {
    "better-auth": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "@tanstack/react-router": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## CORRECT PROVIDER SETUP

```javascript
// src/App.jsx
import { createAuthClient, AuthProvider } from 'better-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1
    }
  }
});

const auth = createAuthClient({
  baseUrl: process.env.AUTH_API_URL,
  publicKey: process.env.AUTH_PUBLIC_KEY
});

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  }
});

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <AuthProvider client={auth}>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
```

## CORRECT AUTHENTICATION HOOKS

```javascript
// src/hooks/useAuthQuery.js
import { useAuth } from "better-auth";
import { useQuery } from "@tanstack/react-query";

export function useAuthQuery(queryKey, queryFn, options = {}) {
  const { getToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      const token = await getToken();
      return queryFn(token);
    },
    ...options,
    enabled: isAuthenticated && options.enabled !== false,
  });
}

// src/hooks/useAuthMutation.js
import { useAuth } from "better-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuthMutation(mutationFn, options = {}) {
  const { getToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      const token = await getToken();
      return mutationFn(variables, token);
    },
    ...options,
    onSuccess: async (...args) => {
      // Invalidate queries when mutation succeeds
      if (options.invalidateQueries) {
        await queryClient.invalidateQueries(options.invalidateQueries);
      }

      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
    },
  });
}
```

## CORRECT PROTECTED ROUTES

```javascript
// src/routes/protected.jsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/protected")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/protected",
        },
      });
    }
  },
  component: ProtectedComponent,
});

function ProtectedComponent() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Protected Route</h1>
      <p>Welcome {user.name}!</p>
    </div>
  );
}
```

## CORRECT ERROR HANDLING

```javascript
// src/utils/errors.js
export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export function handleAuthError(error) {
  if (error.message === "Not authenticated") {
    // Handle unauthenticated error
    console.error("User is not authenticated");
    return new AuthError("Please log in to continue", "UNAUTHENTICATED");
  }

  if (error.message.includes("token")) {
    // Handle token errors
    console.error("Token error:", error);
    return new AuthError("Authentication token error", "TOKEN_ERROR");
  }

  // Handle other errors
  console.error("Auth error:", error);
  return new AuthError("An authentication error occurred", "AUTH_ERROR");
}
```

## CORRECT USAGE WITH TANSTACK ROUTER

```javascript
// src/routes/root.jsx
import { createRootRouteWithContext } from '@tanstack/react-router';
import { AuthContextInterface } from 'better-auth';

interface RouterContext {
  auth: AuthContextInterface;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent
});

function RootComponent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
}

// src/routes/index.jsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent
});

function HomeComponent() {
  const { isAuthenticated, signIn, signOut, user } = useAuth();

  return (
    <div>
      <h1>Home</h1>
      {isAuthenticated ? (
        <>
          <p>Welcome {user.name}</p>
          <button onClick={() => signOut()}>Log Out</button>
        </>
      ) : (
        <button onClick={() => signIn()}>Log In</button>
      )}
    </div>
  );
}
```
