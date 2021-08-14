
main();

//
// Start here
//
function main() {
  	const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    // If we don't have a GL context, give up now

    if (!gl) {
      	alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      	return;
    }

    // Vertex shader program

    const vsSource = `
      	attribute vec3 aPos;
      	attribute vec3 aColor;

      	varying lowp vec3 ourColor;

      	void main()
      	{
          	gl_Position = vec4(aPos, 1.0);
          	ourColor = aColor;
      	}
    	`;

    	// Fragment shader program

    const fsSource = `
      	varying lowp vec3 ourColor;
    
      	void main()
      	{
          	gl_FragColor = vec4(ourColor, 1.0);
      	}
    	`;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVertexColor and also
    // look up uniform locations.
    const programInfo = {
      	program: shaderProgram,
      	attribLocations: {
        	vertexPosition: gl.getAttribLocation(shaderProgram, 'aPos'),
        	vertexColor: gl.getAttribLocation(shaderProgram, 'aColor'),
      	},
    };

  	// Here's where we call the routine that builds all the
  	// objects we'll be drawing.
  	const buffer = initBuffers(gl);
  	var buffers = {position : buffer};

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute
	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 6 * 4;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.vertexPosition);
	}

	// Tell WebGL how to pull out the colors from the color buffer
	// into the vertexColor attribute.
	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 6 * 4;
		const offset = 3 * 4;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.vertexColor);
	}
	const positions = [
		// positions     // colors
		0.5,  0.5, 0.0,  1.0, 0.0, 0.0,  // top right
		0.5, -0.5, 0.0,  0.0, 1.0, 0.0,  // bottom right
		-0.5,  0.5, 0.0,  1.0, 1.0, 1.0,   // top left
		-0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  // bottom left
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  	// Draw the scene
  	drawScene(gl, programInfo, buffers);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {
	// Create a buffer for the square's positions.

  	const positionBuffer = gl.createBuffer();

  	// Select the positionBuffer as the one to apply buffer
  	// operations to from here out.

  	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  	// Now create an array of positions for the square.

  	const positions = [
    	// positions     // colors
    	0.5,  0.5, 0.0,  1.0, 0.0, 0.0,  // top right
    	0.5, -0.5, 0.0,  0.0, 1.0, 0.0,  // bottom right
    	-0.5,  0.5, 0.0,  1.0, 1.0, 1.0,   // top left 
    	-0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  // bottom left
  	];

  	// Now pass the list of positions into WebGL to build the
  	// shape. We do this by creating a Float32Array from the
  	// JavaScript array, then use it to fill the current buffer.


  	return positionBuffer;
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers) {
  	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  	gl.clearDepth(1.0);                 // Clear everything

  	// Clear the canvas before we start drawing on it.

  	gl.clear(gl.COLOR_BUFFER_BIT);



  	// Tell WebGL to use our program when drawing

  	gl.useProgram(programInfo.program);
  	{
    	const offset = 0;
    	const vertexCount = 4;
    	gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  	}
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  	// Create the shader program

  	const shaderProgram = gl.createProgram();
  	gl.attachShader(shaderProgram, vertexShader);
  	gl.attachShader(shaderProgram, fragmentShader);
  	gl.linkProgram(shaderProgram);

  	// If creating the shader program failed, alert

  	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    	alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    	return null;
  	}

  	return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  	const shader = gl.createShader(type);

  	// Send the source to the shader object

  	gl.shaderSource(shader, source);

  	// Compile the shader program

  	gl.compileShader(shader);

  	// See if it compiled successfully

  	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    	alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    	gl.deleteShader(shader);
    	return null;
  	}

  	return shader;
}