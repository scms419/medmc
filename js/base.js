const buttonsSpan = document.getElementById("buttons");

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

function createInputButton(id, value, func = null) {
    const button = document.createElement("input");
    button.type = "button";
    button.id = id;
    button.className = "btn btn-outline-primary btn-sm";
    button.value = value;
    button.onclick = func;
    return button;
}

function setButtons(buttons) {
    buttonsSpan.innerHTML = "";
    for (const button of buttons) buttonsSpan.appendChild(button);
}

const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1";
document.getElementsByTagName("head")[0].appendChild(meta);

const link = document.createElement("link");
link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css";
link.rel = "stylesheet";
link.integrity = "sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT";
link.crossOrigin = "anonymous";
document.getElementsByTagName("head")[0].appendChild(link);

const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js";
script.integrity = "sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO";
script.crossOrigin = "anonymous";
document.getElementsByTagName("head")[0].appendChild(script);

const iconLink = document.createElement("link");
iconLink.rel = "stylesheet";
iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css";
document.getElementsByTagName("head")[0].appendChild(iconLink);

const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function timeNow() {
    const date = new Date();
    document.getElementById("timeSpan").innerText = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${dayMap[date.getDay()]} ${((date.getHours() >= 10) ? "" : "0") + date.getHours()}:${((date.getMinutes() >= 10) ? "" : "0") + date.getMinutes()}`;

}

timeNow();

setInterval(timeNow, 60000);
