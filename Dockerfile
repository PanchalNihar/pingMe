# Stage 1: Build the Angular app
FROM node:20 as build

WORKDIR /app
COPY . .

RUN npm install
RUN npx ng build pingMe --configuration=production

# Stage 2: Serve the app with nginx
FROM nginx:alpine

# Clean out default nginx html dir
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build output
COPY --from=build /app/dist/ping-me/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
