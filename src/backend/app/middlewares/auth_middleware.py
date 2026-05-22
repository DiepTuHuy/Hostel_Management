import os
from functools import wraps
from flask import request, jsonify
import jwt
from app.models.user import User
from app.models.utils import serialize_doc

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({'message': 'Mã token xác thực là bắt buộc!'}), 401
            
        try:
            secret = os.getenv("JWT_SECRET", "supersecretkey")
            # Compatibility fallback: if token is generated as "mock.<id>.<ts>" or "jwt.<id>.<ts>"
            if token.startswith("jwt.") or token.startswith("mock."):
                parts = token.split('.')
                if len(parts) >= 2:
                    user_id = parts[1]
                else:
                    return jsonify({'message': 'Mã token không hợp lệ!'}), 401
            else:
                # Standard JWT decoding
                data = jwt.decode(token, secret, algorithms=["HS256"])
                user_id = data.get('sub')
                
            current_user = User.find_by_id(user_id)
            if not current_user:
                return jsonify({'message': 'Tài khoản không hợp lệ!'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Mã token đã hết hạn!'}), 401
        except Exception:
            return jsonify({'message': 'Mã token không hợp lệ!'}), 401
            
        # Pass the serialized current user doc to the controller function
        return f(serialize_doc(current_user), *args, **kwargs)
        
    return decorated
