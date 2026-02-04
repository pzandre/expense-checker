#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate

echo "Migrations completed successfully!"
