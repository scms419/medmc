const katexOptions = {
    throwOnError: false
};
const previewImageRenderer = {
    image({href, title, text, tokens}) {
        if (tokens) text = this.parser.parseInline(tokens, this.parser.textRenderer);
        return `
            <img class="async-image" data-src=${href} alt="${text}" title="${title || ""}">
        `;
    }
};

marked.use({ breaks: true });
marked.use(markedKatex(katexOptions));
marked.use(markedMoreLists());
marked.use({ renderer: previewImageRenderer });