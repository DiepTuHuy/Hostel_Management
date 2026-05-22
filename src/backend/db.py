import os
import sys
import re
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_client = None
db = None
is_mocked_db = False

def connect_db():
    global mongo_client, db, is_mocked_db
    try:
        conn_str = os.getenv("MONGODB_URI")
        if not conn_str:
            print("Error: MONGODB_URI is not defined in environment variables. Please check your .env file.")
            sys.exit(1)
            
        # Mask password in logs
        masked_uri = re.sub(r':([^@]+)@', ':****@', conn_str)
        print(f"Connecting to MongoDB at: {masked_uri}")
        
        # Set shorter timeout (2 seconds) so fallback triggers quickly
        mongo_client = MongoClient(conn_str, serverSelectionTimeoutMS=2000)
        # Verify connection
        mongo_client.admin.command('ping')
        
        # Determine database name from connection string
        db_name = "boardinghouse_db"
        # Parse URI to find DB name
        parsed_uri = conn_str.split('/')[-1]
        if '?' in parsed_uri:
            extracted = parsed_uri.split('?')[0]
        else:
            extracted = parsed_uri
            
        if extracted:
            db_name = extracted
            
        db = mongo_client[db_name]
        is_mocked_db = False
        print(f"MongoDB connected successfully to database: {db_name}!")
        return db
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        print("Falling back to in-memory mongomock database for demo purpose...")
        try:
            import mongomock
            mongo_client = mongomock.MongoClient()
            db = mongo_client["boardinghouse_db"]
            is_mocked_db = True
            print("In-memory mongomock database initialized successfully!")
            return db
        except Exception as mock_err:
            print(f"Failed to initialize mongomock: {mock_err}")
            raise e

def get_db():
    global db
    if db is None:
        return connect_db()
    return db

