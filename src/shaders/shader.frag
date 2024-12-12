precision highp float;

uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_translate;
uniform float u_time;

float mandelbrot(vec2 c) {
    float alpha = 1.0;
    vec2 z = vec2(0.0, 0.0);
    for (int i = 0; i < 250; i++) {
        float x_sq = z.x * z.x;
        float y_sq = z.y * z.y;
        vec2 z_sq = vec2(x_sq - y_sq, 2.0 * z.x * z.y); // complex square
        z = z_sq + c;
        if (x_sq + y_sq > 4.0) {
            alpha = float(i) / 250.0;
            break;
        }
    }
    return alpha;
}

float draw_rectangle(vec2 st) {
    vec2 bl = step(vec2(0.1), st);
    return bl.x * bl.y;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    st -= 0.5;
    float zoom_factor = exp(u_scroll);
    st *= zoom_factor;
    st += u_translate;

    float pct = mandelbrot(st);

    vec3 color = mix(vec3(1.0), vec3(0.0, 0.0, 0.6), pct);

    gl_FragColor = vec4(color, 1.0);
}