document.getElementById("fileInput").addEventListener("click", (e) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.click();
    fileInput.onchange = () => {
        const file = fileInput.files[0];
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
                zip.file("questions.json").async("string").then(function (data) {
                    localStorage.setItem("data", data);
                });
                zip.folder("img").forEach(function (relativePath, zipEntry) {
                    zipEntry.async("base64").then(function (data) {
                        localStorage.setItem(zipEntry.name.replace(/img\//, ""), data);
                    });
                });
                location.href = "form.html";
            }, function (e) {
                alert("Error reading uploaded file.\nError message: " + e.message);
                console.log("Error reading uploaded file: ", e.message);
            });
    }
});

document.getElementById("localInput").addEventListener("click", (e) => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("data", JSON.stringify(data));
            location.href = "form.html";
        })
        .catch(error => {
            alert("Error loading JSON data.\n Error message: " + error);
            console.error("Error loading JSON data: ", error);
        });
});
