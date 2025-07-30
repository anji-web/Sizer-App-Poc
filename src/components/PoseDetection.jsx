import React, { useRef, useEffect, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import Webcam from "react-webcam";

const PoseDetection = ({ onMeasurement }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = webcamRef.current.video.videoWidth;
      canvas.height = webcamRef.current.video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (isMeasuring && results.poseLandmarks) {
        // Simulasi pengukuran tubuh (mock data)
        const measurements = {
          chest: Math.round(results.poseLandmarks[12].x * 100) + " cm",
          waist: Math.round(results.poseLandmarks[24].x * 100) + " cm",
          armLength: Math.round(results.poseLandmarks[15].y * 70) + " cm",
        };
        onMeasurement(measurements);
      }
    });

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [isMeasuring]);

  return (
    <div className="pose-detection">
      <Webcam
        ref={webcamRef}
        style={{ width: "100%", height: "auto" }}
        screenshotFormat="image/jpeg"
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "auto",
        }}
      />
      <button onClick={() => setIsMeasuring(!isMeasuring)}>
        {isMeasuring ? "Stop Measurement" : "Start Measurement"}
      </button>
    </div>
  );
};

export default PoseDetection;