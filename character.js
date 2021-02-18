class Character {
  constructor() {
    this.pos = createVector(random(width), random(height));

    this.col = floor(random(colours.length));
    this.rad = 25;

    this.particles = [];

    this.targetLocation = createVector(random(width), random(height));
    this.targetStreak = 0;

    this.enemyPos = createVector(random(width), random(height));
    this.enemyVel = createVector();
    this.alive = true;
  }

  show() {
    if (currentScreen == "startMenu") {
      showStartMenu();

      if (this.alive) {
        // display the character
        imageMode(CENTER);
        image(characterImage, this.pos.x, this.pos.y, 100, 150);

        // display the target
        imageMode(CENTER);
        image(targetImage, this.targetLocation.x, this.targetLocation.y, 70, 70);
        noFill();
        circle(this.targetLocation.x, this.targetLocation.y, 70); // hitbox

        // display the enemy
        imageMode(CENTER);
        image(enemyImage, this.enemyPos.x, this.enemyPos.y, 70, 70);
        noFill();
        circle(this.enemyPos.x, this.enemyPos.y, 70); // hitbox
      }

      // display the particles
      noStroke();
      let cols = colours[this.col].toString().split(',');
      let red = cols[0].split('(')[1];
      let green = cols[1];
      let blue = cols[2];
      fill(255 - int(red), 255 - int(green), 255 - int(blue))
      for (let p of this.particles) circle(p.x, p.y, 8);
    }
  }

  update() {
    // move the emeny
    this.enemyVel = p5.Vector.sub(createVector(mouseX, mouseY), this.enemyPos).normalize().mult(1);
    this.enemyPos.add(this.enemyVel);

    if (this.alive) {
      // move the character
      this.pos = createVector(mouseX, mouseY);

      // check for overlaps between the two
      if (p5.Vector.sub(this.enemyPos, this.pos).magSq() < 35 * 35) {
        this.alive = false;

        // reset the particles and have them all around the death position
        this.particles = [];
        let numberOfParticles = 150;
        for (let i = 0; i < numberOfParticles; i++) {
          let v = p5.Vector.random2D().mult(random(numberOfParticles));
          this.particles.push(v.add(this.pos));
        }
      }
    }
  }

  randomiseTargetPosition() {
    this.targetLocation = createVector(random(width), random(height));
  }

  onClick() {
    // change the backgorund colour
    let pCol = this.col;
    while(pCol == this.col) {
      this.col = floor(random(colours.length));
    }


    if (this.alive) {
      // add more particles
      let numberOfParticles = 50;
      for (let i = 0; i < numberOfParticles; i++) {
        let range = 20;
        let x = this.pos.x += random(-range, range);
        let y = this.pos.y += random(-range, range);
        this.particles.push(createVector(x, y));
      }
      while (this.particles.length > numberOfParticles * 4) {
        this.particles.splice(floor(random(this.particles.length)), int(numberOfParticles / 10));
      }
    }

    // target clicked
    if (dist(mouseX, mouseY, this.targetLocation.x, this.targetLocation.y) < 35) {
      this.targetStreak++;
      if (this.targetStreak % 5 == 0) {
        // land on one of the gamemodes
        let p;
        if (random() < 0.5) { // land on easy mode
          p = createVector(width / 4, height / 1.5);
        } else { // land on hard mode
          p = createVector((width * 3) / 4, height / 1.5);
        }
        p.add(p5.Vector.random2D().mult(30)); // SUGGESTION - make this lower than 30 so the button covers the target
        this.targetLocation = p;
      }
      else {
        this.randomiseTargetPosition();
      }
    }

    // SUGGESTION - work out what this does
    // let bCol = p5.Vector.random3D().mult(255);
    // fill(255 - bCol.x, bCol.y, bCol.z);
    // rect(width / 2, height / 2, 50, 50)
    // fill(255 - bCol.x, 255 - bCol.y, 255 - bCol.z);
    // rect(width / 2 - 50, height / 2, 50, 50)
  }

  resetGame() {
    this.randomiseTargetPosition();
    this.alive = true;
    this.particles = [];
  }
}
