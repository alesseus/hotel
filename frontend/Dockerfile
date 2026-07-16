FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_OPTIONS=--max_old_space_size=2048
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/hotel/browser /usr/share/nginx/html
EXPOSE 80