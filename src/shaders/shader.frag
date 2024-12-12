precision highp float;

uniform vec2 u_resolution;

float mandelbrot(vec2 c) {
    float alpha = 1.0;
    vec2 z = vec2(0.0, 0.0);
    for (int i = 0; i < 250; i++) {
        float x_sq = z.x * z.x;
        float y_sq = z.y * z.y;
        vec2 z_sq = vec2(x_sq - y_sq, 2.0 * z.x * z.y); // complex square
        z = z_sq + c;
        if (x_sq + y_sq > 4.0) {
            alpha = float(i) / 200.0;
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
    st *= 3.0;

    float pct = mandelbrot(st);

    gl_FragColor = vec4(vec3(pct), 1.0);
}