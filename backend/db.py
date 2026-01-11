import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("host"),
        port=int(os.getenv("port")),
        database=os.getenv("database"),
        user=os.getenv("user"),
        password=os.getenv("password")
    )
