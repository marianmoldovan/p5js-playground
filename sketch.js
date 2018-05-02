var mic
var agent

function setup(){
  createCanvas(windowWidth, windowHeight)
    agent = new Agent()
  mic = new p5.AudioIn()
  mic.start()
}

function draw(){
  let micLevel = mic.getLevel()
  setBackgroundFromMicLevel(micLevel)
  yoff += 0.01
  drawFrontWave(0, 25)
  if(agent.talking) drawFrontWave(255, 0)
  else if(agent.listening) drawFrontWave(color('#a2cae2'), -25)
}

function mousePressed(){
  if(agent.listening) agent.stopListening()
  else agent.listen()
}


var yoff = 0.0;
function drawFrontWave(color, heightOffset){
  fill(color)
  beginShape();
  var xoff = 0;
  let yStartPosition = windowHeight - windowHeight/8
  let yFinalPosition = windowHeight - windowHeight/4 - heightOffset
  for (var x = 0; x <= width; x += 10) {
    var y = map(noise(xoff, yoff), 0, 1, yStartPosition, yFinalPosition);
    vertex(x, y);
    xoff += 0.05;
  }
  // increment y dimension for noise
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function setBackgroundFromMicLevel(micLevel){
  if(!agent.talking){
    let greenLevel = map(micLevel, 0, 1, 0, 255)
    background(100, 100 - greenLevel, 100)
  }
  else background(100, 100, 100)
}
