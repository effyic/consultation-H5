FROM node:18-alpine as build-stage

WORKDIR /app
RUN npm install -g corepack
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
