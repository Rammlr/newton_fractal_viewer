import * as THREE from 'three';
import fragmentShader from './shaders/newton.frag';
import vertexShader from './shaders/shader.vert';
import {createGUI, DEFAULT_COLOR_PALETTE, MAX_DEGREE} from "./gui.ts";
import {addControls, getDistanceBetweenTouches} from "./controls.ts";
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {padArrayToLength} from "./util.ts";

const TIME_SPEED = 0.05;
const SCROLL_SPEED = 0.005;
const LERP_FACTOR = 2.0;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    -1, 1, 1, -1,
    0.1, 10
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
const canvas = renderer.domElement;
document.body.appendChild(canvas);

const renderPass = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.01, 0.01, 0.2
);
composer.addPass(bloomPass);

const defaultCoefficients = [-1., 0., 0., 1.]; // z^3 - 1
const defaultDerivative = [0., 0., 3.]; // 3x^2
const defaultRoots = [new THREE.Vector2(1, 0), new THREE.Vector2(-0.5, Math.sqrt(3) / 2), new THREE.Vector2(-0.5, -Math.sqrt(3) / 2)];

const polynomial = {
    degree: 3,
    coefficients: defaultCoefficients,
    colors: [DEFAULT_COLOR_PALETTE[0], DEFAULT_COLOR_PALETTE[1], DEFAULT_COLOR_PALETTE[2]]
};

const uniforms = { // arrays in here have to be padded to the max length
    u_resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_scroll: {value: 1.0},
    u_translate: {value: new THREE.Vector2(0.0, 0.0)},
    u_time: {value: 0.0},
    u_iterations: {value: 50},
    u_tolerance: {value: 0.001},
    u_degree: {value: polynomial.degree},
    u_polynomial: {value: padArrayToLength(polynomial.coefficients, MAX_DEGREE, 0.)},
    u_colors: {value: padArrayToLength(polynomial.colors.map((color) => new THREE.Color(color)), MAX_DEGREE, new THREE.Color(0xffffff))},
    u_derivative: {value: padArrayToLength(defaultDerivative, MAX_DEGREE, 0.)},
    u_roots: {value: padArrayToLength(defaultRoots, MAX_DEGREE, new THREE.Vector2(0, 0))}
}

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

addControls(canvas, uniforms);

// scroll logic has to be in here because of lerping in the render loop
let scrollTarget = uniforms.u_scroll.value;

canvas.addEventListener('wheel', (event: WheelEvent) => {
    scrollTarget += event.deltaY * SCROLL_SPEED;
});

let lastFingerDistance = 0;

canvas.addEventListener('touchstart', (event: TouchEvent) => {
    if (event.touches.length === 2) {
        event.preventDefault();
        lastFingerDistance = getDistanceBetweenTouches(event.touches[0], event.touches[1]);
    }
});

canvas.addEventListener('touchmove', (event: TouchEvent) => {
    if (event.touches.length === 2) {
        event.preventDefault(); // Prevent default pinch behavior like browser zoom
        const currentDistance = getDistanceBetweenTouches(event.touches[0], event.touches[1]);

        const deltaDistance = currentDistance - lastFingerDistance;
        scrollTarget += deltaDistance * -SCROLL_SPEED;
        lastFingerDistance = currentDistance;
    }
});

const stats = createGUI(uniforms, bloomPass, polynomial);

const clock = new THREE.Clock();
let delta = 0;

function animate() {
    requestAnimationFrame(animate);
    delta = clock.getDelta();
    uniforms.u_time.value += TIME_SPEED * delta;
    uniforms.u_scroll.value += (scrollTarget - uniforms.u_scroll.value) * LERP_FACTOR * delta;
    composer.render();
    stats.update();
}

animate();
