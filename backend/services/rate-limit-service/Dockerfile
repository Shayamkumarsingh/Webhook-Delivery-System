FROM node:20-alpine
WORKDIR /app
COPY backend/services/rate-limit-service/package*.json ./
RUN npm ci
COPY backend/services/rate-limit-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5009
CMD ["node", "src/app.js"]
