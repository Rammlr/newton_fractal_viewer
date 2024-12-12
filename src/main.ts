import * as THREE from 'three';
import { GUI } from 'dat.gui';
import fragmentShader from './shaders/newton_hardcoded.frag';
import vertexShader from './shaders/shader.vert';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const aspectRatio = window.innerWidth / window.innerHeight;

const TIME_SPEED = 0.05;
const SCROLL_SPEED = 0.005;
const DRAG_SPEED_X = -1.0;
const DRAG_SPEED_Y = -DRAG_SPEED_X / aspectRatio;
const LERP_FACTOR = 0.025;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    -1, 1, 1, -1,
    0.1, 10
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const canvas = renderer.domElement;
document.body.appendChild(canvas);

let uniforms = {
    u_resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_scroll: {value: 1.0},
    u_translate: {value: new THREE.Vector2(0.0, 0.0)},
    u_time: {value: 0.0},
    u_iterations: {value: 50},
    u_tolerance: {value: 0.001},
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
    material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

let scrollTarget = uniforms.u_scroll.value;

canvas.addEventListener('wheel', (event: WheelEvent) => {
    scrollTarget += event.deltaY * SCROLL_SPEED;
});

let dragging = false;
let lastDragPos = new THREE.Vector2(0, 0);

canvas.addEventListener('mousedown', (event: MouseEvent) => {
    dragging = true;
    lastDragPos = new THREE.Vector2(event.x / window.innerWidth, event.y / window.innerHeight);
});

canvas.addEventListener('mouseup', () => {
    dragging = false;
});

function updateTranslate(x: number, y: number) {
    const position = new THREE.Vector2(x / window.innerWidth, y / window.innerHeight);
    const diff = position.sub(lastDragPos);
    lastDragPos = new THREE.Vector2(x / window.innerWidth, y / window.innerHeight);

    const zoomFactor = Math.exp(uniforms.u_scroll.value);
    const DRAG_SPEED = new THREE.Vector2(DRAG_SPEED_X, DRAG_SPEED_Y).multiplyScalar(zoomFactor);
    uniforms.u_translate.value.add(diff.multiply(DRAG_SPEED));
}

canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (!dragging) return;
    updateTranslate(event.x, event.y);
});

canvas.addEventListener('touchstart', (event: TouchEvent) => {
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        lastDragPos = new THREE.Vector2(touch.clientX / window.innerWidth, touch.clientY / window.innerHeight);
    }
});

canvas.addEventListener('touchmove', (event: TouchEvent) => {
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        updateTranslate(touch.clientX, touch.clientY);
    }
});

const gui = new GUI()
const iterationParams = gui.addFolder('Iteration Parameters')
iterationParams.add(uniforms.u_iterations, 'value', 1, 100).name('Iterations');
iterationParams.add(uniforms.u_tolerance, 'value', 0.0001, 1).name('Tolerance');
iterationParams.open()
// TODO: color parameters
// const customizationParams = gui.addFolder('Customization')
// customizationParams.add(uniforms.u_resolution.value, 'x', 1, 1920).name('Resolution X');
// customizationParams.open()

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value += TIME_SPEED;
    uniforms.u_scroll.value += (scrollTarget - uniforms.u_scroll.value) * LERP_FACTOR;
    renderer.render(scene, camera);
    stats.update()
}

animate();
