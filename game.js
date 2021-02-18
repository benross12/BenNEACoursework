let questions;
let scoreStreak = 2, score = 0;
let currentQuestion;
let incorrectNumbers = new Array(100).fill(0);
let c;

const format = (options) => {
  // the fill of the shape
  if (options.color == "none") noFill();
  else {
    let colors = options.color.split(",").parseFloat();
    fill(colors[0], colors[1], colors[2]);
  }

  // the outline of the shape
  if (options.outline == "none") noStroke();
  else {
    // set the color
    let lineColors = options.outline.split(",").parseFloat();
    stroke(lineColors[0], lineColors[1], lineColors[2]);

    // set the weight
    if (options.outlineThickness) strokeWeight(options.outlineThickness);
  }

}

const formatText = (options) => {
  // the main color of the text
  if (options.color == "none") noFill();
  else {
    let colors = options.color.split(",").parseFloat();
    fill(colors[0], colors[1], colors[2]);
  }

  // the outline of the text
  if (options.outline == "none") noStroke()
  else {
    let outlineColors = options.outline.split(",").parseFloat();
    stroke(outlineColors[0], outlineColors[1], outlineColors[2]);
  }

  // the size of the text
  if (options.size) textSize(options.size);

  // the position of the text
  if (options.align) textAlign(options.align);

  // the font of the text
  if (options.font) textFont(options.font);

  // the style of the text
  if (options.style) textStyle(options.style);

  if (options.outlineThickness) strokeWeight(options.outlineThickness);
}

const updateCharacter = () => {
  c.update();
  c.show();
}

const showStartMenu = () => {
  background(colours[c.col]);
  currentScreen = "startMenu";

  // show text
  formatText({color: "100, 100, 255", size: 64, align: CENTER, outline: "255, 255, 255", style: BOLD, outlineThickness: 2});
  if (c.alive) text("Press your gamemode!", width / 2, height / 3);
  else {
    text("You lost!", width / 2, height / 3);
    formatText({color: "100, 100, 255", size: 32, align: CENTER, outline: "255, 255, 255", style: BOLD, outlineThickness: 2});
    text("Play a game to have another go!", width / 2, height / 3 + 100);
  }

  // gamemode buttons
  format({color: "none", outline: "255, 255, 255", outlineThickness: 5});
  rectMode(CENTER);
  rect(width / 4, height / 1.5, 300, 100);
  rect((width * 3) / 4, height / 1.5, 300, 100);

  // gamemode button text
  formatText({color: "100, 100, 255", size: 50, align: CENTER, outline: "255, 255, 255", style: NORMAL, outlineThickness: 1});
  text('EASY', width / 4, (height / 1.5) + 20);
  text('HARD', (width * 3) / 4, (height / 1.5) + 20);
}

const showFinishScreen = () => {
  background(colours[c.col]);

  // exit button
  format({color: "200, 50, 50", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width * 0.1, height * 0.1, 150, 100);
  formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("Exit", width * 0.1, height * 0.1 + 8);

  // final score text
  format({color: "none", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width / 2, height / 2, 500, 100);
  formatText({color: "255, 255, 255", size: 25, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("Your final score was " +  score + ", Well Done!", width / 2, height / 2 + 5);

  // feedback on letters incorrect - SUGGESTION find the worst one and other analysis
  print(incorrectNumbers);
  formatText({color: "255, 255, 255", size: 25, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("The questions you got wrong were - ", width / 2, height / 2 + 100);

  let feedback = [];
  for (let i = 0; i < incorrectNumbers.length; i++) {
    if (incorrectNumbers[i] == 1) feedback.push(i + " wrong " + incorrectNumbers[i] + " time, ");
    else if (incorrectNumbers[i] > 1) feedback.push(i + " wrong " + incorrectNumbers[i] + " times, ");
  }
  if (feedback.length > 0) {
    let last = str(feedback.pop());
    feedback.push(last.substring(0, last.length - 2));
  }
  let verticalAlign = 500;
  text(feedback, width / 2, height / 2 + 130 + (verticalAlign / 2), width * (2/3), verticalAlign);
  incorrectNumbers = new Array(100).fill(0);
}

const showEasyScreen = () => {
  background(colours[c.col]);

  // input box
  format({color: "none", outline: "255, 0, 0", outlineThickness: 10});
  rectMode(CENTER);
  rect(width / 2, height / 2, width / 1.5, height / 2);

  // submit box
  format({color: "150, 150, 150", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width / 2, height * 0.9, 300, 100);
  formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("Submit", width / 2, height * 0.9 + 8);

  // repeat question button
  format({color: "150, 200, 100", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width * 0.9, height * 0.9, 150, 100);
  formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("Repeat", width * 0.9, height * 0.9 + 8);

  // score
  format({color: "none", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width * 0.9, height * 0.1, 150, 100);
  formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text(score, width * 0.9, height * 0.1 + 8);

  // text display
  if (scoreStreak < 2) {
    format({color: "none", outline: "255, 255, 255", outlineThickness: 3});
    rectMode(CENTER);
    rect(width / 2, height * 0.1, 300, 100);
    formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
    text("Enter \'" + currentQuestion + "\'", width / 2, height * 0.1 + 8);
  }

  // clear button
  format({color: "10, 10, 10", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width * 0.1, height * 0.9, 150, 100);
  formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("Clear", width * 0.1, height * 0.9 + 8);

  // exit button
  format({color: "200, 50, 50", outline: "255, 255, 255", outlineThickness: 3});
  rectMode(CENTER);
  rect(width * 0.1, height * 0.1, 150, 100);
  formatText({color: "255, 255, 255", size: 32, align: CENTER, outline: "none", style: NORMAL, outlineThickness: 3});
  text("Exit", width * 0.1, height * 0.1 + 8);
}

const startMenuClicked = () => {
  // "easy button" - kicks off the easy gamemode
  if (abs(mouseX - (width / 4)) < 150 && abs(mouseY - (height / 1.5)) < 50) {
    currentScreen = "easyMode";
    playEasy();
  }
  // "hard button" - kicks off the hard gamemode
  else if (abs(mouseX - ((3 * width) / 4)) < 150 && abs(mouseY - (height / 1.5)) < 50) {
    currentScreen = "hardMode";
    playHard();
  }
  // no button - interacts with character
  else c.onClick();
}

const easyModeClicked = () => {
  // submit button
  if (abs(mouseX - (width / 2)) < 150 && abs(mouseY - (height * 0.9)) < 50) {
    // get the number(s) drawn
    let ans;
    if (currentQuestion > 9) {
      g = getGuesses(2);
      ans = g[0].value * 10 + g[1].value; // SUGGESTION - might need to check the digits the other way round
    } else {
      ans = getGuesses(1)[0].value;
    }
    print("guess - ", ans);

    // if the answer is correct
    if (ans == currentQuestion) {
      score += 100;
      score += (currentScreen == "hardMode") * 100;
      scoreStreak++;
    } else { // if the answer is incorrect
      scoreStreak = 0;
      score -= 50;
      questions.unshift(currentQuestion);
      incorrectNumbers[currentQuestion]++;
    }

    // check if the game is over or if there are more questions
    if (questions.length > 0) nextQuestion(questions.splice(0, 1));
    else {
      showEasyScreen();
      gameFinished();
    }
  }

  // repeat question button
  if (abs(mouseX - (width * 0.9)) < 50 && abs(mouseY - (height * 0.9)) < 50) {
    speak(currentQuestion);
  }

  // clear button
  if (abs(mouseX - (width * 0.1)) < 50 && abs(mouseY - (height * 0.9)) < 50) {
    mousePoints = [];
    showEasyScreen();
  }

  // exit button
  if (abs(mouseX - (width * 0.1)) < 50 && abs(mouseY - (height * 0.1)) < 50) {
    currentScreen = "startMenu";
    score = 0;
    scoreStreak = 0;
    incorrectNumbers = new Array(100).fill(0);

    c.resetGame();
    showStartMenu();
  }
}

const finishScreenClicked = () => {
  // exit button
  if (abs(mouseX - (width * 0.1)) < 50 && abs(mouseY - (height * 0.1)) < 50) {
    currentScreen = "startMenu";
    score = 0;
    scoreStreak = 0;
    let incorrectNumbers = new Array(100).fill(0);

    c.resetGame();
    showStartMenu();
  }
}

const playEasy = () => {
  // initialise the array of questions
  questions = getQuestions("easy");

  // start the first question
  nextQuestion(questions.splice(0, 1)[0]);
}

const playHard = () => {
  // initialise the array of questions
  questions = getQuestions("hard");

  // start the first question
  nextQuestion(questions.splice(0, 1)[0]);
}

const nextQuestion = question => {
  // clear the previous question and start the next one
  mousePoints = [];
  currentQuestion = question;
  speak(question);
  showEasyScreen();
}

const getQuestions = mode => {
  let output = [];

  let range = 0; // the highest number in the questions
  let repeats = 1; // the number of times each number is repeated

  if (mode == "easy") for (let i = 0; i <= range; i++) for (let j = 0; j < repeats; j++) output.push(i);
  else if (mode == "hard") for (let j = 0; j <= range; j++) output.push(floor(random(100)));

  return output;
}

const gameFinished = () => {
  currentScreen = "finish";

  showFinishScreen();

  print("final score - " +  score);
}

const speak = x => window.speechSynthesis.speak(new SpeechSynthesisUtterance(str(x)));

/*
const easyModeClicked = () => {
  print("points - " + round(mousePoints.length / (width / 100)));

  // submit button
  if (abs(mouseX - (width / 2)) < 150 && abs(mouseY - (height * 0.9)) < 50) {
    // predict what the number drawn is
    let ans = getGuesses(1)[0].value;
    print("guess - " + ans);

    // if the answer is correct
    if (ans == currentQuestion) {
      score += 100;
      score += (currentScreen == "hardMode") * 100;
      scoreStreak++;
    } else { // if the answer is incorrect
      scoreStreak = 0;
      score -= 50;
      questions.unshift(currentQuestion);
      incorrectNumbers[currentQuestion]++;
    }

    // check if the game is over or if there are more questions
    if (questions.length > 0) nextQuestion(questions.splice(0, 1));
    else {
      showEasyScreen();
      gameFinished();
    }
  }

  // repeat question button
  if (abs(mouseX - (width * 0.9)) < 50 && abs(mouseY - (height * 0.9)) < 50) {
    speak(currentQuestion);
  }

  // clear button
  if (abs(mouseX - (width * 0.1)) < 50 && abs(mouseY - (height * 0.9)) < 50) {
    mousePoints = [];
    showEasyScreen();
  }

  // exit button
  if (abs(mouseX - (width * 0.1)) < 50 && abs(mouseY - (height * 0.1)) < 50) {
    currentScreen = "startMenu";
    score = 0;
    scoreStreak = 0;
    incorrectNumbers = new Array(100).fill(0);

    c.resetGame();
    showStartMenu();
  }
}
*/
