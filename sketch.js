var blobs = [];
var pendingBlobs = [];

var width, height;
var centerX,  centerY;

var r = 0;
var g = 0;
var b = 0;
var opacity = 0;
var speedup = 1;
var growth = 0.1;

function setup() {
  width = window.innerWidth, height = window.innerHeight;
  centerX = width/2;
  centerY = height/2;
  createCanvas(width, height);
  // A triangle oscillator
  osc = new p5.TriOsc();
  // Start silent
  osc.start();
  osc.amp(0);
}

// A function to play a note
function playNote(note, duration) {
  osc.freq(midiToFreq(note));
  // Fade it in
  osc.fade(1,0.2);
  // If we sest a duration, fade it out
  if (duration) {
    setTimeout(function() {
      osc.fade(0,0.2);
    }, duration);
  }
}

function draw() {
  background('#111926');
  blobs.forEach(moveNote);
  pendingBlobs.forEach(function(item){
    drawNote(item[0], item[1], item[2]);
  });
  pendingBlobs = [];
}

function moveNote(blob){
  blob.radius += growth;
  blob.x += blob.xdir * speedup;
  blob.y += blob.ydir * speedup;
  console.log(r, g, b, opacity);
  fill((blob.stroke[0] + r) % 255, (blob.stroke[1] + g) % 255, (blob.stroke[1] + b) % 255, opacity);
  stroke(blob.stroke);
  strokeWeight(4);
  if(blob.type === 'rect') rect(blob.x, blob.y, blob.radius, blob.radius);
  else ellipse(blob.x, blob.y, blob.radius, blob.radius);

  if(blob.radius > 250)
    removeX(blobs, blob);

}

function removeX(arr, item) {
  for(var i = arr.length; i--;) {
    if(arr[i] === item) {
      arr.splice(i, 1);
    }
  }
}

function drawNote(note, velocity, type){
    //randomSeed(velocity);
    var border = [random(255),random(255),random(255)];
    var x = centerX + random(-width/4,width/4);
    var y = centerY + random(-width/4,width/4);
    var radius = 5;

    noFill();
    stroke(border);
    strokeWeight(4);

    if(type == 15){
      ellipse(x, y, radius, radius);
      var blob = {'stroke':border, 'x':x, 'y':y, 'radius':radius, 'xdir':random(-1,1), 'ydir':random(-1,1), 'type': 'ellipse'};
      blobs.push(blob);
    }
    else if(type == 9){
      rect(x, y, radius, radius);
      var blob = {'stroke':border, 'x':x, 'y':y, 'radius':radius, 'xdir':random(-1,1), 'ydir':random(-1,1), 'type': 'rect'};
      blobs.push(blob);
    }
}

function changeColors(note, velocity){
  switch (note) {
    case 70:
        opacity = map (velocity, 0, 127, 0, 255);
        break;
    case 21:
        r = map (velocity, 0, 127, 0, 255);
        break;
    case 92:
        g = map (velocity, 0, 127, 0, 255);
        break;
    case 22:
        b = map (velocity, 0, 127, 0, 255);
        break;
    case 20:
        speedup = map (velocity, 0, 127, 0, 10);
        break;
    case 24:
        growth = map (velocity, 0, 127, 0.1, 5);
  }

}

var log = console.log.bind(console),
    midi;

var data, cmd, channel, type, note, velocity;

// request MIDI access
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support in your browser.");
}



// midi functions
function onMIDISuccess(midiAccess) {
    midi = midiAccess;
    var inputs = midi.inputs.values();
    // loop through all inputs
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // listen for midi messages
        input.value.onmidimessage = onMIDIMessage;
        // this just lists our inputs in the console
        listInputs(input);
    }
    // listen for connect/disconnect message
    midi.onstatechange = onStateChange;
}

function onMIDIMessage(event) {
    data = event.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
    note = data[1],
    velocity = data[2];
    // with pressure and tilt off
    // note off: 128, cmd: 8
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11:
    // bend: 224, cmd: 14

    switch (type) {
        case 144: // noteOn message
            drawNote(note, velocity, channel);
            playNote(note);
            break;
        case 128: // noteOff message
            osc.fade(0,0.5);
            break;
        case 176:
            changeColors(note, velocity);
            break;
    }

    console.log(type, note, velocity, channel);
    logger(document.getElementById('logger'), 'key data', data);
}

function onStateChange(event) {
    var port = event.port,
        state = port.state,
        name = port.name,
        type = port.type;
    if (type == "input") console.log("name", name, "port", port, "state", state);
}

function listInputs(inputs) {
    var input = inputs.value;
    log("Input port : [ type:'" + input.type + "' id: '" + input.id +
        "' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
        "' version: '" + input.version + "']");
}

function onMIDIFailure(e) {
    log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}

function logger(container, label, data) {
    //messages = label + " [channel: " + (data[0] & 0xf) + ", cmd: " + (data[0] >> 4) + ", type: " + (data[0] & 0xf0) + " , note: " + data[1] + " , velocity: " + data[2] + "]";
    //container.textContent = messages;
}
