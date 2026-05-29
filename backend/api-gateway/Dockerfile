FROM node:20-alpine
WORKDIR /app
COPY backend/api-gateway/package*.json ./
RUN npm ci
COPY backend/api-gateway/ .
RUN rm -f .env
COPY backend/shared/ /shared/
EXPOSE 5000
CMD ["node", "src/app.js"]
