FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./package.json
RUN npm install

COPY tsconfig.json ./tsconfig.json
COPY vite.config.ts ./vite.config.ts
COPY tailwind.config.js ./tailwind.config.js
COPY postcss.config.js ./postcss.config.js
COPY index.html ./index.html
COPY src ./src

ARG VITE_API_BASE_URL
RUN test -n "$VITE_API_BASE_URL"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
