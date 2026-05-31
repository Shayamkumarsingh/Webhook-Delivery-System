FROM node:20-alpine
WORKDIR /app
COPY backend/services/notification-service/package*.json ./
RUN npm ci
COPY backend/services/notification-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5007
CMD ["node", "src/app.js"]
