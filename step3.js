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
template = null;
const colors = ["blue","brown","green","lime","orange","purple","red","yellow"];
let step3_approve = document.getElementById('step3_approve');
step35.style.display = "none";
function updateFile(imgElem,file){
    if (!file.type.startsWith('image/')){
        throwError("Invalid File!","Selected files must be of an image type.","jpeg, jpg, png, gif, ico, svg, jfif, (etc)");
        return false;
    }
    try{
        const reader = new FileReader();
        reader.onload = (function(aImg){
            return function(e){
                aImg.src = e.target.result;
            };
        })(imgElem);
        reader.readAsDataURL(file);
        return true;
    }
    catch(e){
        console.error(e);
        throwError('Unknown Error.',"Please report this error.", e.message);
        return false;
    }
}

front_select.disabled = false;
back_select.disabled = false;
//FRONT
let step3_front_hiddenInput = document.getElementById('step3_front_hiddenInput');
let step_3_front_custom = document.getElementById('step_3_front_custom');
step3_front_hiddenInput.onchange = function(){
    let file = this.files[0];
    let success = updateFile(step3_preview_front,file);
    if(success){
        addedElems = [];
        front_select.selectedIndex = 1;
        front_select.before = 1;
        step_3_front_custom.innerText = file.name;
        select_front_for_colors.style.display = "none";
        select_front_for_class.style.display = "none";
        step3_preview_front.style.display = "block";
    }
    else front_select.selectedIndex = 0;
    checkIfCanApprove();
};
front_select.onchange = function(ev){
    select_front_for_colors.style.display = "none";
    select_front_for_class.style.display = "none";
    step3_preview_front.style.display = "block";
    switch(this.value){
        case 'nbeebz':
            step3_preview_front.src = "./images/website/preview/example_"+schools[Math.round(Math.random() * (schools.length-1))]+".png";
            break;
        case 'color':
            select_front_for_colors.style.display = "block";
            if(select_front_for_colors.value === "none") step3_preview_front.src = "./images/website/preview/front_"+colors[Math.round(Math.random() * (colors.length-1))]+".png";
            else step3_preview_front.src = "./images/website/preview/front_"+select_front_for_colors.value.toLowerCase()+".png";
            break;
        case 'class':
            select_front_for_class.style.display = "block";
            if(select_front_for_class.value === "none") step3_preview_front.src = "./images/website/preview/"+classes[Math.round(Math.random() * (classes.length-1))]+"_front.png";
            else step3_preview_front.src = "./images/website/preview/"+select_front_for_class.value.toLowerCase()+"_front.png";
            break;
        case 'upload':
            ev.preventDefault();
            this.selectedIndex = this.before || 0;
            step3_preview_front.style.display = "none";
            if(this.selectedIndex === 3) select_front_for_colors.style.display = "block";
            else if(this.selectedIndex === 4) select_front_for_class.style.display = "block";
            step3_front_hiddenInput.click();
            break;
        default: console.log(this.value);
    }
    this.before = this.selectedIndex;
    checkIfCanApprove();
};
select_front_for_colors.onchange = function(){
    if(this.value !== "none") step3_preview_front.src = "./images/website/preview/front_"+this.value.toLowerCase()+".png";
    checkIfCanApprove();
};
select_front_for_class.onchange = function(){
    if(this.value !== "none") step3_preview_front.src = "./images/website/preview/"+this.value.toLowerCase()+"_front.png";
    checkIfCanApprove();
};

//BACK
let step3_back_hiddenInput = document.getElementById('step3_back_hiddenInput');
let step_3_back_custom = document.getElementById('step_3_back_custom');
step3_back_hiddenInput.onchange = function(){
    let file = this.files[0];
    let success = updateFile(step3_preview_back,file);
    if(success){
        back_select.selectedIndex = 1;
        back_select.before = 1;
        step_3_back_custom.innerText = file.name;
        select_back_for_class.style.display = "none";
    }
    else back_select.selectedIndex = 0;
    checkIfCanApprove();

};
back_select.onchange = function(ev){
    select_back_for_class.style.display = "none";
    step3_preview_back.style.display = "block";
    switch(this.value){
        case 'class':
            select_back_for_class.style.display = "block";
            if(select_back_for_class.value.toLowerCase() !== "none") step3_preview_back.src = "./images/website/preview/"+select_back_for_class.value.toLowerCase()+"_back.png";
            else step3_preview_back.src = "./images/website/preview/"+classes[Math.round(Math.random() * (classes.length-1))]+"_back.png";
            break;
        case 'simple':
            step3_preview_back.src = "./images/website/preview/Back_Simple.png";
            break;
        case 'complex':
            step3_preview_back.src = "./images/website/preview/Back_Complex.png";
            break;
        case 'upload':
            ev.preventDefault();
            this.selectedIndex = this.before || 0;
            if(this.selectedIndex === 2) select_back_for_class.style.display = "block";
            step3_back_hiddenInput.click();
            break;
        case 'nothing':
            step3_preview_back.style.display = "none";
            step3_preview_back.src = "//:0";
            break;
        default: console.log(this.value);
    }
    this.before = this.selectedIndex;

    checkIfCanApprove();
};
select_back_for_class.onchange = function(){
    if(this.value.toLowerCase() !== "none") step3_preview_back.src = "./images/website/preview/"+this.value.toLowerCase()+"_back.png";
    checkIfCanApprove();
};

function checkIfCanApprove(){
    let approved = true;
    if(front_select.selectedIndex === 0) approved = false;
    if(back_select.selectedIndex === 0) approved = false;
    if(select_front_for_class.selectedIndex === 0 && front_select.selectedIndex === 4) approved = false;
    if(select_front_for_colors.selectedIndex === 0 && front_select.selectedIndex === 3) approved = false;
    if(select_back_for_class.selectedIndex === 0 && back_select.selectedIndex === 3) approved = false;
    if(!approved && step3_approve.classList.contains('none')) return;
    step3_approve.className = "";
    step3_approve.replaceWith(step3_approve.cloneNode(true));
    step3_approve = document.getElementById('step3_approve');
    step3_approve.disabled = !approved;
    step3_approve.onclick = nextStep;
    step3_approve.className = 'fade' + (approved ? "In" : "Out");
}
function nextStep(){
    step3Choices.frontChoice = front_select.value;
    step3Choices.frontSrc = step3_preview_front.src;
    step3Choices.front = true;
    step3Choices.backChoice = back_select.value;
    step3Choices.backSrc = step3_preview_back.src;
    if(step3Choices.backSrc === "http://:0/"){
        step3Choices.backSrc = false;
        step3Choices.back = false;
    }
    else step3Choices.back = true;
    if(front_select.selectedIndex === 1){
        currentStep++;
        step3Choices.front = "custom"
    }
    else {
        currentStep+=2;
        if(front_select.selectedIndex !== 2){
            template = JSON.parse(JSON.stringify(ColorAndClassTemplate));
        }
        else template = {details:nbeebz,back:{},image:{},cardSize:{width: 300, height: 420}};
    }
    updateStep();
}
