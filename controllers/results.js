require('dotenv').load()
const request = require('request-promise-native')
const express = require('express')
const router = express.Router()

router.post('/', function (req, res, next) {
  const food_url = req.body.food_url
  const face_url = req.body.face_url
  Promise.all([
    // MAKE CALL TO CUSTOM VISION API
    callAPI(food_url),
    processImage(face_url)
  ]).then(([response, response2]) => {
    var results = response

    // PARSE THE RESPONSE TO FIND THE HIGHEST PREDICTION
    //const top = parseResponse(results.Predictions)

    // GET THE DATA FOR THE TOP SCORED TAG
    const data = getPredictionData(results.Predictions)

    // RENDER RESULTS
    res.render('results', {
      title: 'Plate Composition Stats',
      description: 'Wastage Analysis',
      prediction: data.prediction,
      age: response2[0].faceAttributes.age,
      gender: response2[0].faceAttributes.gender,
    })
  }).catch(reason => {
    console.log(`Promise was rejected because ${reason}`)

    // RENDER AN ERROR MESSAGE
    res.render('results',
      { title: 'Error',
        description: 'Oops something went wrong! Submit another link to try again!',
        probability: 100,
        photo: '/images/Error.jpg'
      })
  })
})

module.exports = router

// =========================================================
// HELPER FUNCTIONS HERE
// =========================================================

function callAPI (url) {
  const options = {
    uri: process.env.PREDICTION_URL,
    headers: {
      'Prediction-Key': process.env.PREDICTION_KEY,
      'Content-Type': 'application/json'
    },
    body: `{"Url": "${url}"}`
  }

  return request.post(options)
    .then((result) => {
      return JSON.parse(result)
    })
}

function getPredictionData (predictions) {
  for(var p of predictions){
    if (p.Tag == 'Quarter'){
      quarter = p.Probability*100
    }
    else if (p.Tag == 'Half'){
      half = p.Probability*100
    }
    else if (p.Tag == 'Full'){
      full = p.Probability*100
    }
    else if (p.Tag == 'Empty'){
      empty = p.Probability*100
    }
    else{
      empty_space = p.Probability*100
    }  
  }

  if (quarter > 35) {
    prediction = 25
  }
  else if (half > 30) {
    prediction = 50
  }
  else if (full > 75) {
    prediction = 90
  }
  else {
    prediction = 0
  } 

  // Store suggestion
  const data = {
    prediction: prediction
  }

  return data
}

function processImage(face_url) {
        // **********************************************
        // *** Update or verify the following values. ***
        // **********************************************

        // Replace the subscriptionKey string value with your valid subscription key.
        var subscriptionKey = "26d7bff1f8b94b32b8135ff6ea9f2c6d";

        // Replace or verify the region.
        //
        // You must use the same region in your REST API call as you used to obtain your subscription keys.
        // For example, if you obtained your subscription keys from the westus region, replace
        // "westcentralus" in the URI below with "westus".
        //
        // NOTE: Free trial subscription keys are generated in the westcentralus region, so if you are using
        // a free trial subscription key, you should not need to change this region.
        var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";
        // Request parameters.
        var params = {
            "returnFaceId": "true",
            "returnFaceLandmarks": "false",
            "returnFaceAttributes": "age,gender",
        };

        // Display the image.
        //var sourceImageUrl = document.getElementById("inputImage").value;
        //document.querySelector("#sourceImage").src = face_url;

        // Perform the REST API call.
        const options = {
          uri: 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': subscriptionKey
          },
          body: `{"Url": "${face_url}"}`
        }

      //   var options = {
      //     method: 'POST',
      //     uri:  'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?' + 'returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age',
      //     //body: '{"url": ' + '"' + face_url + '"}',
      //     headers: {
      //         'content-type': 'application/json',
      //         'Ocp-Apim-Subscription-Key': subscriptionKey
      //     },
      //     json: true // Automatically stringifies the body to JSON
      // };
       
      return request.post(options)
        .then((result) => {
          return JSON.parse(result)
        }).catch(function (err) {
            console.log(err);  
            // POST failed...
          });
        
    };