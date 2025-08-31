# AI Portal Backend (Strapi CMS)

This is the backend service for the AI Portal Blog, built with Strapi CMS and PostgreSQL.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### Development Mode (Recommended)
```bash
# Start services with optimized development build
npm run dev

# Or use docker-compose directly
docker-compose up
```

### Production Mode
```bash
# Start production services
npm run prod

# Or use production docker-compose directly
docker-compose -f docker-compose.prod.yml up -d
```

## Development Commands

```bash
# Start services in development mode (with hot reload)
npm run dev

# Start services in background
npm run start

# Stop services
npm run stop

# Restart services
npm run restart

# View logs
npm run logs

# Rebuild containers (development)
npm run dev:build

# Rebuild containers (production)
npm run build:prod
```

## Docker Optimizations

The project now includes optimized Docker configurations:

- **Development**: Uses `Dockerfile.dev` with all dependencies and volume mounting for fast development
- **Production**: Uses `Dockerfile` with production-only dependencies
- **Caching**: Named volumes for `node_modules` to prevent slow rebuilds
- **Performance**: Uses `npm ci` instead of `npm install` for faster, more reliable builds

## Environment Variables

The following environment variables are configured in `docker-compose.yml`:

- `DATABASE_CLIENT`: postgres
- `DATABASE_HOST`: postgres
- `DATABASE_PORT`: 5432
- `DATABASE_NAME`: strapi
- `DATABASE_USERNAME`: strapi
- `DATABASE_PASSWORD`: strapi123
- `NODE_ENV`: development (or production for prod)

## Database

PostgreSQL database is automatically created and managed by Docker Compose. Data is persisted in a Docker volume.

## Troubleshooting

### Slow Build Issues
If you experience slow Docker builds:

1. **Clear Docker cache:**
   ```bash
   docker system prune -a
   ```

2. **Rebuild without cache:**
   ```bash
   npm run dev:build
   ```

3. **Check Docker resources:**
   - Ensure Docker has enough memory (4GB+ recommended)
   - Increase Docker CPU allocation

### Connection Issues
1. **If Strapi fails to start:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

2. **If database connection fails:**
   ```bash
   docker-compose restart postgres
   ```

3. **To reset everything:**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

## Access Points

- **Strapi Admin Panel**: http://localhost:1337/admin
- **Strapi API**: http://localhost:1337/api

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.prod.yml`
2. Set `NODE_ENV=production`
3. Use production secrets for JWT and API tokens
4. Run: `npm run prod`
