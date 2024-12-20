#define cmul(a, b) vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x)
#define conjugate(a) vec2(a.x, - a.y)
#define cdiv(a, b) vec2(((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y)), ((a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y)))
// NOTE: these are not optimized as this file is no longer in use
precision highp float;

uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_translate;
uniform float u_time;
uniform int u_iterations;
uniform float u_tolerance;
uniform int u_mode; // 0 = degree 3, 1 = degree 8

vec2 cpow(vec2 z, int n) {
    vec2 result = vec2(1.0, 0.0);
    for (int i = 0; i < n; i++) {
        result = cmul(result, z);
    }
    return result;
}

// z^8 + 15z^4 − 16
vec2 z_8(vec2 z) {
    return cpow(z, 8) + 15. * cpow(z, 4) - vec2(16.0, 0.0);
}

// derivative of the above
vec2 dz_8(vec2 z)
{
    return 8. * cpow(z, 7) + 60. * cpow(z, 3);
}

// z^3-1
vec2 z_3(vec2 z)
{
    return cpow(z, 3) - vec2(1., 0.);
}

// derivative of the above
vec2 dz_3(vec2 z)
{
    return 3. * cmul(z, z);
}

vec3 newton_fractal_degree_8(vec2 z) {
    const int ROOTS_SIZE = 8;
    vec2 roots[ROOTS_SIZE] = vec2[](
    vec2(1., 0.), vec2(0., 1.),
    vec2(-1., 0.), vec2(0., -1.),
    vec2(1. / sqrt(2.), 1. / sqrt(2.)), vec2(-1. / sqrt(2.), 1. / sqrt(2.)),
    vec2(1. / sqrt(2.), -1. / sqrt(2.)), vec2(-1. / sqrt(2.), -1. / sqrt(2.))
    );
    vec3 colors[ROOTS_SIZE] = vec3[](
    vec3(0.9, 0.1, 0.3), vec3(0.1, 0.8, 0.2),
    vec3(0.2, 0.4, 1.0), vec3(0.9, 0.7, 0.1),
    vec3(0.6, 0.3, 0.8), vec3(0.0, 0.6, 0.8),
    vec3(0.8, 0.2, 0.5), vec3(0.3, 0.3, 0.3)
    );

    for (int i = 0; i < u_iterations; i++) {
        z -= cdiv(z_8(z), dz_8(z));
        for (int i = 0; i < ROOTS_SIZE; i++) {
            vec2 difference = z - roots[i];

            if (length(difference) < u_tolerance)
            {
                return colors[i] * (1. - float(i) / float(u_iterations)); // brightness depending on convergence speed
            }
        }
    }

    return vec3(0.0);
}

vec3 newton_fractal_degree_3(vec2 z) {
    const int ROOTS_SIZE = 3;
    vec2 roots[ROOTS_SIZE] = vec2[](vec2(1., 0.), vec2(-.5, sqrt(3.) / 2.), vec2(-.5, -sqrt(3.) / 2.));
    vec3 colors[ROOTS_SIZE] = vec3[](vec3(1., 0., 0.), vec3(0., 1., 0.), vec3(0., 0., 1.));

    for (int i = 0; i < u_iterations; i++) {
        z -= cdiv(z_3(z), dz_3(z));
        for (int i = 0; i < ROOTS_SIZE; i++) {
            vec2 difference = z - roots[i];

            if (length(difference) < u_tolerance)
            {
                return colors[i] * (1. - float(i) / float(u_iterations)); // brightness depending on convergence speed
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
    if (u_mode == 0) {
        color = newton_fractal_degree_3(st);
    } else if (u_mode == 1) {
        color = newton_fractal_degree_8(st);
    }

    gl_FragColor = vec4(color, 1.0);
}