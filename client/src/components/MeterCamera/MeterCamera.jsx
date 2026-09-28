/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { IconCamera, IconRefresh, IconX } from "@tabler/icons-react";
import "./MeterCamera.css";

// Live in-app camera: shows the rear camera feed with a guide box, and hands
// the part of the frame inside the box (as a JPEG Blob) to onCapture, which
// resolves to { ok, message }.
const MeterCamera = ({ show, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const guideRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isReading, setIsReading] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
  };

  useEffect(() => {
    if (!show) return undefined;
    let cancelled = false;
    setScanMessage("");

    const startStream = async () => {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Live camera is not supported in this browser (it needs HTTPS). Please use Upload Photo instead."
        );
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser settings, or use Upload Photo."
            : "Could not open the camera. Please use Upload Photo instead."
        );
      }
    };

    startStream();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [show, facingMode]);

  // Crops the frame to what's inside the guide box, mapping it through the
  // video's object-fit: cover scaling, so the OCR only sees the digit window.
  const captureGuideArea = () => {
    const video = videoRef.current;
    const vRect = video.getBoundingClientRect();
    const gRect = guideRef.current.getBoundingClientRect();
    const scale = Math.max(
      vRect.width / video.videoWidth,
      vRect.height / video.videoHeight
    );
    const offsetX = (video.videoWidth - vRect.width / scale) / 2;
    const offsetY = (video.videoHeight - vRect.height / scale) / 2;
    const sx = Math.max(0, offsetX + (gRect.left - vRect.left) / scale);
    const sy = Math.max(0, offsetY + (gRect.top - vRect.top) / scale);
    const sw = Math.min(video.videoWidth - sx, gRect.width / scale);
    const sh = Math.min(video.videoHeight - sy, gRect.height / scale);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    canvas
      .getContext("2d")
      .drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
  };

  const handleCapture = async () => {
    if (!videoRef.current?.videoWidth || isReading) return;
    setScanMessage("");
    setIsReading(true);
    try {
      const blob = await captureGuideArea();
      if (!blob) return;
      // The feed keeps running, so a failed read can simply be retried.
      const result = await onCapture(blob);
      if (!result?.ok) {
        setScanMessage(result?.message || "Could not read the meter, try again");
      }
    } finally {
      setIsReading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered className="meter-camera-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h5">Capture Meter Reading</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {error ? (
          <p className="meter-camera-error">{error}</p>
        ) : (
          <div className="meter-camera-view">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              onLoadedData={() => setIsReady(true)}
            />
            <div
              ref={guideRef}
              className="meter-camera-guide"
              aria-hidden="true"
            />
            <span
              className={`meter-camera-hint ${scanMessage ? "is-error" : ""}`}
              role={scanMessage ? "alert" : undefined}
            >
              {scanMessage || "Fit only the digit window inside the box"}
            </span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <Button variant="outline-secondary" onClick={onClose}>
          <IconX size={18} className="me-1" />
          Cancel
        </Button>
        {!error && (
          <div className="d-flex gap-2">
            <Button
              variant="outline-dark"
              aria-label="Switch camera"
              disabled={isReading}
              onClick={() =>
                setFacingMode((m) => (m === "environment" ? "user" : "environment"))
              }
            >
              <IconRefresh size={18} />
            </Button>
            <Button
              variant="dark"
              disabled={!isReady || isReading}
              onClick={handleCapture}
            >
              {isReading ? (
                <span
                  className="spinner-border spinner-border-sm me-1"
                  aria-hidden="true"
                />
              ) : (
                <IconCamera size={18} className="me-1" />
              )}
              {isReading ? "Reading..." : "Capture"}
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MeterCamera;
