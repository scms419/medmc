let zip = new JSZip();
let imgFolder = zip.folder("img");
const prevButton = document.getElementById("prevButton");
const selectQuestion = document.getElementById("selectQuestion");
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
let courseMap = {};
let options = {};
let id, question;
let initialData;

Array.prototype.remove = function (value) {
    this.splice(this.indexOf(value), 1);
}
function updateQuestionCode (selectedIndex) {
    selectQuestion.innerHTML = `
        ${Object.keys(questions).map(key => `
            <option value="${key}">${key}</option>
        `).join('')}
    `;
    if (selectedIndex) selectQuestion.selectedIndex = selectedIndex;
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
            }
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

prevButton.addEventListener("click", () => {
    if (saveChanges(true)) {
        if (selectQuestion.selectedIndex !== -1) selectQuestion.selectedIndex--;
        else selectQuestion.selectedIndex = selectQuestion.length - 1;
        updateRenderingInfo(selectQuestion.selectedIndex);
    }
});
selectQuestion.addEventListener("change", () => {
    if (saveChanges(false)) {
        updateRenderingInfo(selectQuestion.selectedIndex);
    }
});
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

const saveButton = createInputButton("saveButton", "Save changes", function () {
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
const removeButton = createInputButton("removeButton", "Remove this question", function () {
    if (Object.keys(questions).length === 1) {
        alert("You cannot remove the only question");
        return;
    }
    if (checkEmpty() || confirm("Confirm removing this question?")) {
        if (id !== "") {
            delete questions[id];
            courses[courseMap[question.course]][question.course].byYear[question.year].remove(id);
            courses[courseMap[question.course]][question.course].byTopic[question.topic].remove(id);
        }
        if (selectQuestion.selectedIndex === -1) updateRenderingInfo(selectQuestion.length-1);
        else if (selectQuestion.selectedIndex === 0) updateRenderingInfo(0);
        else updateRenderingInfo(selectQuestion.selectedIndex-1);
    }
});
const cancelButton = createInputButton("cancelButton", "Return to homepage", function () {
    saveChanges(true, false);
    if (JSON.stringify({courses, questions}) !== initialData && !confirm("Changes have not been saved. Confirm returning to homepage?")) return;
    location.href = "index.html";
});
setButtons([removeButton, saveButton, cancelButton]);

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
for (let level of Object.keys(courses)) {
    for (let course of Object.keys(courses[level])) {
        courseMap[course] = level;
    }
}

updateRenderingInfo();
