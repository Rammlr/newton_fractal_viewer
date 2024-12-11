import * as THREE from 'three';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    -1, 1, 1, -1, // Bounds of the canvas
    0.1, 10       // Near and far clipping planes
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const fragmentShader = `
    void main() {
        // Set the fragment color to red
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

const vertexShader = `
    void main() {
        // Pass the position directly to the fragment shader
        gl_Position = vec4(position, 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    fragmentShader
});

const geometry = new THREE.PlaneGeometry(2, 2);

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
