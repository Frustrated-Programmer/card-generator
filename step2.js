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

spells = [];
let hovering=[false,false];
let shownDiv;
let dissapearTimeout;
let spell_preview = document.getElementById("spell_preview");
spell_preview.onmouseenter = function (){
    hovering[1] = true;
    this.show();
}
spell_preview.onmouseleave = function (){
    hovering[1] = false;
    this.hide();
}
spell_preview.show = function(spell){
    if(dissapearTimeout) clearTimeout(dissapearTimeout);
    spell_preview.style.display = "block";
    if(spell && spell.name){
        while(spell_preview.firstElementChild) spell_preview.firstElementChild.remove();
        previewSpell(spell);
    }
};
spell_preview.hide = function(force){
    if(hovering[0] || hovering[1]) return;
    dissapearTimeout = setTimeout(() => {
        this.style.display = "none";
        clearTimeout(this.timeout);
        this.timeout = false;
        shownDiv = null;
        clearTimeout(dissapearTimeout);
        dissapearTimeout = false;
    }, (force ? 0 : 2000));
};
spell_preview.hide(true);
let step2_spell_list = document.getElementById("step2_spell_list");
document.getElementById("approve_step2").onclick = function(){
    currentStep++;
    updateStep();
};

function isTrue(spell){
    let tempFunct = step1Function + "\nchecker(" + JSON.stringify(spell) + ");";
    let result = (eval(tempFunct) === true);
    return result
}

let start = Date.now();
let mousePos = {
    x: 0,
    y: 0
};
for(let i = 0; i < spellsJSON.length; i++){
    if(isTrue(getCustomSpell(spellsJSON[i]))){
        spells.push(getCustomSpell(spellsJSON[i]));
    }
}
for(let i =0;i< customSpells.length;i++){
    if(isTrue(getCustomSpell(customSpells[i]))){
        spells.push(getCustomSpell(customSpells[i]));
    }
}
step2_spell_list.onmousemove = function(e){
    mousePos = {
        x: e.pageX,
        y: e.pageY
    };
};

function previewSpell(spell){
    spell = getCustomSpell(spell);
    spell_preview.style.left = mousePos.x+"px";
    spell_preview.style.width = "auto";
    if(step2_spell_list.clientWidth - mousePos.x < 300){
        spell_preview.style.left = (step2_spell_list.clientWidth - 300) + "px";
        spell_preview.style.width = 300+"px";
    }
    spell_preview.style.top = mousePos.y+"px";
    if(step2_spell_list.clientHeight - mousePos.y < 100){
        spell_preview.style.top = (step2_spell_list.clientHeight - 100) + "px";
    }
    let span = document.createElement('span');
    span.innerText = spell.name;
    span.style.fontFamily = "ringbearer";
    span.style.fontSize = "120%";
    span.style.position="relative";
    span.style.left="50px";
    spell_preview.appendChild(span);
    let table = document.createElement("table");
    for(let i in spell){
        if(i === "name")continue;
        let row = document.createElement("tr");
        let col1 = document.createElement("td");
        let col2 = document.createElement("td");
        let insert1 = document.createElement("span");
        let insert2 = document.createElement("span");
        insert1.innerText = i;
        let text = spell[i];
        if(typeof text === "object"){
            let last = "";
            let str = "";
            for(let i in text){
                if(!text[i]) continue;
                if(str.length) str += ", ";
                str += last;
                last = i;
            }
            text = (str.length ? str + ", & " : "") + last;
        }
        let insert3 = false;
        if(text.length > 50){
              insert3 = document.createElement('span');
              insert3.innerText = text;
              insert3.style.display = "none";
              text = text.substring(0,40) + "...";
        }
        insert2.innerText = text;
        col1.appendChild(insert1);
        col2.appendChild(insert2);
        if(insert3){
            col2.style.display = "flex";
            col2.appendChild(insert3);
            let bttn = document.createElement('button');
            bttn.innerText = "more";
            bttn.showing = false;
            bttn.onclick = function(){
                this.showing = !this.showing;
                insert2.style.display = "none";
                insert3.style.display = "none";
                if(this.showing) insert3.style.display = "block";
                else insert2.style.display = "block";
                this.innerText = this.showing ? "less" : "more";
            }
            bttn.classList.add('moreBttn');
            col2.appendChild(bttn);
        }
        row.appendChild(col1);
        let breaker = document.createElement('td');
        breaker.innerHTML = "<span>:</span>";
        row.appendChild(breaker);
        row.appendChild(col2);
        table.appendChild(row);
    }
    spell_preview.appendChild(table);
}

function createStep2Elem(spell, index){
    let div = document.createElement("div");
    div.style.backgroundColor = index % 2 === 0 ? "#4D4D4D" : "#6F6F6F";
    div.id = "spell_number_" + index;
    div.className = "step2_spell_list_item";
    let name = document.createElement("span");
    name.innerText = spell.name;
    //TODO: figure out how to auto adjust text size.
    let deleteBttn = document.createElement("button");
    let img = document.createElement("img");
    img.src = "./images/TrashCan.png";
    deleteBttn.appendChild(img);
    deleteBttn.onclick = function(){
        for(let i = 0; i < spells.length; i++){
            if(spells[i].name === spell.name) spells.splice(i, 1);
        }
        Step2createSpellLists();
    };
    div.appendChild(name);
    div.appendChild(deleteBttn);
    div.onmouseenter = function(){
        if(shownDiv && shownDiv.id === this.id) {
            hovering[0] = true;
            spell_preview.show();
        }
        else{
            this.timeout = setTimeout(() => {
                spell_preview.show(spell);
                shownDiv = this;
            }, 1000);
        }
    };
    div.clearTime = function(){
        if(shownDiv && shownDiv.id === this.id){
            spell_preview.hide();
        }
        else{
            clearTimeout(this.timeout);
            this.timeout = false;
        }
    };
    div.onmouseleave = function (){
        if(shownDiv && shownDiv.id === this.id) hovering[0] = false;
        div.clearTime();
    }
    return div;

}

function Step2createSpellLists(){
    let tr;
    while(step2_spell_list.firstElementChild){
        step2_spell_list.firstElementChild.remove();
    }
    for(let i = 0; i < spells.length; i++){
        if(i % 3 === 0){
            if(tr) step2_spell_list.appendChild(tr);
            tr = document.createElement("tr");
        }
        let td = document.createElement("td");
        td.appendChild(createStep2Elem(spells[i], i));
        tr.appendChild(td);
    }
    step2_spell_list.appendChild(tr);
}

Step2createSpellLists();
