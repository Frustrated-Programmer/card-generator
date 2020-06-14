/**
 * Copyright (C) FrustratedProgrammer - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Elijah Anderson <contact@frustratedprogrammer.com>, April 2020
 **/

let step5Canvas = document.getElementById('step5Canvas');
let imageObj = new Image();
imageObj.onload = function() {
    step5Canvas.getContext("2d").drawImage(imageObj, 69, 50);
};
imageObj.src = "./images/cleric_front.png";
let default_template = [
    {
        x: 21.917258883248678,
        y: 15.850000000000001,
        width: 291,
        height: 25.299999999999997,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Center",
        text: "{title}"
    },
    {
        x: 168.41725888324868,
        y: 116.5,
        width: 146,
        height: 19.30000000000001,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Center",
        text: "{duration}"
    },
    {
        "x": 12.417258883248678,
        y: 429.8,
        width: 305,
        height: 26,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Center",
        text: "A level {level} {school} spell."
    },
    {
        "x": 15.417258883248678,
        y: 167.35,
        width: 304,
        height: 188.3,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Left",
        text: "{description}"
    },
    {
        "x": 166.41725888324868,
        y: 73.35,
        width: 144,
        height: 20.299999999999997,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Center",
        text: "{range}"
    },
    {
        "x": 13.417258883248678,
        y: 75.5,
        width: 149,
        height: 18.299999999999997,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Center",
        text: "{casting}"
    },
    {
        "x": 10.417258883248678,
        y: 113.5,
        width: 151,
        height: 22.30000000000001,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Center",
        text: "{materials}"
    },
    {
        "x": 11.417258883248678,
        y: 358.5,
        width: 306,
        height: 64.30000000000001,
        fontStyle: "mplantin",
        fontSize: 0,
        ignoreBounding: false,
        textAlign: "Left",
        text: "{athigherlevel}"
    }
];

class PDFGen {
    constructor(template, image){
        this.template = template;
        this.image = image;
        this.data = [];
        this.detail = [];
        this.reportData = {
            "type": "report",
            "dataUUID": 10002,
            "fontSize": 0,
            "autoPrint": false,
            "name": "DnD_Spell_Cards.pdf",
            "paperSize": "letter",
            "paperOrientation": "landscape",
            "fonts": Object.values(fonts),
            "variables": {},
            "detail": []
        };
        this._counter = 0;
    }


    async _getLineData(string, width, font, size, log){
        return new Promise(function(cb, rj){
            let softSplit = string.split(" ");
            let spaceGlyph = font.layout(" ").glyphs;
            let currentWidth = 0;
            let highestWidth = 0;
            let lineHeight = 0;
            let totalHeight = 0;
            let statsWhenNewWord = {};
            let lines = [""];
            let currentText = "";
            let overrideIndex = 0;
            for(let i = 0; i < softSplit.length; i++){
                let glyphs = font.layout(softSplit[i]).glyphs;
                statsWhenNewWord = {
                    height: lineHeight,
                    width: currentWidth,
                    string: currentText
                };
                if(currentText.length){
                    currentText += " ";
                    currentWidth += ((spaceGlyph.advanceWidth / 1000) * size);
                    if(lineHeight < ((spaceGlyph.advanceHeight / 1000) * size)) lineHeight = ((spaceGlyph.advanceHeight / 1000) * size);
                }
                for(let g = overrideIndex; g < glyphs.length; g++){
                    if(currentWidth + ((glyphs[g].advanceWidth / 1000) * size) < width){
                        currentWidth += ((glyphs[g].advanceWidth / 1000) * size);
                        if(lineHeight < ((glyphs[g].advanceHeight / 1000) * size)) lineHeight = ((glyphs[g].advanceHeight / 1000) * size);

                        currentText += softSplit[i][g];
                    }
                    else if(g === 0){
                        cb({
                            averageLineHeight: 1000,
                            highestWidth: 1000,
                            height: 1000
                        });
                    }
                    //SOFT WRAP
                    else if((lines[lines.length - 1] + "").length && lines[lines.length - 1] !== undefined){
                        i--;
                        if(highestWidth < statsWhenNewWord.width) highestWidth = statsWhenNewWord.width;
                        totalHeight += statsWhenNewWord.height;
                        currentWidth = 0;
                        lineHeight = 0;
                        currentText = "";
                        lines[lines.length - 1] = statsWhenNewWord.string;
                        statsWhenNewWord = {
                            height: lineHeight,
                            width: currentWidth,
                            string: currentText
                        };
                        lines.push("");
                        overrideIndex = 0;
                        break;
                    }
                    //HARD WRAP
                    else{
                        if(!lines[lines.length-1].length){
                            cb({
                                averageLineHeight: 1000,
                                highestWidth: 1000,
                                height: 1000
                            });
                            return;
                        }
                        i--;
                        overrideIndex = g;
                        if(highestWidth < statsWhenNewWord.width) highestWidth = currentWidth;
                        totalHeight += lineHeight;
                        lines[lines.length - 1] = currentText;
                        currentWidth = 0;
                        lineHeight = 0;
                        currentText = "";
                        lines.push("");

                        break;
                    }
                }

            }
            if(highestWidth < currentWidth) highestWidth = currentWidth;
            totalHeight += lineHeight;
            lines[lines.length - 1] = currentText;

            cb({
                averageLineHeight: totalHeight / lines.length,
                highestWidth,
                height: totalHeight
            });
        });
    }

    _getReplaced(text, spell){
        text = text.split("{title}").join(spell.name);
        text = text.split("{school}").join(spell.school);
        text = text.split("{level}").join(spell.level);
        text = text.split("{duration}").join(spell.duration);
        text = text.split("{range}").join(spell.range);
        text = text.split("{casting}").join(spell.casting);
        text = text.split("{materials}").join(spell.materials);
        text = text.split("{description}").join(spell.description);
        text = text.split("{athigherlevel}").join(spell.atHigherLevel);
        text = text.split("<p>").join("");
        text = text.split("<br>").join("");
        text = text.split("<b>").join("");
        text = text.split("<i>").join("");
        text = text.split("</p>").join("");
        text = text.split("</b>").join("");
        text = text.split("</i>").join("");
        return text;
    }

    async addCard(position, spell){
        return new Promise(async (cb) => {
            let detail = [{
                "image": this.image,
                "settings": {
                    "left": position.x,
                    "top": position.y,
                    "aspect": "size",
                    "width": this.image.width,
                    "height": this.image.height
                },
                "type": "image"
            }];
            let replacedText;
            let size = 50;
            for(let i = 0; i < this.template.length; i++){
                replacedText = this._getReplaced(this.template[i].text, spell);
                if(this.template[i].fontSize !== 0) size = this.template[i].fontSize;
                let data;
                let size = this.template[i].fontSize;
                if(!size){
                    size = 200;
                    let fit = true;
                    while(!fit){
                        data = await this._getLineData(replacedText, this.template[i].width, fonts[this.template[i].fontStyle], size,i===6);
                        if(data.height > this.template[i].height) size -= size / 20;
                        else fit = true;
                        if(size < 8){
                            console.error("Minimum size...")
                            size = 8;
                            fit = true;
                        }
                    }
                }
                detail.push({
                    "text": replacedText,
                    "settings": {
                        "x": position.x + this.template.x,
                        "y": position.y + this.template.y,
                        "font": this.template[i].fontStyle,
                        "fontSize": size,
                        "align": this.template[i].textAlign,
                        "width": this.template[i].width
                    },
                    "type": "text"
                });
            }
            this.detail.push(detail);
            cb();
        });
    }

    _displayDetail(report, data){
        for(let i = 0; i < data.length; i++){
            if(data[i].type === "image") report.image(data[i].image, {x: data[i].settings.left, y: data[i].settings.top, width: data[i].settings.width});
            else if(data[i].type === "text") report.print(data[i].text, data[i].settings);

        }
        this._counter++;
        if(this._counter % 8 === 0){ report.newPage(); }
    }

    addPage(){

    }

    finish(){
        return new Promise((cb) => {
            let keys = Object.keys(fonts);
            let blober = new blob();
            let rpt = new Report(blober, {landscape: true,fonts:fonts})
                //.margins({left:20, top:20, bottom:20, right: 0})
                .autoPrint(false)
                .data(this.detail)
                .detail(this._displayDetail);

            for(let i =0;i<keys.length;i++){
                rpt.registerFont(keys[i],{normal:fonts[keys[i]].stream.buffer});
            }
//            rpt.outputType(Report.renderType.buffer, blober);
              rpt.render(function(err, output){cb(output);});
        });
    }
}

console.log('Waiting 1 second so fonts can generate');
setTimeout(function(){
let pdf = new PDFGen(default_template, step5Canvas.toDataURL());
pdf._getLineData("Instantaneous",146,fonts["mplantin"],200)


pdf.addCard({x: 50, y: 50}, {
    "name": "Clone",
    "classes": [
        "wizard"
    ],
    "school": "necromancy",
    "level": 8,
    "range": "Touch",
    "duration": "Instantaneous",
    "casting": "1 hour",
    "verbal": true,
    "somatic": true,
    "material": 3,
    "materials": "A diamond worth at least 1,000 gp and at least 1 cubic inch of flesh of the creature that is to be cloned, which the spell consumes, and a vessel worth at least 2,000 gp that has a sealable lid and is large enough to hold a medium creature, such as a large urn, coffin, mud-filled cyst in the ground, or crystal container filled with salt water",
    "concentration": false,
    "ritual": false,
    "description": "<p>This spell grows an inert duplicate of a living creature as a safeguard against death. This clone forms inside a sealed vessel and grows to full size and maturity after 120 days; you can also choose to have the clone be a younger version of th esame creature. It remains inert and endures indefinitely, as long as its vessel remains undisturbed.</p><p>At any time after the clone matures, if the original creature dies, its soul tranfers to the clone, provided that the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original&#39;s equipment. The original creature&#39;s physical remains, if they still exist, become inert and can&#39;t thereafter be restored to life, since the creature&#39;s soul is elsewhere.</p>"
}).then(function(){
    pdf.finish().then(function(buffer){
        /**
         * Get's buffer. (Length: 23079)
         * Turn buffer into blob (Length: 0) <-- Problem
         * turn blob into blobUrl
         * set iframe's src to blobUrl.
         * show iframe
         */

        console.log(buffer);
/*        let blober = new blob();
        blober.write(buffer);
        console.log(blober); */
        let url = buffer.toBlobURL("application/pdf");
        console.log(url);

        document.getElementById("step5_frame").src = url;
        currentStep++;
        updateStep();
    });

});

},1000);

/*
//TODO: this is where I'm testing turning a PDF into a buffer and then into a blobUrl
//const blob = require('blob-stream')
fetch("./test.pdf").then((Response) => {
    Response.arrayBuffer().then(function(buffer){
        console.log(buffer);
        let blober = new blob(buffer);
        console.log(blober);
        let url = blober.toBlobURL("application/pdf");
        console.log(url);

        document.getElementById("step5_frame").src = url;
        currentStep++;
        updateStep();
    });
});
*/
