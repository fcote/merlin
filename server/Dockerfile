###
### Build container
###
FROM node:15.14-alpine3.10 as tsc-builder
WORKDIR /app

# Install deps and build.
COPY . .
RUN npm i && npm run build

###
### Production image container
###
FROM node:15.14-alpine3.10 as runtime-container
WORKDIR /app

# Copy compiled sources
COPY --from=tsc-builder /app/dist ./
COPY --from=tsc-builder ["/app/package.json", "/app/package-lock.json", "/app/tsconfig.json", "/app/tsconfig.paths.js", "./"]

# Install production deps
RUN npm install --prod

# Run command
CMD [ "npm", "start" ]
