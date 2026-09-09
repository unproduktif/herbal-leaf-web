from fastapi import FastAPI, File, HTTPException, UploadFile

from pipeline import predict_leaf_from_bytes

app = FastAPI(title="Herbal Leaf Classifier")

SPECIES_INFO = {
    "JAMBU": {"common_name": "Guava", "scientific_name": "Psidium guajava"},
    "KUNYIT": {"common_name": "Turmeric", "scientific_name": "Curcuma longa"},
    "PAKU": {"common_name": "Fern", "scientific_name": "Pteridophyta"},
    "SINGKONG": {"common_name": "Cassava", "scientific_name": "Manihot esculenta"},
    "SIRIH": {"common_name": "Betel", "scientific_name": "Piper betle"},
}

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB


@app.get("/api")
def health():
    return {"status": "ok"}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large (max 10MB).")

    try:
        label, probabilities = predict_leaf_from_bytes(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "label": label,
        "info": SPECIES_INFO.get(label),
        "probabilities": probabilities,
    }
