# Frontend Dockerfile — v3 (fixed env var baking: 2026-03-24)
FROM node:18-alpine AS builder

WORKDIR /app

# Declare build argument FIRST — before anything else
ARG NEXT_PUBLIC_API_URL=https://career-setu-backend.onrender.com/api
# Bake it into the environment for the build step
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Log the URL being baked in (for debugging build issues)
RUN echo ">>> Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

# Build the application (NEXT_PUBLIC_API_URL is now baked in)
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Also set the env var at runtime (Next.js uses it for server-side rendering)
ENV NEXT_PUBLIC_API_URL=https://career-setu-backend.onrender.com/api

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]

