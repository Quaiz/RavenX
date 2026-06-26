FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# We don't set VITE_BACKEND_URL here, we will let Nginx proxy /api to the backend
# Actually, if the frontend currently uses VITE_BACKEND_URL to make requests,
# we need to build it with VITE_BACKEND_URL=/api so that it sends requests to itself,
# and then Nginx intercepts /api and forwards it to the backend container.
ENV VITE_BACKEND_URL=/api
RUN npm run build

FROM nginx:alpine
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# We will mount a custom nginx.conf later via docker-compose
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
