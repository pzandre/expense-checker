#!/bin/bash
echo "BUILD START"
echo "$POSTGRES_SSLROOTCERT" | base64 --decode > cert.crt
echo "BUILD END"