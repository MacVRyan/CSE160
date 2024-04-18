// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
var a_Position;
var u_FragColor;
var u_Size;

// Get the canvas and GL context
function setupWebGl() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

// Get the canvas and GL context
function setupWebGl() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedcolor=[1.0,1.0,1.0,1.0];
let g_selectedsize = 5;
let g_selectedType = POINT;
let g_selectedsegments = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();};
  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE};
  document.getElementById('circButton').onclick = function() { g_selectedType = CIRCLE};
  document.getElementById('picButton').onclick = function() { createPicture();};

  // Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedcolor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedcolor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedcolor[2] = this.value/100; });
  document.getElementById('whiteSlide').addEventListener('mouseup', function() { g_selectedcolor[3] = 1 - this.value/100; });

  // Size Slider Event
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedsize = this.value; });

  // Segment Slider Event
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedsegments = this.value; });

}

// Compile the shader programs and attach the javascript variables to the GLSL variables
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  } 

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function main() {
  // Set up canvas and gl variables
  setupWebGl();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL(); 

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoords(ev);

  // Create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedsegments;
  }
  point.position = [x,y];
  point.color = g_selectedcolor.slice();
  point.size = g_selectedsize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoords(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x,y]
}

function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // const len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHtml("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHtml(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function createPicture() {
  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  let point;
  // Create Moon
  let moon = new Circle();
  moon.position = [0, 0];
  moon.color = [1.0, 1.0, 0.8, 1.0];
  moon.size = 100;
  moon.segments = 50;
  g_shapesList.push(moon);

  // Create Moon Holes
  let hole1 = new Circle();
  hole1.position = [0, 0.4]; 
  hole1.color = [1.0, 1.0, 0.5, 1.0]; 
  hole1.size = 20;
  hole1.segments = 50;
  g_shapesList.push(hole1);



  // Create Stars
  let star1 = new Point();
  star1.position = [-0.8, 0.8]; 
  star1.color = [1.0, 1.0, 1.0, 1.0]; 
  star1.size = 2; 
  g_shapesList.push(star1);

  let star2 = new Point();
  star2.position = [0.8, 0.6];
  star2.color = [1.0, 1.0, 1.0, 1.0]; 
  star2.size = 10; 
  g_shapesList.push(star2);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}