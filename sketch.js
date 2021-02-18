/*
  file:///C:/Users/benro/Desktop/p5/p5/NN%20Library%20Testing/index.html

  relu is roughly 2x as fast in BNN

  where dist() is used this could be changed so that it doesn't have to do the square root function

  instead of adding more points to the array when they are drawn, add the points after we find the size of the square - the number of points should
  vary based on this number - current bodge varies the number of points by the size of the window

  try mini batching for a more effective training process
  maybe add letters
  add some sounds
  make everything bigger and "bolder"
  if the certainty of an answer is above a threshold, the user recieves extra points and feedback at the end
  get rid of the bit that draws a dot when you select a gamemode
  any suggestions in code
  maybe add some kind of leaderboard that keeps a track of all the scores
  
*/

let mousePoints = [];
let testData = [];
let trainData = [];
let nnFromFile = [];
let colours = [];
let currentScreen;
let characterImage, targetImage, enemyImage;

function mouseDragged() {
  stroke(255);
  strokeWeight(2);

  // hold mouse to add new points
  // only let the user draw within the red box
  if (abs(mouseX - (width / 2)) < (width / 3) && abs(mouseY - (height / 2)) < (height / 4)) {
    let centre = createVector(mouseX, mouseY);
    mousePoints.push(centre);
    point(mousePoints.peek());

    // add random points around each mouse press to make a "thicker" line
    let numberOfPoints = width / 100;
    for (let i = 0; i < numberOfPoints; i++) {
      let d = numberOfPoints * 3;
      mousePoints.push(createVector(centre.x + random(d), centre.y + random(d)));
    }
  }
}

function mousePressed() {
  if (mouseX > width || mouseY > height) c.moveTarget();

  // vary the functionality depending on the current state
  if (currentScreen == "startMenu") startMenuClicked();
  if (currentScreen == "easyMode" || currentScreen == "hardMode") easyModeClicked();
  if (currentScreen == "finish") finishScreenClicked();
}

function keyPressed() {
  let numberOfClusters = undefined;
  if (isDigit(key) && key != 0) { // press a number to get that many clusters
    numberOfClusters = key;
  }
  else if (key == " ") { // press space to cluster the points drawn

    background(51);

    // get the clusters
    let clusters = getClusters(3, mousePoints);
    print("found " +  clusters.length + " clusters!");

    // find the minimum length of the clusters
    let min = 99999;
    for (let cluster of clusters) if (cluster.length < min) min = cluster.length;

    // make each cluster than length
    // randomly remove elements from the array
    for (let cluster of clusters) {
      while (cluster.length > min) {
        let index = floor(random(cluster.length));
        cluster.splice(index, 1);
      }
    }

    // draw the reduced clusters
    strokeWeight(4);
    for (let i = 0; i < clusters.length; i++) {
      stroke(((i+1)*255)/clusters.length, 100, 150);
      // print(clusters[i].length);
      for (let p of clusters[i]) point(p.x, p.y);
    }
  }
  else if (key == "r") { // press r to reset
    mousePoints = [];
    background(51);
    print("points cleared");
  }
  else if (key == "i") { // press i to get a user input of the number of clusters
    numberOfClusters = window.prompt("number of clusters - ");
  }

  if (numberOfClusters) for (let guess of getGuesses(numberOfClusters)) print(guess.value + " - " + round(guess.confidence * 100) + "% sure")
}

function preload() {
  let folder = "Files/"
  let mode = "game";
  let model = "eight" + ".txt";

  if (mode == "train") {
    // loads in the training data
    trainData = loadStrings(folder + "Train Data.csv", () => {
      trainData.removeLastElement();
      print("training data loaded")
    });
  } else if (mode == "test"){
    // loads in the testing data
    testData = loadStrings(folder + "Test Data.csv", () =>  {
      testData.removeLastElement();
      print("testing data loaded");
    });

    // loads in the saved weights of the neural network
    nnFromFile = loadStrings(folder + model, () => {
      nnFromFile.removeLastElement();
      nnFromFile = BetterNeuralNetwork.loadFromFile(nnFromFile);
      print("nn data loaded")
    });
  } else if (mode == "game"){
    // loads in the saved weights of the neural network
    nnFromFile = loadStrings(folder + model, () => {
      nnFromFile.removeLastElement();
      nnFromFile = BetterNeuralNetwork.loadFromFile(nnFromFile);
      print("nn data loaded")
    });

    characterImage = loadImage(folder + "character.png");
    targetImage = loadImage(folder + "target.png");
    enemyImage = loadImage(folder + "enemy.png");
  } else if (mode == "train existing"){
    // loads in the training data
    trainData = loadStrings(folder + "Train Data.csv", () => {
      trainData.removeLastElement();
      print("training data loaded")
    });

    // loads in the saved weights of the neural network
    nnFromFile = loadStrings(folder + model, () => {
      nnFromFile.removeLastElement();
      nnFromFile = BetterNeuralNetwork.loadFromFile(nnFromFile);
      print("nn data loaded")
    });
  }
}

function setup() {
  createCanvas(windowWidth * 0.95, windowHeight * 0.95);

  // begin the game
  makeColours();
  c = new Character();
  showStartMenu();

  // draws a random digit from test data
  // drawRandomDigit();

  // test the nn
  // testNeuralNetwork();

  // train a new model
  // trainNeuralNetwork();

  // draw a circle from google quickdraw dataset
  // drawGoogleCircle();
}

function draw() {
  // update the character object
  updateCharacter();
}

function makeColours() {
  colours.push(color(255 - 145, 255- 52, 255 - 7));
  colours.push(color(13,124,249));
  colours.push(color(41,137,144));
  colours.push(color(255 - 226, 255 - 125, 255 - 96));
  colours.push(color(255 - 246, 255 - 76, 255 - 114));
}

function drawGoogleCircle() {
  createCanvas(1500, 1500);
  background(51);
  stroke(255);
  strokeWeight(4);
  noFill();

  let drawObject = loadJSON("Files/" + "full_raw_circle.ndjson", () =>  {
    print("object loaded");
    print(drawObject);

    // array 0 is the x coord
    // array 1 is the y coord
    // array 2 is a time value
    let xarr = drawObject.drawing[0][0];
    let yarr = drawObject.drawing[0][1];

    beginShape();
    for (let i = 0; i < xarr.length; i++) vertex(xarr[i] - 400, yarr[i]);
    endShape();
  });
}

function trainNeuralNetwork() {
  // all sigmoid
  // "one" - 1 epoch - 784/500/10 - 53%
  // "two" - 1 epoch - 784/600/10/10 - 15% - 5'494'445ms
  // "three" - 4 epochs - 784/500/10 - 74% - 17'453'707ms - seems to work best on user inputs
  // "four" - 1 epochs - 784/64/16/10 - 24% - 620'728ms
  // "five" - 10 epochs - 784/64/16/10 - 72% - about hour and 40
  // "six" - 50 epochs - 784/64/16/10 - 89% - 29'944'408ms - doesn't work great with user inputs
  // "seven" - 1 epochs - 784/256/64/16/10 - % -
  // "eight" - 13 epochs - 784/256/64/16/10 - 86% - 33'828'079ms - has some trouble with 2s
  // "eight.2" - 13 + 14 epochs - 784/256/64/16/10 - 10% - 33'828'079 + 40'885'998 ms - tried diminishing learningRate, thinks everything is a five
  // "nine" - 15 epochs -  784/256/128/64/32/16/10 - 18% - 48'179'784ms
  // "ten" - - 784/3000/10

  let nn = new BetterNeuralNetwork(784, [256, 128, 64, 32, 16], 10, "sigmoid", 0.0001);

  let t = new Timer();
  t.start();

  let epochSize = trainData.length;
  let epochs = 15;

  for (let epoch = 0; epoch < epochs; epoch++) {
    // nnFromFile.learningRate *= 0.9 // for training existing
    for (let i = 0; i < epochSize; i++) {
      // get the whole piece of data
      let data = trainData[i];
      data = data.split(",").parseFloat();

      // remove the label from the data
      let label = data.splice(0, 1); // this isn't the input target

      // create the target array
      let target = [];
      for (let j = 0; j < 10; j++) target.push(0);
      target[label] = 1;

      // nnFromFile.train(data, target); // for training existing
      nn.train(data, target);
      if (i % 10 == 0) print(i);
    }
    print("epoch - " + (epoch+1) + " done!")
  }

  print("training finished");
  nn.writeToFile("nine");
  // nnFromFile.writeToFile("eight.2");

  t.pause();
  t.showRunTime();
}

function testNeuralNetwork() {
  let t = new Timer();
  t.start();
  let totalCorrect = 0;
  for (let x = 0; x < testData.length; x++) {
    let data = testData[x].split(",").parseFloat();
    let label = data.splice(0, 1)[0];

    let output = nnFromFile.feedForward(data);
    let result = 0, max = 0;
    for (let i = 0; i < output.length; i++) {
      if (output[i] > max) {
        max = output[i];
        result = i;
      }
    }

    if (result == label) totalCorrect++;
    if (x % 10 == 0) print(x);
  }
  print(totalCorrect);
  print(round((totalCorrect * 100) / testData.length) +  '%');
  t.pause();
  t.showRunTime();
}

function drawRandomDigit() {
  createCanvas(1500, 1500);
  background(51);
  stroke(255);
  strokeWeight(4);
  noFill();

  let data = testData.sample().split(",").parseFloat();
  let label = data.splice(0, 1)[0];
  let scale = 10;

  push()
  translate(width * 0.4, height * 0.4);
  noStroke();
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      let index = i * 28 + j;

      fill(data[index]);
      rect(i * scale, j * scale, 28, 28)
    }
  }
  pop();
}

function getGuesses(numberOfClusters) {
  // get the clusters as normalised grids
  // SUGGESTION - repeat this process for each method of clustering and then select the answers that match each other
  let letterGrids = processClusters(numberOfClusters, mousePoints.slice(10, mousePoints.length));
  print("letter grids");
  print(letterGrids);

  // turn each 2d array into a single 1d array
  let letterColumns = [];
  for (let grid of letterGrids) {
    let col = [];
    for (let i = 0; i < 28; i++) for (let j = 0; j < 28; j++) col.push(grid[i][j] * 255);
    letterColumns.push(col);
  }

  // guess what number each of the clusters is
  let guesses = [];
  for (let input of letterColumns) {
    let result = nnFromFile.feedForward(input);

    // find the highest probability
    let max = 0;
    let index;
    for (let i = 0; i < result.length; i++) {
      if (result[i] > max) {
        index = i;
        max = result[i];
      }
    }
    guesses.push({value: index, confidence: max});
  }

  // nice
  if (guesses.length == 2) if (int(guesses[0].value) == 6 && int(guesses[1].value) == 9) print("nice");

  return guesses;
}
