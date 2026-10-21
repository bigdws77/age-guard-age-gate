-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" DATETIME
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "minAge" INTEGER NOT NULL DEFAULT 21,
    "restrictedTag" TEXT NOT NULL DEFAULT 'age-restricted',
    "popupTitle" TEXT NOT NULL DEFAULT 'Age Verification Required',
    "popupMessage" TEXT NOT NULL DEFAULT 'You must be 21 or older to purchase age-restricted products. Please confirm your age to continue.',
    "confirmText" TEXT NOT NULL DEFAULT 'I am 21 or older',
    "denyText" TEXT NOT NULL DEFAULT 'I am under 21',
    "blockMessage" TEXT NOT NULL DEFAULT 'Your cart contains age-restricted items. Please verify your age to proceed with checkout.',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
