let zip = new JSZip();
let imgFolder = zip.folder("img");
const prevButton = document.getElementById("prevButton");
const selectQuestion = document.getElementById("selectQuestion");
const sortQuestionButton = document.getElementById("sortQuestionButton");
const nextButton = document.getElementById("nextButton");
const selectCourse = document.getElementById("selectCourse");
const selectTopic = document.getElementById("selectTopic");
const questionId = document.getElementById("questionId");
const questionYear = document.getElementById("questionYear");
const questionNumber = document.getElementById("questionNumber");
const questionEditor = createMDE("question", true);
const optionEditor = document.getElementById("optionEditor");
const explanationEditor = createMDE("explanation", true);
const addCourseModal = new bootstrap.Modal("#addCourseModal");
const addCourseForm = document.getElementById("addCourseForm");
const addTopicModal = new bootstrap.Modal("#addTopicModal");
const addTopicForm = document.getElementById("addTopicForm");
const emptyQuestion = {
    "year": "",
    "course": "",
    "question_number": "",
    "level": "",
    "topic": "",
    "question": "",
    "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": "",
        "E": ""
    },
    "answer": "",
    "explanation": ""
};
let courses, questions;
let questionCodeOptions;
let courseMap = {};
let options = {};
let id, question;
let initialData;

Array.prototype.remove = function (value) {
    if (this.indexOf(value) !== -1) this.splice(this.indexOf(value), 1);
}
function updateQuestionCode (selectedIndex, value) {
    selectQuestion.innerHTML = `
        ${questionCodeOptions.map(key => `
            <option value="${key}">${key}</option>
        `).join('')}
    `;
    if (selectedIndex) selectQuestion.selectedIndex = selectedIndex;
    if (value) selectQuestion.value = value;
}
function updateCourse (value) {
    if (Object.keys(courses).length !== 0) {
        selectCourse.innerHTML = `
            ${Object.keys(courses).map(level => `
                <optgroup label=${level}>
                ${Object.keys(courses[level]).map(course => `
                    <option value="${course}">${course}</option>
                `).join('')}
                </optgroup>
            `).join('')}
        `;
    }
    else selectCourse.innerHTML = `
        <option value=""></option>
    `;
    const addCourseOption = document.createElement("option");
    addCourseOption.innerText = "Add course ...";
    addCourseOption.value = "addCourse";
    selectCourse.appendChild(addCourseOption);
    if (value) selectCourse.value = value;
}
function updateTopic (course, value) {
    if (courseMap[course] && Object.keys(courses[courseMap[course]][course].byTopic).length !== 0) {
        selectTopic.innerHTML = `
            ${Object.keys(courses[courseMap[course]][course].byTopic).map(topic => `
                <option value="${topic}">${topic}</option>
            `).join('')}
        `;
    }
    else selectTopic.innerHTML = `
        <option value=""></option>
    `;
    const addTopicOption = document.createElement("option");
    addTopicOption.innerText = "Add topic ...";
    addTopicOption.value = "addTopic";
    selectTopic.appendChild(addTopicOption);
    if (value) selectTopic.value = value;
}
function updateOptions () {
    optionEditor.innerHTML = "";
    options = {};
    for (let [option, answer] of Object.entries(question.options)) {
        const div = document.createElement("div");
        div.className = "px-1 mb-3";
        div.innerHTML = `
            <div class="form-check">
                <input type="radio" id="${'option'+option+'-radio'}" name="options" value="${option}" class="form-check-input">
                <label for="${'option'+option}" class="form-check-label">${option}:</label>
            </div>
            <textarea id="${'option'+option}"></textarea>
        `;
        optionEditor.appendChild(div);
        options[option] = createMDE("option"+option, true, false, false);
        options[option].value(answer);
    }
    if (question.answer)
        document.getElementById("option"+question.answer+"-radio").checked = true;
}
function updateRenderingInfo (selectedIndex=0) {
    updateQuestionCode(selectedIndex);
    if (selectedIndex === -1) {
        id = "";
        question = emptyQuestion;
    }
    else {
        id = selectQuestion.value;
        question = questions[id];
    }
    if (selectedIndex === 0) prevButton.classList.add("hidden");
    else if (prevButton.classList.contains("hidden")) prevButton.classList.remove("hidden");
    if (selectedIndex === selectQuestion.length-1 || selectedIndex === -1) nextButton.innerText = "Add question";
    else nextButton.innerText = "Next question";
    updateCourse((question.course) ? question.course : -1);
    updateTopic(question.course, question.topic);
    questionId.value = id;
    questionYear.value = question.year;
    questionNumber.value = question.question_number;
    questionEditor.value(question.question);
    updateOptions();
    explanationEditor.value(question.explanation);
}
function sortQuestion() {
    questionCodeOptions = Object.keys(questions)
        .sort((key1, key2) => {
            if (questions[key1].level < questions[key2].level) return -1;
            else if (questions[key1].level === questions[key2].level) {
                if (questions[key1].course < questions[key2].course) return -1;
                else if (questions[key1].course === questions[key2].course) {
                    if (questions[key1].year < questions[key2].year) return -1;
                    else if (questions[key1].year === questions[key2].year) {
                        return questions[key1].question_number - questions[key2].question_number;
                    }
                    else if (questions[key1].year > questions[key2].year) return 1;
                }
                else if (questions[key1].course > questions[key2].course) return 1;
            }
            else if (questions[key1].level > questions[key2].level) return 1;
        });
}
function findOptions () {
    const returnOptions = {};
    for (let [option, editor] of Object.entries(options)) {
        if (editor.value() === "") return null;
        returnOptions[option] = editor.value();
    }
    return returnOptions;
}
function findAnswer () {
    const options = document.querySelectorAll("input[name='options']");
    for (let option of options) {
        if (option.checked) return option.value;
    }
    return null;
}
function checkEmpty () {
    if (selectCourse.value !== "" || selectTopic.value !== "" || questionId.value !== "" || questionYear.value !== "" || questionNumber.value !== "") return false;
    if (questionEditor.value() !== "" || explanationEditor.value() !== "") return false;
    for (const editor of Object.values(options)) {
        if (editor.value() !== "") return false;
    }
    return true;
}
function saveChanges (canEmpty, doAlert=true) {
    if (checkEmpty()) {
        if (canEmpty) return true;
        else {
            alert("Please fill in the information");
            return false;
        }
    }
    if (selectCourse.value === "") {
        if (doAlert) alert("Course cannot be empty");
        return false;
    }
    if (selectTopic.value === "") {
        if (doAlert) alert("Topic cannot be empty");
        return false;
    }
    if (questionId.value === "") {
        if (doAlert) alert("Question ID cannot be empty");
        return false;
    }
    if (questionYear.value === "") {
        if (doAlert) alert("Year cannot be empty");
        return false;
    }
    if (questionNumber.value === "") {
        if (doAlert) alert("Question number cannot be empty");
        return false;
    }
    if (questionEditor.value() === "") {
        if (doAlert) alert("Question cannot be empty");
        return false;
    }
    if (findOptions() === null) {
        if (doAlert) alert("Option cannot be empty");
        return false;
    }
    if (findAnswer() === null) {
        if (doAlert) alert("Answer cannot be null");
        return false;
    }
    if (id !== questionId.value && questions[questionId.value]) {
        if (doAlert) alert("Question ID is duplicated");
        return false;
    }
    if (id !== questionId.value || question.course !== selectCourse.value || question.topic !== selectTopic.value || question.year !== questionYear.value) {
        delete questions[id];
        questions[questionId.value] = {
            "year": questionYear.value,
            "course": selectCourse.value,
            "question_number": parseInt(questionNumber.value),
            "level": courseMap[selectCourse.value],
            "topic": selectTopic.value,
            "question": questionEditor.value(),
            "options": findOptions(),
            "answer": findAnswer(),
            "explanation": explanationEditor.value()
        };
        if (id !== questionId.value) {
            if (id !== "") questionCodeOptions[questionCodeOptions.indexOf(id)] = questionId.value;
            else questionCodeOptions.push(questionId.value);

        }
        if (id !== "") {
            courses[courseMap[question.course]][question.course].byYear[question.year].remove(id);
            courses[courseMap[question.course]][question.course].byTopic[question.topic].remove(id);
        }
        if (!courses[courseMap[selectCourse.value]][selectCourse.value].byYear[questionYear.value])
            courses[courseMap[selectCourse.value]][selectCourse.value].byYear[questionYear.value] = [];
        courses[courseMap[selectCourse.value]][selectCourse.value].byYear[questionYear.value].push(questionId.value);
        if (!courses[courseMap[selectCourse.value]][selectCourse.value].byTopic[selectTopic.value])
            courses[courseMap[selectCourse.value]][selectCourse.value].byTopic[selectTopic.value] = [];
        courses[courseMap[selectCourse.value]][selectCourse.value].byTopic[selectTopic.value].push(questionId.value);
        return true;
    }
    else {
        questions[id].question_number = parseInt(questionNumber.value);
        questions[id].question = questionEditor.value();
        questions[id].options = findOptions();
        questions[id].answer = findAnswer();
        questions[id].explanation = explanationEditor.value();
        return true;
    }
}
function clean () {
    const obj = JSON.parse(JSON.stringify(courses));
    for (let [level, courseList] of Object.entries(obj)) {
        if (Object.keys(courseList).length === 0) {
            delete obj[level];
            continue;
        }
        for (let [course, info] of Object.entries(courseList)) {
            if (Object.keys(info.byYear).length === 0 || Object.keys(info.byTopic).length === 0) delete obj[level][course];
            else {
                for (let [year, codes] of Object.entries(info.byYear)) {
                    if (Object.keys(codes).length === 0) delete info.byYear[year];
                }
                for (let [topic, codes] of Object.entries(info.byTopic)) {
                    if (Object.keys(codes).length === 0) delete info.byTopic[topic];
                }
                if (Object.keys(info.byYear).length === 0 || Object.keys(info.byTopic).length === 0) delete obj[level][course];
            }
        }
        if (Object.keys(obj[level]).length === 0) {
            delete obj[level];
        }
    }
    return obj;
}
function findImages () {
    const questionsData = JSON.stringify(questions);
    const reg = /!\[.*?]\(img\/(.*?)\)/g;
    const matchArr = [...questionsData.matchAll(reg)];
    for (const arr of matchArr) {
        if (localStorage.getItem(arr[1]) !== null) imgFolder.file(arr[1], localStorage.getItem(arr[1]), {base64: true});
        else {
            let img = new Image();
            let canvas = document.createElement("canvas");
            img.src = "img/" + arr[1];
            if (img.height === 0) continue;
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            let dataURL = canvas.toDataURL("image/" + arr[1].slice(arr[1].lastIndexOf(".")+1));
            imgFolder.file(arr[1], dataURL.replace(/^data:image\/(png|jpe?g);base64,/, ""), {base64: true});
        }
    }
}

let prevCode;
prevButton.addEventListener("click", () => {
    if (saveChanges(true)) {
        if (selectQuestion.selectedIndex !== -1) selectQuestion.selectedIndex--;
        else selectQuestion.selectedIndex = selectQuestion.length - 1;
        updateRenderingInfo(selectQuestion.selectedIndex);
    }
});
selectQuestion.addEventListener("focus", () => {
    prevCode = selectQuestion.value;
})
selectQuestion.addEventListener("change", () => {
    if (saveChanges(true)) {
        updateRenderingInfo(selectQuestion.selectedIndex);
    }
    else {
        selectQuestion.value = prevCode;
    }
});
sortQuestionButton.addEventListener("click", () => {
    sortQuestion();
    updateQuestionCode(undefined, selectQuestion.value);
    updateRenderingInfo(selectQuestion.selectedIndex);
})
nextButton.addEventListener("click", () => {
    if (saveChanges(false)) {
        if (selectQuestion.selectedIndex !== -1) selectQuestion.selectedIndex++;
        updateRenderingInfo(selectQuestion.selectedIndex);
    }
});

let prevCourse, prevTopic;
selectCourse.addEventListener("focus", () => {
    prevCourse = selectCourse.value;
});
selectCourse.addEventListener("change", () => {
    if (selectCourse.value === "addCourse") {
        addCourseModal.show();
        selectCourse.value = prevCourse;
    }
    else updateTopic(selectCourse.value);
});
selectTopic.addEventListener("focus", () => {
    prevTopic = selectTopic.value;
});
selectTopic.addEventListener("change", () => {
    if (selectTopic.value === "addTopic") {
        addTopicModal.show();
        selectTopic.value = prevTopic;
    }
});

addCourseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const levelInput = document.getElementById("addCourseLevel");
    const newCourseInput = document.getElementById("addCourse");
    const level = levelInput.value;
    const newCourse = newCourseInput.value;
    const validationLevel = document.getElementById("validationLevel");
    const validationCourse = document.getElementById("validationCourse");
    if (level === "") {
        levelInput.classList.remove("is-valid");
        levelInput.classList.add("is-invalid");
        validationLevel.innerText = "Level cannot be empty";
    }
    else {
        levelInput.classList.remove("is-invalid");
        levelInput.classList.add("is-valid");
    }
    if (newCourse === "") {
        newCourseInput.classList.remove("is-valid");
        newCourseInput.classList.add("is-invalid");
        validationCourse.innerText = "Course cannot be empty";
    }
    else if (courseMap[newCourse]) {
        newCourseInput.classList.remove("is-valid");
        newCourseInput.classList.add("is-invalid");
        validationCourse.innerText = "Course already exists";
    }
    else {
        newCourseInput.classList.remove("is-invalid");
        newCourseInput.classList.add("is-valid");
    }
    if (!addCourseForm.checkValidity()) return;
    if (!courses[level]) courses[level] = {};
    courses[level][newCourse] = {
        "byYear": {},
        "byTopic": {}
    };
    courseMap[newCourse] = level;
    addCourseModal.hide();
    levelInput.value = "";
    newCourseInput.value = "";
    levelInput.classList.remove("is-valid");
    newCourseInput.classList.remove("is-valid");
    updateCourse(newCourse);
    updateTopic(newCourse);
});
addTopicForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const course = selectCourse.value;
    const level = courseMap[course];
    const newTopicInput = document.getElementById("addTopic");
    const newTopic = newTopicInput.value;
    const validationTopic = document.getElementById("validationTopic");
    if (newTopic === "") {
        newTopicInput.classList.remove("is-valid");
        newTopicInput.classList.add("is-invalid");
        validationTopic.innerText = "Topic cannot be empty";
    }
    else if (courses[level][course].byTopic[newTopic]) {
        newTopicInput.classList.remove("is-valid");
        newTopicInput.classList.add("is-invalid");
        validationTopic.innerText = "Topic already exists";
    }
    else {
        newTopicInput.classList.remove("is-invalid");
        newTopicInput.classList.add("is-valid");
    }
    if (!addTopicForm.checkValidity()) return;
    courses[level][course].byTopic[newTopic] = [];
    addTopicModal.hide();
    newTopicInput.value = "";
    newTopicInput.classList.remove("is-valid");
    updateTopic(course, newTopic);
});

document.getElementsByClassName("fa-solid fa-circle-plus")[0].addEventListener("click", () => {
    const newOption = String.fromCharCode("A".charCodeAt(0)+Object.keys(options).length);
    const span = document.createElement("span");
    span.innerHTML = `
            <input type="radio" id="${'option'+newOption+'-radio'}" name="options" value="${newOption}">
            <label for="${'option'+newOption}">${newOption}:</label>
            <textarea id="${'option'+newOption}"></textarea>
        `;
    optionEditor.appendChild(span);
    options[newOption] = createMDE("option"+newOption, true, false, false);
});
document.getElementsByClassName("fa-solid fa-circle-minus")[0].addEventListener("click", () => {
    const removeOption = Object.keys(options).at(-1);
    if (options[removeOption].value() !== "" && !confirm("The last option contains text. Confirm removing the option?")) return;
    optionEditor.lastElementChild.remove();
    delete options[removeOption];
});

const removeButton = createInputButton("removeButton", "Remove this question", "danger", function () {
    if (Object.keys(questions).length === 1) {
        alert("You cannot remove the only question");
        return;
    }
    if (checkEmpty() || confirm("Confirm removing this question?")) {
        if (id !== "") {
            delete questions[id];
            courses[courseMap[question.course]][question.course].byYear[question.year].remove(id);
            courses[courseMap[question.course]][question.course].byTopic[question.topic].remove(id);
            questionCodeOptions.remove(id);
        }
        if (selectQuestion.selectedIndex === -1) updateRenderingInfo(selectQuestion.length-1);
        else if (selectQuestion.selectedIndex === 0) updateRenderingInfo(0);
        else updateRenderingInfo(selectQuestion.selectedIndex-1);
    }
});
const addButton = createInputButton("addButton", "Add question", "primary", function () {
    if (saveChanges(false)) {
        updateRenderingInfo(-1);
    }
});
const saveButton = createInputButton("saveButton", "Save changes", "primary", function () {
    if (saveChanges(true)) {
        updateRenderingInfo((selectQuestion.selectedIndex === -1) ? selectQuestion.length-1 : selectQuestion.selectedIndex);
        const obj = clean();
        initialData = JSON.stringify({"courses": obj, "questions": questions});
        zip.file("questions.json", initialData);
        findImages();
        zip.generateAsync({type:"blob"})
            .then(function (content) {
                saveAs(content, "database.zip");
            });
    }
});
const cancelButton = createInputButton("cancelButton", "Return to homepage", "secondary", function () {
    saveChanges(true, false);
    if (JSON.stringify({courses, questions}) !== initialData && !confirm("Changes have not been saved. Confirm returning to homepage?")) return;
    location.href = "index.html";
});
setButtons([removeButton, addButton, saveButton, cancelButton]);

window.onbeforeunload = function () {
    return "";
}

const data = JSON.parse(localStorage.getItem("database"));
if (!validateJSON(data)) {
    alert("JSON file not valid");
    location.href = "index.html";
}
initialData = JSON.stringify(data);
courses = data.courses;
questions = data.questions;
questionCodeOptions = Object.keys(questions);
for (let level of Object.keys(courses)) {
    for (let course of Object.keys(courses[level])) {
        courseMap[course] = level;
    }
}

updateRenderingInfo();

function validateTable() {
    function Warning(row, col) {
        this.row = row;
        this.col = col;
        this.className = "danger";
    }
    const arr = [];
    const idRow = {};
    for (let i = 0; i < table.countRows(); i++) {
        if (!table.getDataAtRowProp(i, "selected")) continue;
        const sourceData = table.getSourceDataAtRow(i);
        const cols = ["id", "level", "course", "topic", "year", "question_number", "question", "options", "answer"];
        cols.forEach((col) => {
            const value = table.getDataAtRowProp(i, col);
            if (value === "" || value === null) arr.push(new Warning(i, table.propToCol(col)));
        });
        if (sourceData.id !== "" && sourceData.id !== null) {
            if (!Object.keys(idRow).includes(sourceData.id)) idRow[sourceData.id] = i;
            else {
                if (idRow[sourceData.id] !== -1) {
                    arr.push(new Warning(idRow[sourceData.id], 1));
                    idRow[sourceData.id] = -1;
                }
                arr.push(new Warning(i, 1));
            }
        }
        if (sourceData.course !== "" && sourceData.course !== null) {
            if (Object.keys(courseMap).includes(sourceData.course)) {
                if (courseMap[sourceData.course] !== sourceData.level) arr.push(new Warning(i, 3));
            }
        }
    }
    table.updateSettings({cell: arr});
    return (arr.length === 0);
}
function renderDuplicateText(oldValue, newValue) {
    let str = "";
    str += "<tr><th scope='row'>Level</th><td>";
    if (oldValue.level !== newValue.level) str += oldValue.level + " &rarr; " + newValue.level;
    else str += newValue.level;
    str += "</td></tr>\n";
    str += "<tr><th scope='row'>Course</th><td>";
    if (oldValue.course !== newValue.course) str += oldValue.course + " &rarr; " + newValue.course;
    else str += newValue.course;
    str += "</td></tr>\n";
    str += "<tr><th scope='row'>Topic</th><td>";
    if (oldValue.topic !== newValue.topic) str += oldValue.topic + " &rarr; " + newValue.topic;
    else str += newValue.topic;
    str += "</td></tr>\n";
    str += "<tr><th scope='row'>Question</th><td>";
    if (oldValue.question !== newValue.question) str += oldValue.question + " &rarr;<br>" + newValue.question;
    else str += newValue.question;
    str += "</td></tr>\n";
    str += "<tr><th scope='row'>Options</th><td>";
    Object.keys((Object.keys(oldValue.options).length >= Object.keys(newValue.options).length) ? oldValue.options : newValue.options).forEach((key) => {
        str += "<strong>" + key + ":</strong>&#9;&#9;";
        if (oldValue.options[key] !== newValue.options[key]) str += (oldValue.options[key] || '\"\"') + " &rarr; " + (newValue.options[key] || '\"\"');
        else str += newValue.options[key];
        str += "<br>";
    });
    str += "</td></tr>\n";
    str += "<tr><th scope='row'>Answer</th><td>";
    if (oldValue.answer !== newValue.answer) str += oldValue.answer + " &rarr; " + newValue.answer;
    else str += newValue.answer;
    str += "</td></tr>\n";
    str += "<tr><th scope='row'>Explanation</th><td>";
    if (oldValue.explanation !== newValue.explanation) str += (oldValue.explanation || '\"\"') + " &rarr;<br>" + (newValue.explanation || '\"\"');
    else str += newValue.explanation;
    str += "</td></tr>\n";
    return str;
}
function renderDuplicates(arr) {
    const duplicatesAccordion = document.getElementById("duplicatesAccordion");
    duplicatesAccordion.innerHTML = "";
    for (let i = 0; i < arr.length; i++) {
        const div = document.createElement("div");
        const id = arr[i];
        div.className = "accordion-item";
        div.innerHTML = `
            <div class="d-flex flex-row">
                <div class="px-3 align-self-center">
                    <div class="form-check">
                        <input class="form-check-input accordion-checkbox" type="checkbox" id="accordionCheckbox${i}" value="${id}">
                    </div>
                </div>
                <div class="border-start flex-grow-1">
                    <h5 class="accordion-header">
                        <button class="accordion-button collapsed px-3 py-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                            ${id}
                        </button>
                    </h5>
                    <div id="collapse${i}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <table class="table table-sm">
                                <tbody>
                                    ${renderDuplicateText(questions[id], questionsObj[id])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        duplicatesAccordion.appendChild(div);
    }
}
function modalSetButton(buttons) {
    addQuestionsModalFooter.innerHTML = "";
    for (const button of buttons) addQuestionsModalFooter.appendChild(button);
}
function resetModal() {
    addQuestionsDocx.value = "";
    addQuestionsXlsx.value = "";
    addQuestionsDb.value = "";
    // addQuestionsDocx.disabled = false;
    addQuestionsXlsx.disabled = false;
    addQuestionsDb.disabled = false;
    table.clear();
    modalSetButton([addQuestionsCancel]);
    addQuestionsTable.classList.add("visually-hidden");
    addQuestionsDuplicates.classList.add("visually-hidden");
    addQuestionsConfirm.classList.add("visually-hidden");
}
const addQuestionsModal = new bootstrap.Modal('#addQuestionsModal');
const addQuestionsModalFooter = document.getElementById("addQuestionsModalFooter");
const addQuestionsDocx = document.getElementById('addQuestionsDocx');
const addQuestionsXlsx = document.getElementById('addQuestionsXlsx');
const addQuestionsDb = document.getElementById('addQuestionsDb');
const addQuestionsTable = document.getElementById('addQuestionsTable');
const addQuestionsDuplicates = document.getElementById('addQuestionsDuplicates');
const addQuestionsConfirm = document.getElementById('addQuestionsConfirm');
let questionsObj = {}, courseObj = {}, topicObj = {};
Object.entries(courses).forEach(([level, course]) => {
    courseObj[level] = Object.keys(course);
    Object.entries(course).forEach(([key, value]) => {
        topicObj[key] = Object.keys(value.byTopic);
    });
});

let tableData = [];
Array.prototype.removeDuplicates = function () {
    const set = new Set(this);
    return Array.from(set);
}

const table = new Handsontable(document.getElementById('spreadsheet'), {
    rowHeaders: false,
    colHeaders: ["", "ID", "Level", "Course", "Topic", "Year", "Question No.", "Question", "Options", "Answer", "Explanation"],
    height: "auto",
    minSpareRows: 1,
    autoColumns: true,
    columns: [
        {data: "selected", type: "checkbox"},
        {data: "id", width: 200, wordWrap: false},
        {data: "level", type: "autocomplete", strict: false},
        {data: "course", type: "autocomplete", strict: false},
        {data: "topic", type: "autocomplete", strict: false},
        {data: "year"},
        {data: "question_number", type: "numeric"},
        {data: "question", width: 400, wordWrap: false},
        {data: "options", width: 300, wordWrap: false},
        {data: "answer"},
        {data: "explanation", width: 500, wordWrap: false},
    ],
    autoWrapRow: true,
    autoWrapCol: true,
    afterChange: (changes) => {
        changes?.forEach(([row, prop, oldValue, newValue]) => {
            if (prop === "level") {
                if (oldValue === newValue) return;
                const arr = Object.keys(courseObj).concat(table.getDataAtCol(2)).removeDuplicates();
                arr.remove(null);
                arr.remove("");
                updateColSetting(2, {source: arr});
                let updateCourseForOldLevel = table.getDataAtRowProp(row, "course") !== null && table.getDataAtRowProp(row, "course") !== "";
                if (updateCourseForOldLevel && courseObj[oldValue] && !courseObj[oldValue].includes(table.getDataAtRowProp(row, "course"))) {
                    for (let i = 0; i < table.countRows(); i++) {
                        if (i === row || table.getDataAtRowProp(i, "level") !== oldValue) continue;
                        if (table.getDataAtRowProp(i, "course") === table.getDataAtRowProp(row, "course")) updateCourseForOldLevel = false;
                    }
                    if (updateCourseForOldLevel) {
                        const courseArr = table.getCellMeta(row, 3).source;
                        courseArr.remove(table.getDataAtRowProp(row, "course"));
                        for (let i = 0; i < table.countRows(); i++) {
                            if (table.getDataAtRowProp(i, "level") === oldValue) table.setCellMeta(i, 3, "source", courseArr);
                        }
                    }
                }
                table.setDataAtRowProp(row, "course", "");
            }
            else if (prop === "course") {
                if (oldValue === newValue && oldValue !== "") return;
                let arr = [];
                if (courseObj[table.getDataAtRowProp(row, "level")]) arr = [...courseObj[table.getDataAtRowProp(row, "level")]];
                for (let i = 0; i < table.countRows(); i++) {
                    if (table.getDataAtRowProp(i, "level") === table.getDataAtRowProp(row, "level")) arr.push(table.getDataAtRowProp(i, "course"));
                }
                arr = arr.removeDuplicates();
                arr.remove(null);
                arr.remove("");
                for (let i = 0; i < table.countRows(); i++) {
                    if (table.getDataAtRowProp(i, "level") === table.getDataAtRowProp(row, "level")) table.setCellMeta(i, 3, "source", arr);
                }
                let updateTopicForOldCourse = table.getDataAtRowProp(row, "topic") !== null && table.getDataAtRowProp(row, "topic") !== "";
                if (updateTopicForOldCourse && topicObj[oldValue] && !topicObj[oldValue].includes(table.getDataAtRowProp(row, "topic"))) {
                    for (let i = 0; i < table.countRows(); i++) {
                        if (i === row || table.getDataAtRowProp(i, "course") !== oldValue) continue;
                        if (table.getDataAtRowProp(i, "topic") === table.getDataAtRowProp(row, "topic")) updateTopicForOldCourse = false;
                    }
                    if (updateTopicForOldCourse) {
                        const topicArr = table.getCellMeta(row, 4).source;
                        topicArr.remove(table.getDataAtRowProp(row, "topic"));
                        for (let i = 0; i < table.countRows(); i++) {
                            if (table.getDataAtRowProp(i, "course") === oldValue) table.setCellMeta(i, 4, "source", topicArr);
                        }
                    }
                }
                table.setDataAtRowProp(row, "topic", "");
            }
            else if (prop === "topic") {
                if (oldValue === newValue && oldValue !== "") return;
                let arr = [];
                if (topicObj[table.getDataAtRowProp(row, "course")]) arr = [...topicObj[table.getDataAtRowProp(row, "course")]];
                for (let i = 0; i < table.countRows(); i++) {
                    if (table.getDataAtRowProp(i, "course") === table.getDataAtRowProp(row, "course")) arr.push(table.getDataAtRowProp(i, "topic"));
                }
                arr = arr.removeDuplicates();
                arr.remove(null);
                arr.remove("");
                for (let i = 0; i < table.countRows(); i++) {
                    if (table.getDataAtRowProp(i, "course") === table.getDataAtRowProp(row, "course")) table.setCellMeta(i, 4, "source", arr);
                }
            }
        });
    },
    licenseKey: "non-commercial-and-evaluation"
});
function updateColSetting(index, value) {
    const settings = table.getSettings().columns;
    settings[index] = {...settings[index], ...value};
    table.updateSettings({columns: settings});
}

addQuestionsDb.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        alert("No file selected. Please choose a file.");
        return;
    }
    if (file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
        alert("Unsupported file type. Please select a zip file.");
        return;
    }
    JSZip.loadAsync(file)
        .then(function (zip) {
            zip.file("questions.json").async("string").then(function (jsonData) {
                const data = JSON.parse(jsonData);
                if (!validateJSON(data)) {
                    alert("Uploaded database file not valid");
                    return;
                }
                Object.entries(data.questions).forEach(([key, value]) => {
                    tableData.push({
                        ...value,
                        id: key,
                        selected: true,
                        options: JSON.stringify(value.options),
                    });
                });
                Object.entries(data.courses).forEach(([level, course]) => {
                    if (!courseObj[level]) courseObj[level] = [];
                    courseObj[level] = courseObj[level].concat(Object.keys(course)).removeDuplicates();
                    Object.entries(course).forEach(([key, value]) => {
                        if (!topicObj[key]) topicObj[key] = [];
                        topicObj[key] = topicObj[key].concat(Object.keys(value.byTopic));
                    });
                });
                table.loadData(tableData);
                updateColSetting(2, {source: Object.keys(courseObj)});
                for (let i = 0; i < table.countRows(); i++) {
                    table.setCellMeta(i, 3, "source", courseObj[table.getDataAtRowProp(i, "level")]);
                    table.setCellMeta(i, 4, "source", topicObj[table.getDataAtRowProp(i, "course")]);
                }
                addQuestionsTable.classList.remove("visually-hidden");
                addQuestionsDocx.disabled = true;
                addQuestionsXlsx.disabled = true;
                addQuestionsDb.disabled = true;
                modalSetButton([addQuestionsCancel, addQuestionsTableNextButton]);
                location.href = "#addQuestionsTable";
            });
        }, function (e) {
            alert("Error reading uploaded file.\nError message: " + e.message);
            console.log("Error reading uploaded file: ", e.message);
        });
});
addQuestionsXlsx.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) {
        alert("No file selected. Please choose a file.");
        return;
    }
    if (file.type !== "application/vnd.ms-excel" && file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        alert("Unsupported file type. Please select an excel file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (data) => {
        const wb = XLSX.read(data.target.result, {type: "binary", sheets: 0});
        const ws = Object.values(wb.Sheets)[0];
        const obj = XLSX.utils.sheet_to_json(ws);
        tableData = obj.map((item) => ({...item, selected: true}));
        Object.entries(courses).forEach(([key, value]) => {
            courseObj[key] = Object.keys(value);
            Object.entries(value).forEach(([course, info]) => {
                topicObj[course] = Object.keys(info.byTopic);
            });
        });
        obj.forEach((row) => {
            if (row.level) {
                if (!Object.keys(courseObj).includes(row.level)) courseObj[row.level] = [];
                if (row.course) {
                    if (!courseObj[row.level].includes(row.course)) courseObj[row.level].push(row.course);
                    if (!Object.keys(topicObj).includes(row.course)) topicObj[row.course] = [];
                    if (row.topic) {
                        if (!topicObj[row.course].includes(row.topic)) topicObj[row.course].push(row.topic);
                    }
                }
            }
        });
        table.loadData(tableData);
        updateColSetting(2, {source: Object.keys(courseObj)});
        for (let i = 0; i < table.countRows(); i++) {
            table.setCellMeta(i, 3, "source", courseObj[table.getDataAtRowProp(i, "level")]);
            table.setCellMeta(i, 4, "source", topicObj[table.getDataAtRowProp(i, "course")]);
        }
        addQuestionsTable.classList.remove("visually-hidden");
        addQuestionsDocx.disabled = true;
        addQuestionsXlsx.disabled = true;
        addQuestionsDb.disabled = true;
        modalSetButton([addQuestionsCancel, addQuestionsTableNextButton]);
        location.href = "#addQuestionsTable";
    };
    reader.readAsBinaryString(file);
});

const addQuestionsCancel = createInputButton("addQuestionsCancel", "Cancel", "danger", function () {
    resetModal();
});
addQuestionsCancel.className = "btn btn-danger";
addQuestionsCancel.setAttribute("data-bs-dismiss", "modal");
const addQuestionsTableNextButton = createInputButton("addQuestionsTableNextButton", "Next", "primary", function () {
    if (!validateTable()) {
        alert("Invalid information found in the table. ");
        return;
    }
    const duplicates = [];
    questionsObj = {};
    for (let i = 0; i < table.countRows(); i++) {
        if (!table.getDataAtRowProp(i, "selected")) continue;
        const sourceData = table.getSourceDataAtRow(i);
        questionsObj[sourceData.id] = {
            year: sourceData.year,
            course: sourceData.course,
            question_number: sourceData.question_number,
            level: sourceData.level,
            topic: sourceData.topic,
            question: sourceData.question,
            options: JSON.parse(sourceData.options),
            answer: sourceData.answer,
            explanation: sourceData.explanation
        };
        if (Object.keys(questions).includes(sourceData.id)) duplicates.push(sourceData.id);
    }
    if (Object.keys(questionsObj).length === 0) {
        alert("You must select at least one row. ");
        return;
    }
    table.updateSettings({readOnly: true});
    if (duplicates.length > 0) {
        renderDuplicates(duplicates);
        modalSetButton([addQuestionsCancel, addQuestionsDuplicatesTableButton, addQuestionsDuplicatesNextButton]);
        addQuestionsDuplicates.classList.remove("visually-hidden");
        location.href = "#addQuestionsDuplicates";
    }
    else {
        modalSetButton([addQuestionsCancel, addQuestionsConfirmTableButton, addQuestionsSubmitButton]);
        document.getElementById("addQuestionsConfirmBox").value = Object.keys(questionsObj).join("\n");
        addQuestionsConfirm.classList.remove("visually-hidden");
        location.href = "#addQuestionsConfirm";
    }
});
addQuestionsTableNextButton.className = "btn btn-primary";
const addQuestionsDuplicatesTableButton = createInputButton("addQuestionsDuplicatesTableButton", "Previous", "primary", function () {
    addQuestionsDuplicates.classList.add("visually-hidden");
    table.updateSettings({readOnly: false});
    location.href = "#addQuestionsTable";
    modalSetButton([addQuestionsCancel, addQuestionsTableNextButton]);
});
addQuestionsDuplicatesTableButton.className = "btn btn-primary";
const addQuestionsConfirmTableButton = createInputButton("addQuestionsConfirmTableButton", "Previous", "primary", function () {
    addQuestionsConfirm.classList.add("visually-hidden");
    table.updateSettings({readOnly: false});
    location.href = "#addQuestionsTable";
    modalSetButton([addQuestionsCancel, addQuestionsTableNextButton]);
});
addQuestionsConfirmTableButton.className = "btn btn-primary";
const addQuestionsDuplicatesNextButton = createInputButton("addQuestionsDuplicatesNextButton", "Next", "primary", function () {
    const arr = [];
    for (const checkbox of document.querySelectorAll(".accordion-checkbox")) {
        if (!checkbox.checked) arr.push(checkbox.value);
    }
    questionsObj = {};
    for (let i = 0; i < table.countRows(); i++) {
        if (!table.getDataAtRowProp(i, "selected") || arr.includes(table.getDataAtRowProp(i, "id"))) continue;
        const sourceData = table.getSourceDataAtRow(i);
        questionsObj[sourceData.id] = {
            year: sourceData.year,
            course: sourceData.course,
            question_number: sourceData.question_number,
            level: sourceData.level,
            topic: sourceData.topic,
            question: sourceData.question,
            options: JSON.parse(sourceData.options),
            answer: sourceData.answer,
            explanation: sourceData.explanation
        };
    }
    if (Object.keys(questionsObj).length === 0) {
        alert("You must select at least one row. ");
        return;
    }
    document.querySelectorAll(".accordion-checkbox").forEach((checkbox) => {checkbox.disabled = true;});
    document.getElementById("addQuestionsConfirmBox").value = Object.keys(questionsObj).join("\n");
    addQuestionsConfirm.classList.remove("visually-hidden");
    location.href = "#addQuestionsConfirm";
    modalSetButton([addQuestionsCancel, addQuestionsConfirmDuplicatesButton, addQuestionsSubmitButton]);
});
addQuestionsDuplicatesNextButton.className = "btn btn-primary";
const addQuestionsConfirmDuplicatesButton = createInputButton("addQuestionsConfirmDuplicatesButton", "Previous", "primary", function () {
    addQuestionsConfirm.classList.add("visually-hidden");
    for (const checkbox of document.querySelectorAll(".accordion-checkbox")) checkbox.disabled = false;
    location.href = "#addQuestionsDuplicates";
    modalSetButton([addQuestionsCancel, addQuestionsDuplicatesTableButton, addQuestionsDuplicatesNextButton]);
});
addQuestionsConfirmDuplicatesButton.className = "btn btn-primary";
const addQuestionsSubmitButton = createInputButton("addQuestionsSubmitButton", "Submit", "primary", function () {
    questions = {...questions, ...questionsObj};
    let tp = 0;
    Object.entries(questionsObj).forEach(([key, value]) => {
        if (!Object.keys(courses).includes(value.level)) courses[value.level] = {};
        if (!Object.keys(courses[value.level]).includes(value.course)) {
            courses[value.level][value.course] = {"byYear": {}, "byTopic": {}};
            courseMap[value.course] = value.level;
        }
        if (!Object.keys(courses[value.level][value.course].byYear).includes(value.year)) courses[value.level][value.course].byYear[value.year] = [];
        courses[value.level][value.course].byYear[value.year].push(key);
        if (!Object.keys(courses[value.level][value.course].byTopic).includes(value.topic)) courses[value.level][value.course].byTopic[value.topic] = [];
        courses[value.level][value.course].byTopic[value.topic].push(key);
        if (questionCodeOptions.includes(key)) {
            tp++;
            questionCodeOptions.remove(key);
        }
        questionCodeOptions.push(key);
    });
    updateRenderingInfo(selectQuestion.length-tp);
    resetModal();
    addQuestionsModal.hide();
});
addQuestionsSubmitButton.className = "btn btn-primary";

modalSetButton([addQuestionsCancel]);
document.getElementById("addQuestionsButton").addEventListener("click", () => {
    if (saveChanges(false)) addQuestionsModal.show();
});