
class GPUShape{
    constructor(){
        this.vbo = null;
        this.ebo = null;
        this.size = null;
        this.textures = null;
    }

    initBuffers(gl, vertices, indices){
        // Buffer for vertices
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Buffer for indices
        this.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.size = indices.length;
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

class SimpleColorShader {
    constructor(gl){
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
        const fsSource = `
        precision highp float;        
        
      	varying lowp vec3 ourColor;
    
      	void main()
      	{   
          	gl_FragColor = vec4(ourColor, 1.0);
      	}
    	`;
        this.gl = gl;
        this.shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        this.attribLocations = {
                vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aPos'),
                vertexColor: gl.getAttribLocation(this.shaderProgram, 'aColor'),
            };
        this.gl.enableVertexAttribArray(this.attribLocations.vertexPosition);
        this.gl.enableVertexAttribArray(this.attribLocations.vertexColor);
    }

    drawCall(gpuShape, drawMode){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, gpuShape.vbo);
        // Position
        this.gl.vertexAttribPointer(
            this.attribLocations.vertexPosition,
            3, // numComponents
            this.gl.FLOAT, // type
            false, // normalize
            6 * 4, // stride
            0); // offset
        // Color
        this.gl.vertexAttribPointer(
            this.attribLocations.vertexColor,
            3, // numComponents
            this.gl.FLOAT, // type
            false, // normalize
            6 * 4, // stride
            3 * 4); // offset

        // Indices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, gpuShape.ebo);

        // Do the drawing
        this.gl.drawElements(drawMode, gpuShape.size, this.gl.UNSIGNED_BYTE, 0);
    }
}