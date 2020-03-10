precision mediump float;

uniform vec4 baseColorFactor;
uniform float materialShininess;//反光度，即影响镜面高光的散射/半径
uniform float opacity;
uniform float ambientStrength;
uniform float specularStrength;

uniform vec3 lightDirection;
uniform vec3 lightAmbient;
uniform vec3 lightDiffuse;
uniform vec3 lightSpecular;
uniform vec3 cameraPosition;

#ifdef HAS_TOON
    uniform float toons;
    uniform float specularToons;
#endif

#ifdef HAS_TANGENT
    varying vec4 vTangent;
#endif

#ifdef HAS_MAP
    varying vec2 vTexCoord;
#endif
varying vec3 vNormal;
varying vec3 vFragPos;

#ifdef HAS_INSTANCE_COLOR
    varying vec4 vInstanceColor;
#endif

#ifdef HAS_BASECOLOR_MAP
    uniform sampler2D baseColorTexture;
#endif

#ifdef HAS_EXTRUSION_OPACITY
    uniform vec2 extrusionOpacityRange;
    varying float vExtrusionOpacity;
#endif

#ifdef HAS_COLOR
    varying vec4 vColor;
#endif

#ifdef HAS_OCCLUSION_MAP
    uniform sampler2D occlusionTexture;
#endif

#ifdef HAS_NORMAL_MAP
    uniform sampler2D normalTexture;
#endif

#ifdef HAS_EMISSIVE_MAP
    uniform sampler2D emissiveTexture;
#endif

#ifdef SHADING_MODEL_SPECULAR_GLOSSINESS
    uniform vec4 diffuseFactor;
    uniform vec3 specularFactor;
    #ifdef HAS_DIFFUSE_MAP
        uniform sampler2D diffuseTexture;
    #endif
    #ifdef HAS_SPECULARGLOSSINESS_MAP
        uniform sampler2D specularGlossinessTexture;
    #endif
#endif

#include <viewshed_frag>
#include <flood_frag>
#include <heatmap_render_frag>

vec3 transformNormal() {
    #if defined(HAS_NORMAL_MAP)
        vec3 n = normalize(vNormal);
        vec3 normal = texture2D(normalTexture, vTexCoord).xyz * 2.0 - 1.0;
        #if defined(HAS_TANGENT)
            vec3 t = normalize(vTangent.xyz);
            vec3 b = normalize(cross(n, t) * sign(vTangent.w));
            mat3 tbn = mat3(t, b, n);
            return normalize(tbn * normal);
        #else
            return normalize(normal);
        #endif
    #else
        return normalize(vNormal);
    #endif
}

vec4 linearTosRGB(const in vec4 color) {
    return vec4( color.r < 0.0031308 ? color.r * 12.92 : 1.055 * pow(color.r, 1.0/2.4) - 0.055, color.g < 0.0031308 ? color.g * 12.92 : 1.055 * pow(color.g, 1.0/2.4) - 0.055, color.b < 0.0031308 ? color.b * 12.92 : 1.055 * pow(color.b, 1.0/2.4) - 0.055, color.a);
}

vec4 getBaseColor() {
    #if defined(HAS_BASECOLOR_MAP)
        return texture2D(baseColorTexture, vTexCoord);
    #elif defined(HAS_DIFFUSE_MAP)
        return texture2D(diffuseTexture, vTexCoord);
    #elif defined(SHADING_MODEL_SPECULAR_GLOSSINESS)
        return diffuseFactor;
    #else
        return baseColorFactor;
    #endif
}

vec3 getSpecularColor() {
    #if defined(HAS_SPECULARGLOSSINESS_MAP)
        return texture2D(specularGlossinessTexture, vTexCoord).rgb;
    #elif defined(SHADING_MODEL_SPECULAR_GLOSSINESS)
        return specularFactor;
    #else
        return vec3(1.0);
    #endif
}

void main() {
    //环境光
    vec4 baseColor = getBaseColor();
    vec3 ambient = ambientStrength * lightAmbient * baseColor.rgb;

    #ifdef HAS_INSTANCE_COLOR
        ambient *= vInstanceColor.rgb;
    #endif

    //漫反射光
    vec3 norm = transformNormal();
    vec3 lightDir = normalize(-lightDirection);
    float diff = max(dot(norm, lightDir), 0.0);
    #ifdef HAS_TOON
        float toon = floor(diff * toons);
        diff = toon / toons;
    #endif
    vec3 diffuse = lightDiffuse * diff * baseColor.rgb;
    #ifdef HAS_COLOR
        ambient *= vColor.rgb;
        diffuse *= vColor.rgb;
    #endif
    //镜面反色光
    vec3 viewDir = normalize(cameraPosition - vFragPos);
    // vec3 reflectDir = reflect(-lightDir, norm);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(norm, halfwayDir), 0.0), materialShininess);
    #ifdef HAS_TOON
        float specToon = floor(spec * specularToons);
        spec = specToon / specularToons;
    #endif
    vec3 specular = specularStrength * lightSpecular * spec * getSpecularColor();
    #ifdef HAS_OCCLUSION_MAP
        float ao = texture2D(occlusionTexture, vTexCoord).r;
        ambient *= ao;
    #endif
    vec3 result = ambient + diffuse + specular;

    #ifdef HAS_EMISSIVE_MAP
        vec3 emit = texture2D(emissiveTexture, vTexCoord).rgb;
        result += emit;
    #endif

    gl_FragColor = vec4(result, opacity);
    // gl_FragColor = linearTosRGB(gl_FragColor);
    #ifdef HAS_COLOR
        gl_FragColor *= vColor.a;
    #endif
    #ifdef HAS_EXTRUSION_OPACITY
        float topAlpha = extrusionOpacityRange.x;
        float bottomAlpha = extrusionOpacityRange.y;
        float alpha = topAlpha + vExtrusionOpacity * (bottomAlpha - topAlpha);
        alpha = clamp(alpha, 0.0, 1.0);
        gl_FragColor *= alpha;
    #endif

    #ifdef HAS_HEATMAP
        gl_FragColor = heatmap_getColor(gl_FragColor);
    #endif

    #ifdef HAS_VIEWSHED
        viewshed_draw();
    #endif

    #ifdef HAS_FLOODANALYSE
        draw_floodAnalyse();
    #endif
    // gl_FragColor.a = 0.7;
}