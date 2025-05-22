const formContainer = document.getElementById("formView");
const resultContainer = document.getElementById("resultView");
const questionContainer = document.getElementById("questionView");
const defaultQuestionNumber = 10;

function shuffle(arr) {
    let n = arr.length, tp, i;
    while (n) {
        i = Math.floor(Math.random() * n--);
        tp = arr[i];
        arr[i] = arr[n];
        arr[n] = tp;
    }
    return arr;
}
function createSelectCourseForm(courses) {
    const selectCourseForm = document.createElement("form");
    selectCourseForm.id = "selectCourseForm";
    selectCourseForm.innerHTML = `
        <h3>Select course:</h3>
        ${Object.keys(courses).map(level => `
            <u>${level}</u><br>
            ${Object.keys(courses[level]).map(course => `
                <input type="radio" id="${course}" name="selectCourse" value="${course}" class="${level}">
                <label for="${course}">${course}</label><br>
            `).join('')}   
        `).join('')}
        <hr>
    `;
    return selectCourseForm;
}
function createSelectModeForm() {
    const selectModeForm = document.createElement("form");
    selectModeForm.id = "selectModeForm";
    selectModeForm.innerHTML = `
                <h3>Select mode:</h3>
                <input type="radio" id="byYear" name="selectMode" value="byYear">
                <label for="byYear">By year</label>
                <input type="radio" id="byTopic" name="selectMode" value="byTopic">
                <label for="byTopic">By topic</label>
                <hr>
            `;
    return selectModeForm;
}
function createSelectOptionForm(options, mode) {
    const selectOptionForm = document.createElement("form");
    selectOptionForm.id = "selectOptionForm";
    selectOptionForm.innerHTML = `
        <h3>Select ${(mode === "byYear") ? "year" : "topic(s)"}</h3>
        ${Object.keys(options).map(option => `
            <input
                type="${mode === "byYear" ? "radio" : "checkbox"}"
                id = "${option}" name="selectOption" value="${option}">
            <label for="${option}">${option}</label>
        `).join('')}
        <br><br>
        <label for="selectNum">No. of questions:</label>
        <input type="number" id="selectNum" value="${defaultQuestionNumber}">
        <br><br>
    `;
    return selectOptionForm;
}
function generateQuestions(data, options, num) {
    let arr = [];
    for (let option of options) {
        arr = arr.concat(data[option]);
    }
    arr = shuffle(arr);
    return arr.slice(0, Math.min(num, arr.length));
}
function renderQuestion(question, code, num) {
    const div = document.createElement("div");
    div.id = "Q" + num;
    div.innerHTML = `
                <p>${num}. ${code}</p>
                ${marked.parse(question.question)}
                <form id="${div.id + "Form"}">
                    ${Object.keys(question.options).map(option => `
                        <input type="radio" id="${"Q"+num+option}" name="${div.id}" value="${option}">
                        <label for="${"Q"+num+option}">${option}. ${marked.parseInline(question.options[option])}</label><br>
                    `).join('')}
                </form>
            `;
    return div;
}
function renderQuestions(questions, codes) {
    for (let i = 1; i <= codes.length; i++) {
        questionContainer.appendChild(renderQuestion(questions[codes[i-1]], codes[i-1], i));
        const explanationDiv = document.createElement("div");
        explanationDiv.id = "Q" + i + "Explanation";
        questionContainer.appendChild(explanationDiv);
    }
}
function createMainForm(data) {
    if (!validateJSON(data)) {
        alert("JSON file not valid");
        location.href = "index.html";
    }
    const courses = data.courses;
    const questions = data.questions;
    const selectCourseForm = createSelectCourseForm(courses);
    const selectModeForm = createSelectModeForm();
    let selectOptionForm;
    const submitFormButton = createInputButton("submitFormButton", "Submit");
    const submitQuestionButton = createInputButton("submitQuestionButton", "Submit",
        function() {location.href = "#resultView";});
    const printButton = createInputButton("printButton", "Print & Save",
        function() {window.print();});
    let redoButton;
    const restartButton = createInputButton("restartButton", "Restart", function() {
        resultContainer.innerHTML = "";
        questionContainer.innerHTML = "";
        const inputs = document.querySelectorAll("input[name='selectCourse'], input[name='selectMode'], input[name='selectOption']");
        const selectNumInput = document.querySelector("input[id='selectNum']");
        for (const input of inputs) input.disabled = false;
        selectNumInput.disabled = false;
        setButtons([submitFormButton, cancelButton]);
        location.href = "#formView";
    });
    const cancelButton = createInputButton("cancelButton", "Cancel",
        function() {location.href = "index.html";});
    const returnButton = createInputButton("returnButton", "Return to Homepage",
        function() {location.href = "index.html";});
    setButtons([cancelButton]);
    let selectedLevel, selectedCourse, selectedMode, num, codes, marks=0;
    formContainer.appendChild(selectCourseForm);
    selectCourseForm.addEventListener("change", (e) => {
        for (const radio of document.querySelectorAll("input[name='selectCourse']")) {
            if (radio.checked) {
                selectedLevel = radio.className;
                selectedCourse = radio.value;
            }
        }
        for (const radio of document.querySelectorAll("input[name='selectMode']")) {
            if (radio.checked) radio.checked = false;
        }
        if (document.getElementById("selectOptionForm"))
            formContainer.removeChild(document.getElementById("selectOptionForm"));
        formContainer.appendChild(selectModeForm);
        setButtons([cancelButton]);
    });
    selectModeForm.addEventListener("change", (e) => {
        for (const radio of document.querySelectorAll("input[name='selectMode']")) {
            if (radio.checked) selectedMode = radio.value;
        }
        if (document.getElementById("selectOptionForm"))
            formContainer.removeChild(document.getElementById("selectOptionForm"));
        selectOptionForm = createSelectOptionForm(courses[selectedLevel][selectedCourse][selectedMode], selectedMode);
        formContainer.appendChild(selectOptionForm);
        setButtons([submitFormButton, cancelButton]);
    });
    submitFormButton.addEventListener("click", (e) => {
        if (document.getElementById("optionErrorMessage")) document.getElementById("optionErrorMessage").remove();
        if (document.getElementById("numErrorMessage")) document.getElementById("numErrorMessage").remove();
        let options = [];
        for (const input of document.querySelectorAll("input[name='selectOption']")) {
            if (input.checked) options.push(input.value);
        }
        if (options.length === 0) {
            const span = document.createElement("span");
            span.id = "optionErrorMessage";
            span.style = "color: red";
            span.innerText = "At least one option is required";
            selectOptionForm.insertBefore(span, document.querySelector("label[for='selectNum']").previousElementSibling);
            return;
        }
        const inputs = document.querySelectorAll("input[name='selectCourse'], input[name='selectMode'], input[name='selectOption']");
        const selectNumInput = document.querySelector("input[id='selectNum']");
        num = selectNumInput.value;
        codes = generateQuestions(courses[selectedLevel][selectedCourse][selectedMode], options, num);
        if (codes.length < num) {
            const span = document.createElement("span");
            span.id = "numErrorMessage";
            span.style = "color: red";
            span.innerText = "Required number of questions exceed the amount (n = " + codes.length + ")";
            selectOptionForm.insertBefore(span, selectNumInput.nextElementSibling);
        }
        else {
            for (const input of inputs) input.disabled = true;
            selectNumInput.disabled = true;
            questionContainer.appendChild(document.createElement("hr"));
            renderQuestions(questions, codes);
            questionContainer.appendChild(document.createElement("hr"));
            setButtons([submitQuestionButton, printButton, cancelButton]);
        }
    });
    submitQuestionButton.addEventListener("click", (e) => {
        for (let i = 0; i < codes.length; i++) {
            const id = "Q" + (i+1);
            const div = document.getElementById(id);
            const explanationDiv = document.getElementById(id+"Explanation");
            const explanationButton = document.createElement("button");
            const icon = document.createElement("i");
            explanationButton.type = "button";
            explanationButton.className = "collapsible";
            explanationButton.innerText = "Explanation";
            icon.className = "fa-solid fa-chevron-down";
            icon.style = "position: absolute; right: 25px";
            explanationButton.appendChild(icon);
            const explanationText = document.createElement("div");
            explanationText.className = "content";
            explanationText.innerHTML = marked.parse(questions[codes[i]].explanation);
            explanationDiv.appendChild(explanationButton);
            explanationDiv.appendChild(explanationText);
            makeCollapsible(explanationButton);
            const query = document.querySelector(`input[name='${id}']:checked`);
            if (query && query.value === questions[codes[i]].answer) {
                div.style = "background-color: lightgreen";
                marks++;
            }
            else {
                div.style = "background-color: lightpink";
                const span = document.createElement("span");
                const form = document.getElementById(id + "Form");
                const correctAns = document.getElementById(id + questions[codes[i]].answer);
                span.innerHTML = `&emsp;<i>Correct answer</i>`
                span.id = id + "CorrectAns";
                form.insertBefore(span, correctAns.nextElementSibling.nextElementSibling);
            }
            for (const input of document.querySelectorAll(`input[name='${id}']`)) {
                input.disabled = true;
            }
        }
        resultContainer.innerHTML = `
                <h3>Score: ${marks}/${num}</h3>
            `;
        redoButton = createInputButton("redoButton", "Redo", function() {
            resultContainer.innerHTML = "";
            questionContainer.innerHTML = "";
            codes = shuffle(codes);
            marks = 0;
            renderQuestions(questions, codes);
            questionContainer.appendChild(document.createElement("hr"));
            setButtons([submitQuestionButton, printButton, cancelButton]);
            location.href = "#questionView";
        });
        setButtons([redoButton, printButton, restartButton, returnButton]);
    });
}

createMainForm(JSON.parse(localStorage.getItem("data")));