import { mat4 } from 'gl-matrix';
import phongFrag from './glsl/phong.frag';
import phongVert from './glsl/phong.vert';
import MeshShader from '../shader/MeshShader.js';
class PhongShader extends MeshShader {
    constructor(config = {}) {
        const positionAttribute = config.positionAttribute || 'aPosition';
        const normalAttribute = config.normalAttribute || 'aNormal';
        let vert = phongVert;
        if (positionAttribute !== 'aPosition') {
            vert = vert.replace(/aPosition/g, positionAttribute);
        }
        if (normalAttribute !== 'aNormal') {
            vert = vert.replace(/aNormal/g, normalAttribute);
        }
        super({
            vert,
            frag: phongFrag,
            uniforms: [
                'cameraPosition',
                'lightAmbient',
                'lightDiffuse',
                'lightSpecular',
                'lightDirection',
                'ambientStrength',
                'specularStrength',
                'materialShiness',
                'projViewMatrix',
                'opacity',
                'baseColorTexture',
                'baseColorFactor',
                {
                    name: 'normalMatrix',
                    type: 'function',
                    fn: function (context, props) {
                        const normalMatrix = [];
                        mat4.invert(normalMatrix, props['modelMatrix']);
                        mat4.transpose(normalMatrix, normalMatrix);
                        return normalMatrix;
                    }
                },
                {
                    name: 'projViewModelMatrix',
                    type: 'function',
                    fn: function (context, props) {
                        return mat4.multiply([], props['projViewMatrix'], props['modelMatrix']);
                    }
                }
            ],
            defines: config.defines || {},
            extraCommandProps: config.extraCommandProps || {}
        });
    }
}
export default PhongShader;