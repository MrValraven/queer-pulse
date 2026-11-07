/**
 * The attribute-free full-screen triangle. The vertex shader (VJ_GLSL_VERTEX)
 * builds its three corners from gl_VertexID, so the only state is an empty
 * vertex array object, bound because some drivers refuse a draw without one.
 */

export function createVjFullscreenTriangle(gl: WebGL2RenderingContext): {
  draw(): void;
  dispose(): void;
} {
  let vertexArray: WebGLVertexArrayObject | null = gl.createVertexArray();
  return {
    draw: () => {
      gl.bindVertexArray(vertexArray);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose: () => {
      if (vertexArray) gl.deleteVertexArray(vertexArray);
      vertexArray = null;
    },
  };
}
