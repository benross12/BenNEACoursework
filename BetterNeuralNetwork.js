class BetterNeuralNetwork {
  constructor(inputs_, hiddens_, outputs_, function_, learningRate_, dFunction_) {
    // save the number of nodes of each layer
    this.numberOfInputs = inputs_;
    this.numberOfHiddens = [];
    for (let i = 0; i < hiddens_.length; i++) this.numberOfHiddens.push(hiddens_[i]);
    this.numberOfOutputs = outputs_;

    // initialse the learning rate
    this.learningRate = learningRate_;

    // set the function and function derrivative
    if (function_ == "sigmoid")  {
      this.function = x => 1/(1+exp(-x));
      this.dFunction = x => x * (1 - x);
    }
    else if (function_ == "zero/one") {
      this.function = x => {
        if (x >= 0) return 1;
        else return 0;
      };
      this.dFunction = x => 0;
    }
    else if (function_ == "relu") {
      this.function = x => (x > 0) * x;
      this.dFunction = x => int(x > 0);
    } else {
      // custom function for cool kids
      this.function = function_;
      this.dFunction = dFunction_;
    }

    // initialse the array of weights and biases
    this.weights = [];
    this.biases = [];

    // input layer
    this.weights.push(new Matrix(this.numberOfHiddens[0], this.numberOfInputs));
    this.biases.push(new Matrix(this.numberOfHiddens[0], 1));

    // all the hidden layers
    for (let i = 1; i < this.numberOfHiddens.length; i++) {
      this.weights.push(new Matrix(this.numberOfHiddens[i], this.numberOfHiddens[i - 1]))
      this.biases.push(new Matrix(this.numberOfHiddens[i], 1));
    }

    // output layer
    this.weights.push(new Matrix(this.numberOfOutputs, this.numberOfHiddens.peek()));
    this.biases.push(new Matrix(this.numberOfOutputs, 1));
  }

  feedForward(inputArray) {
    // activation values of the next layer = function(weights from layer before to next layer * activationValues of layer before + biases of next layer)
    let activationValues = [];

    // the input values are easier to deal with out of the loop
    let inputs = Matrix.toMatrix(inputArray);
    let firstHiddenLayerActivationValues = Matrix.multiply(this.weights[0], inputs);
    firstHiddenLayerActivationValues.add(this.biases[0]);
    firstHiddenLayerActivationValues.apply(this.function);
    activationValues.push(firstHiddenLayerActivationValues);

    // find the rest of the activation values
    for (let i = 1; i < this.weights.length; i++) {
      let layerActivationValues = Matrix.multiply(this.weights[i], activationValues[i - 1]); // returns null?
      layerActivationValues.add(this.biases[i]);
      layerActivationValues.apply(this.function);
      activationValues.push(layerActivationValues);
    }

    return activationValues.pop().to1DArray();
  }

  train(inputArray, targetArray) {
    // 1) get the actiation values of each layer
    let activationValues = [];

    // the input values are easier to deal with out of the loop
    let inputs = Matrix.toMatrix(inputArray);
    let firstHiddenLayerActivationValues = Matrix.multiply(this.weights[0], inputs);
    firstHiddenLayerActivationValues.add(this.biases[0]);
    firstHiddenLayerActivationValues.apply(this.function);
    activationValues.push(firstHiddenLayerActivationValues);

    // find the rest of the activation values
    for (let i = 1; i < this.weights.length; i++) {
      let layerActivationValues = Matrix.multiply(this.weights[i], activationValues[i - 1]); // returns null?
      layerActivationValues.add(this.biases[i]);
      layerActivationValues.apply(this.function);
      activationValues.push(layerActivationValues);
    }

    // 2) get the error at each layer
    // error at layer = weights into layer transposed * layer after error vector
    let errors = [];

    // the output values are easier to deal with out of the loop
    let targets = Matrix.toMatrix(targetArray);
    let outputErrors = Matrix.add(targets, Matrix.multiply(activationValues.peek(), -1));
    errors.push(outputErrors);

    // get the rest of the error values
    for (let i = 1; i <= this.numberOfHiddens.length; i++) {
      let weightMatrixTransposed = Matrix.transpose(this.weights[this.weights.length - i]); // probably right?
      let errorVector = errors.peek(); // error of the layer in front

      // put the errors in the array from the outputs backwards
      errors.push(Matrix.multiply(weightMatrixTransposed, errorVector)); // might need to be the other way round
    }
    // order the array from input layer to output
    errors.reverse();

    // 3) find the delta weight and bias matrices
    // deltaW = learningRate * next layer error  * sigmoid'(next layer values) * previous layer activation values transposed
    // deltaB = learningRate * current layer error  * sigmoid'(current layer values)
    let deltaWeights = [];
    let deltaBiases = [];

    // againt its easier to deal with the input layer first (previous layer can't be iterated)
    let deltaB = activationValues[0].copy();
    deltaB.apply(this.dFunction);
    deltaB.multiply(this.learningRate);
    deltaB.multiplyElementWise(errors[0]);
    deltaBiases.push(deltaB);

    let activationValuesT = Matrix.transpose(inputs);
    let deltaW = Matrix.multiply(deltaB, activationValuesT);
    deltaWeights.push(deltaW);

    // then the rest
    for (let i = 1; i <= this.numberOfHiddens.length; i++) {
      deltaB = activationValues[i].copy();
      deltaB.apply(this.dFunction);
      deltaB.multiply(this.learningRate);
      deltaB.multiplyElementWise(errors[i]);
      deltaBiases.push(deltaB);

      let activationValuesT = Matrix.transpose(activationValues[i - 1]);
      let deltaW = Matrix.multiply(deltaB, activationValuesT);
      deltaWeights.push(deltaW);
    }

    // 4) add the delta values to the weight matrices
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i].add(deltaWeights[i]);
      this.biases[i].add(deltaBiases[i]);
    }
  }

  // very rough and inaccurate but does the job if I don't want to
  static calculateNumberOfHiddenNodes(numberOfInputs, numberOfOutputs, numberOfLayers) {
    let numberOfNodes = [numberOfInputs];
    let power = floor(Math.log2(numberOfInputs));

    for (let i = 0; i < numberOfLayers; i++) {
      let powerOfTwo = 2**power;
      if (powerOfTwo > numberOfOutputs) numberOfNodes.push(powerOfTwo);
      else numberOfNodes.push(numberOfOutputs);
      power--;
    }
    numberOfNodes.shift();

    return numberOfNodes;
  }

  static loadFromFile(result, function_, learningRate_, dFunction_) {
    if (!function_) function_ = "sigmoid";
    if (!learningRate_) learningRate_ = 0.1;

    // get the data from the top line
    let metaData = result[0];
    metaData = metaData.split(",");
    metaData.pop();

    // separate the lines containing the weights and the biases
    let weightLines = [];
    let biasLines = [];
    for (let i = 1; i < metaData.length; i++) weightLines.push(result[i].split(",").removeLastElement());
    for (let i = metaData.length; i < result.length; i++) biasLines.push(result[i].split(",").removeLastElement());

    // initialse the new nn - might need to change the layer parameters
    let hiddenNumbers = [];
    for (let i = 1; i < metaData.length - 1; i++) hiddenNumbers.push(metaData[i]); // could use a slice function
    let output = new BetterNeuralNetwork(metaData[0], hiddenNumbers, metaData.peek(), function_, learningRate_, dFunction_);
    output.weights = [];
    output.biases = [];

    // for each layer
    for (let i = 0; i < metaData.length - 1; i++) {
      // create a new matrix and set this as the weights of the correct layer
      let m = Matrix.createMatrix(int(metaData[i + 1]), int(metaData[i]), weightLines[i].parseFloat());
      output.weights.push(m);

      // create a new matrix and set this as the biases of the correct layer
      let b = Matrix.createMatrix(int(metaData[i + 1]), 1, biasLines[i].parseFloat());
      output.biases.push(b);
    }

    return output;
  }

  writeToFile(fileName) {
    const sw = createWriter(fileName + ".txt");

    // write the number of layers and the numbers of nodes in each layer
    let line = this.numberOfInputs + ",";
    for (let m of this.weights) line += m.rows + ",";
    sw.print(line);

    // for each matrix in weights
    for (let m of this.weights) {
      line = "";

      // get all the weights as an array - this reads along a row then down 1 column
      let mWeights = m.to1DArray();
      for (let w of mWeights) line += (w + ",");

      // write that line to file
      sw.print(line);
    }

    for (let b of this.biases) {
      line = "";

      // get the biases as an array
      let bWeights = b.to1DArray();
      for (let w of bWeights) line += (w + ",");

      // write line to file
      sw.print(line);
    }

    sw.close();
    sw.clear();
  }
}
