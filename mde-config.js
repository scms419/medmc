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

EasyMDE.prototype.toggleSideBySideV = function() {toggleSideBySideV(this);};

function isPatterned(str, start, end, pattern) {
    let startPoint = str.indexOf("<"+pattern+">");
    let endPoint = str.indexOf("</"+pattern+">", startPoint);
    while (true) {
        if (startPoint === -1) return false;
        else if (startPoint < start) {
            if (endPoint < start) {
                startPoint = str.indexOf("<"+pattern+">", endPoint);
                endPoint = str.indexOf("</"+pattern+">", startPoint);
            }
            else return true;
        }
        else return (startPoint < end);
    }
}

function togglePattern(editor, pattern) {
    if (!editor.codemirror || editor.isPreviewActive()) {
        return;
    }
    var cm = editor.codemirror;
    var start = "<"+pattern+">";
    var end = "</"+pattern+">";
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    var text = cm.getLine(startPoint.line);
    if (isPatterned(text, startPoint.ch, endPoint.ch, pattern)) {
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        start = start.replace("<"+pattern+">", '');
        end = end.replace("</"+pattern+">", '');
        cm.replaceRange(start + end, {
            line: startPoint.line,
            ch: 0,
        }, {
            line: startPoint.line,
            ch: 99999999999999,
        });
        startPoint.ch -= 2+pattern.length;
        if (startPoint !== endPoint) endPoint.ch -= 3+pattern.length;
    } else {
        text = cm.getSelection();
        cm.replaceSelection(start + text + end);
        startPoint.ch += 2+pattern.length;
        endPoint.ch = startPoint.ch + text.length;
    }
    cm.setSelection(startPoint, endPoint);
    cm.focus();
}

function toggleUnderline(editor) {
    togglePattern(editor, "u");
}

function toggleSubscript(editor) {
    togglePattern(editor, "sub");
}

function toggleSuperscript(editor) {
    togglePattern(editor, "sup");
}