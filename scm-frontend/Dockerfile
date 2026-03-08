# Your Dockerfile is correct - keep it as i
FROM node:20-alpine
# its worked correctly
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
