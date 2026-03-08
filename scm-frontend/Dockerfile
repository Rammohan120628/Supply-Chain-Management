FROM node:18-alpine AS build
WORKDIR /app
 
COPY package.json package-lock.json ./
 
# FIX: ignore peer dependency conflict
RUN npm install --legacy-peer-deps
 
COPY . .
RUN npm run build
 
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 
docker file
