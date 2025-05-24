const buttonsSpan = document.getElementById("buttons");
buttonsSpan.style = `
    width: 100%;
    height: 5%;
    padding: 5px;
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    justify-content: space-evenly;
    display: flex;
    background: #E8E8E8;
    box-shadow: 0 0 15px #CECECE;
    z-index: 15;
`;

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
function createInputButton(id, value, func=null) {
    const button = document.createElement("input");
    button.type = "button";
    button.id = id;
    button.value = value;
    button.onclick = func;
    button.style = "min-width: 120px";
    return button;
}
function setButtons(buttons) {
    buttonsSpan.innerHTML = "";
    for (const button of buttons) buttonsSpan.appendChild(button);
}