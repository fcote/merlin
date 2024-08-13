##
## Build
##
FROM golang:1.23-alpine AS build

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o /merlin-scheduler

##
## Deploy
##
FROM gcr.io/distroless/base

WORKDIR /

COPY --from=build /merlin-scheduler /merlin-scheduler

ENTRYPOINT ["/merlin-scheduler"]