FROM node:lts as builder

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

# Select workdir
WORKDIR /app

# Copy code
COPY . /app

# Build application
RUN yarn cache clean \
    && yarn config set depth 0 \
    && yarn --no-cache-folder \
    && yarn build

# Image
FROM node:20.18.0-alpine3.20

# Select workdir
WORKDIR /usr/src/app

ARG APP_ENV
# ENV NODE_ENV=${APP_ENV:-development}

# Install tools and change permissions
RUN apk add --no-cache tini \
    && chown node:node /usr/src/app

COPY .env /usr/src/app/

# Add artifacts from builder image
COPY --chown=node:node --from=builder /app/dist/src /usr/src/app/src
COPY --chown=node:node --from=builder /app/node_modules /usr/src/app/node_modules

# alias module resolution needs package.json
COPY --chown=node:node --from=builder /app/package.json /usr/src/app/package.json

# Change to no-root user
USER node
RUN mkdir -p /usr/src/app/logs \
    && ln -sf /dev/stdout /usr/src/app/logs/server.log

# Init Manager for node process
ENTRYPOINT ["/sbin/tini", "--"]

# Run application
CMD ["yarn", "start:prod"]

# Application port
EXPOSE 8080
