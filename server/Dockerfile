###
### Build container
###
FROM node:20-alpine3.17 as tsc-builder
WORKDIR /app

# Install deps and build.
COPY . .
RUN npm i && npm run build

###
### Production image container
###
FROM node:20-alpine3.17 as runtime-container
WORKDIR /app

# Copy compiled sources
COPY --from=tsc-builder /app/dist ./
COPY --from=tsc-builder ["/app/package.json", "/app/package-lock.json", "/app/tsconfig.json", "/app/tsconfig.paths.js", "./"]

# Install production deps
RUN npm install --prod

# Run command
CMD [ "npm", "start" ]
