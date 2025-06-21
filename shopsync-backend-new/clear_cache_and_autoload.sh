#!/bin/bash

cd /var/www/html # Assuming this is the Laravel root on Render

php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

composer dump-autoload

echo "Laravel caches cleared and autoloader dumped."

