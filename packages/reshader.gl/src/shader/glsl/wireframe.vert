attribute vec3 aPosition;
attribute vec3 aBarycentric;
varying vec3 vBarycentric;

uniform mat4 modelMatrix;
uniform mat4 projViewMatrix;
uniform mat4 projViewModelMatrix;
uniform mat4 positionMatrix;

#include <get_output>
#include <viewshed_vert>
#include <flood_vert>
void main () {
    mat4 localPositionMatrix = getPositionMatrix();
    vec4 localPosition = getPosition(aPosition);
    gl_Position = projViewMatrix * modelMatrix * localPositionMatrix * localPosition;
    vBarycentric = aBarycentric;
    #ifdef HAS_VIEWSHED
        viewshed_getPositionFromViewpoint(modelMatrix * localPositionMatrix * localPosition);
    #endif

    #ifdef HAS_FLOODANALYSE
        flood_getHeight(modelMatrix * localPositionMatrix * localPosition);
    #endif
}