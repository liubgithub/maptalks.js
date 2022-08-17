#ifdef GL_ES
precision highp float;
#endif
varying vec4 insight_positionFromViewpoint;
uniform sampler2D depthMap;

float unpack(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

void main() {
    vec3 shadowCoord = (insight_positionFromViewpoint.xyz / insight_positionFromViewpoint.w)/2.0 + 0.5;
    vec4 rgbaDepth = texture2D(depthMap, shadowCoord.xy);
    float depth = unpack(rgbaDepth); // Retrieve the z-value from R
    if (shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0 && shadowCoord.z <= 1.0) {
        if (depth <0.001) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);//可视区,green
        } else {
            if (shadowCoord.z <= depth + 0.002) {
                gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);//可视区,green
            } else {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);//不可视区,red
            }
        }
    } else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);//非视野范围,blue
    }
}
