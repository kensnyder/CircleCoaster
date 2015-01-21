/*
 * CircleCoaster - A roller coaster animation in CSS3
 * https://github.com/kensnyder/CircleCoaster
 * Version 1.0.0
 * Copyright (c) 2015 Ken Snyder; Licensed MIT 
 */
(function(global) {
    "use strict";

    function CircleCoaster() {
		this.initialize.apply(this, [].slice.call(arguments));
	}
	/**
	 * Check if browser is capable of animations with keyframes
	 * @method isSupported
	 * @static
	 * @return {Boolean}
	 */
    CircleCoaster.isSupported = function isSupported() {
        var style = document.createElement('div').style;
        return (
            typeof style.animation != 'undefined' ||
            typeof style.webkitAnimation != 'undefined'
        );
    };
    // See constructor for meaning of options
    CircleCoaster.defaultOptions = {
        // basic options
        size: 32,
        speed: 1.25,
        dots: 5,
        color: '#666666',
        // advanced options    
        angles: [-82, -70, -56, -38, -8, 30, 70, 105, 128, 145, 157, 169, 181, 193, 205, 217, 229, 241, 253, 265, -82],
        cssTpl: '\
.cc-spinner-{{spec}} {\n\
  width: {{size}}px;\n\
  height: {{size}}px;\n\
  position: relative;\n\
  display: inline-block;\n\
}\n\
.cc-spinner-{{spec}} .cc-dot {\n\
  position: absolute;\n\
  top: 0;\n\
  left: 0;\n\
  height: {{dotSize}}px;\n\
  width: {{dotSize}}px;\n\
  border-radius: {{dotRadius}}px;\n\
  background-color: {{color}};\n\
  transform: translate({{startX}}px, {{startY}}px);\n\
  -webkit-transform: translate({{startX}}px, {{startY}}px);\n\
  animation: cc-{{spec}} {{speed}}s linear 0s infinite;\n\
  -webkit-animation: cc-{{spec}} {{speed}}s linear 0s infinite;\n\
}\n\
{{#each dots}}\
.cc-spinner-{{spec}} .cc-dot{{idx}} {\n\
  animation-delay: {{delay}}ms;\n\
  -webkit-animation-delay: {{delay}}ms;\n\
}\n\
{{/each}}',
        htmlTpl: '\
<div class="cc-spinner cc-spinner-{{spec}}">\n\
{{#each dots}}\
  <div class="cc-dot cc-dot{{idx}}"></div>\n\
{{/each}}\
</div>'
    };

    function extend( /*destination, source1, source2, sourceN*/ ) {
        var p, d = arguments[0];
        for (var i = 1, len = arguments.length; i < len; i++) {
            for (p in arguments[i]) {
                if (arguments[i].hasOwnProperty(p)) {
                    d[p] = arguments[i][p];
                }
            }
        }
        return d;
    }
    CircleCoaster.prototype = {
        /**
         * Construct the coaster with the given options
         * @constructor
         * @param {Object} [options]  The options to use override CircleCoaster.defaultOptions
         * @param {Number} [options.size=32]  The size in pixels of the spinner
         * @param {Number} [options.speed=1.25]  The time in seconds it should take a dot to make one revolution
         * @param {Number} [options.dots=5]  The number of dots to use in the circle
         * @param {String} [options.color=#666666]  The color of each dot (e.g. "#ff8800", "blue", "rgba(0,0,0,0.5)")
         * @param {Number[]} [options.angles]  An array with a list of degree angles to use for keyframes (see source for example)
         * @param {String} [options.cssTpl]  A custom CSS template for the dots (see source for example)
         * @param {String} [options.htmlTpl]  A custom HTML template for the dots (see source for example)
         */
        initialize: function initialize(options) {
            this.options = extend({}, CircleCoaster.defaultOptions, options || {});
            this.spec = this._getSpec();
            this.keyframes = this._buildKeyframes();
            this.htmlBuilder = this._compile(this.options.htmlTpl);
            this.cssBuilder = this._compile(this.options.cssTpl);
        },
        /**
         * Get a string representing the combination of options (e.g. used to allow multiple spinner styles per page)
         * @method _getSpec
         * @private
         * @return {undefined}
         */
        _getSpec: function _getSpec() {
            return [
                this.options.size,
                this.options.speed,
                this.options.dots,
                this.options.color.replace('#', '')
            ].join('-').replace(/[^\w-]+/g, '_');
        },
        /**
         * Build the CSS used for keyframes
         * @method _buildKeyframes
         * @private
         * @return {Object}  Object with properties css, startX, startY
         */
        _buildKeyframes: function _buildKeyframes() {
            var sizeSansDot = this.options.size - Math.ceil(this.options.size / 9);
            var lines = [];
            var rad = Math.PI / 180;
            var interval = 100 / (this.options.angles.length - 1);
            var a, x, y;
            for (var i = 0; i < this.options.angles.length; i++) {
                a = this.options.angles[i];
                x = (sizeSansDot / 2 * Math.cos(a * rad) + sizeSansDot / 2).toFixed(1);
                y = (sizeSansDot / 2 * Math.sin(a * rad) + sizeSansDot / 2).toFixed(1);
                lines.push('  ' + this._calcPrecision(i * interval) + '% { transform: translate(' + x + 'px, ' + y + 'px); }');
            }
            lines.unshift('@keyframes cc-' + this.spec + ' {');
            lines.push('}');
            var css = lines.join('\n');
            css += '\n' + css.replace(/@keyframes/g, '@-webkit-keyframes').replace(/transform/g, '-webkit-transform')
            return {
                css: css,
                startX: x,
                startY: y
            };
        },
        /**
         * If number is a decimal, round to 2 decimal points; if a whole number, return the number as a string
         * Used by _buildKeyFrames() to calculate the percentages for the keyframes
         * @method _calcPrecision
         * @private
         * @param {Number} n
         * @return {String}
         */
        _calcPrecision: function _calcPrecision(n) {
            if (n % 1 !== 0) {
                return n.toFixed(2);
            }
            return String(n);
        },
        /**
         * Super simple implementation of some handlebar syntax
         * @method _compile
         * @private
         * @param {String} s  The template string
         * @return {Function}  A function in which a data object can be passed and a string is returned
         */
        _compile: function _compile(s) {
            var uid = 0;
            s = s.replace(/\n/g, '\\n\\\n');
            // {{each}} blocks
            s = s.replace(/\{\{#each ([\w_]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, function($a0, $a1, $a2) {
                return '\';\nfor (var i# = 0, len# = (data.' + $a1 + ' || []).length; i# < len#; i#++) {\n  out += \'' +
                    $a2.replace(/\{\{([\w_]+)\}\}/g, function($b0, $b1) {
                        return '\' + (data.' + $a1 + '[i#].' + $b1 + ' || data.' + $b1 + ') + \'';
                    }) + '\';\n}\nout += \'';
            }).replace(/#/g, ++uid);
            // {{variable}} replacements
            s = s.replace(/\{\{([\w_]+)\}\}/g, function($a0, $a1) {
                return '\' + data.' + $a1 + ' + \'';
            });
            // prepare for function content
            s = 'var out = "";\nout += \'' + s + '\';\nreturn out;';
            // return compilation as a function
            return new Function('data', s);
        },
        /**
         * Generate the HTML based on the instance's options
         * @method generateHtml
         * @return {String}  The HTML to use
         */
        generateHtml: function generateHtml() {
            var dots = [];
            for (var i = 0; i < this.options.dots; i++) {
                dots[i] = {
                    idx: i + 1
                };
            }
            return this.htmlBuilder({
                spec: this.spec,
                dots: dots
            });
        },
        /**
         * Generate the CSS based on the instance's options
         * @method generateCss
         * @return {String}  The CSS to use
         */
        generateCss: function generateCss() {
            var dots = [];
            for (var i = 0; i < this.options.dots; i++) {
                dots[i] = {
                    idx: i + 1,
                    delay: Math.round(this.options.speed * 100 * (i + 1))
                };
            }
            return this.keyframes.css + '\n' + this.cssBuilder({
                spec: this.spec,
                size: this.options.size,
                speed: this.options.speed,
                color: this.options.color,
                dotSize: Math.ceil(this.options.size / 9),
                dotRadius: Math.ceil(Math.ceil(this.options.size / 9) / 2),
                startX: this.keyframes.startX,
                startY: this.keyframes.startY,
                dots: dots
            });
        },
        /**
         * Append a style elment and set the textContent to the generated CSS
         * @method appendStyleElement
         * @return {HTMLElement}  The new style element
         */
        appendStyleElement: function appendStyleElement() {
            var id = 'cc-style-' + this.spec;
            if (document.getElementById(id)) {
                return;
            }
            var style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.setAttribute('id', id);
            style.textContent = this.generateCss();
            (document.body || document.getElementsByTagName('body')[0]).appendChild(style);
            return style;
        },
        /**
         * Render the spinner as the only child of the given element
         * @method inject
         * @param {HTMLElement} toElement  The element whose innerHTML to set
         * @return {CircleCoaster}  This instance
         * @chainable
         */
        inject: function inject(toElement) {
            this.appendStyleElement();
            toElement.innerHTML = this.generateHtml();
            return this;
        },
        /**
         * Render the spinner and append it to the given element
         * @method append
         * @param {HTMLElement} toElement  The element to which to append the spinner
         * @return {CircleCoaster}  This instance
         * @chainable
         */
        append: function append(toElement) {
            this.appendStyleElement();
            var div = document.createElement('div');
            div.innerHTML = this.generateHtml();
            toElement.appendChild(div.firstChild);
            return this;
        },
        /**
         * Remove any spinners inside of the given element (or document)
         * @method remove
         * @param {HTMLElement} fromElement  The element to search within
         * @return {CircleCoaster}  This instance
         * @chainable
         */
        remove: function remove(fromElement) {
            [].forEach.call((fromElement || document).querySelectorAll('cc-spinner-' + this.spec), function(el) {
                el.parentNode.removeChild(el);
            });
            return this;
        }
    };
    // add jQuery plugin if jQuery exists
    if (window.jQuery && window.jQuery.fn) {
        jQuery.fn.circleCoaster = function(options) {
            var cc = new CircleCoaster(options);
            this.each(function injectIntoEachNode() {
                (options.append ? cc.append : cc.inject).call(cc, this);
            });
            return this;
        };
        jQuery.CircleCoaster = CircleCoaster;
    }
    global.CircleCoaster = CircleCoaster;
})(window);