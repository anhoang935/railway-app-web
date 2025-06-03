import trainFooter from './../../images/train-footer.png';
import railway from './../../images/railway.png';

import { useEffect, useState } from "react";

export default function TrainFooter() {
  const [position, setPosition] = useState(-1000); // Start slightly off-screen on the left

  useEffect(() => {
    const speed = 12; // Adjust speed for smooth movement
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= window.innerWidth) return -800; // Reset only after reaching the right edge
        return prev + speed; // Move right
      });
    }, 16); // Smooth animation (60 FPS)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="footer-bg" src={railway} style={{
      overflow: "hidden",
      position: "relative",
      height: "170px",
      backgroundImage: `url(${railway})`, // Apply background image
      backgroundSize: "cover", // Ensure it covers the entire div
      backgroundPosition: "center", // Center it properly
      backgroundRepeat: "no-repeat", // Prevent tiling
    }}>
      <img
        src={trainFooter}
        alt="Train"
        style={{
          position: "absolute",
          left: `${position}px`,
          bottom: "0px", // Adjust to fit your design
          height: "50px", // Reduce size to prevent blurriness
          width: "auto",
        }}
      />
    </div>
  );
}
