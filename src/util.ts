import findRoots from "durand-kerner";
import * as THREE from "three";

const EPSILON = 1e-6;

export function padArrayToLength<T>(arr: T[], length: number, value: T) {
    if (arr.length >= length) {
        return arr;
    }
    return arr.concat(Array(length - arr.length).fill(value));
}

export function removeTrailingZeros(arr: number[]): number[] {
    let i = arr.length - 1;
    while (Math.abs(arr[i]) < EPSILON && i > 0) {
        i--;
    }
    return arr.slice(0, i + 1);
}

export function getSortedRoots(coefficients: number[]): THREE.Vector2[] {
    const roots = findRoots(coefficients);
    const realRoots = roots[0];
    const imaginaryRoots = roots[1];
    return realRoots.map((x, i) => new THREE.Vector2(x, imaginaryRoots[i]))
        .sort((a, b) => {
            if (a.x === b.x) {
                return b.y - a.y;
            }
            return b.x - a.x;
        });
}