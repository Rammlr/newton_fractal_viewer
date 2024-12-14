export function calculatePolynomialDerivative(coefficients: number[]): number[] {
    if (coefficients.length <= 1) {
        return [];
    }
    return coefficients
        .map((coef, index) => coef * index) // Multiply by the power of x (index)
        .slice(1); // Remove the first term (constant)
}