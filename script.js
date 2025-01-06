
var minPoints = [], maxPoints = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isValid = false;
    }
}

function newEquation() {
    const nodeList = document.querySelectorAll('.equation-container');
    const template = nodeList[nodeList.length - 1];
    const clone = template.cloneNode(true); // Clone the template
    const newNr = Number(template.dataset.nr) + 1;
    clone.dataset.nr = newNr;
    clone.id = 'equation' + newNr;
    clone.getElementsByTagName('h4')[0].textContent = 'Conditia ' + newNr;
    document.getElementById('data').appendChild(clone); // Add the clone
}

//newEquation();
//newEquation();

var equations = [];
var statement = {
    problemType: null,
    c1: null,
    c2: null
}

function getEquations() {
    equations = [];

    /*const collection = document.getElementsByClassName('equation');
    Array.from(collection).forEach(div => {
        s1 = (div.querySelector('.x1-sign').value == '+') ? 1 : -1;
        s2 = (div.querySelector('.x2-sign').value == '+') ? 1 : -1;
        c1 = div.querySelector('.x1-coefficient').value;
        c2 = div.querySelector('.x2-coefficient').value;
        operator = div.querySelector('.operator').value;
        constant = div.querySelector('.constant').value;

        if (c1 != '' && c2 != '' && constant != '') {
            const equation = {
                'c1' : s1 * Number(c1),
                'c2' : s2 * Number(c2),
                'operator' : operator,
                'constant' : Number(constant)
            };

            equations.push(equation);
        }
    });*/

    const input = document.querySelector('textarea').value;
    var regex = /^.*$/gm;
    const lines = [...input.matchAll(regex)];

    //console.log(lines);

    lines.forEach(line => {
        var c1, c2;

        regex = /([+-]?)\s*(\d*)\s*x1/i;
        var matches = line[0].match(regex);
        if (matches == null) {
            c1 = 0;
        }
        else if (matches[2] == '') {
            c1 = (matches[1] == '-') ? -1 : +1;
        }
        else {
            c1 = ((matches[1] == '-') ? -1 : +1) * Number(matches[2].replace(' ', ''));
        }

        regex = /([+-]?)\s*(\d*)\s*x2/i;
        var matches = line[0].match(regex);
        if (matches == null) {
            c2 = 0;
        }
        else if (matches[2] == '') {
            c2 = (matches[1] == '-') ? -1 : +1;
        }
        else {
            c2 = ((matches[1] == '-') ? -1 : +1) * Number(matches[2].replace(' ', ''));
        }

        //linia cu max sau min
        console.log(line[0]);
        if (/(max|min)/i.test(line[0])) {
            if (/max/i.test(line[0])) {
                statement.problemType = 'max';
            }
            else {
                statement.problemType = 'min';
            }
            statement.c1 = c1;
            statement.c2 = c2;
        }
        else if (/x/i.test(line[0])) { 
            regex = /(<=|>=)/;
            const operator = line[0].match(regex);
    
            regex = /=\s*[+-]?\s*\d+/;
            const constant = Number(line[0].match(regex)[0].replace(/[=\s*]/g, ''));

            var equation = {
                'c1': c1,
                'c2': c2,
                'operator' : operator[1],
                'constant': constant
            }
            equations.push(equation);
        }
    })

    console.log(statement);
    console.log(equations);
}

var points = [new Point(0, 0)];

function getPoints() {
    points = [new Point(0, 0)];

    for (var i = 0; i < equations.length; i++) {
        const ei = equations[i];

        /*/intersection with x1 axis
        x2 = 0;
        x1 = ei.constant / ei.c1;
        points.push(new Point(x1, x2));

        //intersection with x2 axis
        x1 = 0;
        x2 = ei.constant / ei.c2;
        points.push(new Point(x1, x2));*/

        //intersection with other equations
        for (var j = i + 1; j < equations.length; j++) {
            const ej = equations[j];

            //metoda determinantilor
            const det = ej.c1 * ei.c2 - ei.c1 * ej.c2;

            //daca det = 0, nu exista solutie, treci la urmatoarea ecuatie
            if (det == 0) {
                continue;
            }

            //calculeaza determinatnul pentru x si y
            const detX = ej.constant * ei.c2 - ei.constant * ej.c2;
            const detY = ej.c1 * ei.constant - ei.c1 * ej.constant;

            // solutia
            const x = detX / det;
            const y = detY / det;

            points.push(new Point(x, y));
        }
    }

    console.log(points);
}

function isValid(equation, x1, x2) {
    sum = equation.c1 * x1 + equation.c2 * x2;
    
    if (equation.operator == "<=") {
        return sum <= equation.constant;
    }
    else if (equation.operator == ">=") {
        return sum >= equation.constant;
    }
}

function getValidPoints() {
    points.forEach(point => {
        var sw = true;
        equations.forEach(equation => {
            console.log(equation, point.x, point.y, isValid(equation, point.x, point.y))
            if (!isValid(equation, point.x, point.y)) {
               sw = false;
            }
        });
        point.isValid = sw;
    })

    console.log(points.filter(point => point.isValid == true));
}

var min, max;

function getSolutions() {
    minPoints = [], maxPoints = [];

    for (i = 0; i < points.length; i++) {
        if (points[i].isValid) {
            var result = statement.c1 * points[i].x + statement.c2 * points[i].y;
            console.log(result);
            console.log(i);
            if (result < min || min == undefined) {
                min = result;
                minPoints = [points[i]];
            }
            else if (result == min) {
                minPoints.push(points[i]);
            }

            if (result > max || max == undefined) {
                max = result;
                maxPoints = [points[i]];
            }
            else if (result == max) {
                maxPoints.push(points[i]);
            }
        }
    }
    
    console.log(min);
    console.log(max);

    const p = document.querySelector('#result');
    if (statement.problemType == 'max') {
        p.innerHTML = 'max(f) = ' + max + '<br>' +
                        'Multimea solutiilor optime: S<sub>o</sub> = {' + maxPoints.map((point, index) => `${String.fromCharCode(65 + index)}(${point.x}, ${point.y})`).join(', ') + '}';
    }
    else {
        p.innerHTML = 'min(f) = ' + min + '<br>' +
                        'Multimea solutiilor optime: S<sub>o</sub> = ' + minPoints.map(point => `(${point.x}, ${point.y})`).join(', ') + '}';
    }
}

const computeBtn = document.querySelector('#compute');
computeBtn.addEventListener('click', () => {
    getEquations();
    getPoints();
    getValidPoints();
    getSolutions();
    draw();
});

/*const newConditionBtn = document.querySelector('#new-condition');
newConditionBtn.addEventListener('click', () => {
    newEquation();
});*/




const canvas = document.querySelector('canvas');
var scale = window.devicePixelRatio;
console.log(scale);
var w = 800;
var h = 800;

canvas.width = w;
canvas.height = h;
canvas.style.width = w / scale + "px";
canvas.style.height = h / scale + "px";


function draw() {

    const canvas = document.querySelector('canvas');
    var scale = window.devicePixelRatio;
    console.log(scale);
    var w = 800;
    var h = 800;

canvas.width = w;
canvas.height = h;
canvas.style.width = w / scale + "px";
canvas.style.height = h / scale + "px";

const c = canvas.getContext('2d');
c.resetTransform();
c.clearRect(0, 0, 2*w, 2*h);
//set origin to center and flip y axis
c.translate(w/2, h/2);
c.scale(scale, -scale);
w /= scale;
h /= scale;

//get furthest point
var dMax = 0;
for (var i = 0; i < points.length; i++) {
    var d = Math.max(Math.abs(points[i].x), Math.abs(points[i].y));
    if (d > dMax) {
        dMax = d;
    }
    console.log('dMax = ' + dMax)
}
//set scale
c.scale(w * 0.9 / 2 / dMax, h * 0.9 / 2 / dMax);
scale /= (w * 0.9 / 2 / dMax);
w /= (0.9 / 2 / dMax);
h /= (0.9 / 2 / dMax);

c.lineWidth = 4 * scale;
c.strokeStyle = 'blue';
c.beginPath();
c.moveTo(0, -h);
c.lineTo(0, h);
c.stroke();

c.beginPath();
c.moveTo(-w, 0);
c.lineTo(w, 0);
c.stroke();
c.strokeStyle = 'black';
c.lineWidth = 2 * scale;

equations.forEach(eq => {
    c.beginPath();

    if (eq.c2 == 0) {
        x1 = eq.constant / eq.c1;
        x2 = -h * scale;
        c.moveTo(x1, x2);

        console.log(x1, x2);

        x2 = h * scale;
        c.lineTo(x1, x2);
    }
    else {
        x1 = -w * scale;
        x2 = (eq.constant - eq.c1 * x1) / eq.c2;
        c.moveTo(x1, x2);

        console.log(x1, x2);

        x1 = w * scale;
        x2 = (eq.constant - eq.c1 * x1) / eq.c2;
        c.lineTo(x1, x2);
    }

    c.stroke();    
    console.log(x1, x2);
})

c.fillStyle = 'red';
console.log(statement);
console.log(minPoints);
console.log(maxPoints);
if (statement.problemType == 'max') {
    maxPoints.forEach(p => {
        c.beginPath();
        c.arc(p.x, p.y, 3 * c.lineWidth, 0, 2 * Math.PI);
        c.fill();
    })
}
else if (statement.problemType == 'min') {
    minPoints.forEach(p => {
        c.beginPath();
        c.arc(p.x, p.y, 3 * c.lineWidth, 0, 2 * Math.PI);
        c.fill();
        console.log('min', p);
    })
}
c.fillStyle = 'black';

}

