document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        try {
            localStorage.setItem("data", reader.result);
            location.href = "form.html";
        }
        catch (error) {
            console.log("Error reading data: ", error);
        }
    };
    reader.readAsText(file);
});

document.getElementById("localInput").addEventListener("click", (e) => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("data", JSON.stringify(data));
            location.href = "form.html";
        })
        .catch(error => {
            console.error("Error loading JSON data: ", error);
            formContainer.innerHTML = "<h1>Error Loading JSON data</h1>";
        });
});
