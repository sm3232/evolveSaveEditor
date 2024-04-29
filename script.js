const input = document.getElementById("save-input");
const output = document.getElementById("save-output");
const root = document.getElementById("root");
const copy = document.getElementById("copy-button");
const paste = document.getElementById("paste-button");
const fgcolor = "#8090c0";
let saveLoaded = false;
let data;

const QUERY_MAP = {
Resources: "resource",
Evolution: "evolution",
Tech: "tech",
City: "city",
Space: "space",
Interstellar: "interstellar",
Portal: "portal",
Tauceti: "tauceti",
Civic: "civic",
Race: "race",
Genes: "genes",
Blood: "blood",
Stats: "stats",
Events: "event",
MajorEvents: "m_event",
Prestige: "prestige",
Power: "power",
Support: "support",
Settings: "settings",
Queue: "queue",
ResearchQueue: "r_queue",
Messages: "lastMsg",
StarDock: "starDock",
Galaxy: "galaxy",
Pillars: "pillars",
Government: "govern",
Special: "special",
Custom: "custom",
Arpa: "arpa",
};

const traverse = (data) => {
    let myMap = new Map();
    for(const [k, v] of Object.entries(data)){
        if(typeof(v) === "object"){
            myMap.set(k, traverse(v));
        } else {
            myMap.set(k, v);
        }
    }
    return myMap;
}

const setThing = (id, val) => {
    let ref = data;
    const split = id.split('-');
    for(let i = 0; i < split.length - 1; i++) ref = ref[split[i]];
    ref[split[split.length - 1]] = isNaN(Number(val)) ? val : Number(val);
}
const updateOutput = () => {
    output.value = output.innerText = LZString.compressToBase64(JSON.stringify(data));
}
const expand = (scope, data) => {
    for(const [k, v] of data.entries()){
        if(typeof(v) === "object"){
            let div = document.createElement("div");
            let section = scope === root ? document.createElement("h1") : document.createElement("h2");
            section.innerText = k;
            div.appendChild(section);
            if(scope !== root){
                div.className = scope.className + "-" + k;
            } else {
                div.className = k;
            }
            div.style.border = "1px solid " + fgcolor;
            div.style.padding = "15px";
            div.style.textAlign = "left";
            div.style.margin = "15px";
            scope.appendChild(div);
            expand(div, v);
        } else {
            let contain = document.createElement("div");
            contain.className = "field-container";
            let element = document.createElement("p");
            element.innerText = k + ": ";
            let span = document.createElement("span");
            span.innerText = v;
            span.setAttribute("role", "textbox");
            span.setAttribute("contenteditable", "");
            span.setAttribute("spellcheck", false);
            span.className = "text-field dynamic";
            if(scope !== root){
                span.id = scope.className + "-" + k;
            } else {
                span.id = k;
            }

            span.addEventListener("input", () => {
                setThing(span.id, span.innerText);
                updateOutput();
            })
            element.style.display = "inline";
            contain.appendChild(element);
            contain.appendChild(span);
            if(scope === root){
                let morecontain = document.createElement("div");
                let header = document.createElement("h1");
                header.innerText = k;
                morecontain.appendChild(header);
                morecontain.style.border = "1px solid " + fgcolor;
                morecontain.style.padding = "15px";
                morecontain.style.textAlign = "left";
                morecontain.style.margin = "15px";
                morecontain.appendChild(contain);
                scope.appendChild(morecontain);
            } else {
                scope.appendChild(contain);
            }
        }
    }
}
input.addEventListener("input", () => {
    root.innerHTML = "";
    try {
        data = JSON.parse(LZString.decompressFromBase64(input.value));
        let map = traverse(data);
        expand(root, map);
        updateOutput();
        saveLoaded = true;
    } catch(e) {
        saveLoaded = false;
    }
})
paste.addEventListener("click", async () => {
    const text = await navigator.clipboard.readText();
    input.value = text;
    input.dispatchEvent(new Event("input", {bubbles: true}));
})
copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
})

const jumps = document.querySelectorAll("#jumps > p");
jumps.forEach((e) => {
    e.addEventListener("click", () => {
        if(saveLoaded){
            let query = `.${QUERY_MAP[e.innerText.replaceAll(" ", "")]}`;
            let element = document.querySelector(query);
            element.scrollIntoView({behavior: "smooth"});
        }
    });
})
const quickActions = {
    Cappopulation: () => {
        let species = data.race.species;
        data.resource[species].amount = data.resource[species].max;
        let element = document.getElementById("resource-" + species + "-amount");
        element.innerText = element.value = data.resource[species].amount;
    },
    Capbasicresources: () => {
        for(let [k, v] of Object.entries(data.resource)){
            if(v.basic && v.display) {
                v.amount = v.max;
                let element = document.getElementById("resource-" + k + "-amount");
                element.innerText = element.value = v.max;
            }
        }
    },
    Capcraftableresources: () => {
        for(let [k, v] of Object.entries(data.resource)){
            if(v.display && v.max === -1){
                v.amount = 1e25;
                let element = document.getElementById("resource-" + k + "-amount");
                element.innerText = element.value = v.amount;
            }
        }
    },
    Capspecialresources: () => {
        for(let [k, v] of Object.entries(data.resource)){
            if(v.display && v.max === -2){
                v.amount = 1e25;
                let element = document.getElementById("resource-" + k + "-amount");
                element.innerText = element.value = v.amount;
            }
        }
    },
    Capacceleratedtime: () => {
        data["settings"].at = 11520;
        let element = document.getElementById("settings-at");
        element.innerText = element.value = 11520;
    }
}
const quicks = document.querySelectorAll("#quicks > p");
quicks.forEach((e) => {
    e.addEventListener("click", () => {
        if(saveLoaded){
            quickActions[e.innerText.replaceAll(" ", "")]();
            updateOutput();
        }
    })
})
