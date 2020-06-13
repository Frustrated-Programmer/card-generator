/**
 * Copyright (C) FrustratedProgrammer - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Elijah Anderson <contact@frustratedprogrammer>, April 2020
 **/


/*    bard:false,
    cleric:false,
    wizard:false,
    druid:false,
    sorcerer:false,
    warlock:false,
    ranger:false,
    paladin:false,

    verbal:false,
    somatic:false,
    ritual:false,
    concentration:false,
    materialCount:false,
    materialInclude:"",
    range_num:0,
    range:"",
    duration:"",
    casting:"",
    description:"",
    atHigherLevel:"",
    level:0,

    conjuration:false,
    evocation:false,
    enchantment:false,
    divination:false,
    necromancy:false,
    transmutation:false,
    abjuration:false,
    illusion:false,
    */
spells = [];
let step2_spell_list = document.getElementById('step2_spell_list');
document.getElementById('approve_step2').onclick = function(){
    currentStep++;
    updateStep();
};
function isTrue(spell){
    let tempFunct = step1Function + "\nchecker("+JSON.stringify(spell)+");";
    return (eval(tempFunct) === true);
}
let start = Date.now();
for(let i =0;i<spellsJSON.length;i++){
    if(isTrue(getCustomSpell(spellsJSON[i]))){
        spells.push(getCustomSpell(spellsJSON[i]));
    }
}
function createStep2Elem(spell,index){
    let div = document.createElement('div');
    div.style.backgroundColor = index % 2 === 0 ? "#4d4d4d" : "#6f6f6f";
    div.className="step2_spell_list_item";
    let name = document.createElement('span');
    name.innerText = spell.name;
    //TODO: figure out how to auto ajust text size.
    let deleteBttn = document.createElement('button');
    let img = document.createElement('img');
    img.src = "./images/TrashCan.png";
    deleteBttn.appendChild(img);
    deleteBttn.onclick = function(){
        for(let i =0;i<spells.length;i++){
            if(spells[i].name === spell.name) spells.splice(i,1);
        }
        Step2createSpellLists();
    };
    div.appendChild(name);
    div.appendChild(deleteBttn);
    div.onmouseenter = function(){
        div.timeout = setTimeout(function(){
            console.log(spell);
        },2000);
    };
    div.onmouseleave = function(){
        clearTimeout(div.timeout);
        div.timeout = false;
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
            tr = document.createElement('tr');
        }
        let td = document.createElement('td');
        td.appendChild(createStep2Elem(spells[i], i));
        tr.appendChild(td);
    }
    step2_spell_list.appendChild(tr);
}
Step2createSpellLists();
