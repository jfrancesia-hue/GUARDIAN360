FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json ./
RUN composer install --no-interaction --prefer-dist --no-scripts || true

FROM php:8.3-cli-alpine
WORKDIR /var/www/html
RUN apk add --no-cache postgresql-dev \
  && docker-php-ext-install pdo pdo_pgsql
COPY --from=vendor /app/vendor ./vendor
COPY . .
EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
