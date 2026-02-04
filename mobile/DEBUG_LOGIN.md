# Debugging Login Issues

## Check Console Logs

When you click "Sign In", you should see these logs in order:

1. `Button pressed!` - Confirms button click is working
2. `Attempting login for user: [username]` - Login function called
3. `AuthContext: login called with username: [username]` - Auth context received call
4. `API Base URL: [url]` - Shows the API URL being used
5. `API Service: Login request to [url]/auth/login/` - Request being sent
6. Either success or error messages

## Common Issues

### 1. No Logs Appearing
- Button might not be clickable
- Check if there are any errors in the console
- Try tapping the button multiple times

### 2. "Cannot connect to server" Error

**For Android Emulator:**
Edit `mobile/services/api.ts` line 15:
```typescript
return 'http://10.0.2.2:8000/api';
```

**For Physical Device:**
1. Find your computer's IP:
   ```bash
   # Linux/Mac
   hostname -I
   # or
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```
2. Edit `mobile/services/api.ts` line 15:
   ```typescript
   return 'http://YOUR_IP:8000/api';
   ```
   Example: `http://192.168.1.100:8000/api`

**For Web:**
Keep: `http://localhost:8000/api`

### 3. Backend Not Running

Check if backend is running:
```bash
cd backend
docker-compose ps
# Should show web and db containers as "Up"

# Test API endpoint
curl http://localhost:8000/api/
# Should return: {"detail":"Authentication credentials were not provided."}
```

### 4. CORS Issues

If you see CORS errors, check `backend/expense_api/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8081',
    'http://localhost:19000',
    'http://localhost:19006',
]
```

Add your Expo dev server URL if different.

### 5. Check Network Tab

In React Native Debugger or browser DevTools, check:
- Is the request being sent?
- What's the request URL?
- What's the response status?
- What's the error message?

## Quick Test

1. Open browser console (if using web) or React Native Debugger
2. Click "Sign In" button
3. Check console for logs
4. Check Network tab for the request
5. Verify API URL is correct for your platform
