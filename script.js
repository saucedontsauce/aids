// ==UserScript==
// @name         Armoury Improved Display Script
// @namespace    https://github.com/saucedontsauce/aids
// @version      1.1.7
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

const ranges={"Achilles":{min:50,max:169},"Assassinate":{min:50,max:148},"Backstab":{min:30,max:96},"Beserk":{min:20,max:87},"Bleed":{min:20,max:72},"Blindfire":{min:15,max:20},"Blindside":{min:25,max:96},"Bloodlust":{min:10,max:18},"Burn":{min:30,max:50},"Comeback":{min:50,max:127},"Conserve":{min:25,max:49},"Cripple":{min:20,max:58},"Crusher":{min:50,max:133},"Cupid":{min:50,max:158},"Deadeye":{min:25,max:123},"Deadly":{min:2,max:10},"Demoralized":{min:20,max:23},"Disarm":{min:3,max:15},"Double-edged":{min:10,max:32},"Double Tap":{min:15,max:57},"Emasculate":{min:15,max:16},"Empower":{min:50,max:222},"Eviscerate":{min:15,max:34},"Execute":{min:15,max:29},"Expose":{min:7,max:21},"Freeze":{min:20,max:26},"Finale":{min:10,max:17},"Focus":{min:15,max:35},"Frenzy":{min:5,max:14},"Fury":{min:10,max:36},"Grace":{min:20,max:76},"Hazardous":{min:30,max:31},"Home Run":{min:50,max:93},"Irradiate":{min:100,max:100},"Laceration":{min:35,max:45},"Motivation":{min:15,max:35},"Paralyze":{min:5,max:18},"Parry":{min:50,max:92},"Penetrate":{min:25,max:49},"Plunder":{min:20,max:49},"Poisoned":{min:85,max:100},"Powerful":{min:15,max:49},"Proficience":{min:20,max:59},"Puncture":{min:20,max:57},"Quicken":{min:50,max:245},"Rage":{min:4,max:18},"Revitalize":{min:10,max:24},"Roshambo":{min:50,max:132},"Severe Burning":{min:100,max:100},"Shock":{min:0,max:100},"Sleep":{min:0,max:100},"Slow":{min:20,max:64},"Smash":{min:100,max:100},"Smurf":{min:1,max:5},"Specialist":{min:20,max:59},"Spray":{min:20,max:24},"Storage":{min:100,max:100},"Stricken":{min:30,max:99},"Stun":{min:10,max:40},"Suppress":{min:25,max:49},"Sure Shot":{min:3,max:11},"Throttle":{min:50,max:170},"Toxin":{min:30,max:44},"Warlord":{min:15,max:45},"Weaken":{min:20,max:63},"Wind-up":{min:125,max:221},"Wither":{min:20,max:63}};

function getRangeColour(value, min, max) {
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const hue = t * 120; // 0 = red, 120 = green
    return `hsl(${hue}, 100%, 50%)`;
}

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
        if(document.querySelector('[role="main"]').offsetWidth >= 784) return;
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


                clone.style.display ="flex"
                clone.style.color ="#999999"
                const output = document.createElement("li");
                output.className = clone.className;
                let count=0;

                for(const child of clone.children){
                    //console.log(child)
                    if(!child.className.includes("bonus-attachment-blank-bonus-25")){
                        count++;

                        const full = child.title

                        const bonusText = full.split("<b>")[1].split("</b>")[0]
                        const percentText = full.split("<br/>")[1].split(" ")[0]

                        //console.log("Bonus:",bonusText)
                        //console.log("Percent:",percentText);

                        const bonusRow = document.createElement("div");
                        bonusRow.style.position="relative"
                        const pretext = document.createElement("span")
                        pretext.textContent = bonusText;
                        pretext.style.display = "inline-flex";
                        pretext.style.setProperty("vertical-align", "top", "important");
                        pretext.style.setProperty("line-height", "normal", "important");
                        pretext.style.paddingLeft = "5px";
                        pretext.style.paddingRight = "5px";
                        pretext.style.paddingTop ="5px";
                        bonusRow.appendChild(pretext)

                        const percent = document.createElement("span");
                        percent.className = "right";
                        percent.textContent = percentText;
                        percent.style.display = "inline-flex";
                        percent.style.setProperty("vertical-align", "top", "important");
                        percent.style.setProperty("line-height", "normal", "important");
                        percent.style.paddingRight ="5px";
                        percent.style.paddingTop ="5px";
                        percent.style.color = getRangeColour(Number(percentText.substring(0, percentText.length - 1)),ranges[bonusText].min,ranges[bonusText].max);
                        percent.style.setProperty("text-shadow",`-2px -2px 0 black,
     2px -2px 0 black,
    -2px  2px 0 black,
     2px  2px 0 black`)


                        bonusRow.appendChild(percent);

                        const range = ranges[bonusText];
                        if (!range) continue;

                        const value = Number(percentText.replace("%", ""));
                        const colour = getRangeColour(value, range.min, range.max);

                        const prog = document.createElement("progress");
                        prog.className = "bonusprog";

                        prog.style.setProperty("--fill", colour);

                        prog.style.width = "100%";
                        prog.style.position = "absolute";
                        prog.style.bottom = "0";
                        prog.style.left = "0";
                        prog.style.right = "0";

                        prog.value = value - range.min;
                        prog.max = range.max - range.min;

                        bonusRow.appendChild(prog)

                        output.appendChild(bonusRow);
                    }
                }
                if(count>1){
                    const parent = el.parentElement,gp=parent.parentElement;
                    gp.style.height="64px"
                    gp.children[1].style.overflow="visible"
                }
                return output

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
    if(!document.getElementById("AIDSstyles")){
        const style = document.createElement("style");
        style.id = "AIDSstyles"
        style.textContent = `
  .bonusprog{
  appearance:none;
  -webkit-appearance:none;
  width:300px;
  height:10px;
  border-radius:0;
}

.bonusprog::-webkit-progress-bar{
  background:#ddd;
  border-radius:0;
}

.bonusprog::-webkit-progress-value{
  background:var(--fill,#4caf50);
  border-radius:0;
}

.bonusprog::-moz-progress-bar{
  background:var(--fill,#4caf50);
  border-radius:0;
}
`;
        document.head.appendChild(style);
    }

    if (!window.location.hash.includes("#/tab=armoury")) {
        return;
    }

    startObserver();
    run();
}

window.addEventListener("hashchange", init);

init();
