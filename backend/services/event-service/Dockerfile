FROM node:20-alpine
WORKDIR /app
COPY backend/services/event-service/package*.json ./
RUN npm ci
COPY backend/services/event-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5003
CMD ["node", "src/app.js"]
