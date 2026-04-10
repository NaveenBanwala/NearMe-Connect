# Create the database
psql -U postgres -c "CREATE DATABASE nearme;"

# Run schema
psql -U postgres -d nearme -f schema.sql

# Load test data
psql -U postgres -d nearme -f seed.sql