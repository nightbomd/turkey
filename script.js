const turkey = document.querySelector(".cartoon");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const animations = [];
const cycle = 2400;

// Two uneven bursts, a big hop, then a beat to settle back onto the snow.
const beats = [
    [0, 0], [0.08, 0], [0.12, -1], [0.16, 0.8], [0.21, -0.65],
    [0.27, 0], [0.36, 0], [0.4, 1], [0.45, -0.85], [0.51, 0.7],
    [0.58, 0], [0.67, 0], [0.74, 1.35], [0.81, -0.35], [0.88, 0], [1, 0]
];

function shake(part, pose, delay = 0) {
    const frames = beats.map(([offset, amount]) => ({
        offset,
        transform: pose(amount),
        easing: "ease-in-out"
    }));
    // Add motion to the illustration's existing centering, tilt and mirrored wings.
    animations.push(part.animate(frames, {
        duration: cycle,
        iterations: Infinity,
        composite: "add",
        delay
    }));
}

function updateMotion() {
    animations.splice(0).forEach(animation => animation.cancel());
    if (reducedMotion.matches) return;

    // The feet trade kicks on opposite beats while the body twists into each hop.
    turkey.querySelectorAll(".leg").forEach((leg, index) => {
        const steps = [0, -28, 0, 15, 0].map(angle => ({
            transform: `rotate(${angle}deg)`,
            easing: "ease-in-out"
        }));
        animations.push(leg.animate(steps, {
            duration: 800,
            delay: -400 * index,
            iterations: Infinity,
            composite: "add"
        }));
    });
    shake(turkey, n => `translate(${n * 1.3}vmin, ${-n * n * 1.8}vmin) rotateY(${n * 18}deg) rotate(${n * 6}deg)`);
    turkey.querySelectorAll(".wing").forEach(wing => {
        shake(wing, n => `rotate(${n * 24}deg)`);
    });
    turkey.querySelectorAll(".tail").forEach((feather, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        shake(feather, n => `rotate(${direction * n * 5}deg)`, i * 9);
    });
    turkey.querySelectorAll(".head, .hat-top, .hat-bottom").forEach(part => {
        const lag = part.classList.contains("head") ? 0 : 45;
        shake(part, n => `translateY(${-Math.abs(n) * 1.2}vmin) rotate(${-n * 5}deg)`, lag);
    });
}

updateMotion();
reducedMotion.addEventListener("change", updateMotion);

// Alternate complementary hues at the original pace of 30 degrees per 300 ms.
const feathers = turkey.querySelectorAll(".tail");
let colorFrame;

function updateColors() {
    cancelAnimationFrame(colorFrame);
    if (reducedMotion.matches) {
        feathers.forEach(feather => feather.style.removeProperty("--plume"));
        return;
    }

    const start = performance.now();
    function paintColors(now) {
        const hue = ((now - start) / 10) % 360;
        feathers.forEach((feather, index) => {
            const color = (hue + (index % 2) * 180) % 360;
            feather.style.setProperty("--plume", `hsl(${color}, 100%, 50%)`);
        });
        colorFrame = requestAnimationFrame(paintColors);
    }
    colorFrame = requestAnimationFrame(paintColors);
}

updateColors();
reducedMotion.addEventListener("change", updateColors);

const passages = Array.from(document.querySelectorAll(".passages p"));
const previousPage = document.getElementById("previous-page");
const nextPage = document.getElementById("next-page");
const pageCount = document.getElementById("page-count");
let currentPage = 0;

function turnPage(index) {
    currentPage = index;
    passages.forEach((paragraph, i) => paragraph.classList.toggle("off-page", i !== index));
    pageCount.textContent = `${index + 1} / ${passages.length}`;
    previousPage.disabled = index === 0;
    nextPage.textContent = index === passages.length - 1 ? "Read again ↺" : "Next →";
}

previousPage.addEventListener("click", () => turnPage(Math.max(0, currentPage - 1)));
nextPage.addEventListener("click", () => turnPage((currentPage + 1) % passages.length));