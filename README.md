[![Coverage Status](https://coveralls.io/repos/github/jsavino9/markov-chain-mc/badge.svg?branch=master)](https://coveralls.io/github/jsavino9/markov-chain-mc?branch=master)

# Markov Chain Monte Carlo

This application applies the Markov Chain Monte Carlo Metropolis Hastings algorithm to a number of nodes in 2D space. The algorithm determines the best graphs according to a weight function defined as:

<center>![alt text](eq.png 'Equation')</center>

- Free software: ISC license

## Installation Instructions

This program is intended to be run on NodeJS v8 or higher.

Required packages: cytoscape, lodeash.clonedeep (these should install automatically)

Required dev packages can be found in the package.json file.

To install:

1. Go to the repository home page https://github.com/jsavino9/markov-chain-mc. Click clone/download, and click "download as zip" once the file is downloaded, it can be unzipped. An alternative option is to clone the repository.
2. Navigate to the root directory and type 'npm install .' in your preferred terminal/command line interface to install the application. To install it globally, use the -g flag.
3. Optional: Use npm link in the root directory to execute the program using only 'mcmc' in command line.

## Running the program

1. Edit the inputs.txt file as outlined below. If running without link, this should be always be in the lib directory.
2. (A) Run the program by typing 'node index.js' in command line / terminal.
3. (B) Run the program by typing mcmc in command line. If running the program this way, inputs.txt MUST be present in the directory it is being run from.

##Inputs

Input is in the form of an inputs.txt file for ease of editing. The following options are available:

r: This should be a number. It represents how much the total weight of all edges in a graph affects the acceptance probability. Default is 1.
M: These are the nodes using cartesian coordinates. They must be typed in the form "[x1,y1],[x2,y2],[x3,y3]" and so-on. There is a sample input to follow.
T: The temperature of the simulation. Increasing this increases the probability of acceptance. Default is 300.
topcent: The top percentile from which the top graphs will be sampled. Default is top 1%. This number must be between 1 and 99.

##

This application writes the following variables to console:

1. Expectation value of the maximum shortest length from node0 to another node.
2. The expectation value for the number of edges attached to node0.
3. The expectation value for the total number of edges.
4. The top (most frequent) graphs represented as adjacency matrices. The number shown is dependent on the topcent variable described above.

## Credits

Author: James Savino

Project completed for CHE 477 at University of Rochester under Professor Andrew White.

An image from the problem prompt was included to describe the governing equations (probabilities) of the system.
