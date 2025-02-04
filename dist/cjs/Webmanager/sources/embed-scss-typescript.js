"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-check
// @ts-ignore
const sass = __importStar(require("sass"));
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