#!/bin/sh
# Kill anything on port 8080, then start the server
pid=$(lsof -ti tcp:8080)
if [ -n "$pid" ]; then
  echo "Killing process $pid on port 8080"
  kill -9 $pid
fi
exec node "$(dirname "$0")/server.js"
