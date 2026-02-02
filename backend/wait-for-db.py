#!/usr/bin/env python
import os
import sys
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_db(max_attempts=30):
    db_config = {
        'host': os.getenv('DB_HOST', 'db'),
        'port': os.getenv('DB_PORT', '5432'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres'),
        'database': os.getenv('DB_NAME', 'expense_checker'),
    }
    
    print(f"Waiting for PostgreSQL at {db_config['host']}...", file=sys.stderr)
    
    for attempt in range(1, max_attempts + 1):
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            print("PostgreSQL is up!", file=sys.stderr)
            return True
        except OperationalError as e:
            print(f"PostgreSQL is unavailable (attempt {attempt}/{max_attempts}) - sleeping", file=sys.stderr)
            time.sleep(1)
    
    print(f"Failed to connect to PostgreSQL after {max_attempts} attempts", file=sys.stderr)
    return False

if __name__ == '__main__':
    if not wait_for_db():
        sys.exit(1)
