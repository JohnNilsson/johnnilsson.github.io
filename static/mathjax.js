"use strict"

window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global'
    }
};

var script = document.createElement('script');
script.src = '/mathjax/tex-chtml.js';
script.async = true;
document.head.appendChild(script);