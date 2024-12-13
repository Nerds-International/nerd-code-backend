#!/bin/bash

# Wait for MongoDB to be ready
until mongo --eval 'db.runCommand({ connectionStatus: 1 })'; do
  echo "Waiting for MongoDB to be ready..."
  sleep 1
done

# Import data
mongoimport --host localhost --port 27018 --db your_database_name --collection your_collection_name --file /data/data.json --jsonArray
