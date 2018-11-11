'use strict';
const clonedeep = require('lodash.clonedeep');
const cytoscape = require('cytoscape');


class GraphOps {
  constructor(nodes) {
    this.cy = cytoscape({
    });
    M = nodes.length;
    //Randomly generates nodes in a 1000x1000 square.
    //Constructs nodes
    for (var i = 0; i < M; i++) {
        this.cy.add({
            //Node naming convention is _node_(number).  This is so these can be compiled easily into unique edge names.
            data: { id: '_node_' + i},
            position: {x: nodes[i][0], y: nodes[i][1]},
            }
        );
    }
    //Makes edges connecting node 0 to 1, node 1 to 2, and so-on
    for (var i = 0; i < M-1; i++) {
      var source = '_node_' + i;
      var target ='_node_' + (i+1);
      var xd = this.cy.$('#'+target).position().x - this.cy.$('#'+source).position().x;
      var yd = this.cy.$('#'+target).position().y - this.cy.$('#'+source).position().y;
      //Adds weight to the edges
      var weight = (xd**2 + yd**2)**(1/2);
        this.cy.add({
            data: { id: source+target,
            target: target,
            source: source,
            weight: weight,
            label: weight
            }
        });
    }
  }

  getweight(source,target){
/*
Description: Gets weight of an edge between a source and target node, with the weight
being the Euclidian distance as defined by the Pythagorean formula

Arguments:
source: The ID of the source node
target: The ID of the target node

Returns:
weight: The Euclidian distance between the two nodes
*/
    //Gets the x and y distance btween the two nodes
    var xd = this.cy.$('#'+target).position().x - this.cy.$('#'+source).position().x;
    var yd = this.cy.$('#'+target).position().y - this.cy.$('#'+source).position().y;
    //Uses Pythagorean formula to find the Euclidian distance between the two nodes and stores it in weight
    var weight = (xd**2 + yd**2)**(1/2);
    //Returns the distance as weight
    return weight;
  }

  connectcheck(graph){
  /*
  Description: Checks if the grpah is connected by using a breadth first search
  and comparing the number of nodes found vs. the total number of numnodes

  Arguments:
  graph: The graph to be evaluated

  Returns:
  connected: Boolean variable. true if connected, false if not
  */

    //Initializes variables
    var bfsarray = [];
    var connected = false;

    //Run breadth first search on the graph starting from an arbitrary node 1.  This will return all nodes visited.
    var bfs = this.cy.elements().bfs({
      roots: '#_node_1',
      visit: function(v, e, u, i, depth){
        bfsarray.push(v.id());
      },
      directed: false
    });

    //If the number of nodes visited is the number of total nodes, then the graph is connected
    if (bfsarray.length == this.cy.nodes().length){
      connected = true;
    }
    return connected;
  }

  randomstep(graph,bridges){
  /*
  Description: Takes a random step by removing or adding an edge.  The odds of removing
  or adding an edge are proportional to the number of edges that can be added or removed.
  The resulting graph must be connected and any added edges must be unique and not form loops.

  Arguments:
  graph: the graph to be changed
  bridges: the number of bridges in the particular graph
  */

    //Initializes variables
    var edgearray = [];
    var endwhile = false;
    var numedges = this.cy.edges().length;
    var numnodes = this.cy.nodes().length;
    /*
    Get odds of removing an edge, which is defined as the number of edges that
    can be removed divided by the number of edges that can be removed plus
    the number of edges that can be added
    */
    var remodds = (numedges-bridges)/(numnodes*(numnodes-1)/2-bridges);
    //Make an array of the edge IDs
    for (var i = 0; i < numedges; i++) {
      edgearray.push(this.cy.edges()[i].data("id"));
    }
    //While loop to do random step
    while (endwhile == false){
      //Use a uniform distribution to decide to remove or add
      var rem = Math.random() < remodds;;
      //If remove is true, then remove an edge.
      if (rem == true){
        var connected = false;
        //While loop that ends when an edge is removed and graph is connected
        while (connected == false){
          //Decide the edge to delete
          var edgdel = Math.floor(Math.random()*numedges);
          //Remove the edge and store the removed edge
          this.removedelements = this.cy.$('#'+edgearray[edgdel]).remove();
          //Check if the graph is connected
          if (this.connectcheck(graph.cy)==true){
            connected = true;
          } else {
            //If it's not connected, restore the removed edge
            this.removedelements.restore();
          }
        }
        //End the loop and exit the function
        endwhile = true;
        //If remove is false, then add an edge
      } else if (rem ==false){
        //Variable to determine if the edge added is unique
        var uniqedge = false;
        //Loop that ends when a unique edge is added
        while (uniqedge == false){
          var boolhold = true;
          //Choose random nodes to connect
          var source = '_node_' + Math.floor(Math.random()*numnodes);
          var target = '_node_' + Math.floor(Math.random()*numnodes);
          //Get edge IDs for the connected nodes.  Ordered so that the lower-indexed node is first.
          if (source > target){
            var edgeid = target+source;
          } else{
            var edgeid = source+target;
          }
          //Checks for unique edge names.  If not unique, keep looping
          for (var i = 0; i < numedges; i++){
            if (edgeid == edgearray[i]){
              boolhold = false;
            } else if (source == target){
              boolhold = false;
            }
          }
          //Stop looping if edge is unique
          uniqedge = boolhold;
        }
        //Add the edge after calculating the weight
        var weight = this.getweight(source, target);
        this.cy.add({
            data: { id: edgeid,
            target: target,
            source: source,
            weight: weight,
            label: weight
            }
        });
        //End loop and exit function
        endwhile = true;
      }
    }
  }
  getbridges(graph){
  /*
  Description: Gets the number of bridges in the graph by removing edges and checking
  if the graph is still connected.

  Arguments:
  graph: The graph to be evaluated

  Returns:
  numbridges: The number of bridges, an integer
  */
    //Initialize variables
    var numedges = this.cy.edges().length;
    var numbridges = 0;
    //Runs loop that removes an edge and checks if the graph is connected
    for (var i = 0; i < numedges; i++){
      var edgeid = this.cy.edges()[i].data("id");
      //Removes edge
      this.removedelements = this.cy.$('#'+edgeid).remove();
      //Checks if connected
      var connected = this.connectcheck(graph.cy);
      //If not connected, add to the number of bridges
      if (connected == false){
        numbridges++;
      }
      //Restore the edge before starting the next iteration
      this.removedelements.restore();
    }
    //Returns numbridges, the number of bridges
    return numbridges;
  }

  adjacency(graph){
  /*
  Description: Creates an adjacency matrix for a graph.

  Arguments:
  graph: The graph to be evaluated

  Returns:
  Adj: The adjacency matrix of the graph, stored as a 2D array
  */

    //Initializes array
    var edgeid, weight, splitid, n1, n2;
    var Adj = [];
    for (var i = 0; i < this.cy.nodes().length; i++){
      Adj[i] =[];
      for (var j = 0; j < this.cy.nodes().length; j++){
        Adj[i][j] = 0;
      }
    }
    //Adds the edges to the arrays
    for (i = 0; i < this.cy.edges().length; i++){
      //Gets IDs and weights
      edgeid = this.cy.edges()[i].data("id");
      weight = this.cy.edges()[i].data("weight");
      //Splits edge IDs to get node numbers
      splitid = edgeid.split("_");
      //Populate the array with weights of the edges at the appropiate position
      n1 = splitid[2];
      n2 = splitid[4];
      Adj[n1][n2] = weight;
      Adj[n2][n1] = weight;

    }
    //Returns Adj, the adjacency matrix
    return Adj;
  }

  makecopy(){
    /*
    Description: Makes a copy of the graph using lodash's clonedeep function
    */
    //Make copy of graph
    this.cy2 = clonedeep(this.cy);
  }

  theta(graph,r){
    /*
    Description: Calculates theta for a graph, which is the sum of the weights of
    all edges multiplied by a constant added to the sum of distances of the shortest path
    from an arbitrary source node to all other nodes.

    Arguments:
    graph: the graph to be evaluated
    r: A constant that weighs the value of the sum of all edge weights in the calculation of theta

    Returns:
    Theta: The value of the theta function
    */

    //Runs dijkstra algorithm to get the distance of a random source node to other nodes
    var dijkstra = this.cy.elements().dijkstra('#_node_' + Math.floor(Math.random()*this.cy.nodes().length), function(edge){
      return edge.data('weight');
    });
    //Declares and nitializes variables
    var sumweights = 0;
    var path = 0;
    //Gets the sum of all edge weights
    for (var i = 0; i < this.cy.edges().length; i++){
      sumweights += this.cy.edges()[i].data("weight");
    }
    //Multiples the sum of the edge weights by r
    sumweights *= r;
    //Run dijkstra's algorithm to find the distance from the source node to all other nodes
    for (i = 0; i < this.cy.nodes().length; i++){
      //Sum the distances
      path += dijkstra.distanceTo(this.cy.$('#_node_'+i));
    }
    //Returns theta, which is the sum of the dijkstra and total path weights
    return path+sumweights;
  }

  maxshortestpath(graph){
    /*
    Description: Finds the maximum shortest path length from the zeroth node
    to another node.

    Arguments:
    graph: The graph to be evaluated

    Returns:
    maxval: The maximum shortest path length from the zeroth node to another
    */

    //Initializes variables
    var maxshort = [];
    //Dijkstra with node 0 as the originator
    var dijkstra = this.cy.elements().dijkstra('#_node_0', function(edge){
    return edge.data('weight');
    });
    //Finds the shortest path from node 0 to each node
    for (var i = 0; i < this.cy.nodes().length; i++){
      maxshort.push(dijkstra.distanceTo(this.cy.$('#_node_'+i)));
    }
    //Finds the maximum value of the shortest paths from node 0 to each other node
    var maxval = Math.max(...maxshort);
    //Returns maxval, the maximum distance of the shortest path that connects node 0 to another node
    return maxval;
  }
  edgeanalysis(){
    /*
    Description: Analyzes the edges of a graph to determine the number of
    edges attached to the zeroth node and the number of total edges in the graph

    Arguments:
    The graph to be evaluated

    Returns:
    zeroedges: The number of edges attached to the zeroth node
    numedges: The total number of edges in the graph
    */

    //Gets number of total edges
    var numedges = this.cy.edges().length;
    //Gets the ID of the zeroth node
    var z = this.cy.$('#_node_0');
    //Finds the number of edges connected to the zeroth node
    var zeroedges = z.connectedEdges().length;
    //Returns (as an array) the number of edges connected to the zeroth node and the total number of edges
    return [zeroedges, numedges];
  }


}

function AcRej(theta1,theta2,b1,b2,M,T){
/*
Description: Determines if a graph should be accepted or rejected based on
the the q and pi ratios, where the probabiltiy of acceptance is min(1,qratio*piratio)

Arguments:
theta1, theta2: Theta values for the graphs to be evaluated.  Theta2 applies to the new graph
b1, b2: Number of bridges for both graphs.  b2 applies to the new graph.
M: The number of numnodes
T: The temperature.  A higher temperature makes it easier to accept a graph

Returns:
true if accepted, false if rejected
*/

  //Gets the pi ratio
  var pirat = Math.exp(-(theta2-theta1)/T);
  //Gets probability of going to i to j
  var qji = 1/(M*(M-1)/2-b1);
  //Probability of going from j to i
  var qij = 1/(M*(M-1)/2-b2);
  //Ratio of the q values
  var qrat = qij/qji;
  //Gets acceptance probability
  var probji = qrat*pirat;
  var u = Math.random();
  //Compares acceptance probability to random value.  Accept if it is grather than or equal.  Returns whether to accept or not.
  if (u <= probji){
    return true;
  } else {
    return false;
  }
}

function methastings(r,M,T,N,graph){
/*
Description: Iterates the metropolis hastings algorithm on the graph and populates arrays
with the appropriate data to be analyzed.

Arguments:
r: the value that weighs the importance of the weight of all edges.  higher r makes the total weight count more.
M: total number of numnodes
T: temperature, for which higher means it is easier to accept a graphs
N: the number of iterations
graph: the initial graph to be evaluated

Returns:
adjarray: an array containing all accepted adjaceny adjacency matrices
maxshortpath: an array containing all of the maximum shortest paths that connect node 0
to another node in each accepted graph
zedges: an array the edges connected to the zeroth node in each accepted graph
totaledges: an array containing the total edges in each accepted graph

*/
  //Declares variables and initializes where necessary
  var accrej = true;
  var adjarray = [];
  var maxshortpath = [];
  var zedges = [];
  var totaledges = [];
  var b1, theta1, b2, theta2;
  //Loop that executes N number of random steps
  for (var i = 0; i < N; i++){

    //Gets number of bridges and theta in first state
    b1 = graph.getbridges(graph.cy);
    theta1 = graph.theta(graph.cy,r);
    //Makes a copy of the graph
    graph.makecopy();
    //Takes a random step
    graph.randomstep(graph.cy, b1);
    //Gets number of bridges and theta for the new graph
    b2 = graph.getbridges(graph.cy);
    theta2 = graph.theta(graph.cy,r);
    //Decide if to accept or reject the change
    accrej = AcRej(theta1,theta2,b1,b2,M,T);
    //If the graph is to be accepted, then ...
    if (accrej == true){
      //Add the graph's adjacency matrix to the adjacency array
      adjarray.push(graph.adjacency(graph.cy));
      //Add the max shortest path length from node 0 to another node to the maxshortpath array
      maxshortpath.push(graph.maxshortestpath(graph.cy));
      //Add the number of edges attached to the zeroth node to the zedges array
      zedges.push(graph.edgeanalysis(graph.cy)[0]);
      //Add the total number of edges in the graph to the totaledges array
      totaledges.push(graph.edgeanalysis(graph.cy)[1]);
    } else{
      //If the graph isn't accepted, revert to the old one
      graph.cy = graph.cy2;
    }
  }
  //Returns the appropriate arrays
  return [adjarray, maxshortpath, zedges, totaledges];
}

function frequentgraphs(adjarray,topcent) {
/*
Description: Finds the most frequent graphs and gives the adjacency matrices of them

Arguments:
adjarray: array containing all accepted adjacency matrices
topcent: what percent of top graphs will be evaluated

returns:
graphs: the top percent of graphs with their frequency being the first value in the array
*/

  //Declares and initializes variables.  f is an object
  var f = {}, matrix;
  var hold = 0;
  var uni = [];
  var freq = [];
  var graphs = [];
  //Iterates loop a number of times equal to the length of the array of adjacency matrices
  for(var i = 0; i < adjarray.length; i++) {
    //Put the ith adjacency matrix into matrix
    matrix = adjarray[i];
    //If matrix is in f, then incrememnt the frequency value
    if(matrix in f) {
      hold = f[matrix][0]+1;
      f[matrix] = [hold,matrix];
    }
    else {
      //If the matrix isn't in f, then add it with a frequency value of 1
      f[matrix] = [1,matrix];
    }
  }
  //For each unique value of matrix in f, push the unique value to the uni array
  for(matrix in f) {
    uni.push(f[matrix]);
  }
  //Sort the uni array according to the frequency values
  var sorted = uni.sort(function compf(a, b) {
          return b[0] - a[0];
      });
  //Get the top ncent of arrays
  var top1 = Math.floor(sorted.length / (100/topcent) + 1);
  for(var i = 0; i < top1; i++){
    graphs.push(sorted[i]);
  }
  //Return the top ncent of graphs
      return graphs;
  }



var fs = require('fs');
var inputs = fs.readFileSync('inputs.txt').toString().split("\n").join("*").split("=").join("*").split("*");


const reducer = (accumulator,currentValue) => accumulator+currentValue;
var r = Number(inputs[1]);
var nodes = JSON.parse("["+inputs[3]+"]")
var M = nodes.length;
var T = Number(inputs[5]);
var N = Number(inputs[7]);

var topcent = 2;
var graph = new GraphOps(nodes);
var results = methastings(r,M,T,N,graph);
var adjacencymatrices = results[0];
var maxshortpath = results[1];
var sourcedges = results[2];
var totaledges = results[3];

//console.log(adjacencymatrices.length);
var expectmaxshort = maxshortpath.reduce(reducer)/maxshortpath.length;
var expectsedges = sourcedges.reduce(reducer)/sourcedges.length;
var expecttotedges = totaledges.reduce(reducer)/totaledges.length;
var adjacencysorted = frequentgraphs(adjacencymatrices,topcent);
//console.log(adjacencymatrices[0]);
console.log(expectmaxshort);
console.log(expectsedges);
console.log(expecttotedges);
console.log(adjacencysorted);
