FROM node:20-alpine
WORKDIR /app
COPY backend/services/delivery-service/package*.json ./
RUN npm ci
COPY backend/services/delivery-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5004
CMD ["node", "src/app.js"]
