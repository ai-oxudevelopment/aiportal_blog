# API Contracts: Fix Nuxt Docker Build Error

**Feature**: 005-fix-nuxt-build
**Date**: 2026-01-09

## Overview

This feature is a **build infrastructure fix** and does not introduce new API endpoints or modify existing API contracts.

## API Contracts

### No Changes

This feature does not affect:
- REST API endpoints (`server/api/*`)
- GraphQL schemas (if applicable)
- Server route signatures
- Request/response formats
- Authentication flows
- Error response structures

## Docker Build Interface

### Build Arguments

The Dockerfile accepts these build-time arguments:

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `STRAPI_URL` | string | Yes | (none) | Strapi CMS backend URL |
| `NUXT_PUBLIC_YANDEX_METRIKA_ID` | string | No | (none) | Yandex Metrika analytics ID |
| `PORT` | integer | No | `8080` | Application port |

### Environment Variables

The following environment variables are set in the production container:

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NODE_ENV` | Production | Set to `production` |
| `STRAPI_URL` | Runtime | Strapi CMS URL |
| `PORT` | Runtime | Server listening port |

### Docker Build Process

**Input**:
- Source code from `frontend/` directory
- Dependencies from `package.json` + `yarn.lock`
- Build arguments (STRAPI_URL, etc.)

**Output**:
- Docker image containing compiled application
- Self-contained `.output` directory
- Production-ready server bundle

**Contract**: The Docker build **MUST** complete without errors and produce a runnable container.

## HTTP API (Unchanged)

Existing API endpoints remain functional after this fix:

- `GET /api/articles` - Fetch articles from Strapi
- `GET /api/speckits` - Fetch speckits from Strapi
- Other routes defined in `frontend/server/api/*`

## Summary

**API Contract Impact**: ✅ **NONE**

This feature exclusively addresses Docker build infrastructure and does not modify API contracts.
