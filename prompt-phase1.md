Use tailwind-4-docs skill, 
and web-design-guidelines skill. Also use @DESIGN.md. Keep the website design like Vercel.

Name: ForgeStack


# PHASE 1 — Authentication Module (Production-Grade SaaS Starter Kit)

You are a senior staff-level full-stack engineer building a commercial SaaS starter kit that will be sold to customers. The code must be production-ready, secure, maintainable, scalable, and follow industry best practices.

## Tech Stack

* Next.js 16 App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase PostgreSQL
* Prisma ORM
* Auth.js (NextAuth)
* React Server Components where appropriate
* Zod for validation

The implementation should follow clean architecture principles and be organized for long-term maintainability.

---

# Goal

Build a complete authentication and authorization system suitable for a commercial SaaS application.

The authentication system must support:

* Email/password authentication
* Google OAuth login
* GitHub OAuth login
* Magic link authentication
* Email verification
* Password reset
* Session management
* Route protection
* Role-based authorization
* Admin users
* Secure middleware protection

---

# Database Design

Create database schema and Prisma models for:

## Users

Fields:

* id (UUID)
* email
* name
* avatar
* emailVerified
* passwordHash
* roleId
* createdAt
* updatedAt
* lastLoginAt

## Roles

Fields:

* id
* name

Default roles:

* USER
* ADMIN

## Sessions

Fields:

* id
* userId
* expiresAt
* createdAt

## VerificationTokens

Fields:

* id
* token
* email
* expiresAt

## PasswordResetTokens

Fields:

* id
* token
* userId
* expiresAt

Generate Prisma migrations.

---

# Authentication Features

Implement:

## Sign Up

Requirements:

* Name
* Email
* Password

Validation:

* Zod schema
* Strong password requirements
* Proper error handling

Flow:

1. User registers
2. User record created
3. Verification email sent
4. User cannot access protected pages until verified

---

## Login

Support:

### Email + Password

Requirements:

* Secure password comparison
* Rate limiting ready architecture
* Proper error handling

### Google OAuth

Implement complete flow.

### GitHub OAuth

Implement complete flow.

### Magic Link

Implement passwordless login flow.

---

# Email Verification

Create flow:

1. Generate token
2. Store token securely
3. Send verification email
4. Verify token
5. Mark account as verified

Verification links should expire.

---

# Password Reset

Create flow:

1. Forgot password page
2. Generate reset token
3. Send reset email
4. Validate token
5. Set new password

Tokens must expire.

---

# Session Management

Requirements:

* Secure cookies
* HttpOnly
* SameSite protection
* Proper session expiration
* Session refresh strategy

Implement server-side session retrieval helpers.

---

# Authorization

Implement Role-Based Access Control.

Roles:

## USER

Can access:

* Dashboard
* Profile

## ADMIN

Can access:

* Dashboard
* Profile
* Admin panel
* User management pages

Create reusable authorization utilities:

Examples:

* requireAuth()
* requireAdmin()
* hasRole()

---

# Middleware Protection

Create middleware that protects:

/dashboard/*
/settings/*
/admin/*

Requirements:

* Redirect unauthenticated users
* Redirect unauthorized users
* Prevent protected page access

---

# UI Pages

Create fully functional pages:

## Public

* Login
* Register
* Forgot Password
* Reset Password
* Verify Email
* Magic Link Login

## Protected

* Dashboard
* Profile

## Admin

* Admin Dashboard
* User List

Use shadcn/ui components.

Design should be:

* Responsive
* Accessible
* Mobile friendly
* Dark mode ready

---

# Security Requirements

Follow security best practices:

* Password hashing using bcrypt or argon2
* CSRF protection
* Input validation
* Output sanitization
* Secure token generation
* Secure cookie configuration
* Protection against user enumeration
* Secure password reset implementation

Never expose sensitive data to the client.

---

# Folder Structure

Create a scalable folder structure.

Examples:

/app
/components
/features/auth
/features/users
/features/admin
/lib
/server
/prisma

Authentication logic should be separated from UI components.

---

# Developer Experience

Provide:

* Environment variable examples
* Setup documentation
* Seed script
* Prisma migration commands
* README section explaining authentication setup

---

# Deliverables

Generate:

1. Database schema
2. Prisma models
3. Migrations
4. Authentication flows
5. Middleware
6. Protected routes
7. Role-based authorization
8. UI pages
9. Reusable hooks and utilities
10. Documentation

The implementation should be production-grade and suitable for selling as part of a premium SaaS starter kit.
