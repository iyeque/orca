import os
from roboflow import Roboflow
from fastapi import UploadFile

def count_stock_from_image(file: UploadFile):
    # Retrieve Roboflow credentials from environment variables
    ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY")
    ROBOFLOW_MODEL_ID = os.environ.get("ROBOFLOW_MODEL_ID")
    ROBOFLOW_MODEL_VERSION = os.environ.get("ROBOFLOW_MODEL_VERSION")

    if not all([ROBOFLOW_API_KEY, ROBOFLOW_MODEL_ID, ROBOFLOW_MODEL_VERSION]):
        return {"error": "Roboflow API key, model ID, or model version not set in environment variables."}

    try:
        rf = Roboflow(api_key=ROBOFLOW_API_KEY)
        project = rf.workspace().project(ROBOFLOW_MODEL_ID)
        model = project.version(ROBOFLOW_MODEL_VERSION).model

        # Read image content
        image_content = file.file.read()

        # Perform inference
        # Roboflow's infer method can take bytes directly
        prediction = model.predict(image_content)

        # You might want to process the prediction object further
        # For now, returning the raw prediction
        return prediction.json()
    except Exception as e:
        return {"error": str(e)}