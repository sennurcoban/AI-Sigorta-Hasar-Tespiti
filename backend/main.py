from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ai_service import ai_service
from pricing_engine import generate_damage_report
import uvicorn
import asyncio 

app = FastAPI()

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Sigorta Hasar Tespiti AI Backend Hazır (v2)"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="Dosya yüklenmedi")
    
    contents = await file.read()
    
    # 1. AI Detection (Step 1: Is it a car?)
    vehicle_result = ai_service.detect_vehicle(contents)
    
    if not vehicle_result["is_vehicle"]:
        if "image" in vehicle_result:
            del vehicle_result["image"]
        return vehicle_result 
        
    # 2. AI Damage Detection (Step 2: Where is the damage?)
    # We use the image object returned from step 1
    img_data = vehicle_result.get("image")
    detected_damages = ai_service.detect_damage(img_data)
    
    # 3. Pricing Engine (Step 3: How much?)
    # We pass the Real AI results AND an image identifier (hash) to the pricing engine.
    # This ensures that if the user retries the SAME image, the "random" logic in the
    # pricing engine produces the exact same costs.
    import hashlib
    image_hash = hashlib.md5(contents).hexdigest()
    
    damage_report = generate_damage_report(detected_damages, image_hash)
   
    # Cleanup image object from result before sending JSON
    if "image" in vehicle_result:
        del vehicle_result["image"]
    
    # Merge results
    result = {
        **vehicle_result,
        **damage_report
    }
    
    return result

if __name__ == "__main__":
    # Host 0.0.0.0 is important to be accessible from local network/simulators
    uvicorn.run(app, host="0.0.0.0", port=8000)
