###
### Build container
###
FROM node:24-alpine AS builder
WORKDIR /app

# Install deps and build.
COPY . .
RUN npm ci && npm run build

###
### Production image container
###
FROM node:24-alpine AS runtime-container
WORKDIR /app

# Copy compiled sources
COPY --from=builder /app/build ./
COPY --from=builder /app/run.sh ./

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Run command
CMD ["sh", "./run.sh"]
