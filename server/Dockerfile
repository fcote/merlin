###
### Build container
###
FROM node:24-alpine AS tsc-builder
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
COPY --from=tsc-builder /app/dist ./
COPY --from=tsc-builder ["/app/package.json", "/app/package-lock.json", "/app/tsconfig.json", "/app/tsconfig.paths.js", "./"]

# Install production deps
RUN npm ci --omit=dev

# Run command
CMD ["node", "-r", "./tsconfig.paths.js", "./index.js"]
