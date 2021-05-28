(() => {
  var __defProp = Object.defineProperty;
  var __export = (target2, all) => {
    for (var name2 in all)
      __defProp(target2, name2, { get: all[name2], enumerable: true });
  };

  // ../../node_modules/@codemirror/next/text/dist/index.js
  var extend = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
  for (let i = 1; i < extend.length; i++)
    extend[i] += extend[i - 1];
  function isExtendingChar(code) {
    for (let i = 1; i < extend.length; i += 2)
      if (extend[i] > code)
        return extend[i - 1] <= code;
    return false;
  }
  function isRegionalIndicator(code) {
    return code >= 127462 && code <= 127487;
  }
  var ZWJ = 8205;
  function findClusterBreak(str, pos, forward = true) {
    return (forward ? nextClusterBreak : prevClusterBreak)(str, pos);
  }
  function nextClusterBreak(str, pos) {
    if (pos == str.length)
      return pos;
    if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
      pos--;
    let prev = codePointAt(str, pos);
    pos += codePointSize(prev);
    while (pos < str.length) {
      let next = codePointAt(str, pos);
      if (prev == ZWJ || next == ZWJ || isExtendingChar(next)) {
        pos += codePointSize(next);
        prev = next;
      } else if (isRegionalIndicator(next)) {
        let countBefore = 0, i = pos - 2;
        while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
          countBefore++;
          i -= 2;
        }
        if (countBefore % 2 == 0)
          break;
        else
          pos += 2;
      } else {
        break;
      }
    }
    return pos;
  }
  function prevClusterBreak(str, pos) {
    while (pos > 0) {
      let found = nextClusterBreak(str, pos - 2);
      if (found < pos)
        return found;
      pos--;
    }
    return 0;
  }
  function surrogateLow(ch) {
    return ch >= 56320 && ch < 57344;
  }
  function surrogateHigh(ch) {
    return ch >= 55296 && ch < 56320;
  }
  function codePointAt(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str.length)
      return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow(code1))
      return code0;
    return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
  }
  function fromCodePoint(code) {
    if (code <= 65535)
      return String.fromCharCode(code);
    code -= 65536;
    return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
  }
  function codePointSize(code) {
    return code < 65536 ? 1 : 2;
  }
  function countColumn(string3, n, tabSize) {
    for (let i = 0; i < string3.length; ) {
      if (string3.charCodeAt(i) == 9) {
        n += tabSize - n % tabSize;
        i++;
      } else {
        n++;
        i = findClusterBreak(string3, i);
      }
    }
    return n;
  }
  function findColumn(string3, n, col, tabSize) {
    for (let i = 0; i < string3.length; ) {
      if (n >= col)
        return { offset: i, leftOver: 0 };
      n += string3.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
      i = findClusterBreak(string3, i);
    }
    return { offset: string3.length, leftOver: col - n };
  }
  var Text = class {
    constructor() {
    }
    lineAt(pos) {
      if (pos < 0 || pos > this.length)
        throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
      return this.lineInner(pos, false, 1, 0);
    }
    line(n) {
      if (n < 1 || n > this.lines)
        throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
      return this.lineInner(n, true, 1, 0);
    }
    replace(from, to, text) {
      let parts = [];
      if (from)
        this.decompose(0, from, parts, 2);
      if (text.length)
        text.decompose(0, text.length, parts, (from ? 1 : 0) | (to < this.length ? 2 : 0));
      if (to < this.length)
        this.decompose(to, this.length, parts, parts.length ? 1 : 0);
      return TextNode.from(parts, this.length - (to - from) + text.length);
    }
    append(other) {
      return this.replace(this.length, this.length, other);
    }
    slice(from, to = this.length) {
      let parts = [];
      this.decompose(from, to, parts, 0);
      return TextNode.from(parts, to - from);
    }
    eq(other) {
      if (other == this)
        return true;
      if (other.length != this.length || other.lines != this.lines)
        return false;
      let a = new RawTextCursor(this), b = new RawTextCursor(other);
      for (; ; ) {
        a.next();
        b.next();
        if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
          return false;
        if (a.done)
          return true;
      }
    }
    iter(dir = 1) {
      return new RawTextCursor(this, dir);
    }
    iterRange(from, to = this.length) {
      return new PartialTextCursor(this, from, to);
    }
    toString() {
      return this.sliceString(0);
    }
    toJSON() {
      let lines = [];
      this.flatten(lines);
      return lines;
    }
    static of(text) {
      if (text.length == 0)
        throw new RangeError("A document must have at least one line");
      if (text.length == 1 && !text[0])
        return Text.empty;
      return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
  };
  if (typeof Symbol != "undefined")
    Text.prototype[Symbol.iterator] = function() {
      return this.iter();
    };
  var TextLeaf = class extends Text {
    constructor(text, length = textLength(text)) {
      super();
      this.text = text;
      this.length = length;
    }
    get lines() {
      return this.text.length;
    }
    get children() {
      return null;
    }
    lineInner(target2, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let string3 = this.text[i], end = offset + string3.length;
        if ((isLine ? line : end) >= target2)
          return new Line(offset, end, line, string3);
        offset = end + 1;
        line++;
      }
    }
    decompose(from, to, target2, open) {
      let text = from <= 0 && to >= this.length ? this : new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
      if (open & 1) {
        let prev = target2.pop();
        let joined = appendText(text.text, prev.text.slice(), 0, text.length);
        if (joined.length <= 32) {
          target2.push(new TextLeaf(joined, prev.length + text.length));
        } else {
          let mid = joined.length >> 1;
          target2.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
        }
      } else {
        target2.push(text);
      }
    }
    replace(from, to, text) {
      if (!(text instanceof TextLeaf))
        return super.replace(from, to, text);
      let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
      let newLen = this.length + text.length - (to - from);
      if (lines.length <= 32)
        return new TextLeaf(lines, newLen);
      return TextNode.from(TextLeaf.split(lines, []), newLen);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      let result = "";
      for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
        let line = this.text[i], end = pos + line.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to > pos)
          result += line.slice(Math.max(0, from - pos), to - pos);
        pos = end + 1;
      }
      return result;
    }
    flatten(target2) {
      for (let line of this.text)
        target2.push(line);
    }
    static split(text, target2) {
      let part = [], len = -1;
      for (let line of text) {
        part.push(line);
        len += line.length + 1;
        if (part.length == 32) {
          target2.push(new TextLeaf(part, len));
          part = [];
          len = -1;
        }
      }
      if (len > -1)
        target2.push(new TextLeaf(part, len));
      return target2;
    }
  };
  var TextNode = class extends Text {
    constructor(children, length) {
      super();
      this.children = children;
      this.length = length;
      this.lines = 0;
      for (let child of children)
        this.lines += child.lines;
    }
    lineInner(target2, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
        if ((isLine ? endLine : end) >= target2)
          return child.lineInner(target2, isLine, line, offset);
        offset = end + 1;
        line = endLine + 1;
      }
    }
    decompose(from, to, target2, open) {
      for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from <= end && to >= pos) {
          let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
          if (pos >= from && end <= to && !childOpen)
            target2.push(child);
          else
            child.decompose(from - pos, to - pos, target2, childOpen);
        }
        pos = end + 1;
      }
    }
    replace(from, to, text) {
      if (text.lines < this.lines)
        for (let i = 0, pos = 0; i < this.children.length; i++) {
          let child = this.children[i], end = pos + child.length;
          if (from >= pos && to <= end) {
            let updated = child.replace(from - pos, to - pos, text);
            let totalLines = this.lines - child.lines + updated.lines;
            if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
              let copy = this.children.slice();
              copy[i] = updated;
              return new TextNode(copy, this.length - (to - from) + text.length);
            }
            return super.replace(pos, end, updated);
          }
          pos = end + 1;
        }
      return super.replace(from, to, text);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      let result = "";
      for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to > pos)
          result += child.sliceString(from - pos, to - pos, lineSep);
        pos = end + 1;
      }
      return result;
    }
    flatten(target2) {
      for (let child of this.children)
        child.flatten(target2);
    }
    static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
      let lines = 0;
      for (let ch of children)
        lines += ch.lines;
      if (lines < 32) {
        let flat = [];
        for (let ch of children)
          ch.flatten(flat);
        return new TextLeaf(flat, length);
      }
      let chunk = Math.max(32, lines >> 5), maxChunk = chunk << 1, minChunk = chunk >> 1;
      let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
      function add2(child) {
        let last;
        if (child.lines > maxChunk && child instanceof TextNode) {
          for (let node of child.children)
            add2(node);
        } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
          flush();
          chunked.push(child);
        } else if (child instanceof TextLeaf && currentLines && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last.lines <= 32) {
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
        } else {
          if (currentLines + child.lines > chunk)
            flush();
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk.push(child);
        }
      }
      function flush() {
        if (currentLines == 0)
          return;
        chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
        currentLen = -1;
        currentLines = currentChunk.length = 0;
      }
      for (let child of children)
        add2(child);
      flush();
      return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
    }
  };
  Text.empty = new TextLeaf([""], 0);
  function textLength(text) {
    let length = -1;
    for (let line of text)
      length += line.length + 1;
    return length;
  }
  function appendText(text, target2, from = 0, to = 1e9) {
    for (let pos = 0, i = 0, first2 = true; i < text.length && pos <= to; i++) {
      let line = text[i], end = pos + line.length;
      if (end >= from) {
        if (end > to)
          line = line.slice(0, to - pos);
        if (pos < from)
          line = line.slice(from - pos);
        if (first2) {
          target2[target2.length - 1] += line;
          first2 = false;
        } else
          target2.push(line);
      }
      pos = end + 1;
    }
    return target2;
  }
  function sliceText(text, from, to) {
    return appendText(text, [""], from, to);
  }
  var RawTextCursor = class {
    constructor(text, dir = 1) {
      this.dir = dir;
      this.done = false;
      this.lineBreak = false;
      this.value = "";
      this.nodes = [text];
      this.offsets = [dir > 0 ? 0 : text instanceof TextLeaf ? text.text.length : text.children.length];
    }
    next(skip = 0) {
      for (; ; ) {
        let last = this.nodes.length - 1;
        if (last < 0) {
          this.done = true;
          this.value = "";
          this.lineBreak = false;
          return this;
        }
        let top2 = this.nodes[last], offset = this.offsets[last];
        let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
        if (offset == (this.dir > 0 ? size : 0)) {
          this.nodes.pop();
          this.offsets.pop();
        } else if (!this.lineBreak && offset != (this.dir > 0 ? 0 : size)) {
          this.lineBreak = true;
          if (skip == 0) {
            this.value = "\n";
            return this;
          }
          skip--;
        } else if (top2 instanceof TextLeaf) {
          let next = top2.text[offset - (this.dir < 0 ? 1 : 0)];
          this.offsets[last] = offset += this.dir;
          this.lineBreak = false;
          if (next.length > Math.max(0, skip)) {
            this.value = skip == 0 ? next : this.dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
            return this;
          }
          skip -= next.length;
        } else {
          let next = top2.children[this.dir > 0 ? offset : offset - 1];
          this.offsets[last] = offset + this.dir;
          this.lineBreak = false;
          if (skip > next.length) {
            skip -= next.length;
          } else {
            this.nodes.push(next);
            this.offsets.push(this.dir > 0 ? 0 : next instanceof TextLeaf ? next.text.length : next.children.length);
          }
        }
      }
    }
  };
  var PartialTextCursor = class {
    constructor(text, start, end) {
      this.value = "";
      this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
      if (start > end) {
        this.skip = text.length - start;
        this.limit = start - end;
      } else {
        this.skip = start;
        this.limit = end - start;
      }
    }
    next(skip = 0) {
      if (this.limit <= 0) {
        this.limit = -1;
      } else {
        let { value: value2, lineBreak, done } = this.cursor.next(this.skip + skip);
        this.skip = 0;
        this.value = value2;
        let len = lineBreak ? 1 : value2.length;
        if (len > this.limit)
          this.value = this.cursor.dir > 0 ? value2.slice(0, this.limit) : value2.slice(len - this.limit);
        if (done || this.value.length == 0)
          this.limit = -1;
        else
          this.limit -= this.value.length;
      }
      return this;
    }
    get lineBreak() {
      return this.cursor.lineBreak;
    }
    get done() {
      return this.limit < 0;
    }
  };
  var Line = class {
    constructor(from, to, number2, text) {
      this.from = from;
      this.to = to;
      this.number = number2;
      this.text = text;
    }
    get length() {
      return this.to - this.from;
    }
  };

  // ../../node_modules/@codemirror/next/state/dist/index.js
  var DefaultSplit = /\r\n?|\n/;
  var MapMode;
  (function(MapMode2) {
    MapMode2[MapMode2["Simple"] = 0] = "Simple";
    MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
    MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
    MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
  })(MapMode || (MapMode = {}));
  var ChangeDesc = class {
    constructor(sections) {
      this.sections = sections;
    }
    get length() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2)
        result += this.sections[i];
      return result;
    }
    get newLength() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2) {
        let ins = this.sections[i + 1];
        result += ins < 0 ? this.sections[i] : ins;
      }
      return result;
    }
    get empty() {
      return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
    }
    iterGaps(f) {
      for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0) {
          f(posA, posB, len);
          posB += len;
        } else {
          posB += ins;
        }
        posA += len;
      }
    }
    iterChangedRanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    get invertedDesc() {
      let sections = [];
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0)
          sections.push(len, ins);
        else
          sections.push(ins, len);
      }
      return new ChangeDesc(sections);
    }
    composeDesc(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other);
    }
    mapDesc(other, before = false) {
      return other.empty ? this : mapSet(this, other, before);
    }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
      let posA = 0, posB = 0;
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
        if (ins < 0) {
          if (endA > pos)
            return posB + (pos - posA);
          posB += len;
        } else {
          if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
            return null;
          if (endA > pos || endA == pos && assoc < 0 && !len)
            return pos == posA || assoc < 0 ? posB : posB + ins;
          posB += ins;
        }
        posA = endA;
      }
      if (pos > posA)
        throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
      return posB;
    }
    touchesRange(from, to = from) {
      for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
        let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
        if (ins >= 0 && pos <= to && end >= from)
          return pos < from && end > to ? "cover" : true;
        pos = end;
      }
      return false;
    }
    toString() {
      let result = "";
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
      }
      return result;
    }
  };
  var ChangeSet = class extends ChangeDesc {
    constructor(sections, inserted) {
      super(sections);
      this.inserted = inserted;
    }
    apply(doc2) {
      if (this.length != doc2.length)
        throw new RangeError("Applying change set to a document with the wrong length");
      iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
      return doc2;
    }
    mapDesc(other, before = false) {
      return mapSet(this, other, before, true);
    }
    invert(doc2) {
      let sections = this.sections.slice(), inserted = [];
      for (let i = 0, pos = 0; i < sections.length; i += 2) {
        let len = sections[i], ins = sections[i + 1];
        if (ins >= 0) {
          sections[i] = ins;
          sections[i + 1] = len;
          let index = i >> 1;
          while (inserted.length < index)
            inserted.push(Text.empty);
          inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
        }
        pos += len;
      }
      return new ChangeSet(sections, inserted);
    }
    compose(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other, true);
    }
    map(other, before = false) {
      return other.empty ? this : mapSet(this, other, before, true);
    }
    iterChanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    get desc() {
      return new ChangeDesc(this.sections);
    }
    filter(ranges) {
      let resultSections = [], resultInserted = [], filteredSections = [];
      let iter = new SectionIter(this);
      done:
        for (let i = 0, pos = 0; ; ) {
          let next = i == ranges.length ? 1e9 : ranges[i++];
          while (pos < next || pos == next && iter.len == 0) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, next - pos);
            addSection(filteredSections, len, -1);
            let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
            addSection(resultSections, len, ins);
            if (ins > 0)
              addInsert(resultInserted, resultSections, iter.text);
            iter.forward(len);
            pos += len;
          }
          let end = ranges[i++];
          while (pos < end) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, end - pos);
            addSection(resultSections, len, -1);
            addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
            iter.forward(len);
            pos += len;
          }
        }
      return {
        changes: new ChangeSet(resultSections, resultInserted),
        filtered: new ChangeDesc(filteredSections)
      };
    }
    toJSON() {
      let parts = [];
      for (let i = 0; i < this.sections.length; i += 2) {
        let len = this.sections[i], ins = this.sections[i + 1];
        if (ins < 0)
          parts.push(len);
        else if (ins == 0)
          parts.push([len]);
        else
          parts.push([len].concat(this.inserted[i >> 1].toJSON()));
      }
      return parts;
    }
    static of(changes, length, lineSep) {
      let sections = [], inserted = [], pos = 0;
      let total = null;
      function flush(force = false) {
        if (!force && !sections.length)
          return;
        if (pos < length)
          addSection(sections, length - pos, -1);
        let set = new ChangeSet(sections, inserted);
        total = total ? total.compose(set.map(total)) : set;
        sections = [];
        inserted = [];
        pos = 0;
      }
      function process2(spec) {
        if (Array.isArray(spec)) {
          for (let sub of spec)
            process2(sub);
        } else if (spec instanceof ChangeSet) {
          if (spec.length != length)
            throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
          flush();
          total = total ? total.compose(spec.map(total)) : spec;
        } else {
          let { from, to = from, insert: insert2 } = spec;
          if (from > to || from < 0 || to > length)
            throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
          let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
          let insLen = insText.length;
          if (from == to && insLen == 0)
            return;
          if (from < pos)
            flush();
          if (from > pos)
            addSection(sections, from - pos, -1);
          addSection(sections, to - from, insLen);
          addInsert(inserted, sections, insText);
          pos = to;
        }
      }
      process2(changes);
      flush(!total);
      return total;
    }
    static empty(length) {
      return new ChangeSet(length ? [length, -1] : [], []);
    }
    static fromJSON(json) {
      if (!Array.isArray(json))
        throw new RangeError("Invalid JSON representation of ChangeSet");
      let sections = [], inserted = [];
      for (let i = 0; i < json.length; i++) {
        let part = json[i];
        if (typeof part == "number") {
          sections.push(part, -1);
        } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
          throw new RangeError("Invalid JSON representation of ChangeSet");
        } else if (part.length == 1) {
          sections.push(part[0], 0);
        } else {
          while (inserted.length < i)
            inserted.push(Text.empty);
          inserted[i] = Text.of(part.slice(1));
          sections.push(part[0], inserted[i].length);
        }
      }
      return new ChangeSet(sections, inserted);
    }
  };
  function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
      return;
    let last = sections.length - 2;
    if (last >= 0 && ins <= 0 && ins == sections[last + 1])
      sections[last] += len;
    else if (len == 0 && sections[last] == 0)
      sections[last + 1] += ins;
    else if (forceJoin) {
      sections[last] += len;
      sections[last + 1] += ins;
    } else
      sections.push(len, ins);
  }
  function addInsert(values, sections, value2) {
    if (value2.length == 0)
      return;
    let index = sections.length - 2 >> 1;
    if (index < values.length) {
      values[values.length - 1] = values[values.length - 1].append(value2);
    } else {
      while (values.length < index)
        values.push(Text.empty);
      values.push(value2);
    }
  }
  function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
      let len = desc.sections[i++], ins = desc.sections[i++];
      if (ins < 0) {
        posA += len;
        posB += len;
      } else {
        let endA = posA, endB = posB, text = Text.empty;
        for (; ; ) {
          endA += len;
          endB += ins;
          if (ins && inserted)
            text = text.append(inserted[i - 2 >> 1]);
          if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
            break;
          len = desc.sections[i++];
          ins = desc.sections[i++];
        }
        f(posA, endA, posB, endB, text);
        posA = endA;
        posB = endB;
      }
    }
  }
  function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert2 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let posA = 0, posB = 0; ; ) {
      if (a.ins == -1) {
        posA += a.len;
        a.next();
      } else if (b.ins == -1 && posB < posA) {
        let skip = Math.min(b.len, posA - posB);
        b.forward(skip);
        addSection(sections, skip, -1);
        posB += skip;
      } else if (b.ins >= 0 && (a.done || posB < posA || posB == posA && (b.len < a.len || b.len == a.len && !before))) {
        addSection(sections, b.ins, -1);
        while (posA > posB && !a.done && posA + a.len < posB + b.len) {
          posA += a.len;
          a.next();
        }
        posB += b.len;
        b.next();
      } else if (a.ins >= 0) {
        let len = 0, end = posA + a.len;
        for (; ; ) {
          if (b.ins >= 0 && posB > posA && posB + b.len < end) {
            len += b.ins;
            posB += b.len;
            b.next();
          } else if (b.ins == -1 && posB < end) {
            let skip = Math.min(b.len, end - posB);
            len += skip;
            b.forward(skip);
            posB += skip;
          } else {
            break;
          }
        }
        addSection(sections, len, a.ins);
        if (insert2)
          addInsert(insert2, sections, a.text);
        posA = end;
        a.next();
      } else if (a.done && b.done) {
        return insert2 ? new ChangeSet(sections, insert2) : new ChangeDesc(sections);
      } else {
        throw new Error("Mismatched change set lengths");
      }
    }
  }
  function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert2 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let open = false; ; ) {
      if (a.done && b.done) {
        return insert2 ? new ChangeSet(sections, insert2) : new ChangeDesc(sections);
      } else if (a.ins == 0) {
        addSection(sections, a.len, 0, open);
        a.next();
      } else if (b.len == 0 && !b.done) {
        addSection(sections, 0, b.ins, open);
        if (insert2)
          addInsert(insert2, sections, b.text);
        b.next();
      } else if (a.done || b.done) {
        throw new Error("Mismatched change set lengths");
      } else {
        let len = Math.min(a.len2, b.len), sectionLen = sections.length;
        if (a.ins == -1) {
          let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
          addSection(sections, len, insB, open);
          if (insert2 && insB)
            addInsert(insert2, sections, b.text);
        } else if (b.ins == -1) {
          addSection(sections, a.off ? 0 : a.len, len, open);
          if (insert2)
            addInsert(insert2, sections, a.textBit(len));
        } else {
          addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
          if (insert2 && !b.off)
            addInsert(insert2, sections, b.text);
        }
        open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
        a.forward2(len);
        b.forward(len);
      }
    }
  }
  var SectionIter = class {
    constructor(set) {
      this.set = set;
      this.i = 0;
      this.next();
    }
    next() {
      let { sections } = this.set;
      if (this.i < sections.length) {
        this.len = sections[this.i++];
        this.ins = sections[this.i++];
      } else {
        this.len = 0;
        this.ins = -2;
      }
      this.off = 0;
    }
    get done() {
      return this.ins == -2;
    }
    get len2() {
      return this.ins < 0 ? this.len : this.ins;
    }
    get text() {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length ? Text.empty : inserted[index];
    }
    textBit(len) {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
    }
    forward(len) {
      if (len == this.len)
        this.next();
      else {
        this.len -= len;
        this.off += len;
      }
    }
    forward2(len) {
      if (this.ins == -1)
        this.forward(len);
      else if (len == this.ins)
        this.next();
      else {
        this.ins -= len;
        this.off += len;
      }
    }
  };
  var SelectionRange = class {
    constructor(from, to, flags) {
      this.from = from;
      this.to = to;
      this.flags = flags;
    }
    get anchor() {
      return this.flags & 16 ? this.to : this.from;
    }
    get head() {
      return this.flags & 16 ? this.from : this.to;
    }
    get empty() {
      return this.from == this.to;
    }
    get assoc() {
      return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
    }
    get bidiLevel() {
      let level = this.flags & 3;
      return level == 3 ? null : level;
    }
    get goalColumn() {
      let value2 = this.flags >> 5;
      return value2 == 33554431 ? void 0 : value2;
    }
    map(change) {
      let from = change.mapPos(this.from), to = change.mapPos(this.to);
      return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
    }
    extend(from, to = from) {
      if (from <= this.anchor && to >= this.anchor)
        return EditorSelection.range(from, to);
      let head2 = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
      return EditorSelection.range(this.anchor, head2);
    }
    eq(other) {
      return this.anchor == other.anchor && this.head == other.head;
    }
    toJSON() {
      return { anchor: this.anchor, head: this.head };
    }
    static fromJSON(json) {
      if (!json || typeof json.anchor != "number" || typeof json.head != "number")
        throw new RangeError("Invalid JSON representation for SelectionRange");
      return EditorSelection.range(json.anchor, json.head);
    }
  };
  var EditorSelection = class {
    constructor(ranges, mainIndex = 0) {
      this.ranges = ranges;
      this.mainIndex = mainIndex;
    }
    map(change) {
      if (change.empty)
        return this;
      return EditorSelection.create(this.ranges.map((r) => r.map(change)), this.mainIndex);
    }
    eq(other) {
      if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
        return false;
      for (let i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].eq(other.ranges[i]))
          return false;
      return true;
    }
    get main() {
      return this.ranges[this.mainIndex];
    }
    asSingle() {
      return this.ranges.length == 1 ? this : new EditorSelection([this.main]);
    }
    addRange(range, main = true) {
      return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    replaceRange(range, which = this.mainIndex) {
      let ranges = this.ranges.slice();
      ranges[which] = range;
      return EditorSelection.create(ranges, this.mainIndex);
    }
    toJSON() {
      return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
    }
    static fromJSON(json) {
      if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
        throw new RangeError("Invalid JSON representation for EditorSelection");
      return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    static single(anchor, head2 = anchor) {
      return new EditorSelection([EditorSelection.range(anchor, head2)], 0);
    }
    static create(ranges, mainIndex = 0) {
      if (ranges.length == 0)
        throw new RangeError("A selection needs at least one range");
      for (let pos = 0, i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        if (range.empty ? range.from <= pos : range.from < pos)
          return normalized(ranges.slice(), mainIndex);
        pos = range.to;
      }
      return new EditorSelection(ranges, mainIndex);
    }
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
      return new SelectionRange(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) | (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5);
    }
    static range(anchor, head2, goalColumn) {
      let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5;
      return head2 < anchor ? new SelectionRange(head2, anchor, 16 | goal) : new SelectionRange(anchor, head2, goal);
    }
  };
  function normalized(ranges, mainIndex = 0) {
    let main = ranges[mainIndex];
    ranges.sort((a, b) => a.from - b.from);
    mainIndex = ranges.indexOf(main);
    for (let i = 1; i < ranges.length; i++) {
      let range = ranges[i], prev = ranges[i - 1];
      if (range.empty ? range.from <= prev.to : range.from < prev.to) {
        let from = prev.from, to = Math.max(range.to, prev.to);
        if (i <= mainIndex)
          mainIndex--;
        ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
      }
    }
    return new EditorSelection(ranges, mainIndex);
  }
  function checkSelection(selection, docLength) {
    for (let range of selection.ranges)
      if (range.to > docLength)
        throw new RangeError("Selection points outside of document");
  }
  var nextID = 0;
  var Facet = class {
    constructor(combine, compareInput, compare2, isStatic, extensions) {
      this.combine = combine;
      this.compareInput = compareInput;
      this.compare = compare2;
      this.isStatic = isStatic;
      this.extensions = extensions;
      this.id = nextID++;
      this.default = combine([]);
    }
    static define(config2 = {}) {
      return new Facet(config2.combine || ((a) => a), config2.compareInput || ((a, b) => a === b), config2.compare || (!config2.combine ? sameArray : (a, b) => a === b), !!config2.static, config2.enables);
    }
    of(value2) {
      return new FacetProvider([], this, 0, value2);
    }
    compute(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 1, get);
    }
    computeN(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 2, get);
    }
    from(field, get) {
      if (!get)
        get = (x) => x;
      return this.compute([field], (state2) => get(state2.field(field)));
    }
  };
  function sameArray(a, b) {
    return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
  }
  var FacetProvider = class {
    constructor(dependencies, facet, type2, value2) {
      this.dependencies = dependencies;
      this.facet = facet;
      this.type = type2;
      this.value = value2;
      this.id = nextID++;
    }
    dynamicSlot(addresses) {
      var _a;
      let getter = this.value;
      let compare2 = this.facet.compareInput;
      let idx = addresses[this.id] >> 1, multi = this.type == 2;
      let depDoc = false, depSel = false, depAddrs = [];
      for (let dep of this.dependencies) {
        if (dep == "doc")
          depDoc = true;
        else if (dep == "selection")
          depSel = true;
        else if ((((_a = addresses[dep.id]) !== null && _a !== void 0 ? _a : 1) & 1) == 0)
          depAddrs.push(addresses[dep.id]);
      }
      return (state2, tr) => {
        if (!tr || tr.reconfigure) {
          state2.values[idx] = getter(state2);
          return 1;
        } else {
          let depChanged = depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || depAddrs.some((addr) => (ensureAddr(state2, addr) & 1) > 0);
          if (!depChanged)
            return 0;
          let newVal = getter(state2), oldVal = tr.startState.values[idx];
          if (multi ? compareArray(newVal, oldVal, compare2) : compare2(newVal, oldVal))
            return 0;
          state2.values[idx] = newVal;
          return 1;
        }
      };
    }
  };
  function compareArray(a, b, compare2) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!compare2(a[i], b[i]))
        return false;
    return true;
  }
  function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map((p) => addresses[p.id]);
    let providerTypes = providers.map((p) => p.type);
    let dynamic = providerAddrs.filter((p) => !(p & 1));
    let idx = addresses[facet.id] >> 1;
    return (state2, tr) => {
      let oldAddr = !tr ? null : tr.reconfigure ? tr.startState.config.address[facet.id] : idx << 1;
      let changed = oldAddr == null;
      for (let dynAddr of dynamic) {
        if (ensureAddr(state2, dynAddr) & 1)
          changed = true;
      }
      if (!changed)
        return 0;
      let values = [];
      for (let i = 0; i < providerAddrs.length; i++) {
        let value2 = getAddr(state2, providerAddrs[i]);
        if (providerTypes[i] == 2)
          for (let val of value2)
            values.push(val);
        else
          values.push(value2);
      }
      let newVal = facet.combine(values);
      if (oldAddr != null && facet.compare(newVal, getAddr(tr.startState, oldAddr)))
        return 0;
      state2.values[idx] = newVal;
      return 1;
    };
  }
  function maybeIndex(state2, id) {
    let found = state2.config.address[id];
    return found == null ? null : found >> 1;
  }
  var initField = Facet.define({ static: true });
  var StateField = class {
    constructor(id, createF, updateF, compareF, spec) {
      this.id = id;
      this.createF = createF;
      this.updateF = updateF;
      this.compareF = compareF;
      this.spec = spec;
      this.provides = void 0;
    }
    static define(config2) {
      let field = new StateField(nextID++, config2.create, config2.update, config2.compare || ((a, b) => a === b), config2);
      if (config2.provide)
        field.provides = config2.provide(field);
      return field;
    }
    create(state2) {
      let init = state2.facet(initField).find((i) => i.field == this);
      return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state2);
    }
    slot(addresses) {
      let idx = addresses[this.id] >> 1;
      return (state2, tr) => {
        if (!tr) {
          state2.values[idx] = this.create(state2);
          return 1;
        }
        let oldVal, changed = 0;
        if (tr.reconfigure) {
          let oldIdx = maybeIndex(tr.startState, this.id);
          oldVal = oldIdx == null ? this.create(tr.startState) : tr.startState.values[oldIdx];
          changed = 1;
        } else {
          oldVal = tr.startState.values[idx];
        }
        let value2 = this.updateF(oldVal, tr);
        if (!changed && !this.compareF(oldVal, value2))
          changed = 1;
        if (changed)
          state2.values[idx] = value2;
        return changed;
      };
    }
    init(create) {
      return [this, initField.of({ field: this, create })];
    }
  };
  var Prec_ = { fallback: 3, default: 2, extend: 1, override: 0 };
  function prec(value2) {
    return (ext) => new PrecExtension(ext, value2);
  }
  var Prec = {
    fallback: prec(Prec_.fallback),
    default: prec(Prec_.default),
    extend: prec(Prec_.extend),
    override: prec(Prec_.override)
  };
  var PrecExtension = class {
    constructor(inner, prec2) {
      this.inner = inner;
      this.prec = prec2;
    }
  };
  var TaggedExtension = class {
    constructor(tag, inner) {
      this.tag = tag;
      this.inner = inner;
    }
  };
  var Configuration = class {
    constructor(source2, replacements, dynamicSlots, address, staticValues) {
      this.source = source2;
      this.replacements = replacements;
      this.dynamicSlots = dynamicSlots;
      this.address = address;
      this.staticValues = staticValues;
      this.statusTemplate = [];
      while (this.statusTemplate.length < dynamicSlots.length)
        this.statusTemplate.push(0);
    }
    staticFacet(facet) {
      let addr = this.address[facet.id];
      return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(extension, replacements = Object.create(null), oldState) {
      let fields = [];
      let facets = Object.create(null);
      for (let ext of flatten(extension, replacements)) {
        if (ext instanceof StateField)
          fields.push(ext);
        else
          (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
      }
      let address = Object.create(null);
      let staticValues = [];
      let dynamicSlots = [];
      for (let field of fields) {
        address[field.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => field.slot(a));
      }
      for (let id in facets) {
        let providers = facets[id], facet = providers[0].facet;
        if (providers.every((p) => p.type == 0)) {
          address[facet.id] = staticValues.length << 1 | 1;
          let value2 = facet.combine(providers.map((p) => p.value));
          let oldAddr = oldState ? oldState.config.address[facet.id] : null;
          if (oldAddr != null) {
            let oldVal = getAddr(oldState, oldAddr);
            if (facet.compare(value2, oldVal))
              value2 = oldVal;
          }
          staticValues.push(value2);
        } else {
          for (let p of providers) {
            if (p.type == 0) {
              address[p.id] = staticValues.length << 1 | 1;
              staticValues.push(p.value);
            } else {
              address[p.id] = dynamicSlots.length << 1;
              dynamicSlots.push((a) => p.dynamicSlot(a));
            }
          }
          address[facet.id] = dynamicSlots.length << 1;
          dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
        }
      }
      return new Configuration(extension, replacements, dynamicSlots.map((f) => f(address)), address, staticValues);
    }
  };
  function allKeys(obj) {
    return (Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(obj) : []).concat(Object.keys(obj));
  }
  function flatten(extension, replacements) {
    let result = [[], [], [], []];
    let seen = new Map();
    let tagsSeen = Object.create(null);
    function inner(ext, prec2) {
      let known = seen.get(ext);
      if (known != null) {
        if (known >= prec2)
          return;
        let found = result[known].indexOf(ext);
        if (found > -1)
          result[known].splice(found, 1);
      }
      seen.set(ext, prec2);
      if (Array.isArray(ext)) {
        for (let e of ext)
          inner(e, prec2);
      } else if (ext instanceof TaggedExtension) {
        if (ext.tag in tagsSeen)
          throw new RangeError(`Duplicate use of tag '${String(ext.tag)}' in extensions`);
        tagsSeen[ext.tag] = true;
        inner(replacements[ext.tag] || ext.inner, prec2);
      } else if (ext instanceof PrecExtension) {
        inner(ext.inner, ext.prec);
      } else if (ext instanceof StateField) {
        result[prec2].push(ext);
        if (ext.provides)
          inner(ext.provides, prec2);
      } else if (ext instanceof FacetProvider) {
        result[prec2].push(ext);
        if (ext.facet.extensions)
          inner(ext.facet.extensions, prec2);
      } else {
        inner(ext.extension, prec2);
      }
    }
    inner(extension, Prec_.default);
    for (let key2 of allKeys(replacements))
      if (!(key2 in tagsSeen) && key2 != "full" && replacements[key2]) {
        tagsSeen[key2] = true;
        inner(replacements[key2], Prec_.default);
      }
    return result.reduce((a, b) => a.concat(b));
  }
  function ensureAddr(state2, addr) {
    if (addr & 1)
      return 2;
    let idx = addr >> 1;
    let status = state2.status[idx];
    if (status == 4)
      throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2)
      return status;
    state2.status[idx] = 4;
    let changed = state2.config.dynamicSlots[idx](state2, state2.applying);
    return state2.status[idx] = 2 | changed;
  }
  function getAddr(state2, addr) {
    return addr & 1 ? state2.config.staticValues[addr >> 1] : state2.values[addr >> 1];
  }
  var languageData = Facet.define();
  var allowMultipleSelections = Facet.define({
    combine: (values) => values.some((v) => v),
    static: true
  });
  var lineSeparator = Facet.define({
    combine: (values) => values.length ? values[0] : void 0,
    static: true
  });
  var changeFilter = Facet.define();
  var transactionFilter = Facet.define();
  var transactionExtender = Facet.define();
  var Annotation = class {
    constructor(type2, value2) {
      this.type = type2;
      this.value = value2;
    }
    static define() {
      return new AnnotationType();
    }
  };
  var AnnotationType = class {
    of(value2) {
      return new Annotation(this, value2);
    }
  };
  var StateEffect = class {
    constructor(type2, value2) {
      this.type = type2;
      this.value = value2;
    }
    map(mapping) {
      let mapped = this.type.map(this.value, mapping);
      return mapped === void 0 ? void 0 : mapped == this.value ? this : new StateEffect(this.type, mapped);
    }
    is(type2) {
      return this.type == type2;
    }
    static define(spec = {}) {
      return new StateEffectType(spec.map || ((v) => v));
    }
    static mapEffects(effects, mapping) {
      if (!effects.length)
        return effects;
      let result = [];
      for (let effect of effects) {
        let mapped = effect.map(mapping);
        if (mapped)
          result.push(mapped);
      }
      return result;
    }
  };
  var StateEffectType = class {
    constructor(map2) {
      this.map = map2;
    }
    of(value2) {
      return new StateEffect(this, value2);
    }
  };
  var Transaction = class {
    constructor(startState, changes, selection, effects, annotations, reconfigure, scrollIntoView2) {
      this.startState = startState;
      this.changes = changes;
      this.selection = selection;
      this.effects = effects;
      this.annotations = annotations;
      this.reconfigure = reconfigure;
      this.scrollIntoView = scrollIntoView2;
      this._doc = null;
      this._state = null;
      if (selection)
        checkSelection(selection, changes.newLength);
      if (!annotations.some((a) => a.type == Transaction.time))
        this.annotations = annotations.concat(Transaction.time.of(Date.now()));
    }
    get newDoc() {
      return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    get newSelection() {
      return this.selection || this.startState.selection.map(this.changes);
    }
    get state() {
      if (!this._state)
        this.startState.applyTransaction(this);
      return this._state;
    }
    annotation(type2) {
      for (let ann of this.annotations)
        if (ann.type == type2)
          return ann.value;
      return void 0;
    }
    get docChanged() {
      return !this.changes.empty;
    }
  };
  Transaction.time = Annotation.define();
  Transaction.userEvent = Annotation.define();
  Transaction.addToHistory = Annotation.define();
  function joinRanges(a, b) {
    let result = [];
    for (let iA = 0, iB = 0; ; ) {
      let from, to;
      if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
        from = a[iA++];
        to = a[iA++];
      } else if (iB < b.length) {
        from = b[iB++];
        to = b[iB++];
      } else
        return result;
      if (!result.length || result[result.length - 1] < from)
        result.push(from, to);
      else if (result[result.length - 1] < to)
        result[result.length - 1] = to;
    }
  }
  function mergeTransaction(a, b, sequential) {
    var _a;
    let mapForA, mapForB, changes;
    if (sequential) {
      mapForA = b.changes;
      mapForB = ChangeSet.empty(b.changes.length);
      changes = a.changes.compose(b.changes);
    } else {
      mapForA = b.changes.map(a.changes);
      mapForB = a.changes.mapDesc(b.changes, true);
      changes = a.changes.compose(mapForA);
    }
    return {
      changes,
      selection: b.selection ? b.selection.map(mapForB) : (_a = a.selection) === null || _a === void 0 ? void 0 : _a.map(mapForA),
      effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
      annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
      scrollIntoView: a.scrollIntoView || b.scrollIntoView,
      reconfigure: !b.reconfigure ? a.reconfigure : b.reconfigure.full || !a.reconfigure ? b.reconfigure : Object.assign({}, a.reconfigure, b.reconfigure)
    };
  }
  function resolveTransactionInner(state2, spec, docSize) {
    let reconf = spec.reconfigure;
    if (reconf && reconf.append) {
      reconf = Object.assign({}, reconf);
      let tag = typeof Symbol == "undefined" ? "__append" + Math.floor(Math.random() * 4294967295) : Symbol("appendConf");
      reconf[tag] = reconf.append;
      reconf.append = void 0;
    }
    let sel = spec.selection;
    return {
      changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state2.facet(lineSeparator)),
      selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
      effects: asArray(spec.effects),
      annotations: asArray(spec.annotations),
      scrollIntoView: !!spec.scrollIntoView,
      reconfigure: reconf
    };
  }
  function resolveTransaction(state2, specs, filter) {
    let s = resolveTransactionInner(state2, specs.length ? specs[0] : {}, state2.doc.length);
    if (specs.length && specs[0].filter === false)
      filter = false;
    for (let i = 1; i < specs.length; i++) {
      if (specs[i].filter === false)
        filter = false;
      let seq = !!specs[i].sequential;
      s = mergeTransaction(s, resolveTransactionInner(state2, specs[i], seq ? s.changes.newLength : state2.doc.length), seq);
    }
    let tr = new Transaction(state2, s.changes, s.selection, s.effects, s.annotations, s.reconfigure, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
  }
  function filterTransaction(tr) {
    let state2 = tr.startState;
    let result = true;
    for (let filter of state2.facet(changeFilter)) {
      let value2 = filter(tr);
      if (value2 === false) {
        result = false;
        break;
      }
      if (Array.isArray(value2))
        result = result === true ? value2 : joinRanges(result, value2);
    }
    if (result !== true) {
      let changes, back;
      if (result === false) {
        back = tr.changes.invertedDesc;
        changes = ChangeSet.empty(state2.doc.length);
      } else {
        let filtered = tr.changes.filter(result);
        changes = filtered.changes;
        back = filtered.filtered.invertedDesc;
      }
      tr = new Transaction(state2, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.reconfigure, tr.scrollIntoView);
    }
    let filters = state2.facet(transactionFilter);
    for (let i = filters.length - 1; i >= 0; i--) {
      let filtered = filters[i](tr);
      if (filtered instanceof Transaction)
        tr = filtered;
      else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
        tr = filtered[0];
      else
        tr = resolveTransaction(state2, asArray(filtered), false);
    }
    return tr;
  }
  function extendTransaction(tr) {
    let state2 = tr.startState, extenders = state2.facet(transactionExtender), spec = tr;
    for (let i = extenders.length - 1; i >= 0; i--) {
      let extension = extenders[i](tr);
      if (extension && Object.keys(extension).length)
        spec = mergeTransaction(tr, resolveTransactionInner(state2, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : new Transaction(state2, tr.changes, tr.selection, spec.effects, spec.annotations, spec.reconfigure, spec.scrollIntoView);
  }
  var none = [];
  function asArray(value2) {
    return value2 == null ? none : Array.isArray(value2) ? value2 : [value2];
  }
  var CharCategory;
  (function(CharCategory2) {
    CharCategory2[CharCategory2["Word"] = 0] = "Word";
    CharCategory2[CharCategory2["Space"] = 1] = "Space";
    CharCategory2[CharCategory2["Other"] = 2] = "Other";
  })(CharCategory || (CharCategory = {}));
  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var wordChar;
  try {
    wordChar = new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
  } catch (_) {
  }
  function hasWordChar(str) {
    if (wordChar)
      return wordChar.test(str);
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
        return true;
    }
    return false;
  }
  function makeCategorizer(wordChars) {
    return (char) => {
      if (!/\S/.test(char))
        return CharCategory.Space;
      if (hasWordChar(char))
        return CharCategory.Word;
      for (let i = 0; i < wordChars.length; i++)
        if (char.indexOf(wordChars[i]) > -1)
          return CharCategory.Word;
      return CharCategory.Other;
    };
  }
  var EditorState = class {
    constructor(config2, doc2, selection, tr = null) {
      this.config = config2;
      this.doc = doc2;
      this.selection = selection;
      this.applying = null;
      this.status = config2.statusTemplate.slice();
      if (tr && !tr.reconfigure) {
        this.values = tr.startState.values.slice();
      } else {
        this.values = config2.dynamicSlots.map((_) => null);
        if (tr)
          for (let id in config2.address) {
            let cur2 = config2.address[id], prev = tr.startState.config.address[id];
            if (prev != null && (cur2 & 1) == 0)
              this.values[cur2 >> 1] = getAddr(tr.startState, prev);
          }
      }
      this.applying = tr;
      if (tr)
        tr._state = this;
      for (let i = 0; i < this.config.dynamicSlots.length; i++)
        ensureAddr(this, i << 1);
      this.applying = null;
    }
    field(field, require2 = true) {
      let addr = this.config.address[field.id];
      if (addr == null) {
        if (require2)
          throw new RangeError("Field is not present in this state");
        return void 0;
      }
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    update(...specs) {
      return resolveTransaction(this, specs, true);
    }
    applyTransaction(tr) {
      let conf = this.config;
      if (tr.reconfigure)
        conf = Configuration.resolve(tr.reconfigure.full || conf.source, Object.assign(conf.replacements, tr.reconfigure, { full: void 0 }), this);
      new EditorState(conf, tr.newDoc, tr.newSelection, tr);
    }
    replaceSelection(text) {
      if (typeof text == "string")
        text = this.toText(text);
      return this.changeByRange((range) => ({
        changes: { from: range.from, to: range.to, insert: text },
        range: EditorSelection.cursor(range.from + text.length)
      }));
    }
    changeByRange(f) {
      let sel = this.selection;
      let result1 = f(sel.ranges[0]);
      let changes = this.changes(result1.changes), ranges = [result1.range];
      let effects = asArray(result1.effects);
      for (let i = 1; i < sel.ranges.length; i++) {
        let result = f(sel.ranges[i]);
        let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
        for (let j = 0; j < i; j++)
          ranges[j] = ranges[j].map(newMapped);
        let mapBy = changes.mapDesc(newChanges, true);
        ranges.push(result.range.map(mapBy));
        changes = changes.compose(newMapped);
        effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
      }
      return {
        changes,
        selection: EditorSelection.create(ranges, sel.mainIndex),
        effects
      };
    }
    changes(spec = []) {
      if (spec instanceof ChangeSet)
        return spec;
      return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    toText(string3) {
      return Text.of(string3.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    sliceDoc(from = 0, to = this.doc.length) {
      return this.doc.sliceString(from, to, this.lineBreak);
    }
    facet(facet) {
      let addr = this.config.address[facet.id];
      if (addr == null)
        return facet.default;
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    toJSON(fields) {
      let result = {
        doc: this.sliceDoc(),
        selection: this.selection.toJSON()
      };
      if (fields)
        for (let prop in fields)
          result[prop] = fields[prop].spec.toJSON(this.field(fields[prop]), this);
      return result;
    }
    static fromJSON(json, config2 = {}, fields) {
      if (!json || typeof json.doc != "string")
        throw new RangeError("Invalid JSON representation for EditorState");
      let fieldInit = [];
      if (fields)
        for (let prop in fields) {
          let field = fields[prop], value2 = json[prop];
          fieldInit.push(field.init((state2) => field.spec.fromJSON(value2, state2)));
        }
      return EditorState.create({
        doc: json.doc,
        selection: EditorSelection.fromJSON(json.selection),
        extensions: config2.extensions ? fieldInit.concat([config2.extensions]) : fieldInit
      });
    }
    static create(config2 = {}) {
      let configuration = Configuration.resolve(config2.extensions || []);
      let doc2 = config2.doc instanceof Text ? config2.doc : Text.of((config2.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
      let selection = !config2.selection ? EditorSelection.single(0) : config2.selection instanceof EditorSelection ? config2.selection : EditorSelection.single(config2.selection.anchor, config2.selection.head);
      checkSelection(selection, doc2.length);
      if (!configuration.staticFacet(allowMultipleSelections))
        selection = selection.asSingle();
      return new EditorState(configuration, doc2, selection);
    }
    get tabSize() {
      return this.facet(EditorState.tabSize);
    }
    get lineBreak() {
      return this.facet(EditorState.lineSeparator) || "\n";
    }
    phrase(phrase) {
      for (let map2 of this.facet(EditorState.phrases))
        if (Object.prototype.hasOwnProperty.call(map2, phrase))
          return map2[phrase];
      return phrase;
    }
    languageDataAt(name2, pos) {
      let values = [];
      for (let provider of this.facet(languageData)) {
        for (let result of provider(this, pos)) {
          if (Object.prototype.hasOwnProperty.call(result, name2))
            values.push(result[name2]);
        }
      }
      return values;
    }
    charCategorizer(at) {
      return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
  };
  EditorState.allowMultipleSelections = allowMultipleSelections;
  EditorState.tabSize = Facet.define({
    combine: (values) => values.length ? values[0] : 4
  });
  EditorState.lineSeparator = lineSeparator;
  EditorState.phrases = Facet.define();
  EditorState.languageData = languageData;
  EditorState.changeFilter = changeFilter;
  EditorState.transactionFilter = transactionFilter;
  EditorState.transactionExtender = transactionExtender;
  function combineConfig(configs, defaults3, combine = {}) {
    let result = {};
    for (let config2 of configs)
      for (let key2 of Object.keys(config2)) {
        let value2 = config2[key2], current = result[key2];
        if (current === void 0)
          result[key2] = value2;
        else if (current === value2 || value2 === void 0)
          ;
        else if (Object.hasOwnProperty.call(combine, key2))
          result[key2] = combine[key2](current, value2);
        else
          throw new Error("Config merge conflict for field " + key2);
      }
    for (let key2 in defaults3)
      if (result[key2] === void 0)
        result[key2] = defaults3[key2];
    return result;
  }

  // ../../node_modules/style-mod/src/style-mod.js
  var C = "\u037C";
  var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
  var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
  var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
  var StyleModule = class {
    constructor(spec, options) {
      this.rules = [];
      let { process: process2, extend: extend2 } = options || {};
      function processSelector(selector) {
        if (/^@/.test(selector))
          return [selector];
        let selectors = selector.split(",");
        return process2 ? selectors.map(process2) : selectors;
      }
      function render(selectors, spec2, target2) {
        let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]);
        if (isAt && spec2 == null)
          return target2.push(selectors[0] + ";");
        for (let prop in spec2) {
          let value2 = spec2[prop];
          if (/&/.test(prop)) {
            render(selectors.map((s) => extend2 ? extend2(prop, s) : prop.replace(/&/g, s)), value2, target2);
          } else if (value2 && typeof value2 == "object") {
            if (!isAt)
              throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
            render(isAt[1] == "keyframes" ? [prop] : processSelector(prop), value2, local);
          } else if (value2 != null) {
            local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value2 + ";");
          }
        }
        if (local.length || isAt && isAt[1] == "keyframes")
          target2.push(selectors.join(",") + " {" + local.join(" ") + "}");
      }
      for (let prop in spec)
        render(processSelector(prop), spec[prop], this.rules);
    }
    getRules() {
      return this.rules.join("\n");
    }
    static newName() {
      let id = top[COUNT] || 1;
      top[COUNT] = id + 1;
      return C + id.toString(36);
    }
    static mount(root, modules) {
      (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
    }
  };
  var adoptedSet = null;
  var StyleSet = class {
    constructor(root) {
      if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
        if (adoptedSet) {
          root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
          return root[SET] = adoptedSet;
        }
        this.sheet = new CSSStyleSheet();
        root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
        adoptedSet = this;
      } else {
        this.styleTag = (root.ownerDocument || root).createElement("style");
        let target2 = root.head || root;
        target2.insertBefore(this.styleTag, target2.firstChild);
      }
      this.modules = [];
      root[SET] = this;
    }
    mount(modules) {
      let sheet = this.sheet;
      let pos = 0, j = 0;
      for (let i = 0; i < modules.length; i++) {
        let mod = modules[i], index = this.modules.indexOf(mod);
        if (index < j && index > -1) {
          this.modules.splice(index, 1);
          j--;
          index = -1;
        }
        if (index == -1) {
          this.modules.splice(j++, 0, mod);
          if (sheet)
            for (let k = 0; k < mod.rules.length; k++)
              sheet.insertRule(mod.rules[k], pos++);
        } else {
          while (j < index)
            pos += this.modules[j++].rules.length;
          pos += mod.rules.length;
          j++;
        }
      }
      if (!sheet) {
        let text = "";
        for (let i = 0; i < this.modules.length; i++)
          text += this.modules[i].getRules() + "\n";
        this.styleTag.textContent = text;
      }
    }
  };

  // ../../node_modules/@codemirror/next/rangeset/dist/index.js
  var RangeValue = class {
    eq(other) {
      return this == other;
    }
    range(from, to = from) {
      return new Range(from, to, this);
    }
  };
  RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
  RangeValue.prototype.point = false;
  RangeValue.prototype.mapMode = MapMode.TrackDel;
  var Range = class {
    constructor(from, to, value2) {
      this.from = from;
      this.to = to;
      this.value = value2;
    }
  };
  function cmpRange(a, b) {
    return a.from - b.from || a.value.startSide - b.value.startSide;
  }
  var Chunk = class {
    constructor(from, to, value2, maxPoint) {
      this.from = from;
      this.to = to;
      this.value = value2;
      this.maxPoint = maxPoint;
    }
    get length() {
      return this.to[this.to.length - 1];
    }
    findIndex(pos, end, side = end * 1e9, startAt = 0) {
      if (pos <= 0)
        return startAt;
      let arr = end < 0 ? this.to : this.from;
      for (let lo = startAt, hi = arr.length; ; ) {
        if (lo == hi)
          return lo;
        let mid = lo + hi >> 1;
        let diff = arr[mid] - pos || (end < 0 ? this.value[mid].startSide : this.value[mid].endSide) - side;
        if (mid == lo)
          return diff >= 0 ? lo : hi;
        if (diff >= 0)
          hi = mid;
        else
          lo = mid + 1;
      }
    }
    between(offset, from, to, f) {
      for (let i = this.findIndex(from, -1), e = this.findIndex(to, 1, void 0, i); i < e; i++)
        if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
          return false;
    }
    map(offset, changes) {
      let value2 = [], from = [], to = [], newPos = -1, maxPoint = -1;
      for (let i = 0; i < this.value.length; i++) {
        let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
        if (curFrom == curTo) {
          let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
          if (mapped == null)
            continue;
          newFrom = newTo = mapped;
        } else {
          newFrom = changes.mapPos(curFrom, val.startSide);
          newTo = changes.mapPos(curTo, val.endSide);
          if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
            continue;
        }
        if ((newTo - newFrom || val.endSide - val.startSide) < 0)
          continue;
        if (newPos < 0)
          newPos = newFrom;
        if (val.point)
          maxPoint = Math.max(maxPoint, newTo - newFrom);
        value2.push(val);
        from.push(newFrom - newPos);
        to.push(newTo - newPos);
      }
      return { mapped: value2.length ? new Chunk(from, to, value2, maxPoint) : null, pos: newPos };
    }
  };
  var RangeSet = class {
    constructor(chunkPos, chunk, nextLayer = RangeSet.empty, maxPoint) {
      this.chunkPos = chunkPos;
      this.chunk = chunk;
      this.nextLayer = nextLayer;
      this.maxPoint = maxPoint;
    }
    get length() {
      let last = this.chunk.length - 1;
      return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
    }
    get size() {
      if (this == RangeSet.empty)
        return 0;
      let size = this.nextLayer.size;
      for (let chunk of this.chunk)
        size += chunk.value.length;
      return size;
    }
    chunkEnd(index) {
      return this.chunkPos[index] + this.chunk[index].length;
    }
    update(updateSpec) {
      let { add: add2 = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
      let filter = updateSpec.filter;
      if (add2.length == 0 && !filter)
        return this;
      if (sort)
        add2.slice().sort(cmpRange);
      if (this == RangeSet.empty)
        return add2.length ? RangeSet.of(add2) : this;
      let cur2 = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
      let builder = new RangeSetBuilder();
      while (cur2.value || i < add2.length) {
        if (i < add2.length && (cur2.from - add2[i].from || cur2.startSide - add2[i].value.startSide) >= 0) {
          let range = add2[i++];
          if (!builder.addInner(range.from, range.to, range.value))
            spill.push(range);
        } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i == add2.length || this.chunkEnd(cur2.chunkIndex) < add2[i].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
          cur2.nextChunk();
        } else {
          if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
            if (!builder.addInner(cur2.from, cur2.to, cur2.value))
              spill.push(new Range(cur2.from, cur2.to, cur2.value));
          }
          cur2.next();
        }
      }
      return builder.finishInner(this.nextLayer == RangeSet.empty && !spill.length ? RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
    }
    map(changes) {
      if (changes.length == 0 || this == RangeSet.empty)
        return this;
      let chunks = [], chunkPos = [], maxPoint = -1;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        let touch = changes.touchesRange(start, start + chunk.length);
        if (touch === false) {
          maxPoint = Math.max(maxPoint, chunk.maxPoint);
          chunks.push(chunk);
          chunkPos.push(changes.mapPos(start));
        } else if (touch === true) {
          let { mapped, pos } = chunk.map(start, changes);
          if (mapped) {
            maxPoint = Math.max(maxPoint, mapped.maxPoint);
            chunks.push(mapped);
            chunkPos.push(pos);
          }
        }
      }
      let next = this.nextLayer.map(changes);
      return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next, maxPoint);
    }
    between(from, to, f) {
      if (this == RangeSet.empty)
        return;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
          return;
      }
      this.nextLayer.between(from, to, f);
    }
    iter(from = 0) {
      return HeapCursor.from([this]).goto(from);
    }
    static iter(sets, from = 0) {
      return HeapCursor.from(sets).goto(from);
    }
    static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
      let a = oldSets.filter((set) => set.maxPoint >= 500 || set != RangeSet.empty && newSets.indexOf(set) < 0 && set.maxPoint >= minPointSize);
      let b = newSets.filter((set) => set.maxPoint >= 500 || set != RangeSet.empty && oldSets.indexOf(set) < 0 && set.maxPoint >= minPointSize);
      let sharedChunks = findSharedChunks(a, b);
      let sideA = new SpanCursor(a, sharedChunks, minPointSize);
      let sideB = new SpanCursor(b, sharedChunks, minPointSize);
      textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
      if (textDiff.empty && textDiff.length == 0)
        compare(sideA, 0, sideB, 0, 0, comparator);
    }
    static spans(sets, from, to, iterator, minPointSize = -1) {
      let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
      let open = cursor.openStart;
      for (; ; ) {
        let curTo = Math.min(cursor.to, to);
        if (cursor.point) {
          iterator.point(pos, curTo, cursor.point, cursor.activeForPoint(cursor.to), open);
          open = cursor.openEnd(curTo) + (cursor.to > curTo ? 1 : 0);
        } else if (curTo > pos) {
          iterator.span(pos, curTo, cursor.active, open);
          open = cursor.openEnd(curTo);
        }
        if (cursor.to > to)
          break;
        pos = cursor.to;
        cursor.next();
      }
      return open;
    }
    static of(ranges, sort = false) {
      let build = new RangeSetBuilder();
      for (let range of ranges instanceof Range ? [ranges] : sort ? ranges.slice().sort(cmpRange) : ranges)
        build.add(range.from, range.to, range.value);
      return build.finish();
    }
  };
  RangeSet.empty = new RangeSet([], [], null, -1);
  RangeSet.empty.nextLayer = RangeSet.empty;
  var RangeSetBuilder = class {
    constructor() {
      this.chunks = [];
      this.chunkPos = [];
      this.chunkStart = -1;
      this.last = null;
      this.lastFrom = -1e9;
      this.lastTo = -1e9;
      this.from = [];
      this.to = [];
      this.value = [];
      this.maxPoint = -1;
      this.setMaxPoint = -1;
      this.nextLayer = null;
    }
    finishChunk(newArrays) {
      this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
      this.chunkPos.push(this.chunkStart);
      this.chunkStart = -1;
      this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
      this.maxPoint = -1;
      if (newArrays) {
        this.from = [];
        this.to = [];
        this.value = [];
      }
    }
    add(from, to, value2) {
      if (!this.addInner(from, to, value2))
        (this.nextLayer || (this.nextLayer = new RangeSetBuilder())).add(from, to, value2);
    }
    addInner(from, to, value2) {
      let diff = from - this.lastTo || value2.startSide - this.last.endSide;
      if (diff <= 0 && (from - this.lastFrom || value2.startSide - this.last.startSide) < 0)
        throw new Error("Ranges must be added sorted by `from` position and `startSide`");
      if (diff < 0)
        return false;
      if (this.from.length == 250)
        this.finishChunk(true);
      if (this.chunkStart < 0)
        this.chunkStart = from;
      this.from.push(from - this.chunkStart);
      this.to.push(to - this.chunkStart);
      this.last = value2;
      this.lastFrom = from;
      this.lastTo = to;
      this.value.push(value2);
      if (value2.point)
        this.maxPoint = Math.max(this.maxPoint, to - from);
      return true;
    }
    addChunk(from, chunk) {
      if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
        return false;
      if (this.from.length)
        this.finishChunk(true);
      this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
      this.chunks.push(chunk);
      this.chunkPos.push(from);
      let last = chunk.value.length - 1;
      this.last = chunk.value[last];
      this.lastFrom = chunk.from[last] + from;
      this.lastTo = chunk.to[last] + from;
      return true;
    }
    finish() {
      return this.finishInner(RangeSet.empty);
    }
    finishInner(next) {
      if (this.from.length)
        this.finishChunk(false);
      if (this.chunks.length == 0)
        return next;
      let result = new RangeSet(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
      this.from = null;
      return result;
    }
  };
  function findSharedChunks(a, b) {
    let inA = new Map();
    for (let set of a)
      for (let i = 0; i < set.chunk.length; i++)
        if (set.chunk[i].maxPoint < 500)
          inA.set(set.chunk[i], set.chunkPos[i]);
    let shared = new Set();
    for (let set of b)
      for (let i = 0; i < set.chunk.length; i++)
        if (inA.get(set.chunk[i]) == set.chunkPos[i])
          shared.add(set.chunk[i]);
    return shared;
  }
  var LayerCursor = class {
    constructor(layer, skip, minPoint, rank = 0) {
      this.layer = layer;
      this.skip = skip;
      this.minPoint = minPoint;
      this.rank = rank;
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    get endSide() {
      return this.value ? this.value.endSide : 0;
    }
    goto(pos, side = -1e9) {
      this.chunkIndex = this.rangeIndex = 0;
      this.gotoInner(pos, side, false);
      return this;
    }
    gotoInner(pos, side, forward) {
      while (this.chunkIndex < this.layer.chunk.length) {
        let next = this.layer.chunk[this.chunkIndex];
        if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
          break;
        this.chunkIndex++;
        forward = false;
      }
      let rangeIndex = this.chunkIndex == this.layer.chunk.length ? 0 : this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], -1, side);
      if (!forward || this.rangeIndex < rangeIndex)
        this.rangeIndex = rangeIndex;
      this.next();
    }
    forward(pos, side) {
      if ((this.to - pos || this.endSide - side) < 0)
        this.gotoInner(pos, side, true);
    }
    next() {
      for (; ; ) {
        if (this.chunkIndex == this.layer.chunk.length) {
          this.from = this.to = 1e9;
          this.value = null;
          break;
        } else {
          let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
          let from = chunkPos + chunk.from[this.rangeIndex];
          this.from = from;
          this.to = chunkPos + chunk.to[this.rangeIndex];
          this.value = chunk.value[this.rangeIndex];
          if (++this.rangeIndex == chunk.value.length) {
            this.chunkIndex++;
            if (this.skip) {
              while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
                this.chunkIndex++;
            }
            this.rangeIndex = 0;
          }
          if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
            break;
        }
      }
    }
    nextChunk() {
      this.chunkIndex++;
      this.rangeIndex = 0;
      this.next();
    }
    compare(other) {
      return this.from - other.from || this.startSide - other.startSide || this.to - other.to || this.endSide - other.endSide;
    }
  };
  var HeapCursor = class {
    constructor(heap) {
      this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
      let heap = [];
      for (let i = 0; i < sets.length; i++) {
        for (let cur2 = sets[i]; cur2 != RangeSet.empty; cur2 = cur2.nextLayer) {
          if (cur2.maxPoint >= minPoint)
            heap.push(new LayerCursor(cur2, skip, minPoint, i));
        }
      }
      return heap.length == 1 ? heap[0] : new HeapCursor(heap);
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    goto(pos, side = -1e9) {
      for (let cur2 of this.heap)
        cur2.goto(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      this.next();
      return this;
    }
    forward(pos, side) {
      for (let cur2 of this.heap)
        cur2.forward(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      if ((this.to - pos || this.value.endSide - side) < 0)
        this.next();
    }
    next() {
      if (this.heap.length == 0) {
        this.from = this.to = 1e9;
        this.value = null;
        this.rank = -1;
      } else {
        let top2 = this.heap[0];
        this.from = top2.from;
        this.to = top2.to;
        this.value = top2.value;
        this.rank = top2.rank;
        if (top2.value)
          top2.next();
        heapBubble(this.heap, 0);
      }
    }
  };
  function heapBubble(heap, index) {
    for (let cur2 = heap[index]; ; ) {
      let childIndex = (index << 1) + 1;
      if (childIndex >= heap.length)
        break;
      let child = heap[childIndex];
      if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
        child = heap[childIndex + 1];
        childIndex++;
      }
      if (cur2.compare(child) < 0)
        break;
      heap[childIndex] = cur2;
      heap[index] = child;
      index = childIndex;
    }
  }
  var SpanCursor = class {
    constructor(sets, skip, minPoint) {
      this.minPoint = minPoint;
      this.active = [];
      this.activeTo = [];
      this.activeRank = [];
      this.minActive = -1;
      this.point = null;
      this.pointFrom = 0;
      this.pointRank = 0;
      this.to = -1e9;
      this.endSide = 0;
      this.openStart = -1;
      this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -1e9) {
      this.cursor.goto(pos, side);
      this.active.length = this.activeTo.length = this.activeRank.length = 0;
      this.minActive = -1;
      this.to = pos;
      this.endSide = side;
      this.openStart = -1;
      this.next();
      return this;
    }
    forward(pos, side) {
      while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
        this.removeActive(this.minActive);
      this.cursor.forward(pos, side);
    }
    removeActive(index) {
      remove(this.active, index);
      remove(this.activeTo, index);
      remove(this.activeRank, index);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
      let i = 0, { value: value2, to, rank } = this.cursor;
      while (i < this.activeRank.length && this.activeRank[i] <= rank)
        i++;
      insert(this.active, i, value2);
      insert(this.activeTo, i, to);
      insert(this.activeRank, i, rank);
      if (trackOpen)
        insert(trackOpen, i, this.cursor.from);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    next() {
      let from = this.to;
      this.point = null;
      let trackOpen = this.openStart < 0 ? [] : null, trackExtra = 0;
      for (; ; ) {
        let a = this.minActive;
        if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
          if (this.activeTo[a] > from) {
            this.to = this.activeTo[a];
            this.endSide = this.active[a].endSide;
            break;
          }
          this.removeActive(a);
          if (trackOpen)
            remove(trackOpen, a);
        } else if (!this.cursor.value) {
          this.to = this.endSide = 1e9;
          break;
        } else if (this.cursor.from > from) {
          this.to = this.cursor.from;
          this.endSide = this.cursor.startSide;
          break;
        } else {
          let nextVal = this.cursor.value;
          if (!nextVal.point) {
            this.addActive(trackOpen);
            this.cursor.next();
          } else {
            this.point = nextVal;
            this.pointFrom = this.cursor.from;
            this.pointRank = this.cursor.rank;
            this.to = this.cursor.to;
            this.endSide = nextVal.endSide;
            if (this.cursor.from < from)
              trackExtra = 1;
            this.cursor.next();
            if (this.to > from)
              this.forward(this.to, this.endSide);
            break;
          }
        }
      }
      if (trackOpen) {
        let openStart = 0;
        while (openStart < trackOpen.length && trackOpen[openStart] < from)
          openStart++;
        this.openStart = openStart + trackExtra;
      }
    }
    activeForPoint(to) {
      if (!this.active.length)
        return this.active;
      let active = [];
      for (let i = 0; i < this.active.length; i++) {
        if (this.activeRank[i] > this.pointRank)
          break;
        if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide > this.point.endSide)
          active.push(this.active[i]);
      }
      return active;
    }
    openEnd(to) {
      let open = 0;
      while (open < this.activeTo.length && this.activeTo[open] > to)
        open++;
      return open;
    }
  };
  function compare(a, startA, b, startB, length, comparator) {
    a.goto(startA);
    b.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    for (; ; ) {
      let diff = a.to + dPos - b.to || a.endSide - b.endSide;
      let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
      if (a.point || b.point) {
        if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point))))
          comparator.comparePoint(pos, clipEnd, a.point, b.point);
      } else {
        if (clipEnd > pos && !sameValues(a.active, b.active))
          comparator.compareRange(pos, clipEnd, a.active, b.active);
      }
      if (end > endB)
        break;
      pos = end;
      if (diff <= 0)
        a.next();
      if (diff >= 0)
        b.next();
    }
  }
  function sameValues(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (a[i] != b[i] && !a[i].eq(b[i]))
        return false;
    return true;
  }
  function remove(array, index) {
    for (let i = index, e = array.length - 1; i < e; i++)
      array[i] = array[i + 1];
    array.pop();
  }
  function insert(array, index, value2) {
    for (let i = array.length - 1; i >= index; i--)
      array[i + 1] = array[i];
    array[index] = value2;
  }
  function findMinIndex(value2, array) {
    let found = -1, foundPos = 1e9;
    for (let i = 0; i < array.length; i++)
      if ((array[i] - foundPos || value2[i].endSide - value2[found].endSide) < 0) {
        found = i;
        foundPos = array[i];
      }
    return found;
  }

  // ../../node_modules/w3c-keyname/index.es.js
  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    229: "q"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: '"',
    229: "Q"
  };
  var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
  var safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
  var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
  var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  var brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac;
  for (var i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
  for (var i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
  for (var i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }
  for (var code in base)
    if (!shift.hasOwnProperty(code))
      shift[code] = base[code];
  function keyName(event) {
    var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || (safari || ie) && event.shiftKey && event.key && event.key.length == 1;
    var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name2 == "Esc")
      name2 = "Escape";
    if (name2 == "Del")
      name2 = "Delete";
    if (name2 == "Left")
      name2 = "ArrowLeft";
    if (name2 == "Up")
      name2 = "ArrowUp";
    if (name2 == "Right")
      name2 = "ArrowRight";
    if (name2 == "Down")
      name2 = "ArrowDown";
    return name2;
  }

  // ../../node_modules/@codemirror/next/view/dist/index.js
  var [nav, doc] = typeof navigator != "undefined" ? [navigator, document] : [{ userAgent: "", vendor: "", platform: "" }, { documentElement: { style: {} } }];
  var ie_edge = /Edge\/(\d+)/.exec(nav.userAgent);
  var ie_upto10 = /MSIE \d/.test(nav.userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
  var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
  var gecko2 = !ie2 && /gecko\/(\d+)/i.test(nav.userAgent);
  var chrome2 = !ie2 && /Chrome\/(\d+)/.exec(nav.userAgent);
  var webkit = "webkitFontSmoothing" in doc.documentElement.style;
  var safari2 = !ie2 && /Apple Computer/.test(nav.vendor);
  var browser = {
    mac: /Mac/.test(nav.platform),
    ie: ie2,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko: gecko2,
    gecko_version: gecko2 ? +(/Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome2,
    chrome_version: chrome2 ? +chrome2[1] : 0,
    ios: safari2 && (/Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2),
    android: /Android\b/.test(nav.userAgent),
    webkit,
    safari: safari2,
    webkit_version: webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
  };
  function getSelection(root) {
    return root.getSelection ? root.getSelection() : document.getSelection();
  }
  function selectionCollapsed(domSel) {
    let collapsed = domSel.isCollapsed;
    if (collapsed && browser.chrome && domSel.rangeCount && !domSel.getRangeAt(0).collapsed)
      collapsed = false;
    return collapsed;
  }
  function hasSelection(dom, selection) {
    if (!selection.anchorNode)
      return false;
    try {
      return dom.contains(selection.anchorNode.nodeType == 3 ? selection.anchorNode.parentNode : selection.anchorNode);
    } catch (_) {
      return false;
    }
  }
  function clientRectsFor(dom) {
    if (dom.nodeType == 3) {
      let range = tempRange();
      range.setEnd(dom, dom.nodeValue.length);
      range.setStart(dom, 0);
      return range.getClientRects();
    } else if (dom.nodeType == 1) {
      return dom.getClientRects();
    } else {
      return [];
    }
  }
  function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
  }
  function domIndex(node) {
    for (var index = 0; ; index++) {
      node = node.previousSibling;
      if (!node)
        return index;
    }
  }
  function scanFor(node, off, targetNode, targetOff, dir) {
    for (; ; ) {
      if (node == targetNode && off == targetOff)
        return true;
      if (off == (dir < 0 ? 0 : maxOffset(node))) {
        if (node.nodeName == "DIV")
          return false;
        let parent = node.parentNode;
        if (!parent || parent.nodeType != 1)
          return false;
        off = domIndex(node) + (dir < 0 ? 0 : 1);
        node = parent;
      } else if (node.nodeType == 1) {
        node = node.childNodes[off + (dir < 0 ? -1 : 0)];
        off = dir < 0 ? maxOffset(node) : 0;
      } else {
        return false;
      }
    }
  }
  function maxOffset(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
  }
  function flattenRect(rect, left) {
    let x = left ? rect.left : rect.right;
    return { left: x, right: x, top: rect.top, bottom: rect.bottom };
  }
  function windowRect(win) {
    return {
      left: 0,
      right: win.innerWidth,
      top: 0,
      bottom: win.innerHeight
    };
  }
  var ScrollSpace = 5;
  function scrollRectIntoView(dom, rect) {
    let doc2 = dom.ownerDocument, win = doc2.defaultView;
    for (let cur2 = dom.parentNode; cur2; ) {
      if (cur2.nodeType == 1) {
        let bounding, top2 = cur2 == document.body;
        if (top2) {
          bounding = windowRect(win);
        } else {
          if (cur2.scrollHeight <= cur2.clientHeight && cur2.scrollWidth <= cur2.clientWidth) {
            cur2 = cur2.parentNode;
            continue;
          }
          let rect2 = cur2.getBoundingClientRect();
          bounding = {
            left: rect2.left,
            right: rect2.left + cur2.clientWidth,
            top: rect2.top,
            bottom: rect2.top + cur2.clientHeight
          };
        }
        let moveX = 0, moveY = 0;
        if (rect.top < bounding.top)
          moveY = -(bounding.top - rect.top + ScrollSpace);
        else if (rect.bottom > bounding.bottom)
          moveY = rect.bottom - bounding.bottom + ScrollSpace;
        if (rect.left < bounding.left)
          moveX = -(bounding.left - rect.left + ScrollSpace);
        else if (rect.right > bounding.right)
          moveX = rect.right - bounding.right + ScrollSpace;
        if (moveX || moveY) {
          if (top2) {
            win.scrollBy(moveX, moveY);
          } else {
            if (moveY) {
              let start = cur2.scrollTop;
              cur2.scrollTop += moveY;
              moveY = cur2.scrollTop - start;
            }
            if (moveX) {
              let start = cur2.scrollLeft;
              cur2.scrollLeft += moveX;
              moveX = cur2.scrollLeft - start;
            }
            rect = {
              left: rect.left - moveX,
              top: rect.top - moveY,
              right: rect.right - moveX,
              bottom: rect.bottom - moveY
            };
          }
        }
        if (top2)
          break;
        cur2 = cur2.parentNode;
      } else if (cur2.nodeType == 11) {
        cur2 = cur2.host;
      } else {
        break;
      }
    }
  }
  var DOMSelection = class {
    constructor() {
      this.anchorNode = null;
      this.anchorOffset = 0;
      this.focusNode = null;
      this.focusOffset = 0;
    }
    eq(domSel) {
      return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    set(domSel) {
      this.anchorNode = domSel.anchorNode;
      this.anchorOffset = domSel.anchorOffset;
      this.focusNode = domSel.focusNode;
      this.focusOffset = domSel.focusOffset;
    }
  };
  var preventScrollSupported = null;
  function focusPreventScroll(dom) {
    if (dom.setActive)
      return dom.setActive();
    if (preventScrollSupported)
      return dom.focus(preventScrollSupported);
    let stack = [];
    for (let cur2 = dom; cur2; cur2 = cur2.parentNode) {
      stack.push(cur2, cur2.scrollTop, cur2.scrollLeft);
      if (cur2 == cur2.ownerDocument)
        break;
    }
    dom.focus(preventScrollSupported == null ? {
      get preventScroll() {
        preventScrollSupported = { preventScroll: true };
        return true;
      }
    } : void 0);
    if (!preventScrollSupported) {
      preventScrollSupported = false;
      for (let i = 0; i < stack.length; ) {
        let elt = stack[i++], top2 = stack[i++], left = stack[i++];
        if (elt.scrollTop != top2)
          elt.scrollTop = top2;
        if (elt.scrollLeft != left)
          elt.scrollLeft = left;
      }
    }
  }
  var scratchRange;
  function tempRange() {
    return scratchRange || (scratchRange = document.createRange());
  }
  var DOMPos = class {
    constructor(node, offset, precise = true) {
      this.node = node;
      this.offset = offset;
      this.precise = precise;
    }
    static before(dom, precise) {
      return new DOMPos(dom.parentNode, domIndex(dom), precise);
    }
    static after(dom, precise) {
      return new DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
    }
  };
  var none2 = [];
  var ContentView = class {
    constructor() {
      this.parent = null;
      this.dom = null;
      this.dirty = 2;
    }
    get editorView() {
      if (!this.parent)
        throw new Error("Accessing view in orphan content view");
      return this.parent.editorView;
    }
    get overrideDOMText() {
      return null;
    }
    get posAtStart() {
      return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
      return this.posAtStart + this.length;
    }
    posBefore(view2) {
      let pos = this.posAtStart;
      for (let child of this.children) {
        if (child == view2)
          return pos;
        pos += child.length + child.breakAfter;
      }
      throw new RangeError("Invalid child in posBefore");
    }
    posAfter(view2) {
      return this.posBefore(view2) + view2.length;
    }
    coordsAt(_pos, _side) {
      return null;
    }
    sync(track) {
      if (this.dirty & 2) {
        let parent = this.dom, pos = null;
        for (let child of this.children) {
          if (child.dirty) {
            let next2 = pos ? pos.nextSibling : parent.firstChild;
            if (next2 && !child.dom && !ContentView.get(next2))
              child.reuseDOM(next2);
            child.sync(track);
            child.dirty = 0;
          }
          if (track && track.node == parent && pos != child.dom)
            track.written = true;
          syncNodeInto(parent, pos, child.dom);
          pos = child.dom;
        }
        let next = pos ? pos.nextSibling : parent.firstChild;
        if (next && track && track.node == parent)
          track.written = true;
        while (next)
          next = rm(next);
      } else if (this.dirty & 1) {
        for (let child of this.children)
          if (child.dirty) {
            child.sync(track);
            child.dirty = 0;
          }
      }
    }
    reuseDOM(_dom) {
      return false;
    }
    localPosFromDOM(node, offset) {
      let after;
      if (node == this.dom) {
        after = this.dom.childNodes[offset];
      } else {
        let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
        for (; ; ) {
          let parent = node.parentNode;
          if (parent == this.dom)
            break;
          if (bias == 0 && parent.firstChild != parent.lastChild) {
            if (node == parent.firstChild)
              bias = -1;
            else
              bias = 1;
          }
          node = parent;
        }
        if (bias < 0)
          after = node;
        else
          after = node.nextSibling;
      }
      if (after == this.dom.firstChild)
        return 0;
      while (after && !ContentView.get(after))
        after = after.nextSibling;
      if (!after)
        return this.length;
      for (let i = 0, pos = 0; ; i++) {
        let child = this.children[i];
        if (child.dom == after)
          return pos;
        pos += child.length + child.breakAfter;
      }
    }
    domBoundsAround(from, to, offset = 0) {
      let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
      for (let i = 0, pos = offset; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos < from && end > to)
          return child.domBoundsAround(from, to, pos);
        if (end >= from && fromI == -1) {
          fromI = i;
          fromStart = pos;
        }
        if (end >= to && end != pos && toI == -1) {
          toI = i;
          toEnd = end;
          break;
        }
        pos = end + child.breakAfter;
      }
      return { from: fromStart, to: toEnd < 0 ? offset + this.length : toEnd, startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild, endDOM: toI < this.children.length - 1 && toI >= 0 ? this.children[toI + 1].dom : null };
    }
    markDirty(andParent = false) {
      if (this.dirty & 2)
        return;
      this.dirty |= 2;
      this.markParentsDirty(andParent);
    }
    markParentsDirty(childList) {
      for (let parent = this.parent; parent; parent = parent.parent) {
        if (childList)
          parent.dirty |= 2;
        if (parent.dirty & 1)
          return;
        parent.dirty |= 1;
        childList = false;
      }
    }
    setParent(parent) {
      if (this.parent != parent) {
        this.parent = parent;
        if (this.dirty)
          this.markParentsDirty(true);
      }
    }
    setDOM(dom) {
      this.dom = dom;
      dom.cmView = this;
    }
    get rootView() {
      for (let v = this; ; ) {
        let parent = v.parent;
        if (!parent)
          return v;
        v = parent;
      }
    }
    replaceChildren(from, to, children = none2) {
      this.markDirty();
      for (let i = from; i < to; i++)
        this.children[i].parent = null;
      this.children.splice(from, to - from, ...children);
      for (let i = 0; i < children.length; i++)
        children[i].setParent(this);
    }
    ignoreMutation(_rec) {
      return false;
    }
    ignoreEvent(_event) {
      return false;
    }
    childCursor(pos = this.length) {
      return new ChildCursor(this.children, pos, this.children.length);
    }
    childPos(pos, bias = 1) {
      return this.childCursor().findPos(pos, bias);
    }
    toString() {
      let name2 = this.constructor.name.replace("View", "");
      return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
    }
    static get(node) {
      return node.cmView;
    }
  };
  ContentView.prototype.breakAfter = 0;
  function rm(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
  }
  function syncNodeInto(parent, after, dom) {
    let next = after ? after.nextSibling : parent.firstChild;
    if (dom.parentNode == parent)
      while (next != dom)
        next = rm(next);
    else
      parent.insertBefore(dom, next);
  }
  var ChildCursor = class {
    constructor(children, pos, i) {
      this.children = children;
      this.pos = pos;
      this.i = i;
      this.off = 0;
    }
    findPos(pos, bias = 1) {
      for (; ; ) {
        if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
          this.off = pos - this.pos;
          return this;
        }
        let next = this.children[--this.i];
        this.pos -= next.length + next.breakAfter;
      }
    }
  };
  var none$1 = [];
  var InlineView = class extends ContentView {
    become(_other) {
      return false;
    }
    getSide() {
      return 0;
    }
  };
  InlineView.prototype.children = none$1;
  var MaxJoinLen = 256;
  var TextView = class extends InlineView {
    constructor(text) {
      super();
      this.text = text;
    }
    get length() {
      return this.text.length;
    }
    createDOM(textDOM) {
      this.setDOM(textDOM || document.createTextNode(this.text));
    }
    sync(track) {
      if (!this.dom)
        this.createDOM();
      if (this.dom.nodeValue != this.text) {
        if (track && track.node == this.dom)
          track.written = true;
        this.dom.nodeValue = this.text;
      }
    }
    reuseDOM(dom) {
      if (dom.nodeType != 3)
        return false;
      this.createDOM(dom);
      return true;
    }
    merge(from, to, source2) {
      if (source2 && (!(source2 instanceof TextView) || this.length - (to - from) + source2.length > MaxJoinLen))
        return false;
      this.text = this.text.slice(0, from) + (source2 ? source2.text : "") + this.text.slice(to);
      this.markDirty();
      return true;
    }
    slice(from) {
      return new TextView(this.text.slice(from));
    }
    localPosFromDOM(node, offset) {
      return node == this.dom ? offset : offset ? this.text.length : 0;
    }
    domAtPos(pos) {
      return new DOMPos(this.dom, pos);
    }
    domBoundsAround(_from, _to, offset) {
      return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
    }
    coordsAt(pos, side) {
      return textCoords(this.dom, pos, side, this.length);
    }
  };
  var MarkView = class extends InlineView {
    constructor(mark, children = [], length = 0) {
      super();
      this.mark = mark;
      this.children = children;
      this.length = length;
      for (let ch of children)
        ch.setParent(this);
    }
    createDOM() {
      let dom = document.createElement(this.mark.tagName);
      if (this.mark.class)
        dom.className = this.mark.class;
      if (this.mark.attrs)
        for (let name2 in this.mark.attrs)
          dom.setAttribute(name2, this.mark.attrs[name2]);
      this.setDOM(dom);
    }
    sync(track) {
      if (!this.dom)
        this.createDOM();
      super.sync(track);
    }
    merge(from, to, source2, openStart, openEnd) {
      if (source2 && (!(source2 instanceof MarkView && source2.mark.eq(this.mark)) || from && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      mergeInlineChildren(this, from, to, source2 ? source2.children : none$1, openStart - 1, openEnd - 1);
      this.markDirty();
      return true;
    }
    slice(from) {
      return new MarkView(this.mark, sliceInlineChildren(this.children, from), this.length - from);
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this.dom, this.children, pos);
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
  };
  function textCoords(text, pos, side, length) {
    let from = pos, to = pos, flatten2 = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
      if (!(browser.chrome || browser.gecko)) {
        if (pos) {
          from--;
          flatten2 = 1;
        } else {
          to++;
          flatten2 = -1;
        }
      }
    } else {
      if (side < 0)
        from--;
      else
        to++;
    }
    let range = tempRange();
    range.setEnd(text, to);
    range.setStart(text, from);
    let rects = range.getClientRects(), rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
    if (browser.safari && !flatten2 && rect.width == 0)
      rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
    return flatten2 ? flattenRect(rect, flatten2 < 0) : rect;
  }
  var WidgetView = class extends InlineView {
    constructor(widget, length, side) {
      super();
      this.widget = widget;
      this.length = length;
      this.side = side;
    }
    static create(widget, length, side) {
      return new (widget.customView || WidgetView)(widget, length, side);
    }
    slice(from) {
      return WidgetView.create(this.widget, this.length - from, this.side);
    }
    sync() {
      if (!this.dom || !this.widget.updateDOM(this.dom)) {
        this.setDOM(this.widget.toDOM(this.editorView));
        this.dom.contentEditable = "false";
      }
    }
    getSide() {
      return this.side;
    }
    merge(from, to, source2, openStart, openEnd) {
      if (source2 && (!(source2 instanceof WidgetView) || !this.widget.compare(source2.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      this.length = from + (source2 ? source2.length : 0) + (this.length - to);
      return true;
    }
    become(other) {
      if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
        if (this.widget.constructor == other.widget.constructor) {
          if (!this.widget.eq(other.widget))
            this.markDirty(true);
          this.widget = other.widget;
          return true;
        }
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
    get overrideDOMText() {
      if (this.length == 0)
        return Text.empty;
      let top2 = this;
      while (top2.parent)
        top2 = top2.parent;
      let view2 = top2.editorView, text = view2 && view2.state.doc, start = this.posAtStart;
      return text ? text.slice(start, start + this.length) : Text.empty;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    domBoundsAround() {
      return null;
    }
    coordsAt(pos, side) {
      let rects = this.dom.getClientRects(), rect = null;
      for (let i = pos > 0 ? rects.length - 1 : 0; ; i += pos > 0 ? -1 : 1) {
        rect = rects[i];
        if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
          break;
      }
      return pos == 0 && side > 0 || pos == this.length && side <= 0 ? rect : flattenRect(rect, pos == 0);
    }
  };
  var CompositionView = class extends WidgetView {
    domAtPos(pos) {
      return new DOMPos(this.widget.text, pos);
    }
    sync() {
      if (!this.dom)
        this.setDOM(this.widget.toDOM());
    }
    localPosFromDOM(node, offset) {
      return !offset ? 0 : node.nodeType == 3 ? Math.min(offset, this.length) : this.length;
    }
    ignoreMutation() {
      return false;
    }
    get overrideDOMText() {
      return null;
    }
    coordsAt(pos, side) {
      return textCoords(this.widget.text, pos, side, this.length);
    }
  };
  function mergeInlineChildren(parent, from, to, elts, openStart, openEnd) {
    let cur2 = parent.childCursor();
    let { i: toI, off: toOff } = cur2.findPos(to, 1);
    let { i: fromI, off: fromOff } = cur2.findPos(from, -1);
    let dLen = from - to;
    for (let view2 of elts)
      dLen += view2.length;
    parent.length += dLen;
    let { children } = parent;
    if (fromI == toI && fromOff) {
      let start = children[fromI];
      if (elts.length == 1 && start.merge(fromOff, toOff, elts[0], openStart, openEnd))
        return;
      if (elts.length == 0) {
        start.merge(fromOff, toOff, null, openStart, openEnd);
        return;
      }
      let after = start.slice(toOff);
      if (after.merge(0, 0, elts[elts.length - 1], 0, openEnd))
        elts[elts.length - 1] = after;
      else
        elts.push(after);
      toI++;
      openEnd = toOff = 0;
    }
    if (toOff) {
      let end = children[toI];
      if (elts.length && end.merge(0, toOff, elts[elts.length - 1], 0, openEnd)) {
        elts.pop();
        openEnd = 0;
      } else {
        end.merge(0, toOff, null, 0, 0);
      }
    } else if (toI < children.length && elts.length && children[toI].merge(0, 0, elts[elts.length - 1], 0, openEnd)) {
      elts.pop();
      openEnd = 0;
    }
    if (fromOff) {
      let start = children[fromI];
      if (elts.length && start.merge(fromOff, start.length, elts[0], openStart, 0)) {
        elts.shift();
        openStart = 0;
      } else {
        start.merge(fromOff, start.length, null, 0, 0);
      }
      fromI++;
    } else if (fromI && elts.length) {
      let end = children[fromI - 1];
      if (end.merge(end.length, end.length, elts[0], openStart, 0)) {
        elts.shift();
        openStart = 0;
      }
    }
    while (fromI < toI && elts.length && children[toI - 1].become(elts[elts.length - 1])) {
      elts.pop();
      toI--;
      openEnd = 0;
    }
    while (fromI < toI && elts.length && children[fromI].become(elts[0])) {
      elts.shift();
      fromI++;
      openStart = 0;
    }
    if (!elts.length && fromI && toI < children.length && openStart && openEnd && children[toI].merge(0, 0, children[fromI - 1], openStart, openEnd))
      fromI--;
    if (elts.length || fromI != toI)
      parent.replaceChildren(fromI, toI, elts);
  }
  function sliceInlineChildren(children, from) {
    let result = [], off = 0;
    for (let elt of children) {
      let end = off + elt.length;
      if (end > from)
        result.push(off < from ? elt.slice(from - off) : elt);
      off = end;
    }
    return result;
  }
  function inlineDOMAtPos(dom, children, pos) {
    let i = 0;
    for (let off = 0; i < children.length; i++) {
      let child = children[i], end = off + child.length;
      if (end == off && child.getSide() <= 0)
        continue;
      if (pos > off && pos < end && child.dom.parentNode == dom)
        return child.domAtPos(pos - off);
      if (pos <= off)
        break;
      off = end;
    }
    for (; i > 0; i--) {
      let before = children[i - 1].dom;
      if (before.parentNode == dom)
        return DOMPos.after(before);
    }
    return new DOMPos(dom, 0);
  }
  function joinInlineInto(parent, view2, open) {
    let last, { children } = parent;
    if (open > 0 && view2 instanceof MarkView && children.length && (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view2.mark)) {
      joinInlineInto(last, view2.children[0], open - 1);
    } else {
      children.push(view2);
      view2.setParent(parent);
    }
    parent.length += view2.length;
  }
  function coordsInChildren(view2, pos, side) {
    for (let off = 0, i = 0; i < view2.children.length; i++) {
      let child = view2.children[i], end = off + child.length;
      if (end == off && child.getSide() <= 0)
        continue;
      if (side <= 0 || end == view2.length ? end >= pos : end > pos)
        return child.coordsAt(pos - off, side);
      off = end;
    }
    return (view2.dom.lastChild || view2.dom).getBoundingClientRect();
  }
  function combineAttrs(source2, target2) {
    for (let name2 in source2) {
      if (name2 == "class" && target2.class)
        target2.class += " " + source2.class;
      else if (name2 == "style" && target2.style)
        target2.style += ";" + source2.style;
      else
        target2[name2] = source2[name2];
    }
    return target2;
  }
  function attrsEq(a, b) {
    if (a == b)
      return true;
    if (!a || !b)
      return false;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length != keysB.length)
      return false;
    for (let key2 of keysA) {
      if (keysB.indexOf(key2) == -1 || a[key2] !== b[key2])
        return false;
    }
    return true;
  }
  function updateAttrs(dom, prev, attrs) {
    if (prev) {
      for (let name2 in prev)
        if (!(attrs && name2 in attrs))
          dom.removeAttribute(name2);
    }
    if (attrs) {
      for (let name2 in attrs)
        if (!(prev && prev[name2] == attrs[name2]))
          dom.setAttribute(name2, attrs[name2]);
    }
  }
  var WidgetType = class {
    eq(_widget) {
      return false;
    }
    updateDOM(_dom) {
      return false;
    }
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    get estimatedHeight() {
      return -1;
    }
    ignoreEvent(_event) {
      return true;
    }
    get customView() {
      return null;
    }
  };
  var BlockType;
  (function(BlockType2) {
    BlockType2[BlockType2["Text"] = 0] = "Text";
    BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
    BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
    BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
  })(BlockType || (BlockType = {}));
  var Decoration = class extends RangeValue {
    constructor(startSide, endSide, widget, spec) {
      super();
      this.startSide = startSide;
      this.endSide = endSide;
      this.widget = widget;
      this.spec = spec;
    }
    get heightRelevant() {
      return false;
    }
    static mark(spec) {
      return new MarkDecoration(spec);
    }
    static widget(spec) {
      let side = spec.side || 0;
      if (spec.block)
        side += (2e8 + 1) * (side > 0 ? 1 : -1);
      return new PointDecoration(spec, side, side, !!spec.block, spec.widget || null, false);
    }
    static replace(spec) {
      let block = !!spec.block;
      let { start, end } = getInclusive(spec);
      let startSide = block ? -2e8 * (start ? 2 : 1) : 1e8 * (start ? -1 : 1);
      let endSide = block ? 2e8 * (end ? 2 : 1) : 1e8 * (end ? 1 : -1);
      return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    static line(spec) {
      return new LineDecoration(spec);
    }
    static set(of, sort = false) {
      return RangeSet.of(of, sort);
    }
    hasHeight() {
      return this.widget ? this.widget.estimatedHeight > -1 : false;
    }
  };
  Decoration.none = RangeSet.empty;
  var MarkDecoration = class extends Decoration {
    constructor(spec) {
      let { start, end } = getInclusive(spec);
      super(1e8 * (start ? -1 : 1), 1e8 * (end ? 1 : -1), null, spec);
      this.tagName = spec.tagName || "span";
      this.class = spec.class || "";
      this.attrs = spec.attributes || null;
    }
    eq(other) {
      return this == other || other instanceof MarkDecoration && this.tagName == other.tagName && this.class == other.class && attrsEq(this.attrs, other.attrs);
    }
    range(from, to = from) {
      if (from >= to)
        throw new RangeError("Mark decorations may not be empty");
      return super.range(from, to);
    }
  };
  MarkDecoration.prototype.point = false;
  var LineDecoration = class extends Decoration {
    constructor(spec) {
      super(-1e8, -1e8, null, spec);
    }
    eq(other) {
      return other instanceof LineDecoration && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
      if (to != from)
        throw new RangeError("Line decoration ranges must be zero-length");
      return super.range(from, to);
    }
  };
  LineDecoration.prototype.mapMode = MapMode.TrackBefore;
  LineDecoration.prototype.point = true;
  var PointDecoration = class extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
      super(startSide, endSide, widget, spec);
      this.block = block;
      this.isReplace = isReplace;
      this.mapMode = !block ? MapMode.TrackDel : startSide < 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
    get type() {
      return this.startSide < this.endSide ? BlockType.WidgetRange : this.startSide < 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() {
      return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
    }
    eq(other) {
      return other instanceof PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to = from) {
      if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide < 0))
        throw new RangeError("Invalid range for replacement decoration");
      if (!this.isReplace && to != from)
        throw new RangeError("Widget decorations can only have zero-length ranges");
      return super.range(from, to);
    }
  };
  PointDecoration.prototype.point = true;
  function getInclusive(spec) {
    let { inclusiveStart: start, inclusiveEnd: end } = spec;
    if (start == null)
      start = spec.inclusive;
    if (end == null)
      end = spec.inclusive;
    return { start: start || false, end: end || false };
  }
  function widgetsEq(a, b) {
    return a == b || !!(a && b && a.compare(b));
  }
  function addRange(from, to, ranges, margin = 0) {
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last] + margin > from)
      ranges[last] = Math.max(ranges[last], to);
    else
      ranges.push(from, to);
  }
  var theme = Facet.define({ combine: (strs) => strs.join(" ") });
  var darkTheme = Facet.define({ combine: (values) => values.indexOf(true) > -1 });
  var baseThemeID = StyleModule.newName();
  function expandThemeClasses(sel) {
    return sel.replace(/\$\w[\w\.]*/g, (cls) => {
      let parts = cls.slice(1).split("."), result = "";
      for (let i = 1; i <= parts.length; i++)
        result += ".cm-" + parts.slice(0, i).join("-");
      return result;
    });
  }
  function buildTheme(main, spec) {
    return new StyleModule(spec, {
      process(sel) {
        sel = expandThemeClasses(sel);
        return /\$/.test(sel) ? sel.replace(/\$/, main) : main + " " + sel;
      },
      extend(template, sel) {
        template = expandThemeClasses(template);
        return sel.slice(0, main.length + 1) == main + " " ? main + " " + template.replace(/&/, sel.slice(main.length + 1)) : template.replace(/&/, sel);
      }
    });
  }
  function themeClass(selector) {
    if (selector.indexOf(".") < 0)
      return "cm-" + selector;
    let parts = selector.split("."), result = "";
    for (let i = 1; i <= parts.length; i++)
      result += (result ? " " : "") + "cm-" + parts.slice(0, i).join("-");
    return result;
  }
  var baseTheme = buildTheme("." + baseThemeID, {
    $: {
      position: "relative !important",
      boxSizing: "border-box",
      "&$focused": {
        outline_fallback: "1px dotted #212121",
        outline: "5px auto -webkit-focus-ring-color"
      },
      display: "flex !important",
      flexDirection: "column"
    },
    $scroller: {
      display: "flex !important",
      alignItems: "flex-start !important",
      fontFamily: "monospace",
      lineHeight: 1.4,
      height: "100%",
      overflowX: "auto",
      position: "relative",
      zIndex: 0
    },
    $content: {
      margin: 0,
      flexGrow: 2,
      minHeight: "100%",
      display: "block",
      whiteSpace: "pre",
      boxSizing: "border-box",
      padding: "4px 0",
      outline: "none"
    },
    "$$light $content": { caretColor: "black" },
    "$$dark $content": { caretColor: "white" },
    $line: {
      display: "block",
      padding: "0 2px 0 4px"
    },
    $selectionLayer: {
      zIndex: -1,
      contain: "size style"
    },
    $selectionBackground: {
      position: "absolute"
    },
    "$$light $selectionBackground": {
      background: "#d9d9d9"
    },
    "$$dark $selectionBackground": {
      background: "#222"
    },
    "$$focused$light $selectionBackground": {
      background: "#d7d4f0"
    },
    "$$focused$dark $selectionBackground": {
      background: "#233"
    },
    $cursorLayer: {
      zIndex: 100,
      contain: "size style",
      pointerEvents: "none"
    },
    "$$focused $cursorLayer": {
      animation: "steps(1) cm-blink 1.2s infinite"
    },
    "@keyframes cm-blink": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    "@keyframes cm-blink2": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    $cursor: {
      position: "absolute",
      borderLeft: "1.2px solid black",
      marginLeft: "-0.6px",
      pointerEvents: "none",
      display: "none"
    },
    "$$dark $cursor": {
      borderLeftColor: "#444"
    },
    "$$focused $cursor": {
      display: "block"
    },
    "$$light $activeLine": { backgroundColor: "#f3f9ff" },
    "$$dark $activeLine": { backgroundColor: "#223039" },
    $placeholder: {
      color: "#888",
      display: "inline-block"
    },
    $button: {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      padding: ".2em 1em",
      borderRadius: "3px"
    },
    "$$light $button": {
      backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
      }
    },
    "$$dark $button": {
      backgroundImage: "linear-gradient(#555, #111)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#111, #333)"
      }
    },
    $textfield: {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      border: "1px solid silver",
      padding: ".2em .5em"
    },
    "$$light $textfield": {
      backgroundColor: "white"
    },
    "$$dark $textfield": {
      border: "1px solid #555",
      backgroundColor: "inherit"
    }
  });
  var LineClass = themeClass("line");
  var LineView = class extends ContentView {
    constructor() {
      super(...arguments);
      this.children = [];
      this.length = 0;
      this.prevAttrs = void 0;
      this.attrs = null;
      this.breakAfter = 0;
    }
    merge(from, to, source2, takeDeco, openStart, openEnd) {
      if (source2) {
        if (!(source2 instanceof LineView))
          return false;
        if (!this.dom)
          source2.transferDOM(this);
      }
      if (takeDeco)
        this.setDeco(source2 ? source2.attrs : null);
      mergeInlineChildren(this, from, to, source2 ? source2.children : none$2, openStart, openEnd);
      return true;
    }
    split(at) {
      let end = new LineView();
      end.breakAfter = this.breakAfter;
      if (this.length == 0)
        return end;
      let { i, off } = this.childPos(at);
      if (off) {
        end.append(this.children[i].slice(off), 0);
        this.children[i].merge(off, this.children[i].length, null, 0, 0);
        i++;
      }
      for (let j = i; j < this.children.length; j++)
        end.append(this.children[j], 0);
      while (i > 0 && this.children[i - 1].length == 0) {
        this.children[i - 1].parent = null;
        i--;
      }
      this.children.length = i;
      this.markDirty();
      this.length = at;
      return end;
    }
    transferDOM(other) {
      if (!this.dom)
        return;
      other.setDOM(this.dom);
      other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
      this.prevAttrs = void 0;
      this.dom = null;
    }
    setDeco(attrs) {
      if (!attrsEq(this.attrs, attrs)) {
        if (this.dom) {
          this.prevAttrs = this.attrs;
          this.markDirty();
        }
        this.attrs = attrs;
      }
    }
    append(child, openStart) {
      joinInlineInto(this, child, openStart);
    }
    addLineDeco(deco) {
      let attrs = deco.spec.attributes;
      if (attrs)
        this.attrs = combineAttrs(attrs, this.attrs || {});
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this.dom, this.children, pos);
    }
    sync(track) {
      if (!this.dom) {
        this.setDOM(document.createElement("div"));
        this.dom.className = LineClass;
        this.prevAttrs = this.attrs ? null : void 0;
      }
      if (this.prevAttrs !== void 0) {
        updateAttrs(this.dom, this.prevAttrs, this.attrs);
        this.dom.classList.add(LineClass);
        this.prevAttrs = void 0;
      }
      super.sync(track);
      let last = this.dom.lastChild;
      if (!last || last.nodeName != "BR" && ContentView.get(last) instanceof WidgetView) {
        let hack = document.createElement("BR");
        hack.cmIgnore = true;
        this.dom.appendChild(hack);
      }
    }
    measureTextSize() {
      if (this.children.length == 0 || this.length > 20)
        return null;
      let totalWidth = 0;
      for (let child of this.children) {
        if (!(child instanceof TextView))
          return null;
        let rects = clientRectsFor(child.dom);
        if (rects.length != 1)
          return null;
        totalWidth += rects[0].width;
      }
      return { lineHeight: this.dom.getBoundingClientRect().height, charWidth: totalWidth / this.length };
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
    match(_other) {
      return false;
    }
    get type() {
      return BlockType.Text;
    }
    static find(docView, pos) {
      for (let i = 0, off = 0; ; i++) {
        let block = docView.children[i], end = off + block.length;
        if (end >= pos) {
          if (block instanceof LineView)
            return block;
          if (block.length)
            return null;
        }
        off = end + block.breakAfter;
      }
    }
  };
  var none$2 = [];
  var BlockWidgetView = class extends ContentView {
    constructor(widget, length, type2) {
      super();
      this.widget = widget;
      this.length = length;
      this.type = type2;
      this.breakAfter = 0;
    }
    merge(from, to, source2, _takeDeco, openStart, openEnd) {
      if (source2 && (!(source2 instanceof BlockWidgetView) || !this.widget.compare(source2.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      this.length = from + (source2 ? source2.length : 0) + (this.length - to);
      return true;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    split(at) {
      let len = this.length - at;
      this.length = at;
      return new BlockWidgetView(this.widget, len, this.type);
    }
    get children() {
      return none$2;
    }
    sync() {
      if (!this.dom || !this.widget.updateDOM(this.dom)) {
        this.setDOM(this.widget.toDOM(this.editorView));
        this.dom.contentEditable = "false";
      }
    }
    get overrideDOMText() {
      return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
    }
    domBoundsAround() {
      return null;
    }
    match(other) {
      if (other instanceof BlockWidgetView && other.type == this.type && other.widget.constructor == this.widget.constructor) {
        if (!other.widget.eq(this.widget))
          this.markDirty(true);
        this.widget = other.widget;
        this.length = other.length;
        this.breakAfter = other.breakAfter;
        return true;
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
  };
  var ContentBuilder = class {
    constructor(doc2, pos, end) {
      this.doc = doc2;
      this.pos = pos;
      this.end = end;
      this.content = [];
      this.curLine = null;
      this.breakAtStart = 0;
      this.openStart = -1;
      this.openEnd = -1;
      this.text = "";
      this.textOff = 0;
      this.cursor = doc2.iter();
      this.skip = pos;
    }
    posCovered() {
      if (this.content.length == 0)
        return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
      let last = this.content[this.content.length - 1];
      return !last.breakAfter && !(last instanceof BlockWidgetView && last.type == BlockType.WidgetBefore);
    }
    getLine() {
      if (!this.curLine)
        this.content.push(this.curLine = new LineView());
      return this.curLine;
    }
    addWidget(view2) {
      this.curLine = null;
      this.content.push(view2);
    }
    finish() {
      if (!this.posCovered())
        this.getLine();
    }
    wrapMarks(view2, active) {
      for (let i = active.length - 1; i >= 0; i--)
        view2 = new MarkView(active[i], [view2], view2.length);
      return view2;
    }
    buildText(length, active, openStart) {
      while (length > 0) {
        if (this.textOff == this.text.length) {
          let { value: value2, lineBreak, done } = this.cursor.next(this.skip);
          this.skip = 0;
          if (done)
            throw new Error("Ran out of text content when drawing inline views");
          if (lineBreak) {
            if (!this.posCovered())
              this.getLine();
            if (this.content.length)
              this.content[this.content.length - 1].breakAfter = 1;
            else
              this.breakAtStart = 1;
            this.curLine = null;
            length--;
            continue;
          } else {
            this.text = value2;
            this.textOff = 0;
          }
        }
        let take = Math.min(this.text.length - this.textOff, length, 512);
        this.getLine().append(this.wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
        this.textOff += take;
        length -= take;
        openStart = 0;
      }
    }
    span(from, to, active, openStart) {
      this.buildText(to - from, active, openStart);
      this.pos = to;
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    point(from, to, deco, active, openStart) {
      let len = to - from;
      if (deco instanceof PointDecoration) {
        if (deco.block) {
          let { type: type2 } = deco;
          if (type2 == BlockType.WidgetAfter && !this.posCovered())
            this.getLine();
          this.addWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type2));
        } else {
          let widget = this.wrapMarks(WidgetView.create(deco.widget || new NullWidget("span"), len, deco.startSide), active);
          this.getLine().append(widget, openStart);
        }
      } else if (this.doc.lineAt(this.pos).from == this.pos) {
        this.getLine().addLineDeco(deco);
      }
      if (len) {
        if (this.textOff + len <= this.text.length) {
          this.textOff += len;
        } else {
          this.skip += len - (this.text.length - this.textOff);
          this.text = "";
          this.textOff = 0;
        }
        this.pos = to;
      }
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    static build(text, from, to, decorations2) {
      let builder = new ContentBuilder(text, from, to);
      builder.openEnd = RangeSet.spans(decorations2, from, to, builder);
      if (builder.openStart < 0)
        builder.openStart = builder.openEnd;
      builder.finish();
      return builder;
    }
  };
  var NullWidget = class extends WidgetType {
    constructor(tag) {
      super();
      this.tag = tag;
    }
    eq(other) {
      return other.tag == this.tag;
    }
    toDOM() {
      return document.createElement(this.tag);
    }
    updateDOM(elt) {
      return elt.nodeName.toLowerCase() == this.tag;
    }
  };
  var Direction;
  (function(Direction2) {
    Direction2[Direction2["LTR"] = 0] = "LTR";
    Direction2[Direction2["RTL"] = 1] = "RTL";
  })(Direction || (Direction = {}));
  var LTR = Direction.LTR;
  var RTL = Direction.RTL;
  function dec(str) {
    let result = [];
    for (let i = 0; i < str.length; i++)
      result.push(1 << +str[i]);
    return result;
  }
  var LowTypes = dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
  var ArabicTypes = dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
  function charType(ch) {
    return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8203 ? 256 : ch == 8204 ? 256 : 1;
  }
  var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  var BidiSpan = class {
    constructor(from, to, level) {
      this.from = from;
      this.to = to;
      this.level = level;
    }
    get dir() {
      return this.level % 2 ? RTL : LTR;
    }
    side(end, dir) {
      return this.dir == dir == end ? this.to : this.from;
    }
    static find(order, index, level, assoc) {
      let maybe = -1;
      for (let i = 0; i < order.length; i++) {
        let span = order[i];
        if (span.from <= index && span.to >= index) {
          if (span.level == level)
            return i;
          if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe].level > span.level))
            maybe = i;
        }
      }
      if (maybe < 0)
        throw new RangeError("Index out of range");
      return maybe;
    }
  };
  var types = [];
  function computeOrder(line, direction) {
    let len = line.length, outerType = direction == LTR ? 1 : 2;
    if (!line || outerType == 1 && !BidiRE.test(line))
      return trivialOrder(len);
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
      let type2 = charType(line.charCodeAt(i));
      if (type2 == 512)
        type2 = prev;
      else if (type2 == 8 && prevStrong == 4)
        type2 = 16;
      types[i] = type2 == 4 ? 2 : type2;
      if (type2 & 7)
        prevStrong = type2;
      prev = type2;
    }
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
      let type2 = types[i];
      if (type2 == 128) {
        if (i < len - 1 && prev == types[i + 1] && prev & 24)
          type2 = types[i] = prev;
        else
          types[i] = 256;
      } else if (type2 == 64) {
        let end = i + 1;
        while (end < len && types[end] == 64)
          end++;
        let replace = i && prev == 8 || end < len && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      } else if (type2 == 8 && prevStrong == 1) {
        types[i] = 1;
      }
      prev = type2;
      if (type2 & 7)
        prevStrong = type2;
    }
    for (let i = 0; i < len; i++) {
      if (types[i] == 256) {
        let end = i + 1;
        while (end < len && types[end] == 256)
          end++;
        let beforeL = (i ? types[i - 1] : outerType) == 1;
        let afterL = (end < len ? types[end] : outerType) == 1;
        let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      }
    }
    let order = [];
    if (outerType == 1) {
      for (let i = 0; i < len; ) {
        let start = i, rtl = types[i++] != 1;
        while (i < len && rtl == (types[i] != 1))
          i++;
        if (rtl) {
          for (let j = i; j > start; ) {
            let end = j, l = types[--j] != 2;
            while (j > start && l == (types[j - 1] != 2))
              j--;
            order.push(new BidiSpan(j, end, l ? 2 : 1));
          }
        } else {
          order.push(new BidiSpan(start, i, 0));
        }
      }
    } else {
      for (let i = 0; i < len; ) {
        let start = i, rtl = types[i++] == 2;
        while (i < len && rtl == (types[i] == 2))
          i++;
        order.push(new BidiSpan(start, i, rtl ? 1 : 2));
      }
    }
    return order;
  }
  function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
  }
  var movedOver = "";
  function moveVisually(line, order, dir, start, forward) {
    var _a;
    let startIndex = start.head - line.from, spanI = -1;
    if (startIndex == 0) {
      if (!forward || !line.length)
        return null;
      if (order[0].level != dir) {
        startIndex = order[0].side(false, dir);
        spanI = 0;
      }
    } else if (startIndex == line.length) {
      if (forward)
        return null;
      let last = order[order.length - 1];
      if (last.level != dir) {
        startIndex = last.side(true, dir);
        spanI = order.length - 1;
      }
    }
    if (spanI < 0)
      spanI = BidiSpan.find(order, startIndex, (_a = start.bidiLevel) !== null && _a !== void 0 ? _a : -1, start.assoc);
    let span = order[spanI];
    if (startIndex == span.side(forward, dir)) {
      span = order[spanI += forward ? 1 : -1];
      startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
      return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
      return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
      return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, 0, nextSpan.level);
    return EditorSelection.cursor(nextIndex + line.from, 0, span.level);
  }
  var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line"];
  var HeightOracle = class {
    constructor() {
      this.doc = Text.empty;
      this.lineWrapping = false;
      this.direction = Direction.LTR;
      this.heightSamples = {};
      this.lineHeight = 14;
      this.charWidth = 7;
      this.lineLength = 30;
      this.heightChanged = false;
    }
    heightForGap(from, to) {
      let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
      if (this.lineWrapping)
        lines += Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength);
      return this.lineHeight * lines;
    }
    heightForLine(length) {
      if (!this.lineWrapping)
        return this.lineHeight;
      let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
      return lines * this.lineHeight;
    }
    setDoc(doc2) {
      this.doc = doc2;
      return this;
    }
    mustRefresh(lineHeights, whiteSpace, direction) {
      let newHeight = false;
      for (let i = 0; i < lineHeights.length; i++) {
        let h = lineHeights[i];
        if (h < 0) {
          i++;
        } else if (!this.heightSamples[Math.floor(h * 10)]) {
          newHeight = true;
          this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return newHeight || wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping || this.direction != direction;
    }
    refresh(whiteSpace, direction, lineHeight, charWidth, lineLength, knownHeights) {
      let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
      let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping || this.direction != direction;
      this.lineWrapping = lineWrapping;
      this.direction = direction;
      this.lineHeight = lineHeight;
      this.charWidth = charWidth;
      this.lineLength = lineLength;
      if (changed) {
        this.heightSamples = {};
        for (let i = 0; i < knownHeights.length; i++) {
          let h = knownHeights[i];
          if (h < 0)
            i++;
          else
            this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return changed;
    }
  };
  var MeasuredHeights = class {
    constructor(from, heights) {
      this.from = from;
      this.heights = heights;
      this.index = 0;
    }
    get more() {
      return this.index < this.heights.length;
    }
  };
  var BlockInfo = class {
    constructor(from, length, top2, height, type2) {
      this.from = from;
      this.length = length;
      this.top = top2;
      this.height = height;
      this.type = type2;
    }
    get to() {
      return this.from + this.length;
    }
    get bottom() {
      return this.top + this.height;
    }
    join(other) {
      let detail = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(other.type) ? other.type : [other]);
      return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
    }
  };
  var QueryType;
  (function(QueryType2) {
    QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
    QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
    QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
  })(QueryType || (QueryType = {}));
  var Epsilon = 1e-4;
  var HeightMap = class {
    constructor(length, height, flags = 2) {
      this.length = length;
      this.height = height;
      this.flags = flags;
    }
    get outdated() {
      return (this.flags & 2) > 0;
    }
    set outdated(value2) {
      this.flags = (value2 ? 2 : 0) | this.flags & ~2;
    }
    setHeight(oracle, height) {
      if (this.height != height) {
        if (Math.abs(this.height - height) > Epsilon)
          oracle.heightChanged = true;
        this.height = height;
      }
    }
    replace(_from, _to, nodes) {
      return HeightMap.of(nodes);
    }
    decomposeLeft(_to, result) {
      result.push(this);
    }
    decomposeRight(_from, result) {
      result.push(this);
    }
    applyChanges(decorations2, oldDoc, oracle, changes) {
      let me = this;
      for (let i = changes.length - 1; i >= 0; i--) {
        let { fromA, toA, fromB, toB } = changes[i];
        let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        toB += end.to - toA;
        toA = end.to;
        while (i > 0 && start.from <= changes[i - 1].toA) {
          fromA = changes[i - 1].fromA;
          fromB = changes[i - 1].fromB;
          i--;
          if (fromA < start.from)
            start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        }
        fromB += start.from - fromA;
        fromA = start.from;
        let nodes = NodeBuilder.build(oracle, decorations2, fromB, toB);
        me = me.replace(fromA, toA, nodes);
      }
      return me.updateHeight(oracle, 0);
    }
    static empty() {
      return new HeightMapText(0, 0);
    }
    static of(nodes) {
      if (nodes.length == 1)
        return nodes[0];
      let i = 0, j = nodes.length, before = 0, after = 0;
      for (; ; ) {
        if (i == j) {
          if (before > after * 2) {
            let split = nodes[i - 1];
            if (split.break)
              nodes.splice(--i, 1, split.left, null, split.right);
            else
              nodes.splice(--i, 1, split.left, split.right);
            j += 1 + split.break;
            before -= split.size;
          } else if (after > before * 2) {
            let split = nodes[j];
            if (split.break)
              nodes.splice(j, 1, split.left, null, split.right);
            else
              nodes.splice(j, 1, split.left, split.right);
            j += 2 + split.break;
            after -= split.size;
          } else {
            break;
          }
        } else if (before < after) {
          let next = nodes[i++];
          if (next)
            before += next.size;
        } else {
          let next = nodes[--j];
          if (next)
            after += next.size;
        }
      }
      let brk = 0;
      if (nodes[i - 1] == null) {
        brk = 1;
        i--;
      } else if (nodes[i] == null) {
        brk = 1;
        j++;
      }
      return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
    }
  };
  HeightMap.prototype.size = 1;
  var HeightMapBlock = class extends HeightMap {
    constructor(length, height, type2) {
      super(length, height);
      this.type = type2;
    }
    blockAt(_height, _doc, top2, offset) {
      return new BlockInfo(offset, this.length, top2, this.height, this.type);
    }
    lineAt(_value, _type, doc2, top2, offset) {
      return this.blockAt(0, doc2, top2, offset);
    }
    forEachLine(_from, _to, doc2, top2, offset, f) {
      f(this.blockAt(0, doc2, top2, offset));
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      this.outdated = false;
      return this;
    }
    toString() {
      return `block(${this.length})`;
    }
  };
  var HeightMapText = class extends HeightMapBlock {
    constructor(length, height) {
      super(length, height, BlockType.Text);
      this.collapsed = 0;
      this.widgetHeight = 0;
    }
    replace(_from, _to, nodes) {
      let node = nodes[0];
      if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
        if (node instanceof HeightMapGap)
          node = new HeightMapText(node.length, this.height);
        else
          node.height = this.height;
        if (!this.outdated)
          node.outdated = false;
        return node;
      } else {
        return HeightMap.of(nodes);
      }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      else if (force || this.outdated)
        this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
      this.outdated = false;
      return this;
    }
    toString() {
      return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
  };
  var HeightMapGap = class extends HeightMap {
    constructor(length) {
      super(length, 0);
    }
    lines(doc2, offset) {
      let firstLine = doc2.lineAt(offset).number, lastLine = doc2.lineAt(offset + this.length).number;
      return { firstLine, lastLine, lineHeight: this.height / (lastLine - firstLine + 1) };
    }
    blockAt(height, doc2, top2, offset) {
      let { firstLine, lastLine, lineHeight } = this.lines(doc2, offset);
      let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / lineHeight)));
      let { from, length } = doc2.line(firstLine + line);
      return new BlockInfo(from, length, top2 + lineHeight * line, lineHeight, BlockType.Text);
    }
    lineAt(value2, type2, doc2, top2, offset) {
      if (type2 == QueryType.ByHeight)
        return this.blockAt(value2, doc2, top2, offset);
      if (type2 == QueryType.ByPosNoHeight) {
        let { from: from2, to } = doc2.lineAt(value2);
        return new BlockInfo(from2, to - from2, 0, 0, BlockType.Text);
      }
      let { firstLine, lineHeight } = this.lines(doc2, offset);
      let { from, length, number: number2 } = doc2.lineAt(value2);
      return new BlockInfo(from, length, top2 + lineHeight * (number2 - firstLine), lineHeight, BlockType.Text);
    }
    forEachLine(from, to, doc2, top2, offset, f) {
      let { firstLine, lineHeight } = this.lines(doc2, offset);
      for (let pos = Math.max(from, offset), end = Math.min(offset + this.length, to); pos <= end; ) {
        let line = doc2.lineAt(pos);
        if (pos == from)
          top2 += lineHeight * (line.number - firstLine);
        f(new BlockInfo(line.from, line.length, top2, top2 += lineHeight, BlockType.Text));
        pos = line.to + 1;
      }
    }
    replace(from, to, nodes) {
      let after = this.length - to;
      if (after > 0) {
        let last = nodes[nodes.length - 1];
        if (last instanceof HeightMapGap)
          nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
        else
          nodes.push(null, new HeightMapGap(after - 1));
      }
      if (from > 0) {
        let first2 = nodes[0];
        if (first2 instanceof HeightMapGap)
          nodes[0] = new HeightMapGap(from + first2.length);
        else
          nodes.unshift(new HeightMapGap(from - 1), null);
      }
      return HeightMap.of(nodes);
    }
    decomposeLeft(to, result) {
      result.push(new HeightMapGap(to - 1), null);
    }
    decomposeRight(from, result) {
      result.push(null, new HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let end = offset + this.length;
      if (measured && measured.from <= offset + this.length && measured.more) {
        let nodes = [], pos = Math.max(offset, measured.from);
        if (measured.from > offset)
          nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
        while (pos <= end && measured.more) {
          let len = oracle.doc.lineAt(pos).length;
          if (nodes.length)
            nodes.push(null);
          let line = new HeightMapText(len, measured.heights[measured.index++]);
          line.outdated = false;
          nodes.push(line);
          pos += len + 1;
        }
        if (pos <= end)
          nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
        oracle.heightChanged = true;
        return HeightMap.of(nodes);
      } else if (force || this.outdated) {
        this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
        this.outdated = false;
      }
      return this;
    }
    toString() {
      return `gap(${this.length})`;
    }
  };
  var HeightMapBranch = class extends HeightMap {
    constructor(left, brk, right) {
      super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
      this.left = left;
      this.right = right;
      this.size = left.size + right.size;
    }
    get break() {
      return this.flags & 1;
    }
    blockAt(height, doc2, top2, offset) {
      let mid = top2 + this.left.height;
      return height < mid || this.right.height == 0 ? this.left.blockAt(height, doc2, top2, offset) : this.right.blockAt(height, doc2, mid, offset + this.left.length + this.break);
    }
    lineAt(value2, type2, doc2, top2, offset) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      let left = type2 == QueryType.ByHeight ? value2 < rightTop || this.right.height == 0 : value2 < rightOffset;
      let base2 = left ? this.left.lineAt(value2, type2, doc2, top2, offset) : this.right.lineAt(value2, type2, doc2, rightTop, rightOffset);
      if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
        return base2;
      let subQuery = type2 == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
      if (left)
        return base2.join(this.right.lineAt(rightOffset, subQuery, doc2, rightTop, rightOffset));
      else
        return this.left.lineAt(rightOffset, subQuery, doc2, top2, offset).join(base2);
    }
    forEachLine(from, to, doc2, top2, offset, f) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      if (this.break) {
        if (from < rightOffset)
          this.left.forEachLine(from, to, doc2, top2, offset, f);
        if (to >= rightOffset)
          this.right.forEachLine(from, to, doc2, rightTop, rightOffset, f);
      } else {
        let mid = this.lineAt(rightOffset, QueryType.ByPos, doc2, top2, offset);
        if (from < mid.from)
          this.left.forEachLine(from, mid.from - 1, doc2, top2, offset, f);
        if (mid.to >= from && mid.from <= to)
          f(mid);
        if (to > mid.to)
          this.right.forEachLine(mid.to + 1, to, doc2, rightTop, rightOffset, f);
      }
    }
    replace(from, to, nodes) {
      let rightStart = this.left.length + this.break;
      if (to < rightStart)
        return this.balanced(this.left.replace(from, to, nodes), this.right);
      if (from > this.left.length)
        return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
      let result = [];
      if (from > 0)
        this.decomposeLeft(from, result);
      let left = result.length;
      for (let node of nodes)
        result.push(node);
      if (from > 0)
        mergeGaps(result, left - 1);
      if (to < this.length) {
        let right = result.length;
        this.decomposeRight(to, result);
        mergeGaps(result, right);
      }
      return HeightMap.of(result);
    }
    decomposeLeft(to, result) {
      let left = this.left.length;
      if (to <= left)
        return this.left.decomposeLeft(to, result);
      result.push(this.left);
      if (this.break) {
        left++;
        if (to >= left)
          result.push(null);
      }
      if (to > left)
        this.right.decomposeLeft(to - left, result);
    }
    decomposeRight(from, result) {
      let left = this.left.length, right = left + this.break;
      if (from >= right)
        return this.right.decomposeRight(from - right, result);
      if (from < left)
        this.left.decomposeRight(from, result);
      if (this.break && from < right)
        result.push(null);
      result.push(this.right);
    }
    balanced(left, right) {
      if (left.size > 2 * right.size || right.size > 2 * left.size)
        return HeightMap.of(this.break ? [left, null, right] : [left, right]);
      this.left = left;
      this.right = right;
      this.height = left.height + right.height;
      this.outdated = left.outdated || right.outdated;
      this.size = left.size + right.size;
      this.length = left.length + this.break + right.length;
      return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
      if (measured && measured.from <= offset + left.length && measured.more)
        rebalance = left = left.updateHeight(oracle, offset, force, measured);
      else
        left.updateHeight(oracle, offset, force);
      if (measured && measured.from <= rightStart + right.length && measured.more)
        rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
      else
        right.updateHeight(oracle, rightStart, force);
      if (rebalance)
        return this.balanced(left, right);
      this.height = this.left.height + this.right.height;
      this.outdated = false;
      return this;
    }
    toString() {
      return this.left + (this.break ? " " : "-") + this.right;
    }
  };
  function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
      nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
  }
  var relevantWidgetHeight = 5;
  var NodeBuilder = class {
    constructor(pos, oracle) {
      this.pos = pos;
      this.oracle = oracle;
      this.nodes = [];
      this.lineStart = -1;
      this.lineEnd = -1;
      this.covering = null;
      this.writtenTo = pos;
    }
    get isCovered() {
      return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to) {
      if (this.lineStart > -1) {
        let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
        if (last instanceof HeightMapText)
          last.length += end - this.pos;
        else if (end > this.pos || !this.isCovered)
          this.nodes.push(new HeightMapText(end - this.pos, -1));
        this.writtenTo = end;
        if (to > end) {
          this.nodes.push(null);
          this.writtenTo++;
          this.lineStart = -1;
        }
      }
      this.pos = to;
    }
    point(from, to, deco) {
      if (from < to || deco.heightRelevant) {
        let height = deco.widget ? Math.max(0, deco.widget.estimatedHeight) : 0;
        let len = to - from;
        if (deco.block) {
          this.addBlock(new HeightMapBlock(len, height, deco.type));
        } else if (len || height >= relevantWidgetHeight) {
          this.addLineDeco(height, len);
        }
      } else if (to > from) {
        this.span(from, to);
      }
      if (this.lineEnd > -1 && this.lineEnd < this.pos)
        this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
      if (this.lineStart > -1)
        return;
      let { from, to } = this.oracle.doc.lineAt(this.pos);
      this.lineStart = from;
      this.lineEnd = to;
      if (this.writtenTo < from) {
        if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
          this.nodes.push(this.blankContent(this.writtenTo, from - 1));
        this.nodes.push(null);
      }
      if (this.pos > from)
        this.nodes.push(new HeightMapText(this.pos - from, -1));
      this.writtenTo = this.pos;
    }
    blankContent(from, to) {
      let gap = new HeightMapGap(to - from);
      if (this.oracle.doc.lineAt(from).to == to)
        gap.flags |= 4;
      return gap;
    }
    ensureLine() {
      this.enterLine();
      let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
      if (last instanceof HeightMapText)
        return last;
      let line = new HeightMapText(0, -1);
      this.nodes.push(line);
      return line;
    }
    addBlock(block) {
      this.enterLine();
      if (block.type == BlockType.WidgetAfter && !this.isCovered)
        this.ensureLine();
      this.nodes.push(block);
      this.writtenTo = this.pos = this.pos + block.length;
      if (block.type != BlockType.WidgetBefore)
        this.covering = block;
    }
    addLineDeco(height, length) {
      let line = this.ensureLine();
      line.length += length;
      line.collapsed += length;
      line.widgetHeight = Math.max(line.widgetHeight, height);
      this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
      let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
      if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
        this.nodes.push(new HeightMapText(0, -1));
      else if (this.writtenTo < this.pos || last == null)
        this.nodes.push(this.blankContent(this.writtenTo, this.pos));
      let pos = from;
      for (let node of this.nodes) {
        if (node instanceof HeightMapText)
          node.updateHeight(this.oracle, pos);
        pos += node ? node.length : 1;
      }
      return this.nodes;
    }
    static build(oracle, decorations2, from, to) {
      let builder = new NodeBuilder(from, oracle);
      RangeSet.spans(decorations2, from, to, builder, 0);
      return builder.finish(from);
    }
  };
  function heightRelevantDecoChanges(a, b, diff) {
    let comp = new DecorationComparator();
    RangeSet.compare(a, b, diff, comp, 0);
    return comp.changes;
  }
  var DecorationComparator = class {
    constructor() {
      this.changes = [];
    }
    compareRange() {
    }
    comparePoint(from, to, a, b) {
      if (from < to || a && a.heightRelevant || b && b.heightRelevant)
        addRange(from, to, this.changes, 5);
    }
  };
  var none$3 = [];
  var clickAddsSelectionRange = Facet.define();
  var dragMovesSelection = Facet.define();
  var mouseSelectionStyle = Facet.define();
  var exceptionSink = Facet.define();
  var updateListener = Facet.define();
  var inputHandler = Facet.define();
  function logException(state2, exception, context) {
    let handler = state2.facet(exceptionSink);
    if (handler.length)
      handler[0](exception);
    else if (window.onerror)
      window.onerror(String(exception), context, void 0, void 0, exception);
    else if (context)
      console.error(context + ":", exception);
    else
      console.error(exception);
  }
  var editable = Facet.define({ combine: (values) => values.length ? values[0] : true });
  var PluginFieldProvider = class {
    constructor(field, get) {
      this.field = field;
      this.get = get;
    }
  };
  var PluginField = class {
    from(get) {
      return new PluginFieldProvider(this, get);
    }
    static define() {
      return new PluginField();
    }
  };
  PluginField.decorations = PluginField.define();
  PluginField.scrollMargins = PluginField.define();
  var nextPluginID = 0;
  var viewPlugin = Facet.define();
  var ViewPlugin = class {
    constructor(id, create, fields) {
      this.id = id;
      this.create = create;
      this.fields = fields;
      this.extension = viewPlugin.of(this);
    }
    static define(create, spec) {
      let { eventHandlers, provide, decorations: decorations2 } = spec || {};
      let fields = [];
      if (provide)
        for (let provider of Array.isArray(provide) ? provide : [provide])
          fields.push(provider);
      if (eventHandlers)
        fields.push(domEventHandlers.from((value2) => ({ plugin: value2, handlers: eventHandlers })));
      if (decorations2)
        fields.push(PluginField.decorations.from(decorations2));
      return new ViewPlugin(nextPluginID++, create, fields);
    }
    static fromClass(cls, spec) {
      return ViewPlugin.define((view2) => new cls(view2), spec);
    }
  };
  var domEventHandlers = PluginField.define();
  var PluginInstance = class {
    constructor(spec) {
      this.spec = spec;
      this.mustUpdate = null;
      this.value = null;
    }
    takeField(type2, target2) {
      for (let { field, get } of this.spec.fields)
        if (field == type2)
          target2.push(get(this.value));
    }
    update(view2) {
      if (!this.value) {
        try {
          this.value = this.spec.create(view2);
        } catch (e) {
          logException(view2.state, e, "CodeMirror plugin crashed");
          return PluginInstance.dummy;
        }
      } else if (this.mustUpdate) {
        let update = this.mustUpdate;
        this.mustUpdate = null;
        if (!this.value.update)
          return this;
        try {
          this.value.update(update);
        } catch (e) {
          logException(update.state, e, "CodeMirror plugin crashed");
          if (this.value.destroy)
            try {
              this.value.destroy();
            } catch (_) {
            }
          return PluginInstance.dummy;
        }
      }
      return this;
    }
    destroy(view2) {
      var _a;
      if ((_a = this.value) === null || _a === void 0 ? void 0 : _a.destroy) {
        try {
          this.value.destroy();
        } catch (e) {
          logException(view2.state, e, "CodeMirror plugin crashed");
        }
      }
    }
  };
  PluginInstance.dummy = new PluginInstance(ViewPlugin.define(() => ({})));
  var editorAttributes = Facet.define({
    combine: (values) => values.reduce((a, b) => combineAttrs(b, a), {})
  });
  var contentAttributes = Facet.define({
    combine: (values) => values.reduce((a, b) => combineAttrs(b, a), {})
  });
  var decorations = Facet.define();
  var styleModule = Facet.define();
  var ChangedRange = class {
    constructor(fromA, toA, fromB, toB) {
      this.fromA = fromA;
      this.toA = toA;
      this.fromB = fromB;
      this.toB = toB;
    }
    join(other) {
      return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set) {
      let i = set.length, me = this;
      for (; i > 0; i--) {
        let range = set[i - 1];
        if (range.fromA > me.toA)
          continue;
        if (range.toA < me.fromA)
          break;
        me = me.join(range);
        set.splice(i - 1, 1);
      }
      set.splice(i, 0, me);
      return set;
    }
    static extendWithRanges(diff, ranges) {
      if (ranges.length == 0)
        return diff;
      let result = [];
      for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
        let next = dI == diff.length ? null : diff[dI], off = posA - posB;
        let end = next ? next.fromB : 1e9;
        while (rI < ranges.length && ranges[rI] < end) {
          let from = ranges[rI], to = ranges[rI + 1];
          let fromB = Math.max(posB, from), toB = Math.min(end, to);
          if (fromB <= toB)
            new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
          if (to > end)
            break;
          else
            rI += 2;
        }
        if (!next)
          return result;
        new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
        posA = next.toA;
        posB = next.toB;
      }
    }
  };
  var ViewUpdate = class {
    constructor(view2, state2, transactions = none$3) {
      this.view = view2;
      this.state = state2;
      this.transactions = transactions;
      this.flags = 0;
      this.startState = view2.state;
      this.changes = ChangeSet.empty(this.startState.doc.length);
      for (let tr of transactions)
        this.changes = this.changes.compose(tr.changes);
      let changedRanges = [];
      this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
      this.changedRanges = changedRanges;
      let focus = view2.hasFocus;
      if (focus != view2.inputState.notifiedFocused) {
        view2.inputState.notifiedFocused = focus;
        this.flags != 1;
      }
      if (this.docChanged)
        this.flags |= 2;
    }
    get viewportChanged() {
      return (this.flags & 4) > 0;
    }
    get heightChanged() {
      return (this.flags & 2) > 0;
    }
    get geometryChanged() {
      return this.docChanged || (this.flags & (16 | 2)) > 0;
    }
    get focusChanged() {
      return (this.flags & 1) > 0;
    }
    get docChanged() {
      return this.transactions.some((tr) => tr.docChanged);
    }
    get selectionSet() {
      return this.transactions.some((tr) => tr.selection);
    }
    get empty() {
      return this.flags == 0 && this.transactions.length == 0;
    }
  };
  function visiblePixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    let top2 = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    for (let parent = dom.parentNode; parent; ) {
      if (parent.nodeType == 1) {
        if ((parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) && window.getComputedStyle(parent).overflow != "visible") {
          let parentRect = parent.getBoundingClientRect();
          left = Math.max(left, parentRect.left);
          right = Math.min(right, parentRect.right);
          top2 = Math.max(top2, parentRect.top);
          bottom = Math.min(bottom, parentRect.bottom);
        }
        parent = parent.parentNode;
      } else if (parent.nodeType == 11) {
        parent = parent.host;
      } else {
        break;
      }
    }
    return {
      left: left - rect.left,
      right: right - rect.left,
      top: top2 - (rect.top + paddingTop),
      bottom: bottom - (rect.top + paddingTop)
    };
  }
  var LineGap = class {
    constructor(from, to, size) {
      this.from = from;
      this.to = to;
      this.size = size;
    }
    static same(a, b) {
      if (a.length != b.length)
        return false;
      for (let i = 0; i < a.length; i++) {
        let gA = a[i], gB = b[i];
        if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
          return false;
      }
      return true;
    }
    draw(wrapping) {
      return Decoration.replace({ widget: new LineGapWidget(this.size, wrapping) }).range(this.from, this.to);
    }
  };
  var LineGapWidget = class extends WidgetType {
    constructor(size, vertical) {
      super();
      this.size = size;
      this.vertical = vertical;
    }
    eq(other) {
      return other.size == this.size && other.vertical == this.vertical;
    }
    toDOM() {
      let elt = document.createElement("div");
      if (this.vertical) {
        elt.style.height = this.size + "px";
      } else {
        elt.style.width = this.size + "px";
        elt.style.height = "2px";
        elt.style.display = "inline-block";
      }
      return elt;
    }
    get estimatedHeight() {
      return this.vertical ? this.size : -1;
    }
  };
  var ViewState = class {
    constructor(state2) {
      this.state = state2;
      this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
      this.inView = true;
      this.paddingTop = 0;
      this.paddingBottom = 0;
      this.contentWidth = 0;
      this.heightOracle = new HeightOracle();
      this.heightMap = HeightMap.empty();
      this.scrollTo = null;
      this.printing = false;
      this.visibleRanges = [];
      this.mustEnforceCursorAssoc = false;
      this.heightMap = this.heightMap.applyChanges(state2.facet(decorations), Text.empty, this.heightOracle.setDoc(state2.doc), [new ChangedRange(0, 0, 0, state2.doc.length)]);
      this.viewport = this.getViewport(0, null);
      this.lineGaps = this.ensureLineGaps([]);
      this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(false)));
      this.computeVisibleRanges();
    }
    update(update, scrollTo2 = null) {
      let prev = this.state;
      this.state = update.state;
      let newDeco = this.state.facet(decorations);
      let contentChanges = update.changedRanges;
      let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(update.startState.facet(decorations), newDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
      let prevHeight = this.heightMap.height;
      this.heightMap = this.heightMap.applyChanges(newDeco, prev.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
      if (this.heightMap.height != prevHeight)
        update.flags |= 2;
      let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
      if (scrollTo2 && (scrollTo2.head < viewport.from || scrollTo2.head > viewport.to) || !this.viewportIsAppropriate(viewport))
        viewport = this.getViewport(0, scrollTo2);
      if (!viewport.eq(this.viewport)) {
        this.viewport = viewport;
        update.flags |= 4;
      }
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 15e3)
        update.flags |= this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
      this.computeVisibleRanges();
      if (scrollTo2)
        this.scrollTo = scrollTo2;
      if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc)
        this.mustEnforceCursorAssoc = true;
    }
    measure(docView, repeated) {
      let dom = docView.dom, whiteSpace = "", direction = Direction.LTR;
      if (!repeated) {
        let style = window.getComputedStyle(dom);
        whiteSpace = style.whiteSpace, direction = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
        this.paddingTop = parseInt(style.paddingTop) || 0;
        this.paddingBottom = parseInt(style.paddingBottom) || 0;
      }
      let pixelViewport = this.printing ? { top: -1e8, bottom: 1e8, left: -1e8, right: 1e8 } : visiblePixelRange(dom, this.paddingTop);
      let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
      this.pixelViewport = pixelViewport;
      this.inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
      if (!this.inView)
        return 0;
      let lineHeights = docView.measureVisibleLineHeights();
      let refresh = false, bias = 0, result = 0, oracle = this.heightOracle;
      if (!repeated) {
        let contentWidth = docView.dom.clientWidth;
        if (oracle.mustRefresh(lineHeights, whiteSpace, direction) || oracle.lineWrapping && Math.abs(contentWidth - this.contentWidth) > oracle.charWidth) {
          let { lineHeight, charWidth } = docView.measureTextSize();
          refresh = oracle.refresh(whiteSpace, direction, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
          if (refresh) {
            docView.minWidth = 0;
            result |= 16;
          }
        }
        if (this.contentWidth != contentWidth) {
          this.contentWidth = contentWidth;
          result |= 16;
        }
        if (dTop > 0 && dBottom > 0)
          bias = Math.max(dTop, dBottom);
        else if (dTop < 0 && dBottom < 0)
          bias = Math.min(dTop, dBottom);
      }
      oracle.heightChanged = false;
      this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new MeasuredHeights(this.viewport.from, lineHeights));
      if (oracle.heightChanged)
        result |= 2;
      if (!this.viewportIsAppropriate(this.viewport, bias) || this.scrollTo && (this.scrollTo.head < this.viewport.from || this.scrollTo.head > this.viewport.to)) {
        let newVP = this.getViewport(bias, this.scrollTo);
        if (newVP.from != this.viewport.from || newVP.to != this.viewport.to) {
          this.viewport = newVP;
          result |= 4;
        }
      }
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 15e3)
        result |= this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
      this.computeVisibleRanges();
      if (this.mustEnforceCursorAssoc) {
        this.mustEnforceCursorAssoc = false;
        docView.enforceCursorAssoc();
      }
      return result;
    }
    getViewport(bias, scrollTo2) {
      let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
      let map2 = this.heightMap, doc2 = this.state.doc, { top: top2, bottom } = this.pixelViewport;
      let viewport = new Viewport(map2.lineAt(top2 - marginTop * 1e3, QueryType.ByHeight, doc2, 0, 0).from, map2.lineAt(bottom + (1 - marginTop) * 1e3, QueryType.ByHeight, doc2, 0, 0).to);
      if (scrollTo2) {
        if (scrollTo2.head < viewport.from) {
          let { top: newTop } = map2.lineAt(scrollTo2.head, QueryType.ByPos, doc2, 0, 0);
          viewport = new Viewport(map2.lineAt(newTop - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map2.lineAt(newTop + (bottom - top2) + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
        } else if (scrollTo2.head > viewport.to) {
          let { bottom: newBottom } = map2.lineAt(scrollTo2.head, QueryType.ByPos, doc2, 0, 0);
          viewport = new Viewport(map2.lineAt(newBottom - (bottom - top2) - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map2.lineAt(newBottom + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
        }
      }
      return viewport;
    }
    mapViewport(viewport, changes) {
      let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
      return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0).to);
    }
    viewportIsAppropriate({ from, to }, bias = 0) {
      let { top: top2 } = this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0);
      let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0);
      return (from == 0 || top2 <= this.pixelViewport.top - Math.max(10, Math.min(-bias, 250))) && (to == this.state.doc.length || bottom >= this.pixelViewport.bottom + Math.max(10, Math.min(bias, 250))) && (top2 > this.pixelViewport.top - 2 * 1e3 && bottom < this.pixelViewport.bottom + 2 * 1e3);
    }
    mapLineGaps(gaps, changes) {
      if (!gaps.length || changes.empty)
        return gaps;
      let mapped = [];
      for (let gap of gaps)
        if (!changes.touchesRange(gap.from, gap.to))
          mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
      return mapped;
    }
    ensureLineGaps(current) {
      let gaps = [];
      if (this.heightOracle.direction != Direction.LTR)
        return gaps;
      this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, (line) => {
        if (line.length < 1e4)
          return;
        let structure = lineStructure(line.from, line.to, this.state);
        if (structure.total < 1e4)
          return;
        let viewFrom, viewTo;
        if (this.heightOracle.lineWrapping) {
          if (line.from != this.viewport.from)
            viewFrom = line.from;
          else
            viewFrom = findPosition(structure, (this.pixelViewport.top - line.top) / line.height);
          if (line.to != this.viewport.to)
            viewTo = line.to;
          else
            viewTo = findPosition(structure, (this.pixelViewport.bottom - line.top) / line.height);
        } else {
          let totalWidth = structure.total * this.heightOracle.charWidth;
          viewFrom = findPosition(structure, this.pixelViewport.left / totalWidth);
          viewTo = findPosition(structure, this.pixelViewport.right / totalWidth);
        }
        let sel = this.state.selection.main;
        if (sel.from <= viewFrom && sel.to >= line.from)
          viewFrom = sel.from;
        if (sel.from <= line.to && sel.to >= viewTo)
          viewTo = sel.to;
        let gapTo = viewFrom - 1e4, gapFrom = viewTo + 1e4;
        if (gapTo > line.from + 5e3)
          gaps.push(find(current, (gap) => gap.from == line.from && gap.to > gapTo - 5e3 && gap.to < gapTo + 5e3) || new LineGap(line.from, gapTo, this.gapSize(line, gapTo, true, structure)));
        if (gapFrom < line.to - 5e3)
          gaps.push(find(current, (gap) => gap.to == line.to && gap.from > gapFrom - 5e3 && gap.from < gapFrom + 5e3) || new LineGap(gapFrom, line.to, this.gapSize(line, gapFrom, false, structure)));
      });
      return gaps;
    }
    gapSize(line, pos, start, structure) {
      if (this.heightOracle.lineWrapping) {
        let height = line.height * findFraction(structure, pos);
        return start ? height : line.height - height;
      } else {
        let ratio = findFraction(structure, pos);
        return structure.total * this.heightOracle.charWidth * (start ? ratio : 1 - ratio);
      }
    }
    updateLineGaps(gaps) {
      if (!LineGap.same(gaps, this.lineGaps)) {
        this.lineGaps = gaps;
        this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this.heightOracle.lineWrapping)));
        return 8;
      }
      return 0;
    }
    computeVisibleRanges() {
      let deco = this.state.facet(decorations);
      if (this.lineGaps.length)
        deco = deco.concat(this.lineGapDeco);
      let ranges = [];
      RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
        span(from, to) {
          ranges.push({ from, to });
        },
        point() {
        }
      }, 20);
      this.visibleRanges = ranges;
    }
    lineAt(pos, editorTop) {
      return this.heightMap.lineAt(pos, QueryType.ByPos, this.state.doc, editorTop + this.paddingTop, 0);
    }
    lineAtHeight(height, editorTop) {
      return this.heightMap.lineAt(height, QueryType.ByHeight, this.state.doc, editorTop + this.paddingTop, 0);
    }
    blockAtHeight(height, editorTop) {
      return this.heightMap.blockAt(height, this.state.doc, editorTop + this.paddingTop, 0);
    }
    forEachLine(from, to, f, editorTop) {
      return this.heightMap.forEachLine(from, to, this.state.doc, editorTop + this.paddingTop, 0, f);
    }
  };
  var Viewport = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
    eq(b) {
      return this.from == b.from && this.to == b.to;
    }
  };
  function lineStructure(from, to, state2) {
    let ranges = [], pos = from, total = 0;
    RangeSet.spans(state2.facet(decorations), from, to, {
      span() {
      },
      point(from2, to2) {
        if (from2 > pos) {
          ranges.push({ from: pos, to: from2 });
          total += from2 - pos;
        }
        pos = to2;
      }
    }, 20);
    if (pos < to) {
      ranges.push({ from: pos, to });
      total += to - pos;
    }
    return { total, ranges };
  }
  function findPosition({ total, ranges }, ratio) {
    if (ratio <= 0)
      return ranges[0].from;
    if (ratio >= 1)
      return ranges[ranges.length - 1].to;
    let dist = Math.floor(total * ratio);
    for (let i = 0; ; i++) {
      let { from, to } = ranges[i], size = to - from;
      if (dist <= size)
        return from + dist;
      dist -= size;
    }
  }
  function findFraction(structure, pos) {
    let counted = 0;
    for (let { from, to } of structure.ranges) {
      if (pos <= to) {
        counted += pos - from;
        break;
      }
      counted += to - from;
    }
    return counted / structure.total;
  }
  function find(array, f) {
    for (let val of array)
      if (f(val))
        return val;
    return void 0;
  }
  var none$4 = [];
  var DocView = class extends ContentView {
    constructor(view2) {
      super();
      this.view = view2;
      this.viewports = none$4;
      this.compositionDeco = Decoration.none;
      this.decorations = [];
      this.minWidth = 0;
      this.minWidthFrom = 0;
      this.minWidthTo = 0;
      this.impreciseAnchor = null;
      this.impreciseHead = null;
      this.setDOM(view2.contentDOM);
      this.children = [new LineView()];
      this.children[0].setParent(this);
      this.updateInner([new ChangedRange(0, 0, 0, view2.state.doc.length)], this.updateDeco(), 0);
    }
    get root() {
      return this.view.root;
    }
    get editorView() {
      return this.view;
    }
    get length() {
      return this.view.state.doc.length;
    }
    update(update) {
      var _a;
      let changedRanges = update.changedRanges;
      if (this.minWidth > 0 && changedRanges.length) {
        if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
          this.minWidth = 0;
        } else {
          this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
          this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
        }
      }
      if (!((_a = this.view.inputState) === null || _a === void 0 ? void 0 : _a.composing))
        this.compositionDeco = Decoration.none;
      else if (update.transactions.length)
        this.compositionDeco = computeCompositionDeco(this.view, update.changes);
      let forceSelection = (browser.ie || browser.chrome) && !this.compositionDeco.size && update && update.state.doc.lines != update.startState.doc.lines;
      let prevDeco = this.decorations, deco = this.updateDeco();
      let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
      changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
      let pointerSel = update.transactions.some((tr) => tr.annotation(Transaction.userEvent) == "pointerselection");
      if (this.dirty == 0 && changedRanges.length == 0 && !(update.flags & (4 | 8)) && update.state.selection.main.from >= this.view.viewport.from && update.state.selection.main.to <= this.view.viewport.to) {
        this.updateSelection(forceSelection, pointerSel);
        return false;
      } else {
        this.updateInner(changedRanges, deco, update.startState.doc.length, forceSelection, pointerSel);
        return true;
      }
    }
    updateInner(changes, deco, oldLength, forceSelection = false, pointerSel = false) {
      this.updateChildren(changes, deco, oldLength);
      this.view.observer.ignore(() => {
        this.dom.style.height = this.view.viewState.heightMap.height + "px";
        this.dom.style.minWidth = this.minWidth ? this.minWidth + "px" : "";
        let track = browser.chrome ? { node: getSelection(this.view.root).focusNode, written: false } : void 0;
        this.sync(track);
        this.dirty = 0;
        if (track === null || track === void 0 ? void 0 : track.written)
          forceSelection = true;
        this.updateSelection(forceSelection, pointerSel);
        this.dom.style.height = "";
      });
    }
    updateChildren(changes, deco, oldLength) {
      let cursor = this.childCursor(oldLength);
      for (let i = changes.length - 1; ; i--) {
        let next = i >= 0 ? changes[i] : null;
        if (!next)
          break;
        let { fromA, toA, fromB, toB } = next;
        let { content: content2, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, deco);
        let { i: toI, off: toOff } = cursor.findPos(toA, 1);
        let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
        this.replaceRange(fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
      }
    }
    replaceRange(fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd) {
      let before = this.children[fromI], last = content2.length ? content2[content2.length - 1] : null;
      let breakAtEnd = last ? last.breakAfter : breakAtStart;
      if (fromI == toI && !breakAtStart && !breakAtEnd && content2.length < 2 && before.merge(fromOff, toOff, content2.length ? last : null, fromOff == 0, openStart, openEnd))
        return;
      let after = this.children[toI];
      if (toOff < after.length || after.children.length && after.children[after.children.length - 1].length == 0) {
        if (fromI == toI) {
          after = after.split(toOff);
          toOff = 0;
        }
        if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
          content2[content2.length - 1] = after;
        } else {
          if (toOff || after.children.length && after.children[0].length == 0)
            after.merge(0, toOff, null, false, 0, openEnd);
          content2.push(after);
        }
      } else if (after.breakAfter) {
        if (last)
          last.breakAfter = 1;
        else
          breakAtStart = 1;
      }
      toI++;
      before.breakAfter = breakAtStart;
      if (fromOff > 0) {
        if (!breakAtStart && content2.length && before.merge(fromOff, before.length, content2[0], false, openStart, 0)) {
          before.breakAfter = content2.shift().breakAfter;
        } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
          before.merge(fromOff, before.length, null, false, openStart, 0);
        }
        fromI++;
      }
      while (fromI < toI && content2.length) {
        if (this.children[toI - 1].match(content2[content2.length - 1]))
          toI--, content2.pop();
        else if (this.children[fromI].match(content2[0]))
          fromI++, content2.shift();
        else
          break;
      }
      if (fromI < toI || content2.length)
        this.replaceChildren(fromI, toI, content2);
    }
    updateSelection(force = false, fromPointer = false) {
      if (!(fromPointer || this.mayControlSelection()))
        return;
      let main = this.view.state.selection.main;
      let anchor = this.domAtPos(main.anchor);
      let head2 = this.domAtPos(main.head);
      let domSel = getSelection(this.root);
      if (force || !domSel.focusNode || browser.gecko && main.empty && nextToUneditable(domSel.focusNode, domSel.focusOffset) || !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head2.node, head2.offset, domSel.focusNode, domSel.focusOffset)) {
        this.view.observer.ignore(() => {
          if (main.empty) {
            if (browser.gecko) {
              let nextTo = nextToUneditable(anchor.node, anchor.offset);
              if (nextTo && nextTo != (1 | 2)) {
                let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 ? 1 : -1);
                if (text)
                  anchor = new DOMPos(text, nextTo == 1 ? 0 : text.nodeValue.length);
              }
            }
            domSel.collapse(anchor.node, anchor.offset);
            if (main.bidiLevel != null && domSel.cursorBidiLevel != null)
              domSel.cursorBidiLevel = main.bidiLevel;
          } else if (domSel.extend) {
            domSel.collapse(anchor.node, anchor.offset);
            domSel.extend(head2.node, head2.offset);
          } else {
            let range = document.createRange();
            if (main.anchor > main.head)
              [anchor, head2] = [head2, anchor];
            range.setEnd(head2.node, head2.offset);
            range.setStart(anchor.node, anchor.offset);
            domSel.removeAllRanges();
            domSel.addRange(range);
          }
        });
      }
      this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
      this.impreciseHead = head2.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
    }
    enforceCursorAssoc() {
      let cursor = this.view.state.selection.main;
      let sel = getSelection(this.root);
      if (!cursor.empty || !cursor.assoc || !sel.modify)
        return;
      let line = LineView.find(this, cursor.head);
      if (!line)
        return;
      let lineStart = line.posAtStart;
      if (cursor.head == lineStart || cursor.head == lineStart + line.length)
        return;
      let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
      if (!before || !after || before.bottom > after.top)
        return;
      let dom = this.domAtPos(cursor.head + cursor.assoc);
      sel.collapse(dom.node, dom.offset);
      sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    }
    mayControlSelection() {
      return this.view.state.facet(editable) ? this.root.activeElement == this.dom : hasSelection(this.dom, getSelection(this.root));
    }
    nearest(dom) {
      for (let cur2 = dom; cur2; ) {
        let domView = ContentView.get(cur2);
        if (domView && domView.rootView == this)
          return domView;
        cur2 = cur2.parentNode;
      }
      return null;
    }
    posFromDOM(node, offset) {
      let view2 = this.nearest(node);
      if (!view2)
        throw new RangeError("Trying to find position for a DOM position outside of the document");
      return view2.localPosFromDOM(node, offset) + view2.posAtStart;
    }
    domAtPos(pos) {
      let { i, off } = this.childCursor().findPos(pos, -1);
      for (; i < this.children.length - 1; ) {
        let child = this.children[i];
        if (off < child.length || child instanceof LineView)
          break;
        i++;
        off = 0;
      }
      return this.children[i].domAtPos(off);
    }
    coordsAt(pos, side) {
      for (let off = this.length, i = this.children.length - 1; ; i--) {
        let child = this.children[i], start = off - child.breakAfter - child.length;
        if (pos > start || pos == start && (child.type == BlockType.Text || !i || this.children[i - 1].breakAfter))
          return child.coordsAt(pos - start, side);
        off = start;
      }
    }
    measureVisibleLineHeights() {
      let result = [], { from, to } = this.view.viewState.viewport;
      let minWidth = Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
      for (let pos = 0, i = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (end > to)
          break;
        if (pos >= from) {
          result.push(child.dom.getBoundingClientRect().height);
          let width = child.dom.scrollWidth;
          if (width > minWidth) {
            this.minWidth = minWidth = width;
            this.minWidthFrom = pos;
            this.minWidthTo = end;
          }
        }
        pos = end + child.breakAfter;
      }
      return result;
    }
    measureTextSize() {
      for (let child of this.children) {
        if (child instanceof LineView) {
          let measure = child.measureTextSize();
          if (measure)
            return measure;
        }
      }
      let dummy = document.createElement("div"), lineHeight, charWidth;
      dummy.className = "cm-line";
      dummy.textContent = "abc def ghi jkl mno pqr stu";
      this.view.observer.ignore(() => {
        this.dom.appendChild(dummy);
        let rect = clientRectsFor(dummy.firstChild)[0];
        lineHeight = dummy.getBoundingClientRect().height;
        charWidth = rect ? rect.width / 27 : 7;
        dummy.remove();
      });
      return { lineHeight, charWidth };
    }
    childCursor(pos = this.length) {
      let i = this.children.length;
      if (i)
        pos -= this.children[--i].length;
      return new ChildCursor(this.children, pos, i);
    }
    computeBlockGapDeco() {
      let visible = this.view.viewState.viewport, viewports = [visible];
      let { head: head2, anchor } = this.view.state.selection.main;
      if (head2 < visible.from || head2 > visible.to) {
        let { from, to } = this.view.viewState.lineAt(head2, 0);
        viewports.push(new Viewport(from, to));
      }
      if (!viewports.some(({ from, to }) => anchor >= from && anchor <= to)) {
        let { from, to } = this.view.viewState.lineAt(anchor, 0);
        viewports.push(new Viewport(from, to));
      }
      this.viewports = viewports.sort((a, b) => a.from - b.from);
      let deco = [];
      for (let pos = 0, i = 0; ; i++) {
        let next = i == viewports.length ? null : viewports[i];
        let end = next ? next.from - 1 : this.length;
        if (end > pos) {
          let height = this.view.viewState.lineAt(end, 0).bottom - this.view.viewState.lineAt(pos, 0).top;
          deco.push(Decoration.replace({ widget: new BlockGapWidget(height), block: true, inclusive: true }).range(pos, end));
        }
        if (!next)
          break;
        pos = next.to + 1;
      }
      return Decoration.set(deco);
    }
    updateDeco() {
      return this.decorations = [
        this.computeBlockGapDeco(),
        this.view.viewState.lineGapDeco,
        this.compositionDeco,
        ...this.view.state.facet(decorations),
        ...this.view.pluginField(PluginField.decorations)
      ];
    }
    scrollPosIntoView(pos, side) {
      let rect = this.coordsAt(pos, side);
      if (!rect)
        return;
      let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
      for (let margins of this.view.pluginField(PluginField.scrollMargins))
        if (margins) {
          let { left, right, top: top2, bottom } = margins;
          if (left != null)
            mLeft = Math.max(mLeft, left);
          if (right != null)
            mRight = Math.max(mRight, right);
          if (top2 != null)
            mTop = Math.max(mTop, top2);
          if (bottom != null)
            mBottom = Math.max(mBottom, bottom);
        }
      scrollRectIntoView(this.dom, {
        left: rect.left - mLeft,
        top: rect.top - mTop,
        right: rect.right + mRight,
        bottom: rect.bottom + mBottom
      });
    }
  };
  var MaxNodeHeight = 1e7;
  var BlockGapWidget = class extends WidgetType {
    constructor(height) {
      super();
      this.height = height;
    }
    toDOM() {
      let elt = document.createElement("div");
      this.updateDOM(elt);
      return elt;
    }
    eq(other) {
      return other.height == this.height;
    }
    updateDOM(elt) {
      if (this.height < MaxNodeHeight) {
        while (elt.lastChild)
          elt.lastChild.remove();
        elt.style.height = this.height + "px";
      } else {
        elt.style.height = "";
        for (let remaining = this.height; remaining > 0; remaining -= MaxNodeHeight) {
          let fill = elt.appendChild(document.createElement("div"));
          fill.style.height = Math.min(remaining, MaxNodeHeight) + "px";
        }
      }
      return true;
    }
    get estimatedHeight() {
      return this.height;
    }
  };
  function computeCompositionDeco(view2, changes) {
    let sel = getSelection(view2.root);
    let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
    if (!textNode)
      return Decoration.none;
    let cView = view2.docView.nearest(textNode);
    let from, to, topNode = textNode;
    if (cView instanceof InlineView) {
      while (cView.parent instanceof InlineView)
        cView = cView.parent;
      from = cView.posAtStart;
      to = from + cView.length;
      topNode = cView.dom;
    } else if (cView instanceof LineView) {
      while (topNode.parentNode != cView.dom)
        topNode = topNode.parentNode;
      let prev = topNode.previousSibling;
      while (prev && !ContentView.get(prev))
        prev = prev.previousSibling;
      from = to = prev ? ContentView.get(prev).posAtEnd : cView.posAtStart;
    } else {
      return Decoration.none;
    }
    let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to, -1));
    let text = textNode.nodeValue, { state: state2 } = view2;
    if (newTo - newFrom < text.length) {
      if (state2.sliceDoc(newFrom, Math.min(state2.doc.length, newFrom + text.length)) == text)
        newTo = newFrom + text.length;
      else if (state2.sliceDoc(Math.max(0, newTo - text.length), newTo) == text)
        newFrom = newTo - text.length;
      else
        return Decoration.none;
    } else if (state2.sliceDoc(newFrom, newTo) != text) {
      return Decoration.none;
    }
    return Decoration.set(Decoration.replace({ widget: new CompositionWidget(topNode, textNode) }).range(newFrom, newTo));
  }
  var CompositionWidget = class extends WidgetType {
    constructor(top2, text) {
      super();
      this.top = top2;
      this.text = text;
    }
    eq(other) {
      return this.top == other.top && this.text == other.text;
    }
    toDOM() {
      return this.top;
    }
    ignoreEvent() {
      return false;
    }
    get customView() {
      return CompositionView;
    }
  };
  function nearbyTextNode(node, offset, side) {
    for (; ; ) {
      if (node.nodeType == 3)
        return node;
      if (node.nodeType == 1 && offset > 0 && side <= 0) {
        node = node.childNodes[offset - 1];
        offset = maxOffset(node);
      } else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
        node = node.childNodes[offset];
        offset = 0;
      } else {
        return null;
      }
    }
  }
  function nextToUneditable(node, offset) {
    if (node.nodeType != 1)
      return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
  }
  var DecorationComparator$1 = class {
    constructor() {
      this.changes = [];
    }
    compareRange(from, to) {
      addRange(from, to, this.changes);
    }
    comparePoint(from, to) {
      addRange(from, to, this.changes);
    }
  };
  function findChangedDeco(a, b, diff) {
    let comp = new DecorationComparator$1();
    RangeSet.compare(a, b, diff, comp);
    return comp.changes;
  }
  function groupAt(state2, pos, bias = 1) {
    let categorize = state2.charCategorizer(pos);
    let line = state2.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
      return EditorSelection.cursor(pos);
    if (linePos == 0)
      bias = 1;
    else if (linePos == line.length)
      bias = -1;
    let from = linePos, to = linePos;
    if (bias < 0)
      from = findClusterBreak(line.text, linePos, false);
    else
      to = findClusterBreak(line.text, linePos);
    let cat = categorize(line.text.slice(from, to));
    while (from > 0) {
      let prev = findClusterBreak(line.text, from, false);
      if (categorize(line.text.slice(prev, from)) != cat)
        break;
      from = prev;
    }
    while (to < line.length) {
      let next = findClusterBreak(line.text, to);
      if (categorize(line.text.slice(to, next)) != cat)
        break;
      to = next;
    }
    return EditorSelection.range(from + line.from, to + line.from);
  }
  function getdx(x, rect) {
    return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
  }
  function getdy(y, rect) {
    return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
  }
  function yOverlap(a, b) {
    return a.top < b.bottom - 1 && a.bottom > b.top + 1;
  }
  function upTop(rect, top2) {
    return top2 < rect.top ? { top: top2, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
  }
  function upBot(rect, bottom) {
    return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
  }
  function domPosAtCoords(parent, x, y) {
    let closest, closestRect, closestX, closestY;
    let above, below, aboveRect, belowRect;
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      let rects = clientRectsFor(child);
      for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (closestRect && yOverlap(closestRect, rect))
          rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
        let dx = getdx(x, rect), dy = getdy(y, rect);
        if (dx == 0 && dy == 0)
          return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
        if (!closest || closestY > dy || closestY == dy && closestX > dx) {
          closest = child;
          closestRect = rect;
          closestX = dx;
          closestY = dy;
        }
        if (dx == 0) {
          if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
            above = child;
            aboveRect = rect;
          } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
            below = child;
            belowRect = rect;
          }
        } else if (aboveRect && yOverlap(aboveRect, rect)) {
          aboveRect = upBot(aboveRect, rect.bottom);
        } else if (belowRect && yOverlap(belowRect, rect)) {
          belowRect = upTop(belowRect, rect.top);
        }
      }
    }
    if (aboveRect && aboveRect.bottom >= y) {
      closest = above;
      closestRect = aboveRect;
    } else if (belowRect && belowRect.top <= y) {
      closest = below;
      closestRect = belowRect;
    }
    if (!closest)
      return { node: parent, offset: 0 };
    let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
    if (closest.nodeType == 3)
      return domPosInText(closest, clipX, y);
    if (!closestX && closest.contentEditable == "true")
      return domPosAtCoords(closest, clipX, y);
    let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
    return { node: parent, offset };
  }
  function domPosInText(node, x, y) {
    let len = node.nodeValue.length, range = tempRange();
    for (let i = 0; i < len; i++) {
      range.setEnd(node, i + 1);
      range.setStart(node, i);
      let rects = range.getClientRects();
      for (let j = 0; j < rects.length; j++) {
        let rect = rects[j];
        if (rect.top == rect.bottom)
          continue;
        if (rect.left - 1 <= x && rect.right + 1 >= x && rect.top - 1 <= y && rect.bottom + 1 >= y) {
          let right = x >= (rect.left + rect.right) / 2, after = right;
          if (browser.chrome || browser.gecko) {
            range.setEnd(node, i);
            let rectBefore = range.getBoundingClientRect();
            if (rectBefore.left == rect.right)
              after = !right;
          }
          return { node, offset: i + (after ? 1 : 0) };
        }
      }
    }
    return { node, offset: 0 };
  }
  function posAtCoords(view2, { x, y }, bias = -1) {
    let content2 = view2.contentDOM.getBoundingClientRect(), block;
    let halfLine = view2.defaultLineHeight / 2;
    for (let bounced = false; ; ) {
      block = view2.blockAtHeight(y, content2.top);
      if (block.top > y || block.bottom < y) {
        bias = block.top > y ? -1 : 1;
        y = Math.min(block.bottom - halfLine, Math.max(block.top + halfLine, y));
        if (bounced)
          return -1;
        else
          bounced = true;
      }
      if (block.type == BlockType.Text)
        break;
      y = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
    }
    let lineStart = block.from;
    if (lineStart < view2.viewport.from)
      return view2.viewport.from == 0 ? 0 : null;
    if (lineStart > view2.viewport.to)
      return view2.viewport.to == view2.state.doc.length ? view2.state.doc.length : null;
    x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
    let root = view2.root, element = root.elementFromPoint(x, y);
    let node, offset = -1;
    if (element && view2.contentDOM.contains(element) && !(view2.docView.nearest(element) instanceof WidgetView)) {
      if (root.caretPositionFromPoint) {
        let pos = root.caretPositionFromPoint(x, y);
        if (pos)
          ({ offsetNode: node, offset } = pos);
      } else if (root.caretRangeFromPoint) {
        let range = root.caretRangeFromPoint(x, y);
        if (range)
          ({ startContainer: node, startOffset: offset } = range);
      }
    }
    if (!node || !view2.docView.dom.contains(node)) {
      let line = LineView.find(view2.docView, lineStart);
      ({ node, offset } = domPosAtCoords(line.dom, x, y));
    }
    return view2.docView.posFromDOM(node, offset);
  }
  function moveToLineBoundary(view2, start, forward, includeWrap) {
    let line = view2.state.doc.lineAt(start.head);
    let coords = !includeWrap || !view2.lineWrapping ? null : view2.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
    if (coords) {
      let editorRect = view2.dom.getBoundingClientRect();
      let pos = view2.posAtCoords({
        x: forward == (view2.textDirection == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
        y: (coords.top + coords.bottom) / 2
      });
      if (pos != null)
        return EditorSelection.cursor(pos, forward ? -1 : 1);
    }
    let lineView = LineView.find(view2.docView, start.head);
    let end = lineView ? forward ? lineView.posAtEnd : lineView.posAtStart : forward ? line.to : line.from;
    return EditorSelection.cursor(end, forward ? -1 : 1);
  }
  function moveByChar(view2, start, forward, by) {
    let line = view2.state.doc.lineAt(start.head), spans = view2.bidiSpans(line);
    for (let cur2 = start, check = null; ; ) {
      let next = moveVisually(line, spans, view2.textDirection, cur2, forward), char = movedOver;
      if (!next) {
        if (line.number == (forward ? view2.state.doc.lines : 1))
          return cur2;
        char = "\n";
        line = view2.state.doc.line(line.number + (forward ? 1 : -1));
        spans = view2.bidiSpans(line);
        next = EditorSelection.cursor(forward ? line.from : line.to);
      }
      if (!check) {
        if (!by)
          return next;
        check = by(char);
      } else if (!check(char)) {
        return cur2;
      }
      cur2 = next;
    }
  }
  function byGroup(view2, pos, start) {
    let categorize = view2.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
      let nextCat = categorize(next);
      if (cat == CharCategory.Space)
        cat = nextCat;
      return cat == nextCat;
    };
  }
  function moveVertically(view2, start, forward, distance) {
    var _a;
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view2.state.doc.length : 0))
      return EditorSelection.cursor(startPos);
    let startCoords = view2.coordsAtPos(startPos);
    if (startCoords) {
      let rect = view2.dom.getBoundingClientRect();
      let goal2 = (_a = start.goalColumn) !== null && _a !== void 0 ? _a : startCoords.left - rect.left;
      let resolvedGoal = rect.left + goal2;
      let dist = distance !== null && distance !== void 0 ? distance : 5;
      for (let startY = dir < 0 ? startCoords.top : startCoords.bottom, extra = 0; extra < 50; extra += 10) {
        let pos = posAtCoords(view2, { x: resolvedGoal, y: startY + (dist + extra) * dir }, dir);
        if (pos == null)
          break;
        if (pos != startPos)
          return EditorSelection.cursor(pos, void 0, void 0, goal2);
      }
    }
    let { doc: doc2 } = view2.state, line = doc2.lineAt(startPos), tabSize = view2.state.tabSize;
    let goal = start.goalColumn, goalCol = 0;
    if (goal == null) {
      for (const iter = doc2.iterRange(line.from, startPos); !iter.next().done; )
        goalCol = countColumn(iter.value, goalCol, tabSize);
      goal = goalCol * view2.defaultCharacterWidth;
    } else {
      goalCol = Math.round(goal / view2.defaultCharacterWidth);
    }
    if (dir < 0 && line.from == 0)
      return EditorSelection.cursor(0);
    else if (dir > 0 && line.to == doc2.length)
      return EditorSelection.cursor(line.to);
    let otherLine = doc2.line(line.number + dir);
    let result = otherLine.from;
    let seen = 0;
    for (const iter = doc2.iterRange(otherLine.from, otherLine.to); seen >= goalCol && !iter.next().done; ) {
      const { offset, leftOver } = findColumn(iter.value, seen, goalCol, tabSize);
      seen = goalCol - leftOver;
      result += offset;
    }
    return EditorSelection.cursor(result, void 0, void 0, goal);
  }
  var InputState = class {
    constructor(view2) {
      this.lastKeyCode = 0;
      this.lastKeyTime = 0;
      this.lastSelectionOrigin = null;
      this.lastSelectionTime = 0;
      this.lastEscPress = 0;
      this.scrollHandlers = [];
      this.registeredEvents = [];
      this.customHandlers = [];
      this.composing = false;
      this.compositionEndedAt = 0;
      this.mouseSelection = null;
      for (let type2 in handlers) {
        let handler = handlers[type2];
        view2.contentDOM.addEventListener(type2, (event) => {
          if (!eventBelongsToEditor(view2, event) || this.ignoreDuringComposition(event) || type2 == "keydown" && this.screenKeyEvent(view2, event))
            return;
          if (this.mustFlushObserver(event))
            view2.observer.forceFlush();
          if (this.runCustomHandlers(type2, view2, event))
            event.preventDefault();
          else
            handler(view2, event);
        });
        this.registeredEvents.push(type2);
      }
      view2.contentDOM.addEventListener("keydown", (event) => {
        view2.inputState.lastKeyCode = event.keyCode;
        view2.inputState.lastKeyTime = Date.now();
      });
      this.notifiedFocused = view2.hasFocus;
      this.ensureHandlers(view2);
    }
    setSelectionOrigin(origin) {
      this.lastSelectionOrigin = origin;
      this.lastSelectionTime = Date.now();
    }
    ensureHandlers(view2) {
      let handlers2 = this.customHandlers = view2.pluginField(domEventHandlers);
      for (let set of handlers2) {
        for (let type2 in set.handlers)
          if (this.registeredEvents.indexOf(type2) < 0 && type2 != "scroll") {
            this.registeredEvents.push(type2);
            view2.contentDOM.addEventListener(type2, (event) => {
              if (!eventBelongsToEditor(view2, event))
                return;
              if (this.runCustomHandlers(type2, view2, event))
                event.preventDefault();
            });
          }
      }
    }
    runCustomHandlers(type2, view2, event) {
      for (let set of this.customHandlers) {
        let handler = set.handlers[type2];
        if (handler) {
          try {
            if (handler.call(set.plugin, event, view2) || event.defaultPrevented)
              return true;
          } catch (e) {
            logException(view2.state, e);
          }
        }
      }
      return false;
    }
    runScrollHandlers(view2, event) {
      for (let set of this.customHandlers) {
        let handler = set.handlers.scroll;
        if (handler) {
          try {
            handler.call(set.plugin, event, view2);
          } catch (e) {
            logException(view2.state, e);
          }
        }
      }
    }
    ignoreDuringComposition(event) {
      if (!/^key/.test(event.type))
        return false;
      if (this.composing)
        return true;
      if (browser.safari && event.timeStamp - this.compositionEndedAt < 500) {
        this.compositionEndedAt = 0;
        return true;
      }
      return false;
    }
    screenKeyEvent(view2, event) {
      let protectedTab = event.keyCode == 9 && Date.now() < this.lastEscPress + 2e3;
      if (event.keyCode == 27)
        this.lastEscPress = Date.now();
      else if (modifierCodes.indexOf(event.keyCode) < 0)
        this.lastEscPress = 0;
      return protectedTab;
    }
    mustFlushObserver(event) {
      return event.type == "keydown" || event.type == "compositionend";
    }
    startMouseSelection(view2, event, style) {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
      this.mouseSelection = new MouseSelection(this, view2, event, style);
    }
    update(update) {
      if (this.mouseSelection)
        this.mouseSelection.update(update);
      this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
    }
  };
  var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
  var MouseSelection = class {
    constructor(inputState, view2, startEvent, style) {
      this.inputState = inputState;
      this.view = view2;
      this.startEvent = startEvent;
      this.style = style;
      let doc2 = view2.contentDOM.ownerDocument;
      doc2.addEventListener("mousemove", this.move = this.move.bind(this));
      doc2.addEventListener("mouseup", this.up = this.up.bind(this));
      this.extend = startEvent.shiftKey;
      this.multiple = view2.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view2, startEvent);
      this.dragMove = dragMovesSelection$1(view2, startEvent);
      this.dragging = isInPrimarySelection(view2, startEvent) ? null : false;
      if (this.dragging === false) {
        startEvent.preventDefault();
        this.select(startEvent);
      }
    }
    move(event) {
      if (event.buttons == 0)
        return this.destroy();
      if (this.dragging !== false)
        return;
      this.select(event);
    }
    up(event) {
      if (this.dragging == null)
        this.select(this.startEvent);
      if (!this.dragging)
        event.preventDefault();
      this.destroy();
    }
    destroy() {
      let doc2 = this.view.contentDOM.ownerDocument;
      doc2.removeEventListener("mousemove", this.move);
      doc2.removeEventListener("mouseup", this.up);
      this.inputState.mouseSelection = null;
    }
    select(event) {
      let selection = this.style.get(event, this.extend, this.multiple);
      if (!selection.eq(this.view.state.selection) || selection.main.assoc != this.view.state.selection.main.assoc)
        this.view.dispatch({
          selection,
          annotations: Transaction.userEvent.of("pointerselection"),
          scrollIntoView: true
        });
    }
    update(update) {
      if (update.docChanged && this.dragging)
        this.dragging = this.dragging.map(update.changes);
      this.style.update(update);
    }
  };
  function addsSelectionRange(view2, event) {
    let facet = view2.state.facet(clickAddsSelectionRange);
    return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
  }
  function dragMovesSelection$1(view2, event) {
    let facet = view2.state.facet(dragMovesSelection);
    return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
  }
  function isInPrimarySelection(view2, event) {
    let { main } = view2.state.selection;
    if (main.empty)
      return false;
    let sel = getSelection(view2.root);
    if (sel.rangeCount == 0)
      return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
        return true;
    }
    return false;
  }
  function eventBelongsToEditor(view2, event) {
    if (!event.bubbles)
      return true;
    if (event.defaultPrevented)
      return false;
    for (let node = event.target, cView; node != view2.contentDOM; node = node.parentNode)
      if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
        return false;
    return true;
  }
  var handlers = Object.create(null);
  var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
  function capturePaste(view2) {
    let parent = view2.dom.parentNode;
    if (!parent)
      return;
    let target2 = parent.appendChild(document.createElement("textarea"));
    target2.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target2.focus();
    setTimeout(() => {
      view2.focus();
      target2.remove();
      doPaste(view2, target2.value);
    }, 50);
  }
  function doPaste(view2, input) {
    let { state: state2 } = view2, changes, i = 1, text = state2.toText(input);
    let byLine = text.lines == state2.selection.ranges.length;
    let linewise = lastLinewiseCopy && state2.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
    if (linewise) {
      changes = {
        changes: state2.selection.ranges.map((r) => state2.doc.lineAt(r.from)).filter((l, i2, a) => i2 == 0 || a[i2 - 1] != l).map((line) => ({ from: line.from, insert: (byLine ? text.line(i++).text : input) + state2.lineBreak }))
      };
    } else if (byLine) {
      changes = state2.changeByRange((range) => {
        let line = text.line(i++);
        return {
          changes: { from: range.from, to: range.to, insert: line.text },
          range: EditorSelection.cursor(range.from + line.length)
        };
      });
    } else {
      changes = state2.replaceSelection(text);
    }
    view2.dispatch(changes, {
      annotations: Transaction.userEvent.of("paste"),
      scrollIntoView: true
    });
  }
  function mustCapture(event) {
    let mods = (event.ctrlKey ? 1 : 0) | (event.metaKey ? 8 : 0) | (event.altKey ? 2 : 0) | (event.shiftKey ? 4 : 0);
    let code = event.keyCode, macCtrl = browser.mac && mods == 1;
    return code == 8 || macCtrl && code == 72 || code == 46 || macCtrl && code == 68 || code == 27 || mods == (browser.mac ? 8 : 1) && (code == 66 || code == 73 || code == 89 || code == 90);
  }
  handlers.keydown = (view2, event) => {
    if (mustCapture(event))
      event.preventDefault();
    view2.inputState.setSelectionOrigin("keyboardselection");
  };
  handlers.touchdown = handlers.touchmove = (view2) => {
    view2.inputState.setSelectionOrigin("pointerselection");
  };
  handlers.mousedown = (view2, event) => {
    let style = null;
    for (let makeStyle of view2.state.facet(mouseSelectionStyle)) {
      style = makeStyle(view2, event);
      if (style)
        break;
    }
    if (!style && event.button == 0)
      style = basicMouseSelection(view2, event);
    if (style) {
      if (view2.root.activeElement != view2.contentDOM)
        view2.observer.ignore(() => focusPreventScroll(view2.contentDOM));
      view2.inputState.startMouseSelection(view2, event, style);
    }
  };
  function rangeForClick(view2, pos, bias, type2) {
    if (type2 == 1) {
      return EditorSelection.cursor(pos, bias);
    } else if (type2 == 2) {
      return groupAt(view2.state, pos, bias);
    } else {
      let line = LineView.find(view2.docView, pos);
      if (line)
        return EditorSelection.range(line.posAtStart, line.posAtEnd);
      let { from, to } = view2.state.doc.lineAt(pos);
      return EditorSelection.range(from, to);
    }
  }
  var insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
  var inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
  function findPositionSide(view2, pos, x, y) {
    let line = LineView.find(view2.docView, pos);
    if (!line)
      return 1;
    let off = pos - line.posAtStart;
    if (off == 0)
      return 1;
    if (off == line.length)
      return -1;
    let before = line.coordsAt(off, -1);
    if (before && inside(x, y, before))
      return -1;
    let after = line.coordsAt(off, 1);
    if (after && inside(x, y, after))
      return 1;
    return before && insideY(y, before) ? -1 : 1;
  }
  function queryPos(view2, event) {
    let pos = view2.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null)
      return null;
    return { pos, bias: findPositionSide(view2, pos, event.clientX, event.clientY) };
  }
  var BadMouseDetail = browser.ie && browser.ie_version <= 11;
  var lastMouseDown = null;
  var lastMouseDownCount = 0;
  function getClickType(event) {
    if (!BadMouseDetail)
      return event.detail;
    let last = lastMouseDown;
    lastMouseDown = event;
    return lastMouseDownCount = !last || last.timeStamp > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
  }
  function basicMouseSelection(view2, event) {
    let start = queryPos(view2, event), type2 = getClickType(event);
    let startSel = view2.state.selection;
    let last = start, lastEvent = event;
    return {
      update(update) {
        if (update.changes) {
          if (start)
            start.pos = update.changes.mapPos(start.pos);
          startSel = startSel.map(update.changes);
        }
      },
      get(event2, extend2, multiple) {
        let cur2;
        if (event2.clientX == lastEvent.clientX && event2.clientY == lastEvent.clientY)
          cur2 = last;
        else {
          cur2 = last = queryPos(view2, event2);
          lastEvent = event2;
        }
        if (!cur2 || !start)
          return startSel;
        let range = rangeForClick(view2, cur2.pos, cur2.bias, type2);
        if (start.pos != cur2.pos && !extend2) {
          let startRange = rangeForClick(view2, start.pos, start.bias, type2);
          let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
          range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
        }
        if (extend2)
          return startSel.replaceRange(startSel.main.extend(range.from, range.to));
        else if (multiple)
          return startSel.addRange(range);
        else
          return EditorSelection.create([range]);
      }
    };
  }
  handlers.dragstart = (view2, event) => {
    let { selection: { main } } = view2.state;
    let { mouseSelection } = view2.inputState;
    if (mouseSelection)
      mouseSelection.dragging = main;
    if (event.dataTransfer) {
      event.dataTransfer.setData("Text", view2.state.sliceDoc(main.from, main.to));
      event.dataTransfer.effectAllowed = "copyMove";
    }
  };
  handlers.drop = (view2, event) => {
    if (!event.dataTransfer)
      return;
    let dropPos = view2.posAtCoords({ x: event.clientX, y: event.clientY });
    let text = event.dataTransfer.getData("Text");
    if (dropPos == null || !text)
      return;
    event.preventDefault();
    let { mouseSelection } = view2.inputState;
    let del = mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ? { from: mouseSelection.dragging.from, to: mouseSelection.dragging.to } : null;
    let ins = { from: dropPos, insert: text };
    let changes = view2.state.changes(del ? [del, ins] : ins);
    view2.focus();
    view2.dispatch({
      changes,
      selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
      annotations: Transaction.userEvent.of("drop")
    });
  };
  handlers.paste = (view2, event) => {
    view2.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    let text = data && data.getData("text/plain");
    if (text) {
      doPaste(view2, text);
      event.preventDefault();
    } else {
      capturePaste(view2);
    }
  };
  function captureCopy(view2, text) {
    let parent = view2.dom.parentNode;
    if (!parent)
      return;
    let target2 = parent.appendChild(document.createElement("textarea"));
    target2.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target2.value = text;
    target2.focus();
    target2.selectionEnd = text.length;
    target2.selectionStart = 0;
    setTimeout(() => {
      target2.remove();
      view2.focus();
    }, 50);
  }
  function copiedRange(state2) {
    let content2 = [], ranges = [], linewise = false;
    for (let range of state2.selection.ranges)
      if (!range.empty) {
        content2.push(state2.sliceDoc(range.from, range.to));
        ranges.push(range);
      }
    if (!content2.length) {
      let upto = -1;
      for (let { from } of state2.selection.ranges) {
        let line = state2.doc.lineAt(from);
        if (line.number > upto) {
          content2.push(line.text);
          ranges.push({ from: line.from, to: Math.min(state2.doc.length, line.to + 1) });
        }
        upto = line.number;
      }
      linewise = true;
    }
    return { text: content2.join(state2.lineBreak), ranges, linewise };
  }
  var lastLinewiseCopy = null;
  handlers.copy = handlers.cut = (view2, event) => {
    let { text, ranges, linewise } = copiedRange(view2.state);
    if (!text)
      return;
    lastLinewiseCopy = linewise ? text : null;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      event.preventDefault();
      data.clearData();
      data.setData("text/plain", text);
    } else {
      captureCopy(view2, text);
    }
    if (event.type == "cut")
      view2.dispatch({
        changes: ranges,
        scrollIntoView: true,
        annotations: Transaction.userEvent.of("cut")
      });
  };
  handlers.focus = handlers.blur = (view2) => {
    setTimeout(() => {
      if (view2.hasFocus != view2.inputState.notifiedFocused)
        view2.update([]);
    }, 10);
  };
  handlers.beforeprint = (view2) => {
    view2.viewState.printing = true;
    view2.requestMeasure();
    setTimeout(() => {
      view2.viewState.printing = false;
      view2.requestMeasure();
    }, 2e3);
  };
  function forceClearComposition(view2) {
    if (view2.docView.compositionDeco.size)
      view2.update([]);
  }
  handlers.compositionstart = handlers.compositionupdate = (view2) => {
    if (!view2.inputState.composing) {
      if (view2.docView.compositionDeco.size) {
        view2.observer.flush();
        forceClearComposition(view2);
      }
      view2.inputState.composing = true;
    }
  };
  handlers.compositionend = (view2) => {
    view2.inputState.composing = false;
    view2.inputState.compositionEndedAt = Date.now();
    setTimeout(() => {
      if (!view2.inputState.composing)
        forceClearComposition(view2);
    }, 50);
  };
  var observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    characterDataOldValue: true
  };
  var useCharData = browser.ie && browser.ie_version <= 11;
  var DOMObserver = class {
    constructor(view2, onChange, onScrollChanged) {
      this.view = view2;
      this.onChange = onChange;
      this.onScrollChanged = onScrollChanged;
      this.active = false;
      this.ignoreSelection = new DOMSelection();
      this.delayedFlush = -1;
      this.queue = [];
      this.scrollTargets = [];
      this.intersection = null;
      this.intersecting = false;
      this.parentCheck = -1;
      this.dom = view2.contentDOM;
      this.observer = new MutationObserver((mutations) => {
        for (let mut of mutations)
          this.queue.push(mut);
        if (browser.ie && browser.ie_version <= 11 && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
          this.flushSoon();
        else
          this.flush();
      });
      if (useCharData)
        this.onCharData = (event) => {
          this.queue.push({
            target: event.target,
            type: "characterData",
            oldValue: event.prevValue
          });
          this.flushSoon();
        };
      this.onSelectionChange = (event) => {
        if (this.view.root.activeElement != this.dom)
          return;
        let sel = getSelection(this.view.root);
        let context = sel.anchorNode && this.view.docView.nearest(sel.anchorNode);
        if (context && context.ignoreEvent(event))
          return;
        if (browser.ie && browser.ie_version <= 11 && !this.view.state.selection.main.empty && sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
          this.flushSoon();
        else
          this.flush();
      };
      this.start();
      this.onScroll = this.onScroll.bind(this);
      window.addEventListener("scroll", this.onScroll);
      if (typeof IntersectionObserver == "function") {
        this.intersection = new IntersectionObserver((entries) => {
          if (this.parentCheck < 0)
            this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
          if (entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
            this.intersecting = !this.intersecting;
            this.onScrollChanged(document.createEvent("Event"));
          }
        }, {});
        this.intersection.observe(this.dom);
      }
      this.listenForScroll();
    }
    onScroll(e) {
      if (this.intersecting) {
        this.flush();
        this.onScrollChanged(e);
      }
    }
    listenForScroll() {
      this.parentCheck = -1;
      let i = 0, changed = null;
      for (let dom = this.dom; dom; ) {
        if (dom.nodeType == 1) {
          if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
            i++;
          else if (!changed)
            changed = this.scrollTargets.slice(0, i);
          if (changed)
            changed.push(dom);
          dom = dom.parentNode;
        } else if (dom.nodeType == 11) {
          dom = dom.host;
        } else {
          break;
        }
      }
      if (i < this.scrollTargets.length && !changed)
        changed = this.scrollTargets.slice(0, i);
      if (changed) {
        for (let dom of this.scrollTargets)
          dom.removeEventListener("scroll", this.onScroll);
        for (let dom of this.scrollTargets = changed)
          dom.addEventListener("scroll", this.onScroll);
      }
    }
    ignore(f) {
      if (!this.active)
        return f();
      try {
        this.stop();
        return f();
      } finally {
        this.start();
        this.clear();
      }
    }
    start() {
      if (this.active)
        return;
      this.observer.observe(this.dom, observeOptions);
      this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
      if (useCharData)
        this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
      this.active = true;
    }
    stop() {
      if (!this.active)
        return;
      this.active = false;
      this.observer.disconnect();
      this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
      if (useCharData)
        this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    clearSelection() {
      this.ignoreSelection.set(getSelection(this.view.root));
    }
    clear() {
      this.observer.takeRecords();
      this.queue.length = 0;
      this.clearSelection();
    }
    flushSoon() {
      if (this.delayedFlush < 0)
        this.delayedFlush = window.setTimeout(() => {
          this.delayedFlush = -1;
          this.flush();
        }, 20);
    }
    forceFlush() {
      if (this.delayedFlush >= 0) {
        window.clearTimeout(this.delayedFlush);
        this.delayedFlush = -1;
        this.flush();
      }
    }
    flush() {
      if (this.delayedFlush >= 0)
        return;
      let records = this.queue;
      for (let mut of this.observer.takeRecords())
        records.push(mut);
      if (records.length)
        this.queue = [];
      let selection = getSelection(this.view.root);
      let newSel = !this.ignoreSelection.eq(selection) && hasSelection(this.dom, selection);
      if (records.length == 0 && !newSel)
        return;
      let from = -1, to = -1, typeOver = false;
      for (let record of records) {
        let range = this.readMutation(record);
        if (!range)
          continue;
        if (range.typeOver)
          typeOver = true;
        if (from == -1) {
          ({ from, to } = range);
        } else {
          from = Math.min(range.from, from);
          to = Math.max(range.to, to);
        }
      }
      let startState = this.view.state;
      if (from > -1 || newSel)
        this.onChange(from, to, typeOver);
      if (this.view.state == startState) {
        if (this.view.docView.dirty) {
          this.ignore(() => this.view.docView.sync());
          this.view.docView.dirty = 0;
        }
        this.view.docView.updateSelection();
      }
      this.clearSelection();
    }
    readMutation(rec) {
      let cView = this.view.docView.nearest(rec.target);
      if (!cView || cView.ignoreMutation(rec))
        return null;
      cView.markDirty();
      if (rec.type == "childList") {
        let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
        let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
        return {
          from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
          to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
          typeOver: false
        };
      } else {
        return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
      }
    }
    destroy() {
      this.stop();
      if (this.intersection)
        this.intersection.disconnect();
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("scroll", this.onScroll);
      clearTimeout(this.parentCheck);
    }
  };
  function findChild(cView, dom, dir) {
    while (dom) {
      let curView = ContentView.get(dom);
      if (curView && curView.parent == cView)
        return curView;
      let parent = dom.parentNode;
      dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
  }
  function applyDOMChange(view2, start, end, typeOver) {
    let change, newSel;
    let sel = view2.state.selection.main, bounds;
    if (start > -1 && (bounds = view2.docView.domBoundsAround(start, end, 0))) {
      let { from, to } = bounds;
      let selPoints = view2.docView.impreciseHead || view2.docView.impreciseAnchor ? [] : selectionPoints(view2.contentDOM, view2.root);
      let reader = new DOMReader(selPoints, view2.state.lineBreak);
      reader.readRange(bounds.startDOM, bounds.endDOM);
      newSel = selectionFromPoints(selPoints, from);
      let preferredPos = sel.from, preferredSide = null;
      if (view2.inputState.lastKeyCode === 8 && view2.inputState.lastKeyTime > Date.now() - 100) {
        preferredPos = sel.to;
        preferredSide = "end";
      }
      let diff = findDiff(view2.state.sliceDoc(from, to), reader.text, preferredPos - from, preferredSide);
      if (diff)
        change = {
          from: from + diff.from,
          to: from + diff.toA,
          insert: view2.state.toText(reader.text.slice(diff.from, diff.toB))
        };
    } else if (view2.hasFocus) {
      let domSel = getSelection(view2.root);
      let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view2.docView;
      let head2 = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset ? view2.state.selection.main.head : view2.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
      let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset ? view2.state.selection.main.anchor : selectionCollapsed(domSel) ? head2 : view2.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      if (head2 != sel.head || anchor != sel.anchor)
        newSel = EditorSelection.single(anchor, head2);
    }
    if (!change && !newSel)
      return;
    if (!change && typeOver && !sel.empty && newSel && newSel.main.empty)
      change = { from: sel.from, to: sel.to, insert: view2.state.doc.slice(sel.from, sel.to) };
    if (change) {
      let startState = view2.state;
      if (browser.android && (change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view2, "Enter", 10) || change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 && dispatchKey(view2, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view2, "Delete", 46)))
        return;
      let text = change.insert.toString();
      if (view2.state.facet(inputHandler).some((h) => h(view2, change.from, change.to, text)))
        return;
      let tr;
      if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3) {
        let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
        let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
        tr = startState.replaceSelection(view2.state.toText(before + change.insert.sliceString(0, void 0, view2.state.lineBreak) + after));
      } else {
        let changes = startState.changes(change);
        tr = {
          changes,
          selection: newSel && !startState.selection.main.eq(newSel.main) && newSel.main.to <= changes.newLength ? startState.selection.replaceRange(newSel.main) : void 0
        };
      }
      view2.dispatch(tr, { scrollIntoView: true, annotations: Transaction.userEvent.of("input") });
    } else if (newSel && !newSel.main.eq(sel)) {
      let scrollIntoView2 = false, annotations;
      if (view2.inputState.lastSelectionTime > Date.now() - 50) {
        if (view2.inputState.lastSelectionOrigin == "keyboardselection")
          scrollIntoView2 = true;
        else
          annotations = Transaction.userEvent.of(view2.inputState.lastSelectionOrigin);
      }
      view2.dispatch({ selection: newSel, scrollIntoView: scrollIntoView2, annotations });
    }
  }
  function findDiff(a, b, preferredPos, preferredSide) {
    let minLen = Math.min(a.length, b.length);
    let from = 0;
    while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
      from++;
    if (from == minLen && a.length == b.length)
      return null;
    let toA = a.length, toB = b.length;
    while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
      toA--;
      toB--;
    }
    if (preferredSide == "end") {
      let adjust = Math.max(0, from - Math.min(toA, toB));
      preferredPos -= toA + adjust - from;
    }
    if (toA < from && a.length < b.length) {
      let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
      from -= move;
      toB = from + (toB - toA);
      toA = from;
    } else if (toB < from) {
      let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
      from -= move;
      toA = from + (toA - toB);
      toB = from;
    }
    return { from, toA, toB };
  }
  var DOMReader = class {
    constructor(points, lineSep) {
      this.points = points;
      this.lineSep = lineSep;
      this.text = "";
    }
    readRange(start, end) {
      if (!start)
        return;
      let parent = start.parentNode;
      for (let cur2 = start; ; ) {
        this.findPointBefore(parent, cur2);
        this.readNode(cur2);
        let next = cur2.nextSibling;
        if (next == end)
          break;
        let view2 = ContentView.get(cur2), nextView = ContentView.get(next);
        if ((view2 ? view2.breakAfter : isBlockElement(cur2)) || (nextView ? nextView.breakAfter : isBlockElement(next)) && !(cur2.nodeName == "BR" && !cur2.cmIgnore))
          this.text += this.lineSep;
        cur2 = next;
      }
      this.findPointBefore(parent, end);
    }
    readNode(node) {
      if (node.cmIgnore)
        return;
      let view2 = ContentView.get(node);
      let fromView = view2 && view2.overrideDOMText;
      let text;
      if (fromView != null)
        text = fromView.sliceString(0, void 0, this.lineSep);
      else if (node.nodeType == 3)
        text = node.nodeValue;
      else if (node.nodeName == "BR")
        text = node.nextSibling ? this.lineSep : "";
      else if (node.nodeType == 1)
        this.readRange(node.firstChild, null);
      if (text != null) {
        this.findPointIn(node, text.length);
        this.text += text;
      }
    }
    findPointBefore(node, next) {
      for (let point of this.points)
        if (point.node == node && node.childNodes[point.offset] == next)
          point.pos = this.text.length;
    }
    findPointIn(node, maxLen) {
      for (let point of this.points)
        if (point.node == node)
          point.pos = this.text.length + Math.min(point.offset, maxLen);
    }
  };
  function isBlockElement(node) {
    return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
  }
  var DOMPoint = class {
    constructor(node, offset) {
      this.node = node;
      this.offset = offset;
      this.pos = -1;
    }
  };
  function selectionPoints(dom, root) {
    let result = [];
    if (root.activeElement != dom)
      return result;
    let { anchorNode, anchorOffset, focusNode, focusOffset } = getSelection(root);
    if (anchorNode) {
      result.push(new DOMPoint(anchorNode, anchorOffset));
      if (focusNode != anchorNode || focusOffset != anchorOffset)
        result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
  }
  function selectionFromPoints(points, base2) {
    if (points.length == 0)
      return null;
    let anchor = points[0].pos, head2 = points.length == 2 ? points[1].pos : anchor;
    return anchor > -1 && head2 > -1 ? EditorSelection.single(anchor + base2, head2 + base2) : null;
  }
  function dispatchKey(view2, name2, code) {
    let options = { key: name2, code: name2, keyCode: code, which: code, cancelable: true };
    let down = new KeyboardEvent("keydown", options);
    view2.contentDOM.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    view2.contentDOM.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
  }
  var EditorView = class {
    constructor(config2 = {}) {
      this.plugins = [];
      this.editorAttrs = {};
      this.contentAttrs = {};
      this.bidiCache = [];
      this.updateState = 2;
      this.measureScheduled = -1;
      this.measureRequests = [];
      this.contentDOM = document.createElement("div");
      this.scrollDOM = document.createElement("div");
      this.scrollDOM.className = themeClass("scroller");
      this.scrollDOM.appendChild(this.contentDOM);
      this.dom = document.createElement("div");
      this.dom.appendChild(this.scrollDOM);
      this._dispatch = config2.dispatch || ((tr) => this.update([tr]));
      this.dispatch = this.dispatch.bind(this);
      this.root = config2.root || document;
      this.viewState = new ViewState(config2.state || EditorState.create());
      this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec).update(this));
      this.observer = new DOMObserver(this, (from, to, typeOver) => {
        applyDOMChange(this, from, to, typeOver);
      }, (event) => {
        this.inputState.runScrollHandlers(this, event);
        this.measure();
      });
      this.docView = new DocView(this);
      this.inputState = new InputState(this);
      this.mountStyles();
      this.updateAttrs();
      this.updateState = 0;
      ensureGlobalHandler();
      this.requestMeasure();
      if (config2.parent)
        config2.parent.appendChild(this.dom);
    }
    get state() {
      return this.viewState.state;
    }
    get viewport() {
      return this.viewState.viewport;
    }
    get visibleRanges() {
      return this.viewState.visibleRanges;
    }
    get inView() {
      return this.viewState.inView;
    }
    get composing() {
      return this.inputState.composing;
    }
    dispatch(...input) {
      this._dispatch(input.length == 1 && input[0] instanceof Transaction ? input[0] : this.state.update(...input));
    }
    update(transactions) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
      let redrawn = false, update;
      this.updateState = 2;
      try {
        let state2 = this.state;
        for (let tr of transactions) {
          if (tr.startState != state2)
            throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
          state2 = tr.state;
        }
        update = new ViewUpdate(this, state2, transactions);
        let scrollTo2 = transactions.some((tr) => tr.scrollIntoView) ? state2.selection.main : null;
        this.viewState.update(update, scrollTo2);
        this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
        if (!update.empty)
          this.updatePlugins(update);
        redrawn = this.docView.update(update);
        if (this.state.facet(styleModule) != this.styleModules)
          this.mountStyles();
        this.updateAttrs();
      } finally {
        this.updateState = 0;
      }
      if (redrawn || scrollTo || this.viewState.mustEnforceCursorAssoc)
        this.requestMeasure();
      for (let listener of this.state.facet(updateListener))
        listener(update);
    }
    setState(newState) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
      this.updateState = 2;
      try {
        for (let plugin of this.plugins)
          plugin.destroy(this);
        this.viewState = new ViewState(newState);
        this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec).update(this));
        this.docView = new DocView(this);
        this.inputState.ensureHandlers(this);
        this.mountStyles();
        this.updateAttrs();
        this.bidiCache = [];
      } finally {
        this.updateState = 0;
      }
      this.requestMeasure();
    }
    updatePlugins(update) {
      let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
      if (prevSpecs != specs) {
        let newPlugins = [];
        for (let spec of specs) {
          let found = prevSpecs.indexOf(spec);
          if (found < 0) {
            newPlugins.push(new PluginInstance(spec));
          } else {
            let plugin = this.plugins[found];
            plugin.mustUpdate = update;
            newPlugins.push(plugin);
          }
        }
        for (let plugin of this.plugins)
          if (plugin.mustUpdate != update)
            plugin.destroy(this);
        this.plugins = newPlugins;
        this.inputState.ensureHandlers(this);
      } else {
        for (let p of this.plugins)
          p.mustUpdate = update;
      }
      for (let i = 0; i < this.plugins.length; i++)
        this.plugins[i] = this.plugins[i].update(this);
    }
    measure() {
      if (this.measureScheduled > -1)
        cancelAnimationFrame(this.measureScheduled);
      this.measureScheduled = -1;
      let updated = null;
      try {
        for (let i = 0; ; i++) {
          this.updateState = 1;
          let changed = this.viewState.measure(this.docView, i > 0);
          let measuring = this.measureRequests;
          if (!changed && !measuring.length && this.viewState.scrollTo == null)
            break;
          this.measureRequests = [];
          if (i > 5) {
            console.warn("Viewport failed to stabilize");
            break;
          }
          let measured = measuring.map((m) => {
            try {
              return m.read(this);
            } catch (e) {
              logException(this.state, e);
              return BadMeasure;
            }
          });
          let update = new ViewUpdate(this, this.state);
          update.flags |= changed;
          if (!updated)
            updated = update;
          else
            updated.flags |= changed;
          this.updateState = 2;
          this.updatePlugins(update);
          this.updateAttrs();
          if (changed)
            this.docView.update(update);
          for (let i2 = 0; i2 < measuring.length; i2++)
            if (measured[i2] != BadMeasure) {
              try {
                measuring[i2].write(measured[i2], this);
              } catch (e) {
                logException(this.state, e);
              }
            }
          if (this.viewState.scrollTo) {
            this.docView.scrollPosIntoView(this.viewState.scrollTo.head, this.viewState.scrollTo.assoc);
            this.viewState.scrollTo = null;
          }
          if (!(changed & 4) && this.measureRequests.length == 0)
            break;
        }
      } finally {
        this.updateState = 0;
      }
      this.measureScheduled = -1;
      if (updated)
        for (let listener of this.state.facet(updateListener))
          listener(updated);
    }
    get themeClasses() {
      return baseThemeID + " " + (this.state.facet(darkTheme) ? "cm-dark" : "cm-light") + " " + this.state.facet(theme);
    }
    updateAttrs() {
      let editorAttrs = combineAttrs(this.state.facet(editorAttributes), {
        class: themeClass("wrap") + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
      });
      updateAttrs(this.dom, this.editorAttrs, editorAttrs);
      this.editorAttrs = editorAttrs;
      let contentAttrs = combineAttrs(this.state.facet(contentAttributes), {
        spellcheck: "false",
        contenteditable: String(this.state.facet(editable)),
        class: themeClass("content"),
        style: `${browser.tabSize}: ${this.state.tabSize}`,
        role: "textbox",
        "aria-multiline": "true"
      });
      updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
      this.contentAttrs = contentAttrs;
    }
    mountStyles() {
      this.styleModules = this.state.facet(styleModule);
      StyleModule.mount(this.root, this.styleModules.concat(baseTheme).reverse());
    }
    readMeasured() {
      if (this.updateState == 2)
        throw new Error("Reading the editor layout isn't allowed during an update");
      if (this.updateState == 0 && this.measureScheduled > -1)
        this.measure();
    }
    requestMeasure(request) {
      if (this.measureScheduled < 0)
        this.measureScheduled = requestAnimationFrame(() => this.measure());
      if (request) {
        if (request.key != null)
          for (let i = 0; i < this.measureRequests.length; i++) {
            if (this.measureRequests[i].key === request.key) {
              this.measureRequests[i] = request;
              return;
            }
          }
        this.measureRequests.push(request);
      }
    }
    pluginField(field) {
      let result = [];
      for (let plugin of this.plugins)
        plugin.update(this).takeField(field, result);
      return result;
    }
    plugin(plugin) {
      for (let inst of this.plugins)
        if (inst.spec == plugin)
          return inst.update(this).value;
      return null;
    }
    blockAtHeight(height, editorTop) {
      this.readMeasured();
      return this.viewState.blockAtHeight(height, ensureTop(editorTop, this.contentDOM));
    }
    visualLineAtHeight(height, editorTop) {
      this.readMeasured();
      return this.viewState.lineAtHeight(height, ensureTop(editorTop, this.contentDOM));
    }
    viewportLines(f, editorTop) {
      let { from, to } = this.viewport;
      this.viewState.forEachLine(from, to, f, ensureTop(editorTop, this.contentDOM));
    }
    visualLineAt(pos, editorTop = 0) {
      return this.viewState.lineAt(pos, editorTop);
    }
    get contentHeight() {
      return this.viewState.heightMap.height + this.viewState.paddingTop + this.viewState.paddingBottom;
    }
    moveByChar(start, forward, by) {
      return moveByChar(this, start, forward, by);
    }
    moveByGroup(start, forward) {
      return moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial));
    }
    moveToLineBoundary(start, forward, includeWrap = true) {
      return moveToLineBoundary(this, start, forward, includeWrap);
    }
    moveVertically(start, forward, distance) {
      return moveVertically(this, start, forward, distance);
    }
    scrollPosIntoView(pos) {
      this.viewState.scrollTo = EditorSelection.cursor(pos);
      this.requestMeasure();
    }
    domAtPos(pos) {
      return this.docView.domAtPos(pos);
    }
    posAtDOM(node, offset = 0) {
      return this.docView.posFromDOM(node, offset);
    }
    posAtCoords(coords) {
      this.readMeasured();
      return posAtCoords(this, coords);
    }
    coordsAtPos(pos, side = 1) {
      this.readMeasured();
      let rect = this.docView.coordsAt(pos, side);
      if (!rect || rect.left == rect.right)
        return rect;
      let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
      let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
      return flattenRect(rect, span.dir == Direction.LTR == side > 0);
    }
    get defaultCharacterWidth() {
      return this.viewState.heightOracle.charWidth;
    }
    get defaultLineHeight() {
      return this.viewState.heightOracle.lineHeight;
    }
    get textDirection() {
      return this.viewState.heightOracle.direction;
    }
    get lineWrapping() {
      return this.viewState.heightOracle.lineWrapping;
    }
    bidiSpans(line) {
      if (line.length > MaxBidiLine)
        return trivialOrder(line.length);
      let dir = this.textDirection;
      for (let entry of this.bidiCache)
        if (entry.from == line.from && entry.dir == dir)
          return entry.order;
      let order = computeOrder(line.text, this.textDirection);
      this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
      return order;
    }
    get hasFocus() {
      return document.hasFocus() && this.root.activeElement == this.contentDOM;
    }
    focus() {
      this.observer.ignore(() => {
        focusPreventScroll(this.contentDOM);
        this.docView.updateSelection();
      });
    }
    destroy() {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.inputState.destroy();
      this.dom.remove();
      this.observer.destroy();
      if (this.measureScheduled > -1)
        cancelAnimationFrame(this.measureScheduled);
    }
    static domEventHandlers(handlers2) {
      return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
    }
    static theme(spec, options) {
      let prefix = StyleModule.newName();
      let result = [theme.of(prefix), styleModule.of(buildTheme(`.${baseThemeID}.${prefix}`, spec))];
      if (options && options.dark)
        result.push(darkTheme.of(true));
      return result;
    }
    static baseTheme(spec) {
      return Prec.fallback(styleModule.of(buildTheme("." + baseThemeID, spec)));
    }
  };
  EditorView.styleModule = styleModule;
  EditorView.inputHandler = inputHandler;
  EditorView.exceptionSink = exceptionSink;
  EditorView.updateListener = updateListener;
  EditorView.editable = editable;
  EditorView.mouseSelectionStyle = mouseSelectionStyle;
  EditorView.dragMovesSelection = dragMovesSelection;
  EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
  EditorView.decorations = decorations;
  EditorView.lineWrapping = EditorView.theme({ $content: { whiteSpace: "pre-wrap" } });
  EditorView.contentAttributes = contentAttributes;
  EditorView.editorAttributes = editorAttributes;
  var MaxBidiLine = 4096;
  function ensureTop(given, dom) {
    return given == null ? dom.getBoundingClientRect().top : given;
  }
  var resizeDebounce = -1;
  function ensureGlobalHandler() {
    window.addEventListener("resize", () => {
      if (resizeDebounce == -1)
        resizeDebounce = setTimeout(handleResize, 50);
    });
  }
  function handleResize() {
    resizeDebounce = -1;
    let found = document.querySelectorAll(".cm-content");
    for (let i = 0; i < found.length; i++) {
      let docView = ContentView.get(found[i]);
      if (docView)
        docView.editorView.requestMeasure();
    }
  }
  var BadMeasure = {};
  var CachedOrder = class {
    constructor(from, to, dir, order) {
      this.from = from;
      this.to = to;
      this.dir = dir;
      this.order = order;
    }
    static update(cache, changes) {
      if (changes.empty)
        return cache;
      let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
      for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
        let entry = cache[i];
        if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
          result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
      }
      return result;
    }
  };
  var currentPlatform = typeof navigator == "undefined" ? "key" : /Mac/.test(navigator.platform) ? "mac" : /Win/.test(navigator.platform) ? "win" : /Linux|X11/.test(navigator.platform) ? "linux" : "key";
  function normalizeKeyName(name2, platform) {
    const parts = name2.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result == "Space")
      result = " ";
    let alt, ctrl, shift2, meta2;
    for (let i = 0; i < parts.length - 1; ++i) {
      const mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod))
        meta2 = true;
      else if (/^a(lt)?$/i.test(mod))
        alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod))
        ctrl = true;
      else if (/^s(hift)?$/i.test(mod))
        shift2 = true;
      else if (/^mod$/i.test(mod)) {
        if (platform == "mac")
          meta2 = true;
        else
          ctrl = true;
      } else
        throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
      result = "Alt-" + result;
    if (ctrl)
      result = "Ctrl-" + result;
    if (meta2)
      result = "Meta-" + result;
    if (shift2)
      result = "Shift-" + result;
    return result;
  }
  function modifiers(name2, event, shift2) {
    if (event.altKey)
      name2 = "Alt-" + name2;
    if (event.ctrlKey)
      name2 = "Ctrl-" + name2;
    if (event.metaKey)
      name2 = "Meta-" + name2;
    if (shift2 !== false && event.shiftKey)
      name2 = "Shift-" + name2;
    return name2;
  }
  var handleKeyEvents = EditorView.domEventHandlers({
    keydown(event, view2) {
      return runHandlers(getKeymap(view2.state), event, view2, "editor");
    }
  });
  var keymap = Facet.define({ enables: handleKeyEvents });
  var Keymaps = new WeakMap();
  function getKeymap(state2) {
    let bindings = state2.facet(keymap);
    let map2 = Keymaps.get(bindings);
    if (!map2)
      Keymaps.set(bindings, map2 = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
    return map2;
  }
  function runScopeHandlers(view2, event, scope) {
    return runHandlers(getKeymap(view2.state), event, view2, scope);
  }
  var storedPrefix = null;
  var PrefixTimeout = 4e3;
  function buildKeymap(bindings, platform = currentPlatform) {
    let bound = Object.create(null);
    let isPrefix = Object.create(null);
    let checkPrefix = (name2, is) => {
      let current = isPrefix[name2];
      if (current == null)
        isPrefix[name2] = is;
      else if (current != is)
        throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add2 = (scope, key2, command2, preventDefault) => {
      let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
      let parts = key2.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
      for (let i = 1; i < parts.length; i++) {
        let prefix = parts.slice(0, i).join(" ");
        checkPrefix(prefix, true);
        if (!scopeObj[prefix])
          scopeObj[prefix] = {
            preventDefault: true,
            commands: [(view2) => {
              let ourObj = storedPrefix = { view: view2, prefix, scope };
              setTimeout(() => {
                if (storedPrefix == ourObj)
                  storedPrefix = null;
              }, PrefixTimeout);
              return true;
            }]
          };
      }
      let full = parts.join(" ");
      checkPrefix(full, false);
      let binding = scopeObj[full] || (scopeObj[full] = { preventDefault: false, commands: [] });
      binding.commands.push(command2);
      if (preventDefault)
        binding.preventDefault = true;
    };
    for (let b of bindings) {
      let name2 = b[platform] || b.key;
      if (!name2)
        continue;
      for (let scope of b.scope ? b.scope.split(" ") : ["editor"]) {
        add2(scope, name2, b.run, b.preventDefault);
        if (b.shift)
          add2(scope, "Shift-" + name2, b.shift, b.preventDefault);
      }
    }
    return bound;
  }
  function runHandlers(map2, event, view2, scope) {
    let name2 = keyName(event), isChar = name2.length == 1 && name2 != " ";
    let prefix = "", fallthrough = false;
    if (storedPrefix && storedPrefix.view == view2 && storedPrefix.scope == scope) {
      prefix = storedPrefix.prefix + " ";
      if (fallthrough = modifierCodes.indexOf(event.keyCode) < 0)
        storedPrefix = null;
    }
    let runFor = (binding) => {
      if (binding) {
        for (let cmd2 of binding.commands)
          if (cmd2(view2))
            return true;
        if (binding.preventDefault)
          fallthrough = true;
      }
      return false;
    };
    let scopeObj = map2[scope], baseName;
    if (scopeObj) {
      if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)]))
        return true;
      if (isChar && (event.shiftKey || event.altKey || event.metaKey) && (baseName = base[event.keyCode]) && baseName != name2) {
        if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
          return true;
      } else if (isChar && event.shiftKey) {
        if (runFor(scopeObj[prefix + modifiers(name2, event, true)]))
          return true;
      }
    }
    return fallthrough;
  }
  var CanHidePrimary = !browser.ios;
  var selectionConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        cursorBlinkRate: 1200,
        drawRangeCursor: true
      }, {
        cursorBlinkRate: (a, b) => Math.min(a, b),
        drawRangeCursor: (a, b) => a || b
      });
    }
  });
  function drawSelection(config2 = {}) {
    return [
      selectionConfig.of(config2),
      drawSelectionPlugin,
      hideNativeSelection
    ];
  }
  var Piece = class {
    constructor(left, top2, width, height, className) {
      this.left = left;
      this.top = top2;
      this.width = width;
      this.height = height;
      this.className = className;
    }
    draw() {
      let elt = document.createElement("div");
      elt.className = this.className;
      elt.style.left = this.left + "px";
      elt.style.top = this.top + "px";
      if (this.width >= 0)
        elt.style.width = this.width + "px";
      elt.style.height = this.height + "px";
      return elt;
    }
    eq(p) {
      return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height && this.className == p.className;
    }
  };
  var drawSelectionPlugin = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.rangePieces = [];
      this.cursors = [];
      this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) };
      this.selectionLayer = view2.scrollDOM.appendChild(document.createElement("div"));
      this.selectionLayer.className = themeClass("selectionLayer");
      this.selectionLayer.setAttribute("aria-hidden", "true");
      this.cursorLayer = view2.scrollDOM.appendChild(document.createElement("div"));
      this.cursorLayer.className = themeClass("cursorLayer");
      this.cursorLayer.setAttribute("aria-hidden", "true");
      view2.requestMeasure(this.measureReq);
      this.setBlinkRate();
    }
    setBlinkRate() {
      this.cursorLayer.style.animationDuration = this.view.state.facet(selectionConfig).cursorBlinkRate + "ms";
    }
    update(update) {
      let confChanged = update.startState.facet(selectionConfig) != update.state.facet(selectionConfig);
      if (confChanged || update.selectionSet || update.geometryChanged || update.viewportChanged)
        this.view.requestMeasure(this.measureReq);
      if (update.transactions.some((tr) => tr.scrollIntoView))
        this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
      if (confChanged)
        this.setBlinkRate();
    }
    readPos() {
      let { state: state2 } = this.view, conf = state2.facet(selectionConfig);
      let rangePieces = state2.selection.ranges.map((r) => r.empty ? [] : measureRange(this.view, r)).reduce((a, b) => a.concat(b));
      let cursors = [];
      for (let r of state2.selection.ranges) {
        let prim = r == state2.selection.main;
        if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
          let piece = measureCursor(this.view, r, prim);
          if (piece)
            cursors.push(piece);
        }
      }
      return { rangePieces, cursors };
    }
    drawSel({ rangePieces, cursors }) {
      if (rangePieces.length != this.rangePieces.length || rangePieces.some((p, i) => !p.eq(this.rangePieces[i]))) {
        this.selectionLayer.textContent = "";
        for (let p of rangePieces)
          this.selectionLayer.appendChild(p.draw());
        this.rangePieces = rangePieces;
      }
      if (cursors.length != this.cursors.length || cursors.some((c, i) => !c.eq(this.cursors[i]))) {
        this.cursorLayer.textContent = "";
        for (let c of cursors)
          this.cursorLayer.appendChild(c.draw());
        this.cursors = cursors;
      }
    }
    destroy() {
      this.selectionLayer.remove();
      this.cursorLayer.remove();
    }
  });
  var themeSpec = {
    $line: {
      "& ::selection": { backgroundColor: "transparent !important" },
      "&::selection": { backgroundColor: "transparent !important" }
    }
  };
  if (CanHidePrimary)
    themeSpec.$line.caretColor = "transparent !important";
  var hideNativeSelection = Prec.override(EditorView.theme(themeSpec));
  var selectionClass = themeClass("selectionBackground");
  function getBase(view2) {
    let rect = view2.scrollDOM.getBoundingClientRect();
    return { left: rect.left - view2.scrollDOM.scrollLeft, top: rect.top - view2.scrollDOM.scrollTop };
  }
  function wrappedLine(view2, pos, inside2) {
    let range = EditorSelection.cursor(pos);
    return {
      from: Math.max(inside2.from, view2.moveToLineBoundary(range, false, true).from),
      to: Math.min(inside2.to, view2.moveToLineBoundary(range, true, true).from)
    };
  }
  function measureRange(view2, range) {
    if (range.to <= view2.viewport.from || range.from >= view2.viewport.to)
      return [];
    let from = Math.max(range.from, view2.viewport.from), to = Math.min(range.to, view2.viewport.to);
    let ltr = view2.textDirection == Direction.LTR;
    let content2 = view2.contentDOM, contentRect = content2.getBoundingClientRect(), base2 = getBase(view2);
    let lineStyle = window.getComputedStyle(content2.firstChild);
    let leftSide = contentRect.left + parseInt(lineStyle.paddingLeft);
    let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
    let visualStart = view2.visualLineAt(from);
    let visualEnd = view2.visualLineAt(to);
    if (view2.lineWrapping) {
      visualStart = wrappedLine(view2, from, visualStart);
      visualEnd = wrappedLine(view2, to, visualEnd);
    }
    if (visualStart.from == visualEnd.from) {
      return pieces(drawForLine(range.from, range.to));
    } else {
      let top2 = drawForLine(range.from, null);
      let bottom = drawForLine(null, range.to);
      let between = [];
      if (visualStart.to < visualEnd.from - 1)
        between.push(piece(leftSide, top2.bottom, rightSide, bottom.top));
      else if (top2.bottom < bottom.top && bottom.top - top2.bottom < 4)
        top2.bottom = bottom.top = (top2.bottom + bottom.top) / 2;
      return pieces(top2).concat(between).concat(pieces(bottom));
    }
    function piece(left, top2, right, bottom) {
      return new Piece(left - base2.left, top2 - base2.top, right - left, bottom - top2, selectionClass);
    }
    function pieces({ top: top2, bottom, horizontal }) {
      let pieces2 = [];
      for (let i = 0; i < horizontal.length; i += 2)
        pieces2.push(piece(horizontal[i], top2, horizontal[i + 1], bottom));
      return pieces2;
    }
    function drawForLine(from2, to2) {
      let top2 = 1e9, bottom = -1e9, horizontal = [];
      function addSpan(from3, fromOpen, to3, toOpen, dir) {
        let fromCoords = view2.coordsAtPos(from3, 1), toCoords = view2.coordsAtPos(to3, -1);
        top2 = Math.min(fromCoords.top, toCoords.top, top2);
        bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
        if (dir == Direction.LTR)
          horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
        else
          horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
      }
      let start = from2 !== null && from2 !== void 0 ? from2 : view2.moveToLineBoundary(EditorSelection.cursor(to2, 1), false).head;
      let end = to2 !== null && to2 !== void 0 ? to2 : view2.moveToLineBoundary(EditorSelection.cursor(from2, -1), true).head;
      for (let r of view2.visibleRanges)
        if (r.to > start && r.from < end) {
          for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end); ; ) {
            let docLine = view2.state.doc.lineAt(pos);
            for (let span of view2.bidiSpans(docLine)) {
              let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
              if (spanFrom >= endPos)
                break;
              if (spanTo > pos)
                addSpan(Math.max(spanFrom, pos), from2 == null && spanFrom <= start, Math.min(spanTo, endPos), to2 == null && spanTo >= end, span.dir);
            }
            pos = docLine.to + 1;
            if (pos >= endPos)
              break;
          }
        }
      if (horizontal.length == 0) {
        let coords = view2.coordsAtPos(start, -1);
        top2 = Math.min(coords.top, top2);
        bottom = Math.max(coords.bottom, bottom);
      }
      return { top: top2, bottom, horizontal };
    }
  }
  var primaryCursorClass = themeClass("cursor.primary");
  var cursorClass = themeClass("cursor.secondary");
  function measureCursor(view2, cursor, primary) {
    let pos = view2.coordsAtPos(cursor.head, cursor.assoc || 1);
    if (!pos)
      return null;
    let base2 = getBase(view2);
    return new Piece(pos.left - base2.left, pos.top - base2.top, -1, pos.bottom - pos.top, primary ? primaryCursorClass : cursorClass);
  }
  var Specials = /[\u0000-\u0008\u000a-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200c\u200e\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/gu;
  var Names = {
    0: "null",
    7: "bell",
    8: "backspace",
    10: "newline",
    11: "vertical tab",
    13: "carriage return",
    27: "escape",
    8203: "zero width space",
    8204: "zero width non-joiner",
    8205: "zero width joiner",
    8206: "left-to-right mark",
    8207: "right-to-left mark",
    8232: "line separator",
    8233: "paragraph separator",
    65279: "zero width no-break space",
    65532: "object replacement"
  };
  var _supportsTabSize = null;
  function supportsTabSize() {
    if (_supportsTabSize == null && typeof document != "undefined" && document.body) {
      let styles = document.body.style;
      _supportsTabSize = (styles.tabSize || styles.MozTabSize) != null;
    }
    return _supportsTabSize || false;
  }
  var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
  var specialCharConfig = Facet.define({
    combine(configs) {
      let config2 = combineConfig(configs, {
        render: null,
        specialChars: Specials,
        addSpecialChars: null
      });
      if (config2.replaceTabs = !supportsTabSize())
        config2.specialChars = new RegExp("	|" + config2.specialChars.source, UnicodeRegexpSupport);
      if (config2.addSpecialChars)
        config2.specialChars = new RegExp(config2.specialChars.source + "|" + config2.addSpecialChars.source, UnicodeRegexpSupport);
      return config2;
    }
  });
  function highlightSpecialChars(config2 = {}) {
    let ext = [specialCharConfig.of(config2), specialCharPlugin];
    if (!supportsTabSize())
      ext.push(tabStyle);
    return ext;
  }
  var specialCharPlugin = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.decorations = Decoration.none;
      this.decorationCache = Object.create(null);
      this.recompute();
    }
    update(update) {
      let confChange = update.startState.facet(specialCharConfig) != update.state.facet(specialCharConfig);
      if (confChange)
        this.decorationCache = Object.create(null);
      if (confChange || update.changes.length || update.viewportChanged)
        this.recompute();
    }
    recompute() {
      let decorations2 = [];
      for (let { from, to } of this.view.visibleRanges)
        this.getDecorationsFor(from, to, decorations2);
      this.decorations = Decoration.set(decorations2);
    }
    getDecorationsFor(from, to, target2) {
      let config2 = this.view.state.facet(specialCharConfig);
      let { doc: doc2 } = this.view.state;
      for (let pos = from, cursor = doc2.iterRange(from, to), m; !cursor.next().done; ) {
        if (!cursor.lineBreak) {
          while (m = config2.specialChars.exec(cursor.value)) {
            let code = codePointAt(m[0], 0), deco;
            if (code == null)
              continue;
            if (code == 9) {
              let line = doc2.lineAt(pos + m.index);
              let size = this.view.state.tabSize, col = countColumn(doc2.sliceString(line.from, pos + m.index), 0, size);
              deco = Decoration.replace({ widget: new TabWidget((size - col % size) * this.view.defaultCharacterWidth) });
            } else {
              deco = this.decorationCache[code] || (this.decorationCache[code] = Decoration.replace({ widget: new SpecialCharWidget(config2, code) }));
            }
            target2.push(deco.range(pos + m.index, pos + m.index + m[0].length));
          }
        }
        pos += cursor.value.length;
      }
    }
  }, {
    decorations: (v) => v.decorations
  });
  var DefaultPlaceholder = "\u2022";
  function placeholder(code) {
    if (code >= 32)
      return DefaultPlaceholder;
    if (code == 10)
      return "\u2424";
    return String.fromCharCode(9216 + code);
  }
  var SpecialCharWidget = class extends WidgetType {
    constructor(options, code) {
      super();
      this.options = options;
      this.code = code;
    }
    eq(other) {
      return other.code == this.code;
    }
    toDOM(view2) {
      let ph = placeholder(this.code);
      let desc = view2.state.phrase("Control character ") + (Names[this.code] || "0x" + this.code.toString(16));
      let custom = this.options.render && this.options.render(this.code, desc, ph);
      if (custom)
        return custom;
      let span = document.createElement("span");
      span.textContent = ph;
      span.title = desc;
      span.setAttribute("aria-label", desc);
      span.style.color = "red";
      return span;
    }
    ignoreEvent() {
      return false;
    }
  };
  var TabWidget = class extends WidgetType {
    constructor(width) {
      super();
      this.width = width;
    }
    eq(other) {
      return other.width == this.width;
    }
    toDOM() {
      let span = document.createElement("span");
      span.textContent = "	";
      span.className = tab;
      span.style.width = this.width + "px";
      return span;
    }
    ignoreEvent() {
      return false;
    }
  };
  var tab = StyleModule.newName();
  var tabStyle = EditorView.styleModule.of(new StyleModule({
    ["." + tab]: {
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "bottom"
    }
  }));
  function highlightActiveLine() {
    return activeLineHighlighter;
  }
  var lineDeco = Decoration.line({ attributes: { class: themeClass("activeLine") } });
  var activeLineHighlighter = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.decorations = this.getDeco(view2);
    }
    update(update) {
      if (update.docChanged || update.selectionSet)
        this.decorations = this.getDeco(update.view);
    }
    getDeco(view2) {
      let lastLineStart = -1, deco = [];
      for (let r of view2.state.selection.ranges) {
        if (!r.empty)
          continue;
        let line = view2.visualLineAt(r.head);
        if (line.from > lastLineStart) {
          deco.push(lineDeco.range(line.from));
          lastLineStart = line.from;
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });

  // ../../node_modules/@codemirror/next/tooltip/dist/index.js
  var Outside = "-10000px";
  var tooltipPlugin = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.inView = true;
      this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
      this.tooltips = view2.state.facet(showTooltip);
      this.tooltipViews = this.tooltips.map((tp) => this.createTooltip(tp));
    }
    update(update) {
      let tooltips2 = update.state.facet(showTooltip);
      if (tooltips2 == this.tooltips) {
        for (let t2 of this.tooltipViews)
          if (t2.update)
            t2.update(update);
      } else {
        let views = [];
        for (let i = 0; i < tooltips2.length; i++) {
          let tip = tooltips2[i], known = -1;
          for (let i2 = 0; i2 < this.tooltips.length; i2++)
            if (this.tooltips[i2].create == tip.create)
              known = i2;
          if (known < 0) {
            views[i] = this.createTooltip(tip);
          } else {
            let tooltipView = views[i] = this.tooltipViews[known];
            if (tooltipView.update)
              tooltipView.update(update);
          }
        }
        for (let t2 of this.tooltipViews)
          if (views.indexOf(t2) < 0)
            t2.dom.remove();
        this.tooltips = tooltips2;
        this.tooltipViews = views;
        this.maybeMeasure();
      }
    }
    createTooltip(tooltip) {
      let tooltipView = tooltip.create(this.view);
      tooltipView.dom.className = themeClass("tooltip" + (tooltip.style ? "." + tooltip.style : ""));
      this.view.dom.appendChild(tooltipView.dom);
      if (tooltipView.mount)
        tooltipView.mount(this.view);
      return tooltipView;
    }
    destroy() {
      for (let { dom } of this.tooltipViews)
        dom.remove();
    }
    readMeasure() {
      return {
        editor: this.view.dom.getBoundingClientRect(),
        pos: this.tooltips.map((t2) => this.view.coordsAtPos(t2.pos)),
        size: this.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      };
    }
    writeMeasure(measured) {
      let { editor } = measured;
      for (let i = 0; i < this.tooltipViews.length; i++) {
        let tooltip = this.tooltips[i], tView = this.tooltipViews[i], { dom } = tView;
        let pos = measured.pos[i], size = measured.size[i];
        if (!pos || pos.bottom <= editor.top || pos.top >= editor.bottom || pos.right <= editor.left || pos.left >= editor.right) {
          dom.style.top = Outside;
          continue;
        }
        let width = size.right - size.left, height = size.bottom - size.top;
        let left = this.view.textDirection == Direction.LTR ? Math.min(pos.left, measured.innerWidth - width) : Math.max(0, pos.left - width);
        let above = !!tooltip.above;
        if (!tooltip.strictSide && (above ? pos.top - (size.bottom - size.top) < 0 : pos.bottom + (size.bottom - size.top) > measured.innerHeight))
          above = !above;
        dom.style.top = (above ? pos.top - height : pos.bottom) + "px";
        dom.style.left = left + "px";
        dom.classList.toggle("cm-tooltip-above", above);
        dom.classList.toggle("cm-tooltip-below", !above);
        if (tView.positioned)
          tView.positioned();
      }
    }
    maybeMeasure() {
      if (this.tooltips.length) {
        if (this.view.inView || this.inView)
          this.view.requestMeasure(this.measureReq);
        this.inView = this.view.inView;
      }
    }
  }, {
    eventHandlers: {
      scroll() {
        this.maybeMeasure();
      }
    }
  });
  var baseTheme2 = EditorView.baseTheme({
    $tooltip: {
      position: "fixed",
      border: "1px solid #ddd",
      backgroundColor: "#f5f5f5",
      zIndex: 100
    }
  });
  function tooltips() {
    return [tooltipPlugin, baseTheme2];
  }
  var showTooltip = Facet.define();
  var HoverTime = 750;
  var HoverMaxDist = 10;
  var HoverPlugin = class {
    constructor(view2, source2, field, setHover) {
      this.view = view2;
      this.source = source2;
      this.field = field;
      this.setHover = setHover;
      this.lastMouseMove = null;
      this.hoverTimeout = -1;
      this.checkHover = this.checkHover.bind(this);
      view2.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
      view2.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
    }
    get active() {
      return this.view.state.field(this.field);
    }
    checkHover() {
      this.hoverTimeout = -1;
      if (this.active)
        return;
      let now = Date.now(), lastMove = this.lastMouseMove;
      if (now - lastMove.timeStamp < HoverTime) {
        this.hoverTimeout = setTimeout(this.checkHover, HoverTime - (now - lastMove.timeStamp));
        return;
      }
      let coords = { x: lastMove.clientX, y: lastMove.clientY };
      let pos = this.view.contentDOM.contains(lastMove.target) ? this.view.posAtCoords(coords) : null;
      if (pos == null)
        return;
      let posCoords = this.view.coordsAtPos(pos);
      if (posCoords == null || coords.y < posCoords.top || coords.y > posCoords.bottom || coords.x < posCoords.left - this.view.defaultCharacterWidth || coords.x > posCoords.right + this.view.defaultCharacterWidth)
        return;
      let bidi = this.view.bidiSpans(this.view.state.doc.lineAt(pos)).find((s) => s.from <= pos && s.to >= pos);
      let rtl = bidi && bidi.dir == Direction.RTL ? -1 : 1;
      let open = this.source(this.view, pos, coords.x < posCoords.left ? -rtl : rtl);
      if (open)
        this.view.dispatch({ effects: this.setHover.of(open) });
    }
    mousemove(event) {
      var _a;
      this.lastMouseMove = event;
      if (this.hoverTimeout < 0)
        this.hoverTimeout = setTimeout(this.checkHover, HoverTime);
      let tooltip = this.active;
      if (tooltip && !isInTooltip(event.target)) {
        let { pos } = tooltip, end = (_a = tooltip.end) !== null && _a !== void 0 ? _a : pos;
        if (pos == end ? this.view.posAtCoords({ x: event.clientX, y: event.clientY }) != pos : !isOverRange(this.view, pos, end, event.clientX, event.clientY, HoverMaxDist))
          this.view.dispatch({ effects: this.setHover.of(null) });
      }
    }
    mouseleave() {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = -1;
      if (this.active)
        this.view.dispatch({ effects: this.setHover.of(null) });
    }
    destroy() {
      clearTimeout(this.hoverTimeout);
      this.view.dom.removeEventListener("mouseleave", this.mouseleave);
      this.view.dom.removeEventListener("mousemove", this.mousemove);
    }
  };
  function isInTooltip(elt) {
    for (let cur2 = elt; cur2; cur2 = cur2.parentNode)
      if (cur2.nodeType == 1 && cur2.classList.contains("cm-tooltip"))
        return true;
    return false;
  }
  function isOverRange(view2, from, to, x, y, margin) {
    let range = document.createRange();
    let fromDOM = view2.domAtPos(from), toDOM = view2.domAtPos(to);
    range.setEnd(toDOM.node, toDOM.offset);
    range.setStart(fromDOM.node, fromDOM.offset);
    let rects = range.getClientRects();
    range.detach();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      let dist = Math.max(rect.top - y, y - rect.bottom, rect.left - x, x - rect.right);
      if (dist <= margin)
        return true;
    }
    return false;
  }
  function hoverTooltip(source2, options = {}) {
    const setHover = StateEffect.define();
    const hoverState = StateField.define({
      create() {
        return null;
      },
      update(value2, tr) {
        if (value2 && (options.hideOnChange && (tr.docChanged || tr.selection)))
          return null;
        for (let effect of tr.effects)
          if (effect.is(setHover))
            return effect.value;
        if (value2 && tr.docChanged) {
          let newPos = tr.changes.mapPos(value2.pos, -1, MapMode.TrackDel);
          if (newPos == null)
            return null;
          let copy = Object.assign(Object.create(null), value2);
          copy.pos = newPos;
          if (value2.end != null)
            copy.end = tr.changes.mapPos(value2.end);
          return copy;
        }
        return value2;
      },
      provide: (f) => showTooltip.computeN([f], (s) => {
        let val = s.field(f);
        return val ? [val] : [];
      })
    });
    return [
      hoverState,
      ViewPlugin.define((view2) => new HoverPlugin(view2, source2, hoverState, setHover)),
      tooltips()
    ];
  }

  // ../../node_modules/@codemirror/next/panel/dist/index.js
  var panelConfig = Facet.define({
    combine(configs) {
      let topContainer, bottomContainer;
      for (let c of configs) {
        topContainer = topContainer || c.topContainer;
        bottomContainer = bottomContainer || c.bottomContainer;
      }
      return { topContainer, bottomContainer };
    }
  });
  function panels(config2) {
    let ext = [panelPlugin, baseTheme3];
    if (config2)
      ext.push(panelConfig.of(config2));
    return ext;
  }
  var showPanel = Facet.define();
  function getPanel(view2, panel) {
    let plugin = view2.plugin(panelPlugin);
    let index = view2.state.facet(showPanel).indexOf(panel);
    return plugin && index > -1 ? plugin.panels[index] : null;
  }
  var panelPlugin = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.specs = view2.state.facet(showPanel);
      this.panels = this.specs.map((spec) => spec(view2));
      let conf = view2.state.facet(panelConfig);
      this.top = new PanelGroup(view2, true, conf.topContainer);
      this.bottom = new PanelGroup(view2, false, conf.bottomContainer);
      this.top.sync(this.panels.filter((p) => p.top));
      this.bottom.sync(this.panels.filter((p) => !p.top));
      for (let p of this.panels) {
        p.dom.className += " " + panelClass(p);
        if (p.mount)
          p.mount();
      }
    }
    update(update) {
      let conf = update.state.facet(panelConfig);
      if (this.top.container != conf.topContainer) {
        this.top.sync([]);
        this.top = new PanelGroup(update.view, true, conf.topContainer);
      }
      if (this.bottom.container != conf.bottomContainer) {
        this.bottom.sync([]);
        this.bottom = new PanelGroup(update.view, false, conf.bottomContainer);
      }
      this.top.syncClasses();
      this.bottom.syncClasses();
      let specs = update.state.facet(showPanel);
      if (specs != this.specs) {
        let panels2 = [], top2 = [], bottom = [], mount = [];
        for (let spec of specs) {
          let known = this.specs.indexOf(spec), panel;
          if (known < 0) {
            panel = spec(update.view);
            mount.push(panel);
          } else {
            panel = this.panels[known];
            if (panel.update)
              panel.update(update);
          }
          panels2.push(panel);
          (panel.top ? top2 : bottom).push(panel);
        }
        this.specs = specs;
        this.panels = panels2;
        this.top.sync(top2);
        this.bottom.sync(bottom);
        for (let p of mount) {
          p.dom.className += " " + panelClass(p);
          if (p.mount)
            p.mount();
        }
      } else {
        for (let p of this.panels)
          if (p.update)
            p.update(update);
      }
    }
    destroy() {
      this.top.sync([]);
      this.bottom.sync([]);
    }
  }, {
    provide: PluginField.scrollMargins.from((value2) => ({ top: value2.top.scrollMargin(), bottom: value2.bottom.scrollMargin() }))
  });
  function panelClass(panel) {
    return themeClass(panel.style ? `panel.${panel.style}` : "panel");
  }
  var PanelGroup = class {
    constructor(view2, top2, container) {
      this.view = view2;
      this.top = top2;
      this.container = container;
      this.dom = void 0;
      this.classes = "";
      this.panels = [];
      this.syncClasses();
    }
    sync(panels2) {
      this.panels = panels2;
      this.syncDOM();
    }
    syncDOM() {
      if (this.panels.length == 0) {
        if (this.dom) {
          this.dom.remove();
          this.dom = void 0;
        }
        return;
      }
      if (!this.dom) {
        this.dom = document.createElement("div");
        this.dom.className = themeClass(this.top ? "panels.top" : "panels.bottom");
        this.dom.style[this.top ? "top" : "bottom"] = "0";
        let parent = this.container || this.view.dom;
        parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
      }
      let curDOM = this.dom.firstChild;
      for (let panel of this.panels) {
        if (panel.dom.parentNode == this.dom) {
          while (curDOM != panel.dom)
            curDOM = rm2(curDOM);
          curDOM = curDOM.nextSibling;
        } else {
          this.dom.insertBefore(panel.dom, curDOM);
        }
      }
      while (curDOM)
        curDOM = rm2(curDOM);
    }
    scrollMargin() {
      return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - this.view.scrollDOM.getBoundingClientRect().top : this.view.scrollDOM.getBoundingClientRect().bottom - this.dom.getBoundingClientRect().top);
    }
    syncClasses() {
      if (!this.container || this.classes == this.view.themeClasses)
        return;
      for (let cls of this.classes.split(" "))
        if (cls)
          this.container.classList.remove(cls);
      for (let cls of (this.classes = this.view.themeClasses).split(" "))
        if (cls)
          this.container.classList.add(cls);
    }
  };
  function rm2(node) {
    let next = node.nextSibling;
    node.remove();
    return next;
  }
  var baseTheme3 = EditorView.baseTheme({
    $panels: {
      boxSizing: "border-box",
      position: "sticky",
      left: 0,
      right: 0
    },
    "$$light $panels": {
      backgroundColor: "#f5f5f5",
      color: "black"
    },
    "$$light $panels.top": {
      borderBottom: "1px solid #ddd"
    },
    "$$light $panels.bottom": {
      borderTop: "1px solid #ddd"
    },
    "$$dark $panels": {
      backgroundColor: "#333338",
      color: "white"
    }
  });

  // ../../node_modules/crelt/index.es.js
  function crelt() {
    var elt = arguments[0];
    if (typeof elt == "string")
      elt = document.createElement(elt);
    var i = 1, next = arguments[1];
    if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
      for (var name2 in next)
        if (Object.prototype.hasOwnProperty.call(next, name2)) {
          var value2 = next[name2];
          if (typeof value2 == "string")
            elt.setAttribute(name2, value2);
          else if (value2 != null)
            elt[name2] = value2;
        }
      i++;
    }
    for (; i < arguments.length; i++)
      add(elt, arguments[i]);
    return elt;
  }
  function add(elt, child) {
    if (typeof child == "string") {
      elt.appendChild(document.createTextNode(child));
    } else if (child == null) {
    } else if (child.nodeType != null) {
      elt.appendChild(child);
    } else if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++)
        add(elt, child[i]);
    } else {
      throw new RangeError("Unsupported child node: " + child);
    }
  }

  // ../../node_modules/@codemirror/next/lint/dist/index.js
  var SelectedDiagnostic = class {
    constructor(from, to, diagnostic) {
      this.from = from;
      this.to = to;
      this.diagnostic = diagnostic;
    }
  };
  var LintState = class {
    constructor(diagnostics, panel, selected) {
      this.diagnostics = diagnostics;
      this.panel = panel;
      this.selected = selected;
    }
  };
  function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
    let found = null;
    diagnostics.between(after, diagnostics.length, (from, to, { spec }) => {
      if (diagnostic && spec.diagnostic != diagnostic)
        return;
      found = new SelectedDiagnostic(from, to, spec.diagnostic);
      return false;
    });
    return found;
  }
  function maybeEnableLint(state2) {
    return state2.field(lintState, false) ? void 0 : { append: [
      lintState,
      EditorView.decorations.compute([lintState], (state3) => {
        let { selected, panel } = state3.field(lintState);
        return !selected || !panel || selected.from == selected.to ? Decoration.none : Decoration.set([
          activeMark.range(selected.from, selected.to)
        ]);
      }),
      panels(),
      hoverTooltip(lintTooltip),
      baseTheme4
    ] };
  }
  function setDiagnostics(state2, diagnostics) {
    return {
      effects: setDiagnosticsEffect.of(diagnostics),
      reconfigure: maybeEnableLint(state2)
    };
  }
  var setDiagnosticsEffect = StateEffect.define();
  var togglePanel = StateEffect.define();
  var movePanelSelection = StateEffect.define();
  var lintState = StateField.define({
    create() {
      return new LintState(Decoration.none, null, null);
    },
    update(value2, tr) {
      if (tr.docChanged) {
        let mapped = value2.diagnostics.map(tr.changes), selected = null;
        if (value2.selected) {
          let selPos = tr.changes.mapPos(value2.selected.from, 1);
          selected = findDiagnostic(mapped, value2.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
        }
        value2 = new LintState(mapped, value2.panel, selected);
      }
      for (let effect of tr.effects) {
        if (effect.is(setDiagnosticsEffect)) {
          let ranges = Decoration.set(effect.value.map((d) => {
            return d.from < d.to ? Decoration.mark({
              attributes: { class: themeClass("lintRange." + d.severity) },
              diagnostic: d
            }).range(d.from, d.to) : Decoration.widget({
              widget: new DiagnosticWidget(d),
              diagnostic: d
            }).range(d.from);
          }));
          value2 = new LintState(ranges, value2.panel, findDiagnostic(ranges));
        } else if (effect.is(togglePanel)) {
          value2 = new LintState(value2.diagnostics, effect.value ? LintPanel.open : null, value2.selected);
        } else if (effect.is(movePanelSelection)) {
          value2 = new LintState(value2.diagnostics, value2.panel, effect.value);
        }
      }
      return value2;
    },
    provide: (f) => [
      showPanel.computeN([f], (s) => {
        let { panel } = s.field(f);
        return panel ? [panel] : [];
      }),
      EditorView.decorations.from(f, (s) => s.diagnostics)
    ]
  });
  var activeMark = Decoration.mark({ class: themeClass("lintRange.active") });
  function lintTooltip(view2, pos, side) {
    let { diagnostics } = view2.state.field(lintState);
    let found = [], stackStart = 2e8, stackEnd = 0;
    diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to, { spec }) => {
      if (pos >= from && pos <= to && (from == to || (pos > from || side > 0) && (pos < to || side < 0))) {
        found.push(spec.diagnostic);
        stackStart = Math.min(from, stackStart);
        stackEnd = Math.max(to, stackEnd);
      }
    });
    if (!found.length)
      return null;
    return {
      pos: stackStart,
      end: stackEnd,
      above: view2.state.doc.lineAt(stackStart).to < stackEnd,
      style: "lint",
      create() {
        return { dom: crelt("ul", found.map((d) => renderDiagnostic(view2, d, false))) };
      }
    };
  }
  var openLintPanel = (view2) => {
    let field = view2.state.field(lintState, false);
    if (!field || !field.panel)
      view2.dispatch({
        effects: togglePanel.of(true),
        reconfigure: maybeEnableLint(view2.state)
      });
    let panel = getPanel(view2, LintPanel.open);
    if (panel)
      panel.dom.querySelector(".cm-panel-lint ul").focus();
    return true;
  };
  var closeLintPanel = (view2) => {
    let field = view2.state.field(lintState, false);
    if (!field || !field.panel)
      return false;
    view2.dispatch({ effects: togglePanel.of(false) });
    return true;
  };
  var nextDiagnostic = (view2) => {
    let field = view2.state.field(lintState, false);
    if (!field)
      return false;
    let sel = view2.state.selection.main, next = field.diagnostics.iter(sel.to + 1);
    if (!next.value) {
      next = field.diagnostics.iter(0);
      if (!next.value || next.from == sel.from && next.to == sel.to)
        return false;
    }
    view2.dispatch({ selection: { anchor: next.from, head: next.to }, scrollIntoView: true });
    return true;
  };
  var lintKeymap = [
    { key: "Mod-Shift-m", run: openLintPanel },
    { key: "F8", run: nextDiagnostic }
  ];
  function assignKeys(actions) {
    let assigned = [];
    if (actions)
      actions:
        for (let { name: name2 } of actions) {
          for (let i = 0; i < name2.length; i++) {
            let ch = name2[i];
            if (/[a-zA-Z]/.test(ch) && !assigned.some((c) => c.toLowerCase() == ch.toLowerCase())) {
              assigned.push(ch);
              continue actions;
            }
          }
          assigned.push("");
        }
    return assigned;
  }
  function renderDiagnostic(view2, diagnostic, inPanel) {
    var _a;
    let keys = inPanel ? assignKeys(diagnostic.actions) : [];
    return crelt("li", { class: themeClass("diagnostic." + diagnostic.severity) }, crelt("span", { class: themeClass("diagnosticText") }, diagnostic.message), (_a = diagnostic.actions) === null || _a === void 0 ? void 0 : _a.map((action, i) => {
      let click = (e) => {
        e.preventDefault();
        let found = findDiagnostic(view2.state.field(lintState).diagnostics, diagnostic);
        if (found)
          action.apply(view2, found.from, found.to);
      };
      let { name: name2 } = action, keyIndex = keys[i] ? name2.indexOf(keys[i]) : -1;
      let nameElt = keyIndex < 0 ? name2 : [
        name2.slice(0, keyIndex),
        crelt("u", name2.slice(keyIndex, keyIndex + 1)),
        name2.slice(keyIndex + 1)
      ];
      return crelt("button", {
        class: themeClass("diagnosticAction"),
        onclick: click,
        onmousedown: click
      }, nameElt);
    }), diagnostic.source && crelt("div", { class: themeClass("diagnosticSource") }, diagnostic.source));
  }
  var DiagnosticWidget = class extends WidgetType {
    constructor(diagnostic) {
      super();
      this.diagnostic = diagnostic;
    }
    eq(other) {
      return other.diagnostic == this.diagnostic;
    }
    toDOM() {
      return crelt("span", { class: themeClass("lintPoint." + this.diagnostic.severity) });
    }
  };
  var PanelItem = class {
    constructor(view2, diagnostic) {
      this.diagnostic = diagnostic;
      this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
      this.dom = renderDiagnostic(view2, diagnostic, true);
      this.dom.setAttribute("role", "option");
    }
  };
  var LintPanel = class {
    constructor(view2) {
      this.view = view2;
      this.items = [];
      let onkeydown = (event) => {
        if (event.keyCode == 27) {
          closeLintPanel(this.view);
          this.view.focus();
        } else if (event.keyCode == 38 || event.keyCode == 33) {
          this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
        } else if (event.keyCode == 40 || event.keyCode == 34) {
          this.moveSelection((this.selectedIndex + 1) % this.items.length);
        } else if (event.keyCode == 36) {
          this.moveSelection(0);
        } else if (event.keyCode == 35) {
          this.moveSelection(this.items.length - 1);
        } else if (event.keyCode == 13) {
          this.view.focus();
        } else if (event.keyCode >= 65 && event.keyCode <= 90 && this.items.length) {
          let { diagnostic } = this.items[this.selectedIndex], keys = assignKeys(diagnostic.actions);
          for (let i = 0; i < keys.length; i++)
            if (keys[i].toUpperCase().charCodeAt(0) == event.keyCode) {
              let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
              if (found)
                diagnostic.actions[i].apply(view2, found.from, found.to);
            }
        } else {
          return;
        }
        event.preventDefault();
      };
      let onclick = (event) => {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].dom.contains(event.target))
            this.moveSelection(i);
        }
      };
      this.list = crelt("ul", {
        tabIndex: 0,
        role: "listbox",
        "aria-label": this.view.state.phrase("Diagnostics"),
        onkeydown,
        onclick
      });
      this.dom = crelt("div", this.list, crelt("button", {
        name: "close",
        "aria-label": this.view.state.phrase("close"),
        onclick: () => closeLintPanel(this.view)
      }, "\xD7"));
      this.update();
    }
    get selectedIndex() {
      let selected = this.view.state.field(lintState).selected;
      if (!selected)
        return -1;
      for (let i = 0; i < this.items.length; i++)
        if (this.items[i].diagnostic == selected.diagnostic)
          return i;
      return -1;
    }
    update() {
      let { diagnostics, selected } = this.view.state.field(lintState);
      let i = 0, needsSync = false, newSelectedItem = null;
      diagnostics.between(0, this.view.state.doc.length, (_start, _end, { spec }) => {
        let found = -1, item;
        for (let j = i; j < this.items.length; j++)
          if (this.items[j].diagnostic == spec.diagnostic) {
            found = j;
            break;
          }
        if (found < 0) {
          item = new PanelItem(this.view, spec.diagnostic);
          this.items.splice(i, 0, item);
          needsSync = true;
        } else {
          item = this.items[found];
          if (found > i) {
            this.items.splice(i, found - i);
            needsSync = true;
          }
        }
        if (selected && item.diagnostic == selected.diagnostic) {
          if (!item.dom.hasAttribute("aria-selected")) {
            item.dom.setAttribute("aria-selected", "true");
            newSelectedItem = item;
          }
        } else if (item.dom.hasAttribute("aria-selected")) {
          item.dom.removeAttribute("aria-selected");
        }
        i++;
      });
      while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
        needsSync = true;
        this.items.pop();
      }
      if (this.items.length == 0) {
        this.items.push(new PanelItem(this.view, {
          from: -1,
          to: -1,
          severity: "info",
          message: this.view.state.phrase("No diagnostics")
        }));
        needsSync = true;
      }
      if (newSelectedItem) {
        this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
        this.view.requestMeasure({
          key: this,
          read: () => ({ sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
          write: ({ sel, panel }) => {
            if (sel.top < panel.top)
              this.list.scrollTop -= panel.top - sel.top;
            else if (sel.bottom > panel.bottom)
              this.list.scrollTop += sel.bottom - panel.bottom;
          }
        });
      } else if (!this.items.length) {
        this.list.removeAttribute("aria-activedescendant");
      }
      if (needsSync)
        this.sync();
    }
    sync() {
      let domPos = this.list.firstChild;
      function rm3() {
        let prev = domPos;
        domPos = prev.nextSibling;
        prev.remove();
      }
      for (let item of this.items) {
        if (item.dom.parentNode == this.list) {
          while (domPos != item.dom)
            rm3();
          domPos = item.dom.nextSibling;
        } else {
          this.list.insertBefore(item.dom, domPos);
        }
      }
      while (domPos)
        rm3();
      if (!this.list.firstChild)
        this.list.appendChild(renderDiagnostic(this.view, {
          severity: "info",
          message: this.view.state.phrase("No diagnostics")
        }, true));
    }
    moveSelection(selectedIndex) {
      if (this.items.length == 0)
        return;
      let field = this.view.state.field(lintState);
      let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
      if (!selection)
        return;
      this.view.dispatch({
        selection: { anchor: selection.from, head: selection.to },
        scrollIntoView: true,
        effects: movePanelSelection.of(selection)
      });
    }
    get style() {
      return "lint";
    }
    static open(view2) {
      return new LintPanel(view2);
    }
  };
  function underline(color) {
    if (typeof btoa != "function")
      return "none";
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="3">
    <path d="m0 3 l2 -2 l1 0 l2 2 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>
  </svg>`;
    return `url('data:image/svg+xml;base64,${btoa(svg)}')`;
  }
  var baseTheme4 = EditorView.baseTheme({
    $diagnostic: {
      padding: "3px 6px 3px 8px",
      marginLeft: "-1px",
      display: "block"
    },
    "$diagnostic.error": { borderLeft: "5px solid #d11" },
    "$diagnostic.warning": { borderLeft: "5px solid orange" },
    "$diagnostic.info": { borderLeft: "5px solid #999" },
    $diagnosticAction: {
      font: "inherit",
      border: "none",
      padding: "2px 4px",
      backgroundColor: "#444",
      color: "white",
      borderRadius: "3px",
      marginLeft: "8px"
    },
    $diagnosticSource: {
      fontSize: "70%",
      opacity: 0.7
    },
    $lintRange: {
      backgroundPosition: "left bottom",
      backgroundRepeat: "repeat-x"
    },
    "$lintRange.error": { backgroundImage: underline("#d11") },
    "$lintRange.warning": { backgroundImage: underline("orange") },
    "$lintRange.info": { backgroundImage: underline("#999") },
    "$lintRange.active": { backgroundColor: "#ffdd9980" },
    $lintPoint: {
      position: "relative",
      "&:after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: "-2px",
        borderLeft: "3px solid transparent",
        borderRight: "3px solid transparent",
        borderBottom: "4px solid #d11"
      }
    },
    "$lintPoint.warning": {
      "&:after": { borderBottomColor: "orange" }
    },
    "$lintPoint.info": {
      "&:after": { borderBottomColor: "#999" }
    },
    "$panel.lint": {
      position: "relative",
      "& ul": {
        maxHeight: "100px",
        overflowY: "auto",
        "& [aria-selected]": {
          backgroundColor: "#ddd",
          "& u": { textDecoration: "underline" }
        },
        "&:focus [aria-selected]": {
          background_fallback: "#bdf",
          backgroundColor: "Highlight",
          color_fallback: "white",
          color: "HighlightText"
        },
        "& u": { textDecoration: "none" },
        padding: 0,
        margin: 0
      },
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "2px",
        background: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      }
    },
    "$tooltip.lint": {
      padding: 0,
      margin: 0
    }
  });

  // ../../node_modules/lezer-tree/dist/tree.es.js
  var DefaultBufferLength = 1024;
  var nextPropID = 0;
  var CachedNode = new WeakMap();
  var NodeProp = class {
    constructor({ deserialize } = {}) {
      this.id = nextPropID++;
      this.deserialize = deserialize || (() => {
        throw new Error("This node type doesn't define a deserialize function");
      });
    }
    static string() {
      return new NodeProp({ deserialize: (str) => str });
    }
    static number() {
      return new NodeProp({ deserialize: Number });
    }
    static flag() {
      return new NodeProp({ deserialize: () => true });
    }
    set(propObj, value2) {
      propObj[this.id] = value2;
      return propObj;
    }
    add(match2) {
      if (typeof match2 != "function")
        match2 = NodeType.match(match2);
      return (type2) => {
        let result = match2(type2);
        return result === void 0 ? null : [this, result];
      };
    }
  };
  NodeProp.closedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.openedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.group = new NodeProp({ deserialize: (str) => str.split(" ") });
  var noProps = Object.create(null);
  var NodeType = class {
    constructor(name2, props, id, flags = 0) {
      this.name = name2;
      this.props = props;
      this.id = id;
      this.flags = flags;
    }
    static define(spec) {
      let props = spec.props && spec.props.length ? Object.create(null) : noProps;
      let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
      let type2 = new NodeType(spec.name || "", props, spec.id, flags);
      if (spec.props)
        for (let src of spec.props) {
          if (!Array.isArray(src))
            src = src(type2);
          if (src)
            src[0].set(props, src[1]);
        }
      return type2;
    }
    prop(prop) {
      return this.props[prop.id];
    }
    get isTop() {
      return (this.flags & 1) > 0;
    }
    get isSkipped() {
      return (this.flags & 2) > 0;
    }
    get isError() {
      return (this.flags & 4) > 0;
    }
    get isAnonymous() {
      return (this.flags & 8) > 0;
    }
    is(name2) {
      if (typeof name2 == "string") {
        if (this.name == name2)
          return true;
        let group = this.prop(NodeProp.group);
        return group ? group.indexOf(name2) > -1 : false;
      }
      return this.id == name2;
    }
    static match(map2) {
      let direct = Object.create(null);
      for (let prop in map2)
        for (let name2 of prop.split(" "))
          direct[name2] = map2[prop];
      return (node) => {
        for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
          let found = direct[i < 0 ? node.name : groups[i]];
          if (found)
            return found;
        }
      };
    }
  };
  NodeType.none = new NodeType("", Object.create(null), 0, 8);
  var NodeSet = class {
    constructor(types2) {
      this.types = types2;
      for (let i = 0; i < types2.length; i++)
        if (types2[i].id != i)
          throw new RangeError("Node type ids should correspond to array positions when creating a node set");
    }
    extend(...props) {
      let newTypes = [];
      for (let type2 of this.types) {
        let newProps = null;
        for (let source2 of props) {
          let add2 = source2(type2);
          if (add2) {
            if (!newProps)
              newProps = Object.assign({}, type2.props);
            add2[0].set(newProps, add2[1]);
          }
        }
        newTypes.push(newProps ? new NodeType(type2.name, newProps, type2.id, type2.flags) : type2);
      }
      return new NodeSet(newTypes);
    }
  };
  var Tree = class {
    constructor(type2, children, positions, length) {
      this.type = type2;
      this.children = children;
      this.positions = positions;
      this.length = length;
    }
    toString() {
      let children = this.children.map((c) => c.toString()).join();
      return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
    }
    cursor(pos, side = 0) {
      let scope = pos != null && CachedNode.get(this) || this.topNode;
      let cursor = new TreeCursor(scope);
      if (pos != null) {
        cursor.moveTo(pos, side);
        CachedNode.set(this, cursor._tree);
      }
      return cursor;
    }
    fullCursor() {
      return new TreeCursor(this.topNode, true);
    }
    get topNode() {
      return new TreeNode(this, 0, 0, null);
    }
    resolve(pos, side = 0) {
      return this.cursor(pos, side).node;
    }
    iterate(spec) {
      let { enter, leave, from = 0, to = this.length } = spec;
      for (let c = this.cursor(); ; ) {
        let mustLeave = false;
        if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c.type, c.from, c.to) !== false)) {
          if (c.firstChild())
            continue;
          if (!c.type.isAnonymous)
            mustLeave = true;
        }
        for (; ; ) {
          if (mustLeave && leave)
            leave(c.type, c.from, c.to);
          mustLeave = c.type.isAnonymous;
          if (c.nextSibling())
            break;
          if (!c.parent())
            return;
          mustLeave = true;
        }
      }
    }
    balance(maxBufferLength = DefaultBufferLength) {
      return this.children.length <= BalanceBranchFactor ? this : balanceRange(this.type, NodeType.none, this.children, this.positions, 0, this.children.length, 0, maxBufferLength, this.length, 0);
    }
    static build(data) {
      return buildTree(data);
    }
  };
  Tree.empty = new Tree(NodeType.none, [], [], 0);
  function withHash(tree, hash) {
    if (hash)
      tree.contextHash = hash;
    return tree;
  }
  var TreeBuffer = class {
    constructor(buffer, length, set, type2 = NodeType.none) {
      this.buffer = buffer;
      this.length = length;
      this.set = set;
      this.type = type2;
    }
    toString() {
      let result = [];
      for (let index = 0; index < this.buffer.length; ) {
        result.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result.join(",");
    }
    childString(index) {
      let id = this.buffer[index], endIndex = this.buffer[index + 3];
      let type2 = this.set.types[id], result = type2.name;
      if (/\W/.test(result) && !type2.isError)
        result = JSON.stringify(result);
      index += 4;
      if (endIndex == index)
        return result;
      let children = [];
      while (index < endIndex) {
        children.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result + "(" + children.join(",") + ")";
    }
    findChild(startIndex, endIndex, dir, after) {
      let { buffer } = this, pick = -1;
      for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
        if (after != -1e8) {
          let start = buffer[i + 1], end = buffer[i + 2];
          if (dir > 0) {
            if (end > after)
              pick = i;
            if (end > after)
              break;
          } else {
            if (start < after)
              pick = i;
            if (end >= after)
              break;
          }
        } else {
          pick = i;
          if (dir > 0)
            break;
        }
      }
      return pick;
    }
  };
  var TreeNode = class {
    constructor(node, from, index, _parent) {
      this.node = node;
      this.from = from;
      this.index = index;
      this._parent = _parent;
    }
    get type() {
      return this.node.type;
    }
    get name() {
      return this.node.type.name;
    }
    get to() {
      return this.from + this.node.length;
    }
    nextChild(i, dir, after, full = false) {
      for (let parent = this; ; ) {
        for (let { children, positions } = parent.node, e = dir > 0 ? children.length : -1; i != e; i += dir) {
          let next = children[i], start = positions[i] + parent.from;
          if (after != -1e8 && (dir < 0 ? start >= after : start + next.length <= after))
            continue;
          if (next instanceof TreeBuffer) {
            let index = next.findChild(0, next.buffer.length, dir, after == -1e8 ? -1e8 : after - start);
            if (index > -1)
              return new BufferNode(new BufferContext(parent, next, i, start), null, index);
          } else if (full || (!next.type.isAnonymous || hasChild(next))) {
            let inner = new TreeNode(next, start, i, parent);
            return full || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, after);
          }
        }
        if (full || !parent.type.isAnonymous)
          return null;
        i = parent.index + dir;
        parent = parent._parent;
        if (!parent)
          return null;
      }
    }
    get firstChild() {
      return this.nextChild(0, 1, -1e8);
    }
    get lastChild() {
      return this.nextChild(this.node.children.length - 1, -1, -1e8);
    }
    childAfter(pos) {
      return this.nextChild(0, 1, pos);
    }
    childBefore(pos) {
      return this.nextChild(this.node.children.length - 1, -1, pos);
    }
    nextSignificantParent() {
      let val = this;
      while (val.type.isAnonymous && val._parent)
        val = val._parent;
      return val;
    }
    get parent() {
      return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
      return this._parent ? this._parent.nextChild(this.index + 1, 1, -1) : null;
    }
    get prevSibling() {
      return this._parent ? this._parent.nextChild(this.index - 1, -1, -1) : null;
    }
    get cursor() {
      return new TreeCursor(this);
    }
    resolve(pos, side = 0) {
      return this.cursor.moveTo(pos, side).node;
    }
    getChild(type2, before = null, after = null) {
      let r = getChildren(this, type2, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type2, before = null, after = null) {
      return getChildren(this, type2, before, after);
    }
    toString() {
      return this.node.toString();
    }
  };
  function getChildren(node, type2, before, after) {
    let cur2 = node.cursor, result = [];
    if (!cur2.firstChild())
      return result;
    if (before != null) {
      while (!cur2.type.is(before))
        if (!cur2.nextSibling())
          return result;
    }
    for (; ; ) {
      if (after != null && cur2.type.is(after))
        return result;
      if (cur2.type.is(type2))
        result.push(cur2.node);
      if (!cur2.nextSibling())
        return after == null ? result : [];
    }
  }
  var BufferContext = class {
    constructor(parent, buffer, index, start) {
      this.parent = parent;
      this.buffer = buffer;
      this.index = index;
      this.start = start;
    }
  };
  var BufferNode = class {
    constructor(context, _parent, index) {
      this.context = context;
      this._parent = _parent;
      this.index = index;
      this.type = context.buffer.set.types[context.buffer.buffer[index]];
    }
    get name() {
      return this.type.name;
    }
    get from() {
      return this.context.start + this.context.buffer.buffer[this.index + 1];
    }
    get to() {
      return this.context.start + this.context.buffer.buffer[this.index + 2];
    }
    child(dir, after) {
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, after == -1e8 ? -1e8 : after - this.context.start);
      return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get firstChild() {
      return this.child(1, -1e8);
    }
    get lastChild() {
      return this.child(-1, -1e8);
    }
    childAfter(pos) {
      return this.child(1, pos);
    }
    childBefore(pos) {
      return this.child(-1, pos);
    }
    get parent() {
      return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
      return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, -1);
    }
    get nextSibling() {
      let { buffer } = this.context;
      let after = buffer.buffer[this.index + 3];
      if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
        return new BufferNode(this.context, this._parent, after);
      return this.externalSibling(1);
    }
    get prevSibling() {
      let { buffer } = this.context;
      let parentStart = this._parent ? this._parent.index + 4 : 0;
      if (this.index == parentStart)
        return this.externalSibling(-1);
      return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, -1e8));
    }
    get cursor() {
      return new TreeCursor(this);
    }
    resolve(pos, side = 0) {
      return this.cursor.moveTo(pos, side).node;
    }
    toString() {
      return this.context.buffer.childString(this.index);
    }
    getChild(type2, before = null, after = null) {
      let r = getChildren(this, type2, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type2, before = null, after = null) {
      return getChildren(this, type2, before, after);
    }
  };
  var TreeCursor = class {
    constructor(node, full = false) {
      this.full = full;
      this.buffer = null;
      this.stack = [];
      this.index = 0;
      this.bufferNode = null;
      if (node instanceof TreeNode) {
        this.yieldNode(node);
      } else {
        this._tree = node.context.parent;
        this.buffer = node.context;
        for (let n = node._parent; n; n = n._parent)
          this.stack.unshift(n.index);
        this.bufferNode = node;
        this.yieldBuf(node.index);
      }
    }
    get name() {
      return this.type.name;
    }
    yieldNode(node) {
      if (!node)
        return false;
      this._tree = node;
      this.type = node.type;
      this.from = node.from;
      this.to = node.to;
      return true;
    }
    yieldBuf(index, type2) {
      this.index = index;
      let { start, buffer } = this.buffer;
      this.type = type2 || buffer.set.types[buffer.buffer[index]];
      this.from = start + buffer.buffer[index + 1];
      this.to = start + buffer.buffer[index + 2];
      return true;
    }
    yield(node) {
      if (!node)
        return false;
      if (node instanceof TreeNode) {
        this.buffer = null;
        return this.yieldNode(node);
      }
      this.buffer = node.context;
      return this.yieldBuf(node.index, node.type);
    }
    toString() {
      return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    enter(dir, after) {
      if (!this.buffer)
        return this.yield(this._tree.nextChild(dir < 0 ? this._tree.node.children.length - 1 : 0, dir, after, this.full));
      let { buffer } = this.buffer;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, after == -1e8 ? -1e8 : after - this.buffer.start);
      if (index < 0)
        return false;
      this.stack.push(this.index);
      return this.yieldBuf(index);
    }
    firstChild() {
      return this.enter(1, -1e8);
    }
    lastChild() {
      return this.enter(-1, -1e8);
    }
    childAfter(pos) {
      return this.enter(1, pos);
    }
    childBefore(pos) {
      return this.enter(-1, pos);
    }
    parent() {
      if (!this.buffer)
        return this.yieldNode(this.full ? this._tree._parent : this._tree.parent);
      if (this.stack.length)
        return this.yieldBuf(this.stack.pop());
      let parent = this.full ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
      this.buffer = null;
      return this.yieldNode(parent);
    }
    sibling(dir) {
      if (!this.buffer)
        return !this._tree._parent ? false : this.yield(this._tree._parent.nextChild(this._tree.index + dir, dir, -1e8, this.full));
      let { buffer } = this.buffer, d = this.stack.length - 1;
      if (dir < 0) {
        let parentStart = d < 0 ? 0 : this.stack[d] + 4;
        if (this.index != parentStart)
          return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, -1e8));
      } else {
        let after = buffer.buffer[this.index + 3];
        if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
          return this.yieldBuf(after);
      }
      return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, -1e8, this.full)) : false;
    }
    nextSibling() {
      return this.sibling(1);
    }
    prevSibling() {
      return this.sibling(-1);
    }
    atLastNode(dir) {
      let index, parent, { buffer } = this;
      if (buffer) {
        if (dir > 0) {
          if (this.index < buffer.buffer.buffer.length)
            return false;
        } else {
          for (let i = 0; i < this.index; i++)
            if (buffer.buffer.buffer[i + 3] < this.index)
              return false;
        }
        ({ index, parent } = buffer);
      } else {
        ({ index, _parent: parent } = this._tree);
      }
      for (; parent; { index, _parent: parent } = parent) {
        for (let i = index + dir, e = dir < 0 ? -1 : parent.node.children.length; i != e; i += dir) {
          let child = parent.node.children[i];
          if (this.full || !child.type.isAnonymous || child instanceof TreeBuffer || hasChild(child))
            return false;
        }
      }
      return true;
    }
    move(dir) {
      if (this.enter(dir, -1e8))
        return true;
      for (; ; ) {
        if (this.sibling(dir))
          return true;
        if (this.atLastNode(dir) || !this.parent())
          return false;
      }
    }
    next() {
      return this.move(1);
    }
    prev() {
      return this.move(-1);
    }
    moveTo(pos, side = 0) {
      while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
        if (!this.parent())
          break;
      for (; ; ) {
        if (side < 0 ? !this.childBefore(pos) : !this.childAfter(pos))
          break;
        if (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos)) {
          this.parent();
          break;
        }
      }
      return this;
    }
    get node() {
      if (!this.buffer)
        return this._tree;
      let cache = this.bufferNode, result = null, depth2 = 0;
      if (cache && cache.context == this.buffer) {
        scan:
          for (let index = this.index, d = this.stack.length; d >= 0; ) {
            for (let c = cache; c; c = c._parent)
              if (c.index == index) {
                if (index == this.index)
                  return c;
                result = c;
                depth2 = d + 1;
                break scan;
              }
            index = this.stack[--d];
          }
      }
      for (let i = depth2; i < this.stack.length; i++)
        result = new BufferNode(this.buffer, result, this.stack[i]);
      return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    get tree() {
      return this.buffer ? null : this._tree.node;
    }
  };
  function hasChild(tree) {
    return tree.children.some((ch) => !ch.type.isAnonymous || ch instanceof TreeBuffer || hasChild(ch));
  }
  var FlatBufferCursor = class {
    constructor(buffer, index) {
      this.buffer = buffer;
      this.index = index;
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    get pos() {
      return this.index;
    }
    next() {
      this.index -= 4;
    }
    fork() {
      return new FlatBufferCursor(this.buffer, this.index);
    }
  };
  var BalanceBranchFactor = 8;
  function buildTree(data) {
    var _a;
    let { buffer, nodeSet, topID = 0, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types2 = nodeSet.types;
    let contextHash = 0;
    function takeNode(parentStart, minPos, children2, positions2, inRepeat) {
      let { id, start, end, size } = cursor;
      let startPos = start - parentStart;
      if (size < 0) {
        if (size == -1) {
          children2.push(reused[id]);
          positions2.push(startPos);
        } else {
          contextHash = id;
        }
        cursor.next();
        return;
      }
      let type2 = types2[id], node, buffer2;
      if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
        let data2 = new Uint16Array(buffer2.size - buffer2.skip);
        let endPos = cursor.pos - buffer2.size, index = data2.length;
        while (cursor.pos > endPos)
          index = copyToBuffer(buffer2.start, data2, index, inRepeat);
        node = new TreeBuffer(data2, end - buffer2.start, nodeSet, inRepeat < 0 ? NodeType.none : types2[inRepeat]);
        startPos = buffer2.start - parentStart;
      } else {
        let endPos = cursor.pos - size;
        cursor.next();
        let localChildren = [], localPositions = [];
        let localInRepeat = id >= minRepeatType ? id : -1;
        while (cursor.pos > endPos) {
          if (cursor.id == localInRepeat)
            cursor.next();
          else
            takeNode(start, endPos, localChildren, localPositions, localInRepeat);
        }
        localChildren.reverse();
        localPositions.reverse();
        if (localInRepeat > -1 && localChildren.length > BalanceBranchFactor)
          node = balanceRange(type2, type2, localChildren, localPositions, 0, localChildren.length, 0, maxBufferLength, end - start, contextHash);
        else
          node = withHash(new Tree(type2, localChildren, localPositions, end - start), contextHash);
      }
      children2.push(node);
      positions2.push(startPos);
    }
    function findBufferSize(maxSize, inRepeat) {
      let fork = cursor.fork();
      let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
      let result = { size: 0, start: 0, skip: 0 };
      scan:
        for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
          if (fork.id == inRepeat) {
            result.size = size;
            result.start = start;
            result.skip = skip;
            skip += 4;
            size += 4;
            fork.next();
            continue;
          }
          let nodeSize = fork.size, startPos = fork.pos - nodeSize;
          if (nodeSize < 0 || startPos < minPos || fork.start < minStart)
            break;
          let localSkipped = fork.id >= minRepeatType ? 4 : 0;
          let nodeStart2 = fork.start;
          fork.next();
          while (fork.pos > startPos) {
            if (fork.size < 0)
              break scan;
            if (fork.id >= minRepeatType)
              localSkipped += 4;
            fork.next();
          }
          start = nodeStart2;
          size += nodeSize;
          skip += localSkipped;
        }
      if (inRepeat < 0 || size == maxSize) {
        result.size = size;
        result.start = start;
        result.skip = skip;
      }
      return result.size > 4 ? result : void 0;
    }
    function copyToBuffer(bufferStart, buffer2, index, inRepeat) {
      let { id, start, end, size } = cursor;
      cursor.next();
      if (id == inRepeat)
        return index;
      let startIndex = index;
      if (size > 4) {
        let endPos = cursor.pos - (size - 4);
        while (cursor.pos > endPos)
          index = copyToBuffer(bufferStart, buffer2, index, inRepeat);
      }
      if (id < minRepeatType) {
        buffer2[--index] = startIndex;
        buffer2[--index] = end - bufferStart;
        buffer2[--index] = start - bufferStart;
        buffer2[--index] = id;
      }
      return index;
    }
    let children = [], positions = [];
    while (cursor.pos > 0)
      takeNode(data.start || 0, 0, children, positions, -1);
    let length = (_a = data.length) !== null && _a !== void 0 ? _a : children.length ? positions[0] + children[0].length : 0;
    return new Tree(types2[topID], children.reverse(), positions.reverse(), length);
  }
  function balanceRange(outerType, innerType, children, positions, from, to, start, maxBufferLength, length, contextHash) {
    let localChildren = [], localPositions = [];
    if (length <= maxBufferLength) {
      for (let i = from; i < to; i++) {
        localChildren.push(children[i]);
        localPositions.push(positions[i] - start);
      }
    } else {
      let maxChild = Math.max(maxBufferLength, Math.ceil(length * 1.5 / BalanceBranchFactor));
      for (let i = from; i < to; ) {
        let groupFrom = i, groupStart = positions[i];
        i++;
        for (; i < to; i++) {
          let nextEnd = positions[i] + children[i].length;
          if (nextEnd - groupStart > maxChild)
            break;
        }
        if (i == groupFrom + 1) {
          let only = children[groupFrom];
          if (only instanceof Tree && only.type == innerType && only.length > maxChild << 1) {
            for (let j = 0; j < only.children.length; j++) {
              localChildren.push(only.children[j]);
              localPositions.push(only.positions[j] + groupStart - start);
            }
            continue;
          }
          localChildren.push(only);
        } else if (i == groupFrom + 1) {
          localChildren.push(children[groupFrom]);
        } else {
          let inner = balanceRange(innerType, innerType, children, positions, groupFrom, i, groupStart, maxBufferLength, positions[i - 1] + children[i - 1].length - groupStart, contextHash);
          if (innerType != NodeType.none && !containsType(inner.children, innerType))
            inner = withHash(new Tree(NodeType.none, inner.children, inner.positions, inner.length), contextHash);
          localChildren.push(inner);
        }
        localPositions.push(groupStart - start);
      }
    }
    return withHash(new Tree(outerType, localChildren, localPositions, length), contextHash);
  }
  function containsType(nodes, type2) {
    for (let elt of nodes)
      if (elt.type == type2)
        return true;
    return false;
  }
  var TreeFragment = class {
    constructor(from, to, tree, offset, open) {
      this.from = from;
      this.to = to;
      this.tree = tree;
      this.offset = offset;
      this.open = open;
    }
    get openStart() {
      return (this.open & 1) > 0;
    }
    get openEnd() {
      return (this.open & 2) > 0;
    }
    static applyChanges(fragments, changes, minGap = 128) {
      if (!changes.length)
        return fragments;
      let result = [];
      let fI = 1, nextF = fragments.length ? fragments[0] : null;
      let cI = 0, pos = 0, off = 0;
      for (; ; ) {
        let nextC = cI < changes.length ? changes[cI++] : null;
        let nextPos = nextC ? nextC.fromA : 1e9;
        if (nextPos - pos >= minGap)
          while (nextF && nextF.from < nextPos) {
            let cut = nextF;
            if (pos >= cut.from || nextPos <= cut.to || off) {
              let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
              cut = fFrom >= fTo ? null : new TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, (cI > 0 ? 1 : 0) | (nextC ? 2 : 0));
            }
            if (cut)
              result.push(cut);
            if (nextF.to > nextPos)
              break;
            nextF = fI < fragments.length ? fragments[fI++] : null;
          }
        if (!nextC)
          break;
        pos = nextC.toA;
        off = nextC.toA - nextC.toB;
      }
      return result;
    }
    static addTree(tree, fragments = [], partial = false) {
      let result = [new TreeFragment(0, tree.length, tree, 0, partial ? 2 : 0)];
      for (let f of fragments)
        if (f.to > tree.length)
          result.push(f);
      return result;
    }
  };
  function stringInput(input) {
    return new StringInput(input);
  }
  var StringInput = class {
    constructor(string3, length = string3.length) {
      this.string = string3;
      this.length = length;
    }
    get(pos) {
      return pos < 0 || pos >= this.length ? -1 : this.string.charCodeAt(pos);
    }
    lineAfter(pos) {
      if (pos < 0)
        return "";
      let end = this.string.indexOf("\n", pos);
      return this.string.slice(pos, end < 0 ? this.length : Math.min(end, this.length));
    }
    read(from, to) {
      return this.string.slice(from, Math.min(this.length, to));
    }
    clip(at) {
      return new StringInput(this.string, at);
    }
  };

  // ../../node_modules/@codemirror/next/language/dist/index.js
  var languageDataProp = new NodeProp();
  function defineLanguageFacet(baseData) {
    return Facet.define({
      combine: baseData ? (values) => values.concat(baseData) : void 0
    });
  }
  var Language = class {
    constructor(data, parser2, extraExtensions = []) {
      this.data = data;
      if (!EditorState.prototype.hasOwnProperty("tree"))
        Object.defineProperty(EditorState.prototype, "tree", { get() {
          return syntaxTree(this);
        } });
      this.parser = parser2;
      this.extension = [
        language.of(this),
        EditorState.languageData.of((state2, pos) => state2.facet(languageDataFacetAt(state2, pos)))
      ].concat(extraExtensions);
    }
    isActiveAt(state2, pos) {
      return languageDataFacetAt(state2, pos) == this.data;
    }
    findRegions(state2) {
      let lang = state2.facet(language);
      if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
        return [{ from: 0, to: state2.doc.length }];
      if (!lang || !lang.allowsNesting)
        return [];
      let result = [];
      syntaxTree(state2).iterate({
        enter: (type2, from, to) => {
          if (type2.isTop && type2.prop(languageDataProp) == this.data) {
            result.push({ from, to });
            return false;
          }
          return void 0;
        }
      });
      return result;
    }
    get allowsNesting() {
      return true;
    }
    parseString(code) {
      let doc2 = Text.of(code.split("\n"));
      let parse = this.parser.startParse(new DocInput(doc2), 0, new EditorParseContext(this.parser, EditorState.create({ doc: doc2 }), [], Tree.empty, { from: 0, to: code.length }, []));
      let tree;
      while (!(tree = parse.advance())) {
      }
      return tree;
    }
  };
  Language.state = StateField.define({
    create(state2) {
      let parseState = new EditorParseContext(state2.facet(language).parser, state2, [], Tree.empty, { from: 0, to: state2.doc.length }, []);
      if (!parseState.work(25))
        parseState.takeTree();
      return new LanguageState(parseState);
    },
    update(value2, tr) {
      for (let e of tr.effects)
        if (e.is(Language.setState))
          return e.value;
      return value2.apply(tr);
    }
  });
  Language.setState = StateEffect.define();
  function languageDataFacetAt(state2, pos) {
    let topLang = state2.facet(language);
    if (!topLang)
      return null;
    if (!topLang.allowsNesting)
      return topLang.data;
    let tree = syntaxTree(state2);
    let target2 = tree.resolve(pos, -1);
    while (target2) {
      let facet = target2.type.prop(languageDataProp);
      if (facet)
        return facet;
      target2 = target2.parent;
    }
    return topLang.data;
  }
  var LezerLanguage = class extends Language {
    constructor(data, parser2) {
      super(data, parser2);
      this.parser = parser2;
    }
    static define(spec) {
      let data = defineLanguageFacet(spec.languageData);
      return new LezerLanguage(data, spec.parser.configure({
        props: [languageDataProp.add((type2) => type2.isTop ? data : void 0)]
      }));
    }
    configure(options) {
      return new LezerLanguage(this.data, this.parser.configure(options));
    }
    get allowsNesting() {
      return this.parser.hasNested;
    }
  };
  function syntaxTree(state2) {
    let field = state2.field(Language.state, false);
    return field ? field.tree : Tree.empty;
  }
  var DocInput = class {
    constructor(doc2, length = doc2.length) {
      this.doc = doc2;
      this.length = length;
      this.cursorPos = 0;
      this.string = "";
      this.prevString = "";
      this.cursor = doc2.iter();
    }
    syncTo(pos) {
      if (pos < this.cursorPos) {
        this.cursor = this.doc.iter();
        this.cursorPos = 0;
      }
      this.prevString = pos == this.cursorPos ? this.string : "";
      this.string = this.cursor.next(pos - this.cursorPos).value;
      this.cursorPos = pos + this.string.length;
      return this.cursorPos - this.string.length;
    }
    get(pos) {
      if (pos >= this.length)
        return -1;
      let stringStart = this.cursorPos - this.string.length;
      if (pos < stringStart || pos >= this.cursorPos) {
        if (pos < stringStart && pos >= stringStart - this.prevString.length)
          return this.prevString.charCodeAt(pos - (stringStart - this.prevString.length));
        stringStart = this.syncTo(pos);
      }
      return this.string.charCodeAt(pos - stringStart);
    }
    lineAfter(pos) {
      if (pos >= this.length || pos < 0)
        return "";
      let stringStart = this.cursorPos - this.string.length;
      if (pos < stringStart || pos >= this.cursorPos)
        stringStart = this.syncTo(pos);
      return this.cursor.lineBreak ? "" : this.string.slice(pos - stringStart);
    }
    read(from, to) {
      let stringStart = this.cursorPos - this.string.length;
      if (from < stringStart || to >= this.cursorPos)
        return this.doc.sliceString(from, to);
      else
        return this.string.slice(from - stringStart, to - stringStart);
    }
    clip(at) {
      return new DocInput(this.doc, at);
    }
  };
  var EditorParseContext = class {
    constructor(parser2, state2, fragments = [], tree, viewport, skipped) {
      this.parser = parser2;
      this.state = state2;
      this.fragments = fragments;
      this.tree = tree;
      this.viewport = viewport;
      this.skipped = skipped;
      this.parse = null;
      this.tempSkipped = [];
    }
    work(time2, upto) {
      if (this.tree != Tree.empty && (upto == null ? this.tree.length == this.state.doc.length : this.tree.length >= upto))
        return true;
      if (!this.parse)
        this.parse = this.parser.startParse(new DocInput(this.state.doc), 0, this);
      let endTime = Date.now() + time2;
      for (; ; ) {
        let done = this.parse.advance();
        if (done) {
          this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done));
          this.parse = null;
          this.tree = done;
          return true;
        } else if (upto != null && this.parse.pos >= upto) {
          this.takeTree();
          return true;
        }
        if (Date.now() > endTime)
          return false;
      }
    }
    takeTree() {
      if (this.parse && this.parse.pos > this.tree.length) {
        this.tree = this.parse.forceFinish();
        this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
      }
    }
    withoutTempSkipped(fragments) {
      for (let r; r = this.tempSkipped.pop(); )
        fragments = cutFragments(fragments, r.from, r.to);
      return fragments;
    }
    changes(changes, newState) {
      let { fragments, tree, viewport, skipped } = this;
      this.takeTree();
      if (!changes.empty) {
        let ranges = [];
        changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
        fragments = TreeFragment.applyChanges(fragments, ranges);
        tree = Tree.empty;
        viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
        if (this.skipped.length) {
          skipped = [];
          for (let r of this.skipped) {
            let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
            if (from < to)
              skipped.push({ from, to });
          }
        }
      }
      return new EditorParseContext(this.parser, newState, fragments, tree, viewport, skipped);
    }
    updateViewport(viewport) {
      this.viewport = viewport;
      let startLen = this.skipped.length;
      for (let i = 0; i < this.skipped.length; i++) {
        let { from, to } = this.skipped[i];
        if (from < viewport.to && to > viewport.from) {
          this.fragments = cutFragments(this.fragments, from, to);
          this.skipped.splice(i--, 1);
        }
      }
      return this.skipped.length < startLen;
    }
    reset() {
      if (this.parse) {
        this.takeTree();
        this.parse = null;
      }
    }
    skipUntilInView(from, to) {
      this.skipped.push({ from, to });
    }
  };
  EditorParseContext.skippingParser = {
    startParse(input, startPos, context) {
      return {
        pos: startPos,
        advance() {
          context.tempSkipped.push({ from: startPos, to: input.length });
          this.pos = input.length;
          return new Tree(NodeType.none, [], [], input.length - startPos);
        },
        forceFinish() {
          return this.advance();
        }
      };
    }
  };
  function cutFragments(fragments, from, to) {
    return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
  }
  var LanguageState = class {
    constructor(context) {
      this.context = context;
      this.tree = context.tree;
    }
    apply(tr) {
      if (!tr.docChanged)
        return this;
      let newCx = this.context.changes(tr.changes, tr.state);
      let upto = this.context.tree.length == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.tree.length), newCx.viewport.to);
      if (!newCx.work(25, upto))
        newCx.takeTree();
      return new LanguageState(newCx);
    }
  };
  var requestIdle = typeof window != "undefined" && window.requestIdleCallback || ((callback, { timeout }) => setTimeout(callback, timeout));
  var cancelIdle = typeof window != "undefined" && window.cancelIdleCallback || clearTimeout;
  var parseWorker = ViewPlugin.fromClass(class ParseWorker {
    constructor(view2) {
      this.view = view2;
      this.working = -1;
      this.chunkEnd = -1;
      this.chunkBudget = -1;
      this.work = this.work.bind(this);
      this.scheduleWork();
    }
    update(update) {
      if (update.docChanged) {
        if (this.view.hasFocus)
          this.chunkBudget += 50;
        this.scheduleWork();
      }
      let cx = this.view.state.field(Language.state).context;
      if (update.viewportChanged && cx.updateViewport(update.view.viewport)) {
        cx.reset();
        this.scheduleWork();
      }
    }
    scheduleWork() {
      if (this.working > -1)
        return;
      let { state: state2 } = this.view, field = state2.field(Language.state);
      if (field.tree.length >= state2.doc.length)
        return;
      this.working = requestIdle(this.work, { timeout: 500 });
    }
    work(deadline) {
      this.working = -1;
      let now = Date.now();
      if (this.chunkEnd < now && this.view.hasFocus) {
        this.chunkEnd = now + 3e4;
        this.chunkBudget = 3e3;
      }
      if (this.chunkBudget <= 0)
        return;
      let { state: state2 } = this.view, field = state2.field(Language.state);
      if (field.tree.length >= state2.doc.length)
        return;
      let time2 = Math.min(this.chunkBudget, deadline ? Math.max(25, deadline.timeRemaining()) : 100);
      field.context.work(time2);
      this.chunkBudget -= Date.now() - now;
      if (field.context.tree.length >= state2.doc.length) {
        this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
      } else {
        this.scheduleWork();
      }
    }
    destroy() {
      if (this.working >= 0)
        cancelIdle(this.working);
    }
  }, {
    eventHandlers: { focus() {
      this.scheduleWork();
    } }
  });
  var language = Facet.define({
    combine(languages) {
      return languages.length ? languages[0] : null;
    },
    enables: [Language.state, parseWorker]
  });
  var indentService = Facet.define();
  var indentUnit = Facet.define({
    combine: (values) => {
      if (!values.length)
        return "  ";
      if (!/^(?: +|\t+)$/.test(values[0]))
        throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
      return values[0];
    }
  });
  function getIndentUnit(state2) {
    let unit2 = state2.facet(indentUnit);
    return unit2.charCodeAt(0) == 9 ? state2.tabSize * unit2.length : unit2.length;
  }
  function indentString(state2, cols) {
    let result = "", ts = state2.tabSize;
    if (state2.facet(indentUnit).charCodeAt(0) == 9)
      while (cols >= ts) {
        result += "	";
        cols -= ts;
      }
    for (let i = 0; i < cols; i++)
      result += " ";
    return result;
  }
  function getIndentation(context, pos) {
    if (context instanceof EditorState)
      context = new IndentContext(context);
    for (let service of context.state.facet(indentService)) {
      let result = service(context, pos);
      if (result != null)
        return result;
    }
    let tree = syntaxTree(context.state);
    return tree ? syntaxIndentation(context, tree, pos) : null;
  }
  var IndentContext = class {
    constructor(state2, options = {}) {
      this.state = state2;
      this.options = options;
      this.unit = getIndentUnit(state2);
    }
    textAfterPos(pos) {
      var _a, _b;
      let sim = (_a = this.options) === null || _a === void 0 ? void 0 : _a.simulateBreak;
      if (pos == sim && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.simulateDoubleBreak))
        return "";
      return this.state.sliceDoc(pos, Math.min(pos + 100, sim != null && sim > pos ? sim : 1e9, this.state.doc.lineAt(pos).to));
    }
    column(pos) {
      var _a;
      let line = this.state.doc.lineAt(pos), text = line.text.slice(0, pos - line.from);
      let result = this.countColumn(text, pos - line.from);
      let override = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideIndentation) ? this.options.overrideIndentation(line.from) : -1;
      if (override > -1)
        result += override - this.countColumn(text, text.search(/\S/));
      return result;
    }
    countColumn(line, pos) {
      return countColumn(pos < 0 ? line : line.slice(0, pos), 0, this.state.tabSize);
    }
    lineIndent(line) {
      var _a;
      let override = (_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideIndentation;
      if (override) {
        let overriden = override(line.from);
        if (overriden > -1)
          return overriden;
      }
      return this.countColumn(line.text, line.text.search(/\S/));
    }
  };
  var indentNodeProp = new NodeProp();
  function syntaxIndentation(cx, ast, pos) {
    let tree = ast.resolve(pos);
    for (let scan = tree, scanPos = pos; ; ) {
      let last = scan.childBefore(scanPos);
      if (!last)
        break;
      if (last.type.isError && last.from == last.to) {
        tree = scan;
        scanPos = last.from;
      } else {
        scan = last;
        scanPos = scan.to + 1;
      }
    }
    for (; tree; tree = tree.parent) {
      let strategy = indentStrategy(tree);
      if (strategy)
        return strategy(new TreeIndentContext(cx, pos, tree));
    }
    return null;
  }
  function ignoreClosed(cx) {
    var _a, _b;
    return cx.pos == ((_a = cx.options) === null || _a === void 0 ? void 0 : _a.simulateBreak) && ((_b = cx.options) === null || _b === void 0 ? void 0 : _b.simulateDoubleBreak);
  }
  function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
      return strategy;
    let first2 = tree.firstChild, close;
    if (first2 && (close = first2.type.prop(NodeProp.closedBy))) {
      let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
      return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
    }
    return tree.parent == null ? topIndent : null;
  }
  function topIndent() {
    return 0;
  }
  var TreeIndentContext = class extends IndentContext {
    constructor(base2, pos, node) {
      super(base2.state, base2.options);
      this.pos = pos;
      this.node = node;
    }
    get textAfter() {
      return this.textAfterPos(this.pos);
    }
    get baseIndent() {
      let line = this.state.doc.lineAt(this.node.from);
      for (; ; ) {
        let atBreak = this.node.resolve(line.from);
        while (atBreak.parent && atBreak.parent.from == atBreak.from)
          atBreak = atBreak.parent;
        if (isParent(atBreak, this.node))
          break;
        line = this.state.doc.lineAt(atBreak.from);
      }
      return this.lineIndent(line);
    }
  };
  function isParent(parent, of) {
    for (let cur2 = of; cur2; cur2 = cur2.parent)
      if (parent == cur2)
        return true;
    return false;
  }
  function bracketedAligned(context) {
    var _a;
    let tree = context.node;
    let openToken = tree.childAfter(tree.from), last = tree.lastChild;
    if (!openToken)
      return null;
    let sim = (_a = context.options) === null || _a === void 0 ? void 0 : _a.simulateBreak;
    let openLine = context.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to; ; ) {
      let next = tree.childAfter(pos);
      if (!next || next == last)
        return null;
      if (!next.type.isSkipped)
        return next.from < lineEnd ? openToken : null;
      pos = next.to;
    }
  }
  function delimitedStrategy(context, align, units, closing2, closedAt) {
    let after = context.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing2 && after.slice(space, space + closing2.length) == closing2 || closedAt == context.pos + space;
    let aligned = align ? bracketedAligned(context) : null;
    if (aligned)
      return closed ? context.column(aligned.from) : context.column(aligned.to);
    return context.baseIndent + (closed ? 0 : context.unit * units);
  }
  function continuedIndent({ except, units = 1 } = {}) {
    return (context) => {
      let matchExcept = except && except.test(context.textAfter);
      return context.baseIndent + (matchExcept ? 0 : units * context.unit);
    };
  }
  var DontIndentBeyond = 200;
  function indentOnInput() {
    return EditorState.transactionFilter.of((tr) => {
      if (!tr.docChanged || tr.annotation(Transaction.userEvent) != "input")
        return tr;
      let rules = tr.startState.languageDataAt("indentOnInput", tr.startState.selection.main.head);
      if (!rules.length)
        return tr;
      let doc2 = tr.newDoc, { head: head2 } = tr.newSelection.main, line = doc2.lineAt(head2);
      if (head2 > line.from + DontIndentBeyond)
        return tr;
      let lineStart = doc2.sliceString(line.from, head2);
      if (!rules.some((r) => r.test(lineStart)))
        return tr;
      let { state: state2 } = tr, last = -1, changes = [];
      for (let { head: head3 } of state2.selection.ranges) {
        let line2 = state2.doc.lineAt(head3);
        if (line2.from == last)
          continue;
        last = line2.from;
        let indent = getIndentation(state2, line2.from);
        if (indent == null)
          continue;
        let cur2 = /^\s*/.exec(line2.text)[0];
        let norm = indentString(state2, indent);
        if (cur2 != norm)
          changes.push({ from: line2.from, to: line2.from + cur2.length, insert: norm });
      }
      return changes.length ? [tr, { changes }] : tr;
    });
  }
  var foldService = Facet.define();
  var foldNodeProp = new NodeProp();
  function syntaxFolding(state2, start, end) {
    let tree = syntaxTree(state2);
    if (tree.length == 0)
      return null;
    let inner = tree.resolve(end);
    let found = null;
    for (let cur2 = inner; cur2; cur2 = cur2.parent) {
      if (cur2.to <= end || cur2.from > end)
        continue;
      if (found && cur2.from < start)
        break;
      let prop = cur2.type.prop(foldNodeProp);
      if (prop) {
        let value2 = prop(cur2, state2);
        if (value2 && value2.from <= end && value2.from >= start && value2.to > end)
          found = value2;
      }
    }
    return found;
  }
  function foldable(state2, lineStart, lineEnd) {
    for (let service of state2.facet(foldService)) {
      let result = service(state2, lineStart, lineEnd);
      if (result)
        return result;
    }
    return syntaxFolding(state2, lineStart, lineEnd);
  }

  // ../../node_modules/@codemirror/next/highlight/dist/index.js
  var nextTagID = 0;
  var Tag = class {
    constructor(set, base2, modified) {
      this.set = set;
      this.base = base2;
      this.modified = modified;
      this.id = nextTagID++;
    }
    static define(parent) {
      if (parent === null || parent === void 0 ? void 0 : parent.base)
        throw new Error("Can not derive from a modified tag");
      let tag = new Tag([], null, []);
      tag.set.push(tag);
      if (parent)
        for (let t2 of parent.set)
          tag.set.push(t2);
      return tag;
    }
    static defineModifier() {
      let mod = new Modifier();
      return (tag) => {
        if (tag.modified.indexOf(mod) > -1)
          return tag;
        return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
      };
    }
  };
  var nextModifierID = 0;
  var Modifier = class {
    constructor() {
      this.instances = [];
      this.id = nextModifierID++;
    }
    static get(base2, mods) {
      if (!mods.length)
        return base2;
      let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
      if (exists)
        return exists;
      let set = [], tag = new Tag(set, base2, mods);
      for (let m of mods)
        m.instances.push(tag);
      let configs = permute(mods);
      for (let parent of base2.set)
        for (let config2 of configs)
          set.push(Modifier.get(parent, config2));
      return tag;
    }
  };
  function sameArray2(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i]);
  }
  function permute(array) {
    let result = [array];
    for (let i = 0; i < array.length; i++) {
      for (let a of permute(array.slice(0, i).concat(array.slice(i + 1))))
        result.push(a);
    }
    return result;
  }
  function styleTags(spec) {
    let byName = Object.create(null);
    for (let prop in spec) {
      let tags2 = spec[prop];
      if (!Array.isArray(tags2))
        tags2 = [tags2];
      for (let part of prop.split(" "))
        if (part) {
          let pieces = [], mode = 2, rest2 = part;
          for (let pos = 0; ; ) {
            if (rest2 == "..." && pos > 0 && pos + 3 == part.length) {
              mode = 1;
              break;
            }
            let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest2);
            if (!m)
              throw new RangeError("Invalid path: " + part);
            pieces.push(m[0] == "*" ? null : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
            pos += m[0].length;
            if (pos == part.length)
              break;
            let next = part[pos++];
            if (pos == part.length && next == "!") {
              mode = 0;
              break;
            }
            if (next != "/")
              throw new RangeError("Invalid path: " + part);
            rest2 = part.slice(pos);
          }
          let last = pieces.length - 1, inner = pieces[last];
          if (!inner)
            throw new RangeError("Invalid path: " + part);
          let rule = new Rule(tags2, mode, last > 0 ? pieces.slice(0, last) : null);
          byName[inner] = rule.sort(byName[inner]);
        }
    }
    return ruleNodeProp.add(byName);
  }
  var ruleNodeProp = new NodeProp();
  var highlightStyleProp = Facet.define({
    combine(stylings) {
      return stylings.length ? stylings[0] : null;
    }
  });
  var Rule = class {
    constructor(tags2, mode, context, next) {
      this.tags = tags2;
      this.mode = mode;
      this.context = context;
      this.next = next;
    }
    sort(other) {
      if (!other || other.depth < this.depth) {
        this.next = other;
        return this;
      }
      other.next = this.sort(other.next);
      return other;
    }
    get depth() {
      return this.context ? this.context.length : 0;
    }
  };
  var HighlightStyle = class {
    constructor(spec) {
      this.map = Object.create(null);
      let modSpec = Object.create(null);
      for (let style of spec) {
        let cls = StyleModule.newName();
        modSpec["." + cls] = Object.assign({}, style, { tag: null });
        let tags2 = style.tag;
        if (!Array.isArray(tags2))
          tags2 = [tags2];
        for (let tag of tags2)
          this.map[tag.id] = cls;
      }
      this.module = new StyleModule(modSpec);
      this.match = this.match.bind(this);
      this.extension = [
        treeHighlighter,
        highlightStyleProp.of(this),
        EditorView.styleModule.of(this.module)
      ];
    }
    match(tag) {
      for (let t2 of tag.set) {
        let match2 = this.map[t2.id];
        if (match2) {
          if (t2 != tag)
            this.map[tag.id] = match2;
          return match2;
        }
      }
      return this.map[tag.id] = null;
    }
    static define(...specs) {
      return new HighlightStyle(specs);
    }
  };
  var treeHighlighter = Prec.fallback(ViewPlugin.define((view2) => new TreeHighlighter(view2), {
    decorations: (v) => v.decorations
  }));
  var TreeHighlighter = class {
    constructor(view2) {
      this.markCache = Object.create(null);
      this.tree = syntaxTree(view2.state);
      this.decorations = this.buildDeco(view2);
    }
    update(update) {
      let tree = syntaxTree(update.state);
      if (tree.length < update.view.viewport.to) {
        this.decorations = this.decorations.map(update.changes);
      } else if (tree != this.tree || update.viewportChanged) {
        this.tree = tree;
        this.decorations = this.buildDeco(update.view);
      }
    }
    buildDeco(view2) {
      const style = view2.state.facet(highlightStyleProp);
      if (!style || !this.tree.length)
        return Decoration.none;
      let builder = new RangeSetBuilder();
      for (let { from, to } of view2.visibleRanges) {
        highlightTreeRange(this.tree, from, to, style.match, (from2, to2, style2) => {
          builder.add(from2, to2, this.markCache[style2] || (this.markCache[style2] = Decoration.mark({ class: style2 })));
        });
      }
      return builder.finish();
    }
  };
  var nodeStack = [""];
  var classStack = [""];
  var inheritStack = [""];
  function highlightTreeRange(tree, from, to, style, span) {
    let spanStart = from, spanClass = "", depth2 = 0;
    tree.iterate({
      from,
      to,
      enter: (type2, start) => {
        depth2++;
        let inheritedClass = inheritStack[depth2 - 1];
        let cls = inheritedClass;
        let rule = type2.prop(ruleNodeProp), opaque = false;
        while (rule) {
          if (!rule.context || matchContext(rule.context, nodeStack, depth2)) {
            for (let tag of rule.tags) {
              let st = style(tag);
              if (st) {
                if (cls)
                  cls += " ";
                cls += st;
                if (rule.mode == 1)
                  inheritedClass = cls;
                else if (rule.mode == 0)
                  opaque = true;
              }
            }
            break;
          }
          rule = rule.next;
        }
        if (cls != spanClass) {
          if (start > spanStart && spanClass)
            span(spanStart, start, spanClass);
          spanStart = start;
          spanClass = cls;
        }
        if (opaque) {
          depth2--;
          return false;
        }
        classStack[depth2] = cls;
        inheritStack[depth2] = inheritedClass;
        nodeStack[depth2] = type2.name;
        return void 0;
      },
      leave: (_t, _s, end) => {
        depth2--;
        let backTo = classStack[depth2];
        if (backTo != spanClass) {
          let pos = Math.min(to, end);
          if (pos > spanStart && spanClass)
            span(spanStart, pos, spanClass);
          spanStart = pos;
          spanClass = backTo;
        }
      }
    });
  }
  function matchContext(context, stack, depth2) {
    if (context.length > depth2 - 1)
      return false;
    for (let d = depth2 - 1, i = context.length - 1; i >= 0; i--, d--) {
      let check = context[i];
      if (check && check != stack[d])
        return false;
    }
    return true;
  }
  var t = Tag.define;
  var comment = t();
  var name = t();
  var literal = t();
  var string = t(literal);
  var number = t(literal);
  var content = t();
  var heading = t(content);
  var keyword = t();
  var operator = t();
  var punctuation = t();
  var bracket = t(punctuation);
  var meta = t();
  var tags = {
    comment,
    lineComment: t(comment),
    blockComment: t(comment),
    docComment: t(comment),
    name,
    variableName: t(name),
    typeName: t(name),
    propertyName: t(name),
    className: t(name),
    labelName: t(name),
    namespace: t(name),
    macroName: t(name),
    literal,
    string,
    docString: t(string),
    character: t(string),
    number,
    integer: t(number),
    float: t(number),
    bool: t(literal),
    regexp: t(literal),
    escape: t(literal),
    color: t(literal),
    url: t(literal),
    keyword,
    self: t(keyword),
    null: t(keyword),
    atom: t(keyword),
    unit: t(keyword),
    modifier: t(keyword),
    operatorKeyword: t(keyword),
    controlKeyword: t(keyword),
    definitionKeyword: t(keyword),
    operator,
    derefOperator: t(operator),
    arithmeticOperator: t(operator),
    logicOperator: t(operator),
    bitwiseOperator: t(operator),
    compareOperator: t(operator),
    updateOperator: t(operator),
    definitionOperator: t(operator),
    typeOperator: t(operator),
    controlOperator: t(operator),
    punctuation,
    separator: t(punctuation),
    bracket,
    angleBracket: t(bracket),
    squareBracket: t(bracket),
    paren: t(bracket),
    brace: t(bracket),
    content,
    heading,
    heading1: t(heading),
    heading2: t(heading),
    heading3: t(heading),
    heading4: t(heading),
    heading5: t(heading),
    heading6: t(heading),
    contentSeparator: t(content),
    list: t(content),
    quote: t(content),
    emphasis: t(content),
    strong: t(content),
    link: t(content),
    monospace: t(content),
    inserted: t(),
    deleted: t(),
    changed: t(),
    invalid: t(),
    meta,
    documentMeta: t(meta),
    annotation: t(meta),
    processingInstruction: t(meta),
    definition: Tag.defineModifier(),
    constant: Tag.defineModifier(),
    function: Tag.defineModifier(),
    standard: Tag.defineModifier(),
    local: Tag.defineModifier(),
    special: Tag.defineModifier()
  };
  var defaultHighlightStyle = HighlightStyle.define({
    tag: tags.link,
    textDecoration: "underline"
  }, {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  }, {
    tag: tags.emphasis,
    fontStyle: "italic"
  }, {
    tag: tags.strong,
    fontWeight: "bold"
  }, {
    tag: tags.keyword,
    color: "#708"
  }, {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: "#219"
  }, {
    tag: [tags.literal, tags.inserted],
    color: "#164"
  }, {
    tag: [tags.string, tags.deleted],
    color: "#a11"
  }, {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: "#e40"
  }, {
    tag: tags.definition(tags.variableName),
    color: "#00f"
  }, {
    tag: tags.local(tags.variableName),
    color: "#30a"
  }, {
    tag: [tags.typeName, tags.namespace],
    color: "#085"
  }, {
    tag: tags.className,
    color: "#167"
  }, {
    tag: [tags.special(tags.variableName), tags.macroName, tags.local(tags.variableName)],
    color: "#256"
  }, {
    tag: tags.definition(tags.propertyName),
    color: "#00c"
  }, {
    tag: tags.comment,
    color: "#940"
  }, {
    tag: tags.meta,
    color: "#7a757a"
  }, {
    tag: tags.invalid,
    color: "#f00"
  });

  // ../../node_modules/lezer/dist/index.es.js
  var Stack = class {
    constructor(p, stack, state2, reducePos, pos, score2, buffer, bufferBase, curContext, parent) {
      this.p = p;
      this.stack = stack;
      this.state = state2;
      this.reducePos = reducePos;
      this.pos = pos;
      this.score = score2;
      this.buffer = buffer;
      this.bufferBase = bufferBase;
      this.curContext = curContext;
      this.parent = parent;
    }
    toString() {
      return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
    }
    static start(p, state2, pos = 0) {
      let cx = p.parser.context;
      return new Stack(p, [], state2, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, null);
    }
    get context() {
      return this.curContext ? this.curContext.context : null;
    }
    pushState(state2, start) {
      this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
      this.state = state2;
    }
    reduce(action) {
      let depth2 = action >> 19, type2 = action & 65535;
      let { parser: parser2 } = this.p;
      let dPrec = parser2.dynamicPrecedence(type2);
      if (dPrec)
        this.score += dPrec;
      if (depth2 == 0) {
        if (type2 < parser2.minRepeatTerm)
          this.storeNode(type2, this.reducePos, this.reducePos, 4, true);
        this.pushState(parser2.getGoto(this.state, type2, true), this.reducePos);
        this.reduceContext(type2);
        return;
      }
      let base2 = this.stack.length - (depth2 - 1) * 3 - (action & 262144 ? 6 : 0);
      let start = this.stack[base2 - 2];
      let bufferBase = this.stack[base2 - 1], count = this.bufferBase + this.buffer.length - bufferBase;
      if (type2 < parser2.minRepeatTerm || action & 131072) {
        let pos = parser2.stateFlag(this.state, 1) ? this.pos : this.reducePos;
        this.storeNode(type2, start, pos, count + 4, true);
      }
      if (action & 262144) {
        this.state = this.stack[base2];
      } else {
        let baseStateID = this.stack[base2 - 3];
        this.state = parser2.getGoto(baseStateID, type2, true);
      }
      while (this.stack.length > base2)
        this.stack.pop();
      this.reduceContext(type2);
    }
    storeNode(term, start, end, size = 4, isReduce = false) {
      if (term == 0) {
        let cur2 = this, top2 = this.buffer.length;
        if (top2 == 0 && cur2.parent) {
          top2 = cur2.bufferBase - cur2.parent.bufferBase;
          cur2 = cur2.parent;
        }
        if (top2 > 0 && cur2.buffer[top2 - 4] == 0 && cur2.buffer[top2 - 1] > -1) {
          if (start == end)
            return;
          if (cur2.buffer[top2 - 2] >= start) {
            cur2.buffer[top2 - 2] = end;
            return;
          }
        }
      }
      if (!isReduce || this.pos == end) {
        this.buffer.push(term, start, end, size);
      } else {
        let index = this.buffer.length;
        if (index > 0 && this.buffer[index - 4] != 0)
          while (index > 0 && this.buffer[index - 2] > end) {
            this.buffer[index] = this.buffer[index - 4];
            this.buffer[index + 1] = this.buffer[index - 3];
            this.buffer[index + 2] = this.buffer[index - 2];
            this.buffer[index + 3] = this.buffer[index - 1];
            index -= 4;
            if (size > 4)
              size -= 4;
          }
        this.buffer[index] = term;
        this.buffer[index + 1] = start;
        this.buffer[index + 2] = end;
        this.buffer[index + 3] = size;
      }
    }
    shift(action, next, nextEnd) {
      if (action & 131072) {
        this.pushState(action & 65535, this.pos);
      } else if ((action & 262144) == 0) {
        let start = this.pos, nextState = action, { parser: parser2 } = this.p;
        if (nextEnd > this.pos || next <= parser2.maxNode) {
          this.pos = nextEnd;
          if (!parser2.stateFlag(nextState, 1))
            this.reducePos = nextEnd;
        }
        this.pushState(nextState, start);
        if (next <= parser2.maxNode)
          this.buffer.push(next, start, nextEnd, 4);
        this.shiftContext(next);
      } else {
        if (next <= this.p.parser.maxNode)
          this.buffer.push(next, this.pos, nextEnd, 4);
        this.pos = nextEnd;
      }
    }
    apply(action, next, nextEnd) {
      if (action & 65536)
        this.reduce(action);
      else
        this.shift(action, next, nextEnd);
    }
    useNode(value2, next) {
      let index = this.p.reused.length - 1;
      if (index < 0 || this.p.reused[index] != value2) {
        this.p.reused.push(value2);
        index++;
      }
      let start = this.pos;
      this.reducePos = this.pos = start + value2.length;
      this.pushState(next, start);
      this.buffer.push(index, start, this.reducePos, -1);
      if (this.curContext)
        this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value2, this.p.input, this));
    }
    split() {
      let parent = this;
      let off = parent.buffer.length;
      while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
        off -= 4;
      let buffer = parent.buffer.slice(off), base2 = parent.bufferBase + off;
      while (parent && base2 == parent.bufferBase)
        parent = parent.parent;
      return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base2, this.curContext, parent);
    }
    recoverByDelete(next, nextEnd) {
      let isNode = next <= this.p.parser.maxNode;
      if (isNode)
        this.storeNode(next, this.pos, nextEnd);
      this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
      this.pos = this.reducePos = nextEnd;
      this.score -= 200;
    }
    canShift(term) {
      for (let sim = new SimulatedStack(this); ; ) {
        let action = this.p.parser.stateSlot(sim.top, 4) || this.p.parser.hasAction(sim.top, term);
        if ((action & 65536) == 0)
          return true;
        if (action == 0)
          return false;
        sim.reduce(action);
      }
    }
    get ruleStart() {
      for (let state2 = this.state, base2 = this.stack.length; ; ) {
        let force = this.p.parser.stateSlot(state2, 5);
        if (!(force & 65536))
          return 0;
        base2 -= 3 * (force >> 19);
        if ((force & 65535) < this.p.parser.minRepeatTerm)
          return this.stack[base2 + 1];
        state2 = this.stack[base2];
      }
    }
    startOf(types2, before) {
      let state2 = this.state, frame = this.stack.length, { parser: parser2 } = this.p;
      for (; ; ) {
        let force = parser2.stateSlot(state2, 5);
        let depth2 = force >> 19, term = force & 65535;
        if (types2.indexOf(term) > -1) {
          let base2 = frame - 3 * (force >> 19), pos = this.stack[base2 + 1];
          if (before == null || before > pos)
            return pos;
        }
        if (frame == 0)
          return null;
        if (depth2 == 0) {
          frame -= 3;
          state2 = this.stack[frame];
        } else {
          frame -= 3 * (depth2 - 1);
          state2 = parser2.getGoto(this.stack[frame - 3], term, true);
        }
      }
    }
    recoverByInsert(next) {
      if (this.stack.length >= 300)
        return [];
      let nextStates = this.p.parser.nextStates(this.state);
      if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
        let best = [];
        for (let i = 0, s; i < nextStates.length; i += 2) {
          if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
            best.push(nextStates[i], s);
        }
        if (this.stack.length < 120)
          for (let i = 0; best.length < 4 << 1 && i < nextStates.length; i += 2) {
            let s = nextStates[i + 1];
            if (!best.some((v, i2) => i2 & 1 && v == s))
              best.push(nextStates[i], s);
          }
        nextStates = best;
      }
      let result = [];
      for (let i = 0; i < nextStates.length && result.length < 4; i += 2) {
        let s = nextStates[i + 1];
        if (s == this.state)
          continue;
        let stack = this.split();
        stack.storeNode(0, stack.pos, stack.pos, 4, true);
        stack.pushState(s, this.pos);
        stack.shiftContext(nextStates[i]);
        stack.score -= 200;
        result.push(stack);
      }
      return result;
    }
    forceReduce() {
      let reduce = this.p.parser.stateSlot(this.state, 5);
      if ((reduce & 65536) == 0)
        return false;
      if (!this.p.parser.validAction(this.state, reduce)) {
        this.storeNode(0, this.reducePos, this.reducePos, 4, true);
        this.score -= 100;
      }
      this.reduce(reduce);
      return true;
    }
    forceAll() {
      while (!this.p.parser.stateFlag(this.state, 2) && this.forceReduce()) {
      }
      return this;
    }
    get deadEnd() {
      if (this.stack.length != 3)
        return false;
      let { parser: parser2 } = this.p;
      return parser2.data[parser2.stateSlot(this.state, 1)] == 65535 && !parser2.stateSlot(this.state, 4);
    }
    restart() {
      this.state = this.stack[0];
      this.stack.length = 0;
    }
    sameState(other) {
      if (this.state != other.state || this.stack.length != other.stack.length)
        return false;
      for (let i = 0; i < this.stack.length; i += 3)
        if (this.stack[i] != other.stack[i])
          return false;
      return true;
    }
    get parser() {
      return this.p.parser;
    }
    dialectEnabled(dialectID) {
      return this.p.parser.dialect.flags[dialectID];
    }
    shiftContext(term) {
      if (this.curContext)
        this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this.p.input, this));
    }
    reduceContext(term) {
      if (this.curContext)
        this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this.p.input, this));
    }
    emitContext() {
      let cx = this.curContext;
      if (!cx.tracker.strict)
        return;
      let last = this.buffer.length - 1;
      if (last < 0 || this.buffer[last] != -2)
        this.buffer.push(cx.hash, this.reducePos, this.reducePos, -2);
    }
    updateContext(context) {
      if (context != this.curContext.context) {
        let newCx = new StackContext(this.curContext.tracker, context);
        if (newCx.hash != this.curContext.hash)
          this.emitContext();
        this.curContext = newCx;
      }
    }
  };
  var StackContext = class {
    constructor(tracker, context) {
      this.tracker = tracker;
      this.context = context;
      this.hash = tracker.hash(context);
    }
  };
  var Recover;
  (function(Recover2) {
    Recover2[Recover2["Token"] = 200] = "Token";
    Recover2[Recover2["Reduce"] = 100] = "Reduce";
    Recover2[Recover2["MaxNext"] = 4] = "MaxNext";
    Recover2[Recover2["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
    Recover2[Recover2["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
  })(Recover || (Recover = {}));
  var SimulatedStack = class {
    constructor(stack) {
      this.stack = stack;
      this.top = stack.state;
      this.rest = stack.stack;
      this.offset = this.rest.length;
    }
    reduce(action) {
      let term = action & 65535, depth2 = action >> 19;
      if (depth2 == 0) {
        if (this.rest == this.stack.stack)
          this.rest = this.rest.slice();
        this.rest.push(this.top, 0, 0);
        this.offset += 3;
      } else {
        this.offset -= (depth2 - 1) * 3;
      }
      let goto = this.stack.p.parser.getGoto(this.rest[this.offset - 3], term, true);
      this.top = goto;
    }
  };
  var StackBufferCursor = class {
    constructor(stack, pos, index) {
      this.stack = stack;
      this.pos = pos;
      this.index = index;
      this.buffer = stack.buffer;
      if (this.index == 0)
        this.maybeNext();
    }
    static create(stack) {
      return new StackBufferCursor(stack, stack.bufferBase + stack.buffer.length, stack.buffer.length);
    }
    maybeNext() {
      let next = this.stack.parent;
      if (next != null) {
        this.index = this.stack.bufferBase - next.bufferBase;
        this.stack = next;
        this.buffer = next.buffer;
      }
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    next() {
      this.index -= 4;
      this.pos -= 4;
      if (this.index == 0)
        this.maybeNext();
    }
    fork() {
      return new StackBufferCursor(this.stack, this.pos, this.index);
    }
  };
  var Token = class {
    constructor() {
      this.start = -1;
      this.value = -1;
      this.end = -1;
    }
    accept(value2, end) {
      this.value = value2;
      this.end = end;
    }
  };
  var TokenGroup = class {
    constructor(data, id) {
      this.data = data;
      this.id = id;
    }
    token(input, token2, stack) {
      readToken(this.data, input, token2, stack, this.id);
    }
  };
  TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
  function readToken(data, input, token2, stack, group) {
    let state2 = 0, groupMask = 1 << group, dialect = stack.p.parser.dialect;
    scan:
      for (let pos = token2.start; ; ) {
        if ((groupMask & data[state2]) == 0)
          break;
        let accEnd = data[state2 + 1];
        for (let i = state2 + 3; i < accEnd; i += 2)
          if ((data[i + 1] & groupMask) > 0) {
            let term = data[i];
            if (dialect.allows(term) && (token2.value == -1 || token2.value == term || stack.p.parser.overrides(term, token2.value))) {
              token2.accept(term, pos);
              break;
            }
          }
        let next = input.get(pos++);
        for (let low = 0, high = data[state2 + 2]; low < high; ) {
          let mid = low + high >> 1;
          let index = accEnd + mid + (mid << 1);
          let from = data[index], to = data[index + 1];
          if (next < from)
            high = mid;
          else if (next >= to)
            low = mid + 1;
          else {
            state2 = data[index + 2];
            continue scan;
          }
        }
        break;
      }
  }
  function decodeArray(input, Type = Uint16Array) {
    if (typeof input != "string")
      return input;
    let array = null;
    for (let pos = 0, out = 0; pos < input.length; ) {
      let value2 = 0;
      for (; ; ) {
        let next = input.charCodeAt(pos++), stop = false;
        if (next == 126) {
          value2 = 65535;
          break;
        }
        if (next >= 92)
          next--;
        if (next >= 34)
          next--;
        let digit = next - 32;
        if (digit >= 46) {
          digit -= 46;
          stop = true;
        }
        value2 += digit;
        if (stop)
          break;
        value2 *= 46;
      }
      if (array)
        array[out++] = value2;
      else
        array = new Type(value2);
    }
    return array;
  }
  var verbose = typeof process != "undefined" && /\bparse\b/.test(process.env.LOG);
  var stackIDs = null;
  function cutAt(tree, pos, side) {
    let cursor = tree.cursor(pos);
    for (; ; ) {
      if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
        for (; ; ) {
          if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
            return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 5)) : Math.min(tree.length, Math.max(cursor.from + 1, pos + 5));
          if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
            break;
          if (!cursor.parent())
            return side < 0 ? 0 : tree.length;
        }
    }
  }
  var FragmentCursor = class {
    constructor(fragments) {
      this.fragments = fragments;
      this.i = 0;
      this.fragment = null;
      this.safeFrom = -1;
      this.safeTo = -1;
      this.trees = [];
      this.start = [];
      this.index = [];
      this.nextFragment();
    }
    nextFragment() {
      let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
      if (fr) {
        this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
        this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
        while (this.trees.length) {
          this.trees.pop();
          this.start.pop();
          this.index.pop();
        }
        this.trees.push(fr.tree);
        this.start.push(-fr.offset);
        this.index.push(0);
        this.nextStart = this.safeFrom;
      } else {
        this.nextStart = 1e9;
      }
    }
    nodeAt(pos) {
      if (pos < this.nextStart)
        return null;
      while (this.fragment && this.safeTo <= pos)
        this.nextFragment();
      if (!this.fragment)
        return null;
      for (; ; ) {
        let last = this.trees.length - 1;
        if (last < 0) {
          this.nextFragment();
          return null;
        }
        let top2 = this.trees[last], index = this.index[last];
        if (index == top2.children.length) {
          this.trees.pop();
          this.start.pop();
          this.index.pop();
          continue;
        }
        let next = top2.children[index];
        let start = this.start[last] + top2.positions[index];
        if (start > pos) {
          this.nextStart = start;
          return null;
        } else if (start == pos && start + next.length <= this.safeTo) {
          return start == pos && start >= this.safeFrom ? next : null;
        }
        if (next instanceof TreeBuffer) {
          this.index[last]++;
          this.nextStart = start + next.length;
        } else {
          this.index[last]++;
          if (start + next.length >= pos) {
            this.trees.push(next);
            this.start.push(start);
            this.index.push(0);
          }
        }
      }
    }
  };
  var CachedToken = class extends Token {
    constructor() {
      super(...arguments);
      this.extended = -1;
      this.mask = 0;
      this.context = 0;
    }
    clear(start) {
      this.start = start;
      this.value = this.extended = -1;
    }
  };
  var dummyToken = new Token();
  var TokenCache = class {
    constructor(parser2) {
      this.tokens = [];
      this.mainToken = dummyToken;
      this.actions = [];
      this.tokens = parser2.tokenizers.map((_) => new CachedToken());
    }
    getActions(stack, input) {
      let actionIndex = 0;
      let main = null;
      let { parser: parser2 } = stack.p, { tokenizers } = parser2;
      let mask = parser2.stateSlot(stack.state, 3);
      let context = stack.curContext ? stack.curContext.hash : 0;
      for (let i = 0; i < tokenizers.length; i++) {
        if ((1 << i & mask) == 0)
          continue;
        let tokenizer = tokenizers[i], token2 = this.tokens[i];
        if (main && !tokenizer.fallback)
          continue;
        if (tokenizer.contextual || token2.start != stack.pos || token2.mask != mask || token2.context != context) {
          this.updateCachedToken(token2, tokenizer, stack, input);
          token2.mask = mask;
          token2.context = context;
        }
        if (token2.value != 0) {
          let startIndex = actionIndex;
          if (token2.extended > -1)
            actionIndex = this.addActions(stack, token2.extended, token2.end, actionIndex);
          actionIndex = this.addActions(stack, token2.value, token2.end, actionIndex);
          if (!tokenizer.extend) {
            main = token2;
            if (actionIndex > startIndex)
              break;
          }
        }
      }
      while (this.actions.length > actionIndex)
        this.actions.pop();
      if (!main) {
        main = dummyToken;
        main.start = stack.pos;
        if (stack.pos == input.length)
          main.accept(stack.p.parser.eofTerm, stack.pos);
        else
          main.accept(0, stack.pos + 1);
      }
      this.mainToken = main;
      return this.actions;
    }
    updateCachedToken(token2, tokenizer, stack, input) {
      token2.clear(stack.pos);
      tokenizer.token(input, token2, stack);
      if (token2.value > -1) {
        let { parser: parser2 } = stack.p;
        for (let i = 0; i < parser2.specialized.length; i++)
          if (parser2.specialized[i] == token2.value) {
            let result = parser2.specializers[i](input.read(token2.start, token2.end), stack);
            if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
              if ((result & 1) == 0)
                token2.value = result >> 1;
              else
                token2.extended = result >> 1;
              break;
            }
          }
      } else if (stack.pos == input.length) {
        token2.accept(stack.p.parser.eofTerm, stack.pos);
      } else {
        token2.accept(0, stack.pos + 1);
      }
    }
    putAction(action, token2, end, index) {
      for (let i = 0; i < index; i += 3)
        if (this.actions[i] == action)
          return index;
      this.actions[index++] = action;
      this.actions[index++] = token2;
      this.actions[index++] = end;
      return index;
    }
    addActions(stack, token2, end, index) {
      let { state: state2 } = stack, { parser: parser2 } = stack.p, { data } = parser2;
      for (let set = 0; set < 2; set++) {
        for (let i = parser2.stateSlot(state2, set ? 2 : 1); ; i += 3) {
          if (data[i] == 65535) {
            if (data[i + 1] == 1) {
              i = pair(data, i + 2);
            } else {
              if (index == 0 && data[i + 1] == 2)
                index = this.putAction(pair(data, i + 1), token2, end, index);
              break;
            }
          }
          if (data[i] == token2)
            index = this.putAction(pair(data, i + 1), token2, end, index);
        }
      }
      return index;
    }
  };
  var Rec;
  (function(Rec2) {
    Rec2[Rec2["Distance"] = 5] = "Distance";
    Rec2[Rec2["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
    Rec2[Rec2["MinBufferLengthPrune"] = 200] = "MinBufferLengthPrune";
    Rec2[Rec2["ForceReduceLimit"] = 10] = "ForceReduceLimit";
  })(Rec || (Rec = {}));
  var Parse = class {
    constructor(parser2, input, startPos, context) {
      this.parser = parser2;
      this.input = input;
      this.startPos = startPos;
      this.context = context;
      this.pos = 0;
      this.recovering = 0;
      this.nextStackID = 9812;
      this.nested = null;
      this.nestEnd = 0;
      this.nestWrap = null;
      this.reused = [];
      this.tokens = new TokenCache(parser2);
      this.topTerm = parser2.top[1];
      this.stacks = [Stack.start(this, parser2.top[0], this.startPos)];
      let fragments = context === null || context === void 0 ? void 0 : context.fragments;
      this.fragments = fragments && fragments.length ? new FragmentCursor(fragments) : null;
    }
    advance() {
      if (this.nested) {
        let result = this.nested.advance();
        this.pos = this.nested.pos;
        if (result) {
          this.finishNested(this.stacks[0], result);
          this.nested = null;
        }
        return null;
      }
      let stacks = this.stacks, pos = this.pos;
      let newStacks = this.stacks = [];
      let stopped, stoppedTokens;
      let maybeNest;
      for (let i = 0; i < stacks.length; i++) {
        let stack = stacks[i], nest;
        for (; ; ) {
          if (stack.pos > pos) {
            newStacks.push(stack);
          } else if (nest = this.checkNest(stack)) {
            if (!maybeNest || maybeNest.stack.score < stack.score)
              maybeNest = nest;
          } else if (this.advanceStack(stack, newStacks, stacks)) {
            continue;
          } else {
            if (!stopped) {
              stopped = [];
              stoppedTokens = [];
            }
            stopped.push(stack);
            let tok = this.tokens.mainToken;
            stoppedTokens.push(tok.value, tok.end);
          }
          break;
        }
      }
      if (maybeNest) {
        this.startNested(maybeNest);
        return null;
      }
      if (!newStacks.length) {
        let finished = stopped && findFinished(stopped);
        if (finished)
          return this.stackToTree(finished);
        if (this.parser.strict) {
          if (verbose && stopped)
            console.log("Stuck with token " + this.parser.getName(this.tokens.mainToken.value));
          throw new SyntaxError("No parse at " + pos);
        }
        if (!this.recovering)
          this.recovering = 5;
      }
      if (this.recovering && stopped) {
        let finished = this.runRecovery(stopped, stoppedTokens, newStacks);
        if (finished)
          return this.stackToTree(finished.forceAll());
      }
      if (this.recovering) {
        let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
        if (newStacks.length > maxRemaining) {
          newStacks.sort((a, b) => b.score - a.score);
          while (newStacks.length > maxRemaining)
            newStacks.pop();
        }
        if (newStacks.some((s) => s.reducePos > pos))
          this.recovering--;
      } else if (newStacks.length > 1) {
        outer:
          for (let i = 0; i < newStacks.length - 1; i++) {
            let stack = newStacks[i];
            for (let j = i + 1; j < newStacks.length; j++) {
              let other = newStacks[j];
              if (stack.sameState(other) || stack.buffer.length > 200 && other.buffer.length > 200) {
                if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
                  newStacks.splice(j--, 1);
                } else {
                  newStacks.splice(i--, 1);
                  continue outer;
                }
              }
            }
          }
      }
      this.pos = newStacks[0].pos;
      for (let i = 1; i < newStacks.length; i++)
        if (newStacks[i].pos < this.pos)
          this.pos = newStacks[i].pos;
      return null;
    }
    advanceStack(stack, stacks, split) {
      let start = stack.pos, { input, parser: parser2 } = this;
      let base2 = verbose ? this.stackID(stack) + " -> " : "";
      if (this.fragments) {
        let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
        for (let cached = this.fragments.nodeAt(start); cached; ) {
          let match2 = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser2.getGoto(stack.state, cached.type.id) : -1;
          if (match2 > -1 && cached.length && (!strictCx || (cached.contextHash || 0) == cxHash)) {
            stack.useNode(cached, match2);
            if (verbose)
              console.log(base2 + this.stackID(stack) + ` (via reuse of ${parser2.getName(cached.type.id)})`);
            return true;
          }
          if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
            break;
          let inner = cached.children[0];
          if (inner instanceof Tree)
            cached = inner;
          else
            break;
        }
      }
      let defaultReduce = parser2.stateSlot(stack.state, 4);
      if (defaultReduce > 0) {
        stack.reduce(defaultReduce);
        if (verbose)
          console.log(base2 + this.stackID(stack) + ` (via always-reduce ${parser2.getName(defaultReduce & 65535)})`);
        return true;
      }
      let actions = this.tokens.getActions(stack, input);
      for (let i = 0; i < actions.length; ) {
        let action = actions[i++], term = actions[i++], end = actions[i++];
        let last = i == actions.length || !split;
        let localStack = last ? stack : stack.split();
        localStack.apply(action, term, end);
        if (verbose)
          console.log(base2 + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser2.getName(action & 65535)}`} for ${parser2.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
        if (last)
          return true;
        else if (localStack.pos > start)
          stacks.push(localStack);
        else
          split.push(localStack);
      }
      return false;
    }
    advanceFully(stack, newStacks) {
      let pos = stack.pos;
      for (; ; ) {
        let nest = this.checkNest(stack);
        if (nest)
          return nest;
        if (!this.advanceStack(stack, null, null))
          return false;
        if (stack.pos > pos) {
          pushStackDedup(stack, newStacks);
          return true;
        }
      }
    }
    runRecovery(stacks, tokens, newStacks) {
      let finished = null, restarted = false;
      let maybeNest;
      for (let i = 0; i < stacks.length; i++) {
        let stack = stacks[i], token2 = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
        let base2 = verbose ? this.stackID(stack) + " -> " : "";
        if (stack.deadEnd) {
          if (restarted)
            continue;
          restarted = true;
          stack.restart();
          if (verbose)
            console.log(base2 + this.stackID(stack) + " (restarted)");
          let done = this.advanceFully(stack, newStacks);
          if (done) {
            if (done !== true)
              maybeNest = done;
            continue;
          }
        }
        let force = stack.split(), forceBase = base2;
        for (let j = 0; force.forceReduce() && j < 10; j++) {
          if (verbose)
            console.log(forceBase + this.stackID(force) + " (via force-reduce)");
          let done = this.advanceFully(force, newStacks);
          if (done) {
            if (done !== true)
              maybeNest = done;
            break;
          }
          if (verbose)
            forceBase = this.stackID(force) + " -> ";
        }
        for (let insert2 of stack.recoverByInsert(token2)) {
          if (verbose)
            console.log(base2 + this.stackID(insert2) + " (via recover-insert)");
          this.advanceFully(insert2, newStacks);
        }
        if (this.input.length > stack.pos) {
          if (tokenEnd == stack.pos) {
            tokenEnd++;
            token2 = 0;
          }
          stack.recoverByDelete(token2, tokenEnd);
          if (verbose)
            console.log(base2 + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token2)})`);
          pushStackDedup(stack, newStacks);
        } else if (!finished || finished.score < stack.score) {
          finished = stack;
        }
      }
      if (finished)
        return finished;
      if (maybeNest) {
        for (let s of this.stacks)
          if (s.score > maybeNest.stack.score) {
            maybeNest = void 0;
            break;
          }
      }
      if (maybeNest)
        this.startNested(maybeNest);
      return null;
    }
    forceFinish() {
      let stack = this.stacks[0].split();
      if (this.nested)
        this.finishNested(stack, this.nested.forceFinish());
      return this.stackToTree(stack.forceAll());
    }
    stackToTree(stack, pos = stack.pos) {
      if (this.parser.context)
        stack.emitContext();
      return Tree.build({
        buffer: StackBufferCursor.create(stack),
        nodeSet: this.parser.nodeSet,
        topID: this.topTerm,
        maxBufferLength: this.parser.bufferLength,
        reused: this.reused,
        start: this.startPos,
        length: pos - this.startPos,
        minRepeatType: this.parser.minRepeatTerm
      });
    }
    checkNest(stack) {
      let info = this.parser.findNested(stack.state);
      if (!info)
        return null;
      let spec = info.value;
      if (typeof spec == "function")
        spec = spec(this.input, stack);
      return spec ? { stack, info, spec } : null;
    }
    startNested(nest) {
      let { stack, info, spec } = nest;
      this.stacks = [stack];
      this.nestEnd = this.scanForNestEnd(stack, info.end, spec.filterEnd);
      this.nestWrap = typeof spec.wrapType == "number" ? this.parser.nodeSet.types[spec.wrapType] : spec.wrapType || null;
      if (spec.startParse) {
        this.nested = spec.startParse(this.input.clip(this.nestEnd), stack.pos, this.context);
      } else {
        this.finishNested(stack);
      }
    }
    scanForNestEnd(stack, endToken, filter) {
      for (let pos = stack.pos; pos < this.input.length; pos++) {
        dummyToken.start = pos;
        dummyToken.value = -1;
        endToken.token(this.input, dummyToken, stack);
        if (dummyToken.value > -1 && (!filter || filter(this.input.read(pos, dummyToken.end))))
          return pos;
      }
      return this.input.length;
    }
    finishNested(stack, tree) {
      if (this.nestWrap)
        tree = new Tree(this.nestWrap, tree ? [tree] : [], tree ? [0] : [], this.nestEnd - stack.pos);
      else if (!tree)
        tree = new Tree(NodeType.none, [], [], this.nestEnd - stack.pos);
      let info = this.parser.findNested(stack.state);
      stack.useNode(tree, this.parser.getGoto(stack.state, info.placeholder, true));
      if (verbose)
        console.log(this.stackID(stack) + ` (via unnest)`);
    }
    stackID(stack) {
      let id = (stackIDs || (stackIDs = new WeakMap())).get(stack);
      if (!id)
        stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
      return id + stack;
    }
  };
  function pushStackDedup(stack, newStacks) {
    for (let i = 0; i < newStacks.length; i++) {
      let other = newStacks[i];
      if (other.pos == stack.pos && other.sameState(stack)) {
        if (newStacks[i].score < stack.score)
          newStacks[i] = stack;
        return;
      }
    }
    newStacks.push(stack);
  }
  var Dialect = class {
    constructor(source2, flags, disabled) {
      this.source = source2;
      this.flags = flags;
      this.disabled = disabled;
    }
    allows(term) {
      return !this.disabled || this.disabled[term] == 0;
    }
  };
  var Parser = class {
    constructor(spec) {
      this.bufferLength = DefaultBufferLength;
      this.strict = false;
      this.cachedDialect = null;
      if (spec.version != 13)
        throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${13})`);
      let tokenArray = decodeArray(spec.tokenData);
      let nodeNames = spec.nodeNames.split(" ");
      this.minRepeatTerm = nodeNames.length;
      this.context = spec.context;
      for (let i = 0; i < spec.repeatNodeCount; i++)
        nodeNames.push("");
      let nodeProps = [];
      for (let i = 0; i < nodeNames.length; i++)
        nodeProps.push([]);
      function setProp(nodeID, prop, value2) {
        nodeProps[nodeID].push([prop, prop.deserialize(String(value2))]);
      }
      if (spec.nodeProps)
        for (let propSpec of spec.nodeProps) {
          let prop = propSpec[0];
          for (let i = 1; i < propSpec.length; ) {
            let next = propSpec[i++];
            if (next >= 0) {
              setProp(next, prop, propSpec[i++]);
            } else {
              let value2 = propSpec[i + -next];
              for (let j = -next; j > 0; j--)
                setProp(propSpec[i++], prop, value2);
              i++;
            }
          }
        }
      this.specialized = new Uint16Array(spec.specialized ? spec.specialized.length : 0);
      this.specializers = [];
      if (spec.specialized)
        for (let i = 0; i < spec.specialized.length; i++) {
          this.specialized[i] = spec.specialized[i].term;
          this.specializers[i] = spec.specialized[i].get;
        }
      this.states = decodeArray(spec.states, Uint32Array);
      this.data = decodeArray(spec.stateData);
      this.goto = decodeArray(spec.goto);
      let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
      this.nodeSet = new NodeSet(nodeNames.map((name2, i) => NodeType.define({
        name: i >= this.minRepeatTerm ? void 0 : name2,
        id: i,
        props: nodeProps[i],
        top: topTerms.indexOf(i) > -1,
        error: i == 0,
        skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
      })));
      this.maxTerm = spec.maxTerm;
      this.tokenizers = spec.tokenizers.map((value2) => typeof value2 == "number" ? new TokenGroup(tokenArray, value2) : value2);
      this.topRules = spec.topRules;
      this.nested = (spec.nested || []).map(([name2, value2, endToken, placeholder3]) => {
        return { name: name2, value: value2, end: new TokenGroup(decodeArray(endToken), 0), placeholder: placeholder3 };
      });
      this.dialects = spec.dialects || {};
      this.dynamicPrecedences = spec.dynamicPrecedences || null;
      this.tokenPrecTable = spec.tokenPrec;
      this.termNames = spec.termNames || null;
      this.maxNode = this.nodeSet.types.length - 1;
      this.dialect = this.parseDialect();
      this.top = this.topRules[Object.keys(this.topRules)[0]];
    }
    parse(input, startPos = 0, context = {}) {
      if (typeof input == "string")
        input = stringInput(input);
      let cx = new Parse(this, input, startPos, context);
      for (; ; ) {
        let done = cx.advance();
        if (done)
          return done;
      }
    }
    startParse(input, startPos = 0, context = {}) {
      if (typeof input == "string")
        input = stringInput(input);
      return new Parse(this, input, startPos, context);
    }
    getGoto(state2, term, loose = false) {
      let table = this.goto;
      if (term >= table[0])
        return -1;
      for (let pos = table[term + 1]; ; ) {
        let groupTag = table[pos++], last = groupTag & 1;
        let target2 = table[pos++];
        if (last && loose)
          return target2;
        for (let end = pos + (groupTag >> 1); pos < end; pos++)
          if (table[pos] == state2)
            return target2;
        if (last)
          return -1;
      }
    }
    hasAction(state2, terminal) {
      let data = this.data;
      for (let set = 0; set < 2; set++) {
        for (let i = this.stateSlot(state2, set ? 2 : 1), next; ; i += 3) {
          if ((next = data[i]) == 65535) {
            if (data[i + 1] == 1)
              next = data[i = pair(data, i + 2)];
            else if (data[i + 1] == 2)
              return pair(data, i + 2);
            else
              break;
          }
          if (next == terminal || next == 0)
            return pair(data, i + 1);
        }
      }
      return 0;
    }
    stateSlot(state2, slot2) {
      return this.states[state2 * 6 + slot2];
    }
    stateFlag(state2, flag) {
      return (this.stateSlot(state2, 0) & flag) > 0;
    }
    findNested(state2) {
      let flags = this.stateSlot(state2, 0);
      return flags & 4 ? this.nested[flags >> 10] : null;
    }
    validAction(state2, action) {
      if (action == this.stateSlot(state2, 4))
        return true;
      for (let i = this.stateSlot(state2, 1); ; i += 3) {
        if (this.data[i] == 65535) {
          if (this.data[i + 1] == 1)
            i = pair(this.data, i + 2);
          else
            return false;
        }
        if (action == pair(this.data, i + 1))
          return true;
      }
    }
    nextStates(state2) {
      let result = [];
      for (let i = this.stateSlot(state2, 1); ; i += 3) {
        if (this.data[i] == 65535) {
          if (this.data[i + 1] == 1)
            i = pair(this.data, i + 2);
          else
            break;
        }
        if ((this.data[i + 2] & 65536 >> 16) == 0) {
          let value2 = this.data[i + 1];
          if (!result.some((v, i2) => i2 & 1 && v == value2))
            result.push(this.data[i], value2);
        }
      }
      return result;
    }
    overrides(token2, prev) {
      let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
      return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token2) < iPrev;
    }
    configure(config2) {
      let copy = Object.assign(Object.create(Parser.prototype), this);
      if (config2.props)
        copy.nodeSet = this.nodeSet.extend(...config2.props);
      if (config2.top) {
        let info = this.topRules[config2.top];
        if (!info)
          throw new RangeError(`Invalid top rule name ${config2.top}`);
        copy.top = info;
      }
      if (config2.tokenizers)
        copy.tokenizers = this.tokenizers.map((t2) => {
          let found = config2.tokenizers.find((r) => r.from == t2);
          return found ? found.to : t2;
        });
      if (config2.dialect)
        copy.dialect = this.parseDialect(config2.dialect);
      if (config2.nested)
        copy.nested = this.nested.map((obj) => {
          if (!Object.prototype.hasOwnProperty.call(config2.nested, obj.name))
            return obj;
          return { name: obj.name, value: config2.nested[obj.name], end: obj.end, placeholder: obj.placeholder };
        });
      if (config2.strict != null)
        copy.strict = config2.strict;
      if (config2.bufferLength != null)
        copy.bufferLength = config2.bufferLength;
      return copy;
    }
    getName(term) {
      return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
    }
    get eofTerm() {
      return this.maxNode + 1;
    }
    get hasNested() {
      return this.nested.length > 0;
    }
    get topNode() {
      return this.nodeSet.types[this.top[1]];
    }
    dynamicPrecedence(term) {
      let prec2 = this.dynamicPrecedences;
      return prec2 == null ? 0 : prec2[term] || 0;
    }
    parseDialect(dialect) {
      if (this.cachedDialect && this.cachedDialect.source == dialect)
        return this.cachedDialect;
      let values = Object.keys(this.dialects), flags = values.map(() => false);
      if (dialect)
        for (let part of dialect.split(" ")) {
          let id = values.indexOf(part);
          if (id >= 0)
            flags[id] = true;
        }
      let disabled = null;
      for (let i = 0; i < values.length; i++)
        if (!flags[i]) {
          for (let j = this.dialects[values[i]], id; (id = this.data[j++]) != 65535; )
            (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
        }
      return this.cachedDialect = new Dialect(dialect, flags, disabled);
    }
    static deserialize(spec) {
      return new Parser(spec);
    }
  };
  function pair(data, off) {
    return data[off] | data[off + 1] << 16;
  }
  function findOffset(data, start, term) {
    for (let i = start, next; (next = data[i]) != 65535; i++)
      if (next == term)
        return i - start;
    return -1;
  }
  function findFinished(stacks) {
    let best = null;
    for (let stack of stacks) {
      if (stack.pos == stack.p.input.length && stack.p.parser.stateFlag(stack.state, 2) && (!best || best.score < stack.score))
        best = stack;
    }
    return best;
  }

  // ../tasl-lezer/grammar/tasl.js
  var spec_identifier = { __proto__: null, namespace: 8, type: 16, class: 58, edge: 64 };
  var parser = Parser.deserialize({
    version: 13,
    states: ")SQYQPOOOkQPO'#C_OpQPO'#CcOuQPO'#CxOzQPO'#C{OOQO'#DT'#DTOOQO'#C}'#C}Q!PQPO'#C}QYQPOOOOQO'#Ca'#CaO!UQQO,58yOOQO'#Ce'#CeO!ZQPO,58}O!rQPO,59dO!wQPO,59gOOQO,59i,59iOOQO-E6{-E6{OOQO1G.e1G.eOOQO'#Cf'#CfO!ZQPO'#CgO!|QPO'#CiOOQO'#Cl'#ClO#RQPO'#CnO#ZQPO'#CsOOQO'#DV'#DVOOQO1G.i1G.iO!ZQPO1G/OO#cQPO1G/ROOQO,59R,59ROOQO,59T,59TO#hQPO'#DOO#sQPO'#DWOOQO,59Y,59YO#xQPO,59YO#}QPO'#DPO$YQPO'#DYOOQO,59_,59_O$_QPO,59_OOQO7+$j7+$jO$dQPO7+$mO$lQPO'#CpOOQO,59j,59jO$qQPO,59rOOQO-E6|-E6|OOQO1G.t1G.tO$|QPO'#CuOOQO,59k,59kO%UQPO,59tOOQO-E6}-E6}OOQO1G.y1G.yO%aQPO<<HXO!ZQPO<<HXO!ZQPO,59[P%fQPO'#DOO!ZQPO,59aP%nQPO'#DPOOQOAN=sAN=sO%vQPOAN=sOOQO1G.v1G.vOOQO1G.{1G.{O%{QPOG23_OOQOLD(yLD(y",
    stateData: "&T~OvOSPOS~OSPOWQOmROpSO{UO~OxXO~OxZO~O_]O~O_^O~O{_O~OUaO~O[cO^dO_eOahOcfOhgOxbO~OnjO~OnkO~O_mO~OfpO{nO~OktO{rO~O_wO~O_xOfzX{rX~O{zO~Of|O~O_}Ok|X{sX~O{!PO~Ok!RO~O}!SO!O!TO~Oe!UO~O_xOfza{rX~Oj!WO{iX~O_}Ok|a{sX~O_!YO~O_xO{rX~O_}O{sX~O!P!^O~O_!_O~O_x~",
    goto: "#l}PPP!OP!SP!OP!V!Y!YP!YPP!YP!YP!bPP!YP!gPP!OPP!OP!l!r!xPPP#OP#S#fP#iTTOWRYPR[Q]h[cj!T!U!WVynz!VV!Or!P!XQWOR`WQofR{oQsgR!QsTVOWQi[QlcQvjQ!Z!TQ![!UR!]!WRqfRug",
    nodeNames: "\u26A0 Comment Schema Namespace namespace NamespaceName NamespaceURI Type type TypeName Variable Optional Nullable Reference Pointer Term Literal URI Product OpenBrace Component RightArrow CloseBrace Coproduct OpenBracket Option LeftArrow CloseBracket Class class Export Edge edge",
    maxTerm: 47,
    nodeProps: [
      [NodeProp.group, -7, 10, 11, 13, 16, 17, 18, 23, "Expression"]
    ],
    skippedNodes: [0, 1],
    repeatNodeCount: 3,
    tokenData: "'9n~RaXY!WYZ!cpq!Wst!hz{!s}!O!x!P!Q#T![!]#f!^!_#q!_!`$.c!a!b$.v!c!}$.{!}#O'9Y#P#Q'9_#T#o$.{#o#p'9d#q#r'9i~!]Qv~XY!Wpq!W~!hO{~~!mQP~OY!hZ~!h~!xO^~~!{P!`!a#O~#TOe~~#WP!_!`#Z~#^P!`!a#a~#fO!P~~#iP![!]#l~#qOn~~#tS}!O$Q!`!a$V!c!}$[#T#o$[~$VOj~~$[Oa~P$_V{|$[}!O$[!O!P$[!Q![$[![!]$t!c!}$[#T#o$[P$wfqr&]tu&]uv*Zvw&]wx&]xy&]yz&]z{&]{|&]|}&]}!O&]!O!P&]!P!Q*s!Q![&]![!]&]!]!^&]!_!`&]!b!c&]!c!}&]#R#S&]#T#o&]#r#s&]P&`iqr&]st'}tu&]uv*Zvw&]wx&]xy&]yz&]z{&]{|&]|}&]}!O&]!O!P&]!P!Q&]!Q![&]![!]&]!]!^&]!_!`&]!`!a*U!a!b&]!b!c&]!c!}&]#R#S&]#T#o&]#r#s&]P(Qhqr'}tu'}uv)lvw'}wx'}xy'}yz'}z{'}{|'}|}'}}!O'}!O!P'}!P!Q'}!Q!['}![!]'}!]!^'}!_!`'}!`!a*U!a!b'}!b!c'}!c!}'}#R#S'}#T#o'}#r#s'}P)oR!Q![)x!c!i)x#T#Z)xP){R!Q!['}!c!i'}#T#Z'}P*ZO_PP*^R!Q![*g!c!i*g#T#Z*gP*jR!Q![&]!c!i&]#T#Z&]P*vfqr&]tu&]uv*Zvw&]wx&]xy&]yz&]z{&]{|&]|}&]}!O&]!O!P&]!P!Q,[!Q![&]![!]&]!]!^&]!_!`&]!b!c&]!c!}&]#R#S&]#T#o&]#r#s&]P,_mqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q!R#9U!R!S#9U!S!T$*v!T![$'d![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y!}#O!,a#R#S.Y#T#o.Y#r#s.YP.]iqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP/}R!Q![0W!c!i0W#T#Z0WP0ZR!Q![.Y!c!i.Y#T#Z.YP0geqr1xtu1xuv3^vw1xwx1xxy1xyz1xz{1x{|1x|}1x}!O1x!O!P1x!Q![#7d![!]1x!]!^1x!_!`1x!b!c3v!c!}1x#R#S1x#T#o1x#r#s1xP1{eqr1xtu1xuv3^vw1xwx1xxy1xyz1xz{1x{|1x|}1x}!O1x!O!P1x!Q![1x![!]1x!]!^1x!_!`1x!b!c3v!c!}1x#R#S1x#T#o1x#r#s1xP3aR!Q![3j!c!i3j#T#Z3jP3mR!Q![1x!c!i1x#T#Z1xP3ylqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q!R8b!R!S8b!S!T!(z!T![!%n![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q!}#O!,a#R#S5q#T#o5q#r#s5qP5thqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP7cR!Q![7l!c!i7l#T#Z7lP7oR!Q![5q!c!i5q#T#Z5qP7{P!Q![8OP8RTst'}!P!Q&]!Q![8O!`!a*U!a!b&]P8ehqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P:P!P!Q&]!Q![!%n![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP:Skqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q!R;w!R!S;w!S!T!!X!T![L{![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP;zhqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P=f!P!Q&]!Q![L{![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP=ikqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q!R?^!R!S?^!S!TIf!T![FY![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP?ahqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P@{!P!Q&]!Q![FY![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPAOkqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q!R5q!R!S5q!S!TBs!T![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPBvjqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q!V5q!V!WDh!W![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPDkiqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P5q!P!Q&]!Q!W5q!W![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPF]hqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P@{!P!Q&]!Q![Gw![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPGzhqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P@{!P!Q&]!Q![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPIijqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P@{!P!Q&]!Q!VFY!V!WKZ!W![Gw![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPK^iqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P@{!P!Q&]!Q!WGw!W![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPMOhqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P=f!P!Q&]!Q![Nj![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qPNmhqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P=f!P!Q&]!Q![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!![jqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P=f!P!Q&]!Q!VL{!V!W!#|!W![Nj![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!$Piqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P=f!P!Q&]!Q!WNj!W![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!%qhqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P:P!P!Q&]!Q![!']![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!'`hqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P:P!P!Q&]!Q![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!(}jqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P:P!P!Q&]!Q!V!%n!V!W!*o!W![!']![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!*riqr5qst'}tu5quv7`vw5qwx5qxy5qyz5qz{5q{|5q|}5q}!O5q!O!P:P!P!Q&]!Q!W!']!W![5q![!]7x!]!^5q!_!`5q!`!a*U!a!b&]!c!}5q#R#S5q#T#o5q#r#s5qP!,dU!Q![!,v![!]#.^!c!i!,v!x!y#4W#T#Z!,v#j#k#4WP!,yS!Q![!-V![!]!-{!c!i!-V#T#Z!-VP!-YS!Q![!-f![!]!-{!c!i!-f#T#Z!-fP!-iS!Q![!-u![!]!-{!c!i!-u#T#Z!-uP!-xP![!]!-{P!.OS!Q![!.[![!]#(j!c!i!.[#T#Z!.[P!._S!Q![!.k![!]!/a!c!i!.k#T#Z!.kP!.nS!Q![!.z![!]!/a!c!i!.z#T#Z!.zP!.}S!Q![!/Z![!]!/a!c!i!/Z#T#Z!/ZP!/^P![!]!/aP!/dS!Q![!/p![!]#!v!c!i!/p#T#Z!/pP!/sS!Q![!0P![!]!0u!c!i!0P#T#Z!0PP!0SS!Q![!0`![!]!0u!c!i!0`#T#Z!0`P!0cS!Q![!0o![!]!0u!c!i!0o#T#Z!0oP!0rP![!]!0uP!0xS!Q![!1U![!]!KS!c!i!1U#T#Z!1UP!1XS!Q![!1e![!]!2Z!c!i!1e#T#Z!1eP!1hS!Q![!1t![!]!2Z!c!i!1t#T#Z!1tP!1wS!Q![!2T![!]!2Z!c!i!2T#T#Z!2TP!2WP![!]!2ZP!2^S!Q![!2j![!]!E`!c!i!2j#T#Z!2jP!2mS!Q![!2y![!]!3o!c!i!2y#T#Z!2yP!2|S!Q![!3Y![!]!3o!c!i!3Y#T#Z!3YP!3]S!Q![!3i![!]!3o!c!i!3i#T#Z!3iP!3lP![!]!3oP!3rS!Q![!4O![!]!?u!c!i!4O#T#Z!4OP!4RS!Q![!4_![!]!5T!c!i!4_#T#Z!4_P!4bS!Q![!4n![!]!5T!c!i!4n#T#Z!4nP!4qS!Q![!4}![!]!5T!c!i!4}#T#Z!4}P!5QP![!]!5TP!5WV!Q!R!5m!R!S!5m!S!T!=b!T![!>s![!]!?V!c!i!?f#T#Z!?fP!5pT!O!P!6P!Q![!:h![!]!;d!c!i!=R#T#Z!=RP!6SS!Q!R!6`!R!S!6`!S!T!:O!T![!9oP!6cQ!O!P!6i!Q![!9oP!6lS!Q!R!6x!R!S!6x!S!T!9V!T![!8vP!6{Q!O!P!7R!Q![!8vP!7US!Q!R!7b!R!S!7b!S!T!8^!T![!7kP!7eQ!Q![!7k#P#Q!7zP!7nQ!Q![!7t#P#Q!7zP!7wP#P#Q!7zP!7}Tst'}!P!Q&]![!]7x!`!a*U!a!b&]P!8aS!Q!V!7k!V!W!8m!W![!7t#P#Q!7zP!8pQ!Q!W!7t#P#Q!7zP!8yQ!O!P!7R!Q![!9PP!9SP!O!P!7RP!9YS!O!P!7R!Q!V!8v!V!W!9f!W![!9PP!9iQ!O!P!7R!Q!W!9PP!9rQ!O!P!6i!Q![!9xP!9{P!O!P!6iP!:RS!O!P!6i!Q!V!9o!V!W!:_!W![!9xP!:bQ!O!P!6i!Q!W!9xP!:kT!O!P!6P!Q![!:z![!]!;d!c!i!<r#T#Z!<rP!:}T!O!P!6P!Q![!;^![!]!;d!c!i!;^#T#Z!;^P!;aP![!]!;dP!;gS!Q![!;s![!]!7t!c!i!;s#T#Z!;sP!;vS!Q![!<S!c!i!<S#P#Q!7z#T#Z!<SP!<VS!Q![!<c!c!i!<c#P#Q!7z#T#Z!<cP!<fS!Q![!7t!c!i!7t#P#Q!7z#T#Z!7tP!<uS!Q![!;^![!]!;d!c!i!;^#T#Z!;^P!=US!Q![!<r![!]!;d!c!i!<r#T#Z!<rP!=eV!O!P!6P!Q!V!:h!V!W!=z!W![!>a![!]!;d!c!i!=R#T#Z!=RP!=}U!O!P!6P!Q!W!:z!W![!<r![!]!;d!c!i!<r#T#Z!<rP!>dT!O!P!6P!Q![!<r![!]!;d!c!i!<r#T#Z!<rP!>vT!O!P!6P!Q![!>a![!]!;d!c!i!=R#T#Z!=RP!?YS!Q![!;s!c!i!;s#P#Q!7z#T#Z!;sP!?iS!Q![!=R![!]!;d!c!i!=R#T#Z!=RP!?xV!Q!R!@_!R!S!@_!S!T!B{!T![!Dg!c!i!D|#P#Q!7z#T#Z!D|P!@bU!O!P!6P!Q![!@t![!]!Ay!c!i!Bi#P#Q!7z#T#Z!BiP!@wU!O!P!6P!Q![!AZ![!]!Ay!c!i!BV#P#Q!7z#T#Z!BVP!A^U!O!P!6P!Q![!Ap![!]!Ay!c!i!Ap#P#Q!7z#T#Z!ApP!AsQ![!]!Ay#P#Q!7zP!A|R!Q![!;s!c!i!;s#T#Z!;sP!BYT!Q![!Ap![!]!Ay!c!i!Ap#P#Q!7z#T#Z!ApP!BlT!Q![!BV![!]!Ay!c!i!BV#P#Q!7z#T#Z!BVP!COW!O!P!6P!Q!V!@t!V!W!Ch!W![!DQ![!]!Ay!c!i!Bi#P#Q!7z#T#Z!BiP!CkV!O!P!6P!Q!W!AZ!W![!BV![!]!Ay!c!i!BV#P#Q!7z#T#Z!BVP!DTU!O!P!6P!Q![!BV![!]!Ay!c!i!BV#P#Q!7z#T#Z!BVP!DjU!O!P!6P!Q![!DQ![!]!Ay!c!i!Bi#P#Q!7z#T#Z!BiP!EPT!Q![!Bi![!]!Ay!c!i!Bi#P#Q!7z#T#Z!BiP!EcV!Q!R!Ex!R!S!Ex!S!T!Ho!T![!JZ!c!i!Jp#P#Q!7z#T#Z!JpP!E{U!O!P!6P!Q![!F_![!]!Gd!c!i!H]#P#Q!7z#T#Z!H]P!FbU!O!P!6P!Q![!Ft![!]!Gd!c!i!Gy#P#Q!7z#T#Z!GyP!FwU!O!P!6P!Q![!GZ![!]!Gd!c!i!GZ#P#Q!7z#T#Z!GZP!G^Q![!]!Gd#P#Q!7zP!GgU!Q!R!@_!R!S!@_!S!T!B{!T![!Dg!c!i!D|#T#Z!D|P!G|T!Q![!GZ![!]!Gd!c!i!GZ#P#Q!7z#T#Z!GZP!H`T!Q![!Gy![!]!Gd!c!i!Gy#P#Q!7z#T#Z!GyP!HrW!O!P!6P!Q!V!F_!V!W!I[!W![!It![!]!Gd!c!i!H]#P#Q!7z#T#Z!H]P!I_V!O!P!6P!Q!W!Ft!W![!Gy![!]!Gd!c!i!Gy#P#Q!7z#T#Z!GyP!IwU!O!P!6P!Q![!Gy![!]!Gd!c!i!Gy#P#Q!7z#T#Z!GyP!J^U!O!P!6P!Q![!It![!]!Gd!c!i!H]#P#Q!7z#T#Z!H]P!JsT!Q![!H]![!]!Gd!c!i!H]#P#Q!7z#T#Z!H]P!KVV!Q!R!Kl!R!S!Kl!S!T!Nc!T![# }!c!i#!d#P#Q!7z#T#Z#!dP!KoU!O!P!6P!Q![!LR![!]!MW!c!i!NP#P#Q!7z#T#Z!NPP!LUU!O!P!6P!Q![!Lh![!]!MW!c!i!Mm#P#Q!7z#T#Z!MmP!LkU!O!P!6P!Q![!L}![!]!MW!c!i!L}#P#Q!7z#T#Z!L}P!MQQ![!]!MW#P#Q!7zP!MZU!Q!R!Ex!R!S!Ex!S!T!Ho!T![!JZ!c!i!Jp#T#Z!JpP!MpT!Q![!L}![!]!MW!c!i!L}#P#Q!7z#T#Z!L}P!NST!Q![!Mm![!]!MW!c!i!Mm#P#Q!7z#T#Z!MmP!NfW!O!P!6P!Q!V!LR!V!W# O!W![# h![!]!MW!c!i!NP#P#Q!7z#T#Z!NPP# RV!O!P!6P!Q!W!Lh!W![!Mm![!]!MW!c!i!Mm#P#Q!7z#T#Z!MmP# kU!O!P!6P!Q![!Mm![!]!MW!c!i!Mm#P#Q!7z#T#Z!MmP#!QU!O!P!6P!Q![# h![!]!MW!c!i!NP#P#Q!7z#T#Z!NPP#!gT!Q![!NP![!]!MW!c!i!NP#P#Q!7z#T#Z!NPP#!yV!Q!R##`!R!S##`!S!T#&V!T![#'q!c!i#(W#P#Q!7z#T#Z#(WP##cU!O!P!6P!Q![##u![!]#$z!c!i#%s#P#Q!7z#T#Z#%sP##xU!O!P!6P!Q![#$[![!]#$z!c!i#%a#P#Q!7z#T#Z#%aP#$_U!O!P!6P!Q![#$q![!]#$z!c!i#$q#P#Q!7z#T#Z#$qP#$tQ![!]#$z#P#Q!7zP#$}U!Q!R!Kl!R!S!Kl!S!T!Nc!T![# }!c!i#!d#T#Z#!dP#%dT!Q![#$q![!]#$z!c!i#$q#P#Q!7z#T#Z#$qP#%vT!Q![#%a![!]#$z!c!i#%a#P#Q!7z#T#Z#%aP#&YW!O!P!6P!Q!V##u!V!W#&r!W![#'[![!]#$z!c!i#%s#P#Q!7z#T#Z#%sP#&uV!O!P!6P!Q!W#$[!W![#%a![!]#$z!c!i#%a#P#Q!7z#T#Z#%aP#'_U!O!P!6P!Q![#%a![!]#$z!c!i#%a#P#Q!7z#T#Z#%aP#'tU!O!P!6P!Q![#'[![!]#$z!c!i#%s#P#Q!7z#T#Z#%sP#(ZT!Q![#%s![!]#$z!c!i#%s#P#Q!7z#T#Z#%sP#(mV!Q!R#)S!R!S#)S!S!T#+y!T![#-e!c!i#-z#P#Q!7z#T#Z#-zP#)VU!O!P!6P!Q![#)i![!]#*n!c!i#+g#P#Q!7z#T#Z#+gP#)lU!O!P!6P!Q![#*O![!]#*n!c!i#+T#P#Q!7z#T#Z#+TP#*RU!O!P!6P!Q![#*e![!]#*n!c!i#*e#P#Q!7z#T#Z#*eP#*hQ![!]#*n#P#Q!7zP#*qU!Q!R##`!R!S##`!S!T#&V!T![#'q!c!i#(W#T#Z#(WP#+WT!Q![#*e![!]#*n!c!i#*e#P#Q!7z#T#Z#*eP#+jT!Q![#+T![!]#*n!c!i#+T#P#Q!7z#T#Z#+TP#+|W!O!P!6P!Q!V#)i!V!W#,f!W![#-O![!]#*n!c!i#+g#P#Q!7z#T#Z#+gP#,iV!O!P!6P!Q!W#*O!W![#+T![!]#*n!c!i#+T#P#Q!7z#T#Z#+TP#-RU!O!P!6P!Q![#+T![!]#*n!c!i#+T#P#Q!7z#T#Z#+TP#-hU!O!P!6P!Q![#-O![!]#*n!c!i#+g#P#Q!7z#T#Z#+gP#-}T!Q![#+g![!]#*n!c!i#+g#P#Q!7z#T#Z#+gP#.aP![!]#.dP#.gV!Q!R#.|!R!S#.|!S!T#1s!T![#3_!c!i#3t#P#Q!7z#T#Z#3tP#/PU!O!P!6P!Q![#/c![!]#0h!c!i#1a#P#Q!7z#T#Z#1aP#/fU!O!P!6P!Q![#/x![!]#0h!c!i#0}#P#Q!7z#T#Z#0}P#/{U!O!P!6P!Q![#0_![!]#0h!c!i#0_#P#Q!7z#T#Z#0_P#0bQ![!]#0h#P#Q!7zP#0kU!Q!R#)S!R!S#)S!S!T#+y!T![#-e!c!i#-z#T#Z#-zP#1QT!Q![#0_![!]#0h!c!i#0_#P#Q!7z#T#Z#0_P#1dT!Q![#0}![!]#0h!c!i#0}#P#Q!7z#T#Z#0}P#1vW!O!P!6P!Q!V#/c!V!W#2`!W![#2x![!]#0h!c!i#1a#P#Q!7z#T#Z#1aP#2cV!O!P!6P!Q!W#/x!W![#0}![!]#0h!c!i#0}#P#Q!7z#T#Z#0}P#2{U!O!P!6P!Q![#0}![!]#0h!c!i#0}#P#Q!7z#T#Z#0}P#3bU!O!P!6P!Q![#2x![!]#0h!c!i#1a#P#Q!7z#T#Z#1aP#3wT!Q![#1a![!]#0h!c!i#1a#P#Q!7z#T#Z#1aP#4ZR!Q![#4d!c!i#4d#T#Z#4dP#4gS!O!P#4s!Q![#4d!c!i#4d#T#Z#4dP#4vcqr#6Rtu#6Rvw#6Rwx#6Rxy#6Ryz#6Rz{#6R{|#6R|}#6R}!O#6R!O!P#6R!Q![#6R![!]#6R!]!^#6R!_!`#6R!c!}#6R#R#S#6R#T#o#6R#r#s#6RP#6Udqr#6Rtu#6Rvw#6Rwx#6Rxy#6Ryz#6Rz{#6R{|#6R|}#6R}!O#6R!O!P#6R!Q![#6R![!]#6R!]!^#6R!_!`#6R!c!}#6R#P#Q!7z#R#S#6R#T#o#6R#r#s#6RP#7giqr1xst'}tu1xuv3^vw1xwx1xxy1xyz1xz{1x{|1x|}1x}!O1x!O!P1x!P!Q&]!Q![#7d![!]1x!]!^1x!_!`1x!`!a*U!a!b&]!b!c3v!c!}1x#R#S1x#T#o1x#r#s1xP#9Xiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#:v!P!Q&]!Q![$'d![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#:ylqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q!R#<q!R!S#<q!S!T$#w!T![#Ne![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#<tiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#>c!P!Q&]!Q![#Ne![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#>flqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q!R#@^!R!S#@^!S!T#Jx!T![#Gf![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#@aiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#BO!P!Q&]!Q![#Gf![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#BRlqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q!R.Y!R!S.Y!S!T#Cy!T![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#C|kqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q!V.Y!V!W#Eq!W![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#Etjqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P.Y!P!Q&]!Q!W.Y!W![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#Giiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#BO!P!Q&]!Q![#IW![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#IZiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#BO!P!Q&]!Q![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#J{kqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#BO!P!Q&]!Q!V#Gf!V!W#Lp!W![#IW![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#Lsjqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#BO!P!Q&]!Q!W#IW!W![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP#Nhiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#>c!P!Q&]!Q![$!V![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$!Yiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#>c!P!Q&]!Q![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$#zkqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#>c!P!Q&]!Q!V#Ne!V!W$%o!W![$!V![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$%rjqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#>c!P!Q&]!Q!W$!V!W![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$'giqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#:v!P!Q&]!Q![$)U![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$)Xiqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#:v!P!Q&]!Q![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$*ykqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#:v!P!Q&]!Q!V$'d!V!W$,n!W![$)U![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.YP$,qjqr.Yst'}tu.Yuv/zvw.Ywx.Yxy.Yyz.Yz{.Y{|.Y|}.Y}!O.Y!O!P#:v!P!Q&]!Q!W$)U!W![.Y![!]0d!]!^.Y!_!`.Y!`!a*U!a!b&]!b!c3v!c!}.Y#R#S.Y#T#o.Y#r#s.Y~$.fQ!P!Q$.l!`!a$.q~$.qO!O~~$.vO}~~$.{O[~R$/QVxP{|$/g}!O$/g!O!P$/g!Q![$.{![!]'6Q!c!}$.{#T#o$.{Q$/jV{|$/g}!O$/g!O!P$/g!Q![$/g![!]$0P!c!}$/g#T#o$/gQ$0Sfqr$1htu$1huv$3[vw$1hwx$1hxy$1hyz$1hz{$1h{|$1h|}$1h}!O$1h!O!P$1h!P!Q$5e!Q![$1h![!]$1h!]!^$1h!_!`$1h!b!c$1h!c!}$1h#R#S$1h#T#o$1h#r#s$1hQ$1khqr$1hst$3Vtu$1huv$3[vw$1hwx$1hxy$1hyz$1hz{$1h{|$1h|}$1h}!O$1h!O!P$1h!P!Q$3t!Q![$1h![!]$1h!]!^$1h!_!`$1h!a!b$3V!b!c$1h!c!}$1h#R#S$1h#T#o$1h#r#s$1hQ$3[OUQQ$3_R!Q![$3h!c!i$3h#T#Z$3hQ$3kR!Q![$1h!c!i$1h#T#Z$1hQ$3yhUQqr$1hst$3Vtu$1huv$3[vw$1hwx$1hxy$1hyz$1hz{$1h{|$1h|}$1h}!O$1h!O!P$1h!P!Q$3t!Q![$1h![!]$1h!]!^$1h!_!`$1h!a!b$3V!b!c$1h!c!}$1h#R#S$1h#T#o$1h#r#s$1hQ$5hfqr$1htu$1huv$3[vw$1hwx$1hxy$1hyz$1hz{$1h{|$1h|}$1h}!O$1h!O!P$1h!P!Q$6|!Q![$1h![!]$1h!]!^$1h!_!`$1h!b!c$1h!c!}$1h#R#S$1h#T#o$1h#r#s$1hQ$7Plqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q!R&BR!R!S&BR!S!T'2k!T!['/_![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w!}#O%5d#R#S$8w#T#o$8w#r#s$8wQ$8zhqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ$:iR!Q![$:r!c!i$:r#T#Z$:rQ$:uR!Q![$8w!c!i$8w#T#Z$8wQ$;Reqr$<dtu$<duv$=xvw$<dwx$<dxy$<dyz$<dz{$<d{|$<d|}$<d}!O$<d!O!P$<d!Q![&@d![!]$<d!]!^$<d!_!`$<d!b!c$>b!c!}$<d#R#S$<d#T#o$<d#r#s$<dQ$<geqr$<dtu$<duv$=xvw$<dwx$<dxy$<dyz$<dz{$<d{|$<d|}$<d}!O$<d!O!P$<d!Q![$<d![!]$<d!]!^$<d!_!`$<d!b!c$>b!c!}$<d#R#S$<d#T#o$<d#r#s$<dQ$={R!Q![$>U!c!i$>U#T#Z$>UQ$>XR!Q![$<d!c!i$<d#T#Z$<dQ$>ekqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q!R$Bs!R!S$Bs!S!T%2T!T![%.}![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y!}#O%5d#R#S$@Y#T#o$@Y#r#s$@YQ$@]gqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$AwR!Q![$BQ!c!i$BQ#T#Z$BQQ$BTR!Q![$@Y!c!i$@Y#T#Z$@YQ$BaP!Q![$BdQ$BgSst$3V!P!Q$3t!Q![$Bd!a!b$3VQ$Bvgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$D_!P!Q$3t!Q![%.}![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$Dbjqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q!R$FS!R!S$FS!S!T%+n!T![%(h![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$FVgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$Gn!P!Q$3t!Q![%(h![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$Gqjqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q!R$Ic!R!S$Ic!S!T%%X!T![%!R![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$Ifgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$J}!P!Q$3t!Q![%!R![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$KQjqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q!R$@Y!R!S$@Y!S!T$Lr!T![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$Luiqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q!V$@Y!V!W$Nd!W![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ$Nghqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$@Y!P!Q$3t!Q!W$@Y!W![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%!Ugqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$J}!P!Q$3t!Q![%#m![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%#pgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$J}!P!Q$3t!Q![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%%[iqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$J}!P!Q$3t!Q!V%!R!V!W%&y!W![%#m![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%&|hqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$J}!P!Q$3t!Q!W%#m!W![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%(kgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$Gn!P!Q$3t!Q![%*S![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%*Vgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$Gn!P!Q$3t!Q![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%+qiqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$Gn!P!Q$3t!Q!V%(h!V!W%-`!W![%*S![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%-chqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$Gn!P!Q$3t!Q!W%*S!W![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%/Qgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$D_!P!Q$3t!Q![%0i![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%0lgqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$D_!P!Q$3t!Q![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%2Wiqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$D_!P!Q$3t!Q!V%.}!V!W%3u!W![%0i![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%3xhqr$@Yst$3Vtu$@Yuv$Atvw$@Ywx$@Yxy$@Yyz$@Yz{$@Y{|$@Y|}$@Y}!O$@Y!O!P$D_!P!Q$3t!Q!W%0i!W![$@Y![!]$B^!]!^$@Y!_!`$@Y!a!b$3V!c!}$@Y#R#S$@Y#T#o$@Y#r#s$@YQ%5gU!Q![%5y![!]&7^!c!i%5y!x!y&=W#T#Z%5y#j#k&=WQ%5|S!Q![%6Y![!]%7O!c!i%6Y#T#Z%6YQ%6]S!Q![%6i![!]%7O!c!i%6i#T#Z%6iQ%6lS!Q![%6x![!]%7O!c!i%6x#T#Z%6xQ%6{P![!]%7OQ%7RS!Q![%7_![!]&1j!c!i%7_#T#Z%7_Q%7bS!Q![%7n![!]%8d!c!i%7n#T#Z%7nQ%7qS!Q![%7}![!]%8d!c!i%7}#T#Z%7}Q%8QS!Q![%8^![!]%8d!c!i%8^#T#Z%8^Q%8aP![!]%8dQ%8gS!Q![%8s![!]&+v!c!i%8s#T#Z%8sQ%8vS!Q![%9S![!]%9x!c!i%9S#T#Z%9SQ%9VS!Q![%9c![!]%9x!c!i%9c#T#Z%9cQ%9fS!Q![%9r![!]%9x!c!i%9r#T#Z%9rQ%9uP![!]%9xQ%9{S!Q![%:X![!]&&S!c!i%:X#T#Z%:XQ%:[S!Q![%:h![!]%;^!c!i%:h#T#Z%:hQ%:kS!Q![%:w![!]%;^!c!i%:w#T#Z%:wQ%:zS!Q![%;W![!]%;^!c!i%;W#T#Z%;WQ%;ZP![!]%;^Q%;aS!Q![%;m![!]%N`!c!i%;m#T#Z%;mQ%;pS!Q![%;|![!]%<r!c!i%;|#T#Z%;|Q%<PS!Q![%<]![!]%<r!c!i%<]#T#Z%<]Q%<`S!Q![%<l![!]%<r!c!i%<l#T#Z%<lQ%<oP![!]%<rQ%<uS!Q![%=R![!]%Hu!c!i%=R#T#Z%=RQ%=US!Q![%=b![!]%>W!c!i%=b#T#Z%=bQ%=eS!Q![%=q![!]%>W!c!i%=q#T#Z%=qQ%=tS!Q![%>Q![!]%>W!c!i%>Q#T#Z%>QQ%>TP![!]%>WQ%>ZV!Q!R%>p!R!S%>p!S!T%Fb!T![%Gs![!]%HV!c!i%Hf#T#Z%HfQ%>sT!O!P%?S!Q![%Ch![!]%Dd!c!i%FR#T#Z%FRQ%?VS!Q!R%?c!R!S%?c!S!T%CO!T![%BoQ%?fQ!O!P%?l!Q![%BoQ%?oS!Q!R%?{!R!S%?{!S!T%BV!T![%AvQ%@OQ!O!P%@U!Q![%AvQ%@XS!Q!R%@e!R!S%@e!S!T%A^!T![%@nQ%@hQ!Q![%@n#P#Q%@}Q%@qQ!Q![%@w#P#Q%@}Q%@zP#P#Q%@}Q%AQSst$3V!P!Q$3t![!]$B^!a!b$3VQ%AaS!Q!V%@n!V!W%Am!W![%@w#P#Q%@}Q%ApQ!Q!W%@w#P#Q%@}Q%AyQ!O!P%@U!Q![%BPQ%BSP!O!P%@UQ%BYS!O!P%@U!Q!V%Av!V!W%Bf!W![%BPQ%BiQ!O!P%@U!Q!W%BPQ%BrQ!O!P%?l!Q![%BxQ%B{P!O!P%?lQ%CRS!O!P%?l!Q!V%Bo!V!W%C_!W![%BxQ%CbQ!O!P%?l!Q!W%BxQ%CkT!O!P%?S!Q![%Cz![!]%Dd!c!i%Er#T#Z%ErQ%C}T!O!P%?S!Q![%D^![!]%Dd!c!i%D^#T#Z%D^Q%DaP![!]%DdQ%DgS!Q![%Ds![!]%@w!c!i%Ds#T#Z%DsQ%DvS!Q![%ES!c!i%ES#P#Q%@}#T#Z%ESQ%EVS!Q![%Ec!c!i%Ec#P#Q%@}#T#Z%EcQ%EfS!Q![%@w!c!i%@w#P#Q%@}#T#Z%@wQ%EuS!Q![%D^![!]%Dd!c!i%D^#T#Z%D^Q%FUS!Q![%Er![!]%Dd!c!i%Er#T#Z%ErQ%FeV!O!P%?S!Q!V%Ch!V!W%Fz!W![%Ga![!]%Dd!c!i%FR#T#Z%FRQ%F}U!O!P%?S!Q!W%Cz!W![%Er![!]%Dd!c!i%Er#T#Z%ErQ%GdT!O!P%?S!Q![%Er![!]%Dd!c!i%Er#T#Z%ErQ%GvT!O!P%?S!Q![%Ga![!]%Dd!c!i%FR#T#Z%FRQ%HYS!Q![%Ds!c!i%Ds#P#Q%@}#T#Z%DsQ%HiS!Q![%FR![!]%Dd!c!i%FR#T#Z%FRQ%HxV!Q!R%I_!R!S%I_!S!T%K{!T![%Mg!c!i%M|#P#Q%@}#T#Z%M|Q%IbU!O!P%?S!Q![%It![!]%Jy!c!i%Ki#P#Q%@}#T#Z%KiQ%IwU!O!P%?S!Q![%JZ![!]%Jy!c!i%KV#P#Q%@}#T#Z%KVQ%J^U!O!P%?S!Q![%Jp![!]%Jy!c!i%Jp#P#Q%@}#T#Z%JpQ%JsQ![!]%Jy#P#Q%@}Q%J|R!Q![%Ds!c!i%Ds#T#Z%DsQ%KYT!Q![%Jp![!]%Jy!c!i%Jp#P#Q%@}#T#Z%JpQ%KlT!Q![%KV![!]%Jy!c!i%KV#P#Q%@}#T#Z%KVQ%LOW!O!P%?S!Q!V%It!V!W%Lh!W![%MQ![!]%Jy!c!i%Ki#P#Q%@}#T#Z%KiQ%LkV!O!P%?S!Q!W%JZ!W![%KV![!]%Jy!c!i%KV#P#Q%@}#T#Z%KVQ%MTU!O!P%?S!Q![%KV![!]%Jy!c!i%KV#P#Q%@}#T#Z%KVQ%MjU!O!P%?S!Q![%MQ![!]%Jy!c!i%Ki#P#Q%@}#T#Z%KiQ%NPT!Q![%Ki![!]%Jy!c!i%Ki#P#Q%@}#T#Z%KiQ%NcV!Q!R%Nx!R!S%Nx!S!T&#o!T![&%Z!c!i&%p#P#Q%@}#T#Z&%pQ%N{U!O!P%?S!Q![& _![!]&!d!c!i&#]#P#Q%@}#T#Z&#]Q& bU!O!P%?S!Q![& t![!]&!d!c!i&!y#P#Q%@}#T#Z&!yQ& wU!O!P%?S!Q![&!Z![!]&!d!c!i&!Z#P#Q%@}#T#Z&!ZQ&!^Q![!]&!d#P#Q%@}Q&!gU!Q!R%I_!R!S%I_!S!T%K{!T![%Mg!c!i%M|#T#Z%M|Q&!|T!Q![&!Z![!]&!d!c!i&!Z#P#Q%@}#T#Z&!ZQ&#`T!Q![&!y![!]&!d!c!i&!y#P#Q%@}#T#Z&!yQ&#rW!O!P%?S!Q!V& _!V!W&$[!W![&$t![!]&!d!c!i&#]#P#Q%@}#T#Z&#]Q&$_V!O!P%?S!Q!W& t!W![&!y![!]&!d!c!i&!y#P#Q%@}#T#Z&!yQ&$wU!O!P%?S!Q![&!y![!]&!d!c!i&!y#P#Q%@}#T#Z&!yQ&%^U!O!P%?S!Q![&$t![!]&!d!c!i&#]#P#Q%@}#T#Z&#]Q&%sT!Q![&#]![!]&!d!c!i&#]#P#Q%@}#T#Z&#]Q&&VV!Q!R&&l!R!S&&l!S!T&)c!T![&*}!c!i&+d#P#Q%@}#T#Z&+dQ&&oU!O!P%?S!Q![&'R![!]&(W!c!i&)P#P#Q%@}#T#Z&)PQ&'UU!O!P%?S!Q![&'h![!]&(W!c!i&(m#P#Q%@}#T#Z&(mQ&'kU!O!P%?S!Q![&'}![!]&(W!c!i&'}#P#Q%@}#T#Z&'}Q&(QQ![!]&(W#P#Q%@}Q&(ZU!Q!R%Nx!R!S%Nx!S!T&#o!T![&%Z!c!i&%p#T#Z&%pQ&(pT!Q![&'}![!]&(W!c!i&'}#P#Q%@}#T#Z&'}Q&)ST!Q![&(m![!]&(W!c!i&(m#P#Q%@}#T#Z&(mQ&)fW!O!P%?S!Q!V&'R!V!W&*O!W![&*h![!]&(W!c!i&)P#P#Q%@}#T#Z&)PQ&*RV!O!P%?S!Q!W&'h!W![&(m![!]&(W!c!i&(m#P#Q%@}#T#Z&(mQ&*kU!O!P%?S!Q![&(m![!]&(W!c!i&(m#P#Q%@}#T#Z&(mQ&+QU!O!P%?S!Q![&*h![!]&(W!c!i&)P#P#Q%@}#T#Z&)PQ&+gT!Q![&)P![!]&(W!c!i&)P#P#Q%@}#T#Z&)PQ&+yV!Q!R&,`!R!S&,`!S!T&/V!T![&0q!c!i&1W#P#Q%@}#T#Z&1WQ&,cU!O!P%?S!Q![&,u![!]&-z!c!i&.s#P#Q%@}#T#Z&.sQ&,xU!O!P%?S!Q![&-[![!]&-z!c!i&.a#P#Q%@}#T#Z&.aQ&-_U!O!P%?S!Q![&-q![!]&-z!c!i&-q#P#Q%@}#T#Z&-qQ&-tQ![!]&-z#P#Q%@}Q&-}U!Q!R&&l!R!S&&l!S!T&)c!T![&*}!c!i&+d#T#Z&+dQ&.dT!Q![&-q![!]&-z!c!i&-q#P#Q%@}#T#Z&-qQ&.vT!Q![&.a![!]&-z!c!i&.a#P#Q%@}#T#Z&.aQ&/YW!O!P%?S!Q!V&,u!V!W&/r!W![&0[![!]&-z!c!i&.s#P#Q%@}#T#Z&.sQ&/uV!O!P%?S!Q!W&-[!W![&.a![!]&-z!c!i&.a#P#Q%@}#T#Z&.aQ&0_U!O!P%?S!Q![&.a![!]&-z!c!i&.a#P#Q%@}#T#Z&.aQ&0tU!O!P%?S!Q![&0[![!]&-z!c!i&.s#P#Q%@}#T#Z&.sQ&1ZT!Q![&.s![!]&-z!c!i&.s#P#Q%@}#T#Z&.sQ&1mV!Q!R&2S!R!S&2S!S!T&4y!T![&6e!c!i&6z#P#Q%@}#T#Z&6zQ&2VU!O!P%?S!Q![&2i![!]&3n!c!i&4g#P#Q%@}#T#Z&4gQ&2lU!O!P%?S!Q![&3O![!]&3n!c!i&4T#P#Q%@}#T#Z&4TQ&3RU!O!P%?S!Q![&3e![!]&3n!c!i&3e#P#Q%@}#T#Z&3eQ&3hQ![!]&3n#P#Q%@}Q&3qU!Q!R&,`!R!S&,`!S!T&/V!T![&0q!c!i&1W#T#Z&1WQ&4WT!Q![&3e![!]&3n!c!i&3e#P#Q%@}#T#Z&3eQ&4jT!Q![&4T![!]&3n!c!i&4T#P#Q%@}#T#Z&4TQ&4|W!O!P%?S!Q!V&2i!V!W&5f!W![&6O![!]&3n!c!i&4g#P#Q%@}#T#Z&4gQ&5iV!O!P%?S!Q!W&3O!W![&4T![!]&3n!c!i&4T#P#Q%@}#T#Z&4TQ&6RU!O!P%?S!Q![&4T![!]&3n!c!i&4T#P#Q%@}#T#Z&4TQ&6hU!O!P%?S!Q![&6O![!]&3n!c!i&4g#P#Q%@}#T#Z&4gQ&6}T!Q![&4g![!]&3n!c!i&4g#P#Q%@}#T#Z&4gQ&7aP![!]&7dQ&7gV!Q!R&7|!R!S&7|!S!T&:s!T![&<_!c!i&<t#P#Q%@}#T#Z&<tQ&8PU!O!P%?S!Q![&8c![!]&9h!c!i&:a#P#Q%@}#T#Z&:aQ&8fU!O!P%?S!Q![&8x![!]&9h!c!i&9}#P#Q%@}#T#Z&9}Q&8{U!O!P%?S!Q![&9_![!]&9h!c!i&9_#P#Q%@}#T#Z&9_Q&9bQ![!]&9h#P#Q%@}Q&9kU!Q!R&2S!R!S&2S!S!T&4y!T![&6e!c!i&6z#T#Z&6zQ&:QT!Q![&9_![!]&9h!c!i&9_#P#Q%@}#T#Z&9_Q&:dT!Q![&9}![!]&9h!c!i&9}#P#Q%@}#T#Z&9}Q&:vW!O!P%?S!Q!V&8c!V!W&;`!W![&;x![!]&9h!c!i&:a#P#Q%@}#T#Z&:aQ&;cV!O!P%?S!Q!W&8x!W![&9}![!]&9h!c!i&9}#P#Q%@}#T#Z&9}Q&;{U!O!P%?S!Q![&9}![!]&9h!c!i&9}#P#Q%@}#T#Z&9}Q&<bU!O!P%?S!Q![&;x![!]&9h!c!i&:a#P#Q%@}#T#Z&:aQ&<wT!Q![&:a![!]&9h!c!i&:a#P#Q%@}#T#Z&:aQ&=ZR!Q![&=d!c!i&=d#T#Z&=dQ&=gS!O!P&=s!Q![&=d!c!i&=d#T#Z&=dQ&=vcqr&?Rtu&?Rvw&?Rwx&?Rxy&?Ryz&?Rz{&?R{|&?R|}&?R}!O&?R!O!P&?R!Q![&?R![!]&?R!]!^&?R!_!`&?R!c!}&?R#R#S&?R#T#o&?R#r#s&?RQ&?Udqr&?Rtu&?Rvw&?Rwx&?Rxy&?Ryz&?Rz{&?R{|&?R|}&?R}!O&?R!O!P&?R!Q![&?R![!]&?R!]!^&?R!_!`&?R!c!}&?R#P#Q%@}#R#S&?R#T#o&?R#r#s&?RQ&@ghqr$<dst$3Vtu$<duv$=xvw$<dwx$<dxy$<dyz$<dz{$<d{|$<d|}$<d}!O$<d!O!P$<d!P!Q$3t!Q![&@d![!]$<d!]!^$<d!_!`$<d!a!b$3V!b!c$>b!c!}$<d#R#S$<d#T#o$<d#r#s$<dQ&BUhqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Cp!P!Q$3t!Q!['/_![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&Cskqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q!R&Eh!R!S&Eh!S!T'+x!T!['(l![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&Ekhqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&GV!P!Q$3t!Q!['(l![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&GYkqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q!R&H}!R!S&H}!S!T'%V!T![' y![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&IQhqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Jl!P!Q$3t!Q![' y![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&Jokqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q!R$8w!R!S$8w!S!T&Ld!T![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&Lgjqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q!V$8w!V!W&NX!W![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ&N[iqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P$8w!P!Q$3t!Q!W$8w!W![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ' |hqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Jl!P!Q$3t!Q!['#h![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'#khqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Jl!P!Q$3t!Q![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'%Yjqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Jl!P!Q$3t!Q!V' y!V!W'&z!W!['#h![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'&}iqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Jl!P!Q$3t!Q!W'#h!W![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'(ohqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&GV!P!Q$3t!Q!['*Z![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'*^hqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&GV!P!Q$3t!Q![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'+{jqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&GV!P!Q$3t!Q!V'(l!V!W'-m!W!['*Z![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'-piqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&GV!P!Q$3t!Q!W'*Z!W![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'/bhqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Cp!P!Q$3t!Q!['0|![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'1Phqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Cp!P!Q$3t!Q![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'2njqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Cp!P!Q$3t!Q!V'/_!V!W'4`!W!['0|![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wQ'4ciqr$8wst$3Vtu$8wuv$:fvw$8wwx$8wxy$8wyz$8wz{$8w{|$8w|}$8w}!O$8w!O!P&Cp!P!Q$3t!Q!W'0|!W![$8w![!]$;O!]!^$8w!_!`$8w!a!b$3V!b!c$>b!c!}$8w#R#S$8w#T#o$8w#r#s$8wR'6Tfqr$1htu$1huv$3[vw$1hwx$1hxy$1hyz$1hz{$1h{|$1h|}$1h}!O'7i!O!P'7i!P!Q$5e!Q!['7i![!]$1h!]!^$1h!_!`$1h!b!c$1h!c!}'7i#R#S'7i#T#o'7i#r#s'7iR'7nh_Pqr$1hst$3Vtu$1huv$3[vw$1hwx$1hxy$1hyz$1hz{$1h{|$1h|}$1h}!O'7i!O!P'7i!P!Q$3t!Q!['7i![!]$1h!]!^$1h!_!`$1h!a!b$3V!b!c$1h!c!}'7i#R#S'7i#T#o'7i#r#s'7i~'9_Oh~~'9dOk~~'9iOc~~'9nOf~",
    tokenizers: [0, 1],
    topRules: { "Schema": [0, 2] },
    specialized: [{ term: 40, get: (value2) => spec_identifier[value2] || -1 }],
    tokenPrec: 232
  });

  // ../../node_modules/@underlay/apg/lib/schema/schema.js
  var schema_exports = {};
  __export(schema_exports, {
    coproduct: () => coproduct,
    isCoproduct: () => isCoproduct,
    isLiteral: () => isLiteral,
    isProduct: () => isProduct,
    isReference: () => isReference,
    isUnit: () => isUnit,
    isUri: () => isUri,
    literal: () => literal2,
    product: () => product,
    reference: () => reference,
    schema: () => schema,
    unit: () => unit,
    uri: () => uri
  });

  // ../../node_modules/@underlay/apg/lib/utils.js
  var keyMap = new WeakMap();
  function getKeys(object) {
    if (keyMap.has(object)) {
      return keyMap.get(object);
    } else {
      const keys = Object.keys(object).sort();
      Object.freeze(keys);
      keyMap.set(object, keys);
      return keys;
    }
  }
  function getKeyIndex(object, key2) {
    if (keyMap.has(object)) {
      const index = keyMap.get(object).indexOf(key2);
      if (index === -1) {
        throw new Error(`Key not found: ${key2}`);
      }
      return index;
    } else {
      const keys = Object.keys(object).sort();
      Object.freeze(keys);
      keyMap.set(object, keys);
      const index = keys.indexOf(key2);
      if (index === -1) {
        throw new Error(`Key not found: ${key2}`);
      }
      return index;
    }
  }
  function signalInvalidType(type2) {
    console.error(type2);
    throw new Error("Invalid type");
  }

  // ../../node_modules/@underlay/apg/lib/schema/schema.js
  var schema = (labels) => Object.freeze(labels);
  var reference = (value2) => Object.freeze({ kind: "reference", value: value2 });
  var isReference = (type2) => type2.kind === "reference";
  var uri = () => Object.freeze({ kind: "uri" });
  var isUri = (type2) => type2.kind === "uri";
  var literal2 = (datatype2) => Object.freeze({ kind: "literal", datatype: datatype2 });
  var isLiteral = (type2) => type2.kind === "literal";
  var product = (components) => Object.freeze({ kind: "product", components: Object.freeze(components) });
  var isProduct = (type2) => type2.kind === "product";
  var unit = () => product({});
  var isUnit = (type2) => type2.kind === "product" && getKeys(type2.components).length === 0;
  var coproduct = (options) => Object.freeze({ kind: "coproduct", options: Object.freeze(options) });
  var isCoproduct = (type2) => type2.kind === "coproduct";

  // ../../node_modules/@underlay/apg/lib/instance/instance.js
  function fromJSON(value2) {
    if (value2.kind === "reference") {
      return Reference.fromJSON(value2);
    } else if (value2.kind === "uri") {
      return Uri.fromJSON(value2);
    } else if (value2.kind === "literal") {
      return Literal.fromJSON(value2);
    } else if (value2.kind === "product") {
      return Product.fromJSON(value2);
    } else if (value2.kind === "coproduct") {
      return Coproduct.fromJSON(value2);
    } else {
      signalInvalidType(value2);
    }
  }
  var Reference = class {
    constructor(index) {
      this.index = index;
      Object.freeze(this);
    }
    static fromJSON({ index }) {
      return new Reference(index);
    }
    get kind() {
      return "reference";
    }
    toJSON() {
      return { kind: "reference", index: this.index };
    }
  };
  var Uri = class {
    constructor(value2) {
      this.value = value2;
      Object.freeze(this);
    }
    static fromJSON({ value: value2 }) {
      return new Uri(value2);
    }
    get kind() {
      return "uri";
    }
    toJSON() {
      return { kind: "uri", value: this.value };
    }
  };
  var Literal = class {
    constructor(value2) {
      this.value = value2;
      Object.freeze(this);
    }
    static fromJSON({ value: value2 }) {
      return new Literal(value2);
    }
    get kind() {
      return "literal";
    }
    toJSON() {
      return { kind: "literal", value: this.value };
    }
  };
  var Product = class extends Array {
    static fromJSON({ components }) {
      return new Product(components.map(fromJSON));
    }
    get kind() {
      return "product";
    }
    constructor(values) {
      super(...values);
      Object.freeze(this);
    }
    toJSON() {
      return { kind: "product", components: this.map((value2) => value2.toJSON()) };
    }
    map(f) {
      const result = new Array(this.length);
      for (const [i, value2] of this.entries()) {
        result[i] = f(value2, i, this);
      }
      return result;
    }
    get(type2, key2) {
      const index = getKeyIndex(type2.components, key2);
      if (index in this) {
        return this[index];
      } else {
        throw new Error(`Index out of range: ${index}`);
      }
    }
  };
  var Coproduct = class {
    constructor(index, value2) {
      this.index = index;
      this.value = value2;
      Object.freeze(this);
    }
    static fromJSON({ index, value: value2 }) {
      return new Coproduct(index, fromJSON(value2));
    }
    get kind() {
      return "coproduct";
    }
    toJSON() {
      return { kind: "coproduct", index: this.index, value: this.value.toJSON() };
    }
    key(type2) {
      const keys = getKeys(type2.options);
      if (this.index in keys) {
        return keys[this.index];
      } else {
        throw new Error(`Index out of range: ${this.index}`);
      }
    }
    is(type2, key2) {
      return getKeyIndex(type2.options, key2) === this.index;
    }
  };

  // ../../node_modules/@underlay/apg/lib/mapping/delta.js
  var placeholder2 = new Product([]);

  // ../../node_modules/@underlay/namespaces/lib/rdf.js
  var rdf_exports = {};
  __export(rdf_exports, {
    JSON: () => JSON2,
    first: () => first,
    langString: () => langString,
    nil: () => nil,
    rest: () => rest,
    type: () => type
  });
  var type = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  var nil = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";
  var first = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";
  var rest = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";
  var langString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
  var JSON2 = "http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON";

  // ../../node_modules/@underlay/namespaces/lib/xsd.js
  var xsd_exports = {};
  __export(xsd_exports, {
    Decimal: () => Decimal,
    NCNames: () => NCNames,
    NMTOKEN: () => NMTOKEN,
    Name: () => Name,
    anyURI: () => anyURI,
    base64Binary: () => base64Binary,
    boolean: () => boolean,
    byte: () => byte,
    date: () => date,
    dateTime: () => dateTime,
    dateTimeStamp: () => dateTimeStamp,
    dayTimeDuration: () => dayTimeDuration,
    double: () => double,
    duration: () => duration,
    float: () => float,
    gDay: () => gDay,
    gMonth: () => gMonth,
    gMonthDay: () => gMonthDay,
    gYear: () => gYear,
    gYearMonth: () => gYearMonth,
    hexBinary: () => hexBinary,
    int: () => int,
    integer: () => integer,
    language: () => language2,
    long: () => long,
    nonNegativeInteger: () => nonNegativeInteger,
    nonPositiveInteger: () => nonPositiveInteger,
    normalizedString: () => normalizedString,
    positiveInteger: () => positiveInteger,
    short: () => short,
    string: () => string2,
    time: () => time,
    token: () => token,
    unsignedByte: () => unsignedByte,
    unsignedInt: () => unsignedInt,
    unsignedLong: () => unsignedLong,
    unsignedShort: () => unsignedShort,
    yearMonthDuration: () => yearMonthDuration
  });
  var string2 = "http://www.w3.org/2001/XMLSchema#string";
  var boolean = "http://www.w3.org/2001/XMLSchema#boolean";
  var Decimal = "http://www.w3.org/2001/XMLSchema#decimal";
  var integer = "http://www.w3.org/2001/XMLSchema#integer";
  var double = "http://www.w3.org/2001/XMLSchema#double";
  var float = "http://www.w3.org/2001/XMLSchema#float";
  var date = "http://www.w3.org/2001/XMLSchema#date";
  var time = "http://www.w3.org/2001/XMLSchema#time";
  var dateTime = "http://www.w3.org/2001/XMLSchema#dateTime";
  var dateTimeStamp = "http://www.w3.org/2001/XMLSchema#dateTimeStamp";
  var gYear = "http://www.w3.org/2001/XMLSchema#gYear";
  var gMonth = "http://www.w3.org/2001/XMLSchema#gMonth";
  var gDay = "http://www.w3.org/2001/XMLSchema#gDay";
  var gYearMonth = "http://www.w3.org/2001/XMLSchema#gYearMonth";
  var gMonthDay = "http://www.w3.org/2001/XMLSchema#gMonthDay";
  var duration = "http://www.w3.org/2001/XMLSchema#duration";
  var yearMonthDuration = "http://www.w3.org/2001/XMLSchema#yearMonthDuration";
  var dayTimeDuration = "http://www.w3.org/2001/XMLSchema#dayTimeDuration";
  var byte = "http://www.w3.org/2001/XMLSchema#byte";
  var short = "http://www.w3.org/2001/XMLSchema#short";
  var int = "http://www.w3.org/2001/XMLSchema#int";
  var long = "http://www.w3.org/2001/XMLSchema#long";
  var unsignedByte = "http://www.w3.org/2001/XMLSchema#unsignedByte";
  var unsignedShort = "http://www.w3.org/2001/XMLSchema#unsignedShort";
  var unsignedInt = "http://www.w3.org/2001/XMLSchema#unsignedInt";
  var unsignedLong = "http://www.w3.org/2001/XMLSchema#unsignedLong";
  var positiveInteger = "http://www.w3.org/2001/XMLSchema#positiveInteger";
  var nonNegativeInteger = "http://www.w3.org/2001/XMLSchema#nonNegativeInteger";
  var nonPositiveInteger = "http://www.w3.org/2001/XMLSchema#nonPositiveInteger";
  var hexBinary = "http://www.w3.org/2001/XMLSchema#hexBinary";
  var base64Binary = "http://www.w3.org/2001/XMLSchema#base64Binary";
  var anyURI = "http://www.w3.org/2001/XMLSchema#anyURI";
  var language2 = "http://www.w3.org/2001/XMLSchema#language";
  var normalizedString = "http://www.w3.org/2001/XMLSchema#normalizedString";
  var token = "http://www.w3.org/2001/XMLSchema#token";
  var NMTOKEN = "http://www.w3.org/2001/XMLSchema#NMTOKEN";
  var Name = "http://www.w3.org/2001/XMLSchema#Name";
  var NCNames = "http://www.w3.org/2001/XMLSchema#NCNames";

  // ../../node_modules/@underlay/namespaces/lib/ul.js
  var ul_exports = {};
  __export(ul_exports, {
    CASE: () => CASE,
    component: () => component,
    constant: () => constant,
    coproduct: () => coproduct3,
    datatype: () => datatype,
    dereference: () => dereference,
    expression: () => expression,
    head: () => head,
    identifier: () => identifier,
    identity: () => identity,
    injection: () => injection,
    key: () => key,
    label: () => label,
    literal: () => literal3,
    map: () => map,
    match: () => match,
    none: () => none3,
    option: () => option,
    path: () => path,
    product: () => product3,
    projection: () => projection,
    reference: () => reference3,
    slot: () => slot,
    some: () => some,
    source: () => source,
    tail: () => tail,
    target: () => target,
    tuple: () => tuple,
    uri: () => uri2,
    value: () => value
  });
  var label = "http://underlay.org/ns/label";
  var reference3 = "http://underlay.org/ns/reference";
  var uri2 = "http://underlay.org/ns/uri";
  var literal3 = "http://underlay.org/ns/literal";
  var datatype = "http://underlay.org/ns/datatype";
  var product3 = "http://underlay.org/ns/product";
  var coproduct3 = "http://underlay.org/ns/coproduct";
  var component = "http://underlay.org/ns/component";
  var option = "http://underlay.org/ns/option";
  var key = "http://underlay.org/ns/key";
  var value = "http://underlay.org/ns/value";
  var source = "http://underlay.org/ns/source";
  var target = "http://underlay.org/ns/target";
  var none3 = "http://underlay.org/ns/none";
  var some = "http://underlay.org/ns/some";
  var head = "http://underlay.org/ns/head";
  var tail = "http://underlay.org/ns/tail";
  var expression = "http://underlay.org/ns/expression";
  var identity = "http://underlay.org/ns/identity";
  var identifier = "http://underlay.org/ns/identifier";
  var constant = "http://underlay.org/ns/constant";
  var dereference = "http://underlay.org/ns/dereference";
  var projection = "http://underlay.org/ns/injection";
  var injection = "http://underlay.org/ns/injection";
  var tuple = "http://underlay.org/ns/tuple";
  var slot = "http://underlay.org/ns/slot";
  var match = "http://underlay.org/ns/match";
  var CASE = "http://underlay.org/ns/case";
  var path = "http://underlay.org/ns/path";
  var map = "http://underlay.org/ns/map";

  // ../tasl-lezer/src/utils.ts
  var LintError = class extends Error {
    constructor(from, to, value2, message) {
      super(message);
      this.from = from;
      this.to = to;
      this.value = value2;
    }
  };
  function parseURI(state2, node) {
    const value2 = state2.slice(node);
    const index = value2.indexOf(":");
    const prefix = value2.slice(0, index);
    if (prefix in state2.namespaces) {
      return state2.namespaces[prefix] + value2.slice(index + 1);
    } else {
      throw state2.error(node, `namespace ${prefix} is not defined`);
    }
  }

  // ../tasl-lezer/src/stdlib.ts
  var defaultTypes = {
    unit: schema_exports.product({}),
    uri: schema_exports.uri(),
    string: schema_exports.literal(xsd_exports.string),
    boolean: schema_exports.literal(xsd_exports.boolean),
    integer: schema_exports.literal(xsd_exports.integer),
    double: schema_exports.literal(xsd_exports.double),
    date: schema_exports.literal(xsd_exports.date),
    dateTime: schema_exports.literal(xsd_exports.dateTime),
    base64Binary: schema_exports.literal(xsd_exports.base64Binary),
    JSON: schema_exports.literal(rdf_exports.JSON)
  };
  var defaultNamespaces = {
    ul: "http://underlay.org/ns/",
    xsd: "http://www.w3.org/2001/XMLSchema#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  };

  // lib/syntax.js
  var syntax = LezerLanguage.define({
    parser: parser.configure({
      props: [
        indentNodeProp.add({
          Product: continuedIndent({ except: /^\s*\}/ }),
          Coproduct: continuedIndent({ except: /^\s*\]/ })
        }),
        foldNodeProp.add({
          Product(subtree) {
            return { from: subtree.from + 1, to: subtree.to - 1 };
          },
          Coproduct(subtree) {
            return { from: subtree.from + 1, to: subtree.to - 1 };
          }
        }),
        styleTags({
          Comment: tags.comment,
          TypeName: tags.typeName,
          Variable: tags.typeName,
          Term: tags.name,
          "Class/Term Edge/Term": [tags.className, tags.strong],
          "Product/Term Coproduct/Term": tags.propertyName,
          URI: tags.null,
          Literal: tags.string,
          "Literal/Term": tags.string,
          "Reference/Term": [tags.className, tags.strong],
          Pointer: tags.derefOperator,
          Optional: tags.typeOperator,
          Export: tags.definitionOperator,
          "OpenBrace CloseBrace": tags.brace,
          "OpenBracket CloseBracket": tags.bracket,
          "RightArrow LeftArrow": tags.separator,
          NamespaceName: tags.name,
          NamespaceURI: [tags.url, tags.link],
          "namespace type class edge": tags.definitionKeyword
        })
      ]
    }),
    languageData: {
      closeBrackets: { brackets: ["[", "{"] },
      indentOnInput: /^\s*[\}\]]$/,
      commentTokens: { line: "#" }
    }
  });

  // lib/error.js
  var errorUnit = schema_exports.product({});

  // lib/lint.js
  function lintView({ state: state2 }) {
    const cursor = syntaxTree(state2).cursor();
    const slice = ({ from, to }) => state2.doc.sliceString(from, to);
    const error = (node, message) => new LintError(node.from, node.to, slice(node), message);
    const parseState = {
      slice,
      error,
      namespaces: {},
      references: [],
      types: { ...defaultTypes },
      schema: {}
    };
    const diagnostics = [];
    if (cursor.name === "Schema") {
      cursor.firstChild();
    } else {
      diagnostics.push({
        from: cursor.from,
        to: cursor.to,
        message: "Syntax error: invalid document",
        severity: "error"
      });
      return { errorCount: 1, schema: {}, namespaces: {}, diagnostics };
    }
    do {
      if (cursor.type.isError) {
      } else if (cursor.type.name === "Namespace") {
        let namespace = "";
        const term = cursor.node.getChild("NamespaceURI");
        if (term !== null) {
          namespace = parseState.slice(term);
        }
        const identifier2 = cursor.node.getChild("NamespaceName");
        if (identifier2 !== null) {
          const prefix = parseState.slice(identifier2);
          if (prefix in parseState.namespaces) {
            const { from, to } = identifier2;
            const message = `duplicate namespace: ${prefix}`;
            diagnostics.push({ from, to, message, severity: "error" });
          } else {
            parseState.namespaces[prefix] = namespace;
          }
        }
      } else if (cursor.type.name === "Type") {
        const identifier2 = cursor.node.getChild("TypeName");
        const expression2 = cursor.node.getChild("Expression");
        const type2 = expression2 === null ? errorUnit : getType(parseState, diagnostics, expression2);
        if (identifier2 !== null) {
          const name2 = parseState.slice(identifier2);
          if (name2 in parseState.types) {
            const { from, to } = identifier2;
            const message = `type ${name2} has already been declared`;
            diagnostics.push({ from, to, message, severity: "error" });
          } else {
            parseState.types[name2] = type2;
          }
        }
      } else if (cursor.type.name === "Class") {
        const term = cursor.node.getChild("Term");
        if (term !== null) {
          const uri3 = getURI(parseState, diagnostics, term);
          if (uri3 !== null) {
            if (uri3 in parseState.schema) {
              const { from, to } = term;
              const message = `class ${uri3} has already been declared`;
              diagnostics.push({ from, to, message, severity: "error" });
            } else {
              const expression2 = cursor.node.getChild("Expression");
              parseState.schema[uri3] = expression2 === null ? errorUnit : getType(parseState, diagnostics, expression2);
            }
          }
        }
      } else if (cursor.type.name === "Edge") {
        const [term, source2, target2] = cursor.node.getChildren("Term");
        if (term !== void 0) {
          const key2 = getURI(parseState, diagnostics, term);
          if (key2 in parseState.schema) {
            const { from, to } = term;
            const message = `class ${key2} has already been declared`;
            diagnostics.push({ from, to, message, severity: "error" });
          }
          if (source2 !== void 0) {
            const sourceURI = getURI(parseState, diagnostics, source2);
            if (!(sourceURI in parseState.schema)) {
              const { from, to } = source2;
              parseState.references.push({ from, to, key: sourceURI });
            }
            if (target2 !== void 0) {
              const targetURI = getURI(parseState, diagnostics, target2);
              if (!(targetURI in parseState.schema)) {
                const { from, to } = target2;
                parseState.references.push({ from, to, key: targetURI });
              }
              const components = {
                [ul_exports.source]: schema_exports.reference(sourceURI),
                [ul_exports.target]: schema_exports.reference(targetURI)
              };
              const expression2 = cursor.node.getChild("Expression");
              if (expression2 !== null) {
                const type2 = getType(parseState, diagnostics, expression2);
                components[ul_exports.value] = type2;
              }
              parseState.schema[key2] = schema_exports.product(components);
            }
          }
        }
      }
      reportChildErrors(diagnostics, cursor);
    } while (cursor.nextSibling());
    for (const { from, to, key: key2 } of parseState.references) {
      if (key2 in parseState.schema) {
        continue;
      } else {
        const message = `class ${key2} is not defined`;
        diagnostics.push({ from, to, message, severity: "error" });
      }
    }
    const sorted = diagnostics.sort(({ from: a, to: c }, { from: b, to: d }) => a < b ? -1 : b < a ? 1 : c < d ? -1 : d < c ? 1 : 0);
    return {
      errorCount: sorted.length,
      schema: parseState.schema,
      namespaces: { ...defaultNamespaces, ...parseState.namespaces },
      diagnostics: sorted
    };
  }
  function getURI(state2, diagnostics, node) {
    try {
      return parseURI(state2, node);
    } catch (e) {
      if (e instanceof LintError) {
        const { from, to, message, value: value2 } = e;
        diagnostics.push({ from, to, message, severity: "error" });
        return value2;
      } else {
        throw e;
      }
    }
  }
  function getType(state2, diagnostics, node) {
    if (node.name === "Variable") {
      const value2 = state2.slice(node);
      if (value2 in state2.types) {
        return state2.types[value2];
      } else {
        const { from, to } = node;
        const message = `Type ${value2} is not defined`;
        diagnostics.push({ from, to, message, severity: "error" });
        return errorUnit;
      }
    } else if (node.name === "Optional") {
      const expression2 = node.getChild("Expression");
      const type2 = expression2 === null ? errorUnit : getType(state2, diagnostics, expression2);
      return schema_exports.coproduct({ [ul_exports.none]: schema_exports.product({}), [ul_exports.some]: type2 });
    } else if (node.name === "Reference") {
      const term = node.getChild("Term");
      if (term === null) {
        return errorUnit;
      }
      const key2 = getURI(state2, diagnostics, term);
      if (!(key2 in state2.schema)) {
        const { from, to } = term;
        state2.references.push({ from, to, key: key2 });
      }
      return schema_exports.reference(key2);
    } else if (node.name === "URI") {
      return schema_exports.uri();
    } else if (node.name === "Literal") {
      const term = node.getChild("Term");
      if (term === null) {
        return errorUnit;
      }
      const datatype2 = getURI(state2, diagnostics, term);
      return schema_exports.literal(datatype2);
    } else if (node.name === "Product") {
      const components = {};
      for (const component2 of node.getChildren("Component")) {
        const term = component2.getChild("Term");
        if (term === null) {
          continue;
        }
        const key2 = getURI(state2, diagnostics, term);
        if (key2 in components) {
          const { from, to } = term;
          const message = `Duplicate product component key`;
          diagnostics.push({ from, to, message, severity: "error" });
        }
        const expression2 = component2.getChild("Expression");
        components[key2] = expression2 === null ? errorUnit : getType(state2, diagnostics, expression2);
      }
      return schema_exports.product(components);
    } else if (node.name === "Coproduct") {
      const options = {};
      for (const option2 of node.getChildren("Option")) {
        const term = option2.getChild("Term");
        if (term === null) {
          continue;
        }
        const key2 = getURI(state2, diagnostics, term);
        if (key2 in options) {
          const { from, to } = term;
          const message = `duplicate coproduct option key`;
          diagnostics.push({ from, to, message, severity: "error" });
        }
        const expression2 = option2.getChild("Expression");
        options[key2] = expression2 === null ? schema_exports.product({}) : getType(state2, diagnostics, expression2);
      }
      return schema_exports.coproduct(options);
    } else {
      throw new Error("unexpected expression node");
    }
  }
  function reportChildErrors(diagnostics, cursor) {
    if (cursor.type.isError) {
      const { from, to } = cursor;
      const message = `unexpected or missing token (that's all we know)`;
      diagnostics.push({ from, to, message, severity: "error" });
    }
    if (cursor.firstChild()) {
      do {
        reportChildErrors(diagnostics, cursor);
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }
  var LintDelay = 500;
  var setSchemaEffect = StateEffect.define();
  var SchemaState = StateField.define({
    create() {
      return { errorCount: 0, schema: {}, namespaces: defaultNamespaces };
    },
    update(value2, tr) {
      return tr.effects.reduce((value3, effect) => effect.is(setSchemaEffect) ? effect.value : value3, value2);
    }
  });
  var linter = [
    SchemaState,
    ViewPlugin.fromClass(class {
      constructor(view2) {
        this.view = view2;
        this.lintTime = Date.now() + LintDelay;
        this.set = true;
        this.run = this.run.bind(this);
        setTimeout(this.run, LintDelay);
      }
      run() {
        const now = Date.now();
        if (now < this.lintTime - 10) {
          setTimeout(this.run, this.lintTime - now);
        } else {
          this.set = false;
          const { diagnostics, ...props } = lintView(this.view);
          this.view.dispatch({ effects: [setSchemaEffect.of(props)] }, setDiagnostics(this.view.state, diagnostics));
        }
      }
      update(update) {
        if (update.docChanged) {
          this.lintTime = Date.now() + LintDelay;
          if (!this.set) {
            this.set = true;
            setTimeout(this.run, LintDelay);
          }
        }
      }
    })
  ];

  // ../../node_modules/@codemirror/next/history/dist/index.js
  var fromHistory = Annotation.define();
  var isolateHistory = Annotation.define();
  var invertedEffects = Facet.define();
  var historyConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        minDepth: 100,
        newGroupDelay: 500
      }, { minDepth: Math.max, newGroupDelay: Math.min });
    }
  });
  var historyField = StateField.define({
    create() {
      return HistoryState.empty;
    },
    update(state2, tr) {
      let config2 = tr.state.facet(historyConfig);
      let fromHist = tr.annotation(fromHistory);
      if (fromHist) {
        let item = HistEvent.fromTransaction(tr), from = fromHist.side;
        let other = from == 0 ? state2.undone : state2.done;
        if (item)
          other = updateBranch(other, other.length, config2.minDepth, item);
        else
          other = addSelection(other, tr.startState.selection);
        return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
      }
      let isolate = tr.annotation(isolateHistory);
      if (isolate == "full" || isolate == "before")
        state2 = state2.isolate();
      if (tr.annotation(Transaction.addToHistory) === false)
        return tr.changes.length ? state2.addMapping(tr.changes.desc) : state2;
      let event = HistEvent.fromTransaction(tr);
      let time2 = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
      if (event)
        state2 = state2.addChanges(event, time2, userEvent, config2.newGroupDelay, config2.minDepth);
      else if (tr.selection)
        state2 = state2.addSelection(tr.startState.selection, time2, userEvent, config2.newGroupDelay);
      if (isolate == "full" || isolate == "after")
        state2 = state2.isolate();
      return state2;
    }
  });
  function history(config2 = {}) {
    return [
      historyField,
      historyConfig.of(config2),
      EditorView.domEventHandlers({
        beforeinput(e, view2) {
          if (e.inputType == "historyUndo")
            return undo(view2);
          if (e.inputType == "historyRedo")
            return redo(view2);
          return false;
        }
      })
    ];
  }
  function cmd(side, selection) {
    return function({ state: state2, dispatch }) {
      let historyState = state2.field(historyField, false);
      if (!historyState)
        return false;
      let tr = historyState.pop(side, state2, selection);
      if (!tr)
        return false;
      dispatch(tr);
      return true;
    };
  }
  var undo = cmd(0, false);
  var redo = cmd(1, false);
  var undoSelection = cmd(0, true);
  var redoSelection = cmd(1, true);
  function depth(side) {
    return function(state2) {
      let histState = state2.field(historyField, false);
      if (!histState)
        return 0;
      let branch = side == 0 ? histState.done : histState.undone;
      return branch.length - (branch.length && !branch[0].changes ? 1 : 0);
    };
  }
  var undoDepth = depth(0);
  var redoDepth = depth(1);
  var HistEvent = class {
    constructor(changes, effects, mapped, startSelection, selectionsAfter) {
      this.changes = changes;
      this.effects = effects;
      this.mapped = mapped;
      this.startSelection = startSelection;
      this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
      return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    static fromTransaction(tr) {
      let effects = none4;
      for (let invert of tr.startState.facet(invertedEffects)) {
        let result = invert(tr);
        if (result.length)
          effects = effects.concat(result);
      }
      if (!effects.length && tr.changes.empty)
        return null;
      return new HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, tr.startState.selection, none4);
    }
    static selection(selections) {
      return new HistEvent(void 0, none4, void 0, void 0, selections);
    }
  };
  function updateBranch(branch, to, maxLen, newEvent) {
    let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to);
    newBranch.push(newEvent);
    return newBranch;
  }
  function isAdjacent(a, b) {
    let ranges = [], isAdjacent2 = false;
    a.iterChangedRanges((f, t2) => ranges.push(f, t2));
    b.iterChangedRanges((_f, _t, f, t2) => {
      for (let i = 0; i < ranges.length; ) {
        let from = ranges[i++], to = ranges[i++];
        if (t2 >= from && f <= to)
          isAdjacent2 = true;
      }
    });
    return isAdjacent2;
  }
  function eqSelectionShape(a, b) {
    return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
  }
  function conc(a, b) {
    return !a.length ? b : !b.length ? a : a.concat(b);
  }
  var none4 = [];
  var MaxSelectionsPerEvent = 200;
  function addSelection(branch, selection) {
    if (!branch.length) {
      return [HistEvent.selection([selection])];
    } else {
      let lastEvent = branch[branch.length - 1];
      let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
      if (sels.length && sels[sels.length - 1].eq(selection))
        return branch;
      sels.push(selection);
      return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
  }
  function popSelection(branch) {
    let last = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
    return newBranch;
  }
  function addMappingToBranch(branch, mapping) {
    if (!branch.length)
      return branch;
    let length = branch.length, selections = none4;
    while (length) {
      let event = mapEvent(branch[length - 1], mapping, selections);
      if (event.changes && !event.changes.empty || event.effects.length) {
        let result = branch.slice(0, length);
        result[length - 1] = event;
        return result;
      } else {
        mapping = event.mapped;
        length--;
        selections = event.selectionsAfter;
      }
    }
    return selections.length ? [HistEvent.selection(selections)] : none4;
  }
  function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none4, extraSelections);
    if (!event.changes)
      return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
  }
  var HistoryState = class {
    constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
      this.done = done;
      this.undone = undone;
      this.prevTime = prevTime;
      this.prevUserEvent = prevUserEvent;
    }
    isolate() {
      return this.prevTime ? new HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time2, userEvent, newGroupDelay, maxLen) {
      let done = this.done, lastEvent = done[done.length - 1];
      if (lastEvent && lastEvent.changes && time2 - this.prevTime < newGroupDelay && !lastEvent.selectionsAfter.length && lastEvent.changes.length && event.changes && isAdjacent(lastEvent.changes, event.changes)) {
        done = updateBranch(done, done.length - 1, maxLen, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none4));
      } else {
        done = updateBranch(done, done.length, maxLen, event);
      }
      return new HistoryState(done, none4, time2, userEvent);
    }
    addSelection(selection, time2, userEvent, newGroupDelay) {
      let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none4;
      if (last.length > 0 && time2 - this.prevTime < newGroupDelay && userEvent == "keyboardselection" && this.prevUserEvent == userEvent && eqSelectionShape(last[last.length - 1], selection))
        return this;
      return new HistoryState(addSelection(this.done, selection), this.undone, time2, userEvent);
    }
    addMapping(mapping) {
      return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state2, selection) {
      let branch = side == 0 ? this.done : this.undone;
      if (branch.length == 0)
        return null;
      let event = branch[branch.length - 1];
      if (selection && event.selectionsAfter.length) {
        return state2.update({
          selection: event.selectionsAfter[event.selectionsAfter.length - 1],
          annotations: fromHistory.of({ side, rest: popSelection(branch) })
        });
      } else if (!event.changes) {
        return null;
      } else {
        let rest2 = branch.length == 1 ? none4 : branch.slice(0, branch.length - 1);
        if (event.mapped)
          rest2 = addMappingToBranch(rest2, event.mapped);
        return state2.update({
          changes: event.changes,
          selection: event.startSelection,
          effects: event.effects,
          annotations: fromHistory.of({ side, rest: rest2 }),
          filter: false
        });
      }
    }
  };
  HistoryState.empty = new HistoryState(none4, none4);
  var historyKeymap = [
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
    { key: "Mod-u", run: undoSelection, preventDefault: true },
    { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
  ];

  // ../../node_modules/@codemirror/next/gutter/dist/index.js
  var GutterMarker = class extends RangeValue {
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    toDOM(_view) {
      return null;
    }
    at(pos) {
      return new Range(pos, pos, this);
    }
  };
  GutterMarker.prototype.elementClass = "";
  GutterMarker.prototype.mapMode = MapMode.TrackBefore;
  var defaults = {
    style: "",
    renderEmptyElements: false,
    elementStyle: "",
    markers: () => RangeSet.empty,
    lineMarker: () => null,
    initialSpacer: null,
    updateSpacer: null,
    domEventHandlers: {}
  };
  var activeGutters = Facet.define();
  function gutter(config2) {
    return [gutters(), activeGutters.of(Object.assign(Object.assign({}, defaults), config2))];
  }
  var baseTheme5 = EditorView.baseTheme({
    $gutters: {
      display: "flex",
      height: "100%",
      boxSizing: "border-box",
      left: 0
    },
    "$$light $gutters": {
      backgroundColor: "#f5f5f5",
      color: "#999",
      borderRight: "1px solid #ddd"
    },
    "$$dark $gutters": {
      backgroundColor: "#333338",
      color: "#ccc"
    },
    $gutter: {
      display: "flex !important",
      flexDirection: "column",
      flexShrink: 0,
      boxSizing: "border-box",
      height: "100%",
      overflow: "hidden"
    },
    $gutterElement: {
      boxSizing: "border-box"
    },
    "$gutterElement.lineNumber": {
      padding: "0 3px 0 5px",
      minWidth: "20px",
      textAlign: "right",
      whiteSpace: "nowrap"
    }
  });
  var unfixGutters = Facet.define({
    combine: (values) => values.some((x) => x)
  });
  function gutters(config2) {
    let result = [
      gutterView,
      baseTheme5
    ];
    if (config2 && config2.fixed === false)
      result.push(unfixGutters.of(true));
    return result;
  }
  var gutterView = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.dom = document.createElement("div");
      this.dom.className = themeClass("gutters");
      this.dom.setAttribute("aria-hidden", "true");
      this.gutters = view2.state.facet(activeGutters).map((conf) => new SingleGutterView(view2, conf));
      for (let gutter2 of this.gutters)
        this.dom.appendChild(gutter2.dom);
      this.fixed = !view2.state.facet(unfixGutters);
      if (this.fixed) {
        this.dom.style.position = "sticky";
      }
      view2.scrollDOM.insertBefore(this.dom, view2.contentDOM);
    }
    update(update) {
      if (!this.updateGutters(update))
        return;
      let contexts = this.gutters.map((gutter2) => new UpdateContext(gutter2, this.view.viewport));
      this.view.viewportLines((line) => {
        let text;
        if (Array.isArray(line.type)) {
          for (let b of line.type)
            if (b.type == BlockType.Text) {
              text = b;
              break;
            }
        } else {
          text = line.type == BlockType.Text ? line : void 0;
        }
        if (!text)
          return;
        for (let cx of contexts)
          cx.line(this.view, text);
      }, 0);
      for (let cx of contexts)
        cx.finish();
      this.dom.style.minHeight = this.view.contentHeight + "px";
      if (update.state.facet(unfixGutters) != !this.fixed) {
        this.fixed = !this.fixed;
        this.dom.style.position = this.fixed ? "sticky" : "";
      }
    }
    updateGutters(update) {
      let prev = update.startState.facet(activeGutters), cur2 = update.state.facet(activeGutters);
      let change = update.docChanged || update.heightChanged || update.viewportChanged;
      if (prev == cur2) {
        for (let gutter2 of this.gutters)
          if (gutter2.update(update))
            change = true;
      } else {
        change = true;
        let gutters2 = [];
        for (let conf of cur2) {
          let known = prev.indexOf(conf);
          if (known < 0) {
            gutters2.push(new SingleGutterView(this.view, conf));
          } else {
            this.gutters[known].update(update);
            gutters2.push(this.gutters[known]);
          }
        }
        for (let g of this.gutters)
          g.dom.remove();
        for (let g of gutters2)
          this.dom.appendChild(g.dom);
        this.gutters = gutters2;
      }
      return change;
    }
    destroy() {
      this.dom.remove();
    }
  }, {
    provide: PluginField.scrollMargins.from((value2) => {
      if (value2.gutters.length == 0 || !value2.fixed)
        return null;
      return value2.view.textDirection == Direction.LTR ? { left: value2.dom.offsetWidth } : { right: value2.dom.offsetWidth };
    })
  });
  function asArray2(val) {
    return Array.isArray(val) ? val : [val];
  }
  var UpdateContext = class {
    constructor(gutter2, viewport) {
      this.gutter = gutter2;
      this.localMarkers = [];
      this.i = 0;
      this.height = 0;
      this.cursor = RangeSet.iter(gutter2.markers, viewport.from);
    }
    line(view2, line) {
      if (this.localMarkers.length)
        this.localMarkers = [];
      while (this.cursor.value && this.cursor.from <= line.from) {
        if (this.cursor.from == line.from)
          this.localMarkers.push(this.cursor.value);
        this.cursor.next();
      }
      let forLine = this.gutter.config.lineMarker(view2, line, this.localMarkers);
      if (forLine)
        this.localMarkers.unshift(forLine);
      let gutter2 = this.gutter;
      if (this.localMarkers.length == 0 && !gutter2.config.renderEmptyElements)
        return;
      let above = line.top - this.height;
      if (this.i == gutter2.elements.length) {
        let newElt = new GutterElement(view2, line.height, above, this.localMarkers, gutter2.elementClass);
        gutter2.elements.push(newElt);
        gutter2.dom.appendChild(newElt.dom);
      } else {
        let markers = this.localMarkers, elt = gutter2.elements[this.i];
        if (sameMarkers(markers, elt.markers)) {
          markers = elt.markers;
          this.localMarkers.length = 0;
        }
        elt.update(view2, line.height, above, markers, gutter2.elementClass);
      }
      this.height = line.bottom;
      this.i++;
    }
    finish() {
      let gutter2 = this.gutter;
      while (gutter2.elements.length > this.i)
        gutter2.dom.removeChild(gutter2.elements.pop().dom);
    }
  };
  var SingleGutterView = class {
    constructor(view2, config2) {
      this.view = view2;
      this.config = config2;
      this.elements = [];
      this.spacer = null;
      this.dom = document.createElement("div");
      this.dom.className = themeClass("gutter" + (this.config.style ? "." + this.config.style : ""));
      this.elementClass = themeClass("gutterElement" + (this.config.style ? "." + this.config.style : ""));
      for (let prop in config2.domEventHandlers) {
        this.dom.addEventListener(prop, (event) => {
          let line = view2.visualLineAtHeight(event.clientY, view2.contentDOM.getBoundingClientRect().top);
          if (config2.domEventHandlers[prop](view2, line, event))
            event.preventDefault();
        });
      }
      this.markers = asArray2(config2.markers(view2));
      if (config2.initialSpacer) {
        this.spacer = new GutterElement(view2, 0, 0, [config2.initialSpacer(view2)], this.elementClass);
        this.dom.appendChild(this.spacer.dom);
        this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
      }
    }
    update(update) {
      let prevMarkers = this.markers;
      this.markers = asArray2(this.config.markers(update.view));
      if (this.spacer && this.config.updateSpacer) {
        let updated = this.config.updateSpacer(this.spacer.markers[0], update);
        if (updated != this.spacer.markers[0])
          this.spacer.update(update.view, 0, 0, [updated], this.elementClass);
      }
      return this.markers != prevMarkers;
    }
  };
  var GutterElement = class {
    constructor(view2, height, above, markers, eltClass) {
      this.height = -1;
      this.above = 0;
      this.dom = document.createElement("div");
      this.update(view2, height, above, markers, eltClass);
    }
    update(view2, height, above, markers, cssClass) {
      if (this.height != height)
        this.dom.style.height = (this.height = height) + "px";
      if (this.above != above)
        this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
      if (this.markers != markers) {
        this.markers = markers;
        for (let ch; ch = this.dom.lastChild; )
          ch.remove();
        let cls = cssClass;
        for (let m of markers) {
          let dom = m.toDOM(view2);
          if (dom)
            this.dom.appendChild(dom);
          let c = m.elementClass;
          if (c)
            cls += " " + c;
        }
        this.dom.className = cls;
      }
    }
  };
  function sameMarkers(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!a[i].compare(b[i]))
        return false;
    return true;
  }
  var lineNumberMarkers = Facet.define();
  var lineNumberConfig = Facet.define({
    combine(values) {
      return combineConfig(values, { formatNumber: String, domEventHandlers: {} }, {
        domEventHandlers(a, b) {
          let result = Object.assign({}, a);
          for (let event in b) {
            let exists = result[event], add2 = b[event];
            result[event] = exists ? (view2, line, event2) => exists(view2, line, event2) || add2(view2, line, event2) : add2;
          }
          return result;
        }
      });
    }
  });
  var NumberMarker = class extends GutterMarker {
    constructor(number2) {
      super();
      this.number = number2;
    }
    eq(other) {
      return this.number == other.number;
    }
    toDOM(view2) {
      let config2 = view2.state.facet(lineNumberConfig);
      return document.createTextNode(config2.formatNumber(this.number));
    }
  };
  var lineNumberGutter = gutter({
    style: "lineNumber",
    markers(view2) {
      return view2.state.facet(lineNumberMarkers);
    },
    lineMarker(view2, line, others) {
      if (others.length)
        return null;
      return new NumberMarker(view2.state.doc.lineAt(line.from).number);
    },
    initialSpacer(view2) {
      return new NumberMarker(maxLineNumber(view2.state.doc.lines));
    },
    updateSpacer(spacer, update) {
      let max = maxLineNumber(update.view.state.doc.lines);
      return max == spacer.number ? spacer : new NumberMarker(max);
    }
  });
  function lineNumbers(config2 = {}) {
    return [
      lineNumberConfig.of(config2),
      lineNumberGutter
    ];
  }
  function maxLineNumber(lines) {
    let last = 9;
    while (last < lines)
      last = last * 10 + 9;
    return last;
  }

  // ../../node_modules/@codemirror/next/fold/dist/index.js
  function mapRange(range, mapping) {
    let from = mapping.mapPos(range.from, 1), to = mapping.mapPos(range.to, -1);
    return from >= to ? void 0 : { from, to };
  }
  var foldEffect = StateEffect.define({ map: mapRange });
  var unfoldEffect = StateEffect.define({ map: mapRange });
  function selectedLines(view2) {
    let lines = [];
    for (let { head: head2 } of view2.state.selection.ranges) {
      if (lines.some((l) => l.from <= head2 && l.to >= head2))
        continue;
      lines.push(view2.visualLineAt(head2));
    }
    return lines;
  }
  var foldState = StateField.define({
    create() {
      return Decoration.none;
    },
    update(folded, tr) {
      folded = folded.map(tr.changes);
      for (let e of tr.effects) {
        if (e.is(foldEffect) && !foldExists(folded, e.value.from, e.value.to))
          folded = folded.update({ add: [foldWidget.range(e.value.from, e.value.to)] });
        else if (e.is(unfoldEffect)) {
          folded = folded.update({
            filter: (from, to) => e.value.from != from || e.value.to != to,
            filterFrom: e.value.from,
            filterTo: e.value.to
          });
        }
      }
      if (tr.selection) {
        let onSelection = false, { head: head2 } = tr.selection.main;
        folded.between(head2, head2, (a, b) => {
          if (a < head2 && b > head2)
            onSelection = true;
        });
        if (onSelection)
          folded = folded.update({
            filterFrom: head2,
            filterTo: head2,
            filter: (a, b) => b <= head2 || a >= head2
          });
      }
      return folded;
    },
    provide: (f) => EditorView.decorations.compute([f], (s) => s.field(f))
  });
  function foldInside(state2, from, to) {
    var _a;
    let found = null;
    (_a = state2.field(foldState, false)) === null || _a === void 0 ? void 0 : _a.between(from, to, (from2, to2) => {
      if (!found || found.from > from2)
        found = { from: from2, to: to2 };
    });
    return found;
  }
  function foldExists(folded, from, to) {
    let found = false;
    folded.between(from, from, (a, b) => {
      if (a == from && b == to)
        found = true;
    });
    return found;
  }
  function maybeEnable(state2) {
    return state2.field(foldState, false) ? void 0 : { append: codeFolding() };
  }
  var foldCode = (view2) => {
    for (let line of selectedLines(view2)) {
      let range = foldable(view2.state, line.from, line.to);
      if (range) {
        view2.dispatch({
          effects: foldEffect.of(range),
          reconfigure: maybeEnable(view2.state)
        });
        return true;
      }
    }
    return false;
  };
  var unfoldCode = (view2) => {
    if (!view2.state.field(foldState, false))
      return false;
    let effects = [];
    for (let line of selectedLines(view2)) {
      let folded = foldInside(view2.state, line.from, line.to);
      if (folded)
        effects.push(unfoldEffect.of(folded));
    }
    if (effects.length)
      view2.dispatch({ effects });
    return effects.length > 0;
  };
  var foldAll = (view2) => {
    let { state: state2 } = view2, effects = [];
    for (let pos = 0; pos < state2.doc.length; ) {
      let line = view2.visualLineAt(pos), range = foldable(state2, line.from, line.to);
      if (range)
        effects.push(foldEffect.of(range));
      pos = (range ? view2.visualLineAt(range.to) : line).to + 1;
    }
    if (effects.length)
      view2.dispatch({ effects, reconfigure: maybeEnable(view2.state) });
    return !!effects.length;
  };
  var unfoldAll = (view2) => {
    let field = view2.state.field(foldState, false);
    if (!field || !field.size)
      return false;
    let effects = [];
    field.between(0, view2.state.doc.length, (from, to) => {
      effects.push(unfoldEffect.of({ from, to }));
    });
    view2.dispatch({ effects });
    return true;
  };
  var foldKeymap = [
    { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: foldCode },
    { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: unfoldCode },
    { key: "Ctrl-Alt-[", run: foldAll },
    { key: "Ctrl-Alt-]", run: unfoldAll }
  ];
  var defaultConfig = {
    placeholderDOM: null,
    placeholderText: "\u2026"
  };
  var foldConfig = Facet.define({
    combine(values) {
      return combineConfig(values, defaultConfig);
    }
  });
  function codeFolding(config2) {
    let result = [foldState, baseTheme6];
    if (config2)
      result.push(foldConfig.of(config2));
    return result;
  }
  var foldWidget = Decoration.replace({ widget: new class extends WidgetType {
    ignoreEvents() {
      return false;
    }
    toDOM(view2) {
      let { state: state2 } = view2, conf = state2.facet(foldConfig);
      if (conf.placeholderDOM)
        return conf.placeholderDOM();
      let element = document.createElement("span");
      element.textContent = conf.placeholderText;
      element.setAttribute("aria-label", state2.phrase("folded code"));
      element.title = state2.phrase("unfold");
      element.className = themeClass("foldPlaceholder");
      element.onclick = (event) => {
        let line = view2.visualLineAt(view2.posAtDOM(event.target));
        let folded = foldInside(view2.state, line.from, line.to);
        if (folded)
          view2.dispatch({ effects: unfoldEffect.of(folded) });
        event.preventDefault();
      };
      return element;
    }
  }() });
  var foldGutterDefaults = {
    openText: "\u2304",
    closedText: "\u203A"
  };
  var FoldMarker = class extends GutterMarker {
    constructor(config2, open) {
      super();
      this.config = config2;
      this.open = open;
    }
    eq(other) {
      return this.config == other.config && this.open == other.open;
    }
    toDOM(view2) {
      let span = document.createElement("span");
      span.textContent = this.open ? this.config.openText : this.config.closedText;
      span.title = view2.state.phrase(this.open ? "Fold line" : "Unfold line");
      return span;
    }
  };
  function foldGutter(config2 = {}) {
    let fullConfig = Object.assign(Object.assign({}, foldGutterDefaults), config2);
    let canFold = new FoldMarker(fullConfig, true), canUnfold = new FoldMarker(fullConfig, false);
    let markers = ViewPlugin.fromClass(class {
      constructor(view2) {
        this.from = view2.viewport.from;
        this.markers = RangeSet.of(this.buildMarkers(view2));
      }
      update(update) {
        let firstChange = -1;
        update.changes.iterChangedRanges((from) => {
          if (firstChange < 0)
            firstChange = from;
        });
        let foldChange = update.startState.field(foldState, false) != update.state.field(foldState, false);
        if (!foldChange && update.docChanged && update.view.viewport.from == this.from && firstChange > this.from) {
          let start = update.view.visualLineAt(firstChange).from;
          this.markers = this.markers.update({
            filter: () => false,
            filterFrom: start,
            add: this.buildMarkers(update.view, start)
          });
        } else if (foldChange || update.docChanged || update.viewportChanged) {
          this.from = update.view.viewport.from;
          this.markers = RangeSet.of(this.buildMarkers(update.view));
        }
      }
      buildMarkers(view2, from = 0) {
        let ranges = [];
        view2.viewportLines((line) => {
          if (line.from >= from) {
            let mark = foldInside(view2.state, line.from, line.to) ? canUnfold : foldable(view2.state, line.from, line.to) ? canFold : null;
            if (mark)
              ranges.push(mark.range(line.from));
          }
        });
        return ranges;
      }
    });
    return [
      markers,
      gutter({
        style: "foldGutter",
        markers(view2) {
          var _a;
          return ((_a = view2.plugin(markers)) === null || _a === void 0 ? void 0 : _a.markers) || RangeSet.empty;
        },
        initialSpacer() {
          return new FoldMarker(fullConfig, false);
        },
        domEventHandlers: {
          click: (view2, line) => {
            let folded = foldInside(view2.state, line.from, line.to);
            if (folded) {
              view2.dispatch({ effects: unfoldEffect.of(folded) });
              return true;
            }
            let range = foldable(view2.state, line.from, line.to);
            if (range) {
              view2.dispatch({ effects: foldEffect.of(range) });
              return true;
            }
            return false;
          }
        }
      }),
      codeFolding()
    ];
  }
  var baseTheme6 = EditorView.baseTheme({
    $foldPlaceholder: {
      backgroundColor: "#eee",
      border: "1px solid #ddd",
      color: "#888",
      borderRadius: ".2em",
      margin: "0 1px",
      padding: "0 1px",
      cursor: "pointer"
    },
    "$gutterElement.foldGutter": {
      padding: "0 1px",
      cursor: "pointer"
    }
  });

  // ../../node_modules/@codemirror/next/matchbrackets/dist/index.js
  var baseTheme7 = EditorView.baseTheme({
    $matchingBracket: { color: "#0b0" },
    $nonmatchingBracket: { color: "#a22" }
  });
  var DefaultScanDist = 1e4;
  var DefaultBrackets = "()[]{}";
  var bracketMatchingConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        afterCursor: true,
        brackets: DefaultBrackets,
        maxScanDistance: DefaultScanDist
      });
    }
  });
  var matchingMark = Decoration.mark({ class: themeClass("matchingBracket") });
  var nonmatchingMark = Decoration.mark({ class: themeClass("nonmatchingBracket") });
  var bracketMatchingState = StateField.define({
    create() {
      return Decoration.none;
    },
    update(deco, tr) {
      if (!tr.docChanged && !tr.selection)
        return deco;
      let decorations2 = [];
      let config2 = tr.state.facet(bracketMatchingConfig);
      for (let range of tr.state.selection.ranges) {
        if (!range.empty)
          continue;
        let match2 = matchBrackets(tr.state, range.head, -1, config2) || range.head > 0 && matchBrackets(tr.state, range.head - 1, 1, config2) || config2.afterCursor && (matchBrackets(tr.state, range.head, 1, config2) || range.head < tr.state.doc.length && matchBrackets(tr.state, range.head + 1, -1, config2));
        if (!match2)
          continue;
        let mark = match2.matched ? matchingMark : nonmatchingMark;
        decorations2.push(mark.range(match2.start.from, match2.start.to));
        if (match2.other)
          decorations2.push(mark.range(match2.other.from, match2.other.to));
      }
      return Decoration.set(decorations2, true);
    },
    provide: (f) => EditorView.decorations.from(f)
  });
  var bracketMatchingUnique = [
    bracketMatchingState,
    baseTheme7
  ];
  function bracketMatching(config2 = {}) {
    return [bracketMatchingConfig.of(config2), bracketMatchingUnique];
  }
  function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
    if (byProp)
      return byProp;
    if (node.name.length == 1) {
      let index = brackets.indexOf(node.name);
      if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
        return [brackets[index + dir]];
    }
    return null;
  }
  function matchBrackets(state2, pos, dir, config2 = {}) {
    let maxScanDistance = config2.maxScanDistance || DefaultScanDist, brackets = config2.brackets || DefaultBrackets;
    let tree = syntaxTree(state2), sub = tree.resolve(pos, dir), matches;
    if (matches = matchingNodes(sub.type, dir, brackets))
      return matchMarkedBrackets(state2, pos, dir, sub, matches, brackets);
    else
      return matchPlainBrackets(state2, pos, dir, tree, sub.type, maxScanDistance, brackets);
  }
  function matchMarkedBrackets(_state, _pos, dir, token2, matching, brackets) {
    let parent = token2.parent, firstToken = { from: token2.from, to: token2.to };
    let depth2 = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor;
    if (cursor && (dir < 0 ? cursor.childBefore(token2.from) : cursor.childAfter(token2.to)))
      do {
        if (dir < 0 ? cursor.to <= token2.from : cursor.from >= token2.to) {
          if (depth2 == 0 && matching.indexOf(cursor.type.name) > -1) {
            return { start: firstToken, end: { from: cursor.from, to: cursor.to }, matched: true };
          } else if (matchingNodes(cursor.type, dir, brackets)) {
            depth2++;
          } else if (matchingNodes(cursor.type, -dir, brackets)) {
            depth2--;
            if (depth2 == 0)
              return { start: firstToken, end: { from: cursor.from, to: cursor.to }, matched: false };
          }
        }
      } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return { start: firstToken, matched: false };
  }
  function matchPlainBrackets(state2, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    let startCh = dir < 0 ? state2.sliceDoc(pos - 1, pos) : state2.sliceDoc(pos, pos + 1);
    let bracket2 = brackets.indexOf(startCh);
    if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
      return null;
    let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
    let iter = state2.doc.iterRange(pos, dir > 0 ? state2.doc.length : 0), depth2 = 0;
    for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
      let text = iter.value;
      if (dir < 0)
        distance += text.length;
      let basePos = pos + distance * dir;
      for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
        let found = brackets.indexOf(text[pos2]);
        if (found < 0 || tree.resolve(basePos + pos2, 1).type != tokenType)
          continue;
        if (found % 2 == 0 == dir > 0) {
          depth2++;
        } else if (depth2 == 1) {
          return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
        } else {
          depth2--;
        }
      }
      if (dir > 0)
        distance += text.length;
    }
    return iter.done ? { start: startToken, matched: false } : null;
  }

  // ../../node_modules/@codemirror/next/commands/dist/index.js
  function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
  }
  function setSel(state2, selection) {
    return state2.update({ selection, scrollIntoView: true, annotations: Transaction.userEvent.of("keyboardselection") });
  }
  function moveSel({ state: state2, dispatch }, how) {
    let selection = updateSel(state2.selection, how);
    if (selection.eq(state2.selection))
      return false;
    dispatch(setSel(state2, selection));
    return true;
  }
  function rangeEnd(range, forward) {
    return EditorSelection.cursor(forward ? range.to : range.from);
  }
  function cursorByChar(view2, forward) {
    return moveSel(view2, (range) => range.empty ? view2.moveByChar(range, forward) : rangeEnd(range, forward));
  }
  var cursorCharLeft = (view2) => cursorByChar(view2, view2.textDirection != Direction.LTR);
  var cursorCharRight = (view2) => cursorByChar(view2, view2.textDirection == Direction.LTR);
  function cursorByGroup(view2, forward) {
    return moveSel(view2, (range) => range.empty ? view2.moveByGroup(range, forward) : rangeEnd(range, forward));
  }
  var cursorGroupLeft = (view2) => cursorByGroup(view2, view2.textDirection != Direction.LTR);
  var cursorGroupRight = (view2) => cursorByGroup(view2, view2.textDirection == Direction.LTR);
  var cursorGroupForward = (view2) => cursorByGroup(view2, true);
  var cursorGroupBackward = (view2) => cursorByGroup(view2, false);
  function interestingNode(state2, node, bracketProp) {
    if (node.type.prop(bracketProp))
      return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state2.sliceDoc(node.from, node.to))) || node.firstChild;
  }
  function moveBySyntax(state2, start, forward) {
    let pos = syntaxTree(state2).resolve(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    for (let at = start.head; ; ) {
      let next = forward ? pos.childAfter(at) : pos.childBefore(at);
      if (!next)
        break;
      if (interestingNode(state2, next, bracketProp))
        pos = next;
      else
        at = forward ? next.to : next.from;
    }
    let bracket2 = pos.type.prop(bracketProp), match2, newPos;
    if (bracket2 && (match2 = forward ? matchBrackets(state2, pos.from, 1) : matchBrackets(state2, pos.to, -1)) && match2.matched)
      newPos = forward ? match2.other.to : match2.other.from;
    else
      newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
  }
  var cursorSyntaxLeft = (view2) => moveSel(view2, (range) => moveBySyntax(view2.state, range, view2.textDirection != Direction.LTR));
  var cursorSyntaxRight = (view2) => moveSel(view2, (range) => moveBySyntax(view2.state, range, view2.textDirection == Direction.LTR));
  function cursorByLine(view2, forward) {
    return moveSel(view2, (range) => range.empty ? view2.moveVertically(range, forward) : rangeEnd(range, forward));
  }
  var cursorLineUp = (view2) => cursorByLine(view2, false);
  var cursorLineDown = (view2) => cursorByLine(view2, true);
  function cursorByPage(view2, forward) {
    return moveSel(view2, (range) => range.empty ? view2.moveVertically(range, forward, view2.dom.clientHeight) : rangeEnd(range, forward));
  }
  var cursorPageUp = (view2) => cursorByPage(view2, false);
  var cursorPageDown = (view2) => cursorByPage(view2, true);
  function moveByLineBoundary(view2, start, forward) {
    let line = view2.visualLineAt(start.head), moved = view2.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
      moved = view2.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
      let space = /^\s*/.exec(view2.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
      if (space && start.head != line.from + space)
        moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
  }
  var cursorLineBoundaryForward = (view2) => moveSel(view2, (range) => moveByLineBoundary(view2, range, true));
  var cursorLineBoundaryBackward = (view2) => moveSel(view2, (range) => moveByLineBoundary(view2, range, false));
  var cursorLineStart = (view2) => moveSel(view2, (range) => EditorSelection.cursor(view2.visualLineAt(range.head).from, 1));
  var cursorLineEnd = (view2) => moveSel(view2, (range) => EditorSelection.cursor(view2.visualLineAt(range.head).to, -1));
  function toMatchingBracket(state2, dispatch, extend2) {
    let found = false, selection = updateSel(state2.selection, (range) => {
      let matching = matchBrackets(state2, range.head, -1) || matchBrackets(state2, range.head, 1) || range.head > 0 && matchBrackets(state2, range.head - 1, 1) || range.head < state2.doc.length && matchBrackets(state2, range.head + 1, -1);
      if (!matching || !matching.other)
        return range;
      found = true;
      let head2 = matching.start.from == range.head ? matching.other.to : matching.other.from;
      return extend2 ? EditorSelection.range(range.anchor, head2) : EditorSelection.cursor(head2);
    });
    if (!found)
      return false;
    dispatch(setSel(state2, selection));
    return true;
  }
  var cursorMatchingBracket = ({ state: state2, dispatch }) => toMatchingBracket(state2, dispatch, false);
  function extendSel(view2, how) {
    let selection = updateSel(view2.state.selection, (range) => {
      let head2 = how(range);
      return EditorSelection.range(range.anchor, head2.head, head2.goalColumn);
    });
    if (selection.eq(view2.state.selection))
      return false;
    view2.dispatch(setSel(view2.state, selection));
    return true;
  }
  function selectByChar(view2, forward) {
    return extendSel(view2, (range) => view2.moveByChar(range, forward));
  }
  var selectCharLeft = (view2) => selectByChar(view2, view2.textDirection != Direction.LTR);
  var selectCharRight = (view2) => selectByChar(view2, view2.textDirection == Direction.LTR);
  function selectByGroup(view2, forward) {
    return extendSel(view2, (range) => view2.moveByGroup(range, forward));
  }
  var selectGroupLeft = (view2) => selectByGroup(view2, view2.textDirection != Direction.LTR);
  var selectGroupRight = (view2) => selectByGroup(view2, view2.textDirection == Direction.LTR);
  var selectGroupForward = (view2) => selectByGroup(view2, true);
  var selectGroupBackward = (view2) => selectByGroup(view2, false);
  var selectSyntaxLeft = (view2) => extendSel(view2, (range) => moveBySyntax(view2.state, range, view2.textDirection != Direction.LTR));
  var selectSyntaxRight = (view2) => extendSel(view2, (range) => moveBySyntax(view2.state, range, view2.textDirection == Direction.LTR));
  function selectByLine(view2, forward) {
    return extendSel(view2, (range) => view2.moveVertically(range, forward));
  }
  var selectLineUp = (view2) => selectByLine(view2, false);
  var selectLineDown = (view2) => selectByLine(view2, true);
  function selectByPage(view2, forward) {
    return extendSel(view2, (range) => view2.moveVertically(range, forward, view2.dom.clientHeight));
  }
  var selectPageUp = (view2) => selectByPage(view2, false);
  var selectPageDown = (view2) => selectByPage(view2, true);
  var selectLineBoundaryForward = (view2) => extendSel(view2, (range) => moveByLineBoundary(view2, range, true));
  var selectLineBoundaryBackward = (view2) => extendSel(view2, (range) => moveByLineBoundary(view2, range, false));
  var selectLineStart = (view2) => extendSel(view2, (range) => EditorSelection.cursor(view2.visualLineAt(range.head).from));
  var selectLineEnd = (view2) => extendSel(view2, (range) => EditorSelection.cursor(view2.visualLineAt(range.head).to));
  var cursorDocStart = ({ state: state2, dispatch }) => {
    dispatch(setSel(state2, { anchor: 0 }));
    return true;
  };
  var cursorDocEnd = ({ state: state2, dispatch }) => {
    dispatch(setSel(state2, { anchor: state2.doc.length }));
    return true;
  };
  var selectDocStart = ({ state: state2, dispatch }) => {
    dispatch(setSel(state2, { anchor: state2.selection.main.anchor, head: 0 }));
    return true;
  };
  var selectDocEnd = ({ state: state2, dispatch }) => {
    dispatch(setSel(state2, { anchor: state2.selection.main.anchor, head: state2.doc.length }));
    return true;
  };
  var selectAll = ({ state: state2, dispatch }) => {
    dispatch(state2.update({ selection: { anchor: 0, head: state2.doc.length }, annotations: Transaction.userEvent.of("keyboardselection") }));
    return true;
  };
  var selectLine = ({ state: state2, dispatch }) => {
    let ranges = selectedLineBlocks(state2).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state2.doc.length)));
    dispatch(state2.update({ selection: new EditorSelection(ranges), annotations: Transaction.userEvent.of("keyboardselection") }));
    return true;
  };
  var selectParentSyntax = ({ state: state2, dispatch }) => {
    let selection = updateSel(state2.selection, (range) => {
      var _a;
      let context = syntaxTree(state2).resolve(range.head, 1);
      while (!(context.from < range.from && context.to >= range.to || context.to > range.to && context.from <= range.from || !((_a = context.parent) === null || _a === void 0 ? void 0 : _a.parent)))
        context = context.parent;
      return EditorSelection.range(context.to, context.from);
    });
    dispatch(setSel(state2, selection));
    return true;
  };
  var simplifySelection = ({ state: state2, dispatch }) => {
    let cur2 = state2.selection, selection = null;
    if (cur2.ranges.length > 1)
      selection = new EditorSelection([cur2.main]);
    else if (!cur2.main.empty)
      selection = new EditorSelection([EditorSelection.cursor(cur2.main.head)]);
    if (!selection)
      return false;
    dispatch(setSel(state2, selection));
    return true;
  };
  function deleteBy(view2, by) {
    let { state: state2 } = view2, changes = state2.changeByRange((range) => {
      let { from, to } = range;
      if (from == to) {
        let towards = by(from);
        from = Math.min(from, towards);
        to = Math.max(to, towards);
      }
      return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from) };
    });
    if (changes.changes.empty)
      return false;
    view2.dispatch(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of("delete") });
    return true;
  }
  var deleteByChar = (view2, forward, codePoint) => deleteBy(view2, (pos) => {
    let { state: state2 } = view2, line = state2.doc.lineAt(pos), before;
    if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
      if (before[before.length - 1] == "	")
        return pos - 1;
      let col = countColumn(before, 0, state2.tabSize), drop = col % getIndentUnit(state2) || getIndentUnit(state2);
      for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
        pos--;
      return pos;
    }
    let target2;
    if (codePoint) {
      let next = line.text.slice(pos - line.from + (forward ? 0 : -2), pos - line.from + (forward ? 2 : 0));
      let size = next ? codePointSize(codePointAt(next, 0)) : 1;
      target2 = forward ? Math.min(state2.doc.length, pos + size) : Math.max(0, pos - size);
    } else {
      target2 = findClusterBreak(line.text, pos - line.from, forward) + line.from;
    }
    if (target2 == pos && line.number != (forward ? state2.doc.lines : 1))
      target2 += forward ? 1 : -1;
    return target2;
  });
  var deleteCodePointBackward = (view2) => deleteByChar(view2, false, true);
  var deleteCharBackward = (view2) => deleteByChar(view2, false, false);
  var deleteCharForward = (view2) => deleteByChar(view2, true, false);
  var deleteByGroup = (view2, forward) => deleteBy(view2, (pos) => {
    let { state: state2 } = view2, line = state2.doc.lineAt(pos), categorize = state2.charCategorizer(pos);
    for (let cat = null; ; ) {
      let next, nextChar2;
      if (pos == (forward ? line.to : line.from)) {
        if (line.number == (forward ? state2.doc.lines : 1))
          break;
        line = state2.doc.line(line.number + (forward ? 1 : -1));
        next = forward ? line.from : line.to;
        nextChar2 = "\n";
      } else {
        next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
        nextChar2 = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
      }
      let nextCat = categorize(nextChar2);
      if (cat != null && nextCat != cat)
        break;
      if (nextCat != CharCategory.Space)
        cat = nextCat;
      pos = next;
    }
    return pos;
  });
  var deleteGroupBackward = (view2) => deleteByGroup(view2, false);
  var deleteGroupForward = (view2) => deleteByGroup(view2, true);
  var deleteToLineEnd = (view2) => deleteBy(view2, (pos) => {
    let lineEnd = view2.visualLineAt(pos).to;
    if (pos < lineEnd)
      return lineEnd;
    return Math.max(view2.state.doc.length, pos + 1);
  });
  var splitLine = ({ state: state2, dispatch }) => {
    let changes = state2.changeByRange((range) => {
      return {
        changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
        range: EditorSelection.cursor(range.from)
      };
    });
    dispatch(state2.update(changes, { scrollIntoView: true, annotations: Transaction.userEvent.of("input") }));
    return true;
  };
  var transposeChars = ({ state: state2, dispatch }) => {
    let changes = state2.changeByRange((range) => {
      if (!range.empty || range.from == 0 || range.from == state2.doc.length)
        return { range };
      let pos = range.from, line = state2.doc.lineAt(pos);
      let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
      let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
      return {
        changes: { from, to, insert: state2.doc.slice(pos, to).append(state2.doc.slice(from, pos)) },
        range: EditorSelection.cursor(to)
      };
    });
    if (changes.changes.empty)
      return false;
    dispatch(state2.update(changes, { scrollIntoView: true }));
    return true;
  };
  function selectedLineBlocks(state2) {
    let blocks = [], upto = -1;
    for (let range of state2.selection.ranges) {
      let startLine = state2.doc.lineAt(range.from), endLine = state2.doc.lineAt(range.to);
      if (upto == startLine.number)
        blocks[blocks.length - 1].to = endLine.to;
      else
        blocks.push({ from: startLine.from, to: endLine.to });
      upto = endLine.number;
    }
    return blocks;
  }
  function moveLine(state2, dispatch, forward) {
    let changes = [];
    for (let block of selectedLineBlocks(state2)) {
      if (forward ? block.to == state2.doc.length : block.from == 0)
        continue;
      let nextLine = state2.doc.lineAt(forward ? block.to + 1 : block.from - 1);
      if (forward)
        changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state2.lineBreak });
      else
        changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state2.lineBreak + nextLine.text });
    }
    if (!changes.length)
      return false;
    dispatch(state2.update({ changes, scrollIntoView: true }));
    return true;
  }
  var moveLineUp = ({ state: state2, dispatch }) => moveLine(state2, dispatch, false);
  var moveLineDown = ({ state: state2, dispatch }) => moveLine(state2, dispatch, true);
  function copyLine(state2, dispatch, forward) {
    let changes = [];
    for (let block of selectedLineBlocks(state2)) {
      if (forward)
        changes.push({ from: block.from, insert: state2.doc.slice(block.from, block.to) + state2.lineBreak });
      else
        changes.push({ from: block.to, insert: state2.lineBreak + state2.doc.slice(block.from, block.to) });
    }
    dispatch(state2.update({ changes, scrollIntoView: true }));
    return true;
  }
  var copyLineUp = ({ state: state2, dispatch }) => copyLine(state2, dispatch, false);
  var copyLineDown = ({ state: state2, dispatch }) => copyLine(state2, dispatch, true);
  var deleteLine = (view2) => {
    let { state: state2 } = view2, changes = state2.changes(selectedLineBlocks(state2).map(({ from, to }) => {
      if (from > 0)
        from--;
      else if (to < state2.doc.length)
        to++;
      return { from, to };
    }));
    let selection = updateSel(state2.selection, (range) => view2.moveVertically(range, true)).map(changes);
    view2.dispatch({ changes, selection, scrollIntoView: true });
    return true;
  };
  function isBetweenBrackets(state2, pos) {
    if (/\(\)|\[\]|\{\}/.test(state2.sliceDoc(pos - 1, pos + 1)))
      return { from: pos, to: pos };
    let context = syntaxTree(state2).resolve(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1)
      return { from: before.to, to: after.from };
    return null;
  }
  var insertNewlineAndIndent = ({ state: state2, dispatch }) => {
    let changes = state2.changeByRange(({ from, to }) => {
      let explode = from == to && isBetweenBrackets(state2, from);
      let cx = new IndentContext(state2, { simulateBreak: from, simulateDoubleBreak: !!explode });
      let indent = getIndentation(cx, from);
      if (indent == null)
        indent = /^\s*/.exec(state2.doc.lineAt(from).text)[0].length;
      let line = state2.doc.lineAt(from);
      while (to < line.to && /\s/.test(line.text.slice(to - line.from, to + 1 - line.from)))
        to++;
      if (explode)
        ({ from, to } = explode);
      else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
        from = line.from;
      let insert2 = ["", indentString(state2, indent)];
      if (explode)
        insert2.push(indentString(state2, cx.lineIndent(line)));
      return {
        changes: { from, to, insert: Text.of(insert2) },
        range: EditorSelection.cursor(from + 1 + insert2[1].length)
      };
    });
    dispatch(state2.update(changes, { scrollIntoView: true }));
    return true;
  };
  function changeBySelectedLine(state2, f) {
    let atLine = -1;
    return state2.changeByRange((range) => {
      let changes = [];
      for (let line = state2.doc.lineAt(range.from); ; ) {
        if (line.number > atLine) {
          f(line, changes, range);
          atLine = line.number;
        }
        if (range.to <= line.to)
          break;
        line = state2.doc.lineAt(line.to + 1);
      }
      let changeSet = state2.changes(changes);
      return {
        changes,
        range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
      };
    });
  }
  var indentSelection = ({ state: state2, dispatch }) => {
    let updated = Object.create(null);
    let context = new IndentContext(state2, { overrideIndentation: (start) => {
      let found = updated[start];
      return found == null ? -1 : found;
    } });
    let changes = changeBySelectedLine(state2, (line, changes2, range) => {
      let indent = getIndentation(context, line.from);
      if (indent == null)
        return;
      let cur2 = /^\s*/.exec(line.text)[0];
      let norm = indentString(state2, indent);
      if (cur2 != norm || range.from < line.from + cur2.length) {
        updated[line.from] = indent;
        changes2.push({ from: line.from, to: line.from + cur2.length, insert: norm });
      }
    });
    if (!changes.changes.empty)
      dispatch(state2.update(changes));
    return true;
  };
  var indentMore = ({ state: state2, dispatch }) => {
    dispatch(state2.update(changeBySelectedLine(state2, (line, changes) => {
      changes.push({ from: line.from, insert: state2.facet(indentUnit) });
    })));
    return true;
  };
  var indentLess = ({ state: state2, dispatch }) => {
    dispatch(state2.update(changeBySelectedLine(state2, (line, changes) => {
      let space = /^\s*/.exec(line.text)[0];
      if (!space)
        return;
      let col = countColumn(space, 0, state2.tabSize), keep = 0;
      let insert2 = indentString(state2, Math.max(0, col - getIndentUnit(state2)));
      while (keep < space.length && keep < insert2.length && space.charCodeAt(keep) == insert2.charCodeAt(keep))
        keep++;
      changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert2.slice(keep) });
    })));
    return true;
  };
  var emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Alt-d", run: deleteGroupForward },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Alt-f", run: cursorGroupForward, shift: selectGroupForward },
    { key: "Alt-b", run: cursorGroupBackward, shift: selectGroupBackward },
    { key: "Alt-<", run: cursorDocStart },
    { key: "Alt->", run: cursorDocEnd },
    { key: "Ctrl-v", run: cursorPageDown },
    { key: "Alt-v", run: cursorPageUp }
  ];
  var standardKeymap = [
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft },
    { mac: "Cmd-ArrowLeft", run: cursorLineStart, shift: selectLineStart },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight },
    { mac: "Cmd-ArrowRight", run: cursorLineEnd, shift: selectLineEnd },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCodePointBackward },
    { key: "Delete", run: deleteCharForward },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward }
  ].concat(emacsStyleKeymap.map((b) => ({ mac: b.key, run: b.run, shift: b.shift })));
  var defaultKeymap = [
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket }
  ].concat(standardKeymap);

  // ../../node_modules/@codemirror/next/closebrackets/dist/index.js
  var defaults2 = {
    brackets: ["(", "[", "{", "'", '"'],
    before: `)]}'":;>`
  };
  var closeBracketEffect = StateEffect.define({
    map(value2, mapping) {
      let mapped = mapping.mapPos(value2, -1, MapMode.TrackAfter);
      return mapped == null ? void 0 : mapped;
    }
  });
  var skipBracketEffect = StateEffect.define({
    map(value2, mapping) {
      return mapping.mapPos(value2);
    }
  });
  var closedBracket = new class extends RangeValue {
  }();
  closedBracket.startSide = 1;
  closedBracket.endSide = -1;
  var bracketState = StateField.define({
    create() {
      return RangeSet.empty;
    },
    update(value2, tr) {
      if (tr.selection) {
        let lineStart = tr.state.doc.lineAt(tr.selection.main.head).from;
        let prevLineStart = tr.startState.doc.lineAt(tr.startState.selection.main.head).from;
        if (lineStart != tr.changes.mapPos(prevLineStart, -1))
          value2 = RangeSet.empty;
      }
      value2 = value2.map(tr.changes);
      for (let effect of tr.effects) {
        if (effect.is(closeBracketEffect))
          value2 = value2.update({ add: [closedBracket.range(effect.value, effect.value + 1)] });
        else if (effect.is(skipBracketEffect))
          value2 = value2.update({ filter: (from) => from != effect.value });
      }
      return value2;
    }
  });
  function closeBrackets() {
    return [EditorView.inputHandler.of(handleInput), bracketState];
  }
  var definedClosing = "()[]{}<>";
  function closing(ch) {
    for (let i = 0; i < definedClosing.length; i += 2)
      if (definedClosing.charCodeAt(i) == ch)
        return definedClosing.charAt(i + 1);
    return fromCodePoint(ch < 128 ? ch : ch + 1);
  }
  function config(state2, pos) {
    return state2.languageDataAt("closeBrackets", pos)[0] || defaults2;
  }
  function handleInput(view2, from, to, insert2) {
    if (view2.composing)
      return false;
    let sel = view2.state.selection.main;
    if (insert2.length > 2 || insert2.length == 2 && codePointSize(codePointAt(insert2, 0)) == 1 || from != sel.from || to != sel.to)
      return false;
    let tr = handleInsertion(view2.state, insert2);
    if (!tr)
      return false;
    view2.dispatch(tr);
    return true;
  }
  var deleteBracketPair = ({ state: state2, dispatch }) => {
    let conf = config(state2, state2.selection.main.head);
    let tokens = conf.brackets || defaults2.brackets;
    let dont = null, changes = state2.changeByRange((range) => {
      if (range.empty) {
        let before = prevChar(state2.doc, range.head);
        for (let token2 of tokens) {
          if (token2 == before && nextChar(state2.doc, range.head) == closing(codePointAt(token2, 0)))
            return {
              changes: { from: range.head - token2.length, to: range.head + token2.length },
              range: EditorSelection.cursor(range.head - token2.length),
              annotations: Transaction.userEvent.of("delete")
            };
        }
      }
      return { range: dont = range };
    });
    if (!dont)
      dispatch(state2.update(changes, { scrollIntoView: true }));
    return !dont;
  };
  var closeBracketsKeymap = [
    { key: "Backspace", run: deleteBracketPair }
  ];
  function handleInsertion(state2, ch) {
    let conf = config(state2, state2.selection.main.head);
    let tokens = conf.brackets || defaults2.brackets;
    for (let tok of tokens) {
      let closed = closing(codePointAt(tok, 0));
      if (ch == tok)
        return closed == tok ? handleSame(state2, tok, tokens.indexOf(tok + tok + tok) > -1) : handleOpen(state2, tok, closed, conf.before || defaults2.before);
      if (ch == closed && closedBracketAt(state2, state2.selection.main.from))
        return handleClose(state2, tok, closed);
    }
    return null;
  }
  function closedBracketAt(state2, pos) {
    let found = false;
    state2.field(bracketState).between(0, state2.doc.length, (from) => {
      if (from == pos)
        found = true;
    });
    return found;
  }
  function nextChar(doc2, pos) {
    let next = doc2.sliceString(pos, pos + 2);
    return next.slice(0, codePointSize(codePointAt(next, 0)));
  }
  function prevChar(doc2, pos) {
    let prev = doc2.sliceString(pos - 2, pos);
    return codePointSize(codePointAt(prev, 0)) == prev.length ? prev : prev.slice(1);
  }
  function handleOpen(state2, open, close, closeBefore) {
    let dont = null, changes = state2.changeByRange((range) => {
      if (!range.empty)
        return {
          changes: [{ insert: open, from: range.from }, { insert: close, from: range.to }],
          effects: closeBracketEffect.of(range.to + open.length),
          range: EditorSelection.range(range.anchor + open.length, range.head + open.length)
        };
      let next = nextChar(state2.doc, range.head);
      if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
        return {
          changes: { insert: open + close, from: range.head },
          effects: closeBracketEffect.of(range.head + open.length),
          range: EditorSelection.cursor(range.head + open.length)
        };
      return { range: dont = range };
    });
    return dont ? null : state2.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of("input")
    });
  }
  function handleClose(state2, _open, close) {
    let dont = null, moved = state2.selection.ranges.map((range) => {
      if (range.empty && nextChar(state2.doc, range.head) == close)
        return EditorSelection.cursor(range.head + close.length);
      return dont = range;
    });
    return dont ? null : state2.update({
      selection: EditorSelection.create(moved, state2.selection.mainIndex),
      scrollIntoView: true,
      effects: state2.selection.ranges.map(({ from }) => skipBracketEffect.of(from))
    });
  }
  function handleSame(state2, token2, allowTriple) {
    let dont = null, changes = state2.changeByRange((range) => {
      if (!range.empty)
        return {
          changes: [{ insert: token2, from: range.from }, { insert: token2, from: range.to }],
          effects: closeBracketEffect.of(range.to + token2.length),
          range: EditorSelection.range(range.anchor + token2.length, range.head + token2.length)
        };
      let pos = range.head, next = nextChar(state2.doc, pos);
      if (next == token2) {
        if (nodeStart(state2, pos)) {
          return {
            changes: { insert: token2 + token2, from: pos },
            effects: closeBracketEffect.of(pos + token2.length),
            range: EditorSelection.cursor(pos + token2.length)
          };
        } else if (closedBracketAt(state2, pos)) {
          let isTriple = allowTriple && state2.sliceDoc(pos, pos + token2.length * 3) == token2 + token2 + token2;
          return {
            range: EditorSelection.cursor(pos + token2.length * (isTriple ? 3 : 1)),
            effects: skipBracketEffect.of(pos)
          };
        }
      } else if (allowTriple && state2.sliceDoc(pos - 2 * token2.length, pos) == token2 + token2 && nodeStart(state2, pos - 2 * token2.length)) {
        return {
          changes: { insert: token2 + token2 + token2 + token2, from: pos },
          effects: closeBracketEffect.of(pos + token2.length),
          range: EditorSelection.cursor(pos + token2.length)
        };
      } else if (state2.charCategorizer(pos)(next) != CharCategory.Word) {
        let prev = state2.sliceDoc(pos - 1, pos);
        if (prev != token2 && state2.charCategorizer(pos)(prev) != CharCategory.Word)
          return {
            changes: { insert: token2 + token2, from: pos },
            effects: closeBracketEffect.of(pos + token2.length),
            range: EditorSelection.cursor(pos + token2.length)
          };
      }
      return { range: dont = range };
    });
    return dont ? null : state2.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of("input")
    });
  }
  function nodeStart(state2, pos) {
    let tree = syntaxTree(state2).resolve(pos + 1);
    return tree.parent && tree.from == pos;
  }

  // ../../node_modules/@codemirror/next/search/dist/index.js
  var basicNormalize = typeof String.prototype.normalize == "function" ? (x) => x.normalize("NFKD") : (x) => x;
  var SearchCursor = class {
    constructor(text, query, from = 0, to = text.length, normalize) {
      this.value = { from: 0, to: 0 };
      this.done = false;
      this.matches = [];
      this.buffer = "";
      this.bufferPos = 0;
      this.iter = text.iterRange(from, to);
      this.bufferStart = from;
      this.normalize = normalize ? (x) => normalize(basicNormalize(x)) : basicNormalize;
      this.query = this.normalize(query);
    }
    peek() {
      if (this.bufferPos == this.buffer.length) {
        this.bufferStart += this.buffer.length;
        this.iter.next();
        if (this.iter.done)
          return -1;
        this.bufferPos = 0;
        this.buffer = this.iter.value;
      }
      return this.buffer.charCodeAt(this.bufferPos);
    }
    next() {
      for (; ; ) {
        let next = this.peek();
        if (next < 0) {
          this.done = true;
          return this;
        }
        let str = String.fromCharCode(next), start = this.bufferStart + this.bufferPos;
        this.bufferPos++;
        for (; ; ) {
          let peek = this.peek();
          if (peek < 56320 || peek >= 57344)
            break;
          this.bufferPos++;
          str += String.fromCharCode(peek);
        }
        let norm = this.normalize(str);
        for (let i = 0, pos = start; ; i++) {
          let code = norm.charCodeAt(i);
          let match2 = this.match(code, pos);
          if (match2) {
            this.value = match2;
            return this;
          }
          if (i == norm.length - 1)
            break;
          if (pos == start && i < str.length && str.charCodeAt(i) == code)
            pos++;
        }
      }
    }
    match(code, pos) {
      let match2 = null;
      for (let i = 0; i < this.matches.length; i += 2) {
        let index = this.matches[i], keep = false;
        if (this.query.charCodeAt(index) == code) {
          if (index == this.query.length - 1) {
            match2 = { from: this.matches[i + 1], to: pos + 1 };
          } else {
            this.matches[i]++;
            keep = true;
          }
        }
        if (!keep) {
          this.matches.splice(i, 2);
          i -= 2;
        }
      }
      if (this.query.charCodeAt(0) == code) {
        if (this.query.length == 1)
          match2 = { from: pos, to: pos + 1 };
        else
          this.matches.push(1, pos);
      }
      return match2;
    }
  };
  function createLineDialog(view2) {
    let dom = document.createElement("form");
    dom.innerHTML = `<label>${view2.state.phrase("Go to line:")} <input class=${themeClass("textfield")} name=line></label>
<button class=${themeClass("button")} type=submit>${view2.state.phrase("go")}</button>`;
    let input = dom.querySelector("input");
    function go() {
      let match2 = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(input.value);
      if (!match2)
        return;
      let { state: state2 } = view2, startLine = state2.doc.lineAt(state2.selection.main.head);
      let [, sign, ln, cl, percent] = match2;
      let col = cl ? +cl.slice(1) : 0;
      let line = ln ? +ln : startLine.number;
      if (ln && percent) {
        let pc = line / 100;
        if (sign)
          pc = pc * (sign == "-" ? -1 : 1) + startLine.number / state2.doc.lines;
        line = Math.round(state2.doc.lines * pc);
      } else if (ln && sign) {
        line = line * (sign == "-" ? -1 : 1) + startLine.number;
      }
      let docLine = state2.doc.line(Math.max(1, Math.min(state2.doc.lines, line)));
      view2.dispatch({
        effects: dialogEffect.of(false),
        selection: EditorSelection.cursor(docLine.from + Math.max(0, Math.min(col, docLine.length))),
        scrollIntoView: true
      });
      view2.focus();
    }
    dom.addEventListener("keydown", (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        view2.dispatch({ effects: dialogEffect.of(false) });
        view2.focus();
      } else if (event.keyCode == 13) {
        event.preventDefault();
        go();
      }
    });
    dom.addEventListener("submit", go);
    return { dom, style: "gotoLine", pos: -10 };
  }
  var dialogEffect = StateEffect.define();
  var dialogField = StateField.define({
    create() {
      return true;
    },
    update(value2, tr) {
      for (let e of tr.effects)
        if (e.is(dialogEffect))
          value2 = e.value;
      return value2;
    },
    provide: (f) => showPanel.computeN([f], (s) => s.field(f) ? [createLineDialog] : [])
  });
  var gotoLine = (view2) => {
    let panel = getPanel(view2, createLineDialog);
    if (!panel) {
      view2.dispatch({
        reconfigure: view2.state.field(dialogField, false) == null ? { append: [panels(), dialogField, baseTheme8] } : void 0,
        effects: dialogEffect.of(true)
      });
      panel = getPanel(view2, createLineDialog);
    }
    if (panel)
      panel.dom.querySelector("input").focus();
    return true;
  };
  var baseTheme8 = EditorView.baseTheme({
    "$panel.gotoLine": {
      padding: "2px 6px 4px",
      "& label": { fontSize: "80%" }
    }
  });
  var defaultHighlightOptions = {
    highlightWordAroundCursor: false,
    minSelectionLength: 1,
    maxMatches: 100
  };
  var highlightConfig = Facet.define({
    combine(options) {
      return combineConfig(options, defaultHighlightOptions, {
        highlightWordAroundCursor: (a, b) => a || b,
        minSelectionLength: Math.min,
        maxMatches: Math.min
      });
    }
  });
  function highlightSelectionMatches(options) {
    let ext = [defaultTheme, matchHighlighter];
    if (options)
      ext.push(highlightConfig.of(options));
    return ext;
  }
  function wordAt(doc2, pos, check) {
    let line = doc2.lineAt(pos);
    let from = pos - line.from, to = pos - line.from;
    while (from > 0) {
      let prev = findClusterBreak(line.text, from, false);
      if (check(line.text.slice(prev, from)) != CharCategory.Word)
        break;
      from = prev;
    }
    while (to < line.length) {
      let next = findClusterBreak(line.text, to);
      if (check(line.text.slice(to, next)) != CharCategory.Word)
        break;
      to = next;
    }
    return from == to ? null : line.text.slice(from, to);
  }
  var matchDeco = Decoration.mark({ class: themeClass("selectionMatch") });
  var mainMatchDeco = Decoration.mark({ class: themeClass("selectionMatch.main") });
  var matchHighlighter = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.decorations = this.getDeco(view2);
    }
    update(update) {
      if (update.selectionSet || update.docChanged || update.viewportChanged)
        this.decorations = this.getDeco(update.view);
    }
    getDeco(view2) {
      let conf = view2.state.facet(highlightConfig);
      let { state: state2 } = view2, sel = state2.selection;
      if (sel.ranges.length > 1)
        return Decoration.none;
      let range = sel.main, query, check = null;
      if (range.empty) {
        if (!conf.highlightWordAroundCursor)
          return Decoration.none;
        check = state2.charCategorizer(range.head);
        query = wordAt(state2.doc, range.head, check);
        if (!query)
          return Decoration.none;
      } else {
        let len = range.to - range.from;
        if (len < conf.minSelectionLength || len > 200)
          return Decoration.none;
        query = state2.sliceDoc(range.from, range.to).trim();
        if (!query)
          return Decoration.none;
      }
      let deco = [];
      for (let part of view2.visibleRanges) {
        let cursor = new SearchCursor(state2.doc, query, part.from, part.to);
        while (!cursor.next().done) {
          let { from, to } = cursor.value;
          if (!check || (from == 0 || check(state2.sliceDoc(from - 1, from)) != CharCategory.Word) && (to == state2.doc.length || check(state2.sliceDoc(to, to + 1)) != CharCategory.Word)) {
            if (check && from <= range.from && to >= range.to)
              deco.push(mainMatchDeco.range(from, to));
            else if (from >= range.to || to <= range.from)
              deco.push(matchDeco.range(from, to));
            if (deco.length > conf.maxMatches)
              return Decoration.none;
          }
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });
  var defaultTheme = EditorView.baseTheme({
    "$selectionMatch": { backgroundColor: "#99ff7780" },
    "$searchMatch $selectionMatch": { backgroundColor: "transparent" }
  });
  var Query = class {
    constructor(search, replace, caseInsensitive) {
      this.search = search;
      this.replace = replace;
      this.caseInsensitive = caseInsensitive;
    }
    eq(other) {
      return this.search == other.search && this.replace == other.replace && this.caseInsensitive == other.caseInsensitive;
    }
    cursor(doc2, from = 0, to = doc2.length) {
      return new SearchCursor(doc2, this.search, from, to, this.caseInsensitive ? (x) => x.toLowerCase() : void 0);
    }
    get valid() {
      return !!this.search;
    }
  };
  var setQuery = StateEffect.define();
  var togglePanel2 = StateEffect.define();
  var searchState = StateField.define({
    create() {
      return new SearchState(new Query("", "", false), []);
    },
    update(value2, tr) {
      for (let effect of tr.effects) {
        if (effect.is(setQuery))
          value2 = new SearchState(effect.value, value2.panel);
        else if (effect.is(togglePanel2))
          value2 = new SearchState(value2.query, effect.value ? [createSearchPanel] : []);
      }
      return value2;
    },
    provide: (f) => showPanel.computeN([f], (s) => s.field(f).panel)
  });
  var SearchState = class {
    constructor(query, panel) {
      this.query = query;
      this.panel = panel;
    }
  };
  var matchMark = Decoration.mark({ class: themeClass("searchMatch") });
  var selectedMatchMark = Decoration.mark({ class: themeClass("searchMatch.selected") });
  var searchHighlighter = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.decorations = this.highlight(view2.state.field(searchState));
    }
    update(update) {
      let state2 = update.state.field(searchState);
      if (state2 != update.startState.field(searchState) || update.docChanged || update.selectionSet)
        this.decorations = this.highlight(state2);
    }
    highlight({ query, panel }) {
      if (!panel.length || !query.valid)
        return Decoration.none;
      let state2 = this.view.state, viewport = this.view.viewport;
      let cursor = query.cursor(state2.doc, Math.max(0, viewport.from - query.search.length), Math.min(viewport.to + query.search.length, state2.doc.length));
      let builder = new RangeSetBuilder();
      while (!cursor.next().done) {
        let { from, to } = cursor.value;
        let selected = state2.selection.ranges.some((r) => r.from == from && r.to == to);
        builder.add(from, to, selected ? selectedMatchMark : matchMark);
      }
      return builder.finish();
    }
  }, {
    decorations: (v) => v.decorations
  });
  function searchCommand(f) {
    return (view2) => {
      let state2 = view2.state.field(searchState, false);
      return state2 && state2.query.valid ? f(view2, state2) : openSearchPanel(view2);
    };
  }
  function findNextMatch(doc2, from, query) {
    let cursor = query.cursor(doc2, from).next();
    if (cursor.done) {
      cursor = query.cursor(doc2, 0, from + query.search.length - 1).next();
      if (cursor.done)
        return null;
    }
    return cursor.value;
  }
  var findNext = searchCommand((view2, state2) => {
    let { from, to } = view2.state.selection.main;
    let next = findNextMatch(view2.state.doc, view2.state.selection.main.from + 1, state2.query);
    if (!next || next.from == from && next.to == to)
      return false;
    view2.dispatch({ selection: { anchor: next.from, head: next.to }, scrollIntoView: true });
    maybeAnnounceMatch(view2);
    return true;
  });
  var FindPrevChunkSize = 1e4;
  function findPrevInRange(query, doc2, from, to) {
    for (let pos = to; ; ) {
      let start = Math.max(from, pos - FindPrevChunkSize - query.search.length);
      let cursor = query.cursor(doc2, start, pos), range = null;
      while (!cursor.next().done)
        range = cursor.value;
      if (range)
        return range;
      if (start == from)
        return null;
      pos -= FindPrevChunkSize;
    }
  }
  var findPrevious = searchCommand((view2, { query }) => {
    let { state: state2 } = view2;
    let range = findPrevInRange(query, state2.doc, 0, state2.selection.main.to - 1) || findPrevInRange(query, state2.doc, state2.selection.main.from + 1, state2.doc.length);
    if (!range)
      return false;
    view2.dispatch({ selection: { anchor: range.from, head: range.to }, scrollIntoView: true });
    maybeAnnounceMatch(view2);
    return true;
  });
  var selectMatches = searchCommand((view2, { query }) => {
    let cursor = query.cursor(view2.state.doc), ranges = [];
    while (!cursor.next().done)
      ranges.push(EditorSelection.range(cursor.value.from, cursor.value.to));
    if (!ranges.length)
      return false;
    view2.dispatch({ selection: EditorSelection.create(ranges) });
    return true;
  });
  var selectSelectionMatches = ({ state: state2, dispatch }) => {
    let sel = state2.selection;
    if (sel.ranges.length > 1 || sel.main.empty)
      return false;
    let { from, to } = sel.main;
    let ranges = [], main = 0;
    for (let cur2 = new SearchCursor(state2.doc, state2.sliceDoc(from, to)); !cur2.next().done; ) {
      if (ranges.length > 1e3)
        return false;
      if (cur2.value.from == from)
        main = ranges.length;
      ranges.push(EditorSelection.range(cur2.value.from, cur2.value.to));
    }
    dispatch(state2.update({ selection: new EditorSelection(ranges, main) }));
    return true;
  };
  var replaceNext = searchCommand((view2, { query }) => {
    let { state: state2 } = view2, next = findNextMatch(state2.doc, state2.selection.main.from, query);
    if (!next)
      return false;
    let { from, to } = state2.selection.main, changes = [], selection;
    if (next.from == from && next.to == to) {
      changes.push({ from: next.from, to: next.to, insert: query.replace });
      next = findNextMatch(state2.doc, next.to, query);
    }
    if (next) {
      let off = changes.length == 0 || changes[0].from >= next.to ? 0 : next.to - next.from - query.replace.length;
      selection = { anchor: next.from - off, head: next.to - off };
    }
    view2.dispatch({ changes, selection, scrollIntoView: !!selection });
    if (next)
      maybeAnnounceMatch(view2);
    return true;
  });
  var replaceAll = searchCommand((view2, { query }) => {
    let cursor = query.cursor(view2.state.doc), changes = [];
    while (!cursor.next().done) {
      let { from, to } = cursor.value;
      changes.push({ from, to, insert: query.replace });
    }
    if (!changes.length)
      return false;
    view2.dispatch({ changes });
    return true;
  });
  function createSearchPanel(view2) {
    let { query } = view2.state.field(searchState);
    return {
      dom: buildPanel({
        view: view2,
        query,
        updateQuery(q) {
          if (!query.eq(q)) {
            query = q;
            view2.dispatch({ effects: setQuery.of(query) });
          }
        }
      }),
      mount() {
        this.dom.querySelector("[name=search]").select();
      },
      pos: 80,
      style: "search"
    };
  }
  var openSearchPanel = (view2) => {
    let state2 = view2.state.field(searchState, false);
    if (state2 && state2.panel.length) {
      let panel = getPanel(view2, createSearchPanel);
      if (!panel)
        return false;
      panel.dom.querySelector("[name=search]").focus();
    } else {
      view2.dispatch({
        effects: togglePanel2.of(true),
        reconfigure: state2 ? void 0 : { append: searchExtensions }
      });
    }
    return true;
  };
  var closeSearchPanel = (view2) => {
    let state2 = view2.state.field(searchState, false);
    if (!state2 || !state2.panel.length)
      return false;
    let panel = getPanel(view2, createSearchPanel);
    if (panel && panel.dom.contains(view2.root.activeElement))
      view2.focus();
    view2.dispatch({ effects: togglePanel2.of(false) });
    return true;
  };
  var searchKeymap = [
    { key: "Mod-f", run: openSearchPanel, scope: "editor search-panel" },
    { key: "F3", run: findNext, shift: findPrevious, scope: "editor search-panel" },
    { key: "Mod-g", run: findNext, shift: findPrevious, scope: "editor search-panel" },
    { key: "Escape", run: closeSearchPanel, scope: "editor search-panel" },
    { key: "Mod-Shift-l", run: selectSelectionMatches },
    { key: "Alt-g", run: gotoLine }
  ];
  function buildPanel(conf) {
    function p(phrase) {
      return conf.view.state.phrase(phrase);
    }
    let searchField = crelt("input", {
      value: conf.query.search,
      placeholder: p("Find"),
      "aria-label": p("Find"),
      class: themeClass("textfield"),
      name: "search",
      onchange: update,
      onkeyup: update
    });
    let replaceField = crelt("input", {
      value: conf.query.replace,
      placeholder: p("Replace"),
      "aria-label": p("Replace"),
      class: themeClass("textfield"),
      name: "replace",
      onchange: update,
      onkeyup: update
    });
    let caseField = crelt("input", {
      type: "checkbox",
      name: "case",
      checked: !conf.query.caseInsensitive,
      onchange: update
    });
    function update() {
      conf.updateQuery(new Query(searchField.value, replaceField.value, !caseField.checked));
    }
    function keydown(e) {
      if (runScopeHandlers(conf.view, e, "search-panel")) {
        e.preventDefault();
      } else if (e.keyCode == 13 && e.target == searchField) {
        e.preventDefault();
        (e.shiftKey ? findPrevious : findNext)(conf.view);
      } else if (e.keyCode == 13 && e.target == replaceField) {
        e.preventDefault();
        replaceNext(conf.view);
      }
    }
    function button(name2, onclick, content2) {
      return crelt("button", { class: themeClass("button"), name: name2, onclick }, content2);
    }
    let panel = crelt("div", { onkeydown: keydown }, [
      searchField,
      button("next", () => findNext(conf.view), [p("next")]),
      button("prev", () => findPrevious(conf.view), [p("previous")]),
      button("select", () => selectMatches(conf.view), [p("all")]),
      crelt("label", null, [caseField, "match case"]),
      crelt("br"),
      replaceField,
      button("replace", () => replaceNext(conf.view), [p("replace")]),
      button("replaceAll", () => replaceAll(conf.view), [p("replace all")]),
      crelt("button", { name: "close", onclick: () => closeSearchPanel(conf.view), "aria-label": p("close") }, ["\xD7"]),
      crelt("div", { style: "position: absolute; top: -10000px", "aria-live": "polite" })
    ]);
    return panel;
  }
  var AnnounceMargin = 30;
  var Break = /[\s\.,:;?!]/;
  function maybeAnnounceMatch(view2) {
    let { from, to } = view2.state.selection.main;
    let lineStart = view2.state.doc.lineAt(from).from, lineEnd = view2.state.doc.lineAt(to).to;
    let start = Math.max(lineStart, from - AnnounceMargin), end = Math.min(lineEnd, to + AnnounceMargin);
    let text = view2.state.sliceDoc(start, end);
    if (start != lineStart) {
      for (let i = 0; i < AnnounceMargin; i++)
        if (!Break.test(text[i + 1]) && Break.test(text[i])) {
          text = text.slice(i);
          break;
        }
    }
    if (end != lineEnd) {
      for (let i = text.length - 1; i > text.length - AnnounceMargin; i--)
        if (!Break.test(text[i - 1]) && Break.test(text[i])) {
          text = text.slice(0, i);
          break;
        }
    }
    let panel = getPanel(view2, createSearchPanel);
    if (!panel || !panel.dom.contains(view2.root.activeElement))
      return;
    let live = panel.dom.querySelector("div[aria-live]");
    live.textContent = view2.state.phrase("current match") + ". " + text;
  }
  var baseTheme$1 = EditorView.baseTheme({
    "$panel.search": {
      padding: "2px 6px 4px",
      position: "relative",
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "4px",
        backgroundColor: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      },
      "& input, & button": {
        margin: ".2em .5em .2em 0"
      },
      "& label": {
        fontSize: "80%"
      }
    },
    "$$light $searchMatch": { backgroundColor: "#ffff0054" },
    "$$dark $searchMatch": { backgroundColor: "#00ffff8a" },
    "$$light $searchMatch.selected": { backgroundColor: "#ff6a0054" },
    "$$dark $searchMatch.selected": { backgroundColor: "#ff00ff8a" }
  });
  var searchExtensions = [
    searchState,
    Prec.override(searchHighlighter),
    panels(),
    baseTheme$1
  ];

  // ../../node_modules/@codemirror/next/autocomplete/dist/index.js
  var CompletionContext = class {
    constructor(state2, pos, explicit) {
      this.state = state2;
      this.pos = pos;
      this.explicit = explicit;
      this.abortListeners = [];
    }
    tokenBefore(types2) {
      let token2 = syntaxTree(this.state).resolve(this.pos, -1);
      while (token2 && types2.indexOf(token2.name) < 0)
        token2 = token2.parent;
      return token2 ? {
        from: token2.from,
        to: this.pos,
        text: this.state.sliceDoc(token2.from, this.pos),
        type: token2.type
      } : null;
    }
    matchBefore(expr) {
      let line = this.state.doc.lineAt(this.pos);
      let start = Math.max(line.from, this.pos - 250);
      let str = line.text.slice(start - line.from, this.pos - line.from);
      let found = str.search(ensureAnchor(expr, false));
      return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    get aborted() {
      return this.abortListeners == null;
    }
    addEventListener(type2, listener) {
      if (type2 == "abort" && this.abortListeners)
        this.abortListeners.push(listener);
    }
  };
  function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
      flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
  }
  function prefixMatch(options) {
    let first2 = Object.create(null), rest2 = Object.create(null);
    for (let { label: label2 } of options) {
      first2[label2[0]] = true;
      for (let i = 1; i < label2.length; i++)
        rest2[label2[i]] = true;
    }
    let source2 = toSet(first2) + toSet(rest2) + "*$";
    return [new RegExp("^" + source2), new RegExp(source2)];
  }
  function completeFromList(list) {
    let options = list.map((o) => typeof o == "string" ? { label: o } : o);
    let [span, match2] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context) => {
      let token2 = context.matchBefore(match2);
      return token2 || context.explicit ? { from: token2 ? token2.from : context.pos, options, span } : null;
    };
  }
  var Option = class {
    constructor(completion, source2, match2) {
      this.completion = completion;
      this.source = source2;
      this.match = match2;
    }
  };
  function cur(state2) {
    return state2.selection.main.head;
  }
  function ensureAnchor(expr, start) {
    var _a;
    let { source: source2 } = expr;
    let addStart = start && source2[0] != "^", addEnd = source2[source2.length - 1] != "$";
    if (!addStart && !addEnd)
      return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source2})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : expr.ignoreCase ? "i" : "");
  }
  function applyCompletion(view2, option2) {
    let apply = option2.completion.apply || option2.completion.label;
    let result = option2.source;
    if (typeof apply == "string") {
      view2.dispatch({
        changes: { from: result.from, to: result.to, insert: apply },
        selection: { anchor: result.from + apply.length }
      });
    } else {
      apply(view2, option2.completion, result.from, result.to);
    }
  }
  var SourceCache = new WeakMap();
  function asSource(source2) {
    if (!Array.isArray(source2))
      return source2;
    let known = SourceCache.get(source2);
    if (!known)
      SourceCache.set(source2, known = completeFromList(source2));
    return known;
  }
  var FuzzyMatcher = class {
    constructor(pattern) {
      this.pattern = pattern;
      this.chars = [];
      this.folded = [];
      this.any = [];
      this.precise = [];
      this.byWord = [];
      for (let p = 0; p < pattern.length; ) {
        let char = codePointAt(pattern, p), size = codePointSize(char);
        this.chars.push(char);
        let part = pattern.slice(p, p + size), upper = part.toUpperCase();
        this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
        p += size;
      }
      this.astral = pattern.length != this.chars.length;
    }
    match(word) {
      if (this.pattern.length == 0)
        return [0];
      if (word.length < this.pattern.length)
        return null;
      let { chars, folded, any, precise, byWord } = this;
      if (chars.length == 1) {
        let first2 = codePointAt(word, 0);
        return first2 == chars[0] ? [0, 0, codePointSize(first2)] : first2 == folded[0] ? [-200, 0, codePointSize(first2)] : null;
      }
      let direct = word.indexOf(this.pattern);
      if (direct == 0)
        return [0, 0, this.pattern.length];
      let len = chars.length, anyTo = 0;
      if (direct < 0) {
        for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
          let next = codePointAt(word, i);
          if (next == chars[anyTo] || next == folded[anyTo])
            any[anyTo++] = i;
          i += codePointSize(next);
        }
        if (anyTo < len)
          return null;
      }
      let preciseTo = 0;
      let byWordTo = 0, byWordFolded = false;
      let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
      for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
        let next = codePointAt(word, i);
        if (direct < 0) {
          if (preciseTo < len && next == chars[preciseTo])
            precise[preciseTo++] = i;
          if (adjacentTo < len) {
            if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
              if (adjacentTo == 0)
                adjacentStart = i;
              adjacentEnd = i;
              adjacentTo++;
            } else {
              adjacentTo = 0;
            }
          }
        }
        let ch, type2 = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
        if (type2 == 1 || prevType == 0 && type2 != 0 && (this.chars[byWordTo] == next || this.folded[byWordTo] == next && (byWordFolded = true)))
          byWord[byWordTo++] = i;
        prevType = type2;
        i += codePointSize(next);
      }
      if (byWordTo == len && byWord[0] == 0)
        return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
      if (adjacentTo == len && adjacentStart == 0)
        return [-200, 0, adjacentEnd];
      if (direct > -1)
        return [-700, direct, direct + this.pattern.length];
      if (adjacentTo == len)
        return [-200 + -700, adjacentStart, adjacentEnd];
      if (byWordTo == len)
        return this.result(-100 + (byWordFolded ? -200 : 0) + -700, byWord, word);
      return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
    }
    result(score2, positions, word) {
      let result = [score2], i = 1;
      for (let pos of positions) {
        let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
        if (i > 1 && result[i - 1] == pos)
          result[i - 1] = to;
        else {
          result[i++] = pos;
          result[i++] = to;
        }
      }
      return result;
    }
  };
  var completionConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        activateOnTyping: true,
        override: null,
        maxRenderedOptions: 100,
        defaultKeymap: true
      }, {
        defaultKeymap: (a, b) => a && b
      });
    }
  });
  var MaxInfoWidth = 300;
  var baseTheme9 = EditorView.baseTheme({
    "$tooltip.autocomplete": {
      "& > ul": {
        fontFamily: "monospace",
        overflowY: "auto",
        whiteSpace: "nowrap",
        maxHeight: "10em",
        listStyle: "none",
        margin: 0,
        padding: 0,
        "& > li": {
          cursor: "pointer",
          padding: "1px 1em 1px 3px",
          lineHeight: 1.2
        },
        "& > li[aria-selected]": {
          background_fallback: "#bdf",
          backgroundColor: "Highlight",
          color_fallback: "white",
          color: "HighlightText"
        }
      }
    },
    "$completionListIncompleteTop:before, $completionListIncompleteBottom:after": {
      content: '"\xB7\xB7\xB7"',
      opacity: 0.5,
      display: "block",
      textAlign: "center"
    },
    "$tooltip.completionInfo": {
      position: "absolute",
      padding: "3px 9px",
      width: "max-content",
      maxWidth: MaxInfoWidth + "px"
    },
    "$tooltip.completionInfo.left": { right: "100%" },
    "$tooltip.completionInfo.right": { left: "100%" },
    "$$light $snippetField": { backgroundColor: "#ddd" },
    "$$dark $snippetField": { backgroundColor: "#333" },
    "$snippetFieldPosition": {
      verticalAlign: "text-top",
      width: 0,
      height: "1.15em",
      margin: "0 -0.7px -.7em",
      borderLeft: "1.4px dotted #888"
    },
    $completionMatchedText: {
      textDecoration: "underline"
    },
    $completionDetail: {
      marginLeft: "0.5em",
      fontStyle: "italic"
    },
    $completionIcon: {
      fontSize: "90%",
      width: ".8em",
      display: "inline-block",
      textAlign: "center",
      paddingRight: ".6em",
      opacity: "0.6"
    },
    "$completionIcon.function, $completionIcon.method": {
      "&:after": { content: "'\u0192'" }
    },
    "$completionIcon.class": {
      "&:after": { content: "'\u25CB'" }
    },
    "$completionIcon.interface": {
      "&:after": { content: "'\u25CC'" }
    },
    "$completionIcon.variable": {
      "&:after": { content: "'\u{1D465}'" }
    },
    "$completionIcon.constant": {
      "&:after": { content: "'\u{1D436}'" }
    },
    "$completionIcon.type": {
      "&:after": { content: "'\u{1D461}'" }
    },
    "$completionIcon.enum": {
      "&:after": { content: "'\u222A'" }
    },
    "$completionIcon.property": {
      "&:after": { content: "'\u25A1'" }
    },
    "$completionIcon.keyword": {
      "&:after": { content: "'\u{1F511}\uFE0E'" }
    },
    "$completionIcon.namespace": {
      "&:after": { content: "'\u25A2'" }
    },
    "$completionIcon.text": {
      "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
    }
  });
  function createListBox(options, id, range) {
    const ul = document.createElement("ul");
    ul.id = id;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    for (let i = range.from; i < range.to; i++) {
      let { completion, match: match2 } = options[i];
      const li = ul.appendChild(document.createElement("li"));
      li.id = id + "-" + i;
      let icon = li.appendChild(document.createElement("div"));
      icon.className = themeClass("completionIcon" + (completion.type ? "." + completion.type : ""));
      icon.setAttribute("aria-hidden", "true");
      let labelElt = li.appendChild(document.createElement("span"));
      labelElt.className = themeClass("completionLabel");
      let { label: label2, detail } = completion, off = 0;
      for (let j = 1; j < match2.length; ) {
        let from = match2[j++], to = match2[j++];
        if (from > off)
          labelElt.appendChild(document.createTextNode(label2.slice(off, from)));
        let span = labelElt.appendChild(document.createElement("span"));
        span.appendChild(document.createTextNode(label2.slice(from, to)));
        span.className = themeClass("completionMatchedText");
        off = to;
      }
      if (off < label2.length)
        labelElt.appendChild(document.createTextNode(label2.slice(off)));
      if (detail) {
        let detailElt = li.appendChild(document.createElement("span"));
        detailElt.className = themeClass("completionDetail");
        detailElt.textContent = detail;
      }
      li.setAttribute("role", "option");
    }
    if (range.from)
      ul.classList.add(themeClass("completionListIncompleteTop"));
    if (range.to < options.length)
      ul.classList.add(themeClass("completionListIncompleteBottom"));
    return ul;
  }
  function createInfoDialog(option2) {
    let dom = document.createElement("div");
    dom.className = themeClass("tooltip.completionInfo");
    let { info } = option2.completion;
    if (typeof info == "string")
      dom.textContent = info;
    else
      dom.appendChild(info(option2.completion));
    return dom;
  }
  function rangeAroundSelected(total, selected, max) {
    if (total <= max)
      return { from: 0, to: total };
    if (selected <= total >> 1) {
      let off2 = Math.floor(selected / max);
      return { from: off2 * max, to: (off2 + 1) * max };
    }
    let off = Math.floor((total - selected) / max);
    return { from: total - (off + 1) * max, to: total - off * max };
  }
  var CompletionTooltip = class {
    constructor(view2, stateField) {
      this.view = view2;
      this.stateField = stateField;
      this.info = null;
      this.placeInfo = {
        read: () => this.measureInfo(),
        write: (pos) => this.positionInfo(pos),
        key: this
      };
      let cState = view2.state.field(stateField);
      let { options, selected } = cState.open;
      let config2 = view2.state.facet(completionConfig);
      this.range = rangeAroundSelected(options.length, selected, config2.maxRenderedOptions);
      this.dom = document.createElement("div");
      this.dom.addEventListener("mousedown", (e) => {
        for (let dom = e.target, match2; dom && dom != this.dom; dom = dom.parentNode) {
          if (dom.nodeName == "LI" && (match2 = /-(\d+)$/.exec(dom.id)) && +match2[1] < options.length) {
            applyCompletion(view2, options[+match2[1]]);
            e.preventDefault();
            return;
          }
        }
      });
      this.list = this.dom.appendChild(createListBox(options, cState.id, this.range));
      this.list.addEventListener("scroll", () => {
        if (this.info)
          this.view.requestMeasure(this.placeInfo);
      });
    }
    mount() {
      this.updateSel();
    }
    update(update) {
      if (update.state.field(this.stateField) != update.startState.field(this.stateField))
        this.updateSel();
    }
    positioned() {
      if (this.info)
        this.view.requestMeasure(this.placeInfo);
    }
    updateSel() {
      let cState = this.view.state.field(this.stateField), open = cState.open;
      if (open.selected < this.range.from || open.selected >= this.range.to) {
        this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
        this.list.remove();
        this.list = this.dom.appendChild(createListBox(open.options, cState.id, this.range));
        this.list.addEventListener("scroll", () => {
          if (this.info)
            this.view.requestMeasure(this.placeInfo);
        });
      }
      if (this.updateSelectedOption(open.selected)) {
        if (this.info) {
          this.info.remove();
          this.info = null;
        }
        let option2 = open.options[open.selected];
        if (option2.completion.info) {
          this.info = this.dom.appendChild(createInfoDialog(option2));
          this.view.requestMeasure(this.placeInfo);
        }
      }
    }
    updateSelectedOption(selected) {
      let set = null;
      for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
        if (i == selected) {
          if (!opt.hasAttribute("aria-selected")) {
            opt.setAttribute("aria-selected", "true");
            set = opt;
          }
        } else {
          if (opt.hasAttribute("aria-selected"))
            opt.removeAttribute("aria-selected");
        }
      }
      if (set)
        scrollIntoView(this.list, set);
      return set;
    }
    measureInfo() {
      let sel = this.dom.querySelector("[aria-selected]");
      if (!sel)
        return null;
      let rect = this.dom.getBoundingClientRect();
      let top2 = sel.getBoundingClientRect().top - rect.top;
      if (top2 < 0 || top2 > this.list.clientHeight - 10)
        return null;
      let left = this.view.textDirection == Direction.RTL;
      let spaceLeft = rect.left, spaceRight = innerWidth - rect.right;
      if (left && spaceLeft < Math.min(MaxInfoWidth, spaceRight))
        left = false;
      else if (!left && spaceRight < Math.min(MaxInfoWidth, spaceLeft))
        left = true;
      return { top: top2, left };
    }
    positionInfo(pos) {
      if (this.info && pos) {
        this.info.style.top = pos.top + "px";
        this.info.classList.toggle("cm-tooltip-completionInfo-left", pos.left);
        this.info.classList.toggle("cm-tooltip-completionInfo-right", !pos.left);
      }
    }
  };
  function completionTooltip(stateField) {
    return (view2) => new CompletionTooltip(view2, stateField);
  }
  function scrollIntoView(container, element) {
    let parent = container.getBoundingClientRect();
    let self = element.getBoundingClientRect();
    if (self.top < parent.top)
      container.scrollTop -= parent.top - self.top;
    else if (self.bottom > parent.bottom)
      container.scrollTop += self.bottom - parent.bottom;
  }
  var MaxOptions = 300;
  function score(option2) {
    return (option2.boost || 0) * 100 + (option2.apply ? 10 : 0) + (option2.info ? 5 : 0) + (option2.type ? 1 : 0);
  }
  function sortOptions(active, state2) {
    let options = [];
    for (let a of active)
      if (a.hasResult()) {
        let matcher = new FuzzyMatcher(state2.sliceDoc(a.from, a.to)), match2;
        for (let option2 of a.result.options)
          if (match2 = matcher.match(option2.label)) {
            if (option2.boost != null)
              match2[0] += option2.boost;
            options.push(new Option(option2, a, match2));
          }
      }
    options.sort(cmpOption);
    let result = [], prev = null;
    for (let opt of options.sort(cmpOption)) {
      if (result.length == MaxOptions)
        break;
      if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail)
        result.push(opt);
      else if (score(opt.completion) > score(prev))
        result[result.length - 1] = opt;
      prev = opt.completion;
    }
    return result;
  }
  var CompletionDialog = class {
    constructor(options, attrs, tooltip, timestamp, selected) {
      this.options = options;
      this.attrs = attrs;
      this.tooltip = tooltip;
      this.timestamp = timestamp;
      this.selected = selected;
    }
    setSelected(selected, id) {
      return selected == this.selected || selected >= this.options.length ? this : new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected);
    }
    static build(active, state2, id, prev) {
      let options = sortOptions(active, state2);
      if (!options.length)
        return null;
      let selected = 0;
      if (prev) {
        let selectedValue = prev.options[prev.selected].completion;
        for (let i = 0; i < options.length && !selected; i++) {
          if (options[i].completion == selectedValue)
            selected = i;
        }
      }
      return new CompletionDialog(options, makeAttrs(id, selected), [{
        pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
        style: "autocomplete",
        create: completionTooltip(completionState)
      }], prev ? prev.timestamp : Date.now(), selected);
    }
    map(changes) {
      return new CompletionDialog(this.options, this.attrs, [Object.assign(Object.assign({}, this.tooltip[0]), { pos: changes.mapPos(this.tooltip[0].pos) })], this.timestamp, this.selected);
    }
  };
  var CompletionState = class {
    constructor(active, id, open) {
      this.active = active;
      this.id = id;
      this.open = open;
    }
    static start() {
      return new CompletionState(none5, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
      let { state: state2 } = tr, conf = state2.facet(completionConfig);
      let sources = conf.override || state2.languageDataAt("autocomplete", cur(state2)).map(asSource);
      let active = sources.map((source2) => {
        let value2 = this.active.find((s) => s.source == source2) || new ActiveSource(source2, 0, false);
        return value2.update(tr, conf);
      });
      if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
        active = this.active;
      let open = tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active) ? CompletionDialog.build(active, state2, this.id, this.open) : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
      for (let effect of tr.effects)
        if (effect.is(setSelectedEffect))
          open = open && open.setSelected(effect.value, this.id);
      return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
    }
    get tooltip() {
      return this.open ? this.open.tooltip : none5;
    }
    get attrs() {
      return this.open ? this.open.attrs : baseAttrs;
    }
  };
  function sameResults(a, b) {
    if (a == b)
      return true;
    for (let iA = 0, iB = 0; ; ) {
      while (iA < a.length && !a[iA].hasResult)
        iA++;
      while (iB < b.length && !b[iB].hasResult)
        iB++;
      let endA = iA == a.length, endB = iB == b.length;
      if (endA || endB)
        return endA == endB;
      if (a[iA++].result != b[iB++].result)
        return false;
    }
  }
  function makeAttrs(id, selected) {
    return {
      "aria-autocomplete": "list",
      "aria-activedescendant": id + "-" + selected,
      "aria-owns": id
    };
  }
  var baseAttrs = { "aria-autocomplete": "list" };
  var none5 = [];
  function cmpOption(a, b) {
    let dScore = b.match[0] - a.match[0];
    if (dScore)
      return dScore;
    let lA = a.completion.label, lB = b.completion.label;
    return lA < lB ? -1 : lA == lB ? 0 : 1;
  }
  var ActiveSource = class {
    constructor(source2, state2, explicit) {
      this.source = source2;
      this.state = state2;
      this.explicit = explicit;
    }
    hasResult() {
      return false;
    }
    update(tr, conf) {
      let event = tr.annotation(Transaction.userEvent), value2 = this;
      if (event == "input" || event == "delete")
        value2 = value2.handleUserEvent(tr, event, conf);
      else if (tr.docChanged)
        value2 = value2.handleChange(tr);
      else if (tr.selection && value2.state != 0)
        value2 = new ActiveSource(value2.source, 0, false);
      for (let effect of tr.effects) {
        if (effect.is(startCompletionEffect))
          value2 = new ActiveSource(value2.source, 1, effect.value);
        else if (effect.is(closeCompletionEffect))
          value2 = new ActiveSource(value2.source, 0, false);
        else if (effect.is(setActiveEffect)) {
          for (let active of effect.value)
            if (active.source == value2.source)
              value2 = active;
        }
      }
      return value2;
    }
    handleUserEvent(_tr, type2, conf) {
      return type2 == "delete" || !conf.activateOnTyping ? this : new ActiveSource(this.source, 1, false);
    }
    handleChange(tr) {
      return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0, false) : this;
    }
  };
  var ActiveResult = class extends ActiveSource {
    constructor(source2, explicit, result, from, to, span) {
      super(source2, 2, explicit);
      this.result = result;
      this.from = from;
      this.to = to;
      this.span = span;
    }
    hasResult() {
      return true;
    }
    handleUserEvent(tr, type2, conf) {
      let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
      let pos = cur(tr.state);
      if ((this.explicit ? pos < from : pos <= from) || pos > to)
        return new ActiveSource(this.source, type2 == "input" && conf.activateOnTyping ? 1 : 0, false);
      if (this.span && (from == to || this.span.test(tr.state.sliceDoc(from, to))))
        return new ActiveResult(this.source, this.explicit, this.result, from, to, this.span);
      return new ActiveSource(this.source, 1, this.explicit);
    }
    handleChange(tr) {
      return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(this.source, 0, false) : new ActiveResult(this.source, this.explicit, this.result, tr.changes.mapPos(this.from), tr.changes.mapPos(this.to, 1), this.span);
    }
    map(mapping) {
      return new ActiveResult(this.source, this.explicit, this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1), this.span);
    }
  };
  var startCompletionEffect = StateEffect.define();
  var closeCompletionEffect = StateEffect.define();
  var setActiveEffect = StateEffect.define({
    map(sources, mapping) {
      return sources.map((s) => s.hasResult() && !mapping.empty ? s.map(mapping) : s);
    }
  });
  var setSelectedEffect = StateEffect.define();
  var completionState = StateField.define({
    create() {
      return CompletionState.start();
    },
    update(value2, tr) {
      return value2.update(tr);
    },
    provide: (f) => [
      showTooltip.computeN([f], (state2) => state2.field(f).tooltip),
      EditorView.contentAttributes.from(f, (state2) => state2.attrs)
    ]
  });
  var CompletionInteractMargin = 75;
  function moveCompletionSelection(forward, by = "option") {
    return (view2) => {
      let cState = view2.state.field(completionState, false);
      if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
        return false;
      let step = 1, tooltip;
      if (by == "page" && (tooltip = view2.dom.querySelector(".cm-tooltip-autocomplete")))
        step = Math.max(2, Math.floor(tooltip.offsetHeight / tooltip.firstChild.offsetHeight));
      let selected = cState.open.selected + step * (forward ? 1 : -1), { length } = cState.open.options;
      if (selected < 0)
        selected = by == "page" ? 0 : length - 1;
      else if (selected >= length)
        selected = by == "page" ? length - 1 : 0;
      view2.dispatch({ effects: setSelectedEffect.of(selected) });
      return true;
    };
  }
  var acceptCompletion = (view2) => {
    let cState = view2.state.field(completionState, false);
    if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
      return false;
    applyCompletion(view2, cState.open.options[cState.open.selected]);
    return true;
  };
  var startCompletion = (view2) => {
    let cState = view2.state.field(completionState, false);
    if (!cState)
      return false;
    view2.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
  };
  var closeCompletion = (view2) => {
    let cState = view2.state.field(completionState, false);
    if (!cState || !cState.active.some((a) => a.state != 0))
      return false;
    view2.dispatch({ effects: closeCompletionEffect.of(null) });
    return true;
  };
  var RunningQuery = class {
    constructor(source2, context) {
      this.source = source2;
      this.context = context;
      this.time = Date.now();
      this.updates = [];
      this.done = void 0;
    }
  };
  var DebounceTime = 50;
  var MaxUpdateCount = 50;
  var MinAbortTime = 1e3;
  var completionPlugin = ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.debounceUpdate = -1;
      this.running = [];
      this.debounceAccept = -1;
      this.composing = 0;
      for (let active of view2.state.field(completionState).active)
        if (active.state == 1)
          this.startQuery(active);
    }
    update(update) {
      let cState = update.state.field(completionState);
      if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
        return;
      let doesReset = update.transactions.some((tr) => {
        let event = tr.annotation(Transaction.userEvent);
        return (tr.selection || tr.docChanged) && event != "input" && event != "delete";
      });
      for (let i = 0; i < this.running.length; i++) {
        let query = this.running[i];
        if (doesReset || query.updates.length + update.transactions.length > MaxUpdateCount && query.time - Date.now() > MinAbortTime) {
          for (let handler of query.context.abortListeners) {
            try {
              handler();
            } catch (e) {
              logException(this.view.state, e);
            }
          }
          query.context.abortListeners = null;
          this.running.splice(i--, 1);
        } else {
          query.updates.push(...update.transactions);
        }
      }
      if (this.debounceUpdate > -1)
        clearTimeout(this.debounceUpdate);
      this.debounceUpdate = cState.active.some((a) => a.state == 1 && !this.running.some((q) => q.source == a.source)) ? setTimeout(() => this.startUpdate(), DebounceTime) : -1;
      if (this.composing != 0)
        for (let tr of update.transactions) {
          if (tr.annotation(Transaction.userEvent) == "input")
            this.composing = 2;
          else if (this.composing == 2 && tr.selection)
            this.composing = 3;
        }
    }
    startUpdate() {
      this.debounceUpdate = -1;
      let { state: state2 } = this.view, cState = state2.field(completionState);
      for (let active of cState.active) {
        if (active.state == 1 && !this.running.some((r) => r.source == active.source))
          this.startQuery(active);
      }
    }
    startQuery(active) {
      let { state: state2 } = this.view, pos = cur(state2);
      let context = new CompletionContext(state2, pos, active.explicit);
      let pending = new RunningQuery(active.source, context);
      this.running.push(pending);
      Promise.resolve(active.source(context)).then((result) => {
        if (!pending.context.aborted) {
          pending.done = result || null;
          this.scheduleAccept();
        }
      }, (err) => {
        this.view.dispatch({ effects: closeCompletionEffect.of(null) });
        logException(this.view.state, err);
      });
    }
    scheduleAccept() {
      if (this.running.every((q) => q.done !== void 0))
        this.accept();
      else if (this.debounceAccept < 0)
        this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
    }
    accept() {
      var _a;
      if (this.debounceAccept > -1)
        clearTimeout(this.debounceAccept);
      this.debounceAccept = -1;
      let updated = [];
      let conf = this.view.state.facet(completionConfig);
      for (let i = 0; i < this.running.length; i++) {
        let query = this.running[i];
        if (query.done === void 0)
          continue;
        this.running.splice(i--, 1);
        if (query.done) {
          let active = new ActiveResult(query.source, query.context.explicit, query.done, query.done.from, (_a = query.done.to) !== null && _a !== void 0 ? _a : cur(query.updates.length ? query.updates[0].startState : this.view.state), query.done.span ? ensureAnchor(query.done.span, true) : null);
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (active.hasResult()) {
            updated.push(active);
            continue;
          }
        }
        let current = this.view.state.field(completionState).active.find((a) => a.source == query.source);
        if (current && current.state == 1) {
          if (query.done == null) {
            let active = new ActiveSource(query.source, 0, false);
            for (let tr of query.updates)
              active = active.update(tr, conf);
            if (active.state != 1)
              updated.push(active);
          } else {
            this.startQuery(current);
          }
        }
      }
      if (updated.length)
        this.view.dispatch({ effects: setActiveEffect.of(updated) });
    }
  }, {
    eventHandlers: {
      compositionstart() {
        this.composing = 1;
      },
      compositionend() {
        if (this.composing == 3)
          this.view.dispatch({ effects: startCompletionEffect.of(false) });
        this.composing = 0;
      }
    }
  });
  var fieldMarker = Decoration.widget({ widget: new class extends WidgetType {
    toDOM() {
      let span = document.createElement("span");
      span.className = themeClass("snippetFieldPosition");
      return span;
    }
    ignoreEvent() {
      return false;
    }
  }() });
  var fieldRange = Decoration.mark({ class: themeClass("snippetField") });
  var ActiveSnippet = class {
    constructor(ranges, active) {
      this.ranges = ranges;
      this.active = active;
      this.deco = Decoration.set(ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
    }
    map(changes) {
      return new ActiveSnippet(this.ranges.map((r) => r.map(changes)), this.active);
    }
    selectionInsideField(sel) {
      return sel.ranges.every((range) => this.ranges.some((r) => r.field == this.active && r.from <= range.from && r.to >= range.to));
    }
  };
  var setActive = StateEffect.define({
    map(value2, changes) {
      return value2 && value2.map(changes);
    }
  });
  var moveToField = StateEffect.define();
  var snippetState = StateField.define({
    create() {
      return null;
    },
    update(value2, tr) {
      for (let effect of tr.effects) {
        if (effect.is(setActive))
          return effect.value;
        if (effect.is(moveToField) && value2)
          return new ActiveSnippet(value2.ranges, effect.value);
      }
      if (value2 && tr.docChanged)
        value2 = value2.map(tr.changes);
      if (value2 && tr.selection && !value2.selectionInsideField(tr.selection))
        value2 = null;
      return value2;
    },
    provide: (f) => EditorView.decorations.from(f, (val) => val ? val.deco : Decoration.none)
  });
  function fieldSelection(ranges, field) {
    return EditorSelection.create(ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to)));
  }
  function moveField(dir) {
    return ({ state: state2, dispatch }) => {
      let active = state2.field(snippetState, false);
      if (!active || dir < 0 && active.active == 0)
        return false;
      let next = active.active + dir, last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
      dispatch(state2.update({
        selection: fieldSelection(active.ranges, next),
        effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
      }));
      return true;
    };
  }
  var clearSnippet = ({ state: state2, dispatch }) => {
    let active = state2.field(snippetState, false);
    if (!active)
      return false;
    dispatch(state2.update({ effects: setActive.of(null) }));
    return true;
  };
  var nextSnippetField = moveField(1);
  var prevSnippetField = moveField(-1);
  var defaultSnippetKeymap = [
    { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
    { key: "Escape", run: clearSnippet }
  ];
  var snippetKeymap = Facet.define({
    combine(maps) {
      return maps.length ? maps[0] : defaultSnippetKeymap;
    }
  });
  var addSnippetKeymap = Prec.override(keymap.compute([snippetKeymap], (state2) => state2.facet(snippetKeymap)));
  function autocompletion(config2 = {}) {
    return [
      completionState,
      completionConfig.of(config2),
      completionPlugin,
      completionKeymapExt,
      baseTheme9,
      tooltips()
    ];
  }
  var completionKeymap = [
    { key: "Mod-Space", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: moveCompletionSelection(true) },
    { key: "ArrowUp", run: moveCompletionSelection(false) },
    { key: "PageDown", run: moveCompletionSelection(true, "page") },
    { key: "PageUp", run: moveCompletionSelection(false, "page") },
    { key: "Enter", run: acceptCompletion }
  ];
  var completionKeymapExt = Prec.override(keymap.computeN([completionConfig], (state2) => state2.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

  // ../../node_modules/@codemirror/next/comment/dist/index.js
  var toggleComment = (target2) => {
    let config2 = getConfig(target2.state);
    return config2.line ? toggleLineComment(target2) : config2.block ? toggleBlockComment(target2) : false;
  };
  function command(f, option2) {
    return ({ state: state2, dispatch }) => {
      let tr = f(option2, state2.selection.ranges, state2);
      if (!tr)
        return false;
      dispatch(state2.update(tr));
      return true;
    };
  }
  var toggleLineComment = command(changeLineComment, 0);
  var lineComment = command(changeLineComment, 1);
  var lineUncomment = command(changeLineComment, 2);
  var toggleBlockComment = command(changeBlockComment, 0);
  var blockComment = command(changeBlockComment, 1);
  var blockUncomment = command(changeBlockComment, 2);
  var commentKeymap = [
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", run: toggleBlockComment }
  ];
  function getConfig(state2, pos = state2.selection.main.head) {
    let data = state2.languageDataAt("commentTokens", pos);
    return data.length ? data[0] : {};
  }
  var SearchMargin = 50;
  function findBlockComment(state2, { open, close }, from, to) {
    let textBefore = state2.sliceDoc(from - SearchMargin, from);
    let textAfter = state2.sliceDoc(to, to + SearchMargin);
    let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
    let beforeOff = textBefore.length - spaceBefore;
    if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
      return {
        open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
        close: { pos: to + spaceAfter, margin: spaceAfter && 1 }
      };
    }
    let startText, endText;
    if (to - from <= 2 * SearchMargin) {
      startText = endText = state2.sliceDoc(from, to);
    } else {
      startText = state2.sliceDoc(from, from + SearchMargin);
      endText = state2.sliceDoc(to - SearchMargin, to);
    }
    let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
    let endOff = endText.length - endSpace - close.length;
    if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
      return {
        open: {
          pos: from + startSpace + open.length,
          margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
        },
        close: {
          pos: to - endSpace - close.length,
          margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
        }
      };
    }
    return null;
  }
  function changeBlockComment(option2, ranges, state2) {
    let tokens = ranges.map((r) => getConfig(state2, r.from).block);
    if (!tokens.every((c) => c))
      return null;
    let comments = ranges.map((r, i) => findBlockComment(state2, tokens[i], r.from, r.to));
    if (option2 != 2 && !comments.every((c) => c)) {
      let index = 0;
      return state2.changeByRange((range) => {
        let { open, close } = tokens[index++];
        if (comments[index])
          return { range };
        let shift2 = open.length + 1;
        return {
          changes: [{ from: range.from, insert: open + " " }, { from: range.to, insert: " " + close }],
          range: EditorSelection.range(range.anchor + shift2, range.head + shift2)
        };
      });
    } else if (option2 != 1 && comments.some((c) => c)) {
      let changes = [];
      for (let i = 0, comment2; i < comments.length; i++)
        if (comment2 = comments[i]) {
          let token2 = tokens[i], { open, close } = comment2;
          changes.push({ from: open.pos - token2.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token2.close.length });
        }
      return { changes };
    }
    return null;
  }
  function findLineComment(token2, lines) {
    let minCol = 1e9, commented = null, skipped = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i], col = /^\s*/.exec(line.text)[0].length;
      let empty = skipped[line.number] = col == line.length;
      if (col < minCol && (!empty || minCol == 1e9 && i == lines.length - 1))
        minCol = col;
      if (commented != false && (!empty || commented == null && i == lines.length - 1))
        commented = line.text.slice(col, col + token2.length) == token2;
    }
    return { minCol, commented, skipped };
  }
  function changeLineComment(option2, ranges, state2) {
    let lines = [], tokens = [], lineRanges = [];
    for (let { from, to } of ranges) {
      let token2 = getConfig(state2, from).line;
      if (!token2)
        return null;
      tokens.push(token2);
      let lns = getLinesInRange(state2.doc, from, to);
      lines.push(lns);
      lineRanges.push(findLineComment(token2, lns));
    }
    if (option2 != 2 && lineRanges.some((c) => !c.commented)) {
      let changes = [];
      for (let i = 0, lineRange; i < ranges.length; i++)
        if (!(lineRange = lineRanges[i]).commented) {
          for (let line of lines[i]) {
            if (!lineRange.skipped[line.number] || lines[i].length == 1)
              changes.push({ from: line.from + lineRange.minCol, insert: tokens[i] + " " });
          }
        }
      return { changes };
    } else if (option2 != 1 && lineRanges.some((c) => c.commented)) {
      let changes = [];
      for (let i = 0, lineRange; i < ranges.length; i++)
        if ((lineRange = lineRanges[i]).commented) {
          let token2 = tokens[i];
          for (let line of lines[i]) {
            if (lineRange.skipped[line.number] && lines[i].length > 1)
              continue;
            let pos = line.from + lineRange.minCol;
            let posAfter = lineRange.minCol + token2.length;
            let marginLen = line.text.slice(posAfter, posAfter + 1) == " " ? 1 : 0;
            changes.push({ from: pos, to: pos + token2.length + marginLen });
          }
        }
      return { changes };
    }
    return null;
  }
  function getLinesInRange(doc2, from, to) {
    let line = doc2.lineAt(from), lines = [];
    while (line.to < to || line.from <= to && to <= line.to) {
      lines.push(line);
      if (line.number == doc2.lines)
        break;
      line = doc2.line(line.number + 1);
    }
    return lines;
  }

  // ../../node_modules/@codemirror/next/rectangular-selection/dist/index.js
  var MaxOff = 2e3;
  function rectangleFor(state2, a, b) {
    let startLine = Math.min(a.line, b.line), endLine = Math.max(a.line, b.line);
    let ranges = [];
    if (a.off > MaxOff || b.off > MaxOff || a.col < 0 || b.col < 0) {
      let startOff = Math.min(a.off, b.off), endOff = Math.max(a.off, b.off);
      for (let i = startLine; i <= endLine; i++) {
        let line = state2.doc.line(i);
        if (line.length <= endOff)
          ranges.push(EditorSelection.range(line.from + startOff, line.to + endOff));
      }
    } else {
      let startCol = Math.min(a.col, b.col), endCol = Math.max(a.col, b.col);
      for (let i = startLine; i <= endLine; i++) {
        let line = state2.doc.line(i), str = line.length > MaxOff ? line.text.slice(0, 2 * endCol) : line.text;
        let start = findColumn(str, 0, startCol, state2.tabSize), end = findColumn(str, 0, endCol, state2.tabSize);
        if (!start.leftOver)
          ranges.push(EditorSelection.range(line.from + start.offset, line.from + end.offset));
      }
    }
    return ranges;
  }
  function absoluteColumn(view2, x) {
    let ref = view2.coordsAtPos(view2.viewport.from);
    return ref ? Math.round(Math.abs((ref.left - x) / view2.defaultCharacterWidth)) : -1;
  }
  function getPos(view2, event) {
    let offset = view2.posAtCoords({ x: event.clientX, y: event.clientY });
    if (offset == null)
      return null;
    let line = view2.state.doc.lineAt(offset), off = offset - line.from;
    let col = off > MaxOff ? -1 : off == line.length ? absoluteColumn(view2, event.clientX) : countColumn(line.text.slice(0, offset - line.from), 0, view2.state.tabSize);
    return { line: line.number, col, off };
  }
  function rectangleSelectionStyle(view2, event) {
    let start = getPos(view2, event), startSel = view2.state.selection;
    if (!start)
      return null;
    return {
      update(update) {
        if (update.docChanged) {
          let newStart = update.changes.mapPos(update.startState.doc.line(start.line).from);
          let newLine = update.state.doc.lineAt(newStart);
          start = { line: newLine.number, col: start.col, off: Math.min(start.off, newLine.length) };
          startSel = startSel.map(update.changes);
        }
      },
      get(event2, _extend, multiple) {
        let cur2 = getPos(view2, event2);
        if (!cur2)
          return startSel;
        let ranges = rectangleFor(view2.state, start, cur2);
        if (!ranges.length)
          return startSel;
        if (multiple)
          return EditorSelection.create(ranges.concat(startSel.ranges));
        else
          return EditorSelection.create(ranges);
      }
    };
  }
  function rectangularSelection(options) {
    let filter = (options === null || options === void 0 ? void 0 : options.eventFilter) || ((e) => e.altKey && e.button == 0);
    return EditorView.mouseSelectionStyle.of((view2, event) => filter(event) ? rectangleSelectionStyle(view2, event) : null);
  }

  // ../../node_modules/@codemirror/next/basic-setup/dist/index.js
  var basicSetup = [
    lineNumbers(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    defaultHighlightStyle,
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...commentKeymap,
      ...completionKeymap,
      ...lintKeymap
    ])
  ];

  // lib/config.js
  var readOnlyConfig = [
    EditorView.editable.of(false),
    lineNumbers(),
    defaultHighlightStyle,
    highlightSelectionMatches(),
    syntax
  ];
  var editableConfig = [
    basicSetup,
    syntax,
    linter,
    keymap.of([...defaultKeymap, ...commentKeymap])
  ];

  // demo/index.ts
  var initialValue = `namespace ex http://example.com/

type location [
  ex:coordinates <- {
    ex:lat -> double
    ex:long -> double
  }
  ex:address <- {
    ex:street -> string
    ex:city -> string
    ex:state -> string
    ex:zipCode -> string
  }
]

class ex:BookStore :: {
  ex:name -> string
  ex:location -> ? location
}

class ex:Book :: {
  ex:name -> string
  ex:isbn -> <>
  ex:store -> * ex:BookStore
  ex:category -> [
    ex:fiction
    ex:nonFiction
    ex:other <- string
  ]
}

edge ex:Citation :: ex:Book => ex:Book
edge ex:Citation2 :: ex:Book =/ {
  ex:value -> string
} /=> ex:Book



`;
  var state = EditorState.create({
    doc: initialValue,
    extensions: [editableConfig]
  });
  var view = new EditorView({
    state,
    parent: document.getElementById("editor")
  });
  openLintPanel(view);
  view.focus();
})();
