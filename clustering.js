// returns an array of clusters as arrays of vectors - for KMC to work: there needs to be roughly equal points in each cluster, each cluster needs to be roughly spherical and the variables have the same variance
const getClusters = (k, points, mode) => {
  let centroids = [];
  let clusters = [];
  for (let i = 0; i < k; i++) clusters.push([]);

  // find k random centroids
  if (mode == "order") { // works the best, provided each cluster has similar numbers of points
    let jump = floor(points.length / k);
    let start = floor(random((points.length / k)));
    for (let i = 0; i < k; i++) {
      let pointIndex = start + (jump * i);
      centroids.push(points[pointIndex]);
    }
  } else if (mode == "k++") { // known as k++means clustering
  } else if (mode == "random") { // assumes the clusters are evenly spaced accros the canvas in a line
    for (let i = 0; i < k; i++) {
      let x = (width * (i+1))/(int(k)+1);
      centroids.push(createVector(x, height / 2));
    }
  }
  else { // selects centroids randomly
    while (centroids.length < k) {
      let point = points.sample();

      if (!centroids.includes(point)) centroids.push(point);
    }
  }

  // draw the initial centroids
  // stroke(255, 0, 0);
  // strokeWeight(10);
  // for (let centroid of centroids) point(centroid.x, centroid.y);

  // assign points to initial clusters
  for (let point of points) {
    let distance = 99999;
    let index;
    for (let i = 0; i < centroids.length; i++) {
      let centroid = centroids[i];
      let d = dist(centroid.x, centroid.y, point.x, point.y); // dist could be changed to not have to sqrt the distance and then compare the squares
      if (d < distance) { // the centroid is the closest to the current point
        distance = d;
        index = i;
      }
    }
    clusters[index].push(point);
  }

  // find the new centroids
  for (let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    let averagePoint = createVector(0, 0);
    for (let point of cluster) averagePoint.add(point);

    averagePoint.div(cluster.length);
    centroids[i] = averagePoint;
  }

  // repeat process until there is no change
  change = true;
  let counts = 0;
  while (change) {
    // clear the clusters
    for (let i = 0; i < clusters.length; i++) clusters[i].splice(0, clusters[i].length);

    // assign each point to a cluster
    for (let point of points) {
      let distance = 99999;
      let index;
      for (let i = 0; i < centroids.length; i++) {
        let centroid = centroids[i];
        let d = dist(centroid.x, centroid.y, point.x, point.y);
        if (d < distance) { // the centroid is the closest to the current point
          distance = d;
          index = i;
        }
      }
      clusters[index].push(point);
    }

    // make a copy of and clear the centroids array
    let centroidsCopy = centroids.splice(0, centroids.length);

    // find new centroids
    for (let i = 0; i < clusters.length; i++) {
      let cluster = clusters[i];
      let averagePoint = createVector(0, 0);
      for (let point of cluster) averagePoint.add(point);

      averagePoint.div(clusters[i].length);
      centroids[i] = averagePoint;
    }

    // check for change in the centroids
    let allSame = true;
    for (let centroid of centroids) {
      let contains = false;

      // check if the centroid was in the old array
      for (let c of centroidsCopy) {
        if (c.x = centroid.x && c.y == centroid.y) {
          contains = true;
          break;
        }
      }

      // if the old array isn't the same, then the while loop is done again
      if (!contains) {
        allSame = false;
        break;
      }
    }
    change = !allSame;

    counts++;
    if (counts >= 25) break;
  }

  // draw the centroids
  // stroke(255);
  // strokeWeight(10);
  // for (let centroid of centroids) point(centroid.x, centroid.y);

  return clusters;
}

// get the clusters from the canvas and get the information from them - returns the input values for the nn
const processClusters = (numberOfClusters, points) => {
  // background(51);

  // gather and process the clusters
  // SUGGESTION - make "blank" into "order" - might be a good idea, might not
  let clusters = getClusters(numberOfClusters, points, "blank"); // SUGGESTION could make each cluster have the same number of points and cluster again to remove density bias - repeat this until the original and reduced clusters are the same
  let boxes = getBoxes(clusters); // get the outline (coords of opposite corners) of each cluster - could make a box object to the processing easier
  let squares = getSquares(boxes); // make the outline of each cluster a square
  let scaledClusters = getScaledClusters(squares, clusters); // get the 28x28 grid
  scaledClusters = blurClusters(scaledClusters);

  // draw the clusters
  // drawClusters(clusters);

  // draw the square around each cluster
  // drawOutlines(squares);

  // draw the scaled clusters below the original ones in a 28x28 grid
  // drawGrid(scaledClusters, squares);

  return scaledClusters;
}

function blurClusters(clusters) {
  let output = [];

  for (let cluster of clusters) {
    // create the new 28x28 grid
    let newGrid = [];
    for (let j = 0; j < 28; j++) {
      let row = [];
      for (let k = 0; k < 28; k++) row.push(0);
      newGrid.push(row);
    }

    // for each position in the new grid, look at it's pixel in the old grid
    // the whiteness of it should either be 1, as before or somewhere in between 0 - 1, depending on how many 1 pixels it has around it
    for (let i = 1; i < 27; i++) {
      for (let j = 1; j < 27; j++) {
        if (cluster[i][j] != 1) {
          let neighbours = [];
          neighbours.push(cluster[i - 1][j - 1]);
          neighbours.push(cluster[i - 0][j - 1]);
          neighbours.push(cluster[i + 1][j - 1]);

          neighbours.push(cluster[i - 1][j - 0]);
          neighbours.push(cluster[i + 1][j - 0]);

          neighbours.push(cluster[i - 1][j + 1]);
          neighbours.push(cluster[i - 0][j + 1]);
          neighbours.push(cluster[i + 1][j + 1]);

          let total = 0;
          for (let n of neighbours) total += n; // SUGGESTION - this might be wrong somehow
          newGrid[i][j] = total/8;
        } else {
          newGrid[i][j] = 1;
        }
      }
    }
    output.push(newGrid);
  }
  return output;
}

function drawClusters(clusters) {
  strokeWeight(4);
  for (let i = 0; i < clusters.length; i++) {
    stroke(((i+1)*255)/clusters.length, 100, 150);
    for (let p of clusters[i]) point(p.x, p.y);
  }
}

function drawGrid(scaledClusters, squares) {
  noFill()
  let scale = 10;
  let offset = 200;
  // noStroke();
  strokeWeight(0.5);
  rectMode(CORNER);
  for (let i = 0; i < scaledClusters.length; i++) {
    let scaledCluster = scaledClusters[i];
    let corner = squares[i].min.add(createVector(0, offset));

    for (let j = 0; j < 28; j++) {
      for (let k = 0; k < 28; k++) {
        fill(scaledCluster[j][k] * 255);
        rect(corner.x + scale * j, corner.y + scale * k, scale, scale);
      }
    }
  }
}

function drawOutlines(squares) {
  strokeWeight(2);
  stroke(255);
  noFill();
  rectMode(CORNERS);
  for (let s of squares) { rect(s.min.x, s.min.y, s.max.x, s.max.y); }
}

function getBoxes(clusters) {
  let boxes = [];

  // find the min and max x and y
  for (let cluster of clusters) {
    let pmin = createVector(width, height);
    let pmax = createVector(0, 0);
    for (let p of cluster) {
      if (p.x < pmin.x) pmin.x = p.x;
      if (p.x > pmax.x) pmax.x = p.x;
      if (p.y < pmin.y) pmin.y = p.y;
      if (p.y > pmax.y) pmax.y = p.y;
    }
    let box = {min: pmin, max: pmax};
    boxes.push(box);
  }

  return boxes;
}

function getSquares(boxes) {
  let squares = [];

  for (let box of boxes) {
    let width = round(abs(box.max.x - box.min.x));
    let height = round(abs(box.max.y - box.min.y));

    // make the smallest length the correct size
    if (width > height) {
      let difference = width - height;
      box.min.y -= difference / 2;
      box.max.y += difference / 2;
    } else if (width < height) {
      let difference = height - width;
      box.min.x -= difference / 2;
      box.max.x += difference / 2;
    }

    // ensure there are no points on the lines of the square
    box.min.add(createVector(-1, -1));
    box.max.add(createVector(1, 1));

    squares.push( {min: box.min, max: box.max} );
  }

  return squares;
}

function getScaledClusters(squares, clusters) {
  let scaledClusters = [];

  for (let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    let square = squares[i];

    // makes a 28x28 array filled with 0's
    let scaledCluster = [];
    for (let j = 0; j < 28; j++) {
      let row = [];
      for (let k = 0; k < 28; k++) row.push(0);
      scaledCluster.push(row);
    }

    // finds the index of each point in the array and sets this to white
    let squareWidth = abs(square.max.x - square.min.x);
    let sf = squareWidth / 28;

    for (let p of cluster) {
      // find tile
      let x = floor((p.x - square.min.x) / sf);
      let y = floor((p.y - square.min.y) / sf);

      // set tile to white
      scaledCluster[x][y] = 1;
    }
    scaledClusters.push(scaledCluster);
  }

  return scaledClusters;
}
