import * as THREE from "three";
import {GUI, GUIController} from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {calculatePolynomialDerivative} from "./polynomial-derivative.ts";
import {getSortedRoots, padArrayToLength, removeTrailingZeros} from "./util.ts";
import {HARMONIZED_COLORS} from "./palettes.ts";

export const MAX_DEGREE = 10;
export let DEFAULT_COLOR_PALETTE = HARMONIZED_COLORS;

function updatePolynomialParameters(uniforms: any, polynomial: any) {
    const coefficients = removeTrailingZeros(polynomial.coefficients.slice(0, polynomial.degree + 1));
    const degree = coefficients.length - 1;
    const sortedRoots = getSortedRoots(coefficients);
    uniforms.u_degree.value = degree;
    uniforms.u_polynomial.value = padArrayToLength(coefficients, MAX_DEGREE, 0.);
    uniforms.u_colors.value = padArrayToLength(polynomial.colors.map((color: number) => new THREE.Color(color)), MAX_DEGREE, new THREE.Color(0xffffff));
    uniforms.u_derivative.value = padArrayToLength(calculatePolynomialDerivative(coefficients), MAX_DEGREE, 0.);
    uniforms.u_roots.value = padArrayToLength(sortedRoots, MAX_DEGREE, new THREE.Vector2(0, 0));
}

const coefficientControllers: GUIController[] = [];
const colorControllers: GUIController[] = [];

function updatePolynomialInputs(coefficientsFolder: GUI, colorsFolder: GUI, polynomial: any) {
    coefficientControllers.forEach((controller) => coefficientsFolder.remove(controller));
    colorControllers.forEach((controller) => colorsFolder.remove(controller));
    coefficientControllers.length = 0;
    colorControllers.length = 0;

    for (let i = 0; i <= polynomial.degree; i++) {
        if (polynomial.coefficients[i] === undefined) {
            polynomial.coefficients[i] = 0.;
        }
        if (polynomial.colors[i] === undefined) {
            polynomial.colors[i] = DEFAULT_COLOR_PALETTE[i];
        }
        coefficientControllers[i] = coefficientsFolder.add(polynomial.coefficients, i).name(`Coefficient x^${i}`);

        if (i < polynomial.degree) {
            // @ts-ignore the fact that we are passing a number as a string because it works like above
            colorControllers[i] = colorsFolder.addColor(polynomial.colors, i).name(`Color ${i + 1}`);
        }
    }
}

export function createGUI(uniforms: any, bloomPass: UnrealBloomPass, polynomial: any): Stats {
    const gui = new GUI()

    const iterationParams = gui.addFolder('Iteration Parameters')
    iterationParams.add(uniforms.u_iterations, 'value', 1, 100).name('Iterations');
    iterationParams.add(uniforms.u_tolerance, 'value', 0.0001, 1).name('Tolerance');
    iterationParams.open();

    const polynomialParams = gui.addFolder('Polynomial');
    const button = {
        updatePolynomialParams: function () {
            updatePolynomialParameters(uniforms, polynomial);
        }
    };
    polynomialParams.add(button, 'updatePolynomialParams').name('Update Polynomial Parameters');
    const degreeController = polynomialParams.add(polynomial, 'degree', 0, 10)
        .step(1).name('Degree');
    const coefficientsFolder = polynomialParams.addFolder('Coefficients');
    const colorsFolder = polynomialParams.addFolder('Colors');
    updatePolynomialInputs(coefficientsFolder, colorsFolder, polynomial);

    // change amount of coefficient inputs depending on degree
    degreeController.onChange((value) => {
        polynomial.degree = Math.round(value);
        updatePolynomialInputs(coefficientsFolder, colorsFolder, polynomial);
    });

    const postProcessingParams = gui.addFolder('Post Processing');
    const bloomParams = postProcessingParams.addFolder('Bloom');
    bloomParams.add(bloomPass, 'strength', 0., 2.).name('Strength');
    bloomParams.add(bloomPass, 'radius', 0., 2.).name('Radius');
    bloomParams.add(bloomPass, 'threshold', 0., 1.).name('Threshold');

    const stats = new Stats()
    document.body.appendChild(stats.dom)
    return stats;
}