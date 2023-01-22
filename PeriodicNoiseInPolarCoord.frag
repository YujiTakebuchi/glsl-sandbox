#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;

const float PI = 3.1415926;

float atan2(float y, float x){
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}
vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.x, xy.y), length(xy));
}
vec2 pol2xy(vec2 pol){
    return pol.y * vec2(cos(pol.x), sin(pol.x));
}

uint uhash11(uint n){
    n ^= (n << 1u);
    n ^= (n >> 1u);
    n *= 0x456789abu;
    n ^= (n << 1u);
    return n * 0x456789abu;
}

/**
 * 周期化関数
 * x, yのフラグメント情報に対して
 */
float gtable2(vec2 lattice, vec2 p){
    uvec2 n = floatBitsToUint(lattice);
    uint ind = (uhash11(uhash11(n.x) + n.y) >> 29);
    float u = 0.92387953 * (ind < 4u ? p.x : p.y);  //0.92387953 = cos(pi/8)
    float v = 0.38268343 * (ind < 4u ? p.y : p.x);  //0.38268343 = sin(pi/8)
    return ((ind & 1u) == 0u ? u : -u) + ((ind & 2u) == 0u? v : -v);
}

float gtable3(vec3 lattice, vec3 p){
    uvec3 n = floatBitsToUint(lattice);
    uint ind = (uhash11(uhash11(uhash11(n.x) + n.y) + n.z) >> 28);
    float u = ind < 8u ? p.x : p.y;
    float v = ind < 4u ? p.y : ind == 12u || ind == 14u ? p.x : p.z;
    return ((ind & 1u) == 0u? u: -u) + ((ind & 2u) == 0u? v : -v);
}

// 周期化関数
float periodicNoise21(vec2 p, float period){
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j ++){
        for (int i = 0; i < 2; i++){
            v[i+2*j] = gtable2(mod(n + vec2(i, j), period), f - vec2(i, j));
        }
    }
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
}

float periodicNoise31(vec3 p, float period){
    vec3 n = floor(p);
    vec3 f = fract(p);
    float[8] v;
    for (int k = 0; k < 2; k++ ){
        for (int j = 0; j < 2; j++ ){
            for (int i = 0; i < 2; i++){
                v[i+2*j+4*k] = gtable3(mod(n + vec3(i, j, k), period), f - vec3(i, j, k)) * 0.70710678;
            }
        }
    }
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    float[2] w;
    for (int i = 0; i < 2; i++){
        w[i] = mix(mix(v[4*i], v[4*i+1], f[0]), mix(v[4*i+2], v[4*i+3], f[0]), f[1]);
    }
    return 0.5 * mix(w[0], w[1], f[2]) + 0.5;
}

float pnoise21(vec2 p){
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j ++){
        for (int i = 0; i < 2; i++){
            v[i+2*j] = gtable2(n + vec2(i, j), f - vec2(i, j));
        }
    }
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
}

float warp21(vec2 p, float g){
    float val = 0.0;
    for (int i = 0; i < 4; i++){
        val = pnoise21(p + g * val);
    }
    return val;
}

/**
 * ブレンディング関数
 * 2色色をセットしておき、mix関数で色空間情報を補間している
 * @param {float} a フラグメントにおける乱数値
 * @param {float} b フラグメントにおける乱数値
 * @return {vec3} フラグメントにおける色空間情報
 */
vec3 blend(float a, float b){
    float time = abs(mod(0.1 * u_time, 2.0) - 1.0);
    vec3[2] col2 = vec3[](
        vec3(a, a, 1),
        vec3(0, b, b)
    );
    // return mix(col2[0], col2[1], time);
    return mix(col2[0], col2[1], smoothstep(0.5 - 0.5 * time, 0.5 + 0.5 * time, b / (a + b)));
}

void main(){
    vec2 pos = gl_FragCoord.xy / u_resolution.xy;
    pos = 2.0 * pos.xy - vec2(1.0);
    pos = xy2pol(pos);
    // pos = vec2(5.0 / PI, 5.0) * pos + u_time;
    pos = vec2((5.0 / PI, 2.0) * pos.x + u_time, (5.0 / PI, 2.0) * pos.y);

    pos = vec2(warp21(pos, 5.0));
    // float a = warp21(pos, 5.0);
    // float b = warp21(pos + 10.0, 5.0);
    // float a = periodicNoise21(pos, 2.0);
    // float b = periodicNoise21(pos + 10.0, 2.0);
    // pos = xy2pol(pos);
    // float a = periodicNoise21(pos, 2.0);
    // float b = periodicNoise21(pos, 2.0);
    float a = periodicNoise21(vec2(warp21(pos, 5.0)), 4.0);
    float b = periodicNoise21(vec2(warp21(pos + 10.0, 5.0)), 4.0);
    // vec2 axy = vec2(periodicNoise21(vec2(warp21(pos, 5.0)), 2.0));
    // vec2 bxy = vec2(periodicNoise21(vec2(warp21(pos + 10.0, 5.0)), 2.0));
    // fragColor.rgb = vec3(a, b, 0.0);
    fragColor.rgb = blend(a, b);

    // pos = vec2(warp21(pos, 0.5));
    // pos = vec2(periodicNoise21(pos, 10.0));
    // fragColor = vec4(warp21(pos, 0.5));
    // fragColor = vec4(periodicNoise21(pos, 10.0));
    fragColor.a = 1.0;
}