FROM node:20-alpine
WORKDIR /app
COPY backend/services/logs-service/package*.json ./
RUN npm ci
COPY backend/services/logs-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5008
CMD ["node", "src/app.js"]
