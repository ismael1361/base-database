// @ts-check
// @ts-ignore
import * as sass from "sass";
document.addEventListener("DOMContentLoaded", async () => {
    /**
     *
     * @param {string} scssText
     * @returns {Promise<HTMLStyleElement>}
     */
    const buildCssStyleElementFromScss = async (scssText) => {
        const sassResult = await sass.compileStringAsync(scssText);
        const cssElement = document.createElement("style");
        cssElement.innerHTML = sassResult.css;
        return cssElement;
    };
    /**
     *
     * @param {string} typescriptSource
     * @returns {HTMLScriptElement}
     */
    const buildScriptElementFromTypeScript = (typescriptSource) => {
        const scriptSource = /** @type {any} */ (window).ts.transpile(typescriptSource, {
            target: "es2015",
        });
        const scriptElement = document.createElement("script");
        scriptElement.type = "module";
        scriptElement.innerHTML = scriptSource;
        return scriptElement;
    };
    /** @type {NodeListOf<HTMLLinkElement|HTMLStyleElement>} */
    const scssElements = document.querySelectorAll("link[rel='stylesheet'][type='text/x-scss'], style[type='text/x-scss']");
    scssElements.forEach(async (scssElement) => {
        /** @type {string} */
        let scssText = "";
        if (scssElement.tagName === "LINK") {
            const fetched = await fetch(/** @type {HTMLLinkElement} */ (scssElement).href);
            if (fetched.ok) {
                scssText = await fetched.text();
            }
        }
        else {
            // should be STYLE
            scssText = scssElement.innerHTML;
        }
        const cssElement = await buildCssStyleElementFromScss(scssText);
        scssElement.replaceWith(cssElement);
    });
    /** @type {NodeListOf<HTMLScriptElement>} */
    const typescriptElements = document.querySelectorAll("script[type='application/typescript']");
    typescriptElements.forEach(async (typescriptElement) => {
        /** @type {string} */
        let typescriptSource = "";
        if (typescriptElement.src) {
            const fetched = await fetch(typescriptElement.src);
            if (fetched.ok) {
                typescriptSource = await fetched.text();
            }
        }
        else {
            typescriptSource = typescriptElement.innerText;
        }
        const scriptElement = buildScriptElementFromTypeScript(typescriptSource);
        typescriptElement.remove();
        document.body.append(scriptElement);
    });
});
//# sourceMappingURL=embed-scss-typescript.js.map