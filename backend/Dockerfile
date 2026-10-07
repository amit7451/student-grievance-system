# ==============================================================================
# Backend Dockerfile for Student Grievance Management System
# Multi-stage production build using Node.js Alpine
# ==============================================================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies cleanly
RUN npm ci --omit=dev && npm cache clean --force

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copy production node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copy application source code
COPY . .

# Set proper ownership to built-in non-root 'node' user
RUN chown -R node:node /app

# Run as non-root user for enhanced security
USER node

# Expose backend API port
EXPOSE 5000

# Container health check using Node.js native http module
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start Express server
CMD ["node", "server.js"]
