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
const step3Div = document.getElementById("step3");
const step35Canvas = document.getElementById("step35Canvas");
const step35_img = document.getElementById("step3_preview_front");
const step35_simpleSettings = document.getElementById("step35_simpleSettings");
const step35_more = document.getElementById("step35_more");
const step35_fontSize_hide = document.getElementsByClassName("step35_fontSize_hide");
const context = step35Canvas.getContext("2d");
const step35_settings_x = document.getElementById("step35_settings_x");
const step35_settings_y = document.getElementById("step35_settings_y");
const step35_settings_width = document.getElementById("step35_settings_width");
const step35_settings_height = document.getElementById("step35_settings_height");
const step35_more_settings = document.getElementById("step35_more_settings");
const step35_settings_fontSize_choice = document.getElementById("step35_settings_fontSize_choice");
const step35_settings_fontsize = document.getElementById("step35_settings_fontsize");
const step35_settings_text = document.getElementById("step35_settings_text");
const step35_settings_fontStyle = document.getElementById("step35_settings_fontStyle");
const step35_settings_textAlign = document.getElementById("step35_settings_textAlign");

const docs = document.getElementById('docs')

let canvasStats = {
    cursorX: 0,
    cursorY: 0,
    pageX: 0,
    pageY: 0,
    leftMouseDown: false,
    rightMouseDown: false
};
let selectedElem;
let step35imgRatio = step35_img.height / step35_img.width;
let imgH = step35Canvas.height;
let imgW = imgH / step35imgRatio;
let scaleParam = {
    x: 0,
    y: 0,
    zoom: 1,
    offsetX:0,
    offsetY:0,
};
let offset = {
    x: (step35Canvas.width / 2) - (imgW / 2),
    y: (step35Canvas.height / 2) - (imgH / 2)
};
let margin = (step35Canvas.width / 40);
if(!step35imgRatio) setTimeout(function(){
    step35imgRatio = step35_img.height / step35_img.width;
    imgH = step35Canvas.height;
    imgW = imgH / step35imgRatio;
}, 50);
step35Canvas.width = step35Canvas.parentElement.parentElement.clientWidth - 8;
step35Canvas.height = step35Canvas.parentElement.parentElement.clientHeight - 41.82;
step35Canvas.onmouseleave = function(){
    if(!step35_more_settings.showing) disableRightClick = false;
};
step35Canvas.onmouseenter = function(){
    disableRightClick = true;
}
step35Canvas.onmousemove = function(ev){
    disableRightClick = true;

    if(ev.buttons !== 1) canvasStats.leftMouseDown = false;
    if(ev.buttons !== 2) canvasStats.rightMouseDown = false;
    else{
        scaleParam.x += (ev.movementX / scaleParam.zoom);
        scaleParam.y += (ev.movementY / scaleParam.zoom);
    }
    docs.innerText = `scX: ${scaleParam.x}, wid: ${step35Canvas.width}, zm: ${scaleParam.zoom}, x: ${canvasStats.cornerX}, offX: ${scaleParam.offsetX}, curX: ${canvasStats.cursorX}`;

    canvasStats.pageX = ev.pageX;
    canvasStats.pageY = ev.pageY;
    canvasStats.cornerX = ev.pageX;
    canvasStats.cornerY = (ev.pageY - (step35Canvas.offsetTop + header.clientHeight + step3Div.offsetHeight));

    if(selectedElem && canvasStats.leftMouseDown){
        function changeLeft(){
            selectedElem.width -= (canvasStats.cursorX - selectedElem.x);
            selectedElem.x = canvasStats.cursorX;
        }

        function changeRight(){
            selectedElem.width = canvasStats.cursorX - selectedElem.x;
        }

        function changeTop(){
            selectedElem.height -= (canvasStats.cursorY - selectedElem.y);
            selectedElem.y = canvasStats.cursorY;
        }

        function changeBottom(){
            selectedElem.height = canvasStats.cursorY - selectedElem.y;
        }

        if(selectedElem.hoveringCircles.topLeft){
            changeTop();
            changeLeft();
        }
        else if(selectedElem.hoveringCircles.top) changeTop();
        else if(selectedElem.hoveringCircles.topRight){
            changeRight();
            changeTop();
        }
        else if(selectedElem.hoveringCircles.right) changeRight();
        else if(selectedElem.hoveringCircles.bottomRight){
            changeRight();
            changeBottom();
        }
        else if(selectedElem.hoveringCircles.bottom) changeBottom();
        else if(selectedElem.hoveringCircles.bottomLeft){
            changeLeft();
            changeBottom();
        }
        else if(selectedElem.hoveringCircles.left) changeLeft();
        else if(selectedElem.moving){
            selectedElem.x = canvasStats.cursorX - (selectedElem.width / 2)
            selectedElem.y = canvasStats.cursorY - (selectedElem.height / 2)
        }
        if(step35_more_settings.showing) step35_more_settings.updateOwnValues();
    }

};
step35Canvas.onmousedown = function(ev){
    if(ev.button === 0){
        canvasStats.leftMouseDown = true;
        if(selectedElem){
            if(!(canvasStats.cursorX > selectedElem.x && canvasStats.cursorX < selectedElem.x + selectedElem.width && canvasStats.cursorY > selectedElem.y && canvasStats.cursorY < selectedElem.y + selectedElem.height) && !selectedElem.hoveringCircle){
                selectedElem.unselect();
                step35_more_settings.hide();
            }
        }
    }
    if(ev.button === 2) canvasStats.rightMouseDown = true;
};
step35Canvas.onmouseup = function(ev){
    if(ev.button === 0) canvasStats.leftMouseDown = false;
    if(ev.button === 2) canvasStats.rightMouseDown = false;
    if(selectedElem) selectedElem.moving = false;
};
step35Canvas.oncontextmenu = function(){
    return false;
};
window.onmousewheel = function(ev){
    scaleParam.zoom *= (ev.deltaY < 0) ? 1.1 : 0.5;
    scaleParam.offsetX = canvasStats.cornerX / scaleParam.zoom;
    scaleParam.offsetY = canvasStats.cornerY / scaleParam.zoom;
    if(scaleParam.zoom <= 1){
        scaleParam = {
            zoom:1,
            offsetX:0,
            offsetY:0,
            x:0,
            y:0
        }
    }
};
window.onkeydown = function(ev){
    if(!step35Canvas === document.activeElement) return;
    if(selectedElem){
        if(selectedElem.editingText){
            if((ev.key === "Backspace" || ev.code === "Backspace" || ev.keyCode === 8 || ev.which === 8) && selectedElem.text.length) selectedElem.text = selectedElem.text.substring(0, selectedElem.text.length - 1);
            else if((ev.key === "Esc" || ev.code === "Esc" || ev.keyCode === 27 || ev.which === 27)){
                selectedElem.editingText = false;
                selectedElem.blinked = false;
                selectedElem.text = selectedElem.text.trim();
            }
            else if(ev.key.length === 1) selectedElem.text += ev.key || ev.code || String.fromCharCode(ev.keyCode || ev.which);

            if(selectedElem.blinked) selectedElem.previewText = selectedElem.text + "|";
            else selectedElem.previewText = selectedElem.text;
        }
    }
};

step35_more_settings.showing = false;
step35_more_settings.show = function(){
    step35_more_settings.showing = true;
    disableRightClick = true;
    step35_simpleSettings.style.display = "none";
    step35_more_settings.updateOwnValues();
    step35_more_settings.style.display = "block";
    step35_settings_x.disabled = false;
    step35_settings_y.disabled = false;
    step35_settings_width.disabled = false;
    step35_settings_height.disabled = false;
    step35_settings_fontSize_choice.disabled = false;
    step35_settings_fontsize.disabled = false;
    step35_settings_text.disabled = false;
    step35_settings_fontStyle.disabled = false;
    step35_settings_textAlign.disabled = false;
};
step35_more_settings.hide = function(){
    step35_more_settings.showing = false;
    step35_more_settings.style.display = "none";
    step35_settings_x.disabled = true;
    step35_settings_y.disabled = true;
    step35_settings_width.disabled = true;
    step35_settings_height.disabled = true;
    step35_settings_fontSize_choice.disabled = true;
    step35_settings_fontsize.disabled = true;
    step35_settings_text.disabled = true;
    step35_settings_fontStyle.disabled = true;
    step35_settings_textAlign.disabled = true;
};
step35_more_settings.updateOwnValues = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    step35_settings_text.innerText = selectedElem.text;
    step35_settings_x.value = Math.round(selectedElem.x);
    step35_settings_y.value = Math.round(selectedElem.y);
    step35_settings_width.value = Math.round(selectedElem.width);
    step35_settings_height.value = Math.round(selectedElem.height);
    step35_settings_fontSize_choice.selectedIndex = selectedElem.fontSize !== 0 ? 1 : 0;
    step35_settings_fontsize.value = selectedElem.fontSize;
    step35_settings_text.value = selectedElem.text;
    step35_settings_fontStyle.value = selectedElem.fontStyle;
    step35_settings_textAlign.value = selectedElem.textAlign;
};
step35_more_settings.hide();

function DragDroppableElem(text){
    this.id = addedElems.length > 0 ? addedElems[addedElems.length - 1].id + 1 : 0;
    this.fontStyle = "mplantin";
    this.textAlign = "Left";
    this.fontSize = 0;
    this.x = 765;
    this.y = 365;
    this.width = 100;
    this.height = 50;
    this.circleSize = 5;
    this.displayCircles = {
        topLeft: true,
        top: true,
        topRight: true,
        right: true,
        bottomRight: true,
        bottom: true,
        bottomLeft: true,
        left: true
    };
    this.hoveringCircles = {
        topLeft: false,
        top: false,
        topRight: false,
        right: false,
        bottomRight: false,
        bottom: false,
        bottomLeft: false,
        left: false
    };
    this.text = text || "Edit Me";
    this.previewText = this.text;
    this.hovering = false;
    this.hoveringCircle = false;
    this.settings = false;
    this.editingText = false;
    this.hoveringSettings = false;
    this.leaveTime = Date.now();
    this.blinkTime = Date.now();
    this.blinked = false;
    this.selected = false;
    this.moving = false;
}

DragDroppableElem.prototype.unselect = function(){
    this.selected = false;
    this.blinked = false;
    this.moving = false;
    this.hoveringSettings = false;
    this.editingText = false;
    this.hovering = false;
    this.hoveringCircle = false;
    this.previewText = this.text;
    this.hoveringCircles = {
        topLeft: false,
        top: false,
        topRight: false,
        right: false,
        bottomRight: false,
        bottom: false,
        bottomLeft: false,
        left: false
    };
};
DragDroppableElem.prototype.drawCircle = function(circleX, circleY, which){
    if(this.displayCircles[which]){
        let cur = {
            x: canvasStats.cursorX,
            y: canvasStats.cursorY
        };

        let dx = cur.x - circleX;
        let dy = cur.y - circleY;
        let r = this.hoveringCircles[which] ? this.circleSize * 1.25 : this.circleSize;
        if(dx * dx + dy * dy < r * r && !canvasStats.leftMouseDown){
            switch(which){
                case "topLeft":
                    document.body.style.cursor = "nw-resize";
                    break;
                case "top":
                    document.body.style.cursor = "n-resize";
                    break;
                case "topRight":
                    document.body.style.cursor = "ne-resize";
                    break;
                case "right":
                    document.body.style.cursor = "e-resize";
                    break;
                case "bottomRight":
                    document.body.style.cursor = "se-resize";
                    break;
                case "bottom":
                    document.body.style.cursor = "s-resize";
                    break;
                case "bottomLeft":
                    document.body.style.cursor = "sw-resize";
                    break;
                case "left":
                    document.body.style.cursor = "w-resize";
                    break;

            }
            this.hoveringCircles[which] = true;
            this.hoveringCircle = true;
        }
        context.beginPath();
        context.arc(circleX, circleY, this.hoveringCircles[which] ? this.circleSize * 1.25 : this.circleSize, 0, 2 * Math.PI);
        context.fillStyle = "#07D6FF";
        context.fill();
        context.beginPath();
        context.fillStyle = "#000000";
       // context.arc(cur.x, cur.y, 1, 0, 2 * Math.PI);
        context.fill();


    }
};
DragDroppableElem.prototype.JSON = function(){
    return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        fontStyle: this.fontStyle,
        fontSize: this.fontSize,
        textAlign: this.textAlign,
        text: this.text
    };
};
DragDroppableElem.prototype.math = function(){
    this.displayCircles = {
        topLeft: true,
        top: true,
        topRight: true,
        right: true,
        bottomRight: true,
        bottom: true,
        bottomLeft: true,
        left: true
    };
    if(this.x <= 0 - offset.x){
        this.x = 0 - offset.x;
        this.displayCircles.topLeft = false;
        this.displayCircles.left = false;
        this.displayCircles.bottomLeft = false;
    }
    if(this.y <= 0 - offset.y){
        this.y = 0 - offset.y;
        this.displayCircles.topLeft = false;
        this.displayCircles.top = false;
        this.displayCircles.topRight = false;
    }
    if(this.x + this.width >= step35Canvas.width - offset.x){
        this.width = (step35Canvas.width - offset.x) - this.x;
        this.displayCircles.topRight = false;
        this.displayCircles.Right = false;
        this.displayCircles.bottomRight = false;
    }
    if(this.y + this.height >= step35Canvas.height - offset.y){
        this.height = (step35Canvas.height - offset.y) - this.y;
        this.displayCircles.bottomLeft = false;
        this.displayCircles.bottom = false;
        this.displayCircles.bottomRight = false;
    }
    this.hovering = false;
    if(Date.now() - this.leaveTime > 100 && this.settings && !this.hoveringSettings){
        this.settings = false;
        step35_simpleSettings.style.display = "none";
    }
    if(Date.now() - this.blinkTime > 200 && this.editingText){
        if(this.blinked) this.previewText = this.text;
        else this.previewText = this.text + "|";
        this.blinked = !this.blinked;
        this.blinkTime = Date.now();
    }
    if(canvasStats.cursorX > this.x && canvasStats.cursorX < this.x + this.width && canvasStats.cursorY > this.y && canvasStats.cursorY < this.y + this.height){
        this.leaveTime = Date.now();
        if(!this.selected) document.body.style.cursor = "pointer";
        else{
            document.body.style.cursor = "move";
            this.hovering = true;
        }

        if(!this.editingText) this.previewText = this.text;
        if(canvasStats.leftMouseDown){
            if(selectedElem){
                if(selectedElem.id !== this.id){
                    if(selectedElem.hoveringCircle || selectedElem.moving || selectedElem.hoveringSettings || selectedElem.hovering) return;
                    selectedElem.unselect();
                }
            }
            this.moving = true;
            this.selected = true;
            selectedElem = this;
        }
        else if(canvasStats.rightMouseDown){
            this.settings = true;
            disableRightClick = true;
            step35_simpleSettings.style.display = "block";
            step35_simpleSettings.style.left = canvasStats.pageX + "px";
            step35_simpleSettings.style.top = canvasStats.pageY - 100 + "px";
        }
        else{
            this.moving = false;
        }
    }
};
DragDroppableElem.prototype.draw = function(context){

    this.math();
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.lineWidth = 1;
    context.strokeStyle = "#000000";
    context.stroke();
    context.fillStyle = "#000000";

    let size = this.fontSize || this.height;
    do{
        size--;
        context.font = size + "px " + this.fontStyle;
    } while(context.measureText(this.text).width > this.width);

    context.textAlign = this.textAlign.toLowerCase();
    if(this.textAlign.toLowerCase() === "left") context.fillText(this.previewText, this.x, this.y + this.height - (this.height / 4));
    if(this.textAlign.toLowerCase() === "center") context.fillText(this.previewText, this.x + (this.width / 2), this.y + this.height - (this.height / 4));
    if(this.textAlign.toLowerCase() === "right") text.fillText(this.previewText, this.x + this.width, this.y + this.height - (this.height / 4));
    if(this.textAlign.toLowerCase() === "right") text.fillText(this.previewText, this.x + this.width, this.y + this.height - (this.height / 4));

    if(this.selected){
        context.lineWidth = 1;
        context.strokeStyle = "#0589A5";
        context.stroke();
        this.hoveringCircle = false;
        if(!canvasStats.leftMouseDown){
            this.hoveringCircles = {
                topLeft: false,
                top: false,
                topRight: false,
                right: false,
                bottomRight: false,
                bottom: false,
                bottomLeft: false,
                left: false
            };
        }
        this.drawCircle(this.x, this.y, "topLeft");
        this.drawCircle(this.x + (this.width / 2), this.y, "top");
        this.drawCircle(this.x + (this.width), this.y, "topRight");
        this.drawCircle(this.x + this.width, this.y + (this.height / 2), "right");
        this.drawCircle(this.x + (this.width), this.y + (this.height), "bottomRight");
        this.drawCircle(this.x + (this.width / 2), this.y + (this.height), "bottom");
        this.drawCircle(this.x, this.y + this.height, "bottomLeft");
        this.drawCircle(this.x, this.y + (this.height / 2), "left");
    }
};

step35_simpleSettings.style.display = "none";
step35_simpleSettings.onmouseenter = function(){
    if(selectedElem){
        selectedElem.hoveringSettings = true;
    }
    else step35_simpleSettings.style.display = "none";
};
step35_simpleSettings.onmouseleave = function(){
    if(selectedElem){
        selectedElem.hoveringSettings = false;
        selectedElem.leaveTime = Date.now();
    }
    else step35_simpleSettings.style.display = "none";
};
step35_settings_x.oninput = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    if(this.value < 0 - offset.x) this.value = 0 - offset.x;
    if(this.value > step35Canvas.width - offset.x) this.value = step35Canvas.width - offset.x;
    if(!this.value) return;
    selectedElem.x = parseInt(this.value, 10);
};
step35_settings_y.oninput = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    if(this.value < 0 - offset.y) this.value = 0 - offset.y;
    if(this.value > step35Canvas.height - offset.y) this.value = step35Canvas.height - offset.y;
    if(!this.value) return;
    selectedElem.y = parseInt(this.value, 10);
};
step35_settings_width.oninput = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    if(this.value < 1) this.value = 1;
    if(this.value > step35Canvas.width - (step35Canvas.width - selectedElem.x)) this.value = step35Canvas.width - (step35Canvas.width - selectedElem.x);
    this.value = Math.round(parseInt(this.value, 10));
    selectedElem.width = parseInt(this.value, 10);
    this.value = selectedElem.width;
};
step35_settings_height.oninput = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    if(this.value < 0) this.value = "";
    if(this.value > step35Canvas.height - (step35Canvas.height - selectedElem.y)) this.value = step35Canvas.height - (step35Canvas.height - selectedElem.y);
    this.value = Math.round(parseInt(this.value, 10));
    selectedElem.width = parseInt(this.value, 10);
    this.value = selectedElem.height;
};
step35_settings_textAlign.onchange = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    selectedElem.textAlign = this.value;
};
step35_settings_fontSize_choice.onchange = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    for(let i = 0; i < step35_fontSize_hide.length; i++){
        if(this.selectedIndex === 0) step35_fontSize_hide[i].classList.add("none");
        else step35_fontSize_hide[i].classList.remove("none");
    }
    if(this.selectedIndex === 0) selectedElem.fontSize = 0;
};
step35_settings_fontsize.oninput = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    if(!this.value || this.value < 0) this.value = 0;
    selectedElem.fontSize = this.value;
};
step35_settings_text.oninput = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    if(!this.value.length) selectedElem.text = "Edit Me.";
    else selectedElem.text = this.value;
    selectedElem.previewText = selectedElem.text;
};
step35_settings_fontStyle.onchange = function(){
    if(!selectedElem){
        step35_more_settings.hide();
        return;
    }
    selectedElem.fontStyle = this.value;
};
step35_more.onclick = step35_more_settings.show;
document.getElementById("step35_help").onclick = function(){
    displayPopup(2);
};
document.getElementById("step35_edittext").onclick = function(){
    if(selectedElem){
        selectedElem.editingText = true;
        selectedElem.settings = false;
        selectedElem.hoveringSettings = false;
        step35_simpleSettings.style.display = "none";
        step35Canvas.focus();
    }
    else step35_simpleSettings.style.display = "none";
};
document.getElementById("step35_delete").onclick = function(){
    if(selectedElem){
        for(let i = 0; i < addedElems.length; i++){
            if(addedElems[i].id === selectedElem.id){
                addedElems.splice(i, 1);
                break;
            }
        }
        step35_simpleSettings.style.display = "none";
        step35Canvas.focus();
    }
    else step35_simpleSettings.style.display = "none";
};
document.getElementById("step35_AddInput").onclick = function(){
    step35_more_settings.hide();
    addedElems.push(new DragDroppableElem(unusedTemplates[0] ? "{" + unusedTemplates[0] + "}" : "Edit Me"));
    if(unusedTemplates.length) unusedTemplates.splice(0, 1);
};
document.getElementById("step35_continue").onclick = function(){
    template = {
        cardSize:{
            width:300,
            height:420
        },
        details:[]
    };
    for(let i = 0; i < addedElems.length; i++){
        template.details.push(addedElems[i].JSON());
    }
    console.log(`Created template:`);
    console.log(template);
    currentStep++;
    updateStep();
};


function updateStep35(){
    //RESET CANVAS
    canvasStats.cursorX = (((canvasStats.cornerX / scaleParam.zoom) - offset.x) + (scaleParam.offsetX - (scaleParam.offsetX / scaleParam.zoom))) - scaleParam.x;
    canvasStats.cursorY = (((canvasStats.cornerY / scaleParam.zoom) - offset.y) + (scaleParam.offsetY - (scaleParam.offsetY / scaleParam.zoom))) - scaleParam.y;

    imgH = step35Canvas.height;
    imgW = imgH / step35imgRatio;
    offset = {
        x: ((step35Canvas.width / 2) - (imgW / 2)) + margin,
        y: ((step35Canvas.height / 2) - (imgH / 2)) + margin
    };
    margin = (step35Canvas.width / 40);
    document.body.style.cursor = "auto";
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.moveTo(0, 0);
    context.fillStyle = "#777777";
    context.fillRect(0, 0, step35Canvas.width, step35Canvas.height);

    context.translate(scaleParam.offsetX, scaleParam.offsetY);
    context.scale(scaleParam.zoom, scaleParam.zoom);
    context.translate(-scaleParam.offsetX, -scaleParam.offsetY);

    context.translate(scaleParam.x, scaleParam.y);
    context.translate(offset.x, offset.y);
    context.beginPath();
    context.font = "italic 10pt Calibri";
    context.fillStyle = "#000000";
    context.arc(canvasStats.cursorX, canvasStats.cursorY, 1, 0, 2 * Math.PI);
    context.fill();
    context.drawImage(step35_img, 0, 0, 300, 420);//imgW - ((margin / step35imgRatio) * 2), imgH - (margin * 2)//(step35Canvas.width / 2) - (imgW / 2) + margin, (step35Canvas.height / 2) - (imgH / 2) + margin
    for(let i = 0; i < addedElems.length; i++){
        addedElems[i].draw(context);
    }
}

step35Canvas.focus();
updateStep35();
setTimeout(function(){
    step35.style.display = "block";
    clearInterval(step35Int);
    step35Int = setInterval(updateStep35, 50);
}, 1000);

