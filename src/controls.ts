import * as THREE from "three";

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const DRAG_SPEED_X = -1.0;
const DRAG_SPEED_Y = -DRAG_SPEED_X / ASPECT_RATIO;

let dragging = false;
let lastDragPos = new THREE.Vector2(0, 0);

export function getDistanceBetweenTouches(touch1: Touch, touch2: Touch) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateTranslate(uniforms: any, x: number, y: number) {
    const position = new THREE.Vector2(x / window.innerWidth, y / window.innerHeight);
    const diff = position.sub(lastDragPos);
    lastDragPos = new THREE.Vector2(x / window.innerWidth, y / window.innerHeight);

    const zoomFactor = Math.exp(uniforms.u_scroll.value);
    const DRAG_SPEED = new THREE.Vector2(DRAG_SPEED_X, DRAG_SPEED_Y).multiplyScalar(zoomFactor);
    uniforms.u_translate.value.add(diff.multiply(DRAG_SPEED));
}

let scrolling_mobile = false;

function addMobileControls(canvas: HTMLCanvasElement, uniforms: any): void {
    canvas.addEventListener('touchstart', (event: TouchEvent) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            lastDragPos = new THREE.Vector2(touch.clientX / window.innerWidth, touch.clientY / window.innerHeight);
        }
    });

    canvas.addEventListener('touchmove', (event: TouchEvent) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            if (scrolling_mobile) {
                // just stopped scrolling, save last position of remaining touch so we dont have any jitter
                scrolling_mobile = false;
                lastDragPos = new THREE.Vector2(touch.clientX / window.innerWidth, touch.clientY / window.innerHeight);
            }
            updateTranslate(uniforms, touch.clientX, touch.clientY);
        } else if (event.touches.length === 2) {
            scrolling_mobile = true;
        }
    });
}

export function addControls(canvas: HTMLCanvasElement, uniforms: any): void {
    canvas.addEventListener('mousedown', (event: MouseEvent) => {
        dragging = true;
        lastDragPos = new THREE.Vector2(event.x / window.innerWidth, event.y / window.innerHeight);
    });

    canvas.addEventListener('mouseup', () => {
        dragging = false;
    });

    canvas.addEventListener('mousemove', (event: MouseEvent) => {
        if (!dragging) return;
        updateTranslate(uniforms, event.x, event.y);
    });

    addMobileControls(canvas, uniforms);
}