# Quick Start Guide - Mobile App

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Install Expo CLI globally (if not installed)
npm install -g expo-cli
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

**For Android Emulator:**
Edit `mobile/services/api.ts` and change line 13 to:
```typescript
return 'http://10.0.2.2:8000/api';
```

**For Physical Device:**
1. Find your computer's local IP:
   ```bash
   # Linux/Mac
   ip addr show | grep "inet " | grep -v 127.0.0.1
   
   # Or
   hostname -I
   ```
2. Edit `mobile/services/api.ts` and change line 13 to:
   ```typescript
   return 'http://YOUR_LOCAL_IP:8000/api';
   ```
   Example: `http://192.168.1.100:8000/api`

**For Web (localhost):**
Keep the default: `http://localhost:8000/api`

### 3. Create Placeholder Assets (if missing)

```bash
cd mobile
mkdir -p assets

# Create simple placeholder images (or use any 1024x1024 images)
# You can skip this if assets already exist
```

### 4. Start Backend API

In a separate terminal:
```bash
cd backend
docker-compose up -d
```

Verify it's running:
```bash
curl http://localhost:8000/api/
# Should return: {"detail":"Authentication credentials were not provided."}
```

### 5. Create a Test User

```bash
cd backend
docker-compose exec web python manage.py shell
```

```python
from django.contrib.auth.models import User
user = User.objects.create_user('testuser', 'test@example.com', 'testpass123')
user.save()
exit()
```

### 6. Start Expo Development Server

```bash
cd mobile
npm start
```

This opens Expo DevTools in your browser and shows a QR code.

### 7. Run on Android

**Option A: Android Emulator**
1. Start Android Studio
2. Start an emulator (AVD)
3. In the Expo terminal, press `a` or run:
   ```bash
   npm run android
   ```

**Option B: Physical Device**
1. Install **Expo Go** from Google Play Store
2. Scan the QR code with Expo Go app
3. App will load automatically

### 8. Login and Test

1. Open the app
2. You'll need to implement login screen first, or modify the app to skip auth for testing
3. Use credentials: `testuser` / `testpass123`

## Common Issues

### "Cannot connect to API"
- **Android Emulator:** Use `10.0.2.2` instead of `localhost`
- **Physical Device:** Use your computer's local IP, ensure same WiFi
- **Check backend:** `curl http://localhost:8000/api/`

### "Port 8081 already in use"
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

### "Module not found"
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

## Next Steps

- See `RUNNING.md` for detailed documentation
- Implement login screen if not done
- Test all features: add expenses, categories, view reports
