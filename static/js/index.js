$(document).ready(function(){

           

  let video = document.querySelector("#videoElement");
  let currentStream;
  let displaySize;

  if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
      video.srcObject = stream;
      })
      .catch(function (err0r) {
      console.log("Something went wrong!");
      });
  }
  
  let temp = []
  $("#videoElement").bind("loadedmetadata", function(){
      displaySize = { width:this.scrollWidth, height: this.scrollHeight }

      async function detect(){

          const MODEL_URL = '/models'

          await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
          await faceapi.loadFaceLandmarkModel(MODEL_URL)
          await faceapi.loadFaceRecognitionModel(MODEL_URL)

          let canvas = $("#canvas").get(0);

          facedetection = setInterval(async () =>{

              let fullFaceDescriptions = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
              let canvas = $("#canvas").get(0);
              faceapi.matchDimensions(canvas, displaySize)

              const fullFaceDescription = faceapi.resizeResults(fullFaceDescriptions, displaySize)
              // faceapi.draw.drawDetections(canvas, fullFaceDescriptions)

              const labels = ["img/steveoni"]

              const labeledFaceDescriptors = await Promise.all(
                  labels.map(async label => {
                      // fetch image data from urls and convert blob to HTMLImage element
                      const imgUrl = `${label}.JPG`
                      const img = await faceapi.fetchImage(imgUrl)
                      
                      // detect the face with the highest score in the image and compute it's landmarks and face descriptor
                      const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                      
                      if (!fullFaceDescription) {
                      throw new Error(`no faces detected for ${label}`)
                      }
                      
                      const faceDescriptors = [fullFaceDescription.descriptor]
                      return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
                  })
              );

              const maxDescriptorDistance = 0.6
              const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

              const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))

              results.forEach((bestMatch, i) => {
                  const box = fullFaceDescriptions[i].detection.box
                  const text = bestMatch.toString()
                  const drawBox = new faceapi.draw.DrawBox(box, { label: text })
                  drawBox.draw(canvas)
              })

          },300);

          console.log(displaySize)
      }
      detect()
      
  });   

})  


