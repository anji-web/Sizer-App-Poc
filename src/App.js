import React, { useState, useEffect } from "react";
import CameraComponent from "./components/Camera";
import PoseGuide from "./components/PoseGuide";
import Results from "./components/Results";
import "./styles.css";

function App() {
  const [measurements, setMeasurements] = useState(null);
  const [currentPose, setCurrentPose] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [userHeight, setUserHeight] = useState(null);
  const [userWeight, setUserWeight] = useState(null);
  const [heightSubmitted, setHeightSubmitted] = useState(false);
  const [poseValid, setPoseValid] = useState(false);
  const [poseTimer, setPoseTimer] = useState(0);

  const handleMeasurementResult = (data) => {
    setMeasurements(data);
    setIsMeasuring(false);
    setPoseTimer(0);
  };

  const handlePoseDetected = (landmarks, valid) => {
    setCurrentPose(landmarks);
    setPoseValid(valid);
  };

  const handleUserHeightSubmit = (e) => {
    e.preventDefault();
    if (userHeight && userWeight && userHeight > 0 && userWeight > 0) {
      setHeightSubmitted(true);
    }
  };

  // Auto-start measurement if pose valid for 30 sec
  useEffect(() => {
    let interval;
    if (poseValid && !isMeasuring) {
      interval = setInterval(() => {
        setPoseTimer((prev) => {
          if (prev >= 29) {
            setIsMeasuring(true);
            clearInterval(interval);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setPoseTimer(0);
    }
    return () => clearInterval(interval);
  }, [poseValid, isMeasuring]);

  return (
    <div className="app">
      <h1>WBH - Body Measurement POC</h1>
      {!heightSubmitted ? (
        <div className="height-input-section">
          <h2>Masukkan Tinggi & Berat Anda</h2>
          <form onSubmit={handleUserHeightSubmit}>
            <input
              type="number"
              className="form-control"
              value={userHeight || ""}
              onChange={(e) => setUserHeight(parseFloat(e.target.value))}
              placeholder="Tinggi (cm)"
              min="100"
              max="250"
              step="0.1"
              required
            />
            <input
              type="number"
              className="form-control"
              value={userWeight || ""}
              onChange={(e) => setUserWeight(parseFloat(e.target.value))}
              placeholder="Berat (kg)"
              min="30"
              max="200"
              step="0.1"
              required
            />
            <button type="submit">Konfirmasi</button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="guide-section">
            <PoseGuide currentPose={currentPose} />
            {poseValid ? (
              <p style={{ color: "green" }}>
                Pose valid! Pengukuran otomatis dalam {5 - poseTimer} detik...
              </p>
            ) : (
              <p style={{ color: "red" }}>Pastikan pose Anda benar</p>
            )}
          </div>
          <div className="camera-section">
            <CameraComponent
              onMeasurement={handleMeasurementResult}
              onPoseDetected={handlePoseDetected}
              isMeasuring={isMeasuring}
              setIsMeasuring={setIsMeasuring} 
              userHeight={userHeight}
              userWeight={userWeight} // Kirim ke kamera
            />
          </div>
          <Results measurements={measurements} />
        </div>
      )}
    </div>
  );
}

export default App;
