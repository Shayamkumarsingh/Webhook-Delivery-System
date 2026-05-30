FROM node:20-alpine
WORKDIR /app
COPY backend/services/retry-service/package*.json ./
RUN npm ci
COPY backend/services/retry-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5005
CMD ["node", "src/app.js"]
