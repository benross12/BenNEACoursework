class Timer {
  constructor() {
    this.startTime;
    this.times = [];
    this.running = false;
  }

  start() {
    if (this.running == false) {
      this.running = true;
      this.startTime = (new Date).getTime();
    }
  }

  getRunTimeMS() {
    return (new Date).getTime() - this.startTime;
  }

  showRunTime() {
    print("ran for " + sum(this.times.copy()) + "ms");
  }

  pause() {
    if (this.running == true) {
      this.running == false;
      this.times.push(this.getRunTimeMS());
    }
  }

  resume() {
    if (this.running == false) {
      this.running = true;
      this.start();
    }
  }

  getRunTimeS() {
    return this.getRunTimeMS() / 1000;
  }
}
