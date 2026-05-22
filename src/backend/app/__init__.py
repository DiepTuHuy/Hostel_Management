from flask import Flask
from flask_cors import CORS
import db as db_module
from seed import seed_db_instance
from app.routes import (
    auth_bp,
    property_bp,
    room_bp,
    contract_bp,
    invoice_bp,
    notification_bp,
    user_bp
)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for cross-origin frontend requests
    CORS(app)
    
    # Connect to MongoDB Atlas/local
    db_conn = db_module.connect_db()
    if db_module.is_mocked_db:
        print("Auto-seeding in-memory mongomock database...")
        seed_db_instance(db_conn)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(property_bp, url_prefix='/api/properties')
    app.register_blueprint(room_bp, url_prefix='/api/rooms')
    app.register_blueprint(contract_bp, url_prefix='/api/contracts')
    app.register_blueprint(invoice_bp, url_prefix='/api/invoices')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    
    @app.route('/')
    def index():
        return {"status": "ok", "message": "Hostel Chain Management System API is running."}
        
    return app
