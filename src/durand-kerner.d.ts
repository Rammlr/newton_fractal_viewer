declare module 'durand-kerner' {
    export default function findRoots(
        r_coeff: number[],
        i_coeff?: number[] | null,
        n_iters?: number,
        tolerance?: number,
        zr?: number[],
        zi?: number[]
    ): [number[], number[]];
}