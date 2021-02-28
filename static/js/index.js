$(document).ready(function(){

           

  let video = document.getElementById('inputVideo');
  let currentStream;
  let displaySize;

  if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
      video.srcObject = stream;
      })
      .then(run)
      .catch(function (err0r) {
      console.log("Something went wrong!");
      });
  }

 
  let temp = []
  async function run () {
      const displaySize = { width: 500,  
         height: 375 }

      async function detect(){

          const MODEL_URL = 'http://127.0.0.1:5000/static/models'

          await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
          await faceapi.loadFaceLandmarkModel(MODEL_URL)
          await faceapi.loadFaceRecognitionModel(MODEL_URL)

          let canvas = $("#canvas").get(0);

          facedetection = setInterval(async () =>{

              let fullFaceDescriptions = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
              let canvas = $("#canvas").get(0);
              console.log(canvas)
              faceapi.matchDimensions(canvas, displaySize)

              const fullFaceDescription = faceapi.resizeResults(fullFaceDescriptions, displaySize)
              // faceapi.draw.drawDetections(canvas, fullFaceDescriptions)

              const labels = ["Beyonce", "Jennifer", "Brad"]
              const details = {'Beyonce' : ['Negative', 'Not_vaccinated', 'lives in hotspot'], 'Jennifer': ['Positive', 'Not_vaccinated', 'lives in hotspot'], 'Brad': ['Negative', 'Vaccinated', 'lives in hotspot'] }

              const labeledFaceDescriptors = await Promise.all(
                  labels.map(async label => {
                      // fetch image data from urls and convert blob to HTMLImage element
                      const imgUrl = `http://127.0.0.1:5000/static/LabeledImages/${label}/${label}.jpg`
                      const c19_details = `http://127.0.0.1:5000/static/LabeledImages/${label}/${label}_details.jpg`
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

              

              var echoDB;

              // Query echoAR
              fetch('https://console.echoar.xyz/query?key=aged-mud-3260')
              .then((response) => response.json())
              .then((json) => {
              console.log(json)
                // Store database
              echoDB = json; // The JSON response
              })
              .catch((error) => {
              console.error(error);
              });
              
              // var db = Object.values(echoDB.db);

              results.forEach((bestMatch, i) => {
                  const box = fullFaceDescriptions[i].detection.box
                  var text = bestMatch.toString().split(" (")
                  var total = text[0] 
                  console.log(total+" total")
                  for (const [key, value] of Object.entries(details)) {
                    console.log(key+"key")
                    var n = key.localeCompare(total);
                    
                    if (n == 0)
                    {
                      
                      total = text[0] + "\n" + value[0] + "\n" + value[1] + "\n" + value[2];
                      
                    }
                  }
                  const drawBox = new faceapi.draw.DrawBox(box, { label: total })
                  drawBox.draw(canvas)
              })

          },100);

          console.log(displaySize)
      }
      detect()
      
    };   

})  


