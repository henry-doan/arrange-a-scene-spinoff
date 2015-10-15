/*************************************
 * Add the images to the scene and
 * position them using translations.
 * 
 * Once an item is on the grid,
 * you can select it by click on it.
 * 
 * Allow reordering of elements
 * Block mouseover of lower elements
**************************************/

var BACKGROUND = color(250, 250, 250);
var BLUE = color(64, 95, 237);
var PINK = color(255, 0, 175);
var GREEN = color(28, 173, 123);
var ORANGE = color(255, 165, 0);
var GREY = color(60, 60, 70);
var GRIDGREY = color(205, 225, 205, 128
);
var GRIDGREY2 = color(160, 180, 160, 128);
var TEXTCOL = color(20, 20, 20);
var TOOLBAR = color(255, 255, 255);
var CS_GREEN = color(67, 122, 57);

// Colour of initial image
var START_COL = BLUE;
// Colour of transformed image
var END_COL = GREEN;
// Colour used for transformation values
var TRANS_COL = PINK;

var sansFont = createFont("sans", 15);
var serifFont = createFont("serif", 14);
var impactFont = createFont("impact", 72);
var tickMark = String.fromCharCode(0x2714);
var crossMark = String.fromCharCode(0x2718);
var stampSound = getSound("rpg/battle-swing");

// Objects
var grid;

var showing = {
    Grid: false,
    Floor: true,
    'Initial image': true,
   // Guide: false
};

var TRANSFORMATIONS = [
    "translate",
    "scale",
    "rotate",
];

/*************************************
 * Object to deal with different
 * image types
**************************************/

var Img = function(width, height, drawF, name) {
    this.width = width;
    this.height = height;
    this.draw = drawF;
    this.name = name;
};

var sprites = {
    Lamp: getImage("pixar/lamp"),
    Luxoball: getImage("pixar/luxoball"),
    Bed: getImage("pixar/bedspread"),
    Buzz: getImage("pixar/buzz"),
    BoPeep: getImage("pixar/bopeep"),
    Ham: getImage("pixar/ham"),
};

var images = [
    new Img(64, 64, function(x, y, w, h) {
        stroke(183, 186, 158);
        fill(240, 243, 214);
        strokeWeight(1);
        ellipse(x + w / 4 - 1, y + h / 2, w / 16 + 1, w * 3 / 32);
        strokeWeight(2);
        rect(x + w / 4, y + h / 16, w * 0.68, h * 7/8, 1);
    }, "Nightstand"),
    new Img(128, 80, function(x, y, w, h) {
        stroke(183, 186, 158);
        fill(240, 243, 214);
        strokeWeight(1);
        ellipse(x + w * 0.2, y + h * 0.15 - 1, 6, 5);
        ellipse(x + w * 0.8, y + h * 0.15 - 1, 6, 5);
        strokeWeight(2);
        rect(x + 3, y + h * 0.15, w - 6, h * 0.8, 1);
    }, "Dresser"),
    new Img(40, 40, function(x, y, w, h) {
        image(sprites.Lamp, x, y, w, h);
    }, "Lamp"),
    new Img(50, 50, function(x, y, w, h) {
        pushMatrix();
        translate(x + w/2, y + h / 2);
        rotate(-120);
        image(sprites.Luxoball, -w/2, -h/2, w, h);
        popMatrix();
    }, "Luxoball"),
    new Img(80, 60, function(x, y, w, h) {
        pushMatrix();
        translate(x + w, y - h / 6);
        rotate(90);
        image(sprites.Bed, 0, 0, w, h * 4 / 3);
        popMatrix();
    }, "Bed"),
    new Img(96, 96, function(x, y, w, h) {
        image(sprites.Buzz, x, y, w, h);
    }, "Buzz"),
    new Img(96, 96, function(x, y, w, h) {
        image(sprites.BoPeep, x, y, w, h);
    }, "Bo Peep"),
    new Img(96, 96, function(x, y, w, h) {
        image(sprites.Ham, x, y, w, h);
    }, "Ham"),
];

/*************************************
 * Correct positions for this version
**************************************/

var target = {
    Nightstand: {
        translate: [28, 16]
    },
    Dresser: {
        translate: [12, 0]
    },
    Lamp: {
        translate: [29, 17],
        alternative: [17, 1]
    },
    Luxoball: {
        translate: [26, 20],
        scale: [0.75, 0.75]
    },
    Bed: {
        translate: [22, 9],
        scale: [2, 2]
    },
    Buzz: {
        translate: [16, 16],
        scale: [0.75, 0.75],
        rotate: 70
    },
    'Bo Peep': {
        translate: [24, 10],
        scale: [0.5, 0.5],
        rotate: 30
    },
};

// Index of each existing item in images array
var existingItems = [0, 1, 2, 3, 4];

// Find which items can be added to this scene
var findUnneededItems = function() {
    var verbs = {
        translate: "translation",
        scale: "scaling",
        rotate: "rotating",
    };
    
    for (var item in target) {
        target[item].notNeeded = false;
        
        for (var i = 0; i < existingItems.length; i++) {
            if (item === images[existingItems[i]].name) {
                target[item].notNeeded = item + ": is already in the scene, so we don't need another one.";
                break;
            }
        }
        
        for (var trans in target[item]) {
            if (verbs[trans] && TRANSFORMATIONS.indexOf(trans) === -1) {
                target[item].notNeeded = item + ": requires " + verbs[trans] + ", so remove it for now.";
                break;
            }
        }
    }
};
findUnneededItems();

/*************************************
 *      Helper functions
**************************************/
{
var roundStr = function(n) {
    return "" + (round(n * 100) / 100);
};

// Write a array of text with values for size and dy
// Returns the x value of the end of the text
var writeText = function(txtArray, x, y) {
    for (var i = 0; i < txtArray.length; i++) {
        var t = txtArray[i];
        var txt = t.txt;
        var ty = y + (t.dy || 0);
        
        if (t.size) {
            textSize(t.size);    
        }
        
        if (t.col) {
            fill(t.col);    
        } else {
            fill(20);
        }
        
        text(t.txt, x, ty);
        x += textWidth(txt);
    }
    return x;
};

var multiplyMatrices = function(m1, m2) {
    var newMatrix = [];

    for (var i = 0; i < 3; i++) {
        var row = [];
        
        for (var j = 0; j < 3; j++) {
            var v = 0;
            
            for (var k = 0; k < 3; k++) {
                v += m1[i][k] * m2[k][j];
            }
            
            row.push(v);
        }
        
        newMatrix.push(row);
    }
    
    return newMatrix;
};

// Assume everything has 2 dimensions
var dotProduct = function(v1, v2){
    return v1[0] * v2[0] + v1[1] * v2[1];
};

var subtractVectors = function(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
};

var _applyMatrix = function(m, x, y) {
    return [
    x * m[0][0] + y * m[0][1] + m[0][2],
    x * m[1][0] + y * m[1][1] + m[1][2]];
};

var pointInQuadrilateral = function(point, quadPoints) {
    var v1 = subtractVectors(quadPoints[1], quadPoints[0]);
    var v2 = subtractVectors(quadPoints[2], quadPoints[0]);
    var v3 = subtractVectors(quadPoints[3], quadPoints[0]);
    var vp = subtractVectors(point, quadPoints[0]);
    
    // Calculate dot products
    var dot11 = dotProduct(v1, v1);
    var dot12 = dotProduct(v1, v2);
    
    var dot22 = dotProduct(v2, v2);
    
    var dot33 = dotProduct(v3, v3);
    var dot32 = dotProduct(v3, v2);
    
    var dot1p = dotProduct(v1, vp);
    var dot2p = dotProduct(v2, vp);
    var dot3p = dotProduct(v3, vp);
    
    // Calculate barycentric coordinates of two triangles
    var d = 1 / (dot11 * dot22 - dot12 * dot12);
    var u = (dot22 * dot1p - dot12 * dot2p) * d;
    var v = (dot11 * dot2p - dot12 * dot1p) * d;
    
    var d2 = 1 / (dot33 * dot22 - dot32 * dot32);
    var u2 = (dot22 * dot3p - dot32 * dot2p) * d2;
    var v2 = (dot33 * dot2p - dot32 * dot3p) * d2;
    
    return (u >= 0 && v >= 0 && u + v < 1) || (u2 >= 0 && v2 >= 0 && u2 + v2 < 1);
};
}
/**************************************
 *  GUI Button
***************************************/
{
var Button = function(x, y, w, h, name, clickFunction) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.name = name;
    this.defaultCol = color(220, 220, 220, 250);
    this.showing = true;
    this.box = this.h - 6;
    this.clickFunction = clickFunction;
    
    this.corner = 8;
};

Button.prototype.mouseOver = function() {
    return (mouseX >= this.x && mouseX <= this.x + this.w &&
            mouseY >= this.y && mouseY <= this.y + this.h);
};

Button.prototype.click = function() {
    if (this.clickFunction) {
        this.clickFunction();
    }
};

Button.prototype.mouseReleased = function() {
    if (this.showing && this.mouseOver()) {
        this.click();
        this.selected = false;
        return true;
    }
};

Button.prototype.mousePressed = function() {
    if (this.mouseOver()) {
        this.selected = true;
    }
};

Button.prototype.draw = function() {
    if (!this.showing) { return; }
    
    if (this.disabled) {
        fill(200);
    } else if (this.mouseOver() || this.selected) {
        fill(this.defaultCol);
    } else {
        noFill();
    }
    
    strokeWeight(1);
    stroke(200);
    rect(this.x, this.y - 1, this.w, this.h + 3, this.corner);
    
    if (this.disabled) {
        fill(120);
    } else {
        fill(20);
    }
    
    textSize(15);
    textAlign(CENTER, CENTER);
    textFont(sansFont);
    text(this.name, this.x + this.w / 2, this.y + this.h/2 + 1);
};

var CheckBox = function(x, y, w, h, name) {
    Button.call(this, x, y, w, h, name);
    this.box = this.h - 6;
    this.bx = this.x + 5;
    this.by = this.y + 3;
};
CheckBox.prototype = Object.create(Button.prototype);

CheckBox.prototype.click = function() {
    showing[this.name] = !showing[this.name];  
};

CheckBox.prototype.draw = function() {
    if (!this.showing) { return; }
    
    noStroke();
    if (this.mouseOver() || this.selected) {
        fill(this.highlightCol);
        rect(this.x, this.y, this.w, this.h + 1, 5);
    } else {
        noFill();
    }
    
    fill(10);
    textSize(14);
    textFont(sansFont);
    textAlign(LEFT, CENTER);
    text(this.name, this.x + this.box + 9, this.y + this.h/2);
    
    noFill();
    stroke(10);
    strokeWeight(1);
    rect(this.bx, this.y + 3, this.box, this.box);
    
    if (showing[this.name]) {
        line(this.bx + 1, this.by + 1,
             this.bx + this.box, this.by + this.box);
        line(this.bx + this.box, this.by + 1, this.bx + 1, this.by + this.box);
    }
};
}
/**************************************
 *      Number scrubber object
 * Shows a number with up and down arrow buttons to 
 * change the value
**************************************/
{
var Scrubber = function(x, y, w, h, values, updateF) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.font = createFont("serif", h);
    this.fontSize = h * 0.8;
    
    this.index = values.now || 0;
    if (values.options) {
        this.mapping = values.options;
        this.value = this.mapping[this.index];
        this.min = 0;
        this.max = this.mapping.length - 1;
    } else if (values.range) {
        this.min = values.range[0];
        this.max = values.range[1];
        this.value = this.index;
    }
    
    this.updateFunction = updateF;
    this.selected = false;
    this.t = 0;
};

Scrubber.prototype.draw = function(x, y) {
    if (x) { this.x = x; }
    if (y) { this.y = y; }
    
    // Box
    stroke(200);
    fill(255);
    strokeWeight(1);
    rect(this.x, this.y - 1, this.w - 1, this.h + 1, 8);
    
    // Text
    textFont(this.font, this.fontSize);
    textAlign(CENTER, BASELINE);
    fill(TRANS_COL);
    
    var ty = this.y + textAscent() + 4;
    text("" + this.value, this.x + this.w / 2, ty);
    
    // Arrow buttons
    var mouseover = this.mouseOver();
    if (this.selected === 1 || mouseover === 1) {
        fill(ORANGE);
        stroke(ORANGE);
    } else {
        fill(BACKGROUND);
        stroke(200);
    }
    
    triangle(this.x + 3, this.y - 3,
             this.x + this.w - 3, this.y - 3,
             this.x + this.w / 2, this.y - 12);
    
    if (this.selected === 2 || mouseover === 2) {
        fill(ORANGE);
        stroke(ORANGE);
    } else {
        noFill();
        stroke(200);
    }
    
    triangle(this.x + 3, this.y + this.h + 3,
             this.x + this.w - 3, this.y + this.h + 3,
             this.x + this.w / 2, this.y + this.h + 12);
};

Scrubber.prototype.updateValue = function() {
    if (this.selected) {
        // Click on first mouse down, then pause, then every 4 frames
        if ((this.t % (this.t < 16 ? 16 : 4)) === 0) {
            if (this.selected === 1) {
                this.index = min(this.index + 1, this.max);
            } else if (this.selected === 2) {
                this.index = max(this.index - 1, this.min);
            }
    
            this.mapValue();
            this.update();
        }
        this.t++;
    }
};

Scrubber.prototype.mapValue = function() {
    if (this.mapping) {
        this.value = this.mapping[this.index];
    } else {
        this.value = this.index;
    }
};

Scrubber.prototype.setValue = function(n) {
    this.value = n;
    if (this.mapping) {
        this.index = this.mapping.indexOf(this.value);
    } else {
        this.index = this.value;
    }
};

// Return 1 or 2 if mouse over top or
// bottom arrow respectively.
// Otherwise return null
Scrubber.prototype.mouseOver = function() {
    if (mouseX >= this.x + 3 && mouseX <= this.x + this.w - 3) {
        if (mouseY >= this.y - 12 && mouseY <= this.y) {
            return 1;
        } else if (mouseY >= this.y + this.h && mouseY <= this.y + this.h + 12) {
            return 2;
        }
    }
};

Scrubber.prototype.mousePressed = function() {
    this.selected = this.mouseOver();
};

Scrubber.prototype.mouseReleased = function() {
    this.selected = false;
    this.t = 0;
};

Scrubber.prototype.click = function() {
    this.selected = this.mouseOver();
    this.updateValue();
};

Scrubber.prototype.update = function() {
    if (this.updateFunction) {
        this.updateFunction(this.value);
    }
};
}
/*************************************
 *      Image Carousel object
 * Basically a horizontal number
 * scrubber, but showing images
**************************************/
{
var Carousel = function(x, y, w, h, images, updateF) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.bh = h;
    this.h = h + 20;
    
    this.index = 0;
    this.images = images;
    this.min = 0;
    this.max = images.length;
    this.value = this.index;
    
    this.updateFunction = updateF;
    this.selected = false;
};
Carousel.prototype = Object.create(Scrubber.prototype);

Carousel.prototype.draw = function() {
    // Box
    var dx = 16;
    var dy = 3;
    stroke(200);
    fill(background);
    strokeWeight(1);
    rect(this.x + dx, this.y + 24, this.w - dx * 2, this.bh, 8);
    
    var tx = this.x + this.w / 2;
    var ty = this.y + this.bh / 2 + 24;
    var img = this.images[this.index];
        
    if (img.name) {
        rect(this.x + dx, this.y, this.w - dx * 2, 21, 8);
        
        fill(TEXTCOL);
        textAlign(CENTER, BASELINE);
        textFont(sansFont);
        text(img.name, tx, this.y + 16);
    }
    
    // Centred and scaled image
    var _scale = min(64 / img.width, 64 / img.height);
    var w = _scale * img.width;
    var h = _scale * img.height;
    img.draw(tx - w / 2, ty - h / 2, w, h);
    
    // Arrow buttons
    var mouseover = this.mouseOver();
    if (this.selected === 1 || mouseover === 1) {
        fill(ORANGE);
        noStroke();
    } else {
        fill(BACKGROUND);
        stroke(200);
    }
    
    triangle(this.x + 2, ty,
             this.x + dx - 3, this.y + dy + 24,
             this.x + dx - 3, this.y + this.bh - dy + 24);
    
    if (this.selected === 2 || mouseover === 2) {
        fill(ORANGE);
        noStroke();
    } else {
        fill(BACKGROUND);
        stroke(200);
    }
    
    triangle(this.x + this.w - 2, ty,
             this.x + this.w - dx + 3, this.y + dy + 24,
             this.x + this.w - dx + 3, this.y + this.bh - dy + 24);
};

// Return 1 or 2 if mouse over top or bottom
// arrow respectively. Otherwise return null
Carousel.prototype.mouseOver = function() {
    if (mouseY >= this.y && mouseY <= this.y + this.h) {
        if (mouseX >= this.x && mouseX <= this.x + 16) {
            return 1;
        } else if (mouseX >= this.x + this.w - 16 && mouseX <= this.x + this.w) {
            return 2;
        }
    }
};

Carousel.prototype.updateValue = function() {
    if (this.selected === 1) {
        this.index = (this.index - 1 + this.max) % this.max;
    } else if (this.selected === 2) {
        this.index = (this.index + 1) % this.max;
    }

    this.mapValue();
    this.update();
};
}
/*************************************
 *      Toolbar
 *  Contains other GUI elements
**************************************/
{
var Toolbar = function(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = 6;
    
    this.buttons = [];
    this.sliders = [];
};

Toolbar.prototype.draw = function() {
    noStroke();
    fill(TOOLBAR);
    
    noFill();
    strokeWeight(1);
    stroke(200);
    
    rect(this.x, this.y, this.w, this.h, 8);
   
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].draw();
    }
    
    for (var i = 0; i < this.sliders.length; i++) {
        this.sliders[i].draw();
    }
};

Toolbar.prototype.addButton = function(name, func) {
    var h = 18;
    var x = this.x + 5;
    var y = this.y + this.h;
    var w = this.w - 10;
    
    this.buttons.push(new Button(x, y, w, h, name, func));
    this.h += h + 8;
};

Toolbar.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].x += dx;
        this.buttons[i].y += dy;
    }
    
    for (var i = 0; i < this.sliders.length; i++) {
        this.sliders[i].x += dx;
        this.sliders[i].y += dy;
    }
};

Toolbar.prototype.toBottom = function(d) {
    // Move to d units from the bottom of the screen
    var dy = (height - d) - (this.y + this.h);
    this.move(0, dy);
};

Toolbar.prototype.toTop = function(d) {
    // Move to d units from the top of the screen
    this.move(0, d - this.y);
};

/*
Toolbar.prototype.addSlider = function(minX, maxX, nowX, name, updateF) {
    var h = 16;
    var x = this.x + 15;
    var y = this.h + h;
    var w = this.w - 30;
    
    if (name) {
        y += 18;
        this.h += 18;
    }
    
    this.sliders.push(new Slider(x, y, w, minX, maxX, nowX, name, updateF));
    
    this.h += h + 5;
};
*/
Toolbar.prototype.addScrubber = function(nowValue, values, updateF) {
    var h = 18;
    var x = this.x + 5;
    var y = this.y + this.h + h / 2;
    var w = this.w - 10;
    
    this.buttons.push(new Scrubber(x, y, w, h, nowValue, values, updateF));
    this.h += h + 8;
};

Toolbar.prototype.addCarousel = function(images) {
    var h = 70;
    var x = this.x + 5;
    var y = this.y + this.h;
    var w = this.w - 10;
    
    this.buttons.push(new Carousel(x, y, w, h,images));
    this.h += h + 32;
};

Toolbar.prototype.addOptions = function(options) {
    var x = this.x + 3;
    var y = this.y + this.h;
    var w = this.w - 6;
    var h = 22;
    
    for (var opt in options) {
        this.buttons.push(new CheckBox(x, y, w, h, opt));
        y += 28;
        this.h += 28;
    }
    
};

Toolbar.prototype.mousePressed = function() {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].mousePressed();
    }
    
    for (var i = 0; i < this.sliders.length; i++) {
        this.sliders[i].selected();
    }
};

Toolbar.prototype.mouseReleased = function() {
    for (var i = 0; i < this.buttons.length; i++) {
        var button = this.buttons[i];
        if (button.selected && button.mouseOver()) {
            button.click();
        }
        button.selected = false;
    }
    for (var i = 0; i < this.sliders.length; i++) {
        this.sliders[i].held = false;
    }
};

Toolbar.prototype.mouseDragged = function() {
    for (var i = 0; i < this.sliders.length; i++) {
        if (this.sliders[i].drag()) {
            return true;
        }
    }
};
}
/*************************************
 *      Transformation object
 * A transformation applied to an item.
 * Displayed as a box with number scrubbers.
**************************************/
{
var Transformation = function(item, x, y, n) {
    this.item = item;
    this.x = x;
    this.y = y;
    this.n = n;
    
    this.minWidth = 175;
    this.w = this.minWidth;
    this.h = 100;
    this.scrubbers = [];
    this.values = [0, 0];
    this.update = item.update.bind(item);
};

Transformation.prototype.addScrubbers = function(n, values) {
    for (var i = 0; i < n; i++) {
        this.scrubbers.push(
            new Scrubber(0, 0, 35, 20, values, this.update)
        );
    }
};

Transformation.prototype.draw = function() {
    // Outline
    if (this.mouseOver()) {
        //fill(240);
    } else {
        fill(BACKGROUND);
    }
    fill(BACKGROUND);
    
    strokeWeight(1);
    stroke(200);
    rect(this.x, this.y, this.w, this.h, 8);
    line(this.x + 20, this.y, this.x + 20, this.y + this.h);
    
    for (var i = 3; i < 17; i += 4) {
        stroke(220);
        line(this.x + i, this.y + 22,
             this.x + i, this.y + this.h - 6);
        stroke(200);
        line(this.x + i + 1, this.y + 22,
             this.x + i + 1, this.y + this.h - 6);
    }
    
    // Equations
    this.drawText();
    
    // Close button
    var x = this.x + 11;
    var y = this.y + 10;
    
    if (!this.selected && dist(mouseX, mouseY, x, y) <= 7) {
        fill(200, 0, 0);
        stroke(200, 0, 0);
        ellipse(x, y, 14, 14);
        stroke(255);
    } else {
        stroke(160);
        fill(BACKGROUND);
        ellipse(x, y, 14, 14);
        stroke(100);
    }
    
    strokeWeight(2);
    var d = 3;
    line(x - d, y - d, x + d, y + d);
    line(x - d, y + d, x + d, y - d);
    
    // Update number scrubbers
    for (var i = 0; i < this.scrubbers.length; i++) {
        this.scrubbers[i].updateValue();
    }
};

// To be overwritten
Transformation.prototype.drawText = function() {};

Transformation.prototype.mouseOver = function() {
    return mouseX >= this.x && mouseX <= this.x + this.w &&
           mouseY >= this.y && mouseY <= this.y + this.h;
};

Transformation.prototype.mouseOverMoveTab = function() {
    return mouseX >= this.x && mouseX <= this.x + 20 &&
           mouseY > this.y + 16 && mouseY <= this.y + this.h;
};

Transformation.prototype.mousePressed = function() {
    if (!this.mouseOver()) {
        return;
    }
    
    this.item.badlyPositioned = false;
    
    for (var i = 0; i < this.scrubbers.length; i++) {
        this.scrubbers[i].mousePressed();
    }
    
    // Are we going to drag this
    return this.mouseOverMoveTab();
};

Transformation.prototype.mouseReleased = function() {
    for (var i = 0; i < this.scrubbers.length; i++) {
        this.scrubbers[i].mouseReleased();
    }
    
    if (mouseX >= this.x && mouseX <= this.x + 16 &&
        mouseY >= this.y && mouseY <= this.y + 16) {
            this.item.removeTransformation(this);
    }
};

// **** TRANSLATION ****
var Translation = function(item, x, y, n) {
    this.type = 'translate';
    Transformation.call(this, item, x, y, n);
    
    this.addScrubbers(2, { range: [-32, 32] });
};

Translation.prototype = Object.create(Transformation.prototype);

Translation.prototype.drawText = function() {
    fill(20);
    textAlign(LEFT, BASELINE);
    textFont(serifFont, 16);
    
    var x = this.x + 26;
    var y = this.y + 36;
    var txt = "Translate by ";
    this.w = this.minWidth;
    
    text(txt, x, y);
    x += textWidth(txt);
    this.scrubbers[0].draw(x, y - 16);
    x += this.scrubbers[0].w;
    
    fill(20);
    textAlign(LEFT, BASELINE);
    textFont(serifFont, 16);
    txt = ", ";
    text(txt, x, y);
    x += textWidth(txt);
    this.scrubbers[1].draw(x, y - 16);
    this.w = max(this.w, x + this.scrubbers[1].w - this.x + 5);
    
    y += 34;

    var labels = ["x", "y"];
    for (var i = 0; i < labels.length; i++) {
        var x = this.x + 26;
        
        textAlign(LEFT, BASELINE);
        textFont(serifFont, 18);
        var txt = [
            { txt: labels[i], size: 20 },
            { txt: this.n + 1, size: 13, dy: 4 },
            { txt: " = ", size: 16 },
            { txt: labels[i], size: 20 },
            { txt: this.n, size: 13, dy: 4 },
            { txt: " + ", size: 16 },
            { txt: this.scrubbers[i].value, col: TRANS_COL },
            { txt: " = " + this.values[i] },
        ];
        
        var mx = writeText(txt, x, y);
        this.w = max(this.w, mx - this.x + 10);
        y += 20;
    }
};

// **** SCALE ****
var Scale = function(item, n, x, y) {
    this.type = 'scale';
    Transformation.call(this, item, n, x, y);
    
    this.addScrubbers(2, { options: [0.5, 0.75, 1, 1.5, 2, 3], now: 2 });
};

Scale.prototype = Object.create(Transformation.prototype);

Scale.prototype.drawText = function() {
    fill(20);
    textAlign(LEFT, BASELINE);
    textFont(serifFont, 16);
    
    var x = this.x + 26;
    var y = this.y + 36;
    var txt = "Scale by ";
    this.w = this.minWidth;
    
    text(txt, x, y);
    x += textWidth(txt);
    this.scrubbers[0].draw(x, y - 16);
    x += 35;
    
    fill(20);
    textAlign(LEFT, BASELINE);
    textFont(serifFont, 16);
    txt = ", ";
    text(txt, x, y);
    x += textWidth(txt);
    this.scrubbers[1].draw(x, y - 16);
    
    y += 34;
    
    var labels = ["x", "y"];
    
    for (var i = 0; i < labels.length; i++) {
        var x = this.x + 20;
        
        textAlign(LEFT, BASELINE);
        textFont(serifFont, 18);
        var txt = [
            { txt: labels[i], size: 20},
            { txt: this.n + 1, size: 13, dy: 4 },
            { txt: " = ", size: 16 },
            { txt: roundStr(this.scrubbers[i].value), col: TRANS_COL },
            { txt: "(" + labels[i], size: 20 },
            { txt: this.n, size: 13, dy: 4 },
            { txt: ")", size: 20 },
            { txt: " = " + this.values[i], size: 16 },
        ];
        
        var mx = writeText(txt, x + 8, y);
        this.w = max(this.w, mx - this.x + 10);
        y += 20;
    }
};

// **** Rotation ****

var Rotation = function(item, n, x, y) {
    this.type = 'rotation';
    Transformation.call(this, item, n, x, y);
    this.h = 100;
    
    var rotations = [];
    for (var i = -180; i <= 180; i += 10) {
        rotations.push(i);
    }
    
    this.addScrubbers(1, { options: rotations, now: floor(rotations.length / 2) });
};

Rotation.prototype = Object.create(Transformation.prototype);

Rotation.prototype.drawText = function() {
    fill(20);
    textAlign(LEFT, BASELINE);
    textFont(serifFont, 16);
    
    var x = this.x + 26;
    var y = this.y + 36;
    var txt = "Rotate by ";
    this.w = this.minWidth;
    
    text(txt, x, y);
    x += textWidth(txt);
    this.scrubbers[0].draw(x, y - 16);
    fill(20);
    text("degrees", x + 64, y);
    y += 34;

    var labels = ["x", "y"];
    var funcs = [
        ["cos", " - sin"],
        ["sin", " + cos"]
    ];
    
    for (var i = 0; i < labels.length; i++) {
        var x = this.x + 20;
        
        fill(20);
        textAlign(LEFT, BASELINE);
        textFont(serifFont, 18);
        var txt = [
            { txt: labels[i], size: 20 },
            { txt: this.n + 1, size: 13, dy: 4 },
            { txt: " = " + funcs[i][0] + "(", size: 16 },
            { txt: this.scrubbers[0].value, col: TRANS_COL },
            { txt: ")", size: 16 },
            { txt: labels[i], size: 20 },
            { txt: this.n, size: 13, dy: 4 },
            { txt: funcs[i][1] + "(", size: 16 },
            { txt: this.scrubbers[0].value, col: TRANS_COL },
            { txt: ")", size: 16 },
            { txt: labels[1 - i], size: 20 },
            { txt: this.n, size: 13, dy: 4 },
            { txt: " = " + this.values[i], size: 16 },
        ];
        
        var mx = writeText(txt, x + 8, y);
        this.w = max(this.w, mx - this.x + 10);
        y += 22;
    }
};
}
/*************************************
 *      Item
 *  Items are images which can appear on the grid
**************************************/
{
var Item = function(img, x, y, scale) {
    this.image = img;
    this.name = img.name;
    scale = scale || 1;
    
    // Size in pixels
    this.w = this.image.width * scale;
    this.h = this.image.height * scale;
    this.x = x;
    this.y = y;
    
    this.transformations = [];
    this.selectedTrans = false;
    this.values = [[0, 0]];
    this.calculateMatrix();
};

Item.prototype.draw = function(selected) {

    // Drawing icons
    if (selected) {
        noFill();
        stroke(BLUE + (160 << 24));
        strokeWeight(2);
        rect(this.x - 2, this.y - this.h - 2,
             this.w + 4, this.h + 4, 5);
    }
    
    if (this.mouseOver()) {
        noStroke();
        fill(BLUE + (60 << 24));
        rect(this.x - 2, this.y - this.h - 2,
             this.w + 5, this.h + 5, 5);
    }
    
    this.image.draw(this.x, this.y - this.h, this.w, this.h);
};

Item.prototype.drawOnGrid = function(transformed, selected) {
    this.image.draw(0, -this.h, this.w, this.h);
    
    if (transformed && this.badlyPositioned) {
        noStroke();
        fill(255, 0, 0, 75);
        rect(0, -this.h, this.w, this.h, 8);
    }
    
    // Ellipse at origin point
    if (selected || this.mouseOver()) {
        noFill();
        stroke(transformed ? END_COL : START_COL);
        strokeWeight(2);
        rect(0, -this.h, this.w, this.h, 8);
        if (selected && showing['Initial image']) {
            ellipse(this.values[0][0] * grid.dx, this.values[0][1] * -grid.dy, 6, 6);
        }
    }
};

Item.prototype.drawInitialImage = function() {
    pushMatrix();
    translate(grid.x, grid.y);
    this.drawOnGrid(false, true);
    popMatrix();
};

Item.prototype.drawTransformedImage = function(selected) {
    var dx = grid.dx;
    var dy = -grid.dy;
    var x = this.x - grid.x;
    var y = this.y - grid.y + 4 * dy;
    var n = this.transformations.length;
    
    pushMatrix();
    translate(grid.x, grid.y);
    
    for (var i = 0; i < n; i++) {
        var t = this.transformations[n - i - 1];
        var s = t.scrubbers;
        if (t.type === 'translate') {
            translate(s[0].value * dx, s[1].value * dy);
        } else if (t.type === 'scale') {
            scale(s[0].value, s[1].value);
        } else if (t.type === 'rotation') {
            rotate(-s[0].value);
        }
    }
    
    this.drawOnGrid(n, selected);
    
    popMatrix();
};

Item.prototype.drawTransformations = function() {
    var x = grid.x2 + 20;
    var y = grid.y2 - 10;
    
    this.drawCoordinates(x, y, "Initial", 0, START_COL);
    y += 50;
    
    var n = this.transformations.length;
    var moveArrow = false;
    
    for (var i = 0; i < n; i++) {
        var tf = this.transformations[i];
        
        if (tf === this.selectedTrans) {
            // Indicate where transformation should go
            noStroke();
            fill(220);
            rect(tf.x, tf.y, tf.w, tf.h, 8);
            moveArrow = true;
        } else {
            tf.draw();
            if (tf.mouseOverMoveTab()) {
                moveArrow = true;
            }
        }
        y += tf.h + 5;
    }
    
    if (moveArrow) {
        cursor(MOVE);
    } else {
        cursor(ARROW);
    }
    
    if (n > 0) {
        this.drawCoordinates(x, y, "Final", n, END_COL);
    }
    
    if (this.selectedTrans) {
        var x = this.selectedTrans.x;
        var y = this.selectedTrans.y;
        var dx = x + this.selectedTrans.dragX;
        var dy = y + this.selectedTrans.dragY;
        
        noStroke();
        fill(0, 0, 0, 50);
        pushMatrix();
        translate(dx, dy);
        rotate(5);
        rect(3, 3, this.selectedTrans.w, this.selectedTrans.h, 8);
        popMatrix();
        
        pushMatrix();
        translate(dx, dy);
        rotate(5);
        translate(-x, -y);
        this.selectedTrans.draw();
        popMatrix();
    }
};

Item.prototype.drawCoordinates = function(x1, y1, name, count, col) {
    var maxWidth = 100;
    
    fill(20);
    textAlign(LEFT, CENTER);
    textFont(serifFont, 16);
    text(name + "\nCoordinates", x1 + 6, y1 + 23);
    
    var x = x1 + 100;
    var y = y1 + 19;
    
    var labels = ["x", "y"];
    textFont(serifFont, 18);
    textAlign(LEFT, BASELINE);
    for (var i = 0; i < labels.length; i++) {
        var txt = [
            { txt: labels[i], size: 20 },
            { txt: count, size: 13, dy: 5 },
            { txt: " = ", size: 16 },
            { txt: roundStr(this.values[count][i]), col: col }
        ];
        
        var mx = writeText(txt, x, y);
        maxWidth = max(maxWidth, mx - x1 + 10);
        y += 18;
    }
    
    // Outline
    strokeWeight(1);
    stroke(200);
    noFill();
    rect(x1, y1, maxWidth, 45, 8);
};

Item.prototype.isOffGrid = function(grid) {
    var w = this.w / grid.dx;
    var h = this.h / grid.dy;
    var corners = [[0, 0], [w, 0], [0, h], [w, h]];

    for (var i = 0; i < corners.length; i++) {
        var coords = _applyMatrix(this.matrix, corners[i][0], corners[i][1]);
        if (coords[0] < 0 || coords[0] > grid.w ||
            coords[1] < 0 || coords[1] > grid.h) {
                return true;
        }
    }
    return false;
};

// Stop dragging transformation
Item.prototype.deselectTransformation = function() {
    if (this.selectedTrans) {
        this.selectedTrans.selected = false;
        this.selectedTrans = false;
    }
};

Item.prototype.mouseOver = function() {
    if (this.transformations.length === 0) {
        return (mouseX >= this.x && mouseX <= this.x + this.w &&
                mouseY <= this.y && mouseY >= this.y - this.h);    
    } else {
        var m = [grid.xPositionToCoord(mouseX), grid.yPositionToCoord(mouseY)];
        return pointInQuadrilateral(m, this.points);
    }
};

Item.prototype.mousePressed = function() {
    for (var i = 0; i < this.transformations.length; i++) {
        if (this.transformations[i].mousePressed()) {
            this.selectedTrans = this.transformations[i];
            this.selectedTrans.selected = true;
            this.selectedTrans.dragX = 0;
            this.selectedTrans.dragY = 0;
        }
    }
    this.updateOrigin();
};

Item.prototype.mouseReleased = function() {
    // Release on transformations
    for (var i = 0; i < this.transformations.length; i++) {
        if (this.transformations[i].mouseOver()) {
            this.transformations[i].mouseReleased();
        }
    }
};

Item.prototype.mouseDragged = function() {
    if (this.selectedTrans) {
        var dx = mouseX - pmouseX;
        //this.selectedTrans.dragX = constrain(this.selectedTrans.dragX + dx, -20, 20);
        this.selectedTrans.dragY += mouseY - pmouseY;
        this.rearrangeTransformations();
        this.calculateMatrix();
    } else {
        this.updateOrigin();
    }
};

Item.prototype.updateOrigin = function() {
    if (mouseX >= this.x && mouseX <= this.x + this.w &&
        mouseY <= this.y && mouseY >= this.y - this.h) {
            var x = grid.xPositionToCoord(mouseX);
            var y = grid.yPositionToCoord(mouseY);
            this.values[0] = [x, y];
            this.calculateMatrix();
    }
};

Item.prototype.addTransformation = function(type) {
    var n = this.transformations.length;
    if (n < 4) {
        var x = grid.x2 + 12;
        var t = this.transformations[n - 1];
        var y = t ? t.y + t.h + 5 : grid.y2 + 40;
        
        if (type === 'translate') {
            this.transformations.push(new Translation(this, x, y, n));    
        } else if (type === 'scale') {
            this.transformations.push(new Scale(this, x, y, n));    
        } else if (type === 'rotate') {
            this.transformations.push(new Rotation(this, x, y, n));    
        }
        
        this.calculateMatrix();
    }
};

Item.prototype.rearrangeTransformations = function() {
    var t = this.selectedTrans;
    if (!t || this.transformations.length < 2) {
        return;
    }
    
    var index = this.transformations.indexOf(t);
    
    if (t.dragY > t.h / 2 && index < this.transformations.length - 1) {
        // Move down
        this.transformations[index] = this.transformations[index + 1];
        this.transformations[index + 1] = t;
        t.dragY -= this.transformations[index].h;
        this.updateTransformations();
    } else if (-t.dragY > t.h / 2 & index > 0) {
        // Move up
        this.transformations[index] = this.transformations[index - 1];
        this.transformations[index - 1] = t;
        t.dragY += this.transformations[index].h;
        this.updateTransformations();
    }
};

Item.prototype.removeTransformation = function(transformation) {
    var index = this.transformations.indexOf(transformation);
    if (index > -1) {
        this.transformations.splice(index, 1);
        this.calculateMatrix();
    }
    this.updateTransformations();
};

Item.prototype.updateTransformations = function() {
    // Renumber and reposition transformations
    var y = grid.y2 + 40;
    for (var i = 0; i < this.transformations.length; i++) {
        this.transformations[i].n = i;
        this.transformations[i].y = y;
        y += this.transformations[i].h + 5;
    }
};

Item.prototype.calculateMatrix = function() {
    if (!grid) { return; }
    
    var x = this.values[0][0];
    var y = this.values[0][1];
    this.values = [[x, y]];
    
     this.matrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    
    // Multiply matrices to get result
    for (var i = 0; i < this.transformations.length; i++) {
        var t = this.transformations[i];
        var s = t.scrubbers;
        var tMatrix;
        
        if (t.type === 'translate') {
            tMatrix = [
                [1, 0, s[0].value],
                [0, 1, s[1].value],
                [0, 0, 1]];
        } else if (t.type === 'scale') {
            tMatrix = [
                [s[0].value, 0, 0],
                [0, s[1].value, 0],
                [0, 0, 1]];
        } else if (t.type === 'rotation') {
            var c = cos(s[0].value);
            var s = sin(s[0].value);
            tMatrix = [
                [c, -s, 0],
                [s, c, 0],
                [0, 0, 1]];
        }
        
        this.matrix = multiplyMatrices(tMatrix, this.matrix);
        
        var v = _applyMatrix(tMatrix, x, y);
        this.values.push(v);
        x = v[0];
        y = v[1];
        t.values = [roundStr(x), roundStr(y)];
    }
    
    // Apply transformation to corner points
    var w = this.w / grid.dx;
    var h = this.h / grid.dy;
    this.points = [[0, 0], [w, 0], [w, h], [0, h]];
    
    for (var i = 0;  i< this.points.length; i++) {
        this.points[i] = _applyMatrix(this.matrix, this.points[i][0], this.points[i][1]);
    }
};

Item.prototype.update = function() {
    this.calculateMatrix();
};
}
/*************************************
 *          Grid object
 * Cartesian grid on which items are displayed
**************************************/
{
var Grid = function(x, y, w, h, dx, dy) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dx = dx;
    this.dy = dy || dx;
    
    this.x2 = this.x + this.w * this.dx;
    this.y2 = this.y - this.h * this.dy;
    
    this.items = [];
    this.icons = [];
    this.selected = -1;
    
    this.iconS = 64;
    this.iconX = this.x;
    this.iconY = this.y + this.iconS + 36;
    
    this.floorImage = getImage("pixar/floorplanes");
    
    this.existingItems = [];
    for (var i = 0; i < existingItems.length; i++) {
        var img = images[existingItems[i]];
        var transformations = target[img.name];
        this.existingItems.push([img, transformations]);
    }
};

Grid.prototype.draw = function() {
    if (showing.Floor) {
        this.drawFloor();
    } else {
        background(BACKGROUND);
    }
    
    if (showing.Grid) {
        this.drawGridlines();
    }

    if (showing['Initial image'] &&
        this.selected > -1 &&
        this.items[this.selected].transformations.length) {
        this.items[this.selected].drawInitialImage();
    }
    
    this.drawTransformedItems();
    
    if (showing.Guide) {
        this.drawTarget();
    }
    
    // Draw clipping rectangles
    noStroke();
    fill(BACKGROUND);
    rect(0, 0, width, this.y2);
    rect(0, 0, grid.x, height);
    rect(0, grid.y + 1, width, height - grid.y);
    rect(this.x2 + 1, 0, width - this.x2, height);

    for (var i = 0; i < this.icons.length; i++) {
        this.icons[i].draw(this.selected === i);
    }

    // Outline
    noFill();
    stroke(GREY);
    strokeWeight(1);
    rect(this.x, this.y2, this.w * this.dx, this.h * this.dy);
    
    // Axes    
    textFont(sansFont, 12);
    textSize(12);
    fill(GREY);

    // X axis
    textAlign(CENTER, TOP);
    for (var i = 0; i <= this.w; i++) {
        var x = this.x + i * this.dx;
        if (i % 2 === 0) {
            line(x, this.y, x, this.y + 3);
            text(i, x, this.y + 6);            
        }
    }
    
    // Y-axis
    textAlign(RIGHT, CENTER);
    for (var i = 0; i <= this.h; i++) {
        var y = this.y - i * this.dy;
        if (i % 2 === 0) {
            stroke(GREY);
            line(this.x - 3, y, this.x, y);
            text(i,  this.x - 5, y);
        }
    }
    
    this.drawTransformations();
};

Grid.prototype.drawFloor = function() {
    var dx = this.floorImage.width;
    var dy = this.floorImage.height;
    
    for (var y = this.y2; y < this.y; y += dy) {
        for (var x = this.x - y * 0.5; x < this.x2; x += dx) {
            image(this.floorImage, x, y);
        }
    }
};

Grid.prototype.drawGridlines = function() {
    // X-axis
    strokeWeight(1);
    for (var i = 1; i <= this.w; i++) {
        stroke(i % 4 === 0 ? 
            GRIDGREY2 : GRIDGREY);
        var x = this.x + i * this.dx;
        line(x, this.y2, x, this.y + 1);
    }
    
    // Y-axis
    for (var i = 1; i <= this.h; i++) {
        stroke(i % 4 === 0 ? 
            GRIDGREY2 : GRIDGREY);
        var y = this.y - i * this.dy;
        line(this.x + 1, y, this.x2, y);
    }
};

Grid.prototype.drawTarget = function() {
    noFill();
    strokeWeight(3);
    stroke(GREEN + (100 << 24));
};

Grid.prototype.drawItems = function() {
    if (this.selected > -1 && this.items[this.selected].transformations.length) {
        this.items[this.selected].drawInitialImage();
    }
};

Grid.prototype.drawTransformedItems = function() {
    for (var i = 0; i < this.existingItems.length; i++) {
        var item = this.existingItems[i];
        var h = item[0].height;
        var transformation = item[1];
        
        pushMatrix();
        if (transformation.translate) {
            var t = transformation.translate;
            translate(this.x + t[0] * this.dx,
                      this.y - t[1] * this.dy);
        }
        if (transformation.scale) {
            var t = transformation.scale;
            scale(t[0], t[1]);
        }
        item[0].draw(0, -h, item[0].width, h);
        popMatrix();
    }
    
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].drawTransformedImage(this.selected === i);
    }
};

Grid.prototype.drawTransformations = function() {
    if (this.selected > -1) {
        this.items[this.selected].drawTransformations();
    }
};

Grid.prototype.addItem = function(index) {
    var img = images[index];
    
    if (index > -1 && this.items.length < 7) {
        // Item added to grid
        this.items.push(new Item(img, this.x, this.y));
        
        // Icon added below grid
        var scale = this.iconS / img.height;
        var icon = new Item(img, this.iconX, this.iconY, scale);
        this.icons.push(icon);
        
        this.iconX += icon.w + 10;
        this.selected = this.items.length - 1;
    }
};

Grid.prototype.removeItem = function(index) {
    this.items.splice(index, 1);
    this.icons.splice(index, 1);
    
    // Reposition icons
    // TODO: only reposition icons > index
    this.iconX = this.x;
    for (var i = 0; i < this.icons.length; i++) {
        this.icons[i].x = this.iconX;
        this.iconX += this.icons[i].w + 10;
    }
};

Grid.prototype.mousePressed = function() {
    if (this.selected !== -1) {
        this.items[this.selected].mousePressed();
    }
};

Grid.prototype.mouseMoved = function() {
    if (this.selected !== -1) {
        this.items[this.selected].mouseMoved();
    }
};

Grid.prototype.mouseDragged = function() {
    if (this.selected !== -1) {
        this.items[this.selected].mouseDragged();
    }
};

Grid.prototype.mouseReleased = function() {
    // Release on selected item's transformations
    if (this.selected > -1) {
        var selected = this.items[this.selected];
        if (selected.selectedTrans) {
            selected.deselectTransformation();
            return;
        }
        selected.mouseReleased();
    }

    // Only deselect item if we release the mouse on the grid.
    if (mouseX < this.x || mouseX > this.x2 || mouseY < this.y2) {
        return;
    }

    // Deselect item unless our mouse is over the corner image
    if (this.selected > -1) {
        var item = this.items[this.selected];
        if (showing['Initial image'] &&
            mouseX <= this.x + item.w &&
            mouseY >= this.y - item.h &&
            mouseY <= this.y) {
        return;
        }
        
        // Deselect items
        this.selected = -1;
    }
    
    // Test to see whether we are selecting any item or icon
    for (var i = this.items.length; i--;) {
        if (this.items[i].mouseOver() || this.icons[i].mouseOver()) {
            this.selected = i;
            return;
        }
    }
};

Grid.prototype.xCoordToPosition = function(x) {
    return this.x + x * this.dx;
};

Grid.prototype.yCoordToPosition = function(y) {
    return this.y - y * this.dy;
};

Grid.prototype.xPositionToCoord = function(x) {
    return (x - this.x) / this.dx;
};

Grid.prototype.yPositionToCoord = function(y) {
    return (this.y - y) / this.dy;
};
}
/*************************************
 *      Message board
 * This gives the feedback after a 
 * scene is submitted
**************************************/
{
var MessageBoard = function() {
    this.goodMessages = [];
    this.badMessages = [];
    
    this.width = 520;
    this.height = 100;
    this.x = (width - this.width) / 2;
    this.y = 50;
    
    this.animation = 0;
    this.animationTime = 30;
    this.showing = false;
    this.playSound = true;
    
    var close = this.close.bind(this);
    this.closeButton = new Button(this.x + this.width - 105, this.y + this.height - 30, 96, 20, "Back to work", close);
    
};

MessageBoard.prototype.draw = function() {
    if (!this.showing) { return; }
    
    this.animation++;
    
    noStroke();
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);
    
    fill(BACKGROUND);
    strokeWeight(3);
    stroke(20, 60, 160);
    rect(this.x, this.y, this.width, this.height, 12);
    
    fill(20);
    textAlign(CENTER, TOP);
    textFont(sansFont, 20);
    textLeading(22);
    text("The director has reviewed your work\nand given the following feedback:", this.x + this.width / 2, this.y + 6);

    textAlign(LEFT, CENTER);
    
    var x = this.x + 25;
    var y = this.y + 75;
    var t = this.animation / this.animationTime - 0.5;
    var len1 = this.goodMessages.length;
    var len2 = this.badMessages.length;
    var numMessages = min(len1 + len2, t);
    
    for (var i = 0; i < min(len1, numMessages); i++) {
        textSize(20);
        fill(0, 160, 0);
        text(tickMark, x, y);
        
        textSize(15);
        text(this.goodMessages[i], x + 20, y);
        y += 25;
    }
    
    for (var i = 0; i < numMessages - len1; i++) {
        textSize(20);
        fill(200, 0, 0);
        text(crossMark, x, y);
        
        textSize(15);
        text(this.badMessages[i], x + 20, y);
        y += 25;
    }

    if (t > len1 + len2) {
        fill(20);
        textFont(sansFont, 16);
        if (len2 === 0) {
            textAlign(LEFT, BASELINE);
            text("Congratulations! You can move on to the next topic.", this.x + 16, this.y + this.height - 14);
            
            textAlign(CENTER, CENTER);
            fill(250, 20, 20, 200);
            
            pushMatrix();
            translate(width / 2, height * 0.36);
            rotate(-30);
            textFont(impactFont);
            text("APPROVED", 0, 0);
            popMatrix();
            
            if (this.playSound) {
                playSound(stampSound);
                this.playSound = false;
            }
            
        } else {
            textAlign(CENTER, BASELINE);
            //text("You need to make some changes.", this.x + this.width / 2, this.y + this.height - 14);
        }
        
        this.closeButton.draw();
    }
};

MessageBoard.prototype.getGoodMessage = function() {
    var goodMessages = [
        "perfectly placed",
        "right where we want it",
        "just right"
    ];
    
    return goodMessages[floor(random(goodMessages.length))];
};

MessageBoard.prototype.needsMoving = function(item, translation) {
    var x = item.matrix[0][2];
    var y = item.matrix[1][2];
    var dx = translation[0] - x;
    var dy = translation[1] - y;

    if (abs(dx) < 3 && abs(dy) < 3) {
        this.goodMessages.push(
            item.name + ": " + this.getGoodMessage()
        );
        return;
    }
    
    var dir1 = (dx > 0) ? "right" : "left";
    var dir2 = (dy > 0) ? "up" : "down";
    
    if (abs(dx) < 3) {
        dir1 = "";
    } else if (abs(dx) < 5) {
        dir1 += " a bit";
    }
    
    if (abs(dy) < 3) {
        dir2 = "";
    } else if (abs(dy) < 5) {
        dir2 += " a bit";
    }
    
    if (dir1 && dir2) {
        dir1 += " and ";
    }
    
    this.badMessages.push(
        item.name + ": needs to move " + dir1 + dir2 + "."
    );
    item.badlyPositioned = true;
};

MessageBoard.prototype.needsScaling = function(item, scaling) {
    if (!scaling) { return; }
    
    // TODO: Get this to work with rotation matrices
    var sx = dist(0, 0, item.matrix[0][0], item.matrix[1][0]);
    var sy = dist(0, 0, item.matrix[0][1], item.matrix[1][1]);
    var dx = scaling[0] - sx;
    var dy = scaling[1] - sy;

    if (abs(dx) < 0.1 && abs(dy) < 0.1) {
        this.goodMessages.push(
            item.name + ": the size is just right"
        );
        return;
    }
    
    var d1 = (dx > 0) ? "bigger" : "smaller";
    var d2 = (dy > 0) ? "bigger" : "smaller";
    
    d1 += " in x";
    d2 += " in y";
    
    if (d1 && d2) {
        d1 += " and ";
    }
    
    this.badMessages.push(
        item.name + ": needs to be " + d1 + d2 + "."
    );
    item.badlyPositioned = true;
};

MessageBoard.prototype.needsRotation = function(item, rotation) {
    if (!rotation) { return; }
    
    // TODO: Get this to work with rotation matrices
    var r = atan(item.matrix[1][0] / item.matrix[1][1]);
    var d = rotation - r;

    if (abs(d) < 12) {
        this.goodMessages.push(
            item.name + ": the angle is just right"
        );
        return;
    }
    
    if (d > 0) {
        this.badMessages.push(
            item.name + ": needs to be rotated anti-clockwise."
        );
    } else {
        this.badMessages.push(
            item.name + ": needs to be rotated clockwise."
        );
    }
    item.badlyPositioned = true;
};

MessageBoard.prototype.gradeScene = function() {
    this.showing = true;
    this.animation = 0;
    this.playSound = true;
    
    this.goodMessages = [];
    this.badMessages = [];
    
    if (grid.items.length === 0) {
        this.badMessages.push("You need to add some items to scene!");
        this.findHeight();
        return;
    }
    
    var itemCounter = {};
    var duplicates = false;
    var lampIsOn = "Nightstand";
    
    for (var i = 0; i < grid.items.length; i++) {
        var item = grid.items[i];
        var properties = target[item.name];
        
        if (!properties) {
            if (!itemCounter[item.name]) {
                itemCounter[item.name] = 1;
                this.badMessages.push(
                    item.name + ": not required for this scene."
                );
                item.badlyPositioned = true;
            }
            continue;
        }
        
        if (properties.notNeeded) {
            this.badMessages.push(properties.notNeeded);
            item.badlyPositioned = true;
        } else if (itemCounter[item.name]) {
            duplicates = true;
        } else {
            itemCounter[item.name] = i + 1;
            
            if (item.isOffGrid(grid)) {
                this.badMessages.push(
                    item.name + ": needs to be fully in the scene."
                );
                item.badlyPositioned = true;
            } else {
                var translation = properties.translate;
                
                // If there is an alternative position,
                // See which the item is closest to and use that
                if (properties.alternative) {
                    var x = item.matrix[0][2];
                    var y = item.matrix[1][2];
                    var d1 = dist(x, y, translation[0], translation[1]);
                    var d2 = dist(x, y, properties.alternative[0], properties.translate[1]);
                    if (d2 < d1) {
                        translation = properties.alternative;
                        lampIsOn = "Dresser";
                    }
                }
                
                this.needsMoving(item, translation);
                this.needsScaling(item, properties.scale);
                this.needsRotation(item, properties.rotate);
            }
        }
    }
    
    if (duplicates) {
        this.badMessages.push(
            "You have duplicate items."
        );
    } else {
        if (itemCounter[lampIsOn] && itemCounter.Lamp &&
            itemCounter[lampIsOn] > itemCounter.Lamp) {
            this.badMessages.push(
                "The lamp must be added after the " + lampIsOn.toLowerCase() + "."
            );
        }
    }
    
    // Test whether any items are missing
    for (var item in target) {
        if (!target[item].notNeeded && !itemCounter[item]) {
            this.badMessages.push(
                "There are more items you can add."
            );
            break;
        }
    }
    
    this.findHeight();
};

MessageBoard.prototype.findHeight = function() {
    this.height = 100 + (this.goodMessages.length +  this.badMessages.length) * 25;
    this.y = (height - this.height) / 3;

    // Update button    
    if (this.badMessages.length === 0) {
        this.closeButton.name = "Close";
        this.closeButton.w = 60;
        
    } else {
        this.closeButton.name = "Back to work";
        this.closeButton.w = 96;
    }
    
    this.closeButton.x = this.x + this.width - this.closeButton.w - 8;
    this.closeButton.y = this.y + this.height - 30;
};

MessageBoard.prototype.close = function() {
    this.showing = false;
};

MessageBoard.prototype.mousePressed = function() {
    this.closeButton.mousePressed();
};

MessageBoard.prototype.mouseReleased = function() {
    this.closeButton.mouseReleased();
};
}
/*************************************
 *      Create objects
**************************************/

var createGrid = function(x, y) {
    var tickSize = 16;
    // Make gridsize as big as we can while keeping numbers nice
    var w = 2 * floor(0.5 * (width - x - 250) / tickSize);
    var h = 2 * floor(0.5 * (y - 15) / tickSize);
    w = 32;
    h = 24;
    grid = new Grid(x, y, w, h, tickSize);
};
createGrid(180, height - 130);

var addToolbarOptions = function(toolbars) {
    var addToScene = function() {
        grid.addItem(toolbars[0].buttons[0].index);
    };
    
    toolbars[0].addCarousel(images);
    toolbars[0].addButton("Add to scene", addToScene);
    toolbars[0].addOptions(showing);
    
    var funcs = [
        function() {
            if (grid.selected > -1) {
                grid.removeItem(grid.selected);
                grid.selected = -1;
            }
        },
        function() {
            if (grid.selected > -1) {
                grid.items[grid.selected].addTransformation('translate');
            }
        },
        function() {
            if (grid.selected > -1) {
                grid.items[grid.selected].addTransformation('scale');
            }
        },
        function() {
            if (grid.selected > -1) {
                grid.items[grid.selected].addTransformation('rotate');
            }
        }
    ];
      
    var labels = ["Remove"].concat(TRANSFORMATIONS);
    
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i].charAt(0).toUpperCase() + labels[i].slice(1);
        toolbars[1].addButton(label, funcs[i]);
    }
    
    //toolbars[1].toTop(toolbars[0].y + toolbars[0].h + 10);
    toolbars[1].toBottom(44);
};

var toolbars = [
    new Toolbar(10, 20, 132),
    new Toolbar(10, 300, 132)
];
addToolbarOptions(toolbars);

var messageBoard = new MessageBoard();

/*************************************
 * Submit the screen
 *  Check that it matches the guide
**************************************/

var submitScene = function() {
    messageBoard.gradeScene();
};

var submitButton = new Button(10, height - 36, 132, 26, "Submit scene", submitScene);

submitButton.draw = function() {
    if (this.mouseOver()) {
        fill(CS_GREEN);
        noStroke();
    } else {
        noFill();
        strokeWeight(1);
        stroke(200);
    }
    
    rect(this.x, this.y - 1, this.w, this.h + 3, 16);
    
    if (this.mouseOver()) {
        fill(255);
    } else {
        fill(20);
    }
    
    textSize(18);
    textAlign(CENTER, CENTER);
    textFont(sansFont);
    text(this.name, this.x + this.w / 2, this.y + this.h/2 + 1);
};

/*************************************
 *      Main loop
**************************************/

draw = function() {
    grid.draw();
    toolbars[0].draw();
    submitButton.draw();
    if (grid.selected !== -1) {
        toolbars[1].draw();
    }
    messageBoard.draw();
};

/*************************************
 *      Event handling
**************************************/

mousePressed = function() {
    if (messageBoard.showing) {
        messageBoard.mousePressed();
    } else {
        grid.mousePressed();
        submitButton.mousePressed();
        for (var i = 0; i < toolbars.length; i++) {
            toolbars[i].mousePressed();
        }
    }
};

mouseDragged = function() {
    if (!messageBoard.showing) {
        grid.mouseDragged();
    }
};

mouseReleased = function() {
    if (messageBoard.showing) {
        messageBoard.mouseReleased();
    } else {
        grid.mouseReleased();
        submitButton.mouseReleased();
        
        for (var i = 0; i < toolbars.length; i++) {
            toolbars[i].mouseReleased();
        }
    }
};

mouseOut = function() {
};
