FROM node:20-alpine

ARG SERVICE_DIR

ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_MAXSOCKETS=1
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

WORKDIR /app

COPY ${SERVICE_DIR}/package*.json ./
RUN npm install -g npm@10.9.2 \
  && npm ci --omit=dev \
  && node -e "require('express')" \
  && npm cache clean --force

COPY ${SERVICE_DIR}/ ./

ENV NODE_ENV=production

CMD ["npm", "start"]
