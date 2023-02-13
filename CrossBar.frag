#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;

// 簡単にやるなら
// と思ったらドットが拡大されてった
float move(vec2 p) {
    float dynaX = step( 0.1, fract((cos(u_time) + 1.0) * p.x)) + step( 0.1, fract((cos(u_time) + 1.0) * p.y));
    return dynaX;
}

float moveX(vec2 p) {
    float dynaX = step( 0.1, fract((cos(u_time) + 1.0) * p.x));
    return dynaX;
}

float moveY(vec2 p) {
    float dynaY = p.x;
    if (dynaY == 1.0) {
        dynaY = step( 0.1, fract((cos(u_time) + 1.0) * p.y));
    }
    return dynaY;
}

float moveXBlend(vec2 p) {
    float dynaX = step( 0.1, fract((cos(u_time) + 1.0) * p.x));
    return dynaX;
}

float moveYBlend(vec2 p) {
    float dynaY = step( 0.1, fract((cos(u_time) + 1.0) * p.y));
    return dynaY;
}

float blend(float a, float b){
    float time = abs(mod(0.1 * u_time, 2.0) - 1.0);
    float[2] col2 = float[](
        a,
        b
    );
    return mix(col2[0], col2[1], .5);
}

vec3 blendRGB(float a, float b){
    float time = abs(mod(0.1 * u_time, 2.0) - 1.0);
    vec3[2] col2 = vec3[](
        vec3(a, a, a),
        vec3(b, b, b)
    );
    return mix(col2[0], col2[1], .5);
    // 時間変化
    // return mix(col2[0], col2[1], time);
    // return mix(col2[0], col2[1], smoothstep(0.5 - 0.5 * time, 0.5 + 0.5 * time, b / (a + b)));
}

void main() {
    vec2 pos = ((gl_FragCoord.xy / u_resolution.xy) - 0.5) * 10.0;
    // 簡単にやるなら
    // float crossBar = move(pos);
    // 絶対に足したる！でけたっぽい
    // pos = vec2(moveX(pos), pos.y);
    // float crossBar = moveY(pos);
    // blend使って合成させようとしたけどどっちも0の時しか黒くならない
    float a = moveXBlend(pos);
    float b = moveYBlend(pos);
    // blend1次元化チャレンジ
    vec3 crossBar = vec3(blend(a, b));
    // vec3 crossBar = blendRGB(a, b);
    fragColor.rgb = vec3(1.0);
    // fragColor.rgb = vec3(crossBar);
    fragColor.rgb = crossBar;
    fragColor.a = 1.0;
}