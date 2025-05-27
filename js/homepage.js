const dateNow = new Date();
let updatesInfo = [];
const updatesDiv = document.getElementById("updates");
const divPerPage = 5;
let currentPage = 0;
let pages;

function createPages() {
    const updateList = document.getElementById("updateList");
    for (let i = 0; i < pages; i++) {
        const newNode = document.createElement("li");
        newNode.className = "page-item";
        newNode.innerHTML = `
            <a class="page-link" id="page${i}" href="javascript:renderPage(${i})">${i+1}</a>
        `;
        updateList.insertBefore(newNode, updateList.lastElementChild);
    }
}
function renderPage(page=0) {
    if (page < 0 || page >= pages) return;
    document.getElementById("page"+currentPage).classList.remove("active");
    document.getElementById("page"+currentPage).ariaCurrent = null;
    updatesDiv.innerHTML = "";
    for (let i = 0; i < divPerPage; i++) {
        if (page*divPerPage+i >= updatesInfo.length) break;
        updatesDiv.appendChild(updatesInfo[page*divPerPage+i]);
    }
    document.getElementById("page"+page).classList.add("active");
    document.getElementById("page"+page).ariaCurrent = "page";
    currentPage = page;
}

fetch("updates.json")
    .then(response => response.json())
    .then(data => {
        for (const update of data.updates) {
            const div = document.createElement("div");
            const date = new Date(update.date);
            const day = Math.floor((dateNow-date) / 86400000);
            let dayAgo;
            if (day > 1) dayAgo = day + " days ago";
            else if (day === 1) dayAgo = "Yesterday";
            else dayAgo = "Today";
            div.className = "container py-2 border-bottom";
            div.innerHTML = `
                <div class="row justify-content-start">
                    <div class="col">
                        <p>${update.content}</p>
                    </div>
                </div>
                <div class="row justify-content-end">
                    <div class="col-lg-2">
                        <p>${dayAgo}</p>
                    </div>
                </div>
            `;
            updatesInfo.push(div);
        }
        pages = Math.ceil(updatesInfo.length/divPerPage)
        createPages();
        renderPage();
    })
    .catch(error => {
        console.log("Error loading update information: ", error);
        const div = document.createElement("div");
        div.className = "container py-2 text-center";
        div.innerHTML = `<p>Fail to load update information</p>`;
        document.getElementById("updates").appendChild(div);
    });