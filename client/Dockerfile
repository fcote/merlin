###
### Build container
###
FROM node:20-alpine3.17 as builder
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
COPY --from=builder /app/build ./
COPY --from=builder /app/run.sh ./

# Run command
CMD chmod +x ./run.sh && sh -c ./run.sh
