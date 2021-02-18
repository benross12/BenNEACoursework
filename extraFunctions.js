// returns true if the character is a digit
function isDigit(x) { return x == 0 || x == 1 || x == 2 || x == 3 || x == 4 || x == 5 || x == 6 || x == 7 || x == 8 || x == 9; }

// removes the last element of an array
Array.prototype.removeLastElement = function () {
  this.pop();
  return this;
};

// returns true if x is a power of two
function powerOfTwo(x) {
  return (x & (x - 1)) == 0;
}

// sums an array of numbers
function sum(arr) {
  if (arr.length == 0) return 0;
  else return arr.splice(0, 1)[0] + sum(arr);
}

// returns the last element of an array
Array.prototype.peek = function() {
  return this[this.length - 1];
}

// converts all elements to a float
Array.prototype.parseFloat = function () { return this.map(x => float(x)); }

// return a random element of the array
Array.prototype.sample = function() { return this[floor(random(this.length))]; }

// a different sort algorithm - needs to be done
Array.prototype.mergeSort = function() {
  return;
}

// copy an array
Array.prototype.copy = function() {
  let newArray = [];
  for (let i = 0; i < this.length; i++) { newArray.push(this[i]); }
  return newArray;
}

// removes elements of a set type
Array.prototype.removeTypeOf = function(type) {
  return this.filter((elt) => typeof elt != type);
}

// leaves elements of a set type
Array.prototype.leaveTypeOf = function(type) {
  return this.filter((elt) => typeof elt == type);
}

// generates every permuation of an array
const everyPerm = function(input) {
  if (input instanceof Array != true) return;

  input = input.leaveTypeOf('number');
  let len = input.length;
  if (len < 2) return input;

  let loops = recursiveFactorial(len);
  let allPerms = [];

  // copy input to order
  let order = [];
  for (let i = 0; i < len; i++) {
    order[i] = input[i];
  }

  // push every different permuation to the array
  for (let i = 0; i < loops; i++) {
    allPerms.push(order.copy());
    order = newLexOrder(order);
  }

  // create an object with the permutations
  let output = {
    permuations: allPerms,
    numberOfPermutations: loops,
    original: input
  }

  return output;
}

// generates the next permutation - used for everyPerm()
const newLexOrder = function(current) {
  // step 1 - find furthest right element that the element on it's left is less than it
  let i = -1;
  for (let a = current.length - 1; a > 0; a--) {
    if (current[a - 1] < current[a]) {
      i = a;
      break;
    }
  }
  if (i == -1) return;

  // step 2
  let j;
  for (let x = current.length - 1; x >= i; x--) {
    if (current[x] > current[i - 1]) {
      j = x;
      break;
    }
  }

  // step 3
  let temp = current[j];
  current[j] = current[i - 1];
  current[i - 1] = temp;

  //step 4;
  let reverseArray = [];
  for (let x = current.length - 1; x >= i; x--) {
    reverseArray.push(current[x]);
  }
  for (let x = i; x < current.length; x ++) {
    current[x] = reverseArray[x - i];
  }
  return current;
}

// generates the factorial of a number recursively
const recursiveFactorial = function(n) {
  if (n == 1) return 1
  return n * recursiveFactorial(n - 1);
}

// generates the factorial of a number iteratively
const itererativeFactorial = function(n) {
  let value = 1;
  for (let i = 1; i <= n; i++) value *= i;
  return value;
}

// draws a circle at (x,y) with radius rad
const myCircle = function(x, y, rad) {
  push();
  translate(x, y);

  beginShape();
  for (let i = 0; i < TWO_PI; i+=PI/100) {
    let cx = rad * cos(i);
    let cy = rad * sin(i);

    vertex(cx, cy);
  }
  endShape();

  pop();
}

// draws a ellipse at (x,y) with width rad1 and height rad2
const myEllipse = function(x, y, rad1, rad2) {
  if (rad2 == undefined) rad2 = rad1;

  push();
  translate(x, y);

  beginShape();
  for (let i = 0; i < TWO_PI; i+=PI/100) {
    let cx = rad1 * cos(i);
    let cy = rad2 * sin(i);

    vertex(cx, cy);
  }
  endShape();

  pop();
}

// a bit redundant - returns a copy of the array input
const copyArray = function(input) {
  let newArray = [];
  for (let i = 0; i < input.length; i++) {
     newArray.push(input[i]);
  }
  return newArray;
}
