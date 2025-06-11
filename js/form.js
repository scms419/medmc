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
        <div class="my-3 border-bottom">
            <h2 class="fs-2 text-body-emphasis mb-3">Select course</h2>
            ${Object.keys(courses).map(level => `
                    <h5 class="border-bottom">${level}</h5>
                    ${Object.keys(courses[level]).map(course => `
                        <div class="form-check form-check-inline my-3">
                            <input type="radio" id="${course}" name="selectCourse" value="${course}" data-level="${level}" class="form-check-input">
                            <label for="${course}" class="form-check-label">${course}</label>
                        </div>
                    `).join('')}
            `).join('')}
        </div>
    `;
    selectCourseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        return false;
    });
    return selectCourseForm;
}
function createSelectModeForm() {
    const selectModeForm = document.createElement("form");
    selectModeForm.id = "selectModeForm";
    selectModeForm.innerHTML = `
        <div class="my-3 border-bottom">
            <h2 class="fs-2 text-body-emphasis">Select mode</h2>
            <div class="my-3">
                <div class="form-check form-check-inline">
                    <input type="radio" id="byYear" name="selectMode" value="byYear" class="form-check-input">
                    <label for="byYear" class="form-check-label">By year</label>
                </div>
                <div class="form-check form-check-inline">
                    <input type="radio" id="byTopic" name="selectMode" value="byTopic" class="form-check-input">
                    <label for="byTopic" class="form-check-label">By topic</label>
                </div>
            </div>
        </div>
    `;
    selectModeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        return false;
    });
    return selectModeForm;
}
function createSelectOptionForm(options, mode) {
    const selectOptionForm = document.createElement("form");
    selectOptionForm.id = "selectOptionForm";
    selectOptionForm.innerHTML = `
        <div class="my-3 border-bottom">
            <h2 class="fs-2 text-body-emphasis">Select ${(mode === "byYear") ? "year" : "topic(s)"}</h2>
            ${Object.keys(options).map(option => `
                <div class="form-check my-3">
                    <input
                        type="${mode === "byYear" ? "radio" : "checkbox"}"
                        id = "${option}" name="selectOption" value="${option}" class="form-check-input">
                    <label for="${option}" class="form-check-label">${option}</label>
                </div>
            `).join('')}
            <div class="my-3">
                <label for="selectNum" class="form-label">No. of questions:</label>
                <input type="number" id="selectNum" value="${defaultQuestionNumber}" class="form-control">
            </div>
        </div>
    `;
    selectOptionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        return false;
    });
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
    div.className = "my-4 p-2";
    div.innerHTML = `
        <h5 class="fs-6">${num}. ${code}</h5>
        <p class="lead">${marked.parse(question.question)}</p>
        <form id="${div.id + "Form"}">
            ${Object.keys(question.options).map(option => `
                <div class="form-check">
                    <input type="radio" id="${"Q"+num+option}" name="${div.id}" value="${option}" class="form-check-input">
                    <label for="${"Q"+num+option}" class="form-check-label">${option}. ${marked.parseInline(question.options[option])}</label>
                    <label id="response" class="fw-bold fst-italic"></label>
                </div>
            `).join('')}
        </form>
    `;
    return div;
}
function renderQuestions(questions, codes) {
    for (let i = 1; i <= codes.length; i++) {
        questionContainer.appendChild(renderQuestion(questions[codes[i-1]], codes[i-1], i));
    }
}
function createMainForm(data) {
    if (!validateJSON(data)) {
        alert("JSON file not valid");
        location.href = "index.html";
    }
    const courses = data.courses;
    const questions = data.questions;
    let selectedLevel, selectedCourse, selectedMode, num, codes, marks=0;
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
        resultContainer.hidden = true;
        resultContainer.innerHTML = "";
        marks = 0;
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
    formContainer.appendChild(selectCourseForm);
    selectCourseForm.addEventListener("change", (e) => {
        for (const radio of document.querySelectorAll("input[name='selectCourse']")) {
            if (radio.checked) {
                selectedLevel = radio.getAttribute("data-level");
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
            renderQuestions(questions, codes);
            location.href = "#questionView";
            setButtons([submitQuestionButton, printButton, cancelButton]);
        }
    });
    submitQuestionButton.addEventListener("click", (e) => {
        for (let i = 0; i < codes.length; i++) {
            const id = "Q" + (i + 1);
            const div = document.getElementById(id);
            const explanationDiv = document.createElement("div");
            explanationDiv.className = "my-2";
            explanationDiv.innerHTML = `
                <button class="btn btn-primary" type="button" data-bs-toggle="collapse"
                        data-bs-target="#explanation${id}" aria-expanded="false" aria-controls="explanation${id}">
                    Explanation
                </button>
                <div class="collapse" id="explanation${id}">
                    <div class="card card-body bg-dark-subtle">${marked.parse(questions[codes[i]].explanation)}</div>
                </div>
            `;
            div.appendChild(explanationDiv);
            const query = document.querySelector(`input[name='${id}']:checked`);
            if (query && query.value === questions[codes[i]].answer) {
                div.classList.add("bg-success-subtle");
                marks++;
            }
            else {
                div.classList.add("bg-danger-subtle");
                const option = document.querySelector(`label[for='${id}${questions[codes[i]].answer}']`);
                option.classList.add("fw-bold");
                option.classList.add("opacity-100");
                option.nextElementSibling.innerHTML = "Correct answer";
            }
            for (const input of document.querySelectorAll(`input[name='${id}']`)) {
                input.disabled = true;
            }
        }
        resultContainer.hidden = false;
        resultContainer.innerHTML = `
            <h3>Score: ${marks}/${num}</h3>
        `;
        redoButton = createInputButton("redoButton", "Redo", function () {
            resultContainer.hidden = true;
            resultContainer.innerHTML = "";
            marks = 0;
            questionContainer.innerHTML = "";
            codes = shuffle(codes);
            renderQuestions(questions, codes);
            setButtons([submitQuestionButton, printButton, cancelButton]);
            location.href = "#questionView";
        });
        setButtons([redoButton, printButton, restartButton, returnButton]);
    });
}

createMainForm(JSON.parse(localStorage.getItem("data")));