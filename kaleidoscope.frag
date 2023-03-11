#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;
const float PI = 3.1415926;
const float TAU = 6.2831853;

//start hash
void main() {
	vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) /
	min(u_resolution.x, u_resolution.y);

	// 折りたたみ
	// float c = cos(u_time), s = sin(u_time);
	// p = abs(p * 1.5) - 1.0;
	// p *= mat2(c, s, -s, c);

	// p = abs(p * 1.5) - 1.0;
	// p *= mat2(c, s, -s, c);

	for (int i = 1; i <= 4; ++i) {
		p = abs(p * 1.5) - 1.0;
		float a = u_time * float(i) * .2;
		float c = cos(a), s = sin(a);
		p *= mat2(c, s, -s, c);
	}

	// オリジナルな絵
	vec2 axis = 1.0 - smoothstep(0.01, 0.02, abs(p));
	vec2 color = mix(p, vec2(1), axis.x + axis.y);
	fragColor = vec4(color, 1.0, 1.0);
}