const container = document.getElementById("questionView");
let style = document.createElement("style");
style.id = "collapsibleStyle";
style.innerHTML = `
    .collapsible {
        background-color: #777;
        color: white;
        cursor: pointer;
        padding: 18px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 15px;
    }
    
    .active, .collapsible:hover {
        background-color: #555;
    }
    
    .content {
        padding: 0 18 px;
        display: none;
        overflow: hidden;
        background-color: #f1f1f11;
    }
`;

function makeCollapsible(button) {
    if (!document.getElementById("collapsibleStyle"))
        container.appendChild(style);
    button.addEventListener("click", function() {
        this.classList.toggle("active");
        let i = this.firstElementChild;
        i.className = (this.classList.contains("active")) ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
        let content = this.nextElementSibling;
        if (content.style.display === "block") content.style.display = "none";
        else content.style.display = "block";
    });
}