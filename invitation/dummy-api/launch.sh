#!/bin/sh

# script for launching a dummy http server, to serve a rest api similar to the one expected by the app.
# usefull for development and testing when the real db is not accesible

# requires the nodejs package: json-server

if [ -n "$1" ]; then
    port=$1
else
    port=3000
fi

json-server dummy.json --id ID --port $port
