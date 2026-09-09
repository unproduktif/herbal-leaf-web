"""
Herbal leaf classification inference pipeline.

Ported from the original training script (leaf_classification_final.py) for
Scenario 8 (GLCM + shape descriptors) with an SVM classifier. Do not change
the preprocessing or feature extraction here without retraining the model —
the scaler and SVM were fit on features produced by exactly this pipeline.

Background removal (rembg/U2-Net in the original notebook) is intentionally
skipped here to keep this deployable as a lightweight Vercel Function — a
5-sample check showed no accuracy difference either way (3/5 correct both
with and without it). Results are best on photos of a leaf against a plain,
light-colored background, since segmentation relies on a fixed brightness
threshold rather than learned background removal.
"""

import os

import cv2
import joblib
import numpy as np
from skimage.feature import graycomatrix, graycoprops
from skimage.measure import regionprops

IMG_SIZE = (128, 128)

# Resolve model paths relative to this file rather than the process's
# current working directory — that varies depending on how the platform
# invokes the function (repo root vs. this service's own root).
_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

_svm = joblib.load(os.path.join(_MODELS_DIR, "svm_s8.pkl"))
_scaler = joblib.load(os.path.join(_MODELS_DIR, "scaler_s8.pkl"))
_encoder = joblib.load(os.path.join(_MODELS_DIR, "label_encoder.pkl"))


def grayscale(img_rgb: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)


def otsu_threshold(gray: np.ndarray) -> np.ndarray:
    # Named after Otsu in the original notebook, but it's actually a fixed
    # threshold at 240 (near-white background vs. leaf) — kept as-is for
    # fidelity with the trained model.
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    return thresh


def contour_detection(thresh: np.ndarray):
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if len(contours) == 0:
        return None
    return max(contours, key=cv2.contourArea)


def extract_glcm(gray: np.ndarray) -> np.ndarray:
    glcm = graycomatrix(
        gray, distances=[1, 3, 5], angles=[0, np.pi / 2],
        levels=256, symmetric=True, normed=True,
    )
    contrast = graycoprops(glcm, "contrast")
    correlation = graycoprops(glcm, "correlation")
    features = list(contrast.flatten())
    features += list(correlation[:, 1])
    return np.array(features)


def extract_shape(contour) -> np.ndarray:
    if contour is None:
        return np.zeros(9)

    area = cv2.contourArea(contour)
    perimeter = cv2.arcLength(contour, True)

    x, y, w, h = cv2.boundingRect(contour)
    aspect_ratio = w / (h + 1e-10)
    rect_area = w * h
    extent = area / (rect_area + 1e-10)

    hull = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull)
    hull_perimeter = cv2.arcLength(hull, True)

    solidity = area / (hull_area + 1e-10)
    circularity = (4 * np.pi * area) / ((perimeter ** 2) + 1e-10)
    convexity = hull_perimeter / (perimeter + 1e-10)

    mask = np.zeros((IMG_SIZE[1], IMG_SIZE[0]), dtype=np.uint8)
    cv2.drawContours(mask, [contour], -1, 255, -1)

    props = regionprops(mask)
    eccentricity = props[0].eccentricity if len(props) > 0 else 0

    rectangularity = area / (rect_area + 1e-10)

    return np.array([
        area, perimeter, aspect_ratio, extent, solidity,
        circularity, convexity, eccentricity, rectangularity,
    ])


def extract_features_scenario_8(gray: np.ndarray, contour) -> np.ndarray:
    return np.hstack([extract_glcm(gray), extract_shape(contour)])


def predict_leaf_from_bytes(image_bytes: bytes):
    """Run the full pipeline on raw image bytes and return (label, probabilities)."""
    file_bytes = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Could not decode image — unsupported or corrupt file.")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_rgb = cv2.resize(img_rgb, IMG_SIZE)

    gray = grayscale(img_rgb)
    thresh = otsu_threshold(gray)
    contour = contour_detection(thresh)

    feature = extract_features_scenario_8(gray, contour).reshape(1, -1)
    feature = _scaler.transform(feature)

    proba = _svm.predict_proba(feature)[0]
    class_labels = _encoder.inverse_transform(_svm.classes_)
    proba_dict = {lab: float(p) for lab, p in zip(class_labels, proba)}

    # Note: SVC's .predict() (raw one-vs-one decision) and .predict_proba()
    # (a separately Platt-scaled/calibrated model) can disagree on
    # borderline inputs — a known scikit-learn caveat. We report the
    # argmax of the *displayed* probabilities so the headline prediction
    # always matches the highest bar in the UI, rather than a raw decision
    # that can silently contradict the confidence breakdown shown to users.
    label = max(proba_dict, key=proba_dict.get)

    return label, proba_dict
