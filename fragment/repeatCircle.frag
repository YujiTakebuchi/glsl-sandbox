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

  float n = 8.0;
  pos = 3.0 * pos.xy - vec2(3.0 / 2.0);
  pos = foldRot(pos, n, 0.4);

  // 中心に持ってってる
  pos = 2.0 * pos.xy - vec2(1.0);
  // 極座標変換
  pos = xy2pol(pos);


  fragColor.rgb = vec3(0.0, 1.0 - pos.y, 0.0);
  fragColor.a = 1.0;
}