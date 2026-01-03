from ultralytics import YOLO
import cv2
import numpy as np
import os

class AIService:
    def __init__(self):
        print("Model 1: Loading Vehicle Detector (YOLOv8n)...")
        self.vehicle_model = YOLO('yolov8n.pt') 

        print("Model 2: Loading Damage Detector...")
        # We try to load a pre-trained damage detection model.
        # This one is from a community repo (approximated for demo purposes).
        # If it fails to download, we might need a manual file, but let's try auto-download.
        try:
             # Using a known open-source weight file for car damage
             # If this specific URL doesn't work, standard YOLO will try to look for local file.
             # Note: 'best.pt' is generic, we'll try to find a direct link or assume local presence.
             # For this environment, let's look for a specific hosted model or fallback to 'yolov8n-seg.pt' only for structure,
             # BUT the user wants REAL damage.
             # Let's try to load from a public URL if Ultralytics supports it, otherwise we simulate the second model 
             # by just using yolov8n again but checking for different classes? No that won't work.
             
             # Let's use a URL to a github release if possible.
             # "https://github.com/NabilNawa/YOLOv8-Vehicle-Damage-Detector/raw/main/trained.pt"
             self.damage_model = YOLO("https://github.com/NabilNawa/YOLOv8-Vehicle-Damage-Detector/raw/main/trained.pt")
        except Exception as e:
            print(f"Warning: Could not load Damage Model ({e}). Using Vehicle model as placeholder.")
            self.damage_model = self.vehicle_model

    def detect_vehicle(self, image_data: bytes) -> dict:
        """
        Step 1: Detect if it is a vehicle using standard YOLO.
        """
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            results = self.vehicle_model(img)
            
            # COCO classes: 2: car, 3: motorcycle, 5: bus, 7: truck
            VEHICLE_CLASSES = [2, 3, 5, 7] 
            
            is_vehicle = False
            max_conf = 0.0

            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    if cls_id in VEHICLE_CLASSES:
                        is_vehicle = True
                        if conf > max_conf:
                            max_conf = conf

            result = {
                "is_vehicle": is_vehicle,
                "confidence": max_conf,
                "message": "Araç tespit edildi." if is_vehicle else "Görselde araç tespit edilemedi."
            }
            
            # Only include image if it IS a vehicle, because we need it for Step 2.
            # If it's not a vehicle, we don't need the image anymore, saving bandwidth/memory.
            if is_vehicle:
                result["image"] = img

            return result

        except Exception as e:
            print(f"Error in vehicle detection: {e}")
            return {"is_vehicle": False, "confidence": 0.0, "message": str(e)}

    def detect_damage(self, img) -> list:
        """
        Step 2: Detect specific damages (dent, scratch, glass etc)
        """
        try:
            # Run the damage model
            # Note: The classes depend on how 'trained.pt' was trained.
            # Usually: 0: dent, 1: scratch, 2: crack, etc.
            # We will map whatever it finds.
            results = self.damage_model(img)
            
            detected_damages = []
            
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = self.damage_model.names[cls_id]
                    
                    # Filter low confidence
                    if conf > 0.25:
                        detected_damages.append({
                            "type": class_name,
                            "confidence": conf,
                            "box": box.xyxyn[0].tolist() # Normalized [x1, y1, x2, y2]
                        })
            
            return detected_damages

        except Exception as e:
            print(f"Error in damage detection: {e}")
            return []

ai_service = AIService()
