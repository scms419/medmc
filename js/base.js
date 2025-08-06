const buttonsDiv = document.getElementById("buttons");

if (buttonsDiv) {
    buttonsDiv.className = "container-fluid px-5 py-3 bg-body-tertiary d-flex justify-content-evenly fixed-bottom border-top";
    const div = document.createElement("div");
    div.style = `height: 63px`;
    document.getElementsByTagName("body")[0].appendChild(div);
}

function keysValid(obj, arr) {
    const keys = Object.keys(obj);
    if (keys.length !== arr.length) return false;
    for (let i in keys) {
        if (keys[i] !== arr[i]) return false;
    }
    return true;
}

function validateJSON(data) {
    if (!keysValid(data, ["courses", "questions"])) return false;
    for (const level of Object.keys(data.courses)) {
        for (const course of Object.keys(data.courses[level])) {
            const obj = data.courses[level][course];
            if (!keysValid(obj, ["byYear", "byTopic"])) return false;
            for (const year of Object.keys(obj.byYear)) {
                if (obj.byYear[year].length === 0) return false;
                for (const code of obj.byYear[year]) {
                    if (!Object.keys(data.questions).includes(code)) return false;
                }
            }
            for (const topic of Object.keys(obj.byTopic)) {
                if (obj.byTopic[topic].length === 0) return false;
                for (const code of obj.byTopic[topic]) {
                    if (!Object.keys(data.questions).includes(code)) return false;
                }
            }
        }
    }
    for (const question of Object.keys(data.questions)) {
        if (!keysValid(data.questions[question],
            ["year", "course", "question_number", "level", "topic", "question", "options", "answer", "explanation"]))
            return false;
    }
    return true;
}

function createInputButton(id, value, style, func = null) {
    const button = document.createElement("input");
    button.type = "button";
    button.id = id;
    button.className = `btn btn-outline-${style} btn-sm`;
    button.value = value;
    button.onclick = func;
    return button;
}

function setButtons(buttons) {
    buttonsDiv.innerHTML = "";
    for (const button of buttons) buttonsDiv.appendChild(button);
}

function loadImages() {
    document.querySelectorAll("img.async-image").forEach(img => {
        const href = img.dataset.src;
        const tp = document.createElement("img");
        tp.src = href;
        tp.onload = () => {
            img.src = href;
        };
        tp.onerror = () => {
            let src = href.slice(href.lastIndexOf("/")+1);
            let type = href.slice(href.lastIndexOf(".")+1);
            img.src = "data:image/" + type + ";base64," + localStorage.getItem(src);
        };
    })
}

Array.prototype.remove = function (value) {
    if (this.indexOf(value) !== -1) this.splice(this.indexOf(value), 1);
}

Array.prototype.removeDuplicates = function () {
    const set = new Set(this);
    return Array.from(set);
}

const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function timeNow() {
    const date = new Date();
    document.getElementById("timeSpan").innerText = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${dayMap[date.getDay()]} ${((date.getHours() >= 10) ? "" : "0") + date.getHours()}:${((date.getMinutes() >= 10) ? "" : "0") + date.getMinutes()}`;
}

timeNow();

setInterval(timeNow, 60000);
