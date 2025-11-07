# OAuth Authentication Setup Guide

This guide will walk you through setting up Google and GitHub OAuth authentication for the Airbnb Clone application.

## Overview

The OAuth implementation allows users to sign in using their Google or GitHub accounts. The flow works as follows:

1. User clicks "Continue with Google" or "Continue with GitHub"
2. User is redirected to OAuth provider (Google/GitHub)
3. User authenticates and grants permissions
4. OAuth provider redirects back to our backend
5. Backend creates/updates user and generates JWT token
6. Backend redirects to frontend with token and user data
7. Frontend stores token and updates user state

## Prerequisites

- A Google account (for Google OAuth)
- A GitHub account (for GitHub OAuth)
- The application must be running on a consistent URL (e.g., `http://localhost:3000` for backend, `http://localhost:5173` for frontend)

---

## Part 1: Setting Up Google OAuth

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **"Create Credentials"** > **"OAuth client ID"**
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `userinfo.email` and `userinfo.profile`
   - Add test users if needed

### Step 2: Configure OAuth Client

1. Application type: **Web application**
2. Name: `Airbnb Clone` (or your preferred name)
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Click **Create**

### Step 3: Copy Credentials

After creation, you'll see:
- **Client ID**: `1234567890-abc123def456.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123def456`

**Keep these secure! Never commit them to version control.**

### Step 4: Update Backend Environment Variables

Edit `server/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## Part 2: Setting Up GitHub OAuth

### Step 1: Create GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the form:
   - **Application name**: `Airbnb Clone`
   - **Homepage URL**: `http://localhost:5173`
   - **Application description**: (optional)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click **Register application**

### Step 2: Generate Client Secret

1. After creating the app, you'll see the **Client ID**
2. Click **"Generate a new client secret"**
3. Copy the secret immediately (it won't be shown again)

### Step 3: Copy Credentials

You'll have:
- **Client ID**: `Iv1.abc123def456`
- **Client Secret**: `ghp_abc123def456...`

**Keep these secure! Never commit them to version control.**

### Step 4: Update Backend Environment Variables

Edit `server/.env`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

---

## Part 3: Final Configuration

### Update Client URL

Make sure the `CLIENT_URL` in `server/.env` matches your frontend URL:

```env
CLIENT_URL=http://localhost:5173
```

### Full `.env` Example

Your `server/.env` should look like this:

```env
PORT=3000
DATABASE_URL=mongodb://admin:secret@localhost:27017/airbnb?authSource=admin
TEST_DATABASE_URL=mongodb://admin:secret@localhost:27017/airbnb-test?authSource=admin
JWT_SECRET={justanExample}
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:5174"]
NODE_ENV=development
MONGO_USERNAME=admin
MONGO_PASSWORD=secret

# OAuth Configuration
CLIENT_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.abc123def456
GITHUB_CLIENT_SECRET=ghp_abc123def456...
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

---

## Testing OAuth Flow

### 1. Start the Application

```bash
# From project root
./dev.sh
```

Or manually:

```bash
# Terminal 1 - MongoDB
cd server && docker-compose up mongodb

# Terminal 2 - Backend
cd server && pnpm run dev

# Terminal 3 - Frontend
cd client && pnpm run dev
```

### 2. Test Google OAuth

1. Navigate to `http://localhost:5173`
2. Click **"Sign up"** or **"Login"**
3. Click **"Continue with Google"**
4. You should be redirected to Google's login page
5. Sign in with your Google account
6. Grant permissions
7. You should be redirected back to the app, logged in

### 3. Test GitHub OAuth

1. Navigate to `http://localhost:5173`
2. Click **"Sign up"** or **"Login"**
3. Click **"Continue with Github"**
4. You should be redirected to GitHub's authorization page
5. Click **"Authorize"**
6. You should be redirected back to the app, logged in

---

## Troubleshooting

### Issue: "Redirect URI mismatch" error

**Solution:**
- Ensure the callback URLs in Google/GitHub developer console exactly match the URLs in your `.env`
- Check for trailing slashes - they must match exactly
- Verify the port numbers are correct

### Issue: OAuth button does nothing

**Solution:**
- Check browser console for errors
- Verify `BASEURL` in `client/src/apis/baseurl.ts` is correct
- Ensure backend server is running

### Issue: "Invalid credentials" after OAuth

**Solution:**
- Verify `CLIENT_ID` and `CLIENT_SECRET` are correct
- Check that there are no extra spaces in `.env` values
- Restart the backend server after changing `.env`

### Issue: User created but can't login with password later

**Solution:**
- OAuth users don't have passwords
- They must always use OAuth to login
- To enable password login, implement a "link accounts" feature

### Issue: CORS errors

**Solution:**
- Verify `ALLOWED_ORIGINS` in `server/.env` includes your frontend URL
- Ensure there are no trailing slashes in the origins array

---

## Production Deployment

### Update OAuth Settings

When deploying to production:

1. **Update OAuth redirect URIs:**
   - Google Console: Add `https://yourdomain.com/api/auth/google/callback`
   - GitHub Settings: Add `https://yourdomain.com/api/auth/github/callback`

2. **Update environment variables:**
   ```env
   CLIENT_URL=https://yourdomain.com
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
   ```

3. **Update ALLOWED_ORIGINS:**
   ```env
   ALLOWED_ORIGINS=["https://yourdomain.com"]
   ```

### Security Checklist

- ✅ Never commit `.env` files
- ✅ Use strong `JWT_SECRET`
- ✅ Enable HTTPS in production
- ✅ Set `NODE_ENV=production`
- ✅ Use separate OAuth apps for dev/staging/prod
- ✅ Regularly rotate OAuth secrets
- ✅ Monitor OAuth usage in provider dashboards

---

## Implementation Details

### Backend Files

- **`server/src/config/passport.ts`**: Passport.js configuration with OAuth strategies
- **`server/src/controllers/oauth.controller.ts`**: OAuth callback handlers
- **`server/src/routes/authRoutes.ts`**: OAuth routes (`/auth/google`, `/auth/github`, callbacks)
- **`server/src/models/User.model.ts`**: User model with OAuth fields (`googleId`, `githubId`)

### Frontend Files

- **`client/src/apis/oauth.ts`**: OAuth redirect functions
- **`client/src/pages/Auth/OAuthCallback.tsx`**: Callback page that handles token/user data
- **`client/src/pages/Auth/OAuthError.tsx`**: Error page for failed OAuth
- **`client/src/App.tsx`**: Routes for `/auth/callback` and `/auth/error`

### OAuth Flow Diagram

```
User clicks OAuth button
    ↓
window.location.href = "/api/auth/google"
    ↓
Backend redirects to Google OAuth
    ↓
User authenticates with Google
    ↓
Google redirects to /api/auth/google/callback
    ↓
Backend (Passport) verifies and creates/updates user
    ↓
Backend generates JWT token
    ↓
Backend redirects to /auth/callback?token=...&user=...
    ↓
Frontend OAuthCallback component extracts data
    ↓
Frontend stores token and updates user state
    ↓
User is logged in and redirected to home page
```

---

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## Support

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running
5. Test with a clean browser session (incognito mode)

---

**Last Updated**: 2025-11-07
**Status**: ✅ OAuth implementation complete and tested
