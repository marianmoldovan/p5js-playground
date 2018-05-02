class Agent {
    constructor () {
      this.talking = false
      this.listening = false
      AWS.config.region = 'eu-west-1'
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'eu-west-1:76daa066-aa5f-4028-8fbb-9842b35f74e3',
      })
      this.lexruntime = new AWS.LexRuntime()
    }

    listen(){
      this.listening = true
      this.speechRecognizer = new p5.SpeechRec('en')
      this.speechRecognizer.onResult = (result) => {
        this.listening = false
        this.nlu(this.speechRecognizer.resultString)
      }
      this.speechRecognizer.start()
    }

    stopListening(){
      this.speechRecognizer.rec.stop()
      this.listening = false
    }

    say(text){
      this.fetchVoice(text).then(voiceData => {
        let speakAudio = new Audio(voiceData.voice)
        speakAudio.play()
        speakAudio.addEventListener('ended', () => {
          this.talking = false
        })
        this.talking = true
        //let sound = loadSound(voiceData.voice, soundFile => soundFile.play())
      })
    }

    nlu(text){
      var params = {
					botAlias: 'dev',
					botName: 'PersonalBot',
					inputText: text,
					userId: 'test',
					sessionAttributes: {}
				}
			this.lexruntime.postText(params, (err, data)  => {
				if (err) {
					console.log(err, err.stack);
				}
				if (data) {
          this.say(data.message)
				}
			})
    }

    fetchVoice(text){
      return fetch('https://ui1nahmgd3.execute-api.eu-west-1.amazonaws.com/dev/polly-cors', {
        method: 'POST',
        body: JSON.stringify({
          'voice': 'Emma',
          'text': text
        })
      }).then(response => response.json());
    }
}
