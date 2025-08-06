createMDE("sampleMDE", "Type some text here", true);

let courseObj = {"Year 1 Sem 1": ["MATH0000"]};
let topicObj = {"MATH0000": ["Simple Mathematics"]};
const tableData = [
    {
        selected: true,
        id: "24-25 MATH0000 Q1",
        year: "2024-25",
        question_number: "1",
        level: "Year 1 Sem 1",
        course: "MATH0000",
        topic: "Simple Mathematics",
        question: "1 + 1 = ?",
        options: "{\"A\":\"0\",\"B\":\"1\",\"C\":\"2\",\"D\":\"3\"}",
        answer: "C",
        explanation: "One plus one is two"
    },
    {
        selected: true,
        id: "24-25 MATH0000 Q2",
        year: "2024-25",
        question_number: "2",
        level: "Year 1 Sem 1",
        course: "MATH0000",
        topic: "Simple Mathematics",
        question: "\"In the figure, $\\mathit{PQRS}$ is a rectangle. Let $\\mathit{T}$ be a point lying on $\\mathit{QR}$ such that $\\angle PTS = 90 \\degree$. $\\mathit{PQ}$ produced and $\\mathit{ST}$ produced meet at the point $\\mathit{U}$. $\\mathit{PT}$ is produced to the point $\\mathit{V}$ such that $RT = RV$. Which of the following must be true?\n" +
            "\n" +
            "![](img/24-25_MATH0000_Q2_1754472308690.png)\"",
        options: "{\"A\":\"$RV // ST$\",\"B\":\"$\\\\angle PTQ = \\\\angle RTS$\",\"C\":\"$\\\\triangle PST \\\\sim \\\\triangle UTQ$\",\"D\":\"$\\\\triangle PQT \\\\cong \\\\triangle TRS$\"}",
        answer: "C",
        explanation: "\"$\\angle PTS = \\angle UQT = 90 \\degree$\n" +
            "\n" +
            "$\\angle PST = \\angle UTQ \\; (corr. \\; \\angle s, \\; PS // QT)$\n" +
            "\n" +
            "$\\triangle PST \\sim \\triangle UTQ \\; (AA)$\n" +
            "\n" +
            "*(Question from HKDSE 2023 Maths Paper II Q21)*\""
    },
    {
        selected: true,
        id: "24-25 MATH0000 Q3",
        year: "2024-25",
        question_number: "3",
        level: "Year 1 Sem 1",
        course: "MATH0000",
        topic: "Simple Mathematics",
        question: "\"Consider the following statements about 5 Boolean variables **A**, **B**, **C**, **D** and **E**:\n" +
            "\n" +
            "*   If **A** is true then **B** is true.\n" +
            "*   **C** is true if and only if **B** is true.\n" +
            "*   If **A** and **B** are equal then **D** is true.\n" +
            "*   If **B** and **C** are equal then **E** is true.\n" +
            "\n" +
            "Which of the following statements is always correct?\"",
        options: "{\"A\":\"If **B** is true then **D** is true.\",\"B\":\"**C** is true if and only if **A** is true.\",\"C\":\"At least one of **B** and **D** is true.\",\"D\":\"It is possible that exactly one of **A**, **B**, **C**, **D**, **E** is true.\"}",
        answer: "C",
        explanation: "\"Consider the contrapositive statement of statement 1: “If **B** is false then **A** is false.”\n" +
            "\n" +
            "Then we can take one case of statement 3: “If **A** is false and **B** is false then **D** is true.”\n" +
            "\n" +
            "Combining with the contrapositive statement of statement 1 we get: “If **B** is false then **D** is true”, which has the same meaning as “At least one of **B** and **D** is true.”\n" +
            "\n" +
            "*(Question from Hong Kong Olympiad in Informatics 2023/24 Heat Event Senior Group Q15)*\""
    }
]

function updateColSetting(prop, value) {
    let index = table.propToCol(prop);
    const settings = table.getSettings().columns;
    settings[index] = {...settings[index], ...value};
    table.updateSettings({columns: settings});
}

const table = new Handsontable(document.getElementById('spreadsheet'), {
    rowHeaders: true,
    colHeaders: ["", "ID", "Year", "Question No.", "Level", "Course", "Topic", "Question", "Options", "Answer", "Explanation"],
    height: "auto",
    minSpareRows: 1,
    autoColumns: true,
    columns: [
        {data: "selected", type: "checkbox"},
        {data: "id", width: 200, wordWrap: false},
        {data: "year"},
        {data: "question_number", type: "numeric"},
        {data: "level", type: "autocomplete", strict: false},
        {data: "course", type: "autocomplete", strict: false},
        {data: "topic", type: "autocomplete", strict: false},
        {data: "question", width: 400, wordWrap: false},
        {data: "options", width: 300, wordWrap: false},
        {data: "answer"},
        {data: "explanation", width: 500, wordWrap: false},
    ],
    autoWrapRow: true,
    autoWrapCol: true,
    formulas: {
        engine: HyperFormula
    },
    afterChange: (changes) => {
        changes?.forEach(([row, prop, oldValue, newValue]) => {
            if (prop === "level") {
                if (oldValue === newValue) return;
                const arr = Object.keys(courseObj).concat(table.getDataAtProp("level")).removeDuplicates();
                arr.remove(null);
                arr.remove("");
                updateColSetting("level", {source: arr});
                let updateCourseForOldLevel = table.getDataAtRowProp(row, "course") !== null && table.getDataAtRowProp(row, "course") !== "";
                if (updateCourseForOldLevel && courseObj[oldValue] && !courseObj[oldValue].includes(table.getDataAtRowProp(row, "course"))) {
                    for (let i = 0; i < table.countRows(); i++) {
                        if (i === row || table.getDataAtRowProp(i, "level") !== oldValue) continue;
                        if (table.getDataAtRowProp(i, "course") === table.getDataAtRowProp(row, "course")) updateCourseForOldLevel = false;
                    }
                    if (updateCourseForOldLevel) {
                        const courseArr = table.getCellMeta(row, table.propToCol("course")).source;
                        courseArr.remove(table.getDataAtRowProp(row, "course"));
                        for (let i = 0; i < table.countRows(); i++) {
                            if (table.getDataAtRowProp(i, "level") === oldValue) table.setCellMeta(i, table.propToCol("course"), "source", courseArr);
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
                    if (table.getDataAtRowProp(i, "level") === table.getDataAtRowProp(row, "level")) table.setCellMeta(i, table.propToCol("course"), "source", arr);
                }
                let updateTopicForOldCourse = table.getDataAtRowProp(row, "topic") !== null && table.getDataAtRowProp(row, "topic") !== "";
                if (updateTopicForOldCourse && topicObj[oldValue] && !topicObj[oldValue].includes(table.getDataAtRowProp(row, "topic"))) {
                    for (let i = 0; i < table.countRows(); i++) {
                        if (i === row || table.getDataAtRowProp(i, "course") !== oldValue) continue;
                        if (table.getDataAtRowProp(i, "topic") === table.getDataAtRowProp(row, "topic")) updateTopicForOldCourse = false;
                    }
                    if (updateTopicForOldCourse) {
                        const topicArr = table.getCellMeta(row, table.propToCol("topic")).source;
                        topicArr.remove(table.getDataAtRowProp(row, "topic"));
                        for (let i = 0; i < table.countRows(); i++) {
                            if (table.getDataAtRowProp(i, "course") === oldValue) table.setCellMeta(i, table.propToCol("topic"), "source", topicArr);
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
                    if (table.getDataAtRowProp(i, "course") === table.getDataAtRowProp(row, "course")) table.setCellMeta(i, table.propToCol("topic"), "source", arr);
                }
            }
        });
    },
    licenseKey: "non-commercial-and-evaluation"
});
table.loadData(tableData)