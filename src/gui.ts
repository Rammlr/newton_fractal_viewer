import {GUI} from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export function createGUI(uniforms: any, bloomPass: UnrealBloomPass): Stats {
    const gui = new GUI()
    const iterationParams = gui.addFolder('Iteration Parameters')
    iterationParams.add(uniforms.u_iterations, 'value', 1, 100).name('Iterations');
    iterationParams.add(uniforms.u_tolerance, 'value', 0.0001, 1).name('Tolerance');
    iterationParams.open();
    const postProcessingParams = gui.addFolder('Post Processing');
    const bloomParams = postProcessingParams.addFolder('Bloom');
    bloomParams.add(bloomPass, 'strength', 0., 2.).name('Strength');
    bloomParams.add(bloomPass, 'radius', 0., 2.).name('Radius');
    bloomParams.add(bloomPass, 'threshold', 0., 1.).name('Threshold');
    gui.add(uniforms.u_mode, 'value', {'Degree 3': 0, 'Degree 8': 1}).name('Mode');
    // TODO: color parameters
    // const customizationParams = gui.addFolder('Customization')
    // customizationParams.add(uniforms.u_resolution.value, 'x', 1, 1920).name('Resolution X');
    // customizationParams.open()

    const stats = new Stats()
    document.body.appendChild(stats.dom)
    return stats;
}