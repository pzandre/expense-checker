echo "BUILD START"
python3.13 -m pip install -r requirements.txt
python manage.py migrate
# echo "$POSTGRES_SSLROOTCERT" | base64 --decode > cert.crt
echo "BUILD END"
