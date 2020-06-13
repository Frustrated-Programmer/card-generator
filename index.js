/**
 * Copyright (C) FrustratedProgrammer - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Elijah Anderson <contact@frustratedprogrammer>, April 2020
 **/

const classes = ["bard", "cleric", "wizard", "druid", "sorcerer", "warlock", "ranger", "paladin"];
const schools = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];
const steps = [1, 2, 3, 35, 4, 5];
const spellsJSON = require("./spells.json");
const Report = require('fluentReports' ).Report;
const fontkit = require("fontkit");
const blob = require('blob-stream')
const streamBuffers = require('stream-buffers')
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
const header = document.getElementById('header');
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


let skippedCards = [];
let completedFronts = [];
let completedBacks = [];

let pageSize = {
    w: Math.round((cards.columns * (cards.width + (cards.width / cards.margin))) + cards.width / cards.margin),
    h: Math.round(((cards.rows * (cards.height + (cards.height / cards.margin))) + cards.height / cards.margin))
};
let cardsPerPage = cards.columns * cards.rows;
let step3Choices = {
    front: null,
    back: null
};
let step35Custom = [];
let step35Int;
let disableRightClick = false;
document.addEventListener("contextmenu", function(event){
    if(disableRightClick) event.preventDefault();
});
document.getElementById("close_error").onclick = function(){
    error.style.display = "none";
};

let popup, popup_body;
let stepsElem = [];
let spells = []; //set in step2
let headerBttns = [];
let step1Function = ""; //set in step1, used in step2
let currentStep = window.localStorage.getItem("step") || 0;

for(let i = 0; i < steps.length; i++){
    stepsElem.push(document.getElementById("step" + steps[i]));
    headerBttns.push(document.getElementById("header_step_" + steps[i]));
    headerBttns[headerBttns.length - 1].onclick = function(){
        currentStep = i;
        updateStep();
    };
}

function getCustomSpell(spell){
    let tempSpell = {
        name: spell.name.toLowerCase(),
        school: spell.school.toLowerCase(),
        classes: {},
        level: spell.level,
        range: spell.range.toLowerCase(),
        //range_num
        duration: spell.duration.toLowerCase(),
        casting: spell.casting.toLowerCase(),
        verbal: spell.verbal,
        somatic: spell.somatic,
        materialCount: spell.material,
        materials: spell.materials,
        concentration: spell.concentration,
        ritural: spell.ritual,
        //description
        atHigherLevel: spell.atHigherLevel
    };
    tempSpell.description = spell.description.split("<p>").join("").split("</p>").join("");
    for(let i = 0; i < spell.classes.length; i++){
        tempSpell.classes[spell.classes[i]] = true;
    }
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
    console.error(((str.split("<br>").join("\n")).split("<pre>").join("")).split("</pre>").join(""));
}

function updateStep(){
    if(currentStep < 5) window.localStorage.setItem("step",currentStep);
    if(step35Int) clearInterval(step35Int);
    step35Int = false;
    step35.style.display = "none";
    for(let i = 0; i < steps.length; i++){
        if(currentStep > i){
            headerBttns[i].disabled = false;
            headerBttns[i].className = "header_step_button";
            stepsElem[i].style.display = "none";
        }
        else if(currentStep === i){
            headerBttns[i].disabled = true;
            headerBttns[i].className = "header_step_button_selected header_step_button";
            stepsElem[i].style.display = "block";
            if(steps[currentStep] === 35) stepsElem[i].style.display = "flex";
        }
        else if(currentStep < i){
            headerBttns[i].disabled = true;
            stepsElem[i].style.display = "none";
            headerBttns[i].className = "header_step_button_disabled header_step_button";
        }
    }
    title.innerText = "Step " + steps[currentStep];
    if(steps[currentStep] !== 5) runCode("./step" + steps[currentStep] + ".js");
}

function runCode(path){
    fetch(path).then(response => response.text()).then(function(code){
        eval(code);
    });
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
            if(!(this.disabled || this.tapAttemps % 2 === 0)) hidePopup(which, false);
            this.tapAttemps = 0;
            clearTimeout(this.timeout);
            this.timeout = false;
        }, 1);
    };
}

updateStep();
document.getElementById("addSpells").onclick = function(){
    displayPopup(3);
};
