import numpy as np
import cv2
import base64
import os

BASE_DIR = os.path.dirname(__file__)
CASCADE_PATH = os.path.join(BASE_DIR, "haarcascades")

face_cascade = cv2.CascadeClassifier(
    os.path.join(CASCADE_PATH, "haarcascade_frontalface_default.xml")
)

smile_cascade = cv2.CascadeClassifier(
    os.path.join(CASCADE_PATH, "haarcascade_smile.xml")
)

print("Face loaded:", not face_cascade.empty())
print("Smile loaded:", not smile_cascade.empty())

def process_frame(image_base64: str):
    try:
        if "," not in image_base64:
            return {"faces": 0, "smiling": False, "boxes": []}

        img_data = base64.b64decode(image_base64.split(',')[1])
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"faces": 0, "smiling": False, "boxes": []}

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        boxes = []
        smiling = False

        for (x, y, w, h) in faces:
            boxes.append([int(x), int(y), int(w), int(h)])

            roi_gray = gray[y:y+h, x:x+w]

            smiles = smile_cascade.detectMultiScale(
                roi_gray,
                scaleFactor=1.7,
                minNeighbors=20
            )

            if len(smiles) > 0:
                smiling = True

        return {
            "faces": len(faces),
            "smiling": smiling,
            "boxes": boxes
        }

    except Exception as e:
        print("❌ Vision error:", e)
        return {"faces": 0, "smiling": False, "boxes": []}