FROM node:20-alpine
WORKDIR /app
COPY backend/services/dlq-service/package*.json ./
RUN npm ci
COPY backend/services/dlq-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5006
CMD ["node", "src/app.js"]
