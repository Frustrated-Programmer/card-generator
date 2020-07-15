/**
 Card-Generator. A program designed to make cards.
 Copyright (C) 2020  Elijah Anderson<contact@frustratedprogrammer.com>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, version 3 of the License.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 **/

let bttns = [];
let class_andor_group = document.getElementById("popup_custom_spells_class_andor");
let schoolBttns = document.getElementsByClassName("popup_custom_spells_school_item");
let classBttns = document.getElementsByClassName("popup_custom_spells_class_item");
let levelLow = document.getElementById("level_low");
let levelHigh = document.getElementById("level_high");
let rangeLow = document.getElementById("range_low");
let rangeHigh = document.getElementById("range_high");
let somatic = document.getElementById("somatic");
let ritual = document.getElementById("ritual");
let verbal = document.getElementById("verbal");
let material = document.getElementById("material");
let concentration = document.getElementById("concentration");
let hoverItem = document.getElementById("popup_custom_spells_code_hover");
let textarea = document.getElementById("popup_custom_spells_code_textarea");
let popupDone = document.getElementById('popup1_done');
let Step1PopupData = {
    school: {},
    class: {
        andor: (class_andor_group.firstElementChild.classList.contains("popup_custom_spells_highlight") ? "or" : "and")
    },
    level: {
        low: Number.isFinite(levelLow.value) ? rangeLow.value : null,
        high: Number.isFinite(levelHigh.value) ? rangeLow.value : null,
    },
    range: "any",
    range_num: {
        low: Number.isFinite(rangeLow.value) ? rangeLow.value : null,
        high: Number.isFinite(rangeHigh.value) ? rangeLow.value : null,
    },
    somatic: somatic.value === true,
    ritual: ritual.value === true,
    verbal: verbal.value === true,
    material: material.value === true,
    concentration: concentration.value === true
};


let trueFalseValues = ["somatic", "ritual", "verbal", "material", "concentration"];
for(let i = 0; i < classes.length; i++){
    bttns.push(document.getElementById(classes[i] + "_selection"));
    bttns[bttns.length - 1].onclick = function(){
        step1Function = `function checker(data){ return data.classes.${classes[i]}; }`;
        currentStep++;
        updateStep();
    };
}
bttns.push(document.getElementById("custom_selection"));
bttns[bttns.length - 1].onclick = function(){
    displayPopup(1);
    updatePopupStep1();
};

function updateCode(){
    let code = "";

    function addCode(newCode){
        if(!newCode) return;
        if(code.length) code += " && ";
        code += newCode;
    }

    let schoolCode = "";
    for(let i in Step1PopupData.school){
        if(Step1PopupData.school[i]){
            if(schoolCode.length) schoolCode += "||"
            else schoolCode += "(";
            schoolCode += "data.school === \"" + i + "\"";
        }
    }
    if(schoolCode.length) schoolCode += ")";
    addCode(schoolCode);
    let classCode = "";
    for(let i in Step1PopupData.class){
        if(i !== "andor" && Step1PopupData.class[i]){
            if(classCode.length) classCode += (Step1PopupData.class.andor === "and" ? " && " : " || ");
            else classCode += "(";
            classCode += "data.classes." + i;
        }
    }
    if(classCode.length) classCode += ")";
    addCode(classCode);

    for(let i = 0; i < trueFalseValues.length; i++){
        if(Step1PopupData[trueFalseValues[i]]) addCode("data." + trueFalseValues[i]);
    }
    if(Step1PopupData.range !== "any"){
        if(Step1PopupData.range !== "number") addCode("(data.range === \"" + Step1PopupData.range + "\")");
        else{
            let rangeCode = "";
            if(Step1PopupData.range_num.low !== null) rangeCode += "data.range_num > " + Step1PopupData.range_num.low;
            if(Step1PopupData.range_num.high !== null){
                if(rangeCode.length) rangeCode += " && ";
                rangeCode += "data.range_num > " + Step1PopupData.range_num.high;
            }
            if(rangeCode.length) addCode("(" + rangeCode + ")");
        }
    }
    let levelCode = "";
    if(Step1PopupData.level.low !== null) levelCode += "data.range_num > " + Step1PopupData.level.low;
    if(Step1PopupData.level.high !== null){
        if(levelCode.length) levelCode += " && ";
        levelCode += "data.range_num > " + Step1PopupData.level.high;
    }
    if(levelCode.length) addCode("(" + levelCode + ")");
    popupDone.disabled = (code.length === 0);

    textarea.value = code;
}
function updatePopupStep1(){
    textarea = document.getElementById("popup_custom_spells_code_textarea");
    class_andor_group = document.getElementById("popup_custom_spells_class_andor");
    schoolBttns = document.getElementsByClassName("popup_custom_spells_school_item");
    classBttns = document.getElementsByClassName("popup_custom_spells_class_item");
    levelLow = document.getElementById("level_low");
    levelHigh = document.getElementById("level_high");
    rangeLow = document.getElementById("range_low");
    rangeHigh = document.getElementById("range_high");
    somatic = document.getElementById("somatic");
    ritual = document.getElementById("ritual");
    verbal = document.getElementById("verbal");
    material = document.getElementById("material");
    concentration = document.getElementById("concentration");
    hoverItem = document.getElementById("popup_custom_spells_code_hover");
    popupDone = document.getElementById('popup1_done');
    popupDone.onclick = function(){
        let funct = "function checker(data){\n    return (" + textarea.value + ");\n};";
        let success;
        try{
            let ret = eval(funct + "\nchecker(" + JSON.stringify(getCustomSpell(spellsJSON[Math.round(Math.random() * spellsJSON.length - 1)])) + ");");
            success = true;
        } catch(e){
            throwError(e.name, "Something's wrong with your code.", e.message);
            success = false;
        }
        if(success === true){
            hidePopup(1, true);
            step1Function = funct;
            currentStep++;
            updateStep();
        }
    };

    textarea.oninput = function(){
        popupDone.disabled = textarea.value.length === 0;
    }
//SCHOOL
    for(let i = 0; i < schoolBttns.length; i++){
        let schoolName = schoolBttns[i].lastElementChild.innerText.toLowerCase();
        Step1PopupData.school[schoolName] = schoolBttns[i].classList.contains("popup_custom_spells_highlight");
        schoolBttns[i].onclick = function(){
            if(this.classList.contains("popup_custom_spells_highlight")){
                this.classList.remove("popup_custom_spells_highlight");
                Step1PopupData.school[schoolName] = false;
            } else{
                this.classList.add("popup_custom_spells_highlight");
                Step1PopupData.school[schoolName] = true;
            }
            updateCode();
        };
    }


//CLASS
    for(let i = 0; i < classBttns.length; i++){

        let className = classBttns[i].lastElementChild.innerText.toLowerCase();
        Step1PopupData.class[className] = classBttns[i].classList.contains("popup_custom_spells_highlight");
        classBttns[i].onclick = function(){
            if(this.classList.contains("popup_custom_spells_highlight")){
                this.classList.remove("popup_custom_spells_highlight");
                Step1PopupData.class[className] = false;
            } else{
                this.classList.add("popup_custom_spells_highlight");
                Step1PopupData.class[className] = true;
            }
            updateCode();
        };
    }
    if(Step1PopupData.class.andor === "and"){
        class_andor_group.firstElementChild.classList.remove("popup_custom_spells_highlight");
        class_andor_group.lastElementChild.classList.add("popup_custom_spells_highlight");
    }
    else{
        class_andor_group.firstElementChild.classList.add("popup_custom_spells_highlight");
        class_andor_group.lastElementChild.classList.remove("popup_custom_spells_highlight");
    }
    class_andor_group.firstElementChild.onclick = function(){
        Step1PopupData.class.andor = "or";
        class_andor_group.firstElementChild.classList.add("popup_custom_spells_highlight");
        class_andor_group.lastElementChild.classList.remove("popup_custom_spells_highlight");
        updateCode();
    };
    class_andor_group.lastElementChild.onclick = function(){
        Step1PopupData.class.andor = "and";
        class_andor_group.firstElementChild.classList.remove("popup_custom_spells_highlight");
        class_andor_group.lastElementChild.classList.add("popup_custom_spells_highlight");
        updateCode();
    };

// - Level
    levelLow.onchange = function(){
        if(this.value < 0) this.value = 0;
        if(this.value > 9) this.value = 9;
        if(this.value > levelHigh.value && levelHigh.value.length){
            let tempVal = this.value;
            this.value = levelHigh.value;
            levelHigh.value = tempVal;
        }
        Step1PopupData.level.low = levelLow.value;
        Step1PopupData.level.high = levelHigh.value;
        updateCode();
    };
    levelHigh.onchange = function(){
        if(this.value < 0) this.value = 0;
        if(this.value > 9) this.value = 9;
        if(this.value < levelLow.value && levelLow.value.length){
            let tempVal = this.value;
            this.value = levelLow.value;
            levelLow.value = tempVal;
        }
        Step1PopupData.level.low = levelLow.value;
        Step1PopupData.level.high = levelHigh.value;
        updateCode();
    };

// - Range
    let popup_range_number = document.getElementById("popup_range_number");
    document.getElementById("popup_range_select").onchange = function(){
        popup_range_number.style.display = "none";
        if(this.value === "number"){
            popup_range_number.style.display = "block";
        }
    };
    rangeLow.onchange = function(){
        if(this.value < 0) this.value = 0;
        if(this.value > rangeHigh.value && rangeHigh.value.length){
            let tempValue = this.value;
            this.value = rangeHigh.value;
            rangeHigh.value = tempValue;
        }
        Step1PopupData.range_num.low = rangeLow.value;
        Step1PopupData.range_num.high = rangeHigh.value;
        updateCode();

    };
    rangeHigh.onchange = function(){
        if(this.value < 0) this.value = 0;
        if(this.value < rangeLow.value && rangeLow.value.length){
            let tempValue = this.value;
            this.value = rangeLow.value;
            rangeLow.value = tempValue;
        }
        Step1PopupData.range_num.low = rangeLow.value;
        Step1PopupData.range_num.high = rangeHigh.value;
        updateCode();
    };


    somatic.onchange = function(){
        Step1PopupData.somatic = this.value;
        updateCode();
    };
    ritual.onchange = function(){
        Step1PopupData.ritual = this.value;
        updateCode();
    };
    verbal.onchange = function(){
        Step1PopupData.verbal = this.value;
        updateCode();
    };
    material.onchange = function(){
        Step1PopupData.material = this.value;
        updateCode();
    };
    concentration.onchange = function(){
        Step1PopupData.concentration = this.value;
        updateCode();
    }
    updateCode();
}
