---
name: capacitor-android-apk
description: >-
  Builds Android APKs from any JavaScript web app or PWA packaged with Capacitor
  (React, Vue, Angular, Svelte, Vite, webpack, Next static export, etc.) using
  Gradle, Android SDK command-line tools, and JDK 17. Use when the user wants an
  APK, Android package, Capacitor Android wrapper, sideload/debug build, or to
  point a native shell at a live HTTPS site vs bundled dist assets.
---

# Capacitor Android APK (any web app → APK)

Applies to **any** project that can produce a **folder of built static assets** (typically `dist/` or `build/`). Capacitor wraps that folder in a native WebView; adjust `webDir` to match your bundler output.

## Defaults

- **Capacitor:** 6.x (or current major; align CLI, core, android package versions).
- **webDir:** Usually `dist` (Vite), `build` (CRA), or whatever your `npm run build` emits — set in `capacitor.config.*` and `cap init --web-dir`.
- **Shell modes:**
  - **Remote URL** — `server.url` = production HTTPS (small APK, always current web UI; requires network).
  - **Bundled assets** — no `server` block (or remove it); `cap sync` copies `webDir` into the app. **Backend:** relative API paths only work if the WebView origin matches your API; otherwise set an absolute API base at build time (env var) or use the remote-URL mode so the hosted site and `/api` stay same-origin.
- **Java:** **JDK 17** for typical Gradle/AGP versions. Newer JDKs often cause **Unsupported class file major version** until Gradle is upgraded — use JDK 17 unless the project explicitly requires otherwise.
- **SDK:** `ANDROID_HOME` = SDK root. Install cmdline-tools, accept licenses (`sdkmanager --licenses`), then `platform-tools`, a **platforms;android-NN** and **build-tools** matching the Capacitor template’s `compileSdk` (often 34).

## One-time setup

From the directory that contains **`package.json`** and your web build script:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "<App Name>" "<reverse.domain.appid>" --web-dir=dist   # or build, out, etc.
```

Configure `capacitor.config.ts` (or `.json`) with `appId`, `appName`, `webDir`, and optional:

```ts
server: { androidScheme: 'https', url: process.env.MY_PUBLIC_WEB_URL ?? 'https://your-host.example', cleartext: false }
```

Useful `package.json` scripts:

```json
"cap:sync": "npm run build && cap sync",
"android:build": "npm run cap:sync && cd android && ./gradlew assembleDebug"
```

```bash
npm run build
npx cap add android
npx cap sync
```

The generated **`android/`** folder lives next to that `package.json` (or path you chose).

## Debug APK (sideload)

```bash
export JAVA_HOME="<jdk-17-path>"
export ANDROID_HOME="<android-sdk-path>"
cd android
./gradlew assembleDebug
```

**Artifact:** `android/app/build/outputs/apk/debug/app-debug.apk` (path relative to the `android/` project root).

**Release / Play:** `assembleRelease` + app signing (keystore / Play App Signing) — not described here.

## Repo hygiene

- Commit `android/` sources, Capacitor config, and dependency changes; ignore `android/**/build`, `.gradle`, `local.properties`, and (if your team prefers) generated `app/src/main/assets/public` — then document **`npm run cap:sync`** after clone.
- Optional `releases/*.apk` for distributing debug builds; do not commit huge `build/` trees.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Unsupported class file major version | Build with **JDK 17** or upgrade Gradle/AGP per Capacitor release notes. |
| SDK / platform not found | `ANDROID_HOME`, `sdkmanager` packages, `sdk.dir` in `local.properties`. |
| Blank WebView, wrong API | Bundled build: absolute API URL or proxy; remote `server.url`: behaves like the browser on that host. |
| HTTP blocked | Prefer HTTPS; cleartext only for dev. |

## References

- [Capacitor workflow](https://capacitorjs.com/docs/basics/workflow)  
- [Android deploy](https://capacitorjs.com/docs/android)
