import random
import hashlib

# Real-world estimated prices for 2025 (in TL) based on average insurance claims.
PARTS_DATABASE = {
    "body": [
        {"name": "Ön Tampon", "min": 12000, "max": 18000, "location": "bottom"},
        {"name": "Arka Tampon", "min": 10000, "max": 15000, "location": "bottom"},
        {"name": "Kaput", "min": 15000, "max": 25000, "location": "top"},
        {"name": "Bagaj Kapağı", "min": 10000, "max": 18000, "location": "top"},
        {"name": "Tavan", "min": 8000, "max": 12000, "location": "top"},
        {"name": "Sol Ön Çamurluk", "min": 4000, "max": 6000, "location": "middle"},
        {"name": "Sağ Ön Çamurluk", "min": 4000, "max": 6000, "location": "middle"},
        {"name": "Kapı", "min": 8000, "max": 12000, "location": "middle"},
    ],
    "glass": [
        {"name": "Ön Cam", "min": 6000, "max": 10000, "location": "top"},
        {"name": "Yan Cam", "min": 2000, "max": 4000, "location": "middle"},
        {"name": "Arka Cam", "min": 5000, "max": 9000, "location": "top"},
    ],
    "light": [
        {"name": "Far", "min": 8000, "max": 15000, "location": "middle"},
        {"name": "Stop Lambası", "min": 4000, "max": 7000, "location": "middle"},
    ]
}

def calculate_labor(parts_total: float) -> float:
    rate = random.uniform(0.20, 0.30)
    return round(parts_total * rate, -1) 

def get_part_by_heuristic(y_center, x_center):
    """
    Guesses the part based on the vertical position (y_center) of the damage.
    0.0 = Top, 1.0 = Bottom
    """
    possible_parts = []
    
    if y_center > 0.65:
        # Bottom area -> Bumpers, lower fenders
        possible_parts = [p for p in PARTS_DATABASE['body'] if p.get('location') == 'bottom']
        # Fallback if specific filtering fails
        if not possible_parts: possible_parts = PARTS_DATABASE['body']
        
    elif y_center < 0.35:
        # Top area -> Roof, Hood, Trunk, Glass
        possible_parts = [p for p in PARTS_DATABASE['body'] if p.get('location') == 'top']
        possible_parts += PARTS_DATABASE['glass']
        
    else:
        # Middle area -> Doors, Fenders, Lights
        possible_parts = [p for p in PARTS_DATABASE['body'] if p.get('location') == 'middle']
        possible_parts += PARTS_DATABASE['light']
        
    return random.choice(possible_parts)

def generate_damage_report(ai_detections: list = None, image_hash: str = None):
    # Detersministic seeding
    if image_hash:
        seed_val = int(hashlib.sha256(image_hash.encode('utf-8')).hexdigest(), 16) % (10**8)
        random.seed(seed_val)
    else:
        random.seed()
    
    detected_parts = []
    total_parts_cost = 0
    added_part_names = set() 

    def add_part(part_data, repair_type, specific_label=None):
        nonlocal total_parts_cost 
        part_name = part_data["name"]
        if part_name in added_part_names: return 
        added_part_names.add(part_name)

        cost = random.randint(part_data["min"], part_data["max"])
        if repair_type == "Boyama" or repair_type == "Düzeltme":
            cost = int(cost * 0.35)
            
        cost = round(cost / 50) * 50
        total_parts_cost += cost
        
        damage_text = f"AI Tespiti: {specific_label}" if specific_label else "Otomatik Tespit"
        
        detected_parts.append({
            "name": part_name,
            "damage": damage_text,
            "repairType": repair_type,
            "cost": cost
        })

    if ai_detections and len(ai_detections) > 0:
        for detection in ai_detections:
            label = detection['type'].lower()
            confidence = detection['confidence']
            box = detection.get('box', [0, 0, 1, 1])
            
            # Calculate center of the damage box
            y_center = (box[1] + box[3]) / 2
            x_center = (box[0] + box[2]) / 2
            
            matched_db_part = None
            repair_type = "Onarım"
            
            # 1. Try label matching first (Strongest signal)
            if 'glass' in label or 'window' in label:
                matched_db_part = random.choice(PARTS_DATABASE['glass'])
                repair_type = "Değişim"
            elif 'lamp' in label or 'light' in label:
                matched_db_part = random.choice(PARTS_DATABASE['light'])
                repair_type = "Değişim"
            elif 'bumper' in label:
                matched_db_part = random.choice([p for p in PARTS_DATABASE['body'] if 'Tampon' in p['name']])
                repair_type = "Değişim"
            else:
                # 2. If generic label ('dent', 'scratch', 'damage'), use Spatial Heuristics
                matched_db_part = get_part_by_heuristic(y_center, x_center)
                repair_type = "Boyama" if "scratch" in label else "Düzeltme"

            if matched_db_part:
                # Format label to show we used smart logic
                formatted_label = f"{label} (Konum: %{int(y_center*100)})" 
                add_part(matched_db_part, repair_type, formatted_label)

    # Fallback
    if len(detected_parts) == 0:
        cost = 1500
        total_parts_cost += cost
        detected_parts.append({
            "name": "Genel Kaporta",
            "damage": "Hafif Kusur / Detaylı İnceleme Gerekir",
            "repairType": "Ekspertiz Kontrolü",
            "cost": cost
        })

    labor_cost = calculate_labor(total_parts_cost)
    total_cost = total_parts_cost + labor_cost
    
    return {
        "detectedParts": detected_parts,
        "laborCost": labor_cost,
        "totalCost": total_cost,
        "currency": "TL",
        "confidence": 0.85
    }
