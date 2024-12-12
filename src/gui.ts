import {GUI} from "dat.gui";
// @ts-ignore
import Stats from "three/examples/jsm/libs/stats.module";

export function createGUI(uniforms: any): Stats {
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
    return stats;
}