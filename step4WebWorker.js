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
const blobStream = require("blob-stream");
const Report = require("fluentreports").Report;
const fontsToLoad = ["widelatin", "serif", "sans-serif", "ringbearer", "mplantin", "monospace", "impact", "cursive"];
const fontkit = require("fontkit");

module.exports = function(self){
    let callbacks = {};
    let step3Choices, cardBorder, overridePageData, template, spells;
    let fonts = {};
    let cancelStep4 = false, started = false;
    let schoolImgObjs = {};
    let nbeebz = [
        {x: 65.43333333333328, y: 30.799999999999997, width: 156, height: 32, fontStyle: "ringbearer", fontSize: 0, textAlign: "Left", text: "{title}"},
        {x: 135.43333333333328, y: 97.3, width: 76, height: 29, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{duration}"},
        {x: 221.43333333333328, y: 29.799999999999997, width: 55, height: 31, fontStyle: "widelatin", fontSize: 0, textAlign: "Left", text: "Lv {level}"},
        {x: 34.43333333333328, y: 223.8, width: 234, height: 131, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{description}"},
        {x: 133.43333333333328, y: 71.8, width: 82, height: 25, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{range}"},
        {x: 135.68333333333328, y: 124.55000000000001, width: 77.5, height: 24.5, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{casting}"},
        {x: 35.43333333333328, y: 354.8, width: 168, height: 50, fontStyle: "mplantin", fontSize: 0, textAlign: "Left", text: "{athigherlevel}"}
    ];
    let pageSize = {
        width: 612,
        height: 792
    };
    let pageData, pdfgen, previousWasFront = true;
    let scale = {
        w: 1,
        h: 1
    }, timeout = 0;

    self.addEventListener("message", function(event){
        if(event.data.type === "start"){
            step3Choices = event.data.step3Choices;
            cardBorder = event.data.cardBorder;
            overridePageData = event.data.overridePageData;
            template = event.data.template;
            spells = event.data.spells;
            loadAllFonts(0).then(function(){
                step4(event.data.step3FrontSrc, event.data.step3BackSrc);
            });
        }
        else if(event.data.type === "callback"){
            callbacks[event.data.id](event.data);
        }
    });

    function getArrayBuffer(item, id){
        return new Promise(function(cb){
            callbacks[id] = cb;
            self.postMessage({type: "fontArrayBuffer", url: item, id});
        });
    }

    function _loadFont(which){
        return new Promise(function(cb, rj){
            updateUser(true, "Loading font: " + which);
            getArrayBuffer("./fonts/" + which + ".ttf", "FONT_" + which).then((data) => {
                fonts[which] = fontkit.create(Buffer.from(data.ArrayBuffer), null);
                cb();
            }).catch(rj);
        });
    }

    function loadAllFonts(which){
        updateUser(false, "Loading fonts");
        return new Promise(function(cb, rj){
            _loadFont(fontsToLoad[which]).then(function(){
                if(which + 1 === fontsToLoad.length) cb();
                else loadAllFonts(which + 1).then(cb).catch(rj);
            });
        });
    }

    function replaceHTML(text){
        let items = ["p", "i", "b", "ul", "li"];
        text = text.replace(/<p>/g,"");
        text = text.replace(/<\/p>/g,"");
        text = text.replace(/<i>/g,"");
        text = text.replace(/<\/i>/g,"");
        text = text.replace(/<b>/g,"");
        text = text.replace(/<\/b>/g,"");
        text = text.replace(/<ul>/g,"");
        text = text.replace(/<\/ul>/g,"");
        text = text.replace(/<li>/g,"");
        text = text.replace(/<\/li>/g,"");
        text = text.replace(/&#39;/g, "'");
        return text;
    }

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
        tempSpell.description = replaceHTML(spell.description || "");
        tempSpell.atHigherLevel = replaceHTML(spell.atHigherLevel || "");
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

    function loadImg(link, id, context){
        if(!context) updateUser(true, "Loading image: " + link);
        else updateUser(true, context);
        return new Promise(function(cb, rj){
            callbacks[id] = cb;
            self.postMessage({type: "loadImg", link, id});
        });
    }

    function updateUser(detailed, display){
        if(detailed){
            if(typeof display === "string") self.postMessage({"type": "userUpdate", display, detailed});
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
                    index = (display.counter) % spells.length;
                    total = (pageData.cardCount.placed.front + pageData.cardCount.placed.back) + 1;
                }
                if(template && template.back && template.back.active){
                    text += `\\n{ frontSide:${display.front}, cardNumber:${total}`;
                    if(display.front) text += `, name: \\"${spells[index].name}\\" }`;
                    else text += ", name: null }";
                }
                else text += `\\nCurrent card: \\n{ ${spells[index].name} }`;
                self.postMessage({"type": "evalMe", "function": "step4_detailed.innerText = \"" + text + "\\n\";"});
            }
            else self.postMessage({"type": "evalMe", "function": "step4_detailed.style.display = \"none\""});
        }
        else self.postMessage({"type": "userUpdate", display, detailed});

    }

    function LinkCheck(url, id){
        return new Promise(function(cb){
            callbacks["LINK_" + id] = cb;
            self.postMessage({type: "linkCheck", url, id: "LINK_" + id});
        });
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
                loadImg("./images/nbeebzspellscards/" + spell.name.replace(/\//g, "_") + ".png", "SPELL_" + spell.name.replace(/\//g, "_"), `Loading image #${index}/${spells.length} for: ${spell.name.replace(/\//g, "_")}`).then(function(image){
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
                    await LinkCheck("./images/nbeebzspellscards/" + spell.name.replace(/\//g, "_") + ".png", spell.name.replace(/\//g, "_")).then(async function(data){
                        if(data.output){
                            //ADD CARD
                            pdfgen.template = [];
                            await addNbeebzCard(spell, i + j).catch(console.error);
                        }
                        else{
                            //GENERATE CARD
                            pdfgen.template = nbeebz;
                            template.cardSize = {width: 300, height: 420};
                            await addNewCard(i + j, true, schoolImgObjs[(spell.school || "none")].url).catch(console.error);
                        }
                    });
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
            self.postMessage({type: "done", "url": blob.toBlobURL("application/pdf")});
        });
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
            //Determine our preferred card size.
            let targetCardSize = {
                width: this.image.width,
                height: this.image.height
            };
            let aspectRatio = this.image.width / this.image.height;
            let normalCardSize = template.cardSize;
            //fix targetCardSize if the image is too big.
            if(targetCardSize.width > pageSize.width || targetCardSize.height > pageSize.height){
                //if they are both too big.
                if(targetCardSize.width > pageSize.width && targetCardSize.height > pageSize.height){
                    let distance = {
                        width: targetCardSize.width - pageSize.width,
                        height: targetCardSize.height - pageSize.height
                    };
                    //find out which one is too big the most.
                    if(distance.width > distance.height){
                        targetCardSize = {
                            width: pageSize.width,
                            height: pageSize.width / aspectRatio
                        };
                    }
                    else{
                        targetCardSize = {
                            width: pageSize.height * aspectRatio,
                            height: pageSize.height
                        };
                    }
                }
                //if just the width is too big
                else if(targetCardSize.width > pageSize.width){
                    targetCardSize = {
                        width: pageSize.width,
                        height: pageSize.width / aspectRatio
                    };
                }
                else{
                    targetCardSize = {
                        width: pageSize.height * aspectRatio,
                        height: pageSize.height
                    };
                }
            }
            //If we're overriding width OR height.
            if(overridePageData.width || overridePageData.height){
                //if we're only overriding ONE but not the other.
                if((overridePageData.width && !overridePageData.height) || (!overridePageData.width && overridePageData.height)){

                    if(overridePageData.width){
                        targetCardSize = {
                            width: overridePageData.width,
                            height: overridePageData.width / aspectRatio
                        };
                    }
                    else{
                        targetCardSize = {
                            width: overridePageData.height * aspectRatio,
                            height: overridePageData.height
                        };
                    }
                }
                //if we're overriding BOTH
                else{
                    targetCardSize = {
                        width: overridePageData.width,
                        height: overridePageData.height
                    };
                }
            }
            //If we have AUTO width/height but override col/rows
            if(overridePageData.width === 0 && overridePageData.horizontally !== 0){
                let minWidth = (pageSize.width / overridePageData.horizontally) - (cardBorder.thickness * 4);
                targetCardSize.width = (minWidth - (minWidth / 20));
            }
            if(overridePageData.height === 0 && overridePageData.vertically !== 0){
                let minHeight = (pageSize.height / overridePageData.vertically) - (cardBorder.thickness * 4);
                targetCardSize.height = (minHeight - (minHeight / 20));
            }
            //Remove border's thickness.
            if(!cardBorder.disable){
                targetCardSize.width -= (cardBorder.thickness * 4);
                targetCardSize.height -= (cardBorder.thickness * 4);
            }
            //Then determine scale
            scale = {
                x: 1 / (normalCardSize.width / targetCardSize.width), //420 * ? = 1200 | ? = 2.857 | (1 / ((420 / 1200) || 0.35) || 2.857)
                y: 1 / (normalCardSize.height / targetCardSize.height)
            };
            //Figure out how many rows/cols of cards we will have.
            let cardsHorizontally = overridePageData.horizontally || (Math.floor(pageSize.width / (normalCardSize.width * scale.x)));
            let cardsVertically = overridePageData.vertically || (Math.floor(pageSize.height / (normalCardSize.height * scale.y)));
            //If we somehow hit 0. Mininum is 0, don't change width/height due to it only going under due to user overriding it.
            cardsHorizontally = cardsHorizontally || 1;
            cardsVertically = cardsVertically || 1;
            //Detect margin.
            let leftoverHorizontal = pageSize.width - ((normalCardSize.width * scale.x) * cardsHorizontally);
            let leftoverVertical = pageSize.height - ((normalCardSize.height * scale.y) * cardsVertically);
            pageData = {
                targetCardSize,
                cardSize: normalCardSize,
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
            text = replaceHTML(text);
            return text;
        }

        async addCard(options, spell, front, image){
            if(front) pageData.cardCount.calculated.front++;
            else pageData.cardCount.calculated.back++;
            let margin = {x: 0, y: 0};
            if(options === true){//AUTO make card.
                margin = {
                    x: ((pageData.margin.perCard.x / 2) + (pageData.margin.perCard.x * ((pageData.cardsOnThisPage) % pageData.cardCount.horizontally))),
                    y: ((pageData.margin.perCard.y / 2) + (pageData.margin.perCard.y * (Math.floor(pageData.cardsOnThisPage / pageData.cardCount.horizontally))))
                };
                options = {
                    x: (pageData.cardEditingPos.x * pageData.cardSize.width),
                    y: (pageData.cardEditingPos.y * pageData.cardSize.height),
                    width: pageData.cardSize.width,
                    height: pageData.cardSize.height
                };
                if(!cardBorder.disable){
                    options.x -= (cardBorder.thickness);
                    options.y -= (cardBorder.thickness);
                }

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
                        width: (options.width * scale.x) || (200),
                        height: (options.height * scale.y) || (200)
                    },
                    "type": "image"
                }];
                if(front){
                    let replacedText;
                    let size = 50;
                    for(let i = 0; i < this.template.length; i++){
                        replacedText = this._getReplaced(this.template[i].text, spell);
                        if(this.template[i].fontSize !== 0) size = this.template[i].fontSize;
                        let data;
                        let size = this.template[i].fontSize * ((scale.x + scale.y) / 2);
                        if(!size){
                            size = 200;
                            let fit = false;
                            while(!fit){
                                data = await this._getLineData(replacedText, this.template[i].width * scale.x, this.template[i].height * scale.y, fonts[this.template[i].fontStyle], size, (i === 0 && size === 200));
                                if(data.failed) size -= size / 20;
                                else fit = true;

                                if(size < this.minFontSize){
                                    size = this.minFontSize;
                                    fit = true;
                                }
                            }
                        }
                        let x = ((options.x + this.template[i].x) * scale.x) + margin.x;
                        let y = ((options.y + this.template[i].y) * scale.y) + margin.y;
                        if(data.failed){
                            detail.push({
                                text: data.truncate,
                                "settings": {
                                    "textX": x,
                                    "textY": y,
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
                            y += (this.template[i].height * scale.y) / 2;
                            y -= data.height / 2;
                            if(this.template[i].textAlign.toLowerCase() === "center"){
                                x += (this.template[i].width * scale.x) / 2;
                                x -= (data.width / 2);
                            }
                            else if(this.template[i].textAlign.toLowerCase() === "right"){
                                x += (this.template[i].width * scale.x);
                                x -= data.width;
                            }
                            detail.push({
                                text: replacedText,
                                "settings": {
                                    x: ((options.x + this.template[i].x) * scale.x) + margin.x,
                                    y: ((options.y + this.template[i].y) * scale.y) + margin.y,
                                    "textX": x,
                                    "textY": y,
                                    "font": this.template[i].fontStyle,
                                    fontSize: size,
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
            this._counter = this._counter || 0;
            this.pageNumber = this.pageNumber || 0;
            pdfgen.updatePageData((pageData.cardCount.placeable > 1 ? (this._counter % pageData.cardCount.placeable) : (this._counter ? 1 : 0)));
            updateUser(true, {counter: this._counter, front: data[0].front, type: "pdf"});
            if(previousWasFront !== data[0].front || (pageData.cardsOnThisPage === pageData.cardCount.placeable && this._counter !== 0)){
                this.pageNumber++;
                await pdfgen._newPage(report);
            }
            previousWasFront = data[0].front;
            for(let i = 0; i < data.length; i++){
                let randoColor = "#" + Math.floor(Math.random() * (0xFFFFFF + 1));
                if(data[i].type === "image"){
                    if(!cardBorder.disable){
                        report.box(data[i].settings.x + 1, data[i].settings.y + 1, (data[i].settings.width - 2), (data[i].settings.height - 2), {
                            borderColor: "#FF000000",
                            thickness: cardBorder.thickness,
                            fill: cardBorder.color,
                            fillColor: cardBorder.color
                        });
                    }
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
            this._counter++;
            callback();
        }

        async finish(){
            return new Promise((cb) => {
                let keys = Object.keys(fonts);
                updateUser(false, "Physically adding cards to a PDF");
                let rpt = new Report(new blobStream(), {
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

    function step4(step3FrontSrc, step3BackSrc){
        let loaded = [false, !step3Choices.back, step3Choices.frontChoice !== "nbeebz"];
        //FRONT
        loadImg(step3FrontSrc, "FRONT", "Loading front side of card.").then(function(image){
            template.image = image;
            loaded[0] = true;
            if(loaded[0] && loaded[1] && loaded[2]) startCode();
        }).catch(console.error);
        //BACK
        if(step3Choices.back){
            loadImg(step3BackSrc, "BACK", "Loading back side of card.").then(function(image){
                template.back = {
                    active: true,
                    url: image.url
                };
                loaded[1] = true;
                if(loaded[0] && loaded[1] && loaded[2]) startCode();
            }).catch(console.error);
        }

        //SCHOOL
        let loadedSchoolImg = [false, false, false, false, false, false, false, false, false];
        let possibleSchools = ["abjuration", "enchantment", "conjuration", "illusion", "transmutation", "divination", "necromancy", "evocation", "none"];
        if(step3Choices.frontChoice === "nbeebz"){
            for(let i = 0; i < possibleSchools.length; i++){
                loadImg("./images/HighQuality/CardSides/template_" + possibleSchools[i] + ".png", "SCHOOL_" + possibleSchools[i], `Loading: template_${possibleSchools[i]}.png`).then(function(image){
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
    }
};
