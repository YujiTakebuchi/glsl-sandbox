#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;

const float PI = 3.1415926;

float atan2(float y, float x){
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.x, xy.y), length(xy));
}

vec2 fold(vec2 p, float n) {
  for (float i = 1.0; i <= n; ++i) {
    p = abs(p);
  }
  return p;
}

vec2 foldNest(vec2 p, float n) {
  for (float i = 1.0; i <= n; ++i) {
    p = fold(p, n);
  }
  return p;
}

uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
uvec3 u = uvec3(1, 2, 3);
const uint UINT_MAX = 0xffffffffu;
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
float gtable2(vec2 lattice, vec2 p){
    uvec2 n = floatBitsToUint(lattice);
    uint ind = uhash22(n).x >> 29;
    float u = 0.92387953 * (ind < 4u ? p.x : p.y);  //0.92387953 = cos(pi/8)
    float v = 0.38268343 * (ind < 4u ? p.y : p.x);  //0.38268343 = sin(pi/8)
    return ((ind & 1u) == 0u ? u : -u) + ((ind & 2u) == 0u? v : -v);
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

vec2 foldRot(vec2 p, float n, float speed) {
	for (float i = 1.0; i <= n; ++i) {
		p = abs(p * 1.5) - 1.0;
		float a = u_time * i * speed;
		float c = cos(a), s = sin(a);
		p *= mat2(c, s, -s, c);
	}
	return p;
}

void main() {
  vec2 pos = gl_FragCoord.xy / u_resolution;

  // float n = 1.0;
  float uns_time = (sin(u_time) + 1.0) * 0.5;
  float n = uns_time * 13.0;
  pos = 3.0 * pos.xy - vec2(3.0 / 2.0);
  pos = foldRot(pos, n, 0.4);

  // 中心に持ってってる
  pos = 2.0 * pos.xy - vec2(1.0);
  // 極座標変換
  pos = xy2pol(pos);

  fragColor.rgb = vec3(warp21(pos, 0.02), 3.0 - pos.y, warp21(pos, 1.02));
  fragColor.a = 1.0;
}