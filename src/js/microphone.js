// module.exports.node = {
//   child_process: 'empty'
// }

//const speech = require('@google-cloud/speech');
//const {auth} = require('google-auth-library');
//const fs = require('fs')

//var GetUserMediaToText = require('getusermedia-to-text')

const axios = require('axios');

const AiKy = "AIzaSyCqb9QdYoScP2xdLkD_kJkfS9wWAknvCNI";

//var MediaStreamRecorder = require('msr');

export default function() {


  let buttonStart = document.createElement("button");
  buttonStart.appendChild( document.createTextNode("Start") );
  buttonStart.addEventListener("click", function(){
    start();
  });
  document.body.appendChild(buttonStart);


  // let buttonStop = document.createElement("button");
  // buttonStop.appendChild( document.createTextNode("Stop") );
  // buttonStop.addEventListener("click", function(){
  //   //console.log('click');
  // });
  // document.body.appendChild(buttonStop);





  let start = function() {
    navigator.mediaDevices.getUserMedia({  audio: {sampleRate:48000, mimeType : 'audio/ogg', channelCount: 1, volume: 1.0 }  })
      .then(stream => {

//console.log(stream);
//console.log(stream.getTracks());
//console.log(stream.getAudioTracks());



//console.log('--------------------');
        stream.getTracks().forEach(function(track) {
//console.log(track.getSettings());
        })



        const mediaRecorder = new MediaRecorder(stream);

//console.log(mediaRecorder);

        mediaRecorder.start();


        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });



        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
          //const audioUrl = URL.createObjectURL(audioBlob);
//console.log(audioBlob);
          // //console.log(audioUrl);
          var reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = function() {
//console.log(reader);
              var base64data = reader.result;
              ////console.log(base64data);
              var testAudio = `<audio controls><source src="${base64data}"></audio>`
              document.body.insertAdjacentHTML("beforeend", testAudio);
              let requestBody = {
                "audio": {
                  "content": reader.result.split("base64,")[1]
                },
                "config": {
                  "encoding":"OGG_OPUS",
                  "languageCode":"en-US",
                  "sampleRateHertz": 48000
                }
              }
              axios({
                method: 'post',
                url: 'https://speech.googleapis.com/v1/speech:recognize?key=' + AiKy,
                data: requestBody
              })
              .then(function(response) {


                let spokenTxt = response.data.results[0].alternatives[0].transcript;
//console.log(response.data.results[0].alternatives);
//console.log(spokenTxt);

                translate(spokenTxt);
              });
          }
        });
        setTimeout(() => {
          mediaRecorder.stop();
        }, 3000);
      });
  }



  var translate = function(txt) {
    let requestBody = {
      "source":"en",
      "target":"it",
      "q": [ txt ]
    }
    axios({
      method: 'post',
      url: 'https://translation.googleapis.com/language/translate/v2?key=' + AiKy,
      data: requestBody
    })
    .then(function(response) {
      let translatedText = response.data.data.translations[0].translatedText
//console.log(translatedText);
      tts(translatedText);
    });
  }


  var tts = function(txt) {

    let requestBody = {
      "input": {
        "text":txt
      },
      "voice": {
        "languageCode":"it"
      },
      "audioConfig": {
        "audioEncoding":"OGG_OPUS"
      }
    }

    axios({
      method: 'post',
      url: 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=' + AiKy,
      data: requestBody
    })
    .then(function(response) {
      let translatedVoice = "data:audio/ogg; codecs=opus;base64," + response.data.audioContent;
//console.log(translatedVoice);



      let testAudio = `<audio controls><source src="${translatedVoice}"></audio>`
      document.body.insertAdjacentHTML("beforeend", testAudio);
    });

  }

}
