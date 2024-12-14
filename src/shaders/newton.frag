#define cmul(a, b) vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x)
#define conjugate(a) vec2(a.x, - a.y)
#define cdiv(a, b) vec2(((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y)), ((a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y)))
#define MAX_DEGREE 10

precision highp float;

uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_translate;
uniform float u_time;
uniform int u_iterations;
uniform float u_tolerance;
uniform int u_degree;
uniform float[MAX_DEGREE] u_polynomial;
uniform vec3[MAX_DEGREE] u_colors;
uniform float[MAX_DEGREE] u_derivative;
uniform vec2[MAX_DEGREE] u_roots;

vec2 cpow(vec2 z, int n) {
    vec2 result = vec2(1.0, 0.0);
    for (int i = 0; i < n; i++) {
        result = cmul(result, z);
    }
    return result;
}

// evaluate the polynomial at z
vec2 p(vec2 z) {
    vec2 result = vec2(0.0);
    for (int i = 0; i <= u_degree; i++) {
        if (u_polynomial[i] == 0.0) continue;
        result += u_polynomial[i] * cpow(z, i);
    }
    return result;
}
// evaluate the derivative of the polynomial at z
vec2 dp(vec2 z)
{
    vec2 result = vec2(0.0);
    for (int i = 0; i <= u_degree - 1; i++) {
        if (u_derivative[i] == 0.0) continue;
        result += u_derivative[i] * cpow(z, i);
    }
    return result;
}

vec3 newton_fractal(vec2 z) {
    for (int i = 0; i < u_iterations; i++) {
        z -= cdiv(p(z), dp(z));
        for (int i = 0; i < u_degree; i++) {
            vec2 difference = z - u_roots[i];
            if (length(difference) < u_tolerance)
            {
                return u_colors[i]; // brightness depending on convergence speed
                //                return u_colors[i] * (1. - float(i) / float(u_iterations)); // brightness depending on convergence speed
            }
        }
    }

    return vec3(0.0);
}

void main() {
    // this is a bit of a workaround to make the fractal cropped instead of stretched depending on window resolution
    float minRes = min(u_resolution.x, u_resolution.y);
    vec2 st = gl_FragCoord.xy / vec2(minRes, minRes);
    // centering the coordinates
    st -= vec2(u_resolution.x / minRes, u_resolution.y / minRes) * 0.5;

    float zoom_factor = exp(u_scroll);
    st *= zoom_factor;
    st += u_translate;

    vec3 color = vec3(0.0);
    color = newton_fractal(st);

    gl_FragColor = vec4(color, 1.0);
}