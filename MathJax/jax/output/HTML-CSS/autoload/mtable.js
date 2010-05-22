/*************************************************************
 *
 *  MathJax/jax/output/HTML-CSS/autoload/mtable.js
 *  
 *  Implements the HTML-CSS output for <mtable> elements.
 *
 *  ---------------------------------------------------------------------
 *  
 *  Copyright (c) 2010 Design Science, Inc.
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (MML,HTMLCSS) {
  
  MML.mtable.Augment({
    toHTML: function (span) {
      span = this.HTMLcreateSpan(span);
      if (this.data.length === 0) {return span}
      var values = this.getValues("columnalign","rowalign","columnspacing","rowspacing",
                                  "columnwidth","equalcolumns","equalrows",
                                  "columnlines","rowlines","frame","framespacing",
                                  "align","useHeight","width","side","minlabelspacing");
      //  FIXME:  handle explicit widths with more than one column
      var WIDTH = (String(values.width).match(/%$/) ? values.width : null);
      var stack = HTMLCSS.createStack(span,false,WIDTH);
      var scale = this.HTMLgetScale(); var LABEL = -1;

      var CWIDTH = values.columnwidth.split(/ /), RCALIGN = [];
      var H = [], D = [], W = [], A = [], C = [], i, j, J = 0, m, M, s, row;
      var LHD = HTMLCSS.FONTDATA.baselineskip * scale * values.useHeight,
          LH = HTMLCSS.FONTDATA.lineH * scale, LD = HTMLCSS.FONTDATA.lineD * scale;

      //
      //  Get column widths
      //
      for(i = 0, m = CWIDTH.length; i < m; i++) {
        if (CWIDTH[i] === "auto") {CWIDTH[i] = (m == 1 && WIDTH ? "100%" : null)}
        else if (CWIDTH[i] === "fit") {CWIDTH[i] = null}
        else if (!CWIDTH[i].match(/%$/)) {CWIDTH[i] = HTMLCSS.length2em(CWIDTH[i])}
        // FIXME:  still need to handle percentage widths
        // FIXME:  handle "fit" properly
        // FIXME:  handle fixed width columns whose content is too long
      }
      
      //
      //  Create cells and measure columns and rows
      //
      for (i = 0, m = this.data.length; i < m; i++) {
        row = this.data[i]; s = (row.type === "mlabeledtr" ? LABEL : 0);
        A[i] = []; H[i] = D[i] = 0; RCALIGN[i] = [];
        if (row.columnalign) {
          RCALIGN[i] = row.columnalign.split(/ /);
          while (RCALIGN[i].length <= row.data.length+s) {RCALIGN[i].push(RCALIGN[i][RCALIGN[i].length-1])}
        }
        for (j = s, M = row.data.length + s; j < M; j++) {
          if (W[j] == null) {
            if (j > J) {
              J = j;
              while (CWIDTH.length <= J) {CWIDTH.push(CWIDTH[CWIDTH.length-1])}
            }
            C[j] = HTMLCSS.createStack(HTMLCSS.createBox(stack,CWIDTH[j]),false,CWIDTH[j]);
            W[j] = (CWIDTH[j] && !String(CWIDTH[j]).match(/%$/) ? CWIDTH[j] : -HTMLCSS.BIGDIMEN);
          }
          A[i][j] = HTMLCSS.createBox(C[j]);
          HTMLCSS.Measured(row.data[j-s].toHTML(A[i][j]),A[i][j]);
          if (A[i][j].bbox.h > H[i]) {H[i] = A[i][j].bbox.h}
          if (A[i][j].bbox.d > D[i]) {D[i] = A[i][j].bbox.d}
          if (A[i][j].bbox.w > W[j]) {W[j] = A[i][j].bbox.w}
        }
      }
      if (H[0]+D[0]) {H[0] = Math.max(H[0],LH)}
      if (H[A.length-1]+D[A.length-1]) {D[A.length-1] = Math.max(D[A.length-1],LD)}
      //
      //  Equal heights and widths
      //
      if (values.equalcolumns) {
        var Wm = Math.max.apply(Math,W);
        for (j = 0; j <= J; j++) {HTMLCSS.setStackWidth(C[j],Wm); W[j] = Wm}
      }
      if (values.equalrows) {
        // FIXME:  should really be based on row align (below is for baseline)
        var Hm = Math.max.apply(Math,H), Dm = Math.max.apply(Math,D);
        for (i = 0, m = A.length; i < m; i++)
          {s = ((Hm + Dm) - (H[i] + D[i])) / 2;  H[i] += s; D[i] += s}
      }
      
      //  FIXME:  handle stretchy mtd's
      
      //
      //  Determine spacing and alignment
      //
      var CSPACE = values.columnspacing.split(/ /),
          RSPACE = values.rowspacing.split(/ /),
          CALIGN = values.columnalign.split(/ /),
          RALIGN = values.rowalign.split(/ /),
          CLINES = values.columnlines.split(/ /),
          RLINES = values.rowlines.split(/ /);
      for (i = 0, m = CSPACE.length; i < m; i++) {CSPACE[i] = HTMLCSS.length2em(CSPACE[i])}
      for (i = 0, m = RSPACE.length; i < m; i++) {RSPACE[i] = HTMLCSS.length2em(RSPACE[i])}
      while (CSPACE.length <= J) {CSPACE.push(CSPACE[CSPACE.length-1])}
      while (CALIGN.length <= J) {CALIGN.push(CALIGN[CALIGN.length-1])}
      while (CLINES.length <= J) {CLINES.push(CLINES[CLINES.length-1])}
      while (RSPACE.length <= A.length) {RSPACE.push(RSPACE[RSPACE.length-1])}
      while (RALIGN.length <= A.length) {RALIGN.push(RALIGN[RALIGN.length-1])}
      while (RLINES.length <= A.length) {RLINES.push(RLINES[RLINES.length-1])}
      if (C[LABEL]) {
        CALIGN[LABEL] = (values.side.substr(0,1) === "l" ? "left" : "right");
        CSPACE[LABEL] = -W[LABEL];
      }
      //
      //  Determine array total height
      //
      var HD = H[0] + D[A.length-1];
      for (i = 0, m = A.length-1; i < m; i++) {HD += Math.max((H[i]+D[i] ? LHD : 0),D[i]+H[i+1]+RSPACE[i])}
      //
      //  Determine frame and line sizes
      //
      var fx = 0, fy = 0, fW, fH = HD;
      if (values.frame !== "none" ||
         (values.columnlines+values.rowlines).match(/solid|dashed/)) {
        fx = HTMLCSS.length2em(values.framespacing.split(/[, ]+/)[0]);
        fy = HTMLCSS.length2em(values.framespacing.split(/[, ]+/)[1]);
        fH = HD + 2*fy; // fW waits until stack.bbox.w is determined
      }
      //
      //  Compute alignment
      //
      var Y, fY;
      if (String(values.align).match(/^\d+$/)) {
        // FIXME: do row-based alignment
        Y = HD/2 + HTMLCSS.TeX.axis_height*scale - H[0];
      } else {
        Y = ({
          top:    -(H[0] + fy),
          bottom:   HD + fy - H[0],
          center:   HD/2 - H[0],
          baseline: HD/2 - H[0],
          axis:     HD/2 + HTMLCSS.TeX.axis_height*scale - H[0]
        })[values.align];
        fY = ({
          top:      -(HD + 2*fy),
          bottom:   0,
          center:   -(HD/2 + fy),
          baseline: -(HD/2 + fy),
          axis:     HTMLCSS.TeX.axis_height*scale - HD/2 - fy
        })[values.align];
      }
            
      //
      //  Lay out array by columns
      //
      var x = fx, y = Y, dx, dy, line, align; s = (C[LABEL] ? LABEL : 0);
      for (j = s; j <= J; j++) {
        for (i = 0, m = A.length; i < m; i++) {
          if (A[i][j]) {
            s = (this.data[i].type === "mlabeledtr" ? LABEL : 0);
            align = this.data[i].data[j-s].rowalign||this.data[i].rowalign||RALIGN[i];
            dy = ({top:    H[i] - A[i][j].bbox.h,
                   bottom: A[i][j].bbox.d - D[i],
                   center: ((H[i]-D[i]) - (A[i][j].bbox.h-A[i][j].bbox.d))/2,
                   baseline: 0, axis: 0})[align]; // FIXME:  handle axis better?
            align = (this.data[i].data[j-s].columnalign||RCALIGN[i][j]||CALIGN[j])
            HTMLCSS.alignBox(A[i][j],align,y+dy);
          }
          if (i < A.length-1) {y -= Math.max((H[i]+D[i] ? LHD : 0),D[i]+H[i+1]+RSPACE[i])}
        }
        HTMLCSS.placeBox(C[j].parentNode,x,0);
        x += W[j] + CSPACE[j]; y = Y;
        //
        //  Add column lines
        //
        if (CLINES[j] !== "none" && j < J && j !== LABEL) {
          line = HTMLCSS.createRule(stack,fH,0,1.25/HTMLCSS.em); HTMLCSS.addBox(stack,line);
          line.bbox = {h:fH, d:0, w:0, rw:1.25/HTMLCSS.em, lw:0}
          HTMLCSS.placeBox(line,x-CSPACE[j]/2,fY,true); line.style.borderStyle = CLINES[j];
        }
      }
      //
      //  Add frame
      //
      fW = stack.bbox.w + fx; 
      if (values.frame !== "none") {
	var frame = HTMLCSS.createFrame(stack,fH,0,fW,1.25/HTMLCSS.em,values.frame);
        HTMLCSS.addBox(stack,frame);  HTMLCSS.placeBox(frame,0,fY,true);
      }
      //
      //  Add row lines
      //
      y = Y;
      for (i = 0, m = A.length-1; i < m; i++) {
        dy = Math.max(LHD,D[i]+H[i+1]+RSPACE[i]);
        if (RLINES[i] !== "none") {
          line = HTMLCSS.createRule(stack,1.25/HTMLCSS.em,0,fW); HTMLCSS.addBox(stack,line);
          line.bbox = {h:1.25/HTMLCSS.em, d:0, w:fW, rw:fW, lw:0}
          HTMLCSS.placeBox(line,0,y - D[i] - (dy-D[i]-H[i+1])/2,true);
          if (RLINES[i] === "dashed") {
            line.style.borderTop = line.style.height+" "+RLINES[i]; line.style.height = 0;
            line.style.width = line.style.borderLeftWidth; line.style.borderLeft = "";
          }
        }
        y -= dy;
      }
      //
      //  Place the labels, if any
      //
      if (C[LABEL]) {
        var eqn = HTMLCSS.createStack(span,false,"100%");
        var align = HTMLCSS.config.styles[".MathJax_Display"]["text-align"];
        HTMLCSS.addBox(eqn,stack); HTMLCSS.alignBox(stack,align,0);
        HTMLCSS.addBox(eqn,C[LABEL]); HTMLCSS.alignBox(C[LABEL],CALIGN[LABEL],0);
        C[LABEL].style.marginRight = C[LABEL].style.marginLeft =
          HTMLCSS.Em(HTMLCSS.length2em(values.minlabelspacing));
      }
      //
      //  Finish the table
      //
      this.HTMLhandleSpace(span);
      this.HTMLhandleColor(span);
      return span;
    },
    HTMLhandleSpace: function (span) {
      span.style.paddingLeft = span.style.paddingRight = ".1667em";
    }
  });

  MathJax.Hub.Startup.signal.Post("HTML-CSS mtable Ready");
  MathJax.Ajax.loadComplete(HTMLCSS.autoloadDir+"/mtable.js");
  
})(MathJax.ElementJax.mml,MathJax.OutputJax["HTML-CSS"]);

