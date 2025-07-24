# Stage 1: Install deps & build the Next.js app
FROM registry.digitalocean.com/pts-registry/node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only the package files for dependency install
COPY package.json package-lock.json* ./
RUN npm ci

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

# Copy the full app (Next.js expects /src/app/ layout to remain intact)
COPY . .

# Optional: prevent Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build for production (Next.js looks inside src/)
RUN npm run build

# Stage 2: Run the app with only what’s needed
FROM registry.digitalocean.com/pts-registry/node:22-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy only required output + runtime deps
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Port the app listens on
EXPOSE 3000

# Start app in production mode
CMD ["npm", "start"]
