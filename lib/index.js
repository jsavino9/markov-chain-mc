'use strict';
const clonedeep = require('lodash.clonedeep');
const cytoscape = require('cytoscape');


class GraphOps {
  constructor(M) {
    this.cy = cytoscape({

      //container: document.getElementById('cy'), // container to render in

      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'width': 10,
            'height': 10,
            'background-color': '#666',
            'label': 'data(id)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'label': 'data(id)',
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],

      layout: {
        name: 'grid',
        rows: 1
      }

    });
    //Makes M accessible through entire class
    this.M = M;
    var xnodes = Array.from({length: M}, () => Math.floor(Math.random()*1000+1));
    var ynodes = Array.from({length: M}, () => Math.floor(Math.random()*1000+1));
//Constructs nodes
    for (var i = 0; i < M; i++) {
        this.cy.add({
            data: { id: '_node_' + i},
            position: {x: xnodes[i], y: ynodes[i]},
            }
        );
        var source = '_node_' + i;
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
    //Gets the x and y distance btween the two nodes
    var xd = this.cy.$('#'+target).position().x - this.cy.$('#'+source).position().x;
    var yd = this.cy.$('#'+target).position().y - this.cy.$('#'+source).position().y;
    //Uses Pythagorean formula to find the Euclidian distance between the two nodes and stores it in weight
    var weight = (xd**2 + yd**2)**(1/2);
    //Returns the distance as weight
    return weight;
  }

  connectcheck(graph){
    var bfsarray = [];
    var connected = false;
    var bfs = this.cy.elements().bfs({
      roots: '#_node_1',
      visit: function(v, e, u, i, depth){
        bfsarray.push(v.id());
      },
      directed: false
    });
    if (bfsarray.length == this.cy.nodes().length){
      connected = true;
    }
    return connected;
  }

  randomstep(graph){

    var edgearray = [];
    var endwhile = false;
    var numedges = this.cy.edges().length;
    var numnodes = this.cy.nodes().length;
    for (var i = 0; i < numedges; i++) {
      edgearray.push(this.cy.edges()[i].data("id"));
    }
    while (endwhile == false){
      var rem = true;
      if(this.cy.edges().length == this.M*(this.M-1)/2){
        rem = true;
      } else{
        rem = Math.random() < 0.5;
      }
      if (rem == true){
        var edgdel = Math.floor(Math.random()*numedges);
        this.removedelements = this.cy.$('#'+edgearray[edgdel]).remove();
        //console.log('removed a dude');
        if (this.connectcheck(graph.cy)==true){
          //console.log('We connected');
          endwhile = true;
        } else {
          //console.log('We not connected');
          this.removedelements.restore();
        }
      } else if (rem ==false){
        var uniqedge = false;
        while (uniqedge == false){
          var boolhold = true;
          var source = '_node_' + Math.floor(Math.random()*numnodes);
          var target = '_node_' + Math.floor(Math.random()*numnodes);
          if (source > target){
            var edgeid = target+source;
          } else{
            var edgeid = source+target;
          }
          for (var i = 0; i < numedges; i++){
            if (edgeid == edgearray[i]){
              boolhold = false;
              //console.log('That aint gonna work');
            } else if (source == target){
              boolhold = false;
              //console.log('No loops!!');
            }
          }
          uniqedge = boolhold;
        }
        var weight = this.getweight(source, target);
        //console.log(weight);
        this.cy.add({
            data: { id: edgeid,
            target: target,
            source: source,
            weight: weight,
            label: weight
            }
        });
        endwhile = true;
      }
    }
  }
  getbridges(graph){
    var numedges = this.cy.edges().length;
    var numbridges = 0;
    for (var i = 0; i < numedges; i++){
      var edgeid = this.cy.edges()[i].data("id");
      this.removedelements = this.cy.$('#'+edgeid).remove();
      var connected = this.connectcheck(graph.cy);
      if (connected == false){
        numbridges++;
      }
      this.removedelements.restore();
    }
    return numbridges;
  }
  adjacency(graph){
    var Adj = [];
    for (var i = 0; i < this.cy.nodes().length; i++){
      Adj[i] =[];
      for (var j = 0; j < this.cy.nodes().length; j++){
        Adj[i][j] = 0;
      }
    }
    for (var i = 0; i < this.cy.edges().length; i++){
      var edgeid = this.cy.edges()[i].data("id");
      var weight = this.cy.edges()[i].data("weight");
      var splitid = edgeid.split("_");
      var n1 = splitid[2];
      var n2 = splitid[4];
      Adj[n1][n2] = weight;
      Adj[n2][n1] = weight;

    }
    return Adj;
  }
  makecopy(graph){
    this.cy2 = clonedeep(this.cy);
  }

  theta(graph,r){
    var dijkstra = this.cy.elements().dijkstra('#_node_0', function(edge){
      return edge.data('weight');
    });
    var sumweights = 0;
    var path = 0;
    for (var i = 0; i < this.cy.edges().length; i++){
      sumweights += this.cy.edges()[i].data("weight");
    }
    sumweights *= r;
    for (var i = 0; i < this.cy.nodes().length; i++){
      path += dijkstra.distanceTo(this.cy.$('#_node_'+i));
    }
    return path+sumweights;
  }
  maxshortestpath(graph){
    var maxshort = [];
    var dijkstra = this.cy.elements().dijkstra('#_node_0', function(edge){
    return edge.data('weight');
    });
    for (var i = 0; i < this.cy.nodes().length; i++){
      maxshort.push(dijkstra.distanceTo(this.cy.$('#_node_'+i)));
    }
    var maxval = Math.max(...maxshort);
    return maxval;
  }
  edgeanalysis(){
    var numedges = this.cy.edges().length;
    var s = this.cy.$('#_node_0');
    var souredges = s.connectedEdges().length;
    return [souredges, numedges];
  }


}

function AcRej(theta1,theta2,b1,b2,M,T){
  var pirat = Math.exp(-(theta2-theta1)/T);
  var qji = 1/(M*(M-1)/2-b1);
  var qij = 1/(M*(M-1)/2-b2);
  var qrat = qij/qji;
  var probji = qrat*pirat;
  var u = Math.random();
  if (u <= probji){
    return true;
  } else {
    return false;
  }
}

function methastings(r,M,T,N,graph){
  var accrej = true;
  var adjarray = [];
  var accepted = 0;
  var maxshortpath = [];
  var sourceedges = [];
  var totaledges = [];
  for (var i = 0; i < N; i++){
    var b1 = graph.getbridges(graph.cy);
    var theta1 = graph.theta(graph.cy,r);
    graph.makecopy();
    graph.randomstep(graph.cy);
    var b2 = graph.getbridges(graph.cy);
    var theta2 = graph.theta(graph.cy,r);
    accrej = AcRej(theta1,theta2,b1,b2,M,T);
    if (accrej == true){
      adjarray.push(graph.adjacency(graph.cy));
      maxshortpath.push(graph.maxshortestpath(graph.cy));
      sourceedges.push(graph.edgeanalysis(graph.cy)[0]);
      totaledges.push(graph.edgeanalysis(graph.cy)[1]);
      accepted += 1;
    } else{
      graph.cy = graph.cy2;
    }
  }
  return [adjarray, maxshortpath, sourceedges, totaledges];
}

function frequentgraphs(adj){
  for (var i = 0; i < adj.length; i++){
    for (var j = 0; j < adj.length; j++){
      if (adj[i].toString == adj[j].toString){

      }
    }

    }
  }

}
const reducer = (accumulator,currentValue) => accumulator+currentValue;
var r = 1;
var M = 10;
var T = 300;
var N = 300;
var graph = new GraphOps(M);
var results = methastings(r,M,T,N,graph);
var adjacencymatrices = results[0];
var maxshortpath = results[1];
var sourcedges = results[2];
var totaledges = results[3];

//console.log(adjacencymatrices.length);
var expectmaxshort = maxshortpath.reduce(reducer)/maxshortpath.length;
var expectsedges = sourcedges.reduce(reducer)/sourcedges.length;
var expecttotedges = totaledges.reduce(reducer)/totaledges.length;

//console.log(adjacencymatrices[0]);
console.log(expectmaxshort);
console.log(expectsedges);
console.log(expecttotedges);
//console.log(adjacencymatrices[0][0][0]);
