from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

# Setup logging for better debugging
logging.basicConfig(level=logging.DEBUG)

ai_endpoint = os.getenv('AI_SERVICE_ENDPOINT')
ai_key = os.getenv('AI_SERVICE_KEY')

cv_client = ImageAnalysisClient(
    endpoint=ai_endpoint,
    credential=AzureKeyCredential(ai_key)
)

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            raise ValueError("No image file part")
        
        file = request.files['image']
        if file.filename == '':
            raise ValueError("No selected file")

        image_data = file.read()
        logging.debug(f"Received image: {file.filename}")

        result = cv_client.analyze(
            image_data=image_data,
            visual_features=[
                VisualFeatures.CAPTION,
                VisualFeatures.TAGS,
                VisualFeatures.OBJECTS,
                VisualFeatures.PEOPLE,
            ],
        )

        # Prepare response based on result
        response = {
            "caption": {"text": result.caption.text, "confidence": result.caption.confidence} if result.caption else None,
            "tags": [{"name": tag.name, "confidence": tag.confidence} for tag in result.tags.list] if result.tags else None,
            "objects": [{"name": obj.tags[0].name, "confidence": obj.tags[0].confidence} for obj in result.objects.list] if result.objects else None,
            "people": [{"confidence": person.confidence} for person in result.people.list] if result.people else None,
        }

        return jsonify(response)

    except Exception as e:
        logging.error(f"Error analyzing image: {e}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
