#define conjugate(a) vec2(a.x, - a.y)
#define MAX_DEGREE 10

precision mediump float;

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

vec2 cmul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, dot(a.xy, b.yx));
}

vec2 cdiv(vec2 a, vec2 b) {
    float bdot = dot(b, b);
    return vec2(dot(a, b) / bdot, (a.y * b.x - a.x * b.y) / bdot);
}

// Efficient Complex power
// Let z = r(cos θ + i sin θ)
// Then z^n = r^n (cos nθ + i sin nθ)
vec2 cpow(vec2 a, float n) {
    float angle = atan(a.y, a.x);
    float r = length(a);
    float real = pow(r, n) * cos(n*angle);
    float im = pow(r, n) * sin(n*angle);
    return vec2(real, im);
}

vec2 cpow(vec2 a, int n) {
    return cpow(a, float(n));
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
            if (length(z - u_roots[i]) < u_tolerance)
            {
                return u_colors[i];
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