# CLAUDE.md

> **⚠️ 重要：用中文和我对话**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GEWU GO** (格物GO) - A WeChat Mini Program for museum and exhibition discovery. Users can explore museums, view exhibitions, discover artifacts, listen to narrations, and engage with cultural content.

**Tech Stack:**
- WeChat Mini Program with glass-easel component framework
- TypeScript (strict mode)
- LESS for styling
- WeChat Cloud Development backend

## Development

**No npm scripts configured** - all development uses WeChat DevTools (微信开发者工具):
- Open project in WeChat DevTools with AppID: `wx9627ee955b8e913e`
- TypeScript and LESS compile automatically via DevTools
- Hot reload enabled in development

**Cloud Environment:** `cloud1-7grz6n8i7da33fb5`

## Architecture

```
miniprogram/
├── api/api.ts           # Centralized API endpoints
├── app.ts               # App lifecycle & globalData (auth, audio, system info)
├── pages/               # 41 pages + 2 subpackages (personal/, museum/)
├── components/          # 50+ reusable components
├── custom-tab-bar/      # Bottom navigation (4 tabs)
└── utils/
    ├── util.ts          # HTTP requests (with AES encryption), storage, location
    ├── tracker.ts       # Analytics batch collection
    └── proxy.ts         # Global Page/Component lifecycle interception
```

## Key Patterns

**Global State** (`app.ts`): Uses `globalData` for auth token, audio player state, user info, device info, and feature flags.

**Event Tracking** (`proxy.ts` + `tracker.ts`): Automatic analytics via global interception of Page/Component lifecycles. Events batched and sent to `/api/report/log/batch`. No manual instrumentation needed on individual pages.

**API Layer** (`api/api.ts`): All endpoints centralized here. Uses `base_api` for environment switching (test-api/production).

**Component Structure**: Each component has 4 files: `.ts`, `.wxml`, `.less`, `.json`

**Subpackages**: `personal/` and `museum/` are lazy-loaded subpackages for code splitting.

## Important Files

| File | Purpose |
|------|---------|
| `miniprogram/app.ts` | App entry, global state, lifecycle |
| `miniprogram/api/api.ts` | All API endpoint definitions |
| `miniprogram/utils/util.ts` | HTTP requests, storage, location utilities |
| `miniprogram/utils/proxy.ts` | Global event tracking injection |
| `project.config.json` | Build configuration |

## Conventions

- Page navigation: `wx.navigateTo()` with URL query parameters
- Storage: `wx.setStorageSync()`/`wx.getStorageSync()` for persistent data
- TypeScript strict mode enforced (noImplicitAny, strictNullChecks)
- WeChat globals available: `wx`, `App`, `Page`, `Component`, `getApp()`, `getCurrentPages()`
