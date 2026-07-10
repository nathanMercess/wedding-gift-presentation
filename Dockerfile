FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
ARG NG_BUILD_CONFIGURATION=production
RUN yarn build --configuration ${NG_BUILD_CONFIGURATION}

FROM nginx:1.27-alpine AS runner

ENV PORT=8080
ENV API_PROXY_URL=http://localhost:8080

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist/wedding-gift-presentation/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
