const canvas = document.getElementById('backgroundCanvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation variable
        let time = 0;

        // Draw animation
        function draw() {
            // Clear canvas
            ctx.fillStyle = 'rgba(20, 60, 100, 0.5)'; // Base color
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Wave
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2.5;
            for (let x = 0; x <= canvas.width; x += 5) {
                const y = canvas.height / 2 + 
                          Math.sin((x * 0.01) + time) * 50;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

                // Wave 2
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1.5;
            for (let x = 0; x <= canvas.width; x += 5) {
                const y = canvas.height / 2 + 
                          Math.sin((x * 0.015) + time * 1.2) * 40 +
                          Math.cos((x * 0.01) + time * 0.8) * 20;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            
            // Increment time for movement
            time += 0.05;

            // Keep animating
            requestAnimationFrame(draw);
        }

        // Start animation
        draw();