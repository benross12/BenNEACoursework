class Matrix {
  constructor(rows_, cols_, random) { // this needs sorting out
    if (random == undefined || random != typeof Object) random = {randomMode: ""}
    else if (random.randomMode == undefined) random.randomMode = "";

    if (typeof random.randomMode != "string") random.randomMode = "";

    if (typeof rows_ != "number" || typeof cols_ != "number") {rows_ = 0; cols_ = 0;}

    this.rows = floor(rows_);
    this.cols = floor(cols_);
    this.data = [];

    for (let i = 0; i < this.rows; i++) this.data[i] = [];

    if (random.randomMode == "integer") this.intRan(random.constraints);
    else this.ran(random.constraints);
  }

  static isVector() { return this.cols == 1; }

  printMat() {
    print("Rows - " + this.rows);
    print("Cols - " + this.cols);

    for (let i = 0; i < this.rows; i++) {
      let rowIndex = "Row " + String(i) + ") ";
      let rowArray = [];

      for (let j = 0; j < this.cols; j++) {
        let char = this.data[i][j];
        if (char >= 0) char = " " + String(char);
        rowArray.push(" " + String(char));
      }
      print(rowIndex + rowArray);
    }
  }

  ran(n) {
    if (n == undefined || typeof n != 'number') n = 1;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = random(-n, n);
      }
    }
  }

  intRan(n) {
    if (n == undefined || typeof n != 'number') n = 1;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = floor(random(-n, n + 1));
      }
    }
  }

  copy() {
    let newRows = this.rows;
    let newCols = this.cols;
    let newMatrix = new Matrix(newRows, newCols);

    for (let i = 0; i < newMatrix.rows; i++) {
      for (let j = 0; j < newMatrix.cols; j++) {
        newMatrix.data[i][j] = this.data[i][j];
      }
    }
    return newMatrix;
  }

  static transpose(other) {
    let newMatrix = new Matrix(other.cols, other.rows);

    for (let i = 0; i < other.cols; i++) {
      for (let j = 0; j < other.rows; j++) {
        newMatrix.data[i][j] = other.data[j][i];
      }
    }
    return newMatrix;
  }

  returnRow(n) { if (typeof n == 'number') return this.data[floor(n)]; }

  returnColumn(n) {
    if (typeof n != 'number') return undefined
    let array = [];
    for (let i = 0; i < this.rows; i++) {
      array.push(this.data[i][floor(n)]);
    }
    return array;
  }

  add(other) {
    if (other instanceof Matrix) {
      if (other.rows == this.rows && other.cols == this.cols) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            this.data[i][j] += other.data[i][j];
          }
        }
      } else {
        print("Matrix was wrong size");
      }
    } else if (typeof other == "number") {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += other;
        }
      }
    }
  }

  static add(a, b) {
    if (a instanceof Matrix) {
      if (b instanceof Matrix) {
        if (a.rows == b.rows && a.cols == b.cols) {
          let newMatrix = new Matrix(a.rows, a.cols);
          for (let i = 0; i < newMatrix.rows; i++) {
            for (let j = 0; j < newMatrix.cols; j++) {
              newMatrix.data[i][j] = a.data[i][j] + b.data[i][j];
            }
          }
          return newMatrix;
        }
      } else if (typeof b == "number") {
        let newMatrix = new Matrix(a.rows, a.cols);
        for (let i = 0; i < newMatrix.rows; i++) {
          for (let j = 0; j < newMatrix.cols; j++) {
            newMatrix.data[i][j] = a.data[i][j] + b;
          }
        }
        return newMatrix;
      }
    }
  }

  to2DArray() { return this.data; }

  to1DArray() {
    let newArray = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newArray.push(this.data[i][j]);
      }
    }
    return newArray;
  }

  static toMatrix(array) {
    if (array instanceof Array) {
      array = array.filter(elt => typeof elt == 'number');
      let newMat = new Matrix(array.length, 1);
      for (let i = 0; i < array.length; i++) newMat.data[i][0] = array[i];
      return newMat;
    }
  }

  static createMatrix(rows, cols, data) {
    if (!(data instanceof Array) || typeof rows != 'number' || typeof cols != 'number') return undefined;

    data = data.filter(elt => typeof elt == 'number');
    if (data.length != rows * cols) return undefined;

    let newMat = new Matrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let index = i * cols + j;
        newMat.data[i][j] = data[index];
      }
    }
    return newMat;
  }

  multiply(other) {
    if (typeof other == "number") {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= other;
        }
      }
    } else {
      return undefined;
    }
  }

  // there are more efficient algorithms for this
  static multiply(a, b) {
    if (a instanceof Matrix) {
      if (b instanceof Matrix) {
        if (a.cols == b.rows) {
          let newMat = new Matrix(a.rows, b.cols);
          for (let i = 0; i < newMat.rows; i++) {
            for (let j = 0; j < newMat.cols; j++) {
              let row = a.returnRow(i);
              let col = b.returnColumn(j);
              let value = 0;

              for (let x = 0; x < row.length; x++) {
                value += row[x] * col[x];
              }

              newMat.data[i][j] = value;
            }
          }
          return newMat;
        } else return undefined;
      } else if (typeof b == "number") {
        let newMat = new Matrix(a.rows, a.cols);
        for (let i = 0; i < newMat.rows; i++) {
          for (let j = 0; j < newMat.cols; j++) {
            newMat.data[i][j] = a.data[i][j] * b;
          }
        }
        return newMat;
      }
    }
  }

  apply(f) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = f(this.data[i][j]);
      }
    }
  }

  static equalSize(a, b) { return a.rows == b.rows && a.cols == b.cols; }

  multiplyElementWise(a) {
    if (a instanceof Matrix) {
      if (Matrix.equalSize(a, this)) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            this.data[i][j] *= a.data[i][j];
          }
        }
      }
    }
  }

  // the result from this function will need to be trimmed - the zero padding removed
  static newMultiply(a, b) {
    // check the multiplication is valid
    if (a.cols != b.rows) { print("dimensions rejected"); return undefined; };

    // if they are not squares and powers of 2, pad the matrix out - this works
    if (a.rows != a.cols || a.rows != b.rows || a.rows != b.cols || !powerOfTwo(a.rows)) {
        // find the higest dimensions of a and b;
        let highest = max(max(a.rows, a.cols), max(b.rows, b.cols));

        // find the power of two higher than it
        let power = ceil(Math.log2(highest));
        power = 2**power;
        let newA = [], newB = [];

        // loop through each element, if its in the original matrix then add it to the new one, if not stick a 0 in there
        for (let i = 0; i < power; i++) {
            for (let j = 0; j < power; j++) {
              if (i < a.rows && j < a.cols) newA.push(a.data[i][j]);
              else { newA.push(0); }
            }
        }
        a = Matrix.createMatrix(power, power, newA);

        // do the same for b
        for (let i = 0; i < power; i++) {
            for (let j = 0; j < power; j++) {
              if (i < b.rows && j < b.cols) newB.push(b.data[i][j]);
              else { newB.push(0); }
            }
        }
        b = Matrix.createMatrix(power, power, newB);
    }

    // if the dimensions are 2, multiply the matrices and return the output - this works
    let total = a.rows + b.rows + a.cols + b.cols;
    if (total == 8) { // if all the rows and cols are 2
      let cValues = [];
      let mValues = [];

      mValues.push((a.data[0][0] + a.data[1][1]) * (b.data[0][0] + b.data[1][1])); // M1
      mValues.push((a.data[1][0] + a.data[1][1]) * b.data[0][0]);                  // M2
      mValues.push(a.data[0][0] * (b.data[0][1] - b.data[1][1]));                  // M3
      mValues.push(a.data[1][1] * (b.data[1][0] - b.data[0][0]));                  // M4
      mValues.push((a.data[0][0] + a.data[0][1]) * b.data[1][1]);                  // M5
      mValues.push((a.data[1][0] - a.data[0][0]) * (b.data[0][0] + b.data[0][1])); // M6
      mValues.push((a.data[0][1] - a.data[1][1]) * (b.data[1][0] + b.data[1][1])); // M7

      cValues.push(mValues[0] + mValues[3] - mValues[4] + mValues[6]);             // C11
      cValues.push(mValues[2] + mValues[4]);                                       // C12
      cValues.push(mValues[1] + mValues[3]);                                       // C21
      cValues.push(mValues[0] - mValues[1] + mValues[2] + mValues[5]);             // C22

      return Matrix.createMatrix(2, 2, cValues);
    } else {
      // maybe check here if either of them are completely zero - just return them

      // the dimensions of all the new matrices
      let dim = a.rows / 2;

      // copy the data from a and b into 4 new matrices
      let data = [];

      let aMatrices = [];
      let bMatrices = [];

      // top left
      for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) data.push(a.data[i][j]);
      aMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // top right
      for (let i = 0; i < dim; i++) for (let j = dim; j < dim * 2; j++) data.push(a.data[i][j]);
      aMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // bottom left
      for (let i = dim; i < dim * 2; i++) for (let j = 0; j < dim; j++) data.push(a.data[i][j]);
      aMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // bottom right
      for (let i = dim; i < dim * 2; i++) for (let j = dim; j < dim * 2; j++) data.push(a.data[i][j]);
      aMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // top left
      for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) data.push(b.data[i][j]);
      bMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // top right
      for (let i = 0; i < dim; i++) for (let j = dim; j < dim * 2; j++) data.push(b.data[i][j]);
      bMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // bottom left
      for (let i = dim; i < dim * 2; i++) for (let j = 0; j < dim; j++) data.push(b.data[i][j]);
      bMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      // bottom right
      for (let i = dim; i < dim * 2; i++) for (let j = dim; j < dim * 2; j++) data.push(b.data[i][j]);
      bMatrices.push(Matrix.createMatrix(dim, dim, data));
      data = [];

      //  repeat the mValues thing above but call the multiplations recursively
      // 11 = 0, 12 = 1, 21 = 2, 22 = 3
      let mValues = [];
      let cValues = [];

      // might need to check the order of the matrix multiplication, also the actual a and b order
      mValues.push(Matrix.newMultiply(Matrix.add(aMatrices[0], aMatrices[3]), Matrix.add(bMatrices[0], bMatrices[3])));
      mValues.push(Matrix.newMultiply(Matrix.add(aMatrices[2], aMatrices[3]), bMatrices[0]));
      mValues.push(Matrix.newMultiply(aMatrices[0], Matrix.add(bMatrices[1], Matrix.multiply(bMatrices[3], -1))));
      mValues.push(Matrix.newMultiply(aMatrices[3], Matrix.add(bMatrices[2], Matrix.multiply(bMatrices[0], -1))));
      mValues.push(Matrix.newMultiply(Matrix.add(aMatrices[0], aMatrices[1]), bMatrices[3]));
      mValues.push(Matrix.newMultiply(Matrix.add(aMatrices[2], Matrix.multiply(aMatrices[0], -1)), Matrix.add(bMatrices[0], bMatrices[1])));
      mValues.push(Matrix.newMultiply(Matrix.add(aMatrices[1], Matrix.multiply(aMatrices[3], -1)), Matrix.add(bMatrices[2], bMatrices[3])));

      // 0 + 3 - 4 + 6
      cValues.push(Matrix.sum([mValues[0], mValues[3], Matrix.multiply(mValues[4], -1), mValues[6]]));
      // 2 + 4
      cValues.push(Matrix.add(mValues[2], mValues[4]));
      // 1 + 3
      cValues.push(Matrix.add(mValues[1], mValues[3]));
      // 0 - 1 + 2 + 5
      cValues.push(Matrix.sum([mValues[0], Matrix.multiply(mValues[1], -1), mValues[2], mValues[5]]));

      let cData = [];
      cValues = cValues.map(x => x.to1DArray());
      for (let i = 0; i < dim; i++) {
        let arr = cValues[0].splice(0, dim);
        for (let elt of arr) cData.push(elt);
        arr = cValues[1].splice(0, dim);
        for (let elt of arr) cData.push(elt);
      }
      for (let i = 0; i < dim; i++) {
        let arr = cValues[2].splice(0, dim);
        for (let elt of arr) cData.push(elt);
        arr = cValues[3].splice(0, dim);
        for (let elt of arr) cData.push(elt);
      }
      return Matrix.createMatrix(dim * 2, dim * 2, cData);
    }
    // if they are not 2 make the new matrices and call the function again - maybe check if one of them is a zero matrix and just return another 0 matrix
  }

  // recursively sums an array of matrices
  static sum(array) {
    if (array.length == 1) return array[0];
    else return Matrix.add(array[0], Matrix.sum(array.slice(1)));
  }

  static trim(a, w, h) {
    let data = [];
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < a.cols; j++) {
        if (i < w && j < h) data.push(a.data[i][j])
      }
    }
    return Matrix.createMatrix(w, h, data);
  }
}



/*
constructor(number of rows, number of columns, {options})
number of rows - integer;
number of columns - integer;

if the dimensions aren't valid, the matrix becomes a 1 x 1;

optional options object-
randomMode - "integer" / "decimal"
constraints - what value to randomise to (-/+)

if anything within the object is invalid, including the object itself, it uses decimal up to 1
if randomMode is undefined, decimal is automically used
if constraints is undefined, 1 is automatically used
*/

/*
a.printMat()
prints the number of rows and columns
formats then prints the matrix
*/

/*
a.ran(n)
randomises matrix with decimal values between -n and n
if n is left blank it is automically set to 1
*/

/*
a.intRan(n)
randomises the matrix with integers from -n to n
if n is left blank it is automically set to 1
*/

/*
a.copy()
returns a copy of the a, used to assist static functions
*/

/*
Matrix.transpose(a)
returns the transposed matrix of a
*/

/*
a.returnRow(n)
returns the nth row of a, starting from 0
*/

/*
a.returnColumn(n)
returns the nth column of a, starting from 0
*/

/*
a.add(n)
if n is a matrix, function adds, elementswise, n to a, provided they have the same dimensions
if n is a number, function adds that value to each element of a
*/

/*
Matrix.add(a, n)
a must be a Matrix
if n is a matrix, function adds elementwise and returns a new matrix, without changing a and n
if n is a number functin adds the number to each element to a and returns new matrix, without change a and n
*/

/*
a.to2DArray()
returns the data of the matrix as a 2D array
*/

/*
a.to1DArray()
returns the data of the matrix as a 1D array
*/

/*
Matrix.toMatrix(a)
returns column matrix of the input 1D array
*/

/*
Matrix.createMatrix(rows, cols, [data])
creates new Matrix with rows and cols
data must have number of elements as the matrix does (rows * cols)
goes along each row then down each column
*/

/*
a.multiply(n)
if n is a number, multiplies each index of a by n
*/

/*
Matrix.multiply(a, b)
a must be a matrix
if b is a matrix, returns a x b of matrix multiplication
if b is a number, returns a new matrix of each element of a multiplied by b
*/

/*
  a.apply(f)
  f must be a function
  applies the function f to every element of a
*/
