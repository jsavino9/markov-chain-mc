'use strict';
/* eslint-disable no-unused-vars */
const assert = require('assert');
const mc = require('../index.js');
const clonedeep = require('lodash.clonedeep');
var fs = require('fs');

describe('weight', () => {
  it('makes sure weights are calculated correctly', () => {
    var nodes = [[0, 0], [0, 1], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    // Edge case where nodes are the same
    assert.equal(graph.getweight('_node_0', '_node_0'), 0);
    assert.equal(graph.getweight('_node_0', '_node_1'), 1);
  });
});

describe('connect check', () => {
  it('makes sure the connected function works', () => {
    // Initial graph is always connected
    var nodes = [[0, 0], [0, 1], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    assert.equal(graph.connectcheck(), true);
    // Remove an edge and see if still connected
    graph.cy.$('#_node_0_node_1').remove();
    assert.equal(graph.connectcheck(), false);
  });
});

describe('bridges', () => {
  it('makes sure weights are calculated correctly', () => {
    var nodes = [[0, 0], [0, 1], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    // Bridges should be 1 - number of nodes initially
    assert.equal(graph.getbridges(graph.cy), 2);
    graph.cy.add({
      data: {
        id: 'e3',
        target: '_node_0',
        source: '_node_2',
        weight: 1,
        label: 1
      }
    });
    // Bridges should be 0 when the graph forms a cycle
    assert.equal(graph.getbridges(graph.cy), 0);
  });
});

describe('random step', () => {
  it('makes sure a new graph is generated', () => {
    var nodes = [[0, 0], [0, 1], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    var adj1 = graph.adjacency(graph.cy);
    var adj2 = [];
    var b1 = 2;
    graph.randomstep(graph.cy, b1);
    adj2 = graph.adjacency(graph.cy);
    // Makes sure they're not the same graph by comparing adjacency matrices
    assert.equal(adj2.toString() === adj1.toString(), false);
  });
});

describe('adjacency', () => {
  it('makes sure adjacency matrices are generated correctly', () => {
    var nodes = [[1, 0], [0, 0], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    var adj1 = [[0, 1, 0], [1, 0, 1], [0, 1, 0]];
    assert.equal(graph.adjacency(graph.cy).toString(), adj1.toString());
  });
});

describe('copy', () => {
  it('makes sure graph is copied correctly', () => {
    var nodes = [[1, 0], [0, 0], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    graph.makecopy();
    assert.equal(
      graph.adjacency(graph.cy).toString(),
      graph.adjacency(graph.cy2).toString()
    );
  });
});

describe('theta', () => {
  it('makes sure theta is calculated correctly', () => {
    var nodes = [[1, 0], [0, 0], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    var theta = graph.theta(graph.cy, 1, false);
    assert.equal(theta, 5);
    graph.cy.add({
      data: {
        id: 'e3',
        target: '_node_0',
        source: '_node_2',
        weight: 1,
        label: 1
      }
    });
    theta = graph.theta(graph.cy, 1, false);
    // Note, only equal to 5 because weight for the added node is forced to be 1
    assert.equal(theta, 5);
  });
});

describe('maxshortpath', () => {
  it('makes sure the max shortest path is calculated correctly', () => {
    var nodes = [[0, 0], [1, 0], [2, 0], [3, 0]];
    var graph = new mc.GraphOps(nodes);
    var mxsp = graph.maxshortestpath();
    assert.equal(mxsp, 3);
    nodes = [[0, 0], [0, 1], [1, 1]];
    graph = new mc.GraphOps(nodes);
    mxsp = graph.maxshortestpath();
    assert.equal(mxsp, 2);
  });
});

describe('edge analysis', () => {
  it('makes sure the number of edges are calculated correctly', () => {
    var nodes = [[1, 0], [0, 0], [1, 0]];
    var graph = new mc.GraphOps(nodes);
    var edgean = graph.edgeanalysis();
    // Gen graph has one edge on node 0 and two edges total
    assert.equal(edgean[0], 1);
    assert.equal(edgean[1], 2);
    // Add an edge attached to the 0th node and check again.
    graph.cy.add({
      data: {
        id: 'e3',
        target: '_node_0',
        source: '_node_2',
        weight: 1,
        label: 1
      }
    });
    edgean = graph.edgeanalysis();
    // Should add an edge to both the 0th node and total
    assert.equal(edgean[0], 2);
    assert.equal(edgean[1], 3);
  });
});

describe('accept or reject', () => {
  it('makes sure graphs are being accepted or rejected properly', () => {
    var i = 0;
    var aor;
    var accept = [];
    var supertrue = [];
    for (i = 0; i < 200; i++) {
      // Set up so always true
      aor = mc.acrej(30, 0, 0, 2, 3, 300);
      accept.push(aor);
      supertrue.push(true);
    }
    assert.equal(accept.toString(), supertrue.toString());
    for (i = 0; i < 200; i++) {
      // Set up so always false (probji always negative)
      aor = mc.acrej(0, 0, 0, 15, 2, 0);
      accept.push(aor);
      supertrue.push(false);
    }
    assert.equal(accept.toString(), supertrue.toString());
  });
});

describe('metropolis hastings', () => {
  it('tests that the metropolis hastings algorithm runs', () => {
    // Note all components have been tested prior, so this test just ensures that it runs
    var nodes = [[0, 0], [1, 0], [2, 0], [3, 0]];
    var graph = new mc.GraphOps(nodes);
    // Run for 2000 iterations to ensure stability
    mc.methastings(1, 4, 300, 5, graph);
  });
});

describe('frequent graphs', () => {
  it('tests that the graphs are filtered and ordered according to frequency', () => {
    // Note all components have been tested prior, so this test just ensures that it runs
    var adj = [
      [[1, 2, 3], [1, 2, 3], [1, 2, 3]],
      [[1, 2, 3], [1, 2, 3], [1, 2, 3]],
      [[1, 2, 3], [1, 2, 3], [1, 2, 3]],
      [[3, 3, 3], [3, 3, 3], [3, 3, 3]],
      [[3, 3, 3], [3, 3, 3], [3, 3, 3]],
      [[4, 4, 4], [4, 4, 4], [4, 4, 4]]
    ];
    // Run for 2000 iterations to ensure stability
    var adjsorted = mc.frequentgraphs(adj, 40);
    assert.equal(adj[0].toString(), adjsorted[0][0].toString());
    assert.equal(adj[3].toString(), adjsorted[0][1].toString());
    assert.equal((typeof adjsorted[0][2]).toString(), 'undefined');
    // Assert.equal(typeof adjsorted[0][2], undefined);
  });
});

describe('main function', () => {
  it('tests that main function runs without issue', () => {
    var inputs = fs
      .readFileSync('inputs.txt')
      .toString()
      .split('\n')
      .join('*')
      .split('=')
      .join('*')
      .split('*');
    mc.main(inputs);
  });
});
