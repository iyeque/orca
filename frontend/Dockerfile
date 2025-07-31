# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app /app
# Remove node_modules from the copied /app to use the one from the deps stage
RUN rm -rf node_modules
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"] 