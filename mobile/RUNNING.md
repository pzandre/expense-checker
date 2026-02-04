# Running the Expense Checker Mobile App

This guide explains how to run the Expo React Native application on Android and Desktop.

## Prerequisites

Before running the app, ensure you have:

1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Expo CLI** installed globally:
   ```bash
   npm install -g expo-cli
   ```
4. **Backend API running** (see backend README)
   - Default: `http://localhost:8000/api`
   - Or configure via `.env` file

## Initial Setup

### 1. Install Dependencies

Navigate to the mobile directory and install dependencies:

```bash
cd mobile
npm install
```

### 2. Configure API URL

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

**Note:** For Android emulator, use `http://10.0.2.2:8000/api` instead of `localhost`  
**Note:** For physical device, use your computer's local IP (e.g., `http://192.168.1.100:8000/api`)

### 3. Create Required Assets (if missing)

The app expects these asset files. Create placeholder images if they don't exist:

```bash
mkdir -p mobile/assets
```

Required files:
- `assets/icon.png` - App icon (1024x1024px)
- `assets/splash.png` - Splash screen (1242x2436px)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024px)
- `assets/favicon.png` - Web favicon (48x48px)

You can use any placeholder images for development, or generate them using:
- [Expo Asset Generator](https://www.npmjs.com/package/@expo/asset-generator)
- Or create simple colored squares as placeholders

## Running the App

### Option 1: Development Server (Recommended)

Start the Expo development server:

```bash
cd mobile
npm start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Display a QR code in the terminal

#### For Android:

**Method A: Using Android Emulator**
1. Start an Android emulator (via Android Studio)
2. Run: `npm run android`
   - Or press `a` in the Expo CLI terminal
   - The app will build and launch automatically

**Method B: Using Physical Device**
1. Install **Expo Go** app from Google Play Store
2. Ensure your phone and computer are on the same WiFi network
3. Scan the QR code displayed in the terminal with Expo Go app
   - Or open Expo Go and manually enter the connection URL

#### For Desktop (Web):

```bash
npm run web
```

This opens the app in your default browser. Useful for quick testing but some native features may not work.

### Option 2: Development Build (For Native Features)

If you need full native features or want to test on desktop as a standalone app:

#### Android APK:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build development APK
eas build --platform android --profile development
```

#### Desktop (Windows/Mac/Linux):

Expo doesn't directly support desktop builds, but you can:

1. **Use React Native for Windows/Mac:**
   - Requires additional setup with React Native Windows/Mac
   - More complex setup

2. **Use Expo Web (Simpler):**
   ```bash
   npm run web
   ```
   Then use Electron or similar to wrap it as a desktop app

3. **Use Expo Development Build:**
   - Build a development client
   - Run on desktop using React Native for Desktop

## Troubleshooting

### API Connection Issues

**Problem:** App can't connect to backend API

**Solutions:**
- **Android Emulator:** Use `http://10.0.2.2:8000/api` instead of `localhost`
- **Physical Device:** Use your computer's local IP address
- **Check backend is running:** `curl http://localhost:8000/api/`
- **Check CORS settings:** Ensure backend allows your Expo dev server origin

### Port Already in Use

**Problem:** Port 8081 (Metro bundler) is already in use

**Solution:**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --port 8082
```

### Module Not Found Errors

**Problem:** Missing dependencies or TypeScript errors

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start --clear

# Reset Metro bundler cache
npx expo start -c
```

### Android Build Fails

**Problem:** Android build errors or missing SDK

**Solutions:**
1. Install Android Studio
2. Install Android SDK (API 33+)
3. Set ANDROID_HOME environment variable
4. Accept Android licenses:
   ```bash
   $ANDROID_HOME/tools/bin/sdkmanager --licenses
   ```

### TypeScript Errors

**Problem:** TypeScript compilation errors

**Solutions:**
```bash
# Check TypeScript version
npx tsc --version

# Run type check
npx tsc --noEmit

# Fix common issues:
# - Ensure @types/react is installed
# - Check tsconfig.json configuration
```

## Development Workflow

### Hot Reloading

The app supports hot reloading by default:
- Save a file → Changes appear automatically
- Press `r` in terminal to reload
- Press `m` to toggle menu

### Debugging

1. **React Native Debugger:**
   - Shake device or press `Cmd+D` (Mac) / `Ctrl+M` (Windows)
   - Select "Debug"

2. **Console Logs:**
   - View in terminal where `npm start` is running
   - Or use Chrome DevTools (when debugging enabled)

3. **Network Requests:**
   - Check browser DevTools Network tab (when debugging)
   - Or use React Native Debugger

### Testing Authentication

Before using the app, create a user in the backend:

```bash
# In backend directory
docker-compose exec web python manage.py shell
```

```python
from django.contrib.auth.models import User
user = User.objects.create_user('your_username', 'your_email@example.com', 'your_password')
user.save()
```

Then use these credentials to log in through the app.

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Expenses list
│   │   ├── add.tsx        # Add expense
│   │   └── reports.tsx    # Reports dashboard
│   └── expense/[id].tsx   # Edit expense screen
├── components/            # Reusable components
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   ├── CategorySelector.tsx
│   └── charts/            # Chart components
├── services/              # API client
│   └── api.ts
├── assets/                # Images and static files
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Common Commands

```bash
# Start development server
npm start

# Start with Android
npm run android

# Start with iOS (Mac only)
npm run ios

# Start web version
npm run web

# Clear cache and restart
npx expo start --clear

# Type check
npx tsc --noEmit

# Install new package
npm install <package-name>
```

## Next Steps

1. **Start Backend:** Ensure Django API is running
2. **Create User:** Create a test user in Django shell
3. **Start Expo:** Run `npm start` in mobile directory
4. **Launch App:** Use Android emulator or Expo Go on device
5. **Login:** Use credentials created in step 2
6. **Test Features:** Add expenses, create categories, view reports

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
