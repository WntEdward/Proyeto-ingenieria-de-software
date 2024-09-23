const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const overlay = document.getElementById('overlay');
const toggleCameraButton = document.getElementById('toggleCamera');
let isCameraOn = false; // Inicialmente la cámara está deshabilitada

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

// No iniciar la cámara automáticamente
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480,
});

// Resultados de detección de manos
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  canvasCtx.restore();
}

// Botón para habilitar/deshabilitar cámara
toggleCameraButton.addEventListener('click', () => {
  if (isCameraOn) {
    overlay.style.display = 'flex'; // Muestra el overlay
    camera.stop();
    toggleCameraButton.textContent = 'Habilitar Cámara';
  } else {
    overlay.style.display = 'none'; // Oculta el overlay
    camera.start();
    toggleCameraButton.textContent = 'Deshabilitar Cámara';
  }
  isCameraOn = !isCameraOn;
});
