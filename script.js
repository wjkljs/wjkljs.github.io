/* ============================================
   梁静诗 · 个人简历
   交互脚本：主题切换 / 鼠标光斑 / 导航高亮 /
            返回顶部 / 粒子动画
   ============================================ */

(function () {
    'use strict';

    // 标记 JS 已加载，配合 CSS .js .card 实现无 JS 时卡片可见
    document.documentElement.classList.add('js');

    /* ---------- 1. 主题切换（浅色 / 深色） ---------- */
    const themeBtn = document.getElementById('themeBtn');
    const htmlDom = document.documentElement;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // 应用指定主题并更新按钮图标
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlDom.setAttribute('data-theme', 'dark');
            themeBtn.textContent = '☀️';
        } else {
            htmlDom.removeAttribute('data-theme');
            themeBtn.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
    }

    applyTheme(currentTheme);
    themeBtn.onclick = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    };

    /* ---------- 2. 鼠标跟随光斑 ---------- */
    const mouseLight = document.getElementById('mouse-light');
    document.addEventListener('mousemove', (e) => {
        mouseLight.style.left = e.clientX + 'px';
        mouseLight.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseleave', () => (mouseLight.style.opacity = '0'));
    document.addEventListener('mouseenter', () => (mouseLight.style.opacity = '1'));

    /* ---------- 3. 导航栏滚动加深 + 区块高亮 + 返回顶部按钮 ---------- */
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    const backTopBtn = document.querySelector('.back-top');

    function onScroll() {
        // 导航栏样式切换
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 区块高亮判断
        let currentId = '';
        sections.forEach((sec) => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.offsetHeight;
            if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
                currentId = sec.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });

        // 返回顶部按钮显示控制
        if (window.scrollY > 400) {
            backTopBtn.classList.add('show');
        } else {
            backTopBtn.classList.remove('show');
        }
    }

    window.addEventListener('scroll', onScroll);
    onScroll();

    // 返回顶部逻辑
    backTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ---------- 4. 卡片入场动画（IntersectionObserver） ---------- */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target); // 只入场一次
                }
            });
        },
        { threshold: 0.15 }
    );
    document.querySelectorAll('.card').forEach((card) => revealObserver.observe(card));

    /* ---------- 5. 粒子系统 ---------- */
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];

    // 画布尺寸跟随窗口
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 单个粒子：位置、速度、颜色、透明度
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? '184, 163, 227' : '255, 209, 232';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            // 越界后回到随机位置
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // 根据画布面积决定粒子数量
    function initParticles() {
        particles = [];
        const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    // 距离小于阈值的粒子之间绘制连线
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dis = Math.sqrt(dx * dx + dy * dy);
                if (dis < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(184, 163, 227, ${0.15 * (1 - dis / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // 动画主循环
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
})();
