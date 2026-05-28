from flask import request, jsonify
from app.models.room import Room
from app.models.utils import map_room

class RoomController:
    @staticmethod
    def list_rooms():
        try:
            property_id = request.args.get("propertyId")
            status = request.args.get("status")
            
            rooms = Room.find_all(property_id=property_id, status=status)
            return jsonify([map_room(r) for r in rooms if r]), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def get_by_id(room_id):
        try:
            room = Room.find_by_id(room_id)
            if not room:
                return jsonify({"message": "Phòng không tồn tại."}), 404
            return jsonify(map_room(room)), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def search_rooms():
        try:
            keyword = request.args.get("keyword", "")
            
            price_min = request.args.get("priceMin")
            if price_min is not None and price_min != "":
                price_min = float(price_min)
            else:
                price_min = None
                
            price_max = request.args.get("priceMax")
            if price_max is not None and price_max != "":
                price_max = float(price_max)
            else:
                price_max = None
                
            # Parse amenities if passed multiple times or as comma separated string
            amenities = request.args.getlist("amenities")
            if len(amenities) == 1 and "," in amenities[0]:
                amenities = amenities[0].split(",")
            amenities = [a.strip() for a in amenities if a.strip()]
            
            district = request.args.get("district")
            
            rooms = Room.search(
                keyword=keyword,
                price_min=price_min,
                price_max=price_max,
                amenities=amenities,
                district=district
            )
            return jsonify([map_room(r) for r in rooms if r]), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
