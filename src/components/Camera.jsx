import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";

const MIN_BODY_FILL = 0.75; // minimal tinggi frame terisi tubuh
const KEYPOINTS = [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]; // Filter titik penting

const CameraComponent = ({ onMeasurement, onPoseDetected, userHeight, userWeight }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [isCorrectPose, setIsCorrectPose] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [poseTimer, setPoseTimer] = useState(0);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [poseMessage, setPoseMessage] = useState("");
  const measurementHistoryRef = useRef([]);

  /** Utility */
  // Old code
  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  // New Code
  // const normalizeZ = (z) => z * 0.5;
  // const distance = (a, b) => Math.sqrt(
  //     Math.pow(a.x - b.x, 2) +
  //     Math.pow(a.y - b.y, 2) +
  //     Math.pow(normalizeZ(a.z) - normalizeZ(b.z), 2)
  //   );

  const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  

  /** Scale Factor (multi-point reference) */
  // old code
  const getScale = (landmarks) => {
    const nose = landmarks[0];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const midAnkle = { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 };

    const midShoulder = { x: (landmarks[11].x + landmarks[12].x) / 2, y: (landmarks[11].y + landmarks[12].y) / 2 };
    const midHip = { x: (landmarks[23].x + landmarks[24].x) / 2, y: (landmarks[23].y + landmarks[24].y) / 2 };

    const headToAnkle = distance(nose, midAnkle);
    const shoulderToAnkle = distance(midShoulder, midAnkle);
    const hipToAnkle = distance(midHip, midAnkle);

    const avgPixelHeight = (headToAnkle + shoulderToAnkle + hipToAnkle) / 3;
    return userHeight / avgPixelHeight;
  };

  // new code
//   const getScale = (landmarks) => {
//   const nose = landmarks[0];
//   const leftAnkle = landmarks[27];
//   const rightAnkle = landmarks[28];
//   const midAnkle = {
//     x: (leftAnkle.x + rightAnkle.x) / 2,
//     y: (leftAnkle.y + rightAnkle.y) / 2
//   };

//   const headToAnkle2D = Math.sqrt(Math.pow(nose.x - midAnkle.x, 2) + Math.pow(nose.y - midAnkle.y, 2));
//   return userHeight / (headToAnkle2D * 100); // Karena x,y normalized
// };


  /** Measurement Calculation */
  // old code
  // const calculateMeasurements = (landmarks) => {
  //   const scale = getScale(landmarks);
  //   const bmi = userWeight && userHeight ? userWeight / Math.pow(userHeight / 100, 2) : 22;
  //   let adjustmentFactor = 1;

  //   if (bmi > 27) adjustmentFactor = 1.07;
  //   else if (bmi < 18.5) adjustmentFactor = 0.95;

  //   return {
  //     chest: ((distance(landmarks[11], landmarks[12]) * 2.5 * scale) * adjustmentFactor).toFixed(1),
  //     waist: ((distance(landmarks[23], landmarks[24]) * 2.8 * scale) * adjustmentFactor).toFixed(1),
  //     hips: ((distance(landmarks[23], landmarks[24]) * 3.2 * scale) * adjustmentFactor).toFixed(1),
  //     shoulderWidth: (distance(landmarks[11], landmarks[12]) * scale).toFixed(1),
  //     armLength: ((distance(landmarks[11], landmarks[13]) + distance(landmarks[13], landmarks[15])) * scale).toFixed(1),
  //     backLength: (distance(
  //       { x: (landmarks[11].x + landmarks[12].x) / 2, y: (landmarks[11].y + landmarks[12].y) / 2 },
  //       { x: (landmarks[23].x + landmarks[24].x) / 2, y: (landmarks[23].y + landmarks[24].y) / 2 }
  //     ) * scale).toFixed(1),
  //     neck: (distance(landmarks[7], landmarks[8]) * 2.5 * scale).toFixed(1)
  //   };
  // };

  // new code
  const calculateMeasurements = (landmarks) => {
    const scale = getScale(landmarks);
    const bmi = userWeight && userHeight ? userWeight / Math.pow(userHeight / 100, 2) : 22;
    let adjustmentFactor = 1;

    if (bmi > 27) adjustmentFactor = 1.08;
    else if (bmi < 18.5) adjustmentFactor = 0.95;

    const shoulderWidth3D = distance(landmarks[11], landmarks[12]);
    const hipWidth3D = distance(landmarks[23], landmarks[24]);

    const chest = (shoulderWidth3D * 2.6 * scale) * adjustmentFactor;
    const waist = (hipWidth3D * 2.9 * scale) * adjustmentFactor;
    const hips = (hipWidth3D * 3.2 * scale) * adjustmentFactor;

    return {
      chest: chest.toFixed(1),
      waist: waist.toFixed(1),
      hips: hips.toFixed(1),
      shoulderWidth: (shoulderWidth3D * scale).toFixed(1),
      armLength: ((distance(landmarks[11], landmarks[13]) + distance(landmarks[13], landmarks[15])) * scale).toFixed(1),
      backLength: (distance(
        { x: (landmarks[11].x + landmarks[12].x) / 2, y: (landmarks[11].y + landmarks[12].y) / 2, z: (landmarks[11].z + landmarks[12].z) / 2 },
        { x: (landmarks[23].x + landmarks[24].x) / 2, y: (landmarks[23].y + landmarks[24].y) / 2, z: (landmarks[23].z + landmarks[24].z) / 2 }
      ) * scale).toFixed(1),
      neck: (distance(landmarks[7], landmarks[8]) * 2.5 * scale).toFixed(1)
    };
  };

  /** Pose Validation */
  const validatePose = (landmarks) => {
    if (!landmarks || landmarks.length < 32) return false;

    const [leftShoulder, rightShoulder] = [landmarks[11], landmarks[12]];
    const [leftHip, rightHip] = [landmarks[23], landmarks[24]];
    const [leftAnkle, rightAnkle] = [landmarks[27], landmarks[28]];
    const nose = landmarks[0];

    if (!nose || !leftAnkle || !rightAnkle) {
      setPoseMessage("Pastikan seluruh tubuh terlihat di kamera");
      return false;
    }

    const ys = landmarks.map(p => p.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const bodyHeight = maxY - minY;
    if (bodyHeight < MIN_BODY_FILL) {
      setPoseMessage("Mundur sedikit agar seluruh tubuh terlihat");
      return false;
    }

    const shoulderLevelDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevelDiff = Math.abs(leftHip.y - rightHip.y);
    const facingCamera = distance(leftShoulder, rightShoulder) > distance(leftHip, rightHip) * 0.85;
    const depthDiff = Math.abs(leftShoulder.z - rightShoulder.z);

    const valid = shoulderLevelDiff < 0.03 && hipLevelDiff < 0.03 && facingCamera && depthDiff < 0.05;
    setIsCorrectPose(valid);
    setPoseMessage(valid ? "" : "Posisikan tubuh tegak menghadap kamera.");
    return valid;
  };

  /** Smoothing */
  const smoothMeasurements = (newData) => {
    measurementHistoryRef.current.push(newData);
    if (measurementHistoryRef.current.length > 15) {
      measurementHistoryRef.current.shift();
    }
    const keys = Object.keys(newData);
    const smoothed = {};
    keys.forEach((k) => {
      smoothed[k] = median(measurementHistoryRef.current.map((m) => parseFloat(m[k]))).toFixed(1);
    });
    return smoothed;
  };

  /** Load Mediapipe */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      setPoseLandmarker(landmarker);
      setIsLoading(false);
    };
    init();
  }, []);

  /** Auto Start Measurement after 5 sec valid pose */
  useEffect(() => {
    let timer;
    if (isCorrectPose && !isMeasuring) {
      timer = setInterval(() => {
        setPoseTimer((prev) => {
          if (prev >= 4) {
            setIsMeasuring(true);
            clearInterval(timer);
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setPoseTimer(0);
    }
    return () => clearInterval(timer);
  }, [isCorrectPose, isMeasuring]);

  /** Detection Loop */
  useEffect(() => {
    let animationFrame;
    const runDetection = async () => {
      if (!webcamRef.current || !poseLandmarker) {
        animationFrame = requestAnimationFrame(runDetection);
        return;
      }

      const video = webcamRef.current.video;
      if (video.readyState !== 4) {
        animationFrame = requestAnimationFrame(runDetection);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const result = poseLandmarker.detectForVideo(video, performance.now());
      if (result.landmarks.length > 0) {
         const landmarks = result.landmarks[0];
        const valid = validatePose(landmarks);
        onPoseDetected(landmarks, valid);

        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawLandmarks(
          landmarks.filter((_, i) => KEYPOINTS.includes(i)),
          { color: isCorrectPose ? "#00FF00" : "#FF0000", radius: 5 }
        );

        if (valid && isMeasuring && !hasSent) {
          const rawMeasurements = calculateMeasurements(landmarks);
          const smoothed = smoothMeasurements(rawMeasurements);
          if (measurementHistoryRef.current.length >= 10) {
            console.log("Final Measurements:", smoothed);
            onMeasurement(smoothed);
            setHasSent(true);
          }
        }
      }

      animationFrame = requestAnimationFrame(runDetection);
    };

    if (poseLandmarker) {
      animationFrame = requestAnimationFrame(runDetection);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [poseLandmarker, isMeasuring, isCorrectPose, hasSent]);

  return (
    <div style={{ position: "relative" }}>
      <Webcam ref={webcamRef} mirrored style={{ width: "100%", zIndex: 1 }} />
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }} />

      {isLoading && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3
        }}>
          <p>Loading model...</p>
        </div>
      )}

      {poseMessage && (
        <div style={{
          position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.8)", color: "#fff", padding: "10px 15px", borderRadius: "8px", fontSize: "16px"
        }}>
          {poseMessage}
        </div>
      )}

      {isCorrectPose && !isMeasuring && (
        <div style={{
          position: "absolute", bottom: 50, left: "50%", transform: "translateX(-50%)",
          background: "#000", color: "#fff", padding: "8px 12px", borderRadius: "8px", fontSize: "16px"
        }}>
          Pose valid! Pengukuran dimulai dalam <b>{5 - poseTimer}</b> detik...
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
