// module.exports.node = {
//   child_process: 'empty'
// }

//const speech = require('@google-cloud/speech');
//const {auth} = require('google-auth-library');
//const fs = require('fs')

//var GetUserMediaToText = require('getusermedia-to-text')

const axios = require('axios');

const AiKy = "AIzaSyCqb9QdYoScP2xdLkD_kJkfS9wWAknvCNI";

var MediaStreamRecorder = require('msr');

export default function() {

  var appDiv = document.getElementById('app-speech');

  let buttonWav = document.createElement("button");
  buttonWav.appendChild( document.createTextNode("Wav") );
  buttonWav.addEventListener("click", function(){
    startWav();
  });
  appDiv.appendChild(buttonWav);

  let buttonNative = document.createElement("button");
  buttonNative.appendChild( document.createTextNode("Native") );
  buttonNative.addEventListener("click", function(){
    startNative();
  });
  //appDiv.appendChild(buttonNative);



  var blobResolver = function(audioBlob) {
    var reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = function() {
      var base64data = reader.result;
      ////console.log(base64data);
      var testAudio = `<p>captured ::<p><audio controls><source src="${base64data}"></audio>`
      //appDiv.insertAdjacentHTML("beforeend", testAudio);
      stt(base64data);
    }
  }



  var stt = function(audioBase64) {
    audioBase64 = audioBase64.split("base64,");
    let audioBase64Type = audioBase64[0];
    let audioBase64Body = audioBase64[1];
    audioBase64 = false;
    //console.log(audioBase64Type);
    let requestBody = {};
    switch (audioBase64Type) {
      case "data:audio/wav;" :
        requestBody = {
          "audio": {
            "content": audioBase64Body
          },
          "config": {
            "languageCode":"en"
          }
        }
        break;
      case "data:audio/ogg; codecs=opus;" :
        requestBody = {
          "audio": {
            "content": audioBase64Body
          },
          "config": {
            "encoding":"OGG_OPUS",
            "languageCode":"en-US",
            "sampleRateHertz": 48000
          }
        }
        break;
      default:
        console.log('unknown type');
    }
    axios({
      method: 'post',
      url: 'https://speech.googleapis.com/v1/speech:recognize?key=' + AiKy,
      data: requestBody
    })
    .then(function(response) {
      let transcript = response.data.results[0].alternatives[0].transcript;
      console.log(transcript);
      translate(transcript);
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
      let testAudio = `<audio controls><source src="${translatedVoice}"></audio>`
      appDiv.insertAdjacentHTML("beforeend", testAudio);
    });
  }




  var startWav = function() {
    var mediaConstraints = {
      audio: true,
      channelCount: 1,
      sampleRate:48000
    };
    navigator.getUserMedia(mediaConstraints, onMediaSuccess, function(err){console.log('getUserMedia error ::', err)});
    function onMediaSuccess(stream) {
      var mediaRecorder = new MediaStreamRecorder(stream);
      mediaRecorder.mimeType = 'audio/wav';
      //mediaRecorder.mimeType = 'audio/pcm';
      //mediaRecorder.mimeType = 'audio/ogg';
      mediaRecorder.audioChannels = 1;
      let blobs = [];
      mediaRecorder.ondataavailable = function (blob) {
        blobs.push(blob);
      };
      mediaRecorder.onstop  = function () {
        console.log("onstop");
        let theBlob = new Blob(blobs, { 'type' : 'audio/wav' });
        console.log("blobs", blobs);
        console.log("theBlob", theBlob);
        blobResolver(theBlob);
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 10000);
    }
    function onMediaError(e) {
      console.error('media error', e);
    }
  }



  let startNative = function() {
    // mimeType : 'audio/ogg',
    navigator.mediaDevices.getUserMedia({  audio: {
      autoGainControl: false,
      channelCount: 1,
      //echoCancellation: true,
      //latency: 0.0,
      //noiseSuppression: true,
      sampleSize: 200,
      sampleRate:48000,
      volume: 1.0
    }})
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      const audioChunks = [];
      mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });
      // https://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/
      mediaRecorder.addEventListener("stop", () => {
        // 'type' : 'audio/ogg; codecs=opus'
        const audioBlob = new Blob(audioChunks, {'type' : 'audio/ogg; codecs=opus'});
        console.log("chunks", audioChunks);
        console.log("theBlob", audioBlob);
        blobResolver(audioBlob);
      });
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000);
    });
  }

}
