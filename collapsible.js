const container = document.getElementById("questionView");
let style = document.createElement("style");
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
container.appendChild(style);

function makeCollapsible(button) {
    button.addEventListener("click", function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.display === "block") content.style.display = "none";
        else content.style.display = "block";
    });
}