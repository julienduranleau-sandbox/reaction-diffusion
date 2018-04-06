uniform vec2 res;
uniform sampler2D bufferTexture;

void main() {
    vec4 color = texture2D(bufferTexture, gl_FragCoord.xy / res);
    float c = min(1.0, 0.05 + min(1.0, color.g * 2.5));
    gl_FragColor = vec4(c, c, c, 1.0);
 }
