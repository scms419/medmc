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
                "question": "Start your question here",
                "options": {
                    "A": "",
                    "B": "",
                    "C": "",
                    "D": "",
                    "E": ""
                },
                "answer": "",
                "explanation": "Provide your explanation here"
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
            console.error("Error loading JSON data: ", error);
        })
});

document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        try {
            localStorage.setItem("database", reader.result);
            location.href = "database.html";
        }
        catch (error) {
            console.log("Error reading data: ", error);
        }
    }
    reader.readAsText(file);
});