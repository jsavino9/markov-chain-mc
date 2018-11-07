class GraphOps {
  constructor() {
    this.cy = cytoscape({

      container: document.getElementById('cy'), // container to render in

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
    var N = 10;
    var xnodes = Array.from({length: N}, () => Math.floor(Math.random()*1000+1));
    var ynodes = Array.from({length: N}, () => Math.floor(Math.random()*1000+1));

    for (var i = 0; i < 10; i++) {
        this.cy.add({
            data: { id: 'node' + i},
            position: {x: xnodes[i], y: ynodes[i]},
            }
        );
        var source = 'node' + i;
    }
    var posx = this.cy.$('#node1').position().x;
    var posy = this.cy.$('#node1').position().y;
    var pos = this.cy.$('#node1').position();

    console.log(pos);
    console.log(posx);
    console.log(posy);


    for (var i = 0; i < 9; i++) {
      var source = 'node' + i;
      var target ='node' + (i+1);
      var xd = this.cy.$('#'+target).position().x - this.cy.$('#'+source).position().x;
      var yd = this.cy.$('#'+target).position().y - this.cy.$('#'+source).position().y;
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
    var xd = this.cy.$('#'+target).position().x - this.cy.$('#'+source).position().x;
    var yd = this.cy.$('#'+target).position().y - this.cy.$('#'+source).position().y;
    var weight = (xd**2 + yd**2)**(1/2);
    return weight;
  }

  connectcheck(graph){
    var bfsarray = [];
    var connected = false;
    var N = 10;
    var bfs = this.cy.elements().bfs({
      roots: '#node1',
      visit: function(v, e, u, i, depth){
        bfsarray.push(v.id());
      },
      directed: false
    });
    if (bfsarray.length == N){
      connected = true;
    }
    return connected;
  }

  randomstep(graph){
    var edgearray = [];
    this.graph2 = graph.cy;
    var endwhile = false;
    var numedges = this.cy.edges().length;
    for (var i = 0; i < numedges; i++) {
      edgearray.push(this.cy.edges()[i].data("id"));
    }
    while (endwhile == false){
      var rem = Math.random() < 0.9;
      if (rem == true){
        var edgdel = Math.floor(Math.random()*9);
        this.removedelements = this.cy.$('#'+edgearray[edgdel]).remove();
        console.log('removed a dude');
        if (this.connectcheck(graph.cy)==true){
          console.log('We connected');
          endwhile = true;
        } else {
          console.log('We not connected');
          this.removedelements.restore();
        }
      } else if (rem ==false){
        var uniqedge = false;
        while (uniqedge == false){
          var source = 'node' + Math.floor(Math.random()*9);
          var target = 'node' + Math.floor(Math.random()*9);
          if (source > target){
            var edgeid = target+source;
          } else{
            var edgeid = source+target;
          }
          var boolhold = true;
          for (var i = 0; i < numedges; i++){
            if (edgeid == edgearray[i]){
              boolhold = false;
            }
          }
          uniqedge = boolhold;
        }
        var weight = this.getweight(source, target);
        console.log(weight);
        this.cy.add({
            data: { id: source+target,
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
  steptest(graph){
    var edgearray = [];
    var graph2 = graph.cy;
    var numedges = this.cy.edges().length;
    for (var i = 0; i < numedges; i++) {
      edgearray.push(this.cy.edges()[i].data("id"));
    }
    var uniqedge = false;
    while (uniqedge == false){
      console.log('hi');
      var source = 'node' + Math.floor(Math.random()*9);
      var target = 'node' + Math.floor(Math.random()*9);
      var edgeid = source+target;
      var boolhold = true;
      for (var i = 0; i < numedges; i++){
        if (edgeid == edgearray[i]){
          boolhold = false;
          console.log(edgeid + ' is ' + edgearray[i]);
        }
      }
      console.log(edgeid);
      uniqedge = boolhold;
    }
    this.cy.add({
        data: { id: 'node0node9',
        target: 'node0',
        source: 'node9',
        weight: 100,
        label: '100'
        }
    });
  }

}
var graph = new GraphOps();
var connected = graph.connectcheck(graph.cy);
graph.randomstep(graph.cy);
console.log(connected);
