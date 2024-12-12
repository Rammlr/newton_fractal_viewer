import * as THREE from 'three';
import fragmentShader from './shaders/newton_hardcoded.frag';
import vertexShader from './shaders/shader.vert';
import {createGUI} from "./gui.ts";
import {addControls, getDistanceBetweenTouches} from "./controls.ts";

const TIME_SPEED = 0.05;
const SCROLL_SPEED = 0.005;
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

const stats = createGUI(uniforms);

function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value += TIME_SPEED;
    uniforms.u_scroll.value += (scrollTarget - uniforms.u_scroll.value) * LERP_FACTOR;
    renderer.render(scene, camera);
    stats.update()
}

animate();
