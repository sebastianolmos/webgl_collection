
class GPUShape{
    constructor(){
        this.vbo = null;
        this.ebo = null;
        this.size = null;
        this.vertices = null;
        this.textures = [];
    }

    initBuffers(gl, vertices, indices, vertexStride){
        // Buffer for vertices
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Buffer for indices
        this.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.size = indices.length;
        this.vertices = Math.floor(vertices.length/vertexStride);
    }

    createTexture(gl, path, imageMode, wrapMode, filterMode){
        // Create a texture
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, imageMode, 1, 1, 0, imageMode, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // Asynchronously load an image
        let image = new Image();
        image.src = path;
        image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, imageMode, imageMode,gl.UNSIGNED_BYTE, image);

            // Check if the image is a power of 2 in both dimensions.
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn off mips and
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode);
            }
        });

        let idx = this.textures.length;
        this.textures[idx] = texture;
    }
}
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
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

class SimpleTextureShader {
    constructor(gl){
        const vsSource = `
      	attribute vec3 aPos;
      	attribute vec2 aTexCoord;
      	varying vec2 vTexCoord;
      	void main()
      	{
          	gl_Position = vec4(aPos, 1.0);
          	
          	// Pass the texcoord to the fragment shader.
            vTexCoord = aTexCoord;
      	}
    	`;
        const fsSource = `
        precision mediump float;       
        
      	// Passed in from the vertex shader.
        varying vec2 vTexCoord;
        
        // The texture.
        uniform sampler2D uTexture;
    
      	void main()
      	{   
          	gl_FragColor = texture2D(uTexture, vTexCoord);
      	}
    	`;
        this.gl = gl;
        this.shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aPos'),
            vertexCoord: gl.getAttribLocation(this.shaderProgram, 'aTexCoord'),
        };
        this.uniformLocations = {
            texture: gl.getUniformLocation(this.shaderProgram, 'uTexture')
        }
        this.gl.enableVertexAttribArray(this.attribLocations.vertexPosition);
        this.gl.enableVertexAttribArray(this.attribLocations.vertexCoord);
    }

    drawCall(gpuShape, drawMode){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, gpuShape.vbo);
        // Position
        this.gl.vertexAttribPointer(
            this.attribLocations.vertexPosition,
            3, // numComponents
            this.gl.FLOAT, // type
            false, // normalize
            5 * 4, // stride
            0); // offset
        // Color
        this.gl.vertexAttribPointer(
            this.attribLocations.vertexCoord,
            2, // numComponents
            this.gl.FLOAT, // type
            false, // normalize
            5 * 4, // stride
            3 * 4); // offset

        // Tell the shader to use texture unit 0 for u_texture
        this.gl.uniform1i(this.uniformLocations.texture, 0);
        // Indices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, gpuShape.ebo);
        // Do the drawing
        this.gl.drawElements(drawMode, gpuShape.size, this.gl.UNSIGNED_BYTE, 0);
    }
}

class TransformColorShader {
    constructor(gl){
        const vsSource = `
            attribute vec3 aPos;
            attribute vec3 aColor;
            varying lowp vec3 ourColor;
            uniform mat4 transform;
            void main()
            {
                gl_Position = transform * vec4(aPos, 1.0);
                ourColor = aColor;
            }
        `;
        const fsSource = `
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
        this.uniformLocations = {
            transform: gl.getUniformLocation(this.shaderProgram, 'transform')
        }
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