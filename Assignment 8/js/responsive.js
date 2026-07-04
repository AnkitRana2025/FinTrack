const menuBtn = document.querySelector(".menu-btn");

const sidebar = document.querySelector(".sidebar");

const overlay = document.querySelector(".sidebar-overlay");

if (menuBtn && sidebar && overlay) {

    menuBtn.addEventListener("click", () => {

        sidebar.classList.toggle("active");

        overlay.classList.toggle("active");

    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

    });

}
// ==============================
// Auto Close Sidebar
// ==============================

const menuLinks = document.querySelectorAll(".menu a");

menuLinks.forEach(link => {

    link.addEventListener("click", () => {

        if(window.innerWidth <= 768){

            sidebar.classList.remove("active");
            overlay.classList.remove("active");

        }

    });

});
// ==============================
// Resize Fix
// ==============================

window.addEventListener("resize", () => {

    if(window.innerWidth > 768){

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

    }

});