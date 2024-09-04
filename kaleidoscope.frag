#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;
const float PI = 3.1415926;
const float TAU = 6.2831853;

float[4] rot(float r){
	float c=cos(r);
	float s=sin(r);
	float[4] res = float[](c,-s,s,c);
	return res;
}

vec3 chromaKeyBlend(vec3 target, vec3 chromaKey, vec3 background) {
    vec3 blended = target == chromaKey ? background : target;
    return blended;
}

float createTriangle(vec2 v, vec2 p, vec2 q, vec2 r) {
    // 対象の点が三角形の内側にあるかどうかを計算する
    // 三角形を形作る三つの点と対象の点との外積をそれぞれ計算して回転方向を計算する
    // 三つの外積の回転方向が全て同じなら、対象の点は三角形の内側にあることになる
    vec3 pv = vec3(v - p, 0.0);
    vec3 pq = vec3(q - p, 0.0);

    vec3 qv = vec3(v - q, 0.0);
    vec3 qr = vec3(r - q, 0.0);

    vec3 rv = vec3(v - r, 0.0);
    vec3 rp = vec3(p - r, 0.0);

    vec3 a = cross(pv, pq);
    vec3 b = cross(qv, qr);
    vec3 c = cross(rv, rp);

    float dot_1 = dot(a, b);
    float dot_2 = dot(a, c);

    return (dot_1 > 0.0 && dot_2 > 0.0) ? 1.0 : 0.0;
}

vec2 fold(vec2 p, float n) {
	for (float i = 1.0; i <= n; ++i) {
		p = abs(p);
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
//start hash
void main() {
	float magnification = .8;
	vec2 p = (gl_FragCoord.xy * (magnification * 2.0) - u_resolution * (magnification * 1.0)) /
	min(u_resolution.x, u_resolution.y);

	// 三角形
    // float a = createTriangle(p, vec2(0.0, 0.0), vec2(0.5, 1.0), vec2(1.0, 0.0));

	// 全く意図的でない、三角形が浮かび上がってくる感じかっこいい
	// p = vec2(createTriangle(p, vec2(-0.5, -0.5), vec2(0.0, 0.5), vec2(0.5, -0.5)));

	// TODO: 回転させたい
	// a = rot(a);

	// 折りたたみ
	// float c = cos(u_time), s = sin(u_time);
	// p = abs(p * 1.5) - 1.0;
	// p *= mat2(c, s, -s, c);

	// p = abs(p * 1.5) - 1.0;
	// p *= mat2(c, s, -s, c);

	p = foldRot(p, 9.4, .05);
    float a = createTriangle(p, vec2(0.0, 0.0), vec2(0.5, 1.0), vec2(1.0, 0.0));
	p *= a;
	// p = fold(p, 1.0);

	// オリジナルな絵
	// vec2 axis = 1.0 - smoothstep(0.01, 0.02, abs(p));
	// vec2 color = mix(p, vec2(1), axis.x + axis.y);d

	// vec3 triangle = chromaKeyBlend(vec3(a), vec3(1.0), vec3(color, 1.0));

	// 全く意図的でない、三角形が浮かび上がってくる感じかっこいい
	// vec3 triangle = chromaKeyBlend(vec3(p.x), vec3(1.0), vec3(color, 1.0));

	fragColor = vec4(abs(p), 0.0, 1.0);
	// fragColor = vec4(color, 1.0, 1.0);
	// fragColor = vec4(triangle, 1.0);
}