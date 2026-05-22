from bson import ObjectId
from datetime import datetime

def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    
    doc = dict(doc)
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
        
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        elif isinstance(v, datetime):
            doc[k] = v.isoformat()
        elif isinstance(v, list):
            new_list = []
            for item in v:
                if isinstance(item, ObjectId):
                    new_list.append(str(item))
                elif isinstance(item, dict):
                    new_list.append(serialize_doc(item))
                else:
                    new_list.append(item)
            doc[k] = new_list
        elif isinstance(v, dict):
            doc[k] = serialize_doc(v)
            
    return doc

def try_object_id(val):
    if not val:
        return val
    from bson import ObjectId
    try:
        if isinstance(val, ObjectId):
            return val
        if len(str(val)) == 24:
            return ObjectId(val)
    except Exception:
        pass
    return val

def resolve_property_id(property_id):
    if not property_id:
        return None
        
    from bson import ObjectId
    from db import get_db
    
    # 1. Try converting to ObjectId
    try:
        if isinstance(property_id, ObjectId):
            return property_id
        if len(str(property_id)) == 24:
            return ObjectId(property_id)
    except Exception:
        pass
        
    # 2. Lookup property database
    db = get_db()
    try:
        # Check if the property_id matches an id or _id in property collection first
        doc = db["properties"].find_one({"_id": property_id})
        if doc:
            return doc["_id"]
        doc = db["properties"].find_one({"id": property_id})
        if doc:
            return doc["_id"]
            
        # Try to find primary property NT-Q1-01
        primary = db["properties"].find_one({"code": "NT-Q1-01"})
        if primary:
            return primary["_id"]
            
        # Fallback to the first property in the collection
        first = db["properties"].find_one({})
        if first:
            return first["_id"]
    except Exception:
        pass
        
    return property_id

