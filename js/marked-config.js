const katexOptions = {
    throwOnError: false
};
const previewImageRenderer = {
    image({href, title, text, tokens}) {
        if (tokens) text = this.parser.parseInline(tokens, this.parser.textRenderer);
        let tp = new Image();
        tp.src = href;
        if (tp.width !== 0) return `<img src="${href}" alt="${text}" title="${title || ""}">`;
        let src = href.slice(href.lastIndexOf("/")+1);
        let type = href.slice(href.lastIndexOf(".")+1);
        let dataURL = "data:image/" + type + ";base64," + localStorage.getItem(src);
        return `
            <img src="${dataURL}" alt="${text}" title="${title || ""}">
        `;
    }
};

marked.use({ breaks: true });
marked.use(markedKatex(katexOptions));
marked.use(markedMoreLists());
marked.use({ renderer: previewImageRenderer });