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
    // float dynaX = p.x <= 0.1 && p.x > 0.0 ? 0.0 : p.x;
    p.x = p.x < 0.0 ? 1.0 : p.x;
    float dynaX = step( 0.1, p.x);
    // float dynaX = step( 0.1, fract((cos(u_time) + 1.0) * p.x));
    return dynaX;
}

float moveYBlend(vec2 p) {
    // float dynaY = p.y <= 0.1 && p.y > 0.0 ? 0.0 : p.y;
    p.y = p.y < 0.0 ? 1.0 : p.y;
    float dynaY = step( 0.1, p.y);
    // float dynaY = step( 0.1, fract((cos(u_time) + 1.0) * p.y));
    return dynaY;
}

float blend(float a, float b){
    float time = abs(mod(0.1 * u_time, 2.0) - 1.0);
    float[2] col2 = float[](a, b);
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
    vec2 pos = ((gl_FragCoord.xy / u_resolution.xy)) - 0.5;
    // メトロノームチックな変な動きする、この2行を積めば積むほどすごい
    // pos *= 
    // pos.x += sin(u_time) * .5;
    pos *= 5.0;
    pos.x += sin(u_time * 1.31) * 2.5;
    pos.y += cos(u_time * 1.53) * 2.5;
    // 簡単にやるなら
    // float crossBar = move(pos);
    // 絶対に足したる！でけたっぽい
    // pos = vec2(moveX(pos), pos.y);
    // float crossBar = moveY(pos);
    // blend使って合成させようとしたけどどっちも0の時しか黒くならない
    float a = moveXBlend(pos);
    float b = moveYBlend(pos);
    
    fragColor.rgb = vec3(1.0, 1.0, 0.0);
    // blend1次元化チャレンジ
    // vec3 crossBar = vec3(blend(a, b));
    vec3 crossBar = vec3(float(uint(a) ^ uint(b)));
    // vec3 crossBar = blendRGB(a, b);

    // fragColor.rgb = vec3(crossBar);
    fragColor.rgb = crossBar;
    fragColor.a = 1.0;
}