#include <invert_matrix>
#ifdef HAS_INSTANCE
    #include <instance_vert>
    #ifdef HAS_INSTANCE_COLOR
        varying vec4 vInstanceColor;
    #endif
#endif

#ifdef HAS_SKIN
    uniform int skinAnimation;
    #include <skin_vert>
#endif

#ifdef HAS_MORPH
    attribute vec3 POSITION0;
    attribute vec3 POSITION1;
    attribute vec3 POSITION2;
    attribute vec3 POSITION3;

    attribute vec3 POSITION4;
    attribute vec3 POSITION5;
    attribute vec3 POSITION6;
    attribute vec3 POSITION7;
    #ifdef HAS_MORPHNORMALS
        attribute vec3 NORMAL0;
        attribute vec3 NORMAL1;
        attribute vec3 NORMAL2;
        attribute vec3 NORMAL3;
    #endif
    uniform vec4 morphWeights1;
    uniform vec4 morphWeights2;
#endif

mat4 getPositionMatrix() {
    mat4 worldMatrix;
    #ifdef HAS_INSTANCE
        #ifdef HAS_INSTANCE_COLOR
            vInstanceColor = instance_getInstanceColor();
        #endif
        mat4 attributeMatrix = instance_getAttributeMatrix();
        #ifdef HAS_SKIN
            if (skinAnimation == 1) {
                worldMatrix = attributeMatrix * positionMatrix * skin_getSkinMatrix();
            } else {
                worldMatrix = attributeMatrix * positionMatrix;
            }
        #else
            worldMatrix = attributeMatrix * positionMatrix;
        #endif
    #else
        #ifdef HAS_SKIN
            if (skinAnimation == 1) {
                worldMatrix = skin_getSkinMatrix() * positionMatrix;
            } else {
                worldMatrix = positionMatrix;
            }
        #else
            worldMatrix = positionMatrix;
        #endif
    #endif
    return worldMatrix;
}

vec4 getPosition(vec3 position) {
    #ifdef HAS_MORPH
        vec4 POSITION = vec4(position + morphWeights1[0] * POSITION0 + morphWeights1[1] * POSITION1 + morphWeights1[2] * POSITION2 + morphWeights1[3] * POSITION3
        + morphWeights2[0] * POSITION4 + morphWeights2[1] * POSITION5 + morphWeights2[2] * POSITION6 + morphWeights2[3] * POSITION7
        , 1.0);
    #else
        vec4 POSITION = vec4(position, 1.0);
    #endif
    return POSITION;
}

mat4 getNormalMatrix(mat4 worldMatrix) {
    mat4 inverseMat = invert_matrix(worldMatrix);
    mat4 normalMat = transpose_matrix(inverseMat);
    return normalMat;
}

vec4 getNormal(vec3 NORMAL) {
    #ifdef HAS_MORPHNORMALS
        vec4 normal = vec4(NORMAL + morphWeights1[0] * NORMAL0 + morphWeights1[1] * NORMAL1 + morphWeights1[2] * NORMAL2 + morphWeights1[3] * NORMAL3, 1.0);
    #else
        vec4 normal = vec4(NORMAL, 1.0);
    #endif
    return normal;
}