class NeuralNetwork {
  constructor(inputs_, hiddens_, outputs_, function_, learningRate_) {
      this.wIH = new Matrix(hiddens_, inputs_);
      this.wHO = new Matrix(outputs_, hiddens_);
      this.bIH = new Matrix(hiddens_, 1);
      this.bHO = new Matrix(outputs_, 1);

      this.inputNodes = inputs_;
      this.hiddenNodes = hiddens_;
      this.outputNodes = outputs_;

      if (learningRate_) this.learningRate = learningRate_;
      else this.learningRate = 0.1;

      this.sigmoid = x => 1/(1+exp(-x));
      this.relu = x => (x + abs(x)) / 2;
      this.dSigmoid = x => x * (1 - x);
      this.dRelu = x => int(x > 0);

      if (function_ == "relu") {
        this.function = this.relu;
        this.dFunction = this.dRelu;
      } else if (function_ == "sigmoid"){
        this.function = this.sigmoid;
        this.dFunction = this.dSigmoid;
      }
  }

  guess(inputArray) {
    // convert the input array to a matrix
    let inputs = Matrix.toMatrix(inputArray);

    // get the activation valules of the hidden layer
    let hiddedValues = Matrix.multiply(this.wIH, inputs);
    hiddedValues.add(this.bIH);
    hiddedValues.apply(this.function);

    // get the activation of the output layer
    let outputValues = Matrix.multiply(this.wHO, hiddedValues);
    outputValues.add(this.bHO);
    outputValues.apply(this.function);

    return outputValues.to1DArray();
  }

  train(inputArray, targetArray) {
    // 1) feed forward to get the activation values

    // 1.1) convert the input array to a column matrix
    let inputs = Matrix.toMatrix(inputArray);

    // 1.2) get the activation valules of the hidden layer
    let hiddenValues = Matrix.multiply(this.wIH, inputs);
    hiddenValues.add(this.bIH);
    hiddenValues.apply(this.function); // vector

    // 1.3) get the activation of the output layer
    let outputValues = Matrix.multiply(this.wHO, hiddenValues);
    outputValues.add(this.bHO);
    outputValues.apply(this.function); // vector


    // 2) calculate the error at each layer - error = target - output

    // 2.1) covert the target array to a column matrix
    let targets = Matrix.toMatrix(targetArray); // vector

    // error at output layer
    let outputError = Matrix.add(targets, Matrix.multiply(outputValues, -1)); // vector

    // error at hidden layer
    // transposed weight matrix * error matrix = errors at hidden nodes
    // error at layer = weights into layer transposed * layer after error vettor
    let hiddenError = Matrix.multiply(Matrix.transpose(this.wHO), outputError); // vector


    // 3) find the delta values - deltaW = learningRate * next layer error  * sigmoid'(next layer values) * previous layer activation values transposed
    // deltaB = learningRate * current layer error  * sigmoid'(current layer values)

    //3.1) deltas for the Hidden-Output Layer
    let hoGradients = outputValues.copy();
    hoGradients.apply(this.dFunction);
    hoGradients.multiplyElementWise(outputError);
    hoGradients.multiply(this.learningRate);

    let hiddenValuesTransposed = Matrix.transpose(hiddenValues);
    let deltaHO = Matrix.multiply(hoGradients, hiddenValuesTransposed);

    // deltas for the Input-Hidden layer
    let ihGradients = hiddenValues.copy();
    ihGradients.apply(this.dFunction);
    ihGradients.multiplyElementWise(hiddenError);
    ihGradients.multiply(this.learningRate);
    let inputValuesTransposed = Matrix.transpose(inputs);

    let deltaIH = Matrix.multiply(ihGradients, inputValuesTransposed);

    // 4) add on the deltas
    this.bHO.add(hoGradients);
    this.wHO.add(deltaHO);

    this.bIH.add(ihGradients);
    this.wIH.add(deltaIH);
  }
}
