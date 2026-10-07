# ==============================================================================
# Frontend Dockerfile for Student Grievance Management System
# Multi-stage build: Vite build -> Nginx Alpine production server
# ==============================================================================

# --- Stage 1: Build the React Application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (including devDependencies required for Vite build)
RUN npm ci

# Copy frontend source code
COPY . .

# Optional build-time argument for API URL (defaults to empty string for relative /api or existing fallback)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle
RUN npm run build

# --- Stage 2: Serve with Nginx Alpine ---
FROM nginx:1.27-alpine AS runner

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
