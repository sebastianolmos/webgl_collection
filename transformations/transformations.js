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
    const transformShader = new TransformColorShader(gl);

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
    quadShape.initBuffers(gl, vertices, indices, 6);

    // Lines Shape
    let lineShape = new GPUShape();
    let indicesLines = new Uint8Array(
        [ 0, 1, 1, 3, 3, 0,  // first Triangle
            1, 2, 2, 3, 3, 1   // second Triangle
        ]);
    lineShape.initBuffers(gl, vertices, indicesLines, 6);

    // Render the scene
    let t0 = 0;
    //Draw the scene repeatedly
    function render(t1) {
        t1 *= 0.001; // convert to seconds
        const deltaTime = t1 - t0;
        t0 = t1;

        drawScene(t1);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


    // Draw the scene.
    function drawScene(time) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything

        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell WebGL to use our program when drawing
        gl.useProgram(transformShader.shaderProgram);

        // Handling Transformations

        // Quad 1 with Transform 1
        const transform1 = mat4.create();
        mat4.translate(transform1,     // destination matrix
            transform1,     // matrix to translate
            [-0.5, 0.5, 0.0]);  // amount to translate
        mat4.rotate(transform1,  // destination matrix
            transform1,  // matrix to rotate
            time,   // amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around
        mat4.scale(transform1,
            transform1,
            [0.7, 0.7, 1]);
        gl.uniformMatrix4fv(
            transformShader.uniformLocations.transform,
            false,
            transform1);
        // Draw Call
        drawInMode();

        // Quad 2 with Transform 2
        const transform2 = mat4.create();
        mat4.translate(transform2,     // destination matrix
            transform2,     // matrix to translate
            [0.5, 0.5, 0.0]);  // amount to translate
        mat4.scale(transform2,
            transform2,
            [0.2 * Math.sin(time)+0.6, 0.2 * Math.sin(time) + 0.6, 1]);
        gl.uniformMatrix4fv(
            transformShader.uniformLocations.transform,
            false,
            transform2);
        // Draw Call
        drawInMode();

        // Quad 3 with Transform 3
        const transform3 = mat4.create();
        mat4.translate(transform3,     // destination matrix
            transform3,     // matrix to translate
            [-0.5, -0.5, 0.0]);  // amount to translate
        mat4.scale(transform3,
            transform3,
            [0.2 * Math.cos(time)+0.6, 0.2 * Math.sin(time) + 0.6, 1]);
        gl.uniformMatrix4fv(
            transformShader.uniformLocations.transform,
            false,
            transform3);
        // Draw Call
        drawInMode();

        // Quad 4 with Transform 4
        const transform4 = mat4.create();
        mat4.translate(transform4,     // destination matrix
            transform4,     // matrix to translate
            [0.5, -0.5, 0.0]);  // amount to translate
        mat4.translate(transform4,
            transform4,
            [0.35 * Math.sin(time), 0.35 * Math.sin(time), 1]);
        mat4.scale(transform4,
            transform4,
            [0.3 , 0.3 , 1]);
        gl.uniformMatrix4fv(
            transformShader.uniformLocations.transform,
            false,
            transform4);
        // Draw Call
        drawInMode();
    }

    // Function to hel the drawCall with the correct mode
    function drawInMode(){
        if (triangleMode){
            // Draw the Shape with Triangle mode
            transformShader.drawCall(quadShape, gl.TRIANGLES);
        }
        else {
            // Draw the Shape with Line mode
            transformShader.drawCall(lineShape, gl.LINES);
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
