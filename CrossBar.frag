#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
const float PI = 3.1415926; // 円周率を定数値として定義する

float atan2(float y, float x) { // 値の範囲は(-PI,PI]
	if (x == 0.0) {
		return sign(y) * PI / 2.0;
	} else {
		return atan(y, x);
	}
}

vec2 xy2pol(vec2 xy) {
	return vec2(atan2(xy.y, xy.x), length(xy));
}

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
    // p.x = p.x < 0.0 ? 1.0 : p.x;
    // float dynaX = step( 0.1, p.x);
    float dynaX = step( 0.1, fract((cos(u_time) + 1.0) * p.x));
    return dynaX;
}

float moveYBlend(vec2 p) {
    // float dynaY = p.y <= 0.1 && p.y > 0.0 ? 0.0 : p.y;
    // p.y = p.y < 0.0 ? 1.0 : p.y;
    // float dynaY = step( 0.1, p.y);
    float dynaY = step( 0.1, fract((cos(u_time) + 1.0) * p.y));
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

vec3 blendVec3(vec3 a, vec3 b){
    float time = abs(mod(0.1 * u_time, 2.0) - 1.0);
    vec3[2] col2 = vec3[](
        a,
        b
    );
    return mix(col2[0], col2[1], .5);
}

vec3 chromaKeyBlend(vec3 target, vec3 chromaKey, vec3 background) {
    // vec3 blended = target.r == chromaKey.r && target.g == chromaKey.g && target.b == chromaKey.b ? background : target;
    // これでいい
    vec3 blended = target == chromaKey ? background : target;
    // ボーダーと背景でブレンド
    // vec3 blended = target == chromaKey ? background : blendVec3(target, background);
    return blended;
}

void main() {
    float originMv = -0.0;
    vec2 pos = ((gl_FragCoord.xy / u_resolution.xy));
    vec2 posClone = pos;
    pos += originMv;
    // pos *= 2.0 * PI;
    // 極座標変換
    pos = xy2pol(pos);
    vec3[4] col4 = vec3[](
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 1.0, 1.0),
        vec3(0.0, 1.0, 0.0),
        vec3(1.0, 1.0, 0.0)
    );


    // 階数をかけないと四つ窓になっていい感じ
    // posClone = floor(posClone) + step(0.5, fract(posClone));

    float n = 16.0;
    posClone *= n;
    // 階段関数
    posClone = floor(posClone) + step(0.5, fract(posClone));
    // 滑らかな階段関数
    // float thr = 0.25 * sin(u_time);
    // posClone = floor(posClone) + smoothstep(0.1, 0.9, fract(posClone));
    // posClone = floor(posClone) + smoothstep(0.25 + thr, 0.75 - thr, fract(posClone));
    posClone /= n;
    vec3 col = mix(mix(col4[0], col4[1], posClone.x), mix(col4[2], col4[3], posClone.x), posClone.y);
    // メトロノームチックな変な動きする、この2行を積めば積むほどすごい
    // pos *= 
    // pos.x += sin(u_time) * .5;
    pos *= 5.0;
    pos.x += sin(u_time * 4.0) * cos(u_time) * 2.5;
    pos.y += cos(u_time) * 2.5;
    // 簡単にやるなら
    // float crossBar = move(pos);
    // 絶対に足したる！でけたっぽい
    // pos = vec2(moveX(pos), pos.y);
    // float crossBar = moveY(pos);
    // blend使って合成させようとしたけどどっちも0の時しか黒くならない
    float a = moveXBlend(pos);
    float b = moveYBlend(pos);
    
    // vec3 backgroundColor = vec3(1.0, 1.0, 0.0);
    vec3 backgroundColor = col;

    // blend1次元化チャレンジ
    // vec3 crossBar = vec3(blend(a, b));
    // 論理式でボーダーを重ねた
    // vec3 crossBar = vec3(1.0, b, float(uint(a) & uint(b)));
    // ブレンドかかっていい感じ
    // vec3 crossBar = vec3(1.0, b, float(uint(a) ^ uint(b)));

    // or or or
    // 重なる点だけ出てくる
    // お絵描きみたいに模様描いたらいい感じ
    // vec3 crossBar = vec3(float(uint(a) | uint(b)), float(uint(a) | uint(b)), float(uint(a) | uint(b)));
    vec3 crossBar = vec3(float(uint(a) ^ uint(b)), 0.0, float(uint(a) & uint(b)));
    // crossBar = vec3(1.0);
    // vec3 crossBar = blendRGB(a, b);

    // fragColor.rgb = vec3(crossBar);
    fragColor.rgb = crossBar;
    // ブレンドで背景色つけようとした
    // fragColor.rgb = blendVec3(backgroundColor, crossBar);
    // ボーダーをクロマキー
    vec3 chromaKeyColor = vec3(0.0, 0.0, 0.0);
    // vec3 chromaKeyColor = vec3(1.0, 1.0, 1.0);
    // vec3 chromaKeyColor = vec3(1.0, 0.0, 0.0);
    fragColor.rgb = chromaKeyBlend(crossBar, chromaKeyColor, backgroundColor);
    fragColor.a = 1.0;
}