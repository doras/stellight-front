import twemoji from "@twemoji/api";

export default {
    mounted: (el) => twemoji.parse(el, {
        folder: "svg",
        ext: ".svg",
    }),
    updated: (el) => twemoji.parse(el, {
        folder: "svg",
        ext: ".svg",
    }),
};
