const btnBackToTop = document.getElementById("btn-back-to-top");
btnBackToTop.type = "button";
btnBackToTop.className = "btn btn-primary";
btnBackToTop.innerHTML = `<i class="bi bi-arrow-up"></i>`;

window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        btnBackToTop.style.display = "block";
    }
    else {
        btnBackToTop.style.display = "none";
    }
}
btnBackToTop.addEventListener("click", () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});