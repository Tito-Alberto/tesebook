Use the project logo `tesebook.png` in the `assets` folder as the app splash.

Recommended steps:

1. Confirm the file `assets/tesebook.png` exists (the project currently includes this file).
2. `app.json` has been configured to use `./assets/tesebook.png` for the native splash.
3. Start the app with Expo:

```bash
npm install
npx expo start
```

Behavior details:
- The native splash uses `assets/tesebook.png` as configured in `app.json`.
- The app also shows a small animated JS splash (`src/screens/SplashScreen.tsx`) that uses the same image while the JS bundle loads.

If you want to replace the splash image later, save the new file as `assets/tesebook.png`.

Layout tips:
- If the logo size/position needs adjustment, edit `src/screens/SplashScreen.tsx` (logo sizing uses a responsive width). 
- To change the native splash background color or resizeMode, edit the `splash` section in `app.json`.

If you want, I can also export a separate `splash.png` with exact pixel dimensions for Android/iOS, or fine-tune the JS splash animation.
