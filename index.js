/**
 * Copyright (C) FrustratedProgrammer - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Elijah Anderson <contact@frustratedprogrammer.com>, April 2020
 **/

const classes = ["bard", "cleric", "wizard", "druid", "sorcerer", "warlock", "ranger", "paladin"];
const schools = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];
const steps = [1, 2, 3, 35, 4, 5];
const spellsJSON = require("./spells.json");
let customSpells = [];
const Report = require("fluentreports").Report;
const fontkit = require("fontkit");
const blob = require("fluentreports/lib/third-party/blob-stream");
const streamBuffers = require("stream-buffers");
require("buffer");
let cards = {
    columns: 4,
    rows: 2,
    width: 822,
    height: 1122,
    margin: 30
};
const error_name = document.getElementById("error_name");
const error_exp = document.getElementById("error_exp");
const error_msg = document.getElementById("error_msg");
const error = document.getElementById("error");
const step35 = document.getElementById("header_step_35");
const title = document.getElementById("title");
const header = document.getElementById("header");
const ID = Math.random().toString(36).substr(2, 9);
let fonts = {};

function _loadFont(which){
    fetch("./fonts/" + which + ".ttf").then((Response) => {
        Response.arrayBuffer().then(function(ArrayBuffer){
            fonts[which] = fontkit.create(Buffer.from(ArrayBuffer), null);
        });
    });
}

_loadFont("widelatin");
_loadFont("serif");
_loadFont("sans-serif");
_loadFont("ringbearer");
_loadFont("mplantin");
_loadFont("monospace");
_loadFont("impact");
_loadFont("cursive");

let template = {};
let ColorAndClassTemplate = {
    back: {
        active: false,
        url: ""
    },
    image: {
        url: step5Canvas.toDataURL(),
        width: step5Canvas.width,
        height: step5Canvas.height,
        src: step5Canvas
    },
    details: [{
        x: 11.941666666666606,
        y: 12.799999999999997,
        width: 277.369163459693,
        height: 21.594538935209528,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Center",
        text: "{title}"
    }, {
        x: 14.35111782112699,
        y: 391.16780085210183,
        width: 274.6018319903794,
        height: 25.20080103709182,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Center",
        text: "A level {level} {school} spell"
    }, {
        x: 152.31849842637916,
        y: 104.32919537055588,
        width: 135.61559596763098,
        height: 19.4865128186499,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Center",
        text: "{duration}"
    }, {
        x: 11.219926348382359,
        y: 151,
        width: 277.4434806365685,
        height: 179,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Left",
        text: "{description}"
    }, {
        x: 152.1304799108046,
        y: 65.20750927413165,
        width: 136.34212689826157,
        height: 19.07296104983085,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Center",
        text: "{range}"
    }, {
        x: 12.14776712419976,
        y: 66.05708845346862,
        width: 136.69262079774296,
        height: 18.926670571995174,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Center",
        text: "{casting}"
    }, {
        x: 11.124349732043044,
        y: 102.08788373206912,
        width: 136.92969591685448,
        height: 18,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Center",
        text: "{materials}"
    }, {
        x: 11.97294950593016,
        y: 330.7614184682011,
        width: 276.92873938625496,
        height: 55.49942943985843,
        fontStyle: "mplantin",
        fontSize: 0,
        textAlign: "Left",
        text: "{athigherlevel}"
    }]
};
let nbeebz = [
    {x: 65.43333333333328, y: 30.799999999999997, width: 156, height: 32, fontStyle: "ringbearer", fontSize: 0, textAlign: "Left", text: "{title}"},
    {x: 135.43333333333328, y: 97.3, width: 76, height: 29, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{duration}"},
    {x: 221.43333333333328, y: 29.799999999999997, width: 55, height: 31, fontStyle: "widelatin", fontSize: 0, textAlign: "Left", text: "Lv {level}"},
    {x: 34.43333333333328, y: 223.8, width: 234, height: 131, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{description}"},
    {x: 133.43333333333328, y: 71.8, width: 82, height: 25, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{range}"},
    {x: 135.68333333333328, y: 124.55000000000001, width: 77.5, height: 24.5, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{casting}"},
    {x: 35.43333333333328, y: 354.8, width: 168, height: 50, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{athigherlevel}"}
];
let overidePageData = {
    width: 0,
    height: 0,
    horizontally: 0,
    vertically: 0
};
let cardBorder = {
    color: "#000000",
    thickness: 0
};
const templates = ["title", "school", "level", "description", "range", "casting", "materials", "athigherlevel"];
let unusedTemplates = [...templates];
let addedElems = [];
let step3Choices = {
    front: null,
    back: null
};
let step35Int;
let cancelStep4 = true;
document.getElementById("close_error").onclick = function(){
    error.style.display = "none";
};

let popup, popup_body;
let stepsElem = [];
let spells = []; //set in step2
let headerBttns = [];
let step1Function = ""; //set in step1, used in step2
let currentStep = 0;

for(let i = 0; i < steps.length; i++){
    stepsElem.push(document.getElementById("step" + steps[i]));
    headerBttns.push(document.getElementById("header_step_" + steps[i]));
    headerBttns[headerBttns.length - 1].onclick = function(){
        currentStep = i;
        updateStep();
    };
}

let front_select = document.getElementById("front_card_select");
let back_select = document.getElementById("back_card_select");

function getCustomSpell(spell){
    let tempSpell = {
        name: spell.name || "",
        school: spell.school.toLowerCase() || "",
        classes: {},
        level: spell.level || 0,
        range: spell.range.toLowerCase() || "",
        //range_num
        duration: spell.duration.toLowerCase() || "",
        casting: spell.casting.toLowerCase() || "",
        verbal: spell.verbal || false,
        somatic: spell.somatic || false,
        materialCount: spell.material || 0,
        materials: spell.materials || "None",
        concentration: spell.concentration || false,
        ritual: spell.ritual || false,
        description: spell.description || "",
        atHigherLevel: spell.atHigherLevel || ""
    };

    tempSpell.description = (spell.description || "").split("<p>").join("").split("</p>").join("");
    if(spell.classes instanceof Array){
        for(let i = 0; i < spell.classes.length; i++){
            tempSpell.classes[spell.classes[i]] = true;
        }
    }
    else tempSpell.classes = spell.classes;
    let foundNums = true;
    let nums = "";
    for(let i = 0; i < tempSpell.length; i++){
        if(tempSpell.range[i] === "" + parseInt(tempSpell.range[i], 10)){
            foundNums = true;
            nums += tempSpell.range[i];
        }
        else if(foundNums) break;
    }
    if(nums.length) tempSpell.range_num = parseInt(nums, 10);
    return tempSpell;
}

function throwError(name, val = "", str = ""){
    str = str.toString();
    error.scrollIntoView();
    error_name.innerHTML = name;
    error_exp.innerHTML = val;
    error_msg.innerHTML = str;
    error.style.display = "block";
    if(str) console.error(((str.split("<br>").join("\n")).split("<pre>").join("")).split("</pre>").join(""));
}

function updateStep(){
    cancelStep4 = true;
    front_select.disabled = true;
    back_select.disabled = true;

    if(step35Int) clearInterval(step35Int);
    step35Int = false;
    step35.style.display = "none";
    currentStep = parseInt(currentStep, 10);
    for(let i = 0; i < steps.length; i++){
        if(currentStep > i){
            headerBttns[i].disabled = false;
            headerBttns[i].className = "header_step_button";
            if(i !== 2) stepsElem[i].style.display = "none";
            else{
                stepsElem[i].style.opacity = 0;
                stepsElem[i].style.position = "absolute";
            }
            stepsElem[i].style.zIndex = -1;
        }
        else if(currentStep === i){
            headerBttns[i].disabled = true;
            headerBttns[i].className = "header_step_button_selected header_step_button";
            stepsElem[i].style.display = "block";
            stepsElem[i].style.zIndex = 1;
            if(steps[currentStep] === 3){
                stepsElem[i].style.opacity = 1;
                stepsElem[i].style.position = "unset";
            }
            if(steps[currentStep] === 35) stepsElem[i].style.display = "flex";
        }
        else if(currentStep < i){
            headerBttns[i].disabled = true;
            if(i !== 2) stepsElem[i].style.display = "none";
            else{
                stepsElem[i].style.opacity = 0;
                stepsElem[i].style.position = "absolute";
            }
            stepsElem[i].style.zIndex = -1;
            headerBttns[i].className = "header_step_button_disabled header_step_button";
        }
    }
    title.innerText = "Step " + steps[currentStep];
    if(steps[currentStep] !== 5) runCode("./step" + steps[currentStep] + ".js");
    else if(steps[currentStep] === 5){
        displayPopup(6);
        updatePopup6();
    }
}

function runCode(path){
    function evalIt(){
        fetch(path).then(response => response.text()).then(function(code){
            eval(code);
        });
    }
    console.log(`Running: `, path);
    if(currentStep === 4){
        console.error("Currently trying to come up with a way to make this smoother. Sorry for the lag");
        evalIt();
    }
    else{
        console.log(currentStep);
        evalIt();
    }
}

function resetSettingsBttn(){
    settingsBttn.className = "";
    let newBttn = settingsBttn.cloneNode(true);
    settingsBttn.replaceWith(newBttn);
    settingsBttn = newBttn;
    settingsBttn.onclick = function(){
        resetSettingsBttn();
        settingsBttn.className = "spinForward";
        displayPopup(5);
        updatePopup5();

    };
}

function hidePopup(which, instant){
    resetPopup(which);
    popup.timeout = true;
    popup.classList.remove("popup_fade");
    popup.classList.add("popup_fade_r");
    popup_body.classList.remove("popup_appear_2");
    popup_body.parentElement.classList.remove("popup_appear_1");
    popup_body.classList.add("popup_disappear_2");
    popup_body.parentElement.classList.add("popup_disappear_1");
    if(!instant){
        if(which === 5){
            resetSettingsBttn();
            settingsBttn.className = "spinBackward";
        }
        setTimeout(function(){
            popup.disabled = true;
            popup.style.display = "none";
            popup.tapAttemps = 0;
            clearTimeout(popup.timeout);
            popup.timeout = false;
        }, 1000);
    }
    else{
        popup.disabled = true;
        popup.style.display = "none";
        popup.tapAttemps = 0;
        popup.timeout = false;
    }
}

function displayPopup(which){
    resetPopup(which);
    popup.disabled = true;
    popup.style.display = "block";
    popup.classList.remove("popup_fade_r");
    popup.classList.add("popup_fade");
    popup_body.classList.remove("popup_disappear_2");
    popup_body.parentElement.classList.remove("popup_disappear_1");
    popup_body.classList.add("popup_appear_2");
    popup_body.parentElement.classList.add("popup_appear_1");
    setTimeout(function(){
        popup.disabled = false;
    }, 2000);
}

function resetPopup(which){
    popup = document.getElementById("popup" + which);
    popup.replaceWith(popup.cloneNode(true));
    popup_body = document.getElementById("popup" + which + "_body");
    popup = document.getElementById("popup" + which);
    popup.tapAttemps = false;
    popup.timeout = false;
    popup_body.onclick = function(){
        popup.tapAttemps++;
    };
    popup.onclick = function(ev){
        if(popup.timeout !== false) return;
        this.tapAttemps++;
        popup.timeout = setTimeout(() => {
            if(!(this.disabled || this.tapAttemps !== 1)) hidePopup(which, false);
            this.tapAttemps = 0;
            clearTimeout(this.timeout);
            this.timeout = false;
        }, 1);
    };
}

let popup4 = document.getElementById("popup4");
let popup4_title = document.getElementById("popup4_title");
let popup4FuncSave, popup4FuncCancel;
let addCardData = {
    "name": "",
    "classes": {},
    "school": "",
    "level": 0,
    "range": "",
    "duration": "",
    "casting": "",
    "verbal": false,
    "somatic": false,
    "material": 0,
    "materials": "",
    "concentration": false,
    "ritual": false,
    "description": "",
    "atHigherLevel": ""

};

updateStep();
document.getElementById("popup4Save").onclick = function(){popup4FuncSave();};
document.getElementById("popup4Cancel").onclick = function(){popup4FuncCancel();};
document.getElementById("addSpells").onclick = function(){
    displayPopup(3);
    //Special Select
    let specialSelect = document.getElementById("specialSelect");
    let specialSelect_values = document.getElementById("specialSelect_values");
    specialSelect.onmouseleave = function(){
        specialSelect_values.style.display = "none";
    };
    specialSelect.firstElementChild.onmousedown = function(e){
        if(e.button !== 0) return;
        specialSelect_values.style.display = "block";
    };
    let values = document.getElementsByClassName("specialSelect_item");
    for(let i = 0; i < values.length; i++){
        values[i].onmousedown = function(e){
            if(e.button !== 0) return;
            specialSelect.firstElementChild.firstElementChild.src = values[i].firstElementChild.src;
            specialSelect.firstElementChild.firstElementChild.nextElementSibling.innerHTML = values[i].firstElementChild.nextElementSibling.innerHTML;
            specialSelect_values.style.display = "none";
            addCardData.school = values[i].firstElementChild.nextElementSibling.innerHTML;
            popup.tapAttemps++;
        };
    }


    /* INPUTS */
    let spellName = document.getElementById("addspell_name");
    let spellLevel = document.getElementById("addspell_level");
    let spellRange = document.getElementById("popup3_editRange");
    let spellDuration = document.getElementById("popup3_editDuration");
    let spellCasting = document.getElementById("popup3_editCasting");
    let spellVerbal = document.getElementById("addspell_verbal");
    let spellSomatic = document.getElementById("addspell_somatic");
    let spellConcentration = document.getElementById("addspell_concentration");
    let spellRitual = document.getElementById("addspell_ritual");
    let spellMaterialCount = document.getElementById("addspell_materialCount");
    let spellMaterial = document.getElementById("popup3_editMaterial");
    let spellDescription = document.getElementById("popup3_editDescription");
    let spellHigherLevel = document.getElementById("popup3_editAtHigherLevel");

    spellName.oninput = function(){addCardData.name = this.value;};
    //CLASS
    let classBttns = document.getElementsByClassName("popup_create_spells_class_item");
    for(let i = 0; i < classBttns.length; i++){
        let className = classBttns[i].lastElementChild.innerText.toLowerCase();
        addCardData.classes[className] = classBttns[i].classList.contains("popup_custom_spells_highlight");
        classBttns[i].onclick = function(){
            if(this.classList.contains("popup_custom_spells_highlight")){
                this.classList.remove("popup_custom_spells_highlight");
                addCardData.classes[className] = false;
            }
            else{
                this.classList.add("popup_custom_spells_highlight");
                addCardData.classes[className] = true;
            }
        };
    }
    //SCHOOL (done in specialSelect);
    spellLevel.oninput = function(){addCardData.level = parseInt(this.value, 10);};
    spellRange.onclick = function(){
        popup4.style.display = "block";
        popup4_title.innerText = "Range";
        let target = popup4.firstElementChild.firstElementChild.nextElementSibling;//Popup->poup_body->h2->textarea
        target.value = addCardData.range;
        popup4FuncSave = () => {
            addCardData.range = target.value;
            this.innerText = addCardData.range.length > 13 ? addCardData.range.substring(0, 10) + "..." : addCardData.range;
            popup4FuncSave = null;
            popup4.style.display = "none";
        };
        popup4FuncCancel = () => {
            target.value = "";
            popup4FuncCancel = null;
            popup4.style.display = "none";
        };
    };
    spellDuration.onclick = function(){
        popup4.style.display = "block";
        popup4_title.innerText = "Duration";
        let target = popup4.firstElementChild.firstElementChild.nextElementSibling;//Popup->poup_body->h2->textarea
        target.value = addCardData.duration;
        popup4FuncSave = () => {
            addCardData.duration = target.value;
            this.innerText = addCardData.duration.length > 13 ? addCardData.duration.substring(0, 10) + "..." : addCardData.duration;
            popup4FuncSave = null;
            popup4.style.display = "none";
        };
        popup4FuncCancel = () => {
            target.value = "";
            popup4FuncCancel = null;
            popup4.style.display = "none";
        };
    };
    spellCasting.onclick = function(){
        popup4.style.display = "block";
        popup4_title.innerText = "Casting";
        let target = popup4.firstElementChild.firstElementChild.nextElementSibling;//Popup->poup_body->h2->textarea
        target.value = addCardData.casting;
        popup4FuncSave = () => {
            addCardData.casting = target.value;
            this.innerText = addCardData.range.length > 13 ? addCardData.casting.substring(0, 10) + "..." : addCardData.casting;
            popup4FuncSave = null;
            popup4.style.display = "none";
        };
        popup4FuncCancel = () => {
            target.value = "";
            popup4FuncCancel = null;
            popup4.style.display = "none";
        };
    };
    spellVerbal.oninput = function(){addCardData.verbal = !!this.checked;};
    spellSomatic.oninput = function(){addCardData.somatic = !!this.checked;};
    spellConcentration.oninput = function(){addCardData.concentration = !!this.checked;};
    spellRitual.oninput = function(){addCardData.ritual = !!this.checked;};
    spellMaterialCount.oninput = function(){addCardData.material = parseInt(this.value, 10);};
    spellMaterial.onclick = function(){
        popup4.style.display = "block";
        popup4_title.innerText = "Materials";
        let target = popup4.firstElementChild.firstElementChild.nextElementSibling;//Popup->poup_body->h2->textarea
        target.value = addCardData.materials;
        popup4FuncSave = () => {
            addCardData.materials = target.value;
            this.innerText = addCardData.materials.length > 13 ? addCardData.materials.substring(0, 10) + "..." : addCardData.materials;
            popup4FuncSave = null;
            popup4.style.display = "none";
        };
        popup4FuncCancel = () => {
            target.value = "";
            popup4FuncCancel = null;
            popup4.style.display = "none";
        };
    };
    spellDescription.onclick = function(){
        popup4.style.display = "block";
        popup4_title.innerText = "Description";
        let target = popup4.firstElementChild.firstElementChild.nextElementSibling;//Popup->poup_body->h2->textarea
        target.value = addCardData.description;
        popup4FuncSave = () => {
            addCardData.description = target.value;
            this.innerText = addCardData.range.length > 13 ? addCardData.description.substring(0, 10) + "..." : addCardData.description;
            popup4FuncSave = null;
            popup4.style.display = "none";
        };
        popup4FuncCancel = () => {
            target.value = "";
            popup4FuncCancel = null;
            popup4.style.display = "none";
        };
    };
    spellHigherLevel.onclick = function(){
        popup4.style.display = "block";
        popup4_title.innerText = "At Higher Level";
        let target = popup4.firstElementChild.firstElementChild.nextElementSibling;//Popup->poup_body->h2->textarea
        target.value = addCardData.atHigherLevel;
        popup4FuncSave = () => {
            addCardData.duration = target.value;
            this.innerText = addCardData.atHigherLevel.length > 13 ? addCardData.atHigherLevel.substring(0, 10) + "..." : addCardData.atHigherLevel;
            popup4FuncSave = null;
            popup4.style.display = "none";
        };
        popup4FuncCancel = () => {
            target.value = "";
            popup4FuncCancel = null;
            popup4.style.display = "none";
        };
    };

    /* BUTTONS */
    let addBttn = document.getElementById("addspells_button_add");
    let resetBttn = document.getElementById("addspells_button_reset");
    let exitBttn = document.getElementById("addspells_button_exit");
    addBttn.onclick = function(){
        if(!addCardData.name){
            throwError("Missing item.", "", "Your new spell is missing a NAME.");
            return false;
        }

        let errorMsg = "";
        if(!Object.keys(addCardData.classes).length) errorMsg += "The Spell isn't assigned to a class.\n";
        if(!spellLevel.value.length) errorMsg += "The Spell doesn't have a level assigned. (Use 0 for cantrips)\n";
        if(!addCardData.school) errorMsg += "The Spell isn't assigned to a school.\n";
        if(!spellRitual.value.length) errorMsg += "The Spell doesn't have a range assigned.\n";
        if(!spellDuration.value.length) errorMsg += "The Spell doesn't have a duration assigned.\n";
        if(!spellCasting.value.length) errorMsg += "The Spell doesn't have a casting time assigned.\n";
        if(errorMsg.length){
            errorMsg += "-=-=-=-=-=-=-\nARE YOU SURE YOU WANT TO ADD THIS?\n(SPELLS ARE UNCHANGEABLE)";
            let response = confirm(errorMsg);
            if(!response) return false;
        }

        error.scrollIntoView();
        error_name.innerHTML = "Success";
        error_exp.innerHTML = `Your spell { ${addCardData.name} } was added.`;
        error_msg.innerText = ((JSON.stringify(addCardData)).replace(/\,+/g, ", "));
        error.style.display = "block";
        let newSpell = JSON.parse(JSON.stringify(addCardData));
        customSpells.push(newSpell);
        resetBttn.onclick();
        return true;
    };
    resetBttn.onclick = function(){
        addCardData = {
            "name": "",
            "classes": [],
            "school": "",
            "level": 0,
            "range": "",
            "duration": "",
            "casting": "",
            "verbal": false,
            "somatic": false,
            "material": 0,
            "materials": "",
            "concentration": false,
            "ritual": false,
            "description": "",
            "atHigherLevel": ""

        };
        spellName.value = "";
        spellLevel.value = "";
        spellRange.innerText = "";
        spellDuration.innerText = "";
        spellCasting.innerText = "";
        spellVerbal.value = false;
        spellSomatic.value = false;
        spellConcentration.value = false;
        spellRitual.value = false;
        spellMaterialCount.value = "";
        spellMaterial.innerText = "";
        spellDescription.innerText = "";
        spellHigherLevel.innerText = "";

        specialSelect.firstElementChild.firstElementChild.src = "";
        specialSelect.firstElementChild.firstElementChild.nextElementSibling.innerHTML = "Select School";
        specialSelect_values.style.display = "none";

        for(let i = 0; i < classBttns.length; i++){
            classBttns[i].classList.remove("popup_custom_spells_highlight");
        }
    };
    exitBttn.onclick = function(){
        resetBttn.onclick();
        hidePopup(3);
    };
    document.getElementById("addspells_button_done").onclick = function(){
        if(addBttn.onclick()) exitBttn.onclick();
    };
};
let settingsBttn = document.getElementById("settings");

function updatePopup5(){
    let settingsUpload = document.getElementById("popup5_upload");
    settingsUpload.onchange = function(){
        let file = this.files[0];
        let worked = false;
        file.text().then(function(result){
            try{
                file = JSON.parse(result);
                if(file instanceof Array) worked = true;
            }
            catch(e){
                worked = false;
            }
            if(worked){
                customSpells = file;
                throwError("Success!", `Successfully imported ${file.length} spells.<br><em>Note: you have to go back to Step 1 for these changes to take effect.</em>`);
                exportSettings.disabled = (customSpells.length === 0);
                resetCustom.disabled = (customSpells.length === 0);
            }
            else{
                throwError("Invalid File", "I'm not sure what you uploaded. But it's not a CustomSpells array.<br><br>Try manually adding spells then come back and export them for the next time you wish to import spells.");
            }
        });
    };
    let exportSettings = document.getElementById("settings_export");
    exportSettings.disabled = (customSpells.length === 0);
    let resetCustom = document.getElementById("settings_remove");
    resetCustom.disabled = (customSpells.length === 0);
    exportSettings.onclick = function(){
        let element = document.createElement("a");
        element.setAttribute("href", "data:json/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(customSpells)));
        element.setAttribute("download", "CustomSpells.json");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        element.remove();
    };
    document.getElementById("settings_import").onclick = function(){
        settingsUpload.click();
    };
    resetCustom.onclick = function(){
        let len = customSpells.length;
        customSpells = [];
        throwError("Success!", `Successfully removed ${len} spells.<br><em>Note: you have to go back to Step 1 for these changes to take effect.</em>`);
        resetCustom.disabled = (customSpells.length === 0);
        exportSettings.disabled = (customSpells.length === 0);
    };

    function setupSettings(name){
        let elem = document.getElementById("settings" + name);
        elem.value = overidePageData[name];
        elem.onchange = function(){
            overidePageData[name] = parseInt(this.value, 10) || 0;
        };
    }

    setupSettings("width");
    setupSettings("height");
    setupSettings("horizontally");
    setupSettings("vertically");
    let settingsPreview = document.getElementById("settingsPreview");
    settingsPreview.update = function(){
        this.style.opacity = cardBorder.opacity;
        settingsPreview.style.backgroundColor = cardBorder.color;
        settingsPreview.style.top = (0 - cardBorder.thickness) + "px";
        settingsPreview.style.left = (0 - cardBorder.thickness) + "px";
        settingsPreview.style.border = cardBorder.thickness + "px solid " + cardBorder.color;
    };
    settingsPreview.style.height = settingsPreview.firstElementChild.clientHeight + "px";
    let settingsThickness = document.getElementById("settingsThickness");
    let settingsColor = document.getElementById("settingsColor");
    settingsThickness.oninput = function(){
        cardBorder.thickness = parseInt(this.value, 10) / 10;
        settingsPreview.update();
    };
    settingsColor.oninput = function(){
        cardBorder.color = this.value;
        settingsPreview.update();
    };
    settingsColor.value = cardBorder.color;
    settingsThickness.value = (cardBorder.thickness * 10);
    settingsPreview.update();

}

resetSettingsBttn();

function updatePopup6(){
    document.getElementById("popup6_special").onclick = function(){
        settingsBttn.onclick();
    };
    let step6ArrowGroup = document.getElementById("step6ArrowGroup");
    let footer = document.getElementById("footer");
    setTimeout(function(){
        step6ArrowGroup.style.left = ((0 - step6ArrowGroup.parentElement.parentElement.offsetLeft) / 2) + 10 + "px";
        step6ArrowGroup.style.top = (step6ArrowGroup.clientHeight + step6ArrowGroup.parentElement.parentElement.offsetTop) - (footer.clientHeight / 2) - 10 + "px";
    }, 2500);
}
