from dotenv import load_dotenv
import os
from PIL import Image, ImageDraw
from matplotlib import pyplot as plt
from azure.core.exceptions import HttpResponseError
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

# Load environment variables
load_dotenv()

# Get Azure AI credentials from environment variables
ai_endpoint = os.getenv('AI_SERVICE_ENDPOINT')
ai_key = os.getenv('AI_SERVICE_KEY')

# Initialize the Azure AI Vision client
cv_client = ImageAnalysisClient(
    endpoint=ai_endpoint,
    credential=AzureKeyCredential(ai_key)
)

# Create a directory to save images if it doesn't exist
if not os.path.exists('static'):
    os.makedirs('static')

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        # Get the uploaded image
        file = request.files['image']
        image_data = file.read()
        
        # Analyze the image using Azure AI Vision client
        result = cv_client.analyze(
            image_data=image_data,
            visual_features=[VisualFeatures.CAPTION, VisualFeatures.DENSE_CAPTIONS,
                             VisualFeatures.TAGS, VisualFeatures.OBJECTS, VisualFeatures.PEOPLE]
        )

        # Prepare the response
        response = {}

        # Image Caption
        if result.caption:
            response['caption'] = {
                'text': result.caption.text,
                'confidence': result.caption.confidence * 100
            }

        # Dense Captions
        if result.dense_captions:
            response['dense_captions'] = [{
                'text': caption.text,
                'confidence': caption.confidence * 100
            } for caption in result.dense_captions.list]

        # Tags
        if result.tags:
            response['tags'] = [{
                'name': tag.name,
                'confidence': tag.confidence * 100
            } for tag in result.tags.list]

        # Objects
        if result.objects:
            response['objects'] = []
            for detected_object in result.objects.list:
                object_data = {
                    'name': detected_object.tags[0].name,
                    'confidence': detected_object.tags[0].confidence * 100
                }
                response['objects'].append(object_data)

                # Prepare image for drawing
                image = Image.open(request.files['image'])
                draw = ImageDraw.Draw(image)
                color = 'cyan'

                # Draw bounding box for objects
                r = detected_object.bounding_box
                bounding_box = ((r.x, r.y), (r.x + r.width, r.y + r.height))
                draw.rectangle(bounding_box, outline=color, width=3)

            # Save annotated image
            object_image_path = 'static/objects_annotated.jpg'
            image.save(object_image_path)
            print('Objects annotated saved in:', object_image_path)

        # People
        if result.people:
            response['people'] = []
            for detected_people in result.people.list:
                person_data = {
                    'confidence': detected_people.confidence * 100
                }
                response['people'].append(person_data)

                # Prepare image for drawing                
                image = Image.open(request.files['image'])
                draw = ImageDraw.Draw(image)
                color = 'cyan'

                # Draw bounding box for people
                r = detected_people.bounding_box
                print(r)
                bounding_box = ((r.x, r.y), (r.x + r.width, r.y + r.height))
                draw.rectangle(bounding_box, outline=color, width=3)

            # Save annotated image
            people_image_path = 'static/people_annotated.jpg'
            image.save(people_image_path)
            print('People annotated saved in:', people_image_path)

        # Add image URLs to response
        response['object_annotated_image'] = '/static/objects_annotated.jpg'
        response['people_annotated_image'] = '/static/people_annotated.jpg'

        return jsonify(response)

    except HttpResponseError as e:
        print(f"Status code: {e.status_code}")
        print(f"Reason: {e.reason}")
        print(f"Message: {e.error.message}")
        return jsonify({"error": e.error.message}), 500

@app.route('/static/<filename>')
def serve_image(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
