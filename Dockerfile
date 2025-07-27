# Stage 1: Install deps & build the Next.js app
FROM registry.digitalocean.com/pts-registry/node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only the package files for dependency install
COPY package.json package-lock.json* ./
RUN npm ci

# Set build-time environment variables
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_JIRA_CLIENT_ID
ARG NEXT_PUBLIC_JIRA_REDIRECT_URI

ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_JIRA_CLIENT_ID=$NEXT_PUBLIC_JIRA_CLIENT_ID
ENV NEXT_PUBLIC_JIRA_REDIRECT_URI=$NEXT_PUBLIC_JIRA_REDIRECT_URI

# Copy the full app
COPY . .

# Optional: prevent Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build for production with standalone output
RUN npm run build

# Stage 2: Run the app with standalone output
FROM registry.digitalocean.com/pts-registry/node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the standalone server
CMD ["node", "server.js"]
