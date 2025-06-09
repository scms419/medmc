function createMDE(id, sideBySide, horizontal=true, status=true) {
    const option = {
        element: document.getElementById(id),
        sideBySideFullscreen: false,
        minHeight: (sideBySide && !horizontal) ? "31.4px" : "300px",
        previewRender: (plainText) => marked.parse(plainText),
        uploadImage: true,
        toolbar: [
            "bold",
            "italic",
            {
                name: "underline",
                className: "fa fa-underline",
                action: toggleUnderline,
                title: "Underline (Ctrl-U)",
            },
            "strikethrough",
            {
                name: "subscript",
                className: "fa fa-subscript",
                action: toggleSubscript,
                title: "Subscript (Ctrl-Shift-_)"
            },
            {
                name: "superscript",
                className: "fa fa-superscript",
                action: toggleSuperscript,
                title: "Superscript (Ctrl-Shift-+)"
            },
            "|",
            "heading-1",
            "heading-2",
            "heading-3",
            "|",
            {
                name: "unordered-list",
                className: "fa fa-list-ul",
                action: toggleUnorderedList,
                title: "Unordered List"
            },
            {
                name: "ordered-list",
                className: "fa fa-list-ol",
                title: "Ordered List",
                children: [
                    {
                        name: "numbered-list",
                        action: toggleOrderedList_number,
                        title: "Numbered List"
                    },
                    {
                        name: "capital-lettered-list",
                        action: toggleOrderedList_capitalLetter,
                        title: "Capital-lettered List"
                    },
                    {
                        name: "small-lettered-list",
                        action: toggleOrderedList_smallLetter,
                        title: "Small-lettered List"
                    },
                    {
                        name: "capital-roman-numeral-list",
                        action: toggleOrderedList_capitalRoman,
                        title: "Capital-roman-numeral List"
                    },
                    {
                        name: "small-roman-numeral-list",
                        action: toggleOrderedList_smallRoman,
                        title: "Small-roman-numeral List"
                    }
                ]
            },
            "|",
            {
                name: "insert-image",
                className: "fa fa-image",
                action: uploadImage,
                title: "Insert Image"
            },
            {
                name: "draw-table",
                className: "fa fa-table",
                action: EasyMDE.drawTable,
                title: "Insert Table"
            },
            {
                name: "katex",
                className: "fa fa-square-root-variable",
                action: toggleKatex,
                title: "KaTeX"
            },
            "|",
            {
                name: "undo",
                className: "fa fa-undo",
                action: EasyMDE.undo,
                title: "Undo (Ctrl-Z)"
            },
            {
                name: "redo",
                className: "fa fa-repeat fa-redo",
                action: EasyMDE.redo,
                title: "Redo (Ctrl-Y)"
            }
        ],
        shortcuts: {
            "toggleUnorderedList": null,
            "toggleOrderedList": null
        },
        insertTexts: {
            table: ["", "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n"]
        }
    };
    if (!status) option["status"] = false;
    const editor = new EasyMDE(option);
    if (sideBySide) {
        horizontal ? editor.toggleSideBySide() : editor.toggleSideBySideV();
    }
    const originalKeys = editor.codemirror.getOption("extraKeys") || {};
    editor.codemirror.setOption("extraKeys", {
        ...originalKeys,
        "Ctrl-U": (cm) => toggleUnderline(editor),
        "Shift-Ctrl--": (cm) => toggleSubscript(editor),
        "Shift-Ctrl-=": (cm) => toggleSuperscript(editor),
        "Enter": (cm) => newLineAndContinueList(editor)
    });
    let cm = editor.codemirror;
    cm.on("cursorActivity", function () {
        var startPoint = cm.getCursor('start');
        var endPoint = cm.getCursor('end');
        var text = cm.getLine(startPoint.line);
        if (isPatterned(text, startPoint.ch, endPoint.ch, "<u>", "</u>"))
            document.querySelector(`#${id} + div > div.editor-toolbar > button.underline`).classList.add("active");
        else
            document.querySelector(`#${id} + div > div.editor-toolbar > button.underline`).classList.remove("active");
        if (isPatterned(text, startPoint.ch, endPoint.ch, "<sub>", "</sub>"))
            document.querySelector(`#${id} + div > div.editor-toolbar > button.subscript`).classList.add("active");
        else
            document.querySelector(`#${id} + div > div.editor-toolbar > button.subscript`).classList.remove("active");
        if (isPatterned(text, startPoint.ch, endPoint.ch, "<sup>", "</sup>"))
            document.querySelector(`#${id} + div > div.editor-toolbar > button.superscript`).classList.add("active");
        else
            document.querySelector(`#${id} + div > div.editor-toolbar > button.superscript`).classList.remove("active");
        if (isPatterned(text, startPoint.ch, endPoint.ch, "$"))
            document.querySelector(`#${id} + div > div.editor-toolbar > button.katex`).classList.add("active");
        else
            document.querySelector(`#${id} + div > div.editor-toolbar > button.katex`).classList.remove("active");
        if (/^(\s*)(\d+\.|[A-Za-z]+\.|[iIvVxX]+\.)(\s+)/.test(text))
            document.querySelector(`#${id} + div > div.editor-toolbar > button.ordered-list`).classList.add("active");
        else
            document.querySelector(`#${id} + div > div.editor-toolbar > button.ordered-list`).classList.remove("active");
    })
    cm._handlers.drop.pop();
    cm.on("drop", function (cm, event) {
        event.stopPropagation();
        event.preventDefault();
        customUploadImageFunction(editor, event.dataTransfer.files[0]);
    });
    cm._handlers.paste.pop();
    cm.on("paste", function (cm, event) {
        customUploadImageFunction(editor, event.clipboardData.files[0], "paste");
    })
    const map = ["numbered-list", "capital-lettered-list", "small-lettered-list", "capital-roman-numeral-list", "small-roman-numeral-list"];
    for (let name of map) {
        document.querySelector(`.${name}`).innerHTML = `<img src="icon/${name}.png" width="20" height="20">`
    }
    return editor;
}

function intToRoman(n) {
    const romanValues = {
        X: 10, IX: 9, V: 5, IV: 4, I: 1
    }
    let str = "";
    for (let key in romanValues) {
        while (n >= romanValues[key]) {
            str += key;
            n -= romanValues[key];
        }
    }
    return str;
}

function romanToInt(str) {
    const romanValues = {
        X: 10, IX: 9, V: 5, IV: 4, I: 1
    }
    let n=0;
    for (let i = 0; i < str.length; i++) {
        if (i+1 < str.length && romanValues[str[i+1]] > romanValues[str[i]]) n -= romanValues[str[i]];
        else n += romanValues[str[i]];
    }
    return n;
}

function toggleSideBySideV(editor) {
    var cm = editor.codemirror;
    var wrapper = cm.getWrapperElement();
    var preview = wrapper.nextSibling;
    var toolbarButton = editor.toolbarElements && editor.toolbarElements['side-by-side'];
    var useSideBySideListener = false;

    var easyMDEContainer = wrapper.parentNode;

    if (preview.classList.contains('editor-preview-active-side')) {
        if (editor.options.sideBySideFullscreen === false) {
            // if side-by-side not-fullscreen ok, remove classes when hiding side
            easyMDEContainer.classList.remove('sidedv--no-fullscreen');
        }
        preview.classList.remove('editor-preview-active-side');
        if (toolbarButton) toolbarButton.classList.remove('active');
        wrapper.classList.remove('CodeMirror-sided');
    } else {
        // When the preview button is clicked for the first time,
        // give some time for the transition from editor.css to fire and the view to slide from right to left,
        // instead of just appearing.
        setTimeout(function () {
            if (!cm.getOption('fullScreen')) {
                if (editor.options.sideBySideFullscreen === false) {
                    // if side-by-side not-fullscreen ok, add classes when not fullscreen and showing side
                    easyMDEContainer.classList.add('sidedv--no-fullscreen');
                } else {
                    toggleFullScreen(editor);
                }
            }
            preview.classList.add('editor-preview-active-side');
        }, 1);
        if (toolbarButton) toolbarButton.classList.add('active');
        wrapper.classList.add('CodeMirror-sided');
        useSideBySideListener = true;
    }

    // Hide normal preview if active
    var previewNormal = wrapper.lastChild;
    if (previewNormal.classList.contains('editor-preview-active')) {
        previewNormal.classList.remove('editor-preview-active');
        var toolbar = editor.toolbarElements.preview;
        var toolbar_div = editor.toolbar_div;
        toolbar.classList.remove('active');
        toolbar_div.classList.remove('disabled-for-preview');
    }

    var sideBySideRenderingFunction = function () {
        var newValue = editor.options.previewRender(editor.value(), preview);
        if (newValue != null) {
            preview.innerHTML = newValue;
        }
    };

    if (!cm.sideBySideRenderingFunction) {
        cm.sideBySideRenderingFunction = sideBySideRenderingFunction;
    }

    if (useSideBySideListener) {
        var newValue = editor.options.previewRender(editor.value(), preview);
        if (newValue != null) {
            preview.innerHTML = newValue;
        }
        cm.on('update', cm.sideBySideRenderingFunction);
    } else {
        cm.off('update', cm.sideBySideRenderingFunction);
    }

    // Refresh to fix selection being off (#309)
    cm.refresh();
}

function isPatterned(str, start, end, patternStart, patternEnd) {
    patternEnd = (patternEnd) ? patternEnd : patternStart;
    let startPoint = str.indexOf(patternStart);
    let endPoint = str.indexOf(patternEnd, startPoint+1);
    while (true) {
        if (startPoint === -1 || endPoint === -1) return false;
        else if (startPoint < start) {
            if (endPoint < start) {
                startPoint = str.indexOf(patternStart, endPoint+1);
                endPoint = str.indexOf(patternEnd, startPoint+1);
            }
            else return true;
        }
        else return (startPoint < end);
    }
}

function togglePattern(editor, patternStart, patternEnd) {
    if (!editor.codemirror || editor.isPreviewActive()) {
        return;
    }
    patternEnd = (patternEnd) ? patternEnd : patternStart;
    var cm = editor.codemirror;
    var start = patternStart;
    var end = patternEnd;
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    var text = cm.getLine(startPoint.line);
    if (isPatterned(text, startPoint.ch, endPoint.ch, patternStart, patternEnd)) {
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        start = start.replace(patternStart, '');
        end = end.replace(patternEnd, '');
        cm.replaceRange(start + end, {
            line: startPoint.line,
            ch: 0,
        }, {
            line: startPoint.line,
            ch: 99999999999999,
        });
        startPoint.ch -= patternStart.length;
        if (startPoint !== endPoint) endPoint.ch -= patternStart.length;
    } else {
        text = cm.getSelection();
        cm.replaceSelection(start + text + end);
        startPoint.ch += patternStart.length;
        endPoint.ch = startPoint.ch + text.length;
    }
    cm.setSelection(startPoint, endPoint);
    cm.focus();
}

function _toggleLine(editor, liststyle) {
    let cm = editor.codemirror;
    if (cm.getWrapperElement().lastChild.classList.contains('editor-preview-active'))
        return;

    var listRegexp = /^(\s*)(\*|-|\+|\d+\.|[A-Za-z]+\.|[iIvVxX]+\.)(\s+)/;
    var whitespacesRegexp = /^\s*/;

    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    var repl = {
        "*": /^(\s*)(\*)(\s+)/,
        "-": /^(\s*)(-)(\s+)/,
        "+": /^(\s*)(\+)(\s+)/,
        "1": /^(\s*)(\d+\.)(\s+)/,
        "A": /^(\s*)([A-Z]+\.)(\s+)/,
        "a": /^(\s*)([a-z]+\.)(\s+)/,
        "I": /^(\s*)([IVX]+\.)(\s+)/,
        "i": /^(\s*)([ivx]+\.)(\s+)/
    }

    var orderedListChar = function (i) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (liststyle === "1") return i;
        else if (liststyle === "A" || liststyle === "a") {
            let str = "";
            while (i > 0) {
                i--;
                str = letters.charAt(i % 26) + str;
                i = Math.floor(i / 26);
            }
            return (liststyle === "A") ? str : str.toLowerCase();
        }
        else if (liststyle === "I" || liststyle === "i") {
            return (liststyle === "I") ? intToRoman(i) : intToRoman(i).toLowerCase();
        }
    }

    var _getChar = function (i) {
        return (liststyle === "*" || liststyle === "-" || liststyle === "+") ? liststyle : orderedListChar(i)+".";
    };

    var _checkChar = function (char) {
        var map;
        if (liststyle === "*" || liststyle === "+") map = "\\" + liststyle;
        else if (liststyle === "-") map = liststyle;
        else if (liststyle === "1") map = "\\d+.";
        else if (liststyle === "A") map = "\\[A-Z]+.";
        else if (liststyle === "a") map = "\\[a-z]+.";
        else if (liststyle === "I") map = "\\[XVI]+.";
        else if (liststyle === "i") map = "\\[xvi]+.";
        var rt = new RegExp(map);

        return char && rt.test(char);
    };

    var _toggle = function (text) {
        var arr = listRegexp.exec(text);
        var char = _getChar(line);
        if (arr !== null) {
            if (_checkChar(arr[2])) {
                char = '';
            }
            text = arr[1] + char + arr[3] + text.replace(whitespacesRegexp, '').replace(listRegexp, '$1');
        } else {
            text = ' ' + char + ' ' + text;
        }
        return text;
    };

    var line = 1;
    for (var i = startPoint.line; i <= endPoint.line; i++) {
        (function (i) {
            var text = cm.getLine(i);
            if (repl[liststyle].test(cm.getLine(i))) {
                text = text.replace(repl[liststyle], '');
            }
            else {
                text = _toggle(text);
                line += 1;
            }
            cm.replaceRange(text, {
                line: i,
                ch: 0,
            }, {
                line: i,
                ch: 99999999999999,
            });
        })(i);
    }
    cm.focus();
}

function nextListItem(style, current) {
    if (style === "1") return (parseInt(current.slice(0, current.length-1))+1) + ".";
    else if (style === "A" || style === "a") {
        let str = ".";
        let b = true;
        for (let i = current.length-2; i >= 0; i--) {
            if (current[i] === "Z" || current[i] === "z") str = "A" + str;
            else {
                str = current.slice(0, i) + String.fromCharCode(current.charCodeAt(i)+1) + str;
                b = false;
                break;
            }
        }
        if (b) str = "A" + str;
        return (style === "A") ? str : str.toLowerCase();
    }
    else if (style === "I" || style === "i") {
        let str = current.slice(0, current.length-1).toUpperCase();
        str = intToRoman(romanToInt(str)+1) + ".";
        return (style === "I") ? str : str.toLowerCase();
    }
}

function newLineAndContinueList(editor) {
    let cm = editor.codemirror;
    let startPoint = cm.getCursor("start");
    let endPoint = cm.getCursor("end");
    let text = cm.getLine(startPoint.line);
    let prevText = (startPoint.line > 0) ? cm.getLine(startPoint.line-1) : "";
    let listRegexp = /^(\s*)(\*|-|\+|\d+\.|[A-Za-z]+\.|[iIvVxX]+\.)(\s+)/;
    let match = listRegexp.exec(text);
    let prevMatch = listRegexp.exec(prevText);
    if (match) {
        let style = match[2];
        let prevStyle = (prevMatch) ? prevMatch[2] : "";
        if (prevMatch && /\*|-|\+/.test(style) && /\*|-|\+/.test(prevStyle) || !prevMatch && /\*|-|\+/.test(style)) cm.replaceSelection('\n' + match[0]);
        else if (prevMatch && /\d+\./.test(style) && /\d+\./.test(prevStyle) || !prevMatch && /\d+\./.test(style)) cm.replaceSelection('\n' + match[1] + nextListItem("1", match[2]) + match[3]);
        else if (prevMatch && /[XVI]+\./.test(style) && /[XVI]+\./.test(prevStyle) || !prevMatch && /[XVI]+\./.test(style)) cm.replaceSelection('\n' + match[1] + nextListItem("I", match[2]) + match[3]);
        else if (prevMatch && /[xvi]+\./.test(style) && /[xvi]+\./.test(prevStyle) || !prevMatch && /[xvi]+\./.test(style)) cm.replaceSelection('\n' + match[1] + nextListItem("i", match[2]) + match[3]);
        else if (prevMatch && /[A-Z]+\./.test(style) && /[A-Z]+\./.test(prevStyle) || !prevMatch && /[A-Z]+\./.test(style)) cm.replaceSelection('\n' + match[1] + nextListItem("A", match[2]) + match[3]);
        else if (prevMatch && /[a-z]+\./.test(style) && /[a-z]+\./.test(prevStyle) || !prevMatch && /[a-z]+\./.test(style)) cm.replaceSelection('\n' + match[1] + nextListItem("a", match[2]) + match[3]);
        else cm.replaceSelection('\n');
    }
    else cm.replaceSelection('\n');
}

function customUploadImageFunction(editor, file, event) {
    if (!file) {
        if (event !== "paste") alert("No file selected. Please choose a file.");
        return;
    }
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
        alert("Unsupported file type. Please select a png or jpeg file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        let img = new Image();
        let fileName = id.replaceAll(/\s/g, "_") + "_"+ Date.now() + file.type.replace(/^image\//, ".");
        let result = reader.result;
        img.onload = function () {
            if (img.height > 500 || img.width > 500) {
                if (confirm("The image will be too large. Please select OK to allow the program to resize the image.")) {
                    let canvas = document.createElement("canvas");
                    let w = Math.floor(img.width / Math.max(img.height, img.width) * 500);
                    let h = Math.floor(img.height / Math.max(img.height, img.width) * 500);
                    canvas.width = w;
                    canvas.height = h;
                    let ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);
                    result = canvas.toDataURL(file.type);
                }
                else return;
            }
            result = result.replace(/^data:image\/(png|jpe?g);base64,/, "");
            localStorage.setItem(fileName, result);
            editor.updateStatusBar('upload-image', "Uploaded " + file.name);
            setTimeout(function () {
                editor.updateStatusBar('upload-image', editor.options.imageTexts.sbInit);
            }, 1000);
            let cm = editor.codemirror;
            cm.replaceSelection("![](img/"+fileName+")");
        }
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
}

function uploadImage(editor) {
    let input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", (e) => {
        customUploadImageFunction(editor, e.target.files[0]);
    });
}

EasyMDE.prototype.toggleSideBySideV = function() {toggleSideBySideV(this);};

function toggleUnderline(editor) {
    togglePattern(editor, "<u>", "</u>");
}

function toggleSubscript(editor) {
    togglePattern(editor, "<sub>", "</sub>");
}

function toggleSuperscript(editor) {
    togglePattern(editor, "<sup>", "</sup>");
}

function toggleUnorderedList(editor) {
    _toggleLine(editor, "*");
}

function toggleOrderedList_number(editor) {
    _toggleLine(editor, "1");
}

function toggleOrderedList_capitalLetter(editor) {
    _toggleLine(editor, "A");
}

function toggleOrderedList_smallLetter(editor) {
    _toggleLine(editor, "a");
}

function toggleOrderedList_capitalRoman(editor) {
    _toggleLine(editor, "I");
}

function toggleOrderedList_smallRoman(editor) {
    _toggleLine(editor, "i");
}

function toggleKatex(editor) {
    togglePattern(editor, "$");
}
