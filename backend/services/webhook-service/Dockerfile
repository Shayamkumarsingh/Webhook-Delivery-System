FROM node:20-alpine
WORKDIR /app
COPY backend/services/webhook-service/package*.json ./
RUN npm ci
COPY backend/services/webhook-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5002
CMD ["node", "src/app.js"]
