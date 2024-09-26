const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const overlay = document.getElementById('overlay');
const toggleCameraButton = document.getElementById('toggleCamera');
let isCameraOn = false;

// Ajustar el tamaño del canvas a la resolución del video
videoElement.width = 640;  // Establecer un ancho para el video
videoElement.height = 480; // Establecer un alto para el video
canvasElement.width = videoElement.width;
canvasElement.height = videoElement.height;

// Inicializar MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

// Función para habilitar/deshabilitar la cámara
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      const distance = calculateDistance(landmarks);
      const scaleFactor = Math.max(0.5, Math.min(0.5, 1 / distance));

      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 * scaleFactor });
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 * scaleFactor });
    }
  }
  canvasCtx.restore();
}

function calculateDistance(landmarks) {
  const wrist = landmarks[0];
  const indexFingerTip = landmarks[8];
  const dx = wrist.x - indexFingerTip.x;
  const dy = wrist.y - indexFingerTip.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Control del botón para habilitar o deshabilitar la cámara
toggleCameraButton.addEventListener('click', () => {
  if (isCameraOn) {
    overlay.style.display = 'flex';
    camera.stop();
    toggleCameraButton.textContent = 'Habilitar cámara';
  } else {
    overlay.style.display = 'none';
    camera.start();
    toggleCameraButton.textContent = 'Deshabilitar cámara';
  }
  isCameraOn = !isCameraOn;
});

function toggleMenu() {
  var menu = document.getElementById("dropdownMenu");
  if (menu.style.display === "block") {
    menu.style.display = "none"; /* Oculta el menú si ya está visible */
  } else {
    menu.style.display = "block"; /* Muestra el menú si está oculto */
  }
}

document.getElementById('voiceButton').addEventListener('click', function() {
  let text = document.querySelector('.transcription-box p').textContent;
  let speech = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(speech);
});
