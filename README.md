# 🌟 **Newton Fractal Viewer** 🌟

A THREE.js based fractal viewer for rendering Newton fractals in real-time.

![newton_fractal_demo_new.gif](newton_fractal_demo_new.gif)

## 🛠️ **Features** 🛠️

### ✅ **Implemented**

- **Interactive Zooming and Panning**🔎
- **Real-Time Rendering** 🚀
- **Customization**:
    - **Polynomials** ➗
    - **Coloring** 🎨
    - **Iterations Parameters** 🔁
- **Mobile Support** 📱
- **Post Processing Effects** 🎨

### 📝 **Planned**

- **More Post Processing Effects**

## 🤔 How does it work? 🤔

https://en.wikipedia.org/wiki/Newton_fractal

Once a polynomial is entered, we automatically calculate the derivative and the roots (via Durand-Kerner iteration) of
the polynomial.
We then render the fractal by iterating over each pixel and applying Newton's method to find the root that the pixel
converges to.
We then color the pixel based on the root that it converges to.

This is a short summary since i could not be bothered to write up more for the readme but feel free to contact me if you
have any questions.

## 🚀 **Usage** 🚀

To start the viewer, run the development server:

```bash
npm run dev
