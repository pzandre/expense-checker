#!/bin/bash
uv pip install -r requirements.txt
python manage.py migrate
