const formContainer = document.getElementById("formView");
const resultContainer = document.getElementById("resultView");
const questionContainer = document.getElementById("questionView");
function createSelectCourseForm(courses) {
    const selectCourseForm = document.createElement("form");
    selectCourseForm.id = "selectCourseForm";
    selectCourseForm.innerHTML = `
                <h3>Select course:</h3>
                ${Object.keys(courses).map(course => `
                    <input type="radio" id="${course}" name="selectCourse" value="${course}">
                    <label for="${course}">${course}</label><br>
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
                <input type="number" id="selectNum" value="15">
                <br><br>
            `;
    return selectOptionForm;
}
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

fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        const courses = data.courses;
        const questions = data.questions;
        const selectCourseForm = createSelectCourseForm(courses);
        const selectModeForm = createSelectModeForm();
        let selectOptionForm;
        const submitFormButton = document.createElement("input");
        submitFormButton.type = "submit";
        submitFormButton.id = "submitFormButton";
        submitFormButton.value = "Submit";
        const submitQuestionButton = document.createElement("input");
        submitQuestionButton.type = "submit";
        submitQuestionButton.id = "submitQuestionButton";
        submitQuestionButton.onclick = function() {
            location.href = "#resultView";
        };
        submitQuestionButton.value = "Submit";
        // submitQuestionButton.innerHTML = `
        //     <input type="submit" id="submitQuestionButton" value="Submit">
        // `;
        const printButton = document.createElement("button");
        printButton.type = "button";
        printButton.id = "printButton";
        printButton.onclick = function() {window.print()};
        printButton.innerText = "Print & Save";
        let selectedCourse, selectedMode, num, codes, marks=0;
        formContainer.appendChild(selectCourseForm);
        selectCourseForm.addEventListener("change", (e) => {
            for (const radio of document.querySelectorAll("input[name='selectCourse']")) {
                if (radio.checked) selectedCourse = radio.value;
            }
            for (const radio of document.querySelectorAll("input[name='selectMode']")) {
                if (radio.checked) radio.checked = false;
            }
            if (document.getElementById("selectOptionForm"))
                formContainer.removeChild(document.getElementById("selectOptionForm"));
            if (document.getElementById("submitFormButton"))
                formContainer.removeChild(submitFormButton);
            formContainer.appendChild(selectModeForm);
        });
        selectModeForm.addEventListener("change", (e) => {
            for (const radio of document.querySelectorAll("input[name='selectMode']")) {
                if (radio.checked) selectedMode = radio.value;
            }
            if (document.getElementById("selectOptionForm"))
                formContainer.removeChild(document.getElementById("selectOptionForm"));
            selectOptionForm = createSelectOptionForm(courses[selectedCourse][selectedMode], selectedMode);
            formContainer.appendChild(selectOptionForm);
            formContainer.appendChild(submitFormButton);
        });
        submitFormButton.addEventListener("click", (e) => {
            if (document.getElementById("numErrorMessage")) document.getElementById("numErrorMessage").remove();
            let options = [];
            for (const input of document.querySelectorAll("input[name='selectOption']")) {
                if (input.checked) options.push(input.value);
            }
            const inputs = document.querySelectorAll("input[name='selectCourse'], input[name='selectMode'], input[name='selectOption']");
            const selectNumInput = document.querySelector("input[id='selectNum']");
            num = selectNumInput.value;
            codes = generateQuestions(courses[selectedCourse][selectedMode], options, num);
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
                submitFormButton.disabled = true;
                renderQuestions(questions, codes);
                questionContainer.appendChild(document.createElement("hr"));
                const span = document.createElement("span");
                span.id = "buttons";
                span.appendChild(submitQuestionButton);
                span.appendChild(printButton);
                questionContainer.appendChild(span);
            }
        });
        submitQuestionButton.addEventListener("click", (e) => {
            for (let i = 0; i < codes.length; i++) {
                const id = "Q" + (i+1);
                const div = document.getElementById(id);
                const explanationDiv = document.getElementById(id+"Explanation");
                const explanationButton = document.createElement("button");
                explanationButton.type = "button";
                explanationButton.className = "collapsible";
                explanationButton.innerText = "Explanation";
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
            submitQuestionButton.disabled = true;
            resultContainer.innerHTML = `
                <h3>Score: ${marks}/${num}</h3>
            `;
        });
    })
    .catch(error => {
        console.error("Error loading JSON data: ", error);
        formContainer.innerHTML = "<h1>Error Loading JSON data</h1>";
    });