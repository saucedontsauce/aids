// ==UserScript==
// @name         Armoury Improved Display Script
// @namespace    https://github.com/saucedontsauce/aids
// @version      1.1.3
// @description  Torn Armoury Enhancement Tool
// @match        https://www.torn.com/factions.php*
// @license      copyright Adam Auckland-Blaydes
//
// @grant        GM_info
// @grant        GM.info
// @grant        GMforPDA
//
// @downloadURL  https://update.greasyfork.org/scripts/580450/Armoury%20Improved%20Display%20Script.user.js
// @updateURL    https://update.greasyfork.org/scripts/580450/Armoury%20Improved%20Display%20Script.meta.js
// ==/UserScript==

const util = {
    _scriptInfo: null,
    getScriptInfo() {
        if (this._scriptInfo) {
            return this._scriptInfo;
        }

        try {
            if (typeof GM_info !== "undefined") {
                this._scriptInfo = GM_info;
            } else if (typeof GM !== "undefined" && GM.info) {
                this._scriptInfo = GM.info;
            } else if (typeof GMforPDA !== "undefined") {
                this._scriptInfo = {
                    scriptHandler: "GMforPDA",
                    version: GMforPDA.version || "Unknown"
                };
            } else {
                this._scriptInfo = {
                    scriptHandler: "Unknown",
                    version: "Unknown"
                };
            }
        } catch (e) {
            this._scriptInfo = {
                scriptHandler: "Unknown",
                version: "Unknown"
            };
        }

        return this._scriptInfo;
    },

    log(message) {
        const version = this.getScriptInfo().script.version;
        console.log(`[AIDS ${version}] ${message}`);
    },
    getDisplayMode() {
        return localStorage.getItem("AIDS:displayMode") || "icon";
    },
    setDisplayMode(mode) {
        localStorage.setItem("AIDS:displayMode", mode);
    }
};
const handlers = {
    displayModeChange:(e)=>{
        e.preventDefault();
        const was = util.getDisplayMode()
        if(!was || was === "icon"){
            util.setDisplayMode("text");
            document.getElementById("AIDS:btnEl").textContent = "Text"
            run();
        }else{
            util.setDisplayMode("icon");
            document.getElementById("AIDS:btnEl").textContent = "Icon"
            run();
        }
    }
}

const sys = {
    addModeButton(){
        const existing = document.getElementById("AIDS:btnEl")
        if(existing)return;

        const btn = document.createElement("button");
        btn.id="AIDS:btnEl";
        btn.className = "t-clear h c-pointer  m-icon line-h24 right last";
        btn.style.width="fit-content";
        btn.style.paddingLeft="10px";
        btn.style.paddingRight="10px";
        btn.style.color ="#999999";
        btn.addEventListener("click",(e)=>handlers.displayModeChange(e));

        const text = util.getDisplayMode()
        btn.textContent = `${text.split("")[0].toUpperCase()}${text.split("").slice(1).join("")}`;

        const actionBar = document.getElementById("top-page-links-list");
        actionBar.children[actionBar.children.length - 1].classList.remove("last")
        actionBar.append(btn);
    }
};

const scripts = {
    bonusDisplayEnhancer(){
        const mode = util.getDisplayMode()
        const els = document.querySelectorAll('.bonus.left.torn-divider.divider-vertical');
        els.forEach((el) => {
            if (el.dataset.aidsProcessedMode === mode) {
                return;
            }
            const shouldClone = [...el.children].some(
                child => !child.classList.contains("bonus-attachment-blank-bonus-25")
            );

            function textMode(clone){
                let text = ""
                for(const child of clone.children){
                    console.log(child)
                    if(!child.className.includes("bonus-attachment-blank-bonus-25")){
                        const full = child.title

                        const bonus = full.split("<b>")[1].split("</b>")[0]
                        const percent = full.split("<br/>")[1].split(" ")[0]

                        console.log("Bonus:",bonus)
                        console.log("Percent:",percent)
                        if(text!==""){text+="\n"}
                        text = `${bonus}: ${percent}`
                    }
                }

                clone.textContent = text
                return clone
            }
            function iconMode(clone){
                let i=0
                for(const child of clone.children){
                    child.style.setProperty("transform", "scale(1.75)", "important")
                    child.style.verticalAlign = "center"
                    if(i!==0){
                        child.style.marginLeft="10px"
                    }
                    i++
                }
                return clone
            }

            if (shouldClone) {
                const clone = el.cloneNode(true);
                clone.classList.remove("left");
                clone.classList.add("right");
                clone.style.paddingRight = "10px";
                clone.style.paddingLeft = "10px";
                let replacement = ""
                const mode = util.getDisplayMode();
                if(mode==="icon"){
                    replacement = iconMode(clone);
                }else if(mode==="text"){
                    replacement = textMode(clone);
                }

                const parent = el.parentElement;
                const grandparent = parent.parentElement;
                if (grandparent.children[1].children.length === 0) {
                    grandparent.children[1].append(replacement);
                }else{
                    grandparent.children[1].children[0].replaceWith(replacement)
                }
                el.dataset.aidsProcessedMode = mode;
            }
        })
    }
}

let observerStarted = false;
let runTimeout = null;

function run() {
    console.count("run()");
    util.log("Running script");

    const btn = document.getElementById("AIDS:btnEl")
    if(!btn)sys.addModeButton();

    const hash = window.location.hash;

    switch (true) {
        case hash.includes("&sub=weapons"):
            util.log("WEAPONS");
            scripts.bonusDisplayEnhancer();
            break;

        case hash.includes("&sub=armour"):
            util.log("ARMOR");
            scripts.bonusDisplayEnhancer();
            break;

        default:
            break;
    }
}

function scheduleRun() {
    clearTimeout(runTimeout);

    runTimeout = setTimeout(() => {
        run();
    }, 1000);
}

const callback = (mutationList) => {
    if (mutationList.some(m => m.type === "childList")) {
        scheduleRun();
    }
};

function startObserver() {
    if (observerStarted) return;

    const targetNode = document.querySelector('[role="main"]');

    if (!targetNode) {
        setTimeout(startObserver, 100);
        return;
    }

    observerStarted = true;

    const observer = new MutationObserver(callback);

    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });

    util.log("MutationObserver attached");
}

function init() {
    if (!window.location.hash.includes("#/tab=armoury")) {
        return;
    }

    startObserver();
    run();
}

window.addEventListener("hashchange", init);

init();