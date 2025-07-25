#FROM node:22 as build-stage
#WORKDIR /app
#COPY package*.json ./
#RUN pnpm install --registry=https://registry.npmmirror.com
#COPY ./ .
#RUN pnpm build

FROM nginx:stable-alpine as production-stage

#COPY --from=build-stage /app/dist /app
COPY ./dist /app
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
