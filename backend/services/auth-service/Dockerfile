FROM node:20-alpine
WORKDIR /app
COPY backend/services/auth-service/package*.json ./
RUN npm ci
COPY backend/services/auth-service/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5001
CMD ["node", "src/app.js"]
