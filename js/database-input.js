document.getElementById("newData").addEventListener("click", (e) => {
    const template = {
        "courses": {

        },
        "questions": {
            "": {
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
            }
        }
    };
    localStorage.setItem("database", JSON.stringify(template));
    location.href = "database.html";
});

document.getElementById("localData").addEventListener("click", (e) => {
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("database", JSON.stringify(data));
            location.href = "database.html";
        })
        .catch(error => {
            alert("Error loading JSON data.\nError message: " + error);
            console.error("Error loading JSON data: ", error);
        })
});

document.getElementById("fileInput").addEventListener("click", (e) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.click();
    fileInput.onchange = () => {
        const file = fileInput.files[0]
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
                let promises = [];

                let jsonPromise = zip.file("questions.json").async("string").then(function (data) {
                    localStorage.setItem("database", data);
                });
                promises.push(jsonPromise);

                zip.folder("img").forEach(function (relativePath, zipEntry) {
                    let imgPromise = zipEntry.async("base64").then(function (data) {
                        localStorage.setItem(zipEntry.name.replace(/img\//, ""), data);
                    });
                    promises.push(imgPromise);
                });

                return Promise.all(promises);
            })
            .then(function () {
                location.href = "database.html";
            })
            .catch(function (e) {
                alert("Error reading uploaded file.\nError message: " + e.message);
                console.log("Error reading uploaded file: ", e.message);
            });
    }
});