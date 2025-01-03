#version 300 es
precision highp int;
precision highp float;
out vec4 fragColor;
uniform sampler2D u_texture_0;
uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.1415926;

float atan2(float y, float x){
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}
vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.x, xy.y), length(xy));
}

uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
uvec3 u = uvec3(1, 2, 3);
const uint UINT_MAX = 0xffffffffu;
uint uhash11(uint n){
    n ^= (n << 1u);
    n ^= (n >> 1u);
    n *= 0x456789abu;
    n ^= (n << 1u);
    return n * 0x456789abu;
}
uvec2 uhash22(uvec2 n){
    n ^= (n.yx << u.xy);
    n ^= (n.yx >> u.xy);
    n *= k.xy;
    n ^= (n.yx << u.xy);
    return n * k.xy;
}
float hash21(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return float(uhash22(n).x) / float(UINT_MAX);
}
vec2 hash22(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return vec2(uhash22(n)) / vec2(UINT_MAX);
}
float gtable2(vec2 lattice, vec2 p){
    uvec2 n = floatBitsToUint(lattice);
    uint ind = uhash22(n).x >> 29;
    float u = 0.92387953 * (ind < 4u ? p.x : p.y);  //0.92387953 = cos(pi/8)
    float v = 0.38268343 * (ind < 4u ? p.y : p.x);  //0.38268343 = sin(pi/8)
    return ((ind & 1u) == 0u ? u : -u) + ((ind & 2u) == 0u? v : -v);
}

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
float gtable3(vec3 lattice, vec3 p){
    uvec3 n = floatBitsToUint(lattice);
    uint ind = (uhash11(uhash11(uhash11(n.x) + n.y) + n.z) >> 28);
    float u = ind < 8u ? p.x : p.y;
    float v = ind < 4u ? p.y : ind == 12u || ind == 14u ? p.x : p.z;
    return ((ind & 1u) == 0u? u: -u) + ((ind & 2u) == 0u? v : -v);
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

float gnoise21(vec2 p){
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j ++){
        for (int i = 0; i < 2; i++){
            vec2 g = normalize(hash22(n + vec2(i,j)) - vec2(0.5));
            v[i+2*j] = dot(g, f - vec2(i, j));
        }
    }
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
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
float vnoise21(vec2 p){
    vec2 n = floor(p);
    float[4] v;
    for (int j = 0; j < 2; j ++){
        for (int i = 0; i < 2; i++){
            v[i+2*j] = hash21(n + vec2(i, j));
        }
    }
    vec2 f = fract(p);
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    return mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]);
}
float fbm21(vec2 p, float g){
    float val = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    for (int i = 0; i < 4; i++){
        val += amp * (vnoise21(freq * p) - 0.5);
        amp *= g;
        freq *= 2.01;
    }
    return 0.5 * val + 0.5;
}
float base21(vec2 p){
    return mod(u_time, 20.0) < 10.0 ?
    fbm21(p, 0.5) : 
    pnoise21(p);
}
float warp21(vec2 p, float g){
    float val = 0.0;
    for (int i = 0; i < 4; i++){
        val = base21(p + g * vec2(cos(2.0 * PI * val), sin(2.0 * PI * val)));
    }
    return val;
}

void main() {
  vec2 pos = gl_FragCoord.xy / u_resolution;
  vec2 uv = pos;
  vec4 bg = vec4(1.0, 0.0, 1.0, 1.0);

  float uns_time = (sin(u_time * 5.0) + 1.0) * 0.5;
  float n = uns_time * 1.0;
  // float r = warp21(uv, 50.0) * n;
  float r = gnoise21(pos);
  float b = smoothstep(0., 0., r);

  // 中心に持ってってる
  uv = 2.0 * uv.xy - vec2(1.0);
  // 極座標変換
  uv = xy2pol(uv);

  // vec3 bgColor = vec3(r, b, b);
  // bg = vec4(bgColor, 1.0);

  float num = 4.0;
  uv = vec2(num / PI, num) * uv + u_time;
  // float pattern = vnoise21(uv * 14.0);
  float pattern = periodicNoise21(uv * 18.0, num * 4.0);
  uv *= num;
  float curv = sin(uv.y - (uv.x * PI * 0.062779));
  pattern = smoothstep(0.5, 0.75, pattern) * curv;
  uv *= 1.0 / num;
  bg = vec4(pattern, curv, pattern, 1.0);


  vec4 image = texture(u_texture_0, ((pos * 2.0) - vec2(0.5, 0.68)));
  // fragColor = color;
  fragColor = mix(bg, image, image.a);
}