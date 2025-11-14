
function toDataURL(blob, callback) {
    var reader = new FileReader();
    reader.onloadend = function () {
        callback(reader.result);
    }
    reader.readAsDataURL(blob);
}
function cubicBezierPoint(t, P0, P1, P2, P3) {
    var x = ((1 - t) ** 3) * P0[0] +
        3 * ((1 - t) ** 2) * t * P1[0] +
        3 * (1 - t) * (t ** 2) * P2[0] +
        (t ** 3) * P3[0];

    var y = ((1 - t) ** 3) * P0[1] +
        3 * ((1 - t) ** 2) * t * P1[1] +
        3 * (1 - t) * (t ** 2) * P2[1] +
        (t ** 3) * P3[1];

    return [x, y];
}

function getDistance(p1, p2) {
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function cubicBezierLength(P0, P1, P2, P3, steps = 100) {
    var length = 0;
    var prev = cubicBezierPoint(0, P0, P1, P2, P3);

    for (var i = 1; i <= steps; i++) {
        var t = i / steps;
        var curr = cubicBezierPoint(t, P0, P1, P2, P3);
        length += getDistance(prev, curr);
        prev = curr;
    }

    return length;
}

/**
 * 
 * @param {function} func 
 * @returns {Array}
 */
function getParamNames(func) {
    var result = [];
    if (typeof func?.toString !== 'function') {
        return result;
    }
    var fnStr = func.toString()?.replace(/(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg, '');
    result = fnStr?.slice(fnStr?.indexOf('(') + 1, fnStr?.indexOf(')'))?.match(/([^\s,]+)/g);
    return (result === null) ? [] : result;
}
class hanja {
    constructor() { }
}
var hanja_maker = class {
    constructor(el) {
        this.el = (el instanceof HTMLElement) ? el : (typeof el === 'string') ? document.getElementById(el) : null;
        if (el === null) {
            el = (() => { var a = document.createElement("div"); return document.body.appendChild(a); })();
        }
        this.strokes = [];
        this.marks = [];
        this.marking = false;
        this.clicktodraw = false;
        var svgelparent = document.createElement("div");
        this.svgelparent = this.el.appendChild(svgelparent);
        this.svgelparent.tabIndex = 1;
        var logelouter = document.createElement("div");
        this.logelouter = this.el.appendChild(logelouter);
        var coordel = document.createElement("h3");
        this.coordel = this.logelouter.appendChild(coordel);
        var logel = document.createElement("ul");
        this.logel = this.logelouter.appendChild(logel);
        var cmdel = document.createElement("p");
        cmdel.contentEditable = "true";
        this.cmdel = this.el.appendChild(cmdel);
        var svgel = document.createElement("svg");
        this.stroke_width = 14.4;
        this.bgstroke_width = 21.6;
        this.stroke_colour = '#202020';
        this.stroketemp = `
        <path stroke="${this.stroke_colour}" stroke-dasharray="@@stroke-dashoffset@@" stroke-dashoffset="@@stroke-dashoffset@@" stroke-linecap="square" stroke-opacity="0.8" stroke-width="${this.stroke_width}" d="@@stroke-path@@">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;@@stroke-keytime@@;1" repeatCount="indefinite" values="@@stroke-dashoffset-2@@;0" />
        </path>`;
        this.svgtemp = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">
    <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="2" />
    <g class="bg">
    <path d="M0 20 L0 20 360 20 M0 40 L0 40 360 40 M0 60 L0 60 360 60 M0 80 L0 80 360 80 M0 100 L0 100 360 100 M0 120 L0 120 360 120 M0 140 L0 140 360 140 M0 160 L0 160 360 160 M0 180 L0 180 360 180 M0 200 L0 200 360 200 M0 220 L0 220 360 220 M0 240 L0 240 360 240 M0 260 L0 260 360 260 M0 280 L0 280 360 280 M0 300 L0 300 360 300 M0 320 L0 320 360 320 M0 340 L0 340 360 340Z" stroke="#000000" fill="none" />
    <path d="M20 0 L20 0 20 360 M40 0 L40 0 40 360 M60 0 L60 0 60 360 M80 0 L80 0 80 360 M100 0 L100 0 100 360 M120 0 L120 0 120 360 M140 0 L140 0 140 360 M160 0 L160 0 160 360 M180 0 L180 0 180 360 M200 0 L200 0 200 360 M220 0 L220 0 220 360 M240 0 L240 0 240 360 M260 0 L260 0 260 360 M280 0 L280 0 280 360 M300 0 L300 0 300 360 M320 0 L320 0 320 360 M340 0 L340 0 340 360Z" stroke="#000000" fill="none" /></g>
    <g fill="none" stroke-linejoin="round" class="character_group">
        <path stroke="#AAA" stroke-linecap="round" stroke-opacity="1.0" stroke-width="${this.bgstroke_width}" d="@@strokes-path@@" />
        @@strokes-list@@
    </g>
    <g class="points">@@marks@@</g>
</svg>`;
        this.svgel = this.svgelparent.appendChild(svgel);
        svgel = null;
        var canvasel = document.createElement("canvas");
        this.canvasel = this.el.appendChild(canvasel);
        canvasel = null;
        var imgel = document.createElement("img");
        imgel.width = 360;
        imgel.height = 360;
        this.imgel = this.el.appendChild(imgel);
        imgel = null;
        this.canvas_ctx = this.canvasel.getContext("2d");
        this.logs = [];
        this.svgelparent.style.width = 'fit-content';
        this.svgelparent.style.height = 'fit-content';
        this.pointednow = {
            parent_obj: this,
            x: [],
            y: [],
            cmd: '',
            selected_tool: '',
            execute_bool: false,
            reset_xy: function () {
                this.x = [];
                this.y = [];
                this.execute = false;
            },
            cmd_parameter: '',
            set_cmd_parameter: function (reset_bool = false) {
                for (var i = 0; i < this.x.length; i++) {
                    for (var j = 0; j < this.y.length; j++) {
                        if (i === j) {
                            this.cmd_parameter += ',' + (this.x[i] + ' ' + this.y[j]);
                        }
                    }
                }
                if (this.cmd_parameter.startsWith(',')) {
                    this.cmd_parameter = this.cmd_parameter.replace(',', '');
                }
                if (reset_bool) {
                    this.cmd_parameter = '';
                }
            },
            check_execute_bool: function () {
                var bool0 = this.execute_bool;
                if (typeof this.parent_obj.get_tools()[this.selected_tool] === 'function') {
                    console.log(this.parent_obj.get_cmd_tools_params()[this.selected_tool]);
                    bool0 = this.parent_obj.get_cmd_tools_params()[this.selected_tool] <= Math.min(this.x.length, this.y.length);
                }
                if (bool0) {
                    this.execute_bool = true;
                } else {
                    this.execute_bool = false;
                }
            },
        };
        this.svgelparent.addEventListener("click", (ev) => {
            if (ev.target instanceof SVGCircleElement) {
                return;
            }
            this.log(ev.offsetX, ev.offsetY, this.marking);
            if (this.clicktodraw) {
                this.pointednow.check_execute_bool();
                if (this.pointednow.execute_bool) {
                    /* var functoexec = this.get_tools()[this.pointednow.selected_tool];
                    if (typeof functoexec === 'function') {
                        functoexec
                    } */
                    this.pointednow.set_cmd_parameter();
                    this.pointednow.cmd = this.get_cmd_tools(this.pointednow.cmd_parameter)[this.pointednow.selected_tool];
                    this.exec_cmd(this.pointednow.cmd);
                    console.log(this.pointednow.cmd);
                    this.pointednow.reset_xy();
                    this.pointednow.set_cmd_parameter(true);
                } else {
                    this.pointednow.x.push(ev.offsetX);
                    this.pointednow.y.push(ev.offsetY);
                }
            }
        });
        this.svgelparent.addEventListener("mouseover", (ev) => {
            this.coordel.innerHTML = `coordinate:${ev.offsetX} ${ev.offsetY}`;
        });
        this.svgelparent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">
    <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="2" />
    <g class="bg">
    <path d="M0 20 L0 20 360 20 M0 40 L0 40 360 40 M0 60 L0 60 360 60 M0 80 L0 80 360 80 M0 100 L0 100 360 100 M0 120 L0 120 360 120 M0 140 L0 140 360 140 M0 160 L0 160 360 160 M0 180 L0 180 360 180 M0 200 L0 200 360 200 M0 220 L0 220 360 220 M0 240 L0 240 360 240 M0 260 L0 260 360 260 M0 280 L0 280 360 280 M0 300 L0 300 360 300 M0 320 L0 320 360 320 M0 340 L0 340 360 340Z" stroke="#000000" fill="none" />
    <path d="M20 0 L20 0 20 360 M40 0 L40 0 40 360 M60 0 L60 0 60 360 M80 0 L80 0 80 360 M100 0 L100 0 100 360 M120 0 L120 0 120 360 M140 0 L140 0 140 360 M160 0 L160 0 160 360 M180 0 L180 0 180 360 M200 0 L200 0 200 360 M220 0 L220 0 220 360 M240 0 L240 0 240 360 M260 0 L260 0 260 360 M280 0 L280 0 280 360 M300 0 L300 0 300 360 M320 0 L320 0 320 360 M340 0 L340 0 340 360Z" stroke="#000000" fill="none" /></g>
    <g fill="none" stroke-linejoin="round" class="character_group">
    </g>
</svg>`;
        this.cmdel.style.border = '1px solid #000000';
        var cmdbtn = document.createElement("button");
        this.cmdbtn = this.el.appendChild(cmdbtn);
        this.cmdbtn.innerText = /* 'perform commands' */ 'do your commands';
        this.cmdbtn.addEventListener('click', (ev) => {/* 
            var cmd = this.cmdel.innerText.replaceAll(';', ';\n');
            for (var i = 0; i < cmd.split('\n').length; i++) {
                var cmd2 = cmd.split('\n')[i];
                console.log(cmd2);
                if (cmd2.match(/add_line\((.*?),(.*?)\);/gmi) !== null) {
                    var start = cmd2.replace(/add_line\((.*?),(.*?)\);/gmi, '$1');
                    var end = cmd2.replace(/add_line\((.*?),(.*?)\);/gmi, '$2');
                    this.add_line(start, end);
                } else if (cmd2.match(/add_curve\((.*?),(.*?),(.*?)\);/gmi) !== null) {
                    var start = cmd2.replace(/add_curve\((.*?),(.*?),(.*?)\);/gmi, '$1');
                    var _50 = cmd2.replace(/add_curve\((.*?),(.*?),(.*?)\);/gmi, '$2');
                    var end = cmd.replace(/add_curve\((.*?),(.*?),(.*?)\);/gmi, '$3');
                    this.add_curve(start, _50, end);
                } else if (cmd2.match(/end_stroke\(\);/gmi) !== null) {
                    this.end_stroke();
                } else if (cmd2.match(/add_moving\((.*?)\);/gmi) !== null) {
                    var start = cmd2.replace(/add_moving\((.*?)\);/gmi, '$1');
                    this.add_moving(start);
                } else if (cmd2.match(/start_stroke\((.*?)\);/gmi) !== null) {
                    var start = cmd2.replace(/start_stroke\((.*?)\);/gmi, '$1');
                    this.start_stroke(start);
                } else if (cmd2.match(/apply_to_svg\(\);/gmi) !== null) {
                    this.apply_to_svg();
                } else if (cmd2.match(/clear\(\);/gmi) !== null) {
                    this.clear();
                } else if (cmd2.match(/make_mp4\(\);/gmi) !== null) {
                    this.make_mp4({ len: 20000, framerate: 30 });
                }
            } */
            this.exec_cmd(this.cmdel.innerText, this.marking);
        });
        this.id = false;
        this.pressed_keys = [];
        this.selected_marks = [];
    }
    add_curve(pa, pb, pc, relative = false) {
        if (this.strokes.length < 1) {
            this.start_stroke(pa);
        }
        this.strokes[this.strokes.length - 1] += `${relative ? 'c' : 'C'}${pa} ${pb} ${pc} `;
    }
    /*add_arc(pa, pb, pc, pd, pe, pf, pg, relative = false) {
        this.strokes[this.strokes.length - 1] += `${relative ? 'a' : 'A'}${pa} ${pb} ${pc} ${pd} ${pe} ${pf} ${pg} `;
    }*/
    add_line(pa, pb, relative = false) {
        if (this.strokes.length < 1) {
            this.start_stroke(pa);
        }
        this.strokes[this.strokes.length - 1] += `${relative ? 'l' : 'L'}${pa} ${pb}`;
    }
    add_line_easy(pa, pb, last_pa = false, relative = false) {
        if (this.strokes.length < 0) {
            this.start_stroke(pa);
        }
        if (!last_pa) {
            this.start_stroke(pa);
        }
        this.strokes[this.strokes.length - 1] += `${relative ? 'l' : 'L'}${!last_pa ? pa : last_pa} ${pa} ${relative ? 'l' : 'L'}${pa} ${pb}`;
    }
    add_curve_easy(pa, pb, pc, last_pa = false, relative = false) {
        if (this.strokes.length < 1) {
            this.start_stroke(pa);
        }
        if (!last_pa) {
            this.start_stroke(pa);
        }
        this.strokes[this.strokes.length - 1] += `${!last_pa ? '' : 'M' + last_pa} ${relative ? 'c' : 'C'}${pa} ${pb} ${pc} `;
    }
    end_stroke() {
        if (this.strokes.length < 1) {
            return;
        }
        this.strokes[this.strokes.length - 1] += `Z`;
    }
    add_moving(pa, relative = false) {
        if (this.strokes.length < 1) {
            this.start_stroke(pa);
        }
        this.strokes[this.strokes.length - 1] += `${relative ? 'm' : 'M'}${pa} `;
    }
    start_stroke(pa) {
        this.strokes.push(' ');
        this.add_moving(pa);
    }
    /**
     * 
     * @param {string} cmdparam 
     */
    exec_cmd(cmdparam, apply_to_svg_bool) {
        var cmd = cmdparam.replaceAll(';', ';\n');
        for (var i = 0; i < cmd.split('\n').length; i++) {
            var cmd2 = cmd.split('\n')[i].replaceAll('\n', '');
            console.log(cmd2);
            if (cmd2.match(/add_line\((.*?),(.*?)\);/gmi) !== null) {
                var start = cmd2.replace(/add_line\((.*?),(.*?)\);/gmi, '$1');
                var end = cmd2.replace(/add_line\((.*?),(.*?)\);/gmi, '$2');
                this.add_line(start, end);
            } else if (cmd2.match(/add_curve\((.*?),(.*?),(.*?)\);/gmi) !== null) {
                var start = cmd2.replace(/add_curve\((.*?),(.*?),(.*?)\);/gmi, '$1');
                var _50 = cmd2.replace(/add_curve\((.*?),(.*?),(.*?)\);/gmi, '$2');
                var end = cmd.replace(/add_curve\((.*?),(.*?),(.*?)\);/gmi, '$3');
                this.add_curve(start, _50, end);
            } else if (cmd2.match(/end_stroke\(\);/gmi) !== null) {
                this.end_stroke();
            } else if (cmd2.match(/add_moving\((.*?)\);/gmi) !== null) {
                var start = cmd2.replace(/add_moving\((.*?)\);/gmi, '$1');
                this.add_moving(start);
            } else if (cmd2.match(/start_stroke\((.*?)\);/gmi) !== null) {
                var start = cmd2.replace(/start_stroke\((.*?)\);/gmi, '$1');
                this.start_stroke(start);
            } else if (cmd2.match(/apply_to_svg\(\);/gmi) !== null) {
                this.apply_to_svg();
            } else if (cmd2.match(/clear\(\);/gmi) !== null) {
                this.clear();
            } else if (cmd2.match(/make_mp4\(\);/gmi) !== null) {
                this.make_mp4({ len: 20000, framerate: 30 });
            }
        }
    }
    log(x, y, marking = false) {
        this.logs.push({ x: x, y: y });
        this.logel.innerHTML += `<li>${x} ${y} --<span onclick="removefunc(this,${this.logs.length - 1});">x</span></li>`;
        var thisobj = this;
        if (marking) {
            console.log(this.marks[this.marks.length - 1]);
            this.marks.push({ x: x, y: y, id: (!(this.marks[this.marks.length - 1]?.id > -1) ? -1 : this.marks[this.marks.length - 1]?.id) + 1 });
            this.apply_to_svg();
        }
        window['removefunc'] = function (p0, idx) {
            p0?.parentElement?.remove();
            thisobj.logs.splice(idx);
            if (marking) {
                thisobj.marks.splice(idx);
            }
        }
    }
    get_tools() {
        return {
            'add_line': this.add_line,
            'add_curve': this.add_curve,
            'end_stroke': this.end_stroke,
            'add_moving': this.add_moving,
            'start_stroke': this.start_stroke,
            'apply_to_svg': this.apply_to_svg,
            'clear': this.clear,
            'to_mp4': this.to_mp4,
            'make_mp4': this.make_mp4,
        }
    }
    get_cmd_tools(param) {
        return {
            'add_line': `add_line(${param});`,
            'add_curve': `add_curve(${param});`,
            'end_stroke': `end_stroke();`,
            'add_moving': `add_moving(${param});`,
            'start_stroke': `start_stroke(${param});`,
            'apply_to_svg': `apply_to_svg();`,
            'clear': `clear();`,
            'make_mp4': `make_mp4();`,
        }
    }
    get_cmd_tools_params() {
        return {
            'add_line': 2,
            'add_curve': 3,
            'end_stroke': 0,
            'add_moving': 1,
            'start_stroke': 1,
            'apply_to_svg': 0,
            'clear': 0,
            'make_mp4': 0,
        }
    }
    apply_to_svg() {
        var tempcopy = this.svgtemp;
        var strokes_list = ``;
        this.strokes.forEach((val, idx, arr) => {
            if (typeof val !== 'string') {
                return;
            }
            arr[idx] = arr[idx].replaceAll('\n', '');
            var stroke_len = 0;
            var splitstroke = [];
            val = val.replaceAll('  ', ' ');
            splitstroke = val.split('m')/*.map((val0, idx0, arr0) => {
                return (val0 + ((idx0 < arr0 - 1) ? 'm' : '')).split('M').map((val1, idx1, arr1) => {
                    return (val1 + ((idx1 < arr1 - 1) ? 'M' : '')).split('A').map((val2, idx2, arr2) => {
                        return (val2 + ((idx2 < arr2 - 1) ? 'A' : '')).split('a').map((val3, idx3, arr3) => {
                            return (val3 + ((idx3 < arr3 - 1) ? 'a' : '')).split('C').map((val4, idx4, arr4) => {
                                return (val4 + ((idx4 < arr4 - 1) ? 'C' : '')).split('c').map((val5, idx5, arr5) => {
                                    return (val5 + ((idx5 < arr5 - 1) ? 'c' : '')).split('L').map((val6, idx6, arr6) => {
                                        return (val6 + ((idx6 < arr6 - 1) ? 'L' : '')).split('l').map((val7, idx7, arr7) => {
                                            return val7 + ((idx7 < arr7 - 1) ? 'l' : '');
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            })*/.map((val0, idx0, arr0) => {
                return ((idx0 !== 0 ? 'm' : '') + val0).split('M').map((val1, idx1, arr1) => {
                    return ((idx1 !== 0 ? 'M' : '') + val1).split('A').map((val2, idx2, arr2) => {
                        return ((idx2 !== 0 ? 'A' : '') + val2).split('a').map((val3, idx3, arr3) => {
                            return ((idx3 !== 0 ? 'a' : '') + val3).split('C').map((val4, idx4, arr4) => {
                                return ((idx4 !== 0 ? 'C' : '') + val4).split('c').map((val5, idx5, arr5) => {
                                    return ((idx5 !== 0 ? 'c' : '') + val5).split('L').map((val6, idx6, arr6) => {
                                        return ((idx6 !== 0 ? 'L' : '') + val6).split('l').map((val7, idx7, arr7) => {
                                            return (idx7 !== 0 ? 'l' : '') + val7;
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }).flat(10);
            console.log(splitstroke);
            splitstroke.forEach((val0, idx0, arr0) => {
                console.log(val0);
                if (val0.startsWith('m') || val0.startsWith('M')) {
                    stroke_len += 0;
                } else if (val0.startsWith('C')) {
                    var val0vals = val0.replace('C', '').split(' ').map((val1, idx1, arr1) => {
                        return parseFloat(val1);
                    });
                    /* var abc0 = val0vals[5] - val0vals[1];
                    var abc1 = val0vals[4] - val0vals[0];
                    var abc2 = val0vals[3] - val0vals[1];
                    var abc3 = val0vals[2] - val0vals[0];
                    if (abc1 === 0) {
                        var a = Math.abs(abc3);
                        var b = Math.abs(abc2);
                        var a_0 = Math.PI - ((Math.atan(b / a)) * 2);
                        var r = (1 / Math.cos((Math.PI / 2) - a_0)) * b;
                        var l_0 = r * 2 * Math.PI * ((a_0 * 2) / (Math.PI * 2));
                        stroke_len += Math.ceil(l_0);
                    } else if (abc0 === 0) {
                        var a = Math.abs(abc2);
                        var b = Math.abs(abc3);
                        var a_0 = Math.PI - ((Math.atan(b / a)) * 2);
                        var r = (1 / Math.cos((Math.PI / 2) - a_0)) * b;
                        var l_0 = (r * 2 * Math.PI) * ((a_0 * 2) / (Math.PI * 2));
                        stroke_len += Math.ceil(l_0);
                    } */
                    var mstr = arr[idx0 - 1] || 'M' + val0vals[0] + ' ' + val0vals[1];
                    var mpoint = mstr.replace(/\w/g, ' ').replaceAll(/\s+/g, ' ').split(' ');
                    stroke_len += Math.ceil(cubicBezierLength([mpoint[mpoint.length - 2], mpoint[mpoint.length - 1]], [val0vals[0], val0vals[1]], [val0vals[2], val0vals[3]], [val0vals[4], val0vals[5]], 200))
                } else if (val0.startsWith('L')) {
                    var val0vals = val0.replace(/[MLAC]/gi, '').split(' ').map((val1, idx1, arr1) => {
                        console.log(parseFloat(val1));
                        return parseFloat(val1);
                    });
                    stroke_len += Math.ceil(((Math.abs(val0vals[0] - val0vals[2]) ** 2) + (Math.abs(val0vals[1] - val0vals[3]) ** 2)) ** (1 / 2));
                }
            });
            strokes_list += this.stroketemp.replaceAll('@@stroke-dashoffset@@', new String(stroke_len)).replace('@@stroke-dashoffset-2@@', idx === 0 ? new String(stroke_len) + ';0' : idx === arr.length - 1 ? new String(stroke_len) + ';' + new String(stroke_len) : new String(stroke_len) + ';' + new String(stroke_len) + ';0').replace('@@stroke-path@@', val).replace('@@stroke-keytime@@', idx === 0 ? 1 / (arr.length) : idx === arr.length - 1 ? (arr.length - 1) / (arr.length) : (idx / (arr.length)) + ';' + ((idx + 1) / (arr.length)));
        });
        tempcopy = tempcopy.replace('@@strokes-list@@', strokes_list).replace('@@strokes-path@@', this.strokes.join(' ')).replace('@@marks@@', this.marking ? this.marks.map((val, idx, arr) => { return `<circle fill="#c00020" r="8.5" cx="${val.x}" cy="${val.y}" marker-id="${val.id}" ismarker="true" />`; }).join('') : '');
        this.svgelparent.innerHTML = tempcopy;
        if (this.marking) {
            this.remove_key_listeners();
            this.add_mark_click_listener();
        }/*  else {
            this.remove_key_listeners();
            this.remove_mark_click_listener();
        } */
        return tempcopy;
    }
    clear() {
        this.strokes = [];
    }
    send_imgs(time, framerate) {
        if (typeof framerate !== 'number' || isNaN(framerate) || typeof time !== 'number' || isNaN(time)) {
            return false;
        }
        function draw_and_send(img, canv, ctx, timestamp, framerate, len, id) {
            if (timestamp > len || !(ctx instanceof CanvasRenderingContext2D) || !(img instanceof Image || img instanceof HTMLImageElement) || !(canv instanceof HTMLCanvasElement)) {
                return;
            }
            ctx.drawImage(img, 0, 0);
            var dataurl = canv.toDataURL('image/png');
            fetch("q0.r-e.kr:1717/frame", { method: "POST", body: new Blob([dataurl], { 'type': 'image/png' }), headers: { 'work-idx': id }, mode: 'no-cors' });
            setTimeout(() => { draw_and_send(img, canv, ctx, timestamp + 1, framerate, len, id); }, 1000 / framerate);
        }
        draw_and_send(this.imgel, this.canvasel, this.canvas_ctx, 0, framerate, time, this.id);
    }
    to_mp4(cbfunc, { len, framerate }) {
        fetch("q0.r-e.kr:1717/lastreqidx", { mode: 'no-cors' }).then((data0) => {
            return data0.text();
        }).then((data) => {
            this.id = data;
            toDataURL(new Blob([this.svgelparent.innerHTML], { 'type': 'image/svg+xml' }), (param) => {
                this.imgel.src = param;
                this.send_imgs(len, framerate);
                setTimeout(() => {
                    if (typeof cbfunc === 'function') {
                        cbfunc();
                    }
                }, (1000 / framerate) * len);
            });
        });
    }
    make_mp4({ len, framerate }) {
        this.to_mp4(() => {
            fetch("q0.r-e.kr:1717/result/" + this.id, { mode: 'no-cors' }).then((data) => {
                var alink_pr = document.createElement("a");
                alink_pr.href = "/result/" + this.id;
                alink_pr.download = 'download.mp4';
                var alink = document.body.appendChild(alink_pr);
                alink.click();
            });
        }, { len, framerate });
    }
    set_clicktodraw(boolparam) {
        this.clicktodraw = !(!boolparam);
    }
    select_tool(toolname) {
        if (typeof toolname === 'string' || toolname instanceof String) {
            this.pointednow.selected_tool = toolname;
        }
    }
    set_marking(boolparam) {
        this.marking = !(!boolparam);
    }
    set_stroke({ bgstroke_width, stroke_width, stroke_colour } = { bgstroke_width: 21.6, stroke_width: 14.4, stroke_colour: '#202020' }) {
        this.bgstroke_width = bgstroke_width;
        this.stroke_width = stroke_width;
        this.stroke_colour = stroke_colour;
        this.stroketemp = `
        <path stroke="${this.stroke_colour}" stroke-dasharray="@@stroke-dashoffset@@" stroke-dashoffset="@@stroke-dashoffset@@" stroke-linecap="square" stroke-opacity="0.8" stroke-width="${this.stroke_width}" d="@@stroke-path@@">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;@@stroke-keytime@@;1" repeatCount="indefinite" values="@@stroke-dashoffset-2@@;0" />
        </path>`;
        this.stroketemp = `
        <path stroke="${this.stroke_colour}" stroke-dasharray="@@stroke-dashoffset@@" stroke-dashoffset="@@stroke-dashoffset@@" stroke-linecap="square" stroke-opacity="0.8" stroke-width="${this.stroke_width}" d="@@stroke-path@@">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;@@stroke-keytime@@;1" repeatCount="indefinite" values="@@stroke-dashoffset-2@@;0" />
        </path>`;
        this.svgtemp = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">
    <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="2" />
    <g class="bg">
    <path d="M0 20 L0 20 360 20 M0 40 L0 40 360 40 M0 60 L0 60 360 60 M0 80 L0 80 360 80 M0 100 L0 100 360 100 M0 120 L0 120 360 120 M0 140 L0 140 360 140 M0 160 L0 160 360 160 M0 180 L0 180 360 180 M0 200 L0 200 360 200 M0 220 L0 220 360 220 M0 240 L0 240 360 240 M0 260 L0 260 360 260 M0 280 L0 280 360 280 M0 300 L0 300 360 300 M0 320 L0 320 360 320 M0 340 L0 340 360 340Z" stroke="#000000" fill="none" />
    <path d="M20 0 L20 0 20 360 M40 0 L40 0 40 360 M60 0 L60 0 60 360 M80 0 L80 0 80 360 M100 0 L100 0 100 360 M120 0 L120 0 120 360 M140 0 L140 0 140 360 M160 0 L160 0 160 360 M180 0 L180 0 180 360 M200 0 L200 0 200 360 M220 0 L220 0 220 360 M240 0 L240 0 240 360 M260 0 L260 0 260 360 M280 0 L280 0 280 360 M300 0 L300 0 300 360 M320 0 L320 0 320 360 M340 0 L340 0 340 360Z" stroke="#000000" fill="none" /></g>
    <g fill="none" stroke-linejoin="round" class="character_group">
        <path stroke="#AAA" stroke-linecap="round" stroke-opacity="1.0" stroke-width="${this.bgstroke_width}" d="@@strokes-path@@" />
        @@strokes-list@@
    </g>
    <g class="points">@@marks@@</g>
</svg>`;
    }
    remove_stroke(idx) {
        delete this.strokes[idx];
        this.strokes = this.strokes.filter(val => typeof val === 'string');
    }
    marker_click_listener(ev) {
        var x1 = ev.target.cx?.baseVal?.value || ev.target.cx, y1 = ev.target.cy?.baseVal?.value || ev.target.c;
        var x0, y0;
        var x01, y01;
        console.log(this.pressed_keys);
        if (this.pressed_keys.includes(0x4c)) {
            //keyL
            x0 = this.selected_marks[this.selected_marks.length - 1]?.x, y0 = this.selected_marks[this, this.selected_marks.length - 1]?.y;
            if (x0 && y0 && x1 && y1) {
                this.add_line(x0 + ' ' + y0, x1 + ' ' + y1, false);
            }
        }
        if (this.pressed_keys.includes(0x43)) {
            //keyC
            x0 = this.selected_marks[this.selected_marks.length - 1]?.x, y0 = this.selected_marks[this, this.selected_marks.length - 1]?.y;
            x01 = this.selected_marks[this.selected_marks.length - 2]?.x, y01 = this.selected_marks[this, this.selected_marks.length - 2]?.y;
            if (x0 && y0 && x1 && y1 && x01 && y01) {
                this.add_curve(x01 + ' ' + y01, x0 + ' ' + y0, x1 + ' ' + y1, false);
            }
        }
        if (this.pressed_keys.includes(0x4d)) {
            // keyM
            console.log(ev);
            this.add_moving(x1 + ' ' + y1, false);
        }
        if (this.pressed_keys.includes(0x42)) {
            // keyB
            this.start_stroke(x1 + ' ' + y1);
        }
        if (this.pressed_keys.includes(0x45)) {
            // keyE
            this.end_stroke(x1 + ' ' + y1);
        }
        if (this.pressed_keys.includes(0x53)) {
            //keyS
            if (this.pressed_keys.includes(0x55)) {
                //keyU
                if (this.pressed_keys.includes(0x54)){
                    //keyT
                    this.selected_marks=[];
                }
                var foundIndex= this.selected_marks.findIndex((val) => val?.id == Number(ev.target.getAttribute("marker-id")));
                if (foundIndex>=0){
                    this.selected_marks.splice(foundIndex,1);
                }
            } else {
                var themarker = this.marks.find((val) => val?.id == Number(ev.target.getAttribute("marker-id")));
                if (themarker) {
                    this.selected_marks.push(themarker);
                }
            }
        }
        if (this.pressed_keys.includes(0x11) && this.pressed_keys.includes(0x16) && this.pressed_keys.includes(0x41)) {
            // Ctrl+Shift+A
            this.apply_to_svg();
        }
    }
    keydown_listener(ev) {
        ev.preventDefault();
        this.pressed_keys.push(ev.keyCode);
        return ev.preventDefault();
    }
    keyup_listener(ev) {
        ev.preventDefault();
        var target_idx = this.pressed_keys.indexOf(ev.keyCode);
        if (target_idx >= 0) {
            this.pressed_keys.splice(target_idx);
        }
        return ev.preventDefault();
    }
    add_key_listeners() {
        this.svgelparent.addEventListener("keydown", this.keydown_listener.bind(this));
        this.svgelparent.addEventListener("keyup", this.keyup_listener.bind(this));
    }
    remove_key_listeners() {
        this.svgelparent.removeEventListener("keydown", this.keydown_listener.bind(this));
        this.svgelparent.removeEventListener("keyup", this.keyup_listener.bind(this));
    }
    add_mark_click_listener() {
        Array.from(this.svgelparent.getElementsByTagNameNS('http://www.w3.org/2000/svg', "circle")).filter(el => !isNaN(Number(el.getAttribute("marker-id")))).forEach((el, idx, arr) => {
            console.log(el);
            el.addEventListener("click", this.marker_click_listener.bind(this));
        });
    }
    remove_mark_click_listener() {
        Array.from(this.svgelparent.getElementsByTagNameNS('http://www.w3.org/2000/svg', "circle")).filter(el => !isNaN(Number(el.getAttribute("marker-id")))).forEach((el, idx, arr) => {
            el.removeEventListener("click", this.marker_click_listener.bind(this));
        });
    }
}
/* <svg xmlns="http://www.w3.org/2000/svg" width="360" height="360">
    <rect width="100%" height="100%" fill="#fff" />
    <g fill="none" stroke-linejoin="round" class="character_group" transform="translate(400 196) scale(0.5)">
        <path stroke="#AAA" stroke-linecap="round" stroke-opacity="1.0" stroke-width="21.6" d="M90 95h80m-40-45h0v85m-40 0v90m0-90h80v90m-80-45h80m-80 45h80m-80 40h80m-40-40v95m80-245h85v35m-35-60v60m-60 0h120m-105 25v55m0-55h90v55m-90 0h90m-105 30h120m-105 0v40h95m-50-40v100" />
        <path stroke="#202020" stroke-dasharray="80" stroke-dashoffset="80" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M90 95h80">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.04;1" repeatCount="indefinite" values="80;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="85" stroke-dashoffset="85" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M130 50v85">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.04;0.0625;1" repeatCount="indefinite" values="85;85;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="90" stroke-dashoffset="90" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M90 135v90">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.0625;0.125;1" repeatCount="indefinite" values="90;90;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="170" stroke-dashoffset="170" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M90 135h80v90m-80-90">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.125;0.1875;1" repeatCount="indefinite" values="170;170;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="80" stroke-dashoffset="80" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M90 180h80">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.1875;0.25;1" repeatCount="indefinite" values="80;80;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="80" stroke-dashoffset="80" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M90 225h80">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.25;0.3125;1" repeatCount="indefinite" values="80;80;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="80" stroke-dashoffset="80" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M90 265h80">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.3125;0.375;1" repeatCount="indefinite" values="80;80;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="95" stroke-dashoffset="95" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M130 225v95">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.375;0.4375;1" repeatCount="indefinite" values="95;95;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="120" stroke-dashoffset="120" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M210 75h85v35m-35-60">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.4375;0.50;1" repeatCount="indefinite" values="120;120;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="60" stroke-dashoffset="60" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M260 50v60">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.50;0.5625;1" repeatCount="indefinite" values="60;60;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="120" stroke-dashoffset="120" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M200 110h120">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.5625;0.625;1" repeatCount="indefinite" values="120;120;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="55" stroke-dashoffset="55" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M215 135v55">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.625;0.6875;1" repeatCount="indefinite" values="55;55;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="145" stroke-dashoffset="145" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M215 135h90v55m-90 0">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.6875;0.75;1" repeatCount="indefinite" values="145;145;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="90" stroke-dashoffset="90" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M215 190h90">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.75;0.8125;1" repeatCount="indefinite" values="90;90;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="120" stroke-dashoffset="120" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M200 220h120">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.8125;0.875;1" repeatCount="indefinite" values="120;120;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="135" stroke-dashoffset="135" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M215 220v40h95m-50-40">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.875;0.9375;1" repeatCount="indefinite" values="135;135;0;0" />
        </path>
        <path stroke="#202020" stroke-dasharray="100" stroke-dashoffset="100" stroke-linecap="square" stroke-opacity="0.8" stroke-width="14.4" d="M260 220v100">
            <animate attributeName="stroke-dashoffset" begin="0s" calcMode="linear" dur="12s" keyTimes="0;0.9375;1" repeatCount="indefinite" values="100;100;0" />
        </path>
    </g>
</svg> */