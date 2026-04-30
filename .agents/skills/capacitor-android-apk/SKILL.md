---
name: capacitor-android-apk
description: >-
  Builds installable Android APKs from a Vite/React PWA using Capacitor 6,
  Gradle assembleDebug/assembleRelease, Android SDK command-line tools, and JDK 17.
  Use when the user asks for an APK, Android app package, Capacitor Android build,
  sideload/debug APK, Play Store–ready build prep, or wiring a web app URL into a native shell.
---

# Capacitor Android APK (PWA → APK)

## Defaults

- **Stack:** Capacitor 6 + existing `npm run build` web output (`webDir: 'dist'`).
- **Shell modes:**
  - **Remote URL** — `capacitor.config.ts` → `server.url` points at production HTTPS (small APK, always loads latest web; needs network).
  - **Bundled assets** — remove `server` block after `cap sync` so `dist/` is packaged; then fix API base URL (relative `/api` will not hit your backend unless you inject `VITE_*` or same-origin).
- **Java:** **JDK 17** for Gradle/AGP. **JDK 21+ often breaks** older Gradle (e.g. “Unsupported class file major version”); install `openjdk@17` and set `JAVA_HOME` to that JDK.
- **SDK:** Set `ANDROID_HOME` to the Android SDK root (platforms + build-tools installed). Homebrew example: `/opt/homebrew/share/android-commandlinetools`. Run `sdkmanager --licenses` then install `platform-tools`, `platforms;android-34`, `build-tools;34.0.0` (or match `variables.gradle` compileSdk).

## Project setup (once)

From the **frontend** package (where Vite lives):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "<App Name>" "<reverse.domain.appid>" --web-dir=dist
```

Add `capacitor.config.ts` with `appId`, `appName`, `webDir`, and optionally:

```ts
server: { androidScheme: 'https', url: process.env.MY_PWA_URL ?? 'https://your-host.example', cleartext: false }
```

Add scripts to `package.json`:

```json
"cap:sync": "npm run build && cap sync",
"android:build": "npm run cap:sync && cd android && ./gradlew assembleDebug"
```

Then:

```bash
npm run build
npx cap add android
npx cap sync
```

## Build debug APK (sideload)

```bash
export JAVA_HOME="<path-to-jdk-17>"
export ANDROID_HOME="<path-to-android-sdk>"
cd frontend/android
./gradlew assembleDebug
```

**Output:** `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Use `assembleRelease` + signing config for Play Store (not covered here).

## Commit hygiene

- Commit `android/` source, `capacitor.config.ts`, `package.json` changes.
- Ignore (`android/.gitignore`): `build/`, `.gradle/`, `local.properties`, often `app/src/main/assets/public` and generated `capacitor.config.json` in assets — document `npm run cap:sync` after clone.
- Optional: ship a built `*-debug.apk` in `releases/`; keep binaries out of `android/app/build/`.

## Common failures

| Symptom | Fix |
|--------|-----|
| Unsupported class file major version | Use **JDK 17** for Gradle. |
| SDK not found | Set `ANDROID_HOME`; add `sdk.dir=` in `local.properties` or install cmdline-tools + platforms. |
| White screen / API | If bundled, API must use absolute backend URL; if remote `server.url`, same-origin `/api` works as on the web host. |
| Cleartext HTTP blocked | Use HTTPS or `android:usesCleartextTraffic` (avoid for production). |

## Docs

- [Capacitor workflow](https://capacitorjs.com/docs/basics/workflow)  
- [Android deploy](https://capacitorjs.com/docs/android)
