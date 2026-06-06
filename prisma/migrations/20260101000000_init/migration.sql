-- ForgeStack — initial migration
--
-- Hand-authored to match `prisma/schema.prisma`. It creates the User / Role /
-- Account / Session / VerificationToken / PasswordResetToken tables along
-- with all indices, FK constraints, and the UserRole enum.
--
-- Apply with:  npm run prisma:deploy    (production)
--              npm run prisma:migrate   (dev — also writes a record)

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable: Role
CREATE TABLE "Role" (
    "id"          TEXT NOT NULL,
    "name"        "UserRole" NOT NULL,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable: User
CREATE TABLE "User" (
    "id"            TEXT NOT NULL,
    "email"         TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name"          TEXT,
    "avatar"        TEXT,
    "passwordHash"  TEXT,
    "roleId"        TEXT,
    "lastLoginAt"   TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Account (Auth.js)
CREATE TABLE "Account" (
    "id"                  TEXT NOT NULL,
    "userId"              TEXT NOT NULL,
    "type"                TEXT NOT NULL,
    "provider"            TEXT NOT NULL,
    "providerAccountId"   TEXT NOT NULL,
    "refresh_token"       TEXT,
    "access_token"        TEXT,
    "expires_at"          INTEGER,
    "token_type"          TEXT,
    "scope"               TEXT,
    "id_token"            TEXT,
    "session_state"       TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Session (Auth.js)
CREATE TABLE "Session" (
    "id"           TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "expires"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VerificationToken (Auth.js)
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "expires"    TIMESTAMP(3) NOT NULL
);

-- CreateTable: PasswordResetToken (ForgeStack)
CREATE TABLE "PasswordResetToken" (
    "id"        TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- Indices
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- Foreign keys
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
