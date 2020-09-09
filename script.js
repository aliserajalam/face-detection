const { Stream } = require('stream');

// Refer the video element
const video = document.getElementById('video');

//Promise ensures the following operations run asynchronously and in parallel
Promise.all([
  // Small footprint face detector - runs in realtime
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  // Detects face features - eyes, nose, mouth etc
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  // Detects a face within a canvas
  faceapi.nets.faeRecognitionNet.loadFromUri('./models'),
  // Detects face expressions - happy, sad, angry, neutral etc
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
]).then(startVideo);

// Starts the video capture in browser
function startVideo() {
  navigator.mediaDevices.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener('play', () => {
  // Showing the face expression within the HTML canvas
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  // Sets the Face API display size to the video streaming size
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // Clear the previous before the next paint
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
