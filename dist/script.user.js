// ==UserScript==
// @name         Armoury Improved Display Script
// @namespace    https://github.com/saucedontsauce/aids
// @version      1.1.0
// @description  Torn Armoury Enhancement Tool
// @match        https://www.torn.com/factions.php*
// @run-at document-idle
// @downloadURL  https://raw.githubusercontent.com/saucedontsauce/aids/main/dist/script.user.js
// @updateURL    https://raw.githubusercontent.com/saucedontsauce/aids/main/dist/script.meta.js
// @license copyright Adam Auckland-Blaydes
// ==/UserScript==

(function () {
    'use strict';
    const log = (msg) => console.log(`[AE-${VERSION}] ${msg}`);
    log("loaded AIDS");

    function isCorrectPage() {
        const hash = window.location.hash;

        return (
            hash.includes('#/tab=armoury') &&
            (
                hash.includes('&sub=weapons') ||
                hash.includes('&sub=armour')
            )
        );
    }

    function run() {
        log('Running script');

        const els = document.querySelectorAll(
            '.bonus.left.torn-divider.divider-vertical'
        );


        els.forEach((el) => {
            if (el.dataset.aeProcessed === "1") return;
            const shouldClone = [...el.children].some(
                child => !child.classList.contains("bonus-attachment-blank-bonus-25")
            );

            if (shouldClone) {
                const clone = el.cloneNode(true);
                clone.classList.remove("left")
                clone.classList.add("right")
                clone.style.paddingRight = "10px";
                clone.style.paddingLeft = "10px";
                const parent = el.parentElement;
                const grandparent = parent.parentElement;

                if (grandparent.children[1].children.length === 0) {
                    grandparent.children[1].append(clone);
                    el.dataset.aeProcessed = "1";
                }
            }
        })

    }




    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                //log("A child node has been added or removed. Running");
                run()
            }
        }
    };
    function waitForMain() {
        const targetNode = document.querySelector('[role="main"]');

        if (!targetNode) {
            setTimeout(waitForMain, 100);
            return;
        }

        const observer = new MutationObserver(callback);

        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        if (!isCorrectPage()) {
            setTimeout(init, 500);
            return;
        }

        waitForMain();
        setTimeout(run, 500);
    }

    init();

})();