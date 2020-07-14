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

cancelStep4 = false;
let loaded = [false, !step3Choices.back, step3Choices.frontChoice !== "nbeebz"];
let started = false;
let audio = new Audio("./Success.mp3");
function loadImg(link){
    return new Promise(function(cb, rj){
        let imageObj = new Image();
        imageObj.onload = function(){
            let canvas = document.createElement("canvas");
            canvas.width = imageObj.width;
            canvas.height = imageObj.height;
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            canvas.getContext("2d").drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
            let url = canvas.toDataURL().toString();
            canvas.remove();
            cb({
                url: url,
                width: imageObj.width,
                height: imageObj.height
            });
        };
        imageObj.src = link;
    });
}

//FRONT
loadImg(document.getElementById("step3_preview_front").src).then(function(image){
    template.image = image;
    loaded[0] = true;
    if(loaded[0] && loaded[1] && loaded[2]) startCode();
}).catch(console.error);
//BACK
if(step3Choices.back) loadImg(document.getElementById("step3_preview_back").src).then(function(image){
    template.back = {
        active: true,
        url: image.url
    };
    loaded[1] = true;
    if(loaded[0] && loaded[1] && loaded[2]) startCode();
}).catch(console.error);

//SCHOOL
let schoolImgObjs = {};
let loadedSchoolImg = [false, false, false, false, false, false, false, false, false];
let possibleSchools = ["abjuration", "enchantment", "conjuration", "illusion", "transmutation", "divination", "necromancy", "evocation", "none"];
if(step3Choices.frontChoice === "nbeebz"){
    for(let i = 0; i < possibleSchools.length; i++){
        let imageObj = new Image();
        loadImg("./images/nBeebz/template_" + possibleSchools[i] + ".png").then(function(image){
            schoolImgObjs[possibleSchools[i]] = image;
            loadedSchoolImg[i] = true;
            let allGood = true;
            for(let j = 0; j < loadedSchoolImg.length; j++){
                if(!loadedSchoolImg[j]){
                    allGood = false;
                    break;
                }
            }
            if(allGood) loaded[2] = true;
            if(loaded[0] && loaded[1] && loaded[2]) startCode();
        });
    }
}
let pageSize = {
    width: 612,
    height: 792
};
let pageData, pdfgen, previousWasFront = true;
let scale = {
    w: 1,
    h: 1
}, timeout = 0;
let step4_updates = document.getElementById("step4_updates");
let step4_detailed = document.getElementById("step4_detailed");

function updateUser(detailed, display){
    if(detailed){
        step4_detailed.style.display = "block";
        if(typeof display === "string") step4_detailed.innerText = display;
        else if(typeof display === "object"){
            let text = "";
            let index = 0;
            let total = 0;
            if(display.type === "math"){
                if(template && template.back && template.back.active){
                    if(display.front) text = `Calculating math for card ${pageData.cardCount.calculated.front + 1}/${spells.length}`;
                    else text = `Calculating math for backside of card #${pageData.cardCount.calculated.back + 1}`;
                }
                else text = `Calculating math for card ${display.index + 1}/${spells.length}`;
                index = display.index;
                total = (pageData.cardCount.calculated.front + pageData.cardCount.calculated.back) + 1;
            }
            if(display.type === "pdf"){
                if(template && template.back && template.back.active){
                    if(display.front) text = `Placing card ${pageData.cardCount.placed.front + 1}/${spells.length}`;
                    else text = `Placing backside of card #${pageData.cardCount.placed.back + 1}`;
                }
                else text = `Placing card ${pageData.cardCount.placed.front + 1}/${spells.length}`;
                index = (display.counter - 1) % spells.length;
                total = (pageData.cardCount.placed.front + pageData.cardCount.placed.back) + 1;
            }
            if(template && template.back && template.back.active){
                text += `\n{ frontSide:${display.front}, cardNumber:${total}`;
                if(display.front) text += `, name: "${spells[index].name}" }`;
                else text += ", name: null }";
            }
            else text += `\nCurrent card: \n{ ${spells[index].name} }`;
            step4_detailed.innerText = text + "\n";
        }
        else step4_detailed.style.display = "block";
    }
    else{
        step4_updates.style.display = "block";
        step4_updates.innerText = display;
        if(!display) step4_updates.style.display = "none";
    }
}

class PDFGen{
    constructor(template, options){
        this.template = template.details;
        this.image = template.image;
        this.data = [];
        this.detail = [];
        this.minFontSize = options && options.minFontSize || 8;
        this.updatePageData(0);
    }

    updatePageData(cardsPlaced){
        let cardSize = {
            width: this.image.width - (cardBorder.thickness * 4),
            height: this.image.height - (cardBorder.thickness * 4)
        };
        scale = {
            x: ((overidePageData.width || cardSize.width) / cardSize.width),
            y: ((overidePageData.height || cardSize.height) / cardSize.height)
        };
        if(overidePageData.width === 0 && overidePageData.horizontally !== 0){
            let minWidth = (pageSize.width / overidePageData.horizontally) - (cardBorder.thickness * 4);
            scale.x = 1 / (cardSize.width / (minWidth - (minWidth / 20)));
        }
        if(overidePageData.height === 0 && overidePageData.vertically !== 0){
            let minHeight = (pageSize.height / overidePageData.vertically) - (cardBorder.thickness * 4);
            scale.y = 1 / (cardSize.height / (minHeight - (minHeight / 20)));
        }
        let cardsHorizontally = overidePageData.horizontally || (Math.floor(pageSize.width / (cardSize.width * scale.x)));
        let cardsVertically = overidePageData.vertically || (Math.floor(pageSize.height / (cardSize.height * scale.y)));
        if(cardsHorizontally === 0 || cardsVertically === 0){
            if(cardsVertically === 0 && cardsHorizontally === 0){
                let distance = {
                    width: cardSize.width - pageSize.width,
                    height: cardSize.height - pageSize.height
                };
                if(distance.width > distance.height) cardsVertically = 1;
                else cardsHorizontally = 1;
            }
            if(cardsHorizontally === 0){
                scale.x = 1 / (cardSize.width / (pageSize.width - (pageSize.width / 20)));
                scale.y = scale.x;
                cardsHorizontally = 1;
            }
            else{
                scale.y = 1 / (cardSize.height / (pageSize.height - (pageSize.height / 20)));
                scale.x = scale.y;
                cardsVertically = 1;

            }
        }
        let leftoverHorizontal = pageSize.width - ((cardSize.width * scale.x) * cardsHorizontally);
        let leftoverVertical = pageSize.height - ((cardSize.height * scale.y) * cardsVertically);

        pageData = {
            cardSize: {
                width: cardSize.width,
                height: cardSize.height
            },
            cardCount: {
                horizontally: cardsHorizontally,
                vertically: cardsVertically,
                placeable: cardsHorizontally * cardsVertically,
                calculated: {
                    front: pageData ? pageData.cardCount.calculated.front : 0,
                    back: pageData ? pageData.cardCount.calculated.back : 0
                },
                placed: {
                    front: pageData ? pageData.cardCount.placed.front : 0,
                    back: pageData ? pageData.cardCount.placed.back : 0
                }
            },
            margin: {
                horizontally: leftoverHorizontal,
                vertically: leftoverVertical,
                perCard: {
                    x: leftoverHorizontal / cardsHorizontally,
                    y: leftoverVertical / cardsVertically
                }
            },
            cardEditingPos: {}
        };
        pageData.cardsOnThisPage = cardsPlaced;
        pageData.cardsPlaced = this.detail.length;
        pageData.cardEditingPos = {
            x: pageData.cardsOnThisPage % pageData.cardCount.horizontally,
            y: Math.floor(pageData.cardsOnThisPage / pageData.cardCount.horizontally)
        };
        return pageData;
    }

    async _getLineData(string, width, height, font, size, log){
        return new Promise(function(cb, rj){
            let spacing = (font.lineGap / 1000) * size;
            let softSplit = string.split(" ");
            let spaceGlyph = font.layout(" ").glyphs[0];
            let currentWidth = 0;
            let highestWidth = 0;
            let lineHeight = 0;
            let totalHeight = 0;
            let statsWhenNewWord = {};
            let lines = [""];
            let currentText = "";
            let overrideIndex = 0;
            let truncated = "";
            //Start going through each WORD (softSplit[i])
            for(let i = 0; i < softSplit.length; i++){
                let glyphs = font.layout(softSplit[i]).glyphs;
                statsWhenNewWord = {
                    height: lineHeight,
                    width: currentWidth,
                    string: currentText
                };
                //if we are currently editing a line
                if(currentText.length){
                    currentText += " ";
                    currentWidth += ((spaceGlyph.advanceWidth / 1000) * size);
                    if(lineHeight < ((spaceGlyph.advanceHeight / 1000) * size)) lineHeight = ((spaceGlyph.advanceHeight / 1000) * size);
                    //if adding that space, makes it too big
                    if(currentWidth > width){
                        i--;
                        if(highestWidth < statsWhenNewWord.width) highestWidth = statsWhenNewWord.width;
                        totalHeight += statsWhenNewWord.height + spacing;
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
                        continue;
                    }
                }

                //go through each LETTER of the current word;
                for(let g = overrideIndex; g < glyphs.length; g++){
                    if(totalHeight < height){
                        truncated = (lines.join(" ") + currentText);
                        truncated = truncated.substring(0, truncated.length - 3);
                        truncated += "...";
                    }
                    //if we can add the letter to the line without going over.
                    if(currentWidth + ((glyphs[g].advanceWidth / 1000) * size) < width){
                        currentWidth += ((glyphs[g].advanceWidth / 1000) * size);
                        if(lineHeight < ((glyphs[g].advanceHeight / 1000) * size)) lineHeight = ((glyphs[g].advanceHeight / 1000) * size);
                        currentText += softSplit[i][g];
                    }
                    //if we can't add it.
                    else{
                        //if this is the first letter of the line. The font size is WAYYY too big.
                        if(g === 0 && !currentText.length){
                            //FontSize is too big. Single letters are too big for the width.
                            cb({
                                truncate: truncated,
                                failed: true,
                                code: "tooBig",
                                averageLineHeight: 1000,
                                width: 1000,
                                height: 1000
                            });
                        }
                            //SOFT WRAPPING
                        //if we've edited more than one word
                        else if(statsWhenNewWord.string.length){
                            i--;
                            if(highestWidth < statsWhenNewWord.width) highestWidth = statsWhenNewWord.width;
                            totalHeight += statsWhenNewWord.height + spacing;
                            currentWidth = 0;
                            lineHeight = 0;
                            currentText = "";
                            lines[lines.length - 1] = statsWhenNewWord.string;
                            statsWhenNewWord = {
                                height: 0,
                                width: 0,
                                string: ""
                            };
                            lines.push("");
                            overrideIndex = 0;
                            break;
                        }
                            //HARD WRAP
                        // if this is just ONE big word
                        else{
                            if(!lines[lines.length - 1].length){
                                //The current line is empty so there is really no point in wrapping.
                                cb({
                                    truncate: truncated,
                                    failed: true,
                                    code: "lineEmpty",
                                    averageLineHeight: 1000,
                                    width: 1000,
                                    height: 1000
                                });
                                return;
                            }
                            i--;
                            overrideIndex = g;
                            if(highestWidth < statsWhenNewWord.width) highestWidth = currentWidth;
                            totalHeight += lineHeight + spacing;
                            lines[lines.length - 1] = currentText;
                            currentWidth = 0;
                            lineHeight = 0;
                            currentText = "";
                            lines.push("");
                            break;
                        }
                    }
                }
            }
            if(highestWidth < currentWidth) highestWidth = currentWidth;
            totalHeight += lineHeight + spacing;
            lines[lines.length - 1] = currentText;
            cb({
                truncate: truncated,
                failed: totalHeight > height,
                linesCount: lines.length,
                lines,
                averageLineHeight: totalHeight / lines.length,
                width: highestWidth,
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

    async addCard(options, spell, front, image){
        if(front) pageData.cardCount.calculated.front++;
        else pageData.cardCount.calculated.back++;
        let margin = {x:0,y:0};
        if(options === true){//AUTO make card.
            margin = {
                x: ((pageData.margin.perCard.x / 2) + (pageData.margin.perCard.x * ((pageData.cardsOnThisPage) % pageData.cardCount.horizontally))),
                y: ((pageData.margin.perCard.y / 2) + (pageData.margin.perCard.y * (Math.floor(pageData.cardsOnThisPage / pageData.cardCount.horizontally))))
            }
            options = {
                x: (pageData.cardEditingPos.x * pageData.cardSize.width),
                y: (pageData.cardEditingPos.y * pageData.cardSize.height),
                width: pageData.cardSize.width,
                height: pageData.cardSize.height
            };

            //Make the options.(x/y) act like they aren't scaled.
            options.x -= (cardBorder.thickness);
            options.y -= (cardBorder.thickness);
            options.x / scale.x;
            options.y / scale.y;

        }
        if(spell) spell = getCustomSpell(spell);
        return new Promise(async(cb) => {
            if(cancelStep4) cb(false);
            options = options || {};
            let detail = [{
                "image": image || (front ? this.image.url : template.back.url),
                "settings": {
                    x: (options.x * scale.x) + margin.x || 0,
                    y: (options.y * scale.y) + margin.y || 0,
                    width: (options.width * scale.x) || (this.image.width * scale.x),
                    height: (options.height * scale.y) || (this.image.height * scale.y)
                },
                "type": "image",
                front
            }];
            if(front){
                let replacedText;
                let size = 50;
                for(let i = 0; i < this.template.length; i++){
                    replacedText = this._getReplaced(this.template[i].text, spell);
                    if(this.template[i].fontSize !== 0) size = this.template[i].fontSize;
                    let data;
                    let size = this.template[i].fontSize;
                    if(!size){
                        size = 200;
                        let fit = false;
                        while(!fit){
                            data = await this._getLineData(replacedText, this.template[i].width, this.template[i].height, fonts[this.template[i].fontStyle], size, i === 6);

                            if(data.failed) size -= size / 20;
                            else fit = true;

                            if(size < this.minFontSize){
                                //error("Minimum size...", this.template[i].text, " | ", i);
                                size = this.minFontSize;
                                fit = true;
                            }
                        }
                    }
                    let x = options.x + this.template[i].x;
                    let y = options.y + this.template[i].y;
                    if(data.failed){
                        detail.push({
                            text: data.truncate,
                            "settings": {
                                x: (x * scale.x) + margin.x,
                                y: (y * scale.y) + margin.y,
                                "textX": (x * scale.x) + margin.x,
                                "textY": (y * scale.y) + margin.y,
                                "font": this.template[i].fontStyle,
                                fontSize: size * ((scale.x + scale.y) / 2),
                                "align": this.template[i].textAlign,
                                width: this.template[i].width * scale.x,
                                height: this.template[i].height * scale.y
                            },
                            type: "text",
                            front
                        });
                    }
                    else{
                        if(this.template[i].textAlign.toLowerCase() === "center"){
                            x += this.template[i].width / 2;
                            x -= data.width / 2;
                            y += this.template[i].height / 2;
                            y -= data.height / 2;
                        }
                        else if(this.template[i].textAlign.toLowerCase() === "right"){
                            x += this.template[i].width;
                            x -= data.width;
                            y += this.template[i].height;
                            y -= data.height;
                        }
                        detail.push({
                            text: replacedText,
                            "settings": {
                                x:( (options.x + this.template[i].x) * scale.x) + margin.x,
                                y: ((options.y + this.template[i].y) * scale.y) + margin.y,
                                "textX": (x * scale.x) + margin.x,
                                "textY":(y * scale.y) + margin.y,
                                "font": this.template[i].fontStyle,
                                fontSize: size * ((scale.x + scale.y) / 2),
                                "align": this.template[i].textAlign,
                                width: this.template[i].width * scale.x,
                                height: this.template[i].height * scale.y
                            },
                            type: "text",
                            front
                        });
                    }
                }
            }
            this.detail.push(detail);
            cb();
        });
    }

    async _print(report, text, settings){
        return new Promise(function(cb, rj){
            report.print(text, settings, cb);
        });
    }

    async _newPage(report){
        return new Promise(function(cb, rj){
            report.newPage(null, cb);
        });
    }

    async _displayDetail(report, data, state, callback){
        this._counter = this._counter + 1 || 1;
        updateUser(true, {counter: this._counter, front: data[0].front, type: "pdf"});
        if(previousWasFront !== data[0].front || ((pageData.cardsOnThisPage + 1) === pageData.cardCount.placeable && this._counter !== 1)){
            this.pageNumber = this.pageNumber + 1 || 1;
            await pdfgen._newPage(report);
        }
        previousWasFront = data[0].front;
        for(let i = 0; i < data.length; i++){
            let randoColor = "#" + Math.floor(Math.random() * (0xFFFFFF + 1));
            if(data[i].type === "image"){
                report.box(data[i].settings.x, data[i].settings.y, data[i].settings.width, data[i].settings.height, {
                    borderColor: "#FF000000",
                    thickness: cardBorder.thickness,
                    fill: cardBorder.color,
                    fillColor: cardBorder.color
                });
                report.image(data[i].image, {
                    x: data[i].settings.x,
                    y: data[i].settings.y,
                    width: data[i].settings.width,
                    height: data[i].settings.height
                });
            }
            else if(data[i].type === "text"){
                await pdfgen._print(report, data[i].text, {
                    x: data[i].settings.textX,
                    y: data[i].settings.textY,
                    "font": data[i].settings.font,
                    fontSize: data[i].settings.fontSize,
                    "align": data[i].settings.align,
                    width: data[i].settings.width
                });
            }
        }
        if(data[0].front) pageData.cardCount.placed.front++;
        else pageData.cardCount.placed.back++;
        callback();
    }

    async finish(){
        return new Promise((cb) => {
            updateUser(false, "");
            let keys = Object.keys(fonts);
            let blober = new blob();
            updateUser(false, "Physically adding cards to a PDF");
            let rpt = new Report(blober, {
                landscape: false,
                fonts: fonts,
                margins: {top: 0, bottom: 0, left: 0, right: 0}
            })
                .paper("letter")
                .autoPrint(false)
                .data(this.detail)
                .detail(this._displayDetail);
            for(let i = 0; i < keys.length; i++){
                rpt.registerFont(keys[i], {
                    normal: fonts[keys[i]].stream.buffer
                });
            }
            rpt.render(function(err, output){
                updateUser(false, "Getting ready to show PDF");
                updateUser(true, "");
                cb(output);
            });
        });
    }
}

function LinkCheck(url){
    var http = new XMLHttpRequest();
    http.open("HEAD", url, false);
    http.send();
    return http.status != 404;
}

function addNewCard(index, front, image){
    updateUser(true, {front, index, "type": "math"});
    return new Promise(function(cb, rj){
        if(cancelStep4) cb(true);
        if(spells[index]) pdfgen.addCard(true, spells[index], front, image).then(cb).catch(rj);
        else cb(true);
    });
}

function addNbeebzCard(spell, index){
    return new Promise(function(cb, rj){
        if(cancelStep4) cb();
        if(spell){
            loadImg("./images/nbeebzspellscards/" + spell.name.replace(/\//g, "_") + ".png").then(function(image){
                addNewCard(index, true, image.url).then(cb).catch(rj);
            }).catch(rj);
        }
        else cb(true);
    });
}

async function startCode(){
    if(cancelStep4) return;
    if(started) return;
    started = true;
    updateUser(false, "Starting things up.");
    pdfgen = new PDFGen(template, {
        minFontSize: 8
    });
    updateUser(false, "Calculating math for cards.");
    let placeable = pageData.cardCount.placeable;
    for(let i = 0; i < spells.length; i += placeable){
        if(cancelStep4) break;
        //FRONT
        for(let j = 0; j < ((spells.length - i) > placeable ? placeable : (spells.length - i)); j++){
            if(cancelStep4) break;
            pdfgen.updatePageData(j);
            if(step3Choices.frontChoice !== "nbeebz"){ await addNewCard(i + j, true).catch(console.error);}
            else{
                let spell = spells[i + j];
                if(LinkCheck("./images/nbeebzspellscards/" + spell.name.replace(/\//g, "_") + ".png")){
                    //ADD CARD
                    pdfgen.template = [];
                    await addNbeebzCard(spell, i + j).catch(console.error);
                }
                else{
                    //GENERATE CARD
                    pdfgen.template = nbeebz;
                    await addNewCard(i + j, true, schoolImgObjs[(spell.school || "none")].url).catch(console.error);
                }
            }
        }
        //BACK
        if(template.back && template.back.active){
            for(let j = 0; j < ((spells.length - i) > placeable ? placeable : (spells.length - i)); j++){
                if(cancelStep4) break;
                pdfgen.updatePageData(j);
                await addNewCard(i + j, false);
            }
        }
    }
    pdfgen.finish().then(function(blob){
        if(cancelStep4) return;
        document.getElementById("step5_frame").src = blob.toBlobURL("application/pdf");
        audio.play();
        currentStep++;
        updateStep();
    });
}
