FROM node:20-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy mã nguồn
COPY . .

# Build Vite frontend
RUN npm run build

# Thiết lập môi trường
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
