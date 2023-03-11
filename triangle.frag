#version 300 es
precision mediump float;
out vec4 a_Color;
uniform vec2 u_resolution;

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

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy)
        / min(u_resolution.x, u_resolution.y);
    float a = createTriangle(uv, vec2(-0.5, -0.5), vec2(0.0, 0.5), vec2(0.5, -0.5));
    a_Color = vec4(vec3(a), 1.0);
}