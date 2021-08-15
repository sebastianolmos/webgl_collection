// global variables
let triangleMode = true;

//
// Start here
//
function main() {
	const canvas = document.querySelector('#glcanvas');

	// Connect inputs
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);
	// Connect Button
	document.getElementById('drawMode').onclick = toggleDrawMode;

	// Get OpenGL from canvas
	const gl = canvas.getContext('webgl');

	// If we don't have a GL context, give up now
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	};
	// Compiled ShaderProgram
	const basicShader = new SimpleColorShader(gl);

	// Triangle Shape
	let quadShape = new GPUShape();
	let vertices = new Float32Array(
		[// positions     // colors
				0.5,  0.5, 0.0,  1.0, 0.0, 0.0,  // top right
				0.5, -0.5, 0.0,  0.0, 1.0, 0.0,  // bottom right
				-0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  // bottom left
				-0.5,  0.5, 0.0,  1.0, 1.0, 1.0,   // top left
			 ]);
	let indices = new Uint8Array(
		[ 0, 1, 3,  // first Triangle
			1, 2, 3   // second Triangle
		]);
	quadShape.initBuffers(gl, vertices, indices);

	// Lines Shape
	let lineShape = new GPUShape();
	let indicesLines = new Uint8Array(
		[ 0, 1, 1, 3, 3, 0,  // first Triangle
			1, 2, 2, 3, 3, 1   // second Triangle
		]);
	lineShape.initBuffers(gl, vertices, indicesLines);

	// Render the scene
	let t0 = 0;
	//Draw the scene repeatedly
	function render(t1) {
		t1 *= 0.001; // convert to seconds
		const deltaTime = t1 - t0;
		t0 = t1;

		drawScene();
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);


	// Draw the scene.
	function drawScene() {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
		gl.clearDepth(1.0);                 // Clear everything

		// Clear the canvas before we start drawing on it.
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Tell WebGL to use our program when drawing
		gl.useProgram(basicShader.shaderProgram);

		if (triangleMode){
			// Draw the Shape with Triangle mode
			basicShader.drawCall(quadShape, gl.TRIANGLES);
		}
		else {
			// Draw the Shape with Line mode
			basicShader.drawCall(lineShape, gl.LINES);
		}
	}

}


// Inputs
function onKeyDown(event)
{
	if (event.key === ' ')
	{
		triangleMode = false;
	}
}

function onKeyUp(event)
{
	if (event.key === ' ')
	{
		triangleMode = true;
	}
}

function toggleDrawMode()
{
	triangleMode = !triangleMode;
}

// Execution
main();
