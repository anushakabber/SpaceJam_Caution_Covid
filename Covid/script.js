const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  const details = {'Black Widow' : ['Negative', 'Not_vaccinated', 'lives in hotspot'], 'Captain America': ['Positive', 'Not_vaccinated', 'lives in hotspot'], 'Captain Marvel': ['Negative', 'Vaccinated', 'lives in hotspot'],'Hawkeye' : ['Negative', 'Not_vaccinated', 'lives in hotspot'], 'Jim Rhodes': ['Positive', 'Not_vaccinated', 'lives in hotspot'], 'Thor': ['Negative', 'Vaccinated', 'lives in hotspot'], 'Tony Stark': ['Negative', 'Vaccinated', 'lives in hotspot']  }
  let image
  let canvas
  document.body.append('Loaded')
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      var final = (result.toString().split(" ("))[0]
      for (const [key, value] of Object.entries(details)) {
                    
                    var n = key.localeCompare(final);
                    
                    if (n == 0)
                    {
                      
                      final = final + "\n" + value[0] + "\n" + value[1] + "\n" + value[2];
                      
                    }
                  }
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: final })
      drawBox.draw(canvas)
    })
  })
}

function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
  //const details = {'Black Widow' : ['Negative', 'Not_vaccinated', 'lives in hotspot'], 'Captain America': ['Positive', 'Not_vaccinated', 'lives in hotspot'], 'Captain Marvel': ['Negative', 'Vaccinated', 'lives in hotspot'],'Hawkeye' : ['Negative', 'Not_vaccinated', 'lives in hotspot'], 'Jim Rhodes': ['Positive', 'Not_vaccinated', 'lives in hotspot'], 'Thor': ['Negative', 'Vaccinated', 'lives in hotspot'], 'Tony Stark': ['Negative', 'Vaccinated', 'lives in hotspot']  }
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
		    
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
