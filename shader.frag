uniform vec2 res;
uniform float initState;
uniform float DA;
uniform float DB;
uniform float k;
uniform float f;
uniform sampler2D bufferTexture;

float laplacianA() {
    vec2 pixel = gl_FragCoord.xy;

    float v = 0.0;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y + 0.0) / res).x * -1.0;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 0.0) / res).x * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 0.0) / res).x * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y + 1.0) / res).x * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y - 1.0) / res).x * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y - 1.0) / res).x * 0.05;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y - 1.0) / res).x * 0.05;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 1.0) / res).x * 0.05;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 1.0) / res).x * 0.05;
    return v;
}

float laplacianB() {
    vec2 pixel = gl_FragCoord.xy;

    float v = 0.0;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y + 0.0) / res).y * -1.0;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 0.0) / res).y * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 0.0) / res).y * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y + 1.0) / res).y * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y - 1.0) / res).y * 0.2;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y - 1.0) / res).y * 0.05;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y - 1.0) / res).y * 0.05;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 1.0) / res).y * 0.05;
    v = v + texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 1.0) / res).y * 0.05;
    return v;
}

void main() {
    float A = texture2D(bufferTexture, gl_FragCoord.xy / res).x;
    float B = texture2D(bufferTexture, gl_FragCoord.xy / res).y;
    float newA = A + (DA * laplacianA() - A * B * B + f * (1.0 - A));
    float newB = B + (DB * laplacianB() + A * B * B - (k + f) * B);

    newA = min(newA, 1.0);
    newB = min(newB, 1.0);

    if (initState > 0.0) { // only first frame
        if (gl_FragCoord.x > res.x * 0.48 && gl_FragCoord.x < res.x * 0.52 && gl_FragCoord.y > res.y * 0.48 && gl_FragCoord.y < res.y * 0.52) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    } else {
        gl_FragColor = vec4(newA, newB, 0.0, 1.0);
    }
 }
