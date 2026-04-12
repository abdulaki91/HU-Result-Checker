// Generate a unique device fingerprint
export const getDeviceFingerprint = () => {
  // Check if we already have a device ID stored
  let deviceId = localStorage.getItem("deviceId");

  if (deviceId) {
    return deviceId;
  }

  // Generate new device ID based on browser characteristics
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    // Add canvas fingerprint
    canvas: getCanvasFingerprint(),
  };

  // Create a hash from the fingerprint
  deviceId = hashCode(JSON.stringify(fingerprint));

  // Store it for future use
  localStorage.setItem("deviceId", deviceId);

  return deviceId;
};

// Generate canvas fingerprint
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return "no-canvas";

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Device ID", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Device ID", 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return "canvas-error";
  }
};

// Simple hash function
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "device_" + Math.abs(hash).toString(36);
};

// Check if device is locked (stored in localStorage)
export const isDeviceLocked = () => {
  return localStorage.getItem("deviceLocked") === "true";
};

// Set device as locked
export const setDeviceLocked = () => {
  localStorage.setItem("deviceLocked", "true");
};

// Get remaining views from localStorage
export const getRemainingViews = () => {
  const remaining = localStorage.getItem("remainingViews");
  return remaining ? parseInt(remaining, 10) : 6;
};

// Update remaining views
export const setRemainingViews = (count) => {
  localStorage.setItem("remainingViews", count.toString());
};
