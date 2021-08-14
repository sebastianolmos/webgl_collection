// global variables
let colorRed = 0;

//
// Start here
//
function main() {
	const canvas = document.querySelector('#glcanvas');

	// Connect inputs
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	const gl = canvas.getContext('webgl');

	// If we don't have a GL context, give up now
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	};
	const basicShader = new SimpleColorShader(gl);

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

	// Render the scene
	let t0 = 0;
	//Draw the scene repeatedly
	function render(t1) {
		t1 *= 0.001; // convert to seconds
		const deltaTime = t1 - t0;
		t0 = t1;

		drawScene(gl, basicShader, quadShape);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

}

//
// Draw the scene.
//
function drawScene(gl, shader, shape) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	gl.clearDepth(1.0);                 // Clear everything

	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tell WebGL to use our program when drawing
	gl.useProgram(shader.shaderProgram);

	// fill color
	gl.uniform1i(gl.getUniformLocation(shader.shaderProgram, "colorRed"), colorRed);

	shader.drawCall(shape);

}

// Inputs
function onKeyDown(event)
{
	if (event.key === 'c')
	{
		colorRed = 1;
	}
}

function onKeyUp(event)
{
	if (event.key === 'c')
	{
		colorRed = 0;
	}
}

function toggleColor()
{
	colorRed = (colorRed + 1) % 2;
}


// Execution
main();
