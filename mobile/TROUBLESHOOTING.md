# Troubleshooting Guide

## Expo CLI Network Errors

### Problem: "TypeError: fetch failed" when starting Expo

**Cause:** Expo CLI is trying to validate dependencies online but can't connect to Expo's API.

**Solutions:**

1. **Use Offline Mode (Recommended):**
   ```bash
   npm start
   # or
   npx expo start --offline
   ```
   The scripts in `package.json` are already configured to use `--offline` by default.

2. **Check Network Connection:**
   - Ensure you have internet connectivity
   - Check if firewall/proxy is blocking Expo API
   - Try: `curl https://exp.host`

3. **Skip Dependency Validation:**
   ```bash
   EXPO_NO_DOTENV=1 npx expo start --offline
   ```

4. **Clear Expo Cache:**
   ```bash
   npx expo start --clear --offline
   ```

## Other Common Issues

### Metro Bundler Port Already in Use

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082 --offline
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear --offline
```

### TypeScript Errors

```bash
# Check TypeScript
npx tsc --noEmit

# Clear TypeScript cache
rm -rf .expo
npx expo start --clear --offline
```

### Android Build Issues

1. Ensure Android Studio is installed
2. Set ANDROID_HOME environment variable
3. Accept Android licenses:
   ```bash
   $ANDROID_HOME/tools/bin/sdkmanager --licenses
   ```

### API Connection Issues

- **Android Emulator:** Use `http://10.0.2.2:8000/api` in `services/api.ts`
- **Physical Device:** Use your computer's local IP
- **Web:** Use `http://localhost:8000/api`

Check backend is running:
```bash
curl http://localhost:8000/api/
```
