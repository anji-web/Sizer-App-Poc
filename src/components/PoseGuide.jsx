import React from "react";
import guideImage from "../assets/pose-guide.png"; // Sample pose guide image

const PoseGuide = ({ currentPose }) => {
  const getPoseFeedback = () => {
    if (!currentPose) return "Stand straight with arms slightly away from body";
    // Add your pose validation logic here
    return "Good pose! Hold still for measurement";
  };

  return (
    <div className="pose-guide-container">
      <div className="pose-feedback">{getPoseFeedback()}</div>
      <img 
        src={guideImage} 
        alt="Ideal pose guide" 
        className="pose-guide-image"
      />
    </div>
  );
};

export default PoseGuide;