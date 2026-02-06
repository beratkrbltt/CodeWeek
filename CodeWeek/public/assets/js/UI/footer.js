const footer = document.getElementById("footer-main");

if (footer) {
    footer.innerHTML = `
        <div class="footer-brand">
            <i class="fa-solid fa-code" aria-hidden="true"></i>
            <span>CodeWeek</span>
        </div>

        <nav class="footer-nav" aria-label="Footer navigation">
            <a href="">Privacy</a>
            <a href="">Terms</a>
            <a href="">Contact</a>
        </nav>

        <p class="footer-copy">
            © 2026 CodeWeek. Created by <a href="https://www.linkedin.com/in/berat-karabulut-2791bb277/" class="footerLink">Berat KARABULUT</a>
        </p>
    `;
}
