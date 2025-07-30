import numpy as np

def calculate_body_measurements(landmarks):
    """Calculate real body measurements from pose landmarks"""
    # Convert landmarks to numpy array
    lms = np.array([[lm['x'], lm['y'], lm['z']] for lm in landmarks])
    
    # Calculate distances between key points (in pixels)
    # Note: Need calibration to convert to real-world measurements
    chest = np.linalg.norm(lms[12] - lms[11]) * 100  # Shoulder to shoulder
    waist = np.linalg.norm(lms[24] - lms[23]) * 100   # Hip to hip
    arm_length = np.linalg.norm(lms[16] - lms[12]) * 70
    
    # Convert to centimeters (example conversion factor)
    # In real app, you need calibration based on reference object
    pixel_to_cm = 0.2  
    
    return {
        "chest": round(chest * pixel_to_cm, 1),
        "waist": round(waist * pixel_to_cm, 1),
        "arm_length": round(arm_length * pixel_to_cm, 1),
        "recommended_size": get_size_recommendation(chest * pixel_to_cm, waist * pixel_to_cm)
    }

def get_size_recommendation(chest_cm, waist_cm):
    """Simple size recommendation logic"""
    if chest_cm > 100 or waist_cm > 90: return "XL"
    elif chest_cm > 90 or waist_cm > 80: return "L"
    elif chest_cm > 80 or waist_cm > 70: return "M"
    else: return "S"