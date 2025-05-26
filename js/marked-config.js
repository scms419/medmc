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
const customOrderedList = {
    name: "customOrderedList",
    level: "block",
    start(src) {
        return src.match(/(?:^|\n)(\s*)(\d+\.|[A-Za-z]+\.|[iIvVxX]+\.)(\s+)/)?.index;
    },
    tokenizer(src, tokens) {
        const rule = /^([^\S\r\n]*)(\d+|[A-Za-z]+|[iIvVxX]+)(\.)(\s+)(.*)/;
        const textRule = /^([^\S\r\n]*)(.*)/;
        const match = rule.exec(src);
        let style;
        if (match) {
            if (/\d+/.test(match[2])) style = "1";
            else if (/[IVX]+/.test(match[2])) style = "I";
            else if (/[ivx]+/.test(match[2])) style = "i";
            else if (/[A-Z]+/.test(match[2])) style = "A";
            else if (/[a-z]+/.test(match[2])) style = "a";
            const items = [];
            let remainingSrc = src;
            let prevIndent = match[1].length;
            let itemText = "", raw = "";
            while (remainingSrc) {
                const itemMatch = rule.exec(remainingSrc);
                const textMatch = textRule.exec(remainingSrc);
                if (itemMatch && itemMatch[1].length === prevIndent) {
                    let itemStyle;
                    if (/\d+/.test(itemMatch[2])) itemStyle = "1";
                    else if (/[IVX]+/.test(itemMatch[2])) itemStyle = "I";
                    else if (/[ivx]+/.test(itemMatch[2])) itemStyle = "i";
                    else if (/[A-Z]+/.test(itemMatch[2])) itemStyle = "A";
                    else if (/[a-z]+/.test(itemMatch[2])) itemStyle = "a";
                    else break;
                    if (itemStyle !== style) break;
                    if (itemText) {
                        const itemTokens = [];
                        this.lexer.inlineTokens(itemText, itemTokens);
                        items.push({
                            type: "customOrderedListItem",
                            raw: raw,
                            tokens: itemTokens
                        });
                    }
                    itemText = itemMatch[5].trim();
                    raw = itemMatch[0];
                    remainingSrc = remainingSrc.slice(itemMatch[0].length + 1);
                }
                else if (textMatch && textMatch[1].length === prevIndent) {
                    itemText += "\n" + textMatch[2];
                    raw += "\n" + textMatch[0];
                    remainingSrc = remainingSrc.slice(textMatch[0].length + 1);
                }
                else break;
            }
            if (itemText) {
                const itemTokens = [];
                this.lexer.inlineTokens(itemText, itemTokens);
                items.push({
                    type: "customOrderedListItem",
                    raw: raw,
                    tokens: itemTokens
                });
            }
            const token = {
                type: "customOrderedList",
                raw: src.slice(0, src.length - remainingSrc.length),
                style: style,
                items: items
            };
            return token;
        }
    },
    renderer(token) {
        const listItems = token.items.map(item =>
            `<li>${this.parser.parseInline(item.tokens)}</li>`
        ).join('\n');
        return `<ol type="${token.style}">\n${listItems}\n</ol>\n`;
    },
    childTokens: ["items"]
};

marked.use({ breaks: true });
marked.use(markedKatex(katexOptions));
marked.use({ extensions: [customOrderedList] });
marked.use({ renderer: previewImageRenderer });