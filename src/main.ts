import * as THREE from 'three';
import { GUI } from 'dat.gui';
import fragmentShader from './shaders/newton_hardcoded.frag';
import vertexShader from './shaders/shader.vert';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const TIME_SPEED = 0.05;
const SCROLL_SPEED = 0.005;
const DRAG_SPEED_X = -1.0;
const DRAG_SPEED_Y = 1.0;
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

canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (!dragging) return;
    const position = new THREE.Vector2(event.x / window.innerWidth, event.y / window.innerHeight);
    const diff = position.sub(lastDragPos);
    lastDragPos = new THREE.Vector2(event.x / window.innerWidth, event.y / window.innerHeight);

    const zoomFactor = Math.exp(uniforms.u_scroll.value);
    const DRAG_SPEED = new THREE.Vector2(DRAG_SPEED_X, DRAG_SPEED_Y).multiplyScalar(zoomFactor);
    uniforms.u_translate.value.add(diff.multiply(DRAG_SPEED));
});

const gui = new GUI()
const iterationParams = gui.addFolder('Iterations')
iterationParams.add(uniforms.u_iterations, 'value', 1, 100);
iterationParams.open()

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
