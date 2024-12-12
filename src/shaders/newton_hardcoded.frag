#define cmul(a, b) vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x)
#define conjugate(a) vec2(a.x, - a.y)
#define cdiv(a, b) vec2(((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y)), ((a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y)))

precision highp float;

uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_translate;
uniform float u_time;
uniform int u_iterations;

vec2 cpow(vec2 z, int n) {
    vec2 result = vec2(1.0, 0.0);
    for (int i = 0; i < n; i++) {
        result = cmul(result, z);
    }
    return result;
}

//z^3-1
vec2 z_3(vec2 z)
{
    return cpow(z, 3) - vec2(1., 0.);
}

//3*z^2
vec2 dz_3(vec2 z)
{
    return 3. * cmul(z, z);
}

vec3 newton_fractal(vec2 z) {
    const int ROOTS_SIZE = 3;
    const float TOLERANCE = 0.001;
    vec2 roots[ROOTS_SIZE] = vec2[](vec2(1., 0.), vec2(-.5, sqrt(3.) / 2.), vec2(-.5, -sqrt(3.) / 2.));
    vec3 colors[ROOTS_SIZE] = vec3[](vec3(1., 0., 0.), vec3(0., 1., 0.), vec3(0., 0., 1.));

    for (int i = 0; i < u_iterations; i++) {
        z -= cdiv(z_3(z), dz_3(z));
            for (int i = 0; i < ROOTS_SIZE; i++) {
                vec2 difference = z - roots[i];

                if (length(difference) < TOLERANCE)
                {
                    return colors[i] * (1. - float(i) / float(u_iterations)); // brightness depending on convergence speed
                }
            }
    }

    return vec3(0.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    st -= 0.5;
    float zoom_factor = exp(u_scroll);
    st *= zoom_factor;
    st += u_translate;

    vec3 color = newton_fractal(st);

    gl_FragColor = vec4(color, 1.0);
}