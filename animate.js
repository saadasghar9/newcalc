document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-animation');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const dots = [];
    const dotCount = 20;

    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 10 + 2,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3,
            phase: Math.random() * Math.PI * 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        dots.forEach(dot => {
            // Pulsing effect
            const pulse = Math.sin(dot.phase) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 123, 255, ${dot.opacity})`; // Blue, calculator-like color
            ctx.fill();

            // Move dots
            dot.x += dot.speedX;
            dot.y += dot.speedY;
            dot.phase += 0.05; // Control pulse speed

            // Bounce off walls
            if (dot.x < 0 || dot.x > canvas.width) dot.speedX *= -1;
            if (dot.y < 0 || dot.y > canvas.height) dot.speedY *= -1;
        });

        requestAnimationFrame(animate);
    }

    animate();
});