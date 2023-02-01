const helper = require("./util/helper");
const { performance } = require("perf_hooks");

/**
 * 直接跑出结果
 */
class SolverNoProps {
  constructor(cards, timeout, sortType) {
    this.cards = cards;
    this.topList = helper.init(cards);
    this.situation = new Set();

    this.selected = {};
    this.stepList = [];
    this.sortType = sortType;
    this.limit = 7;
    this.timeout = timeout;
  }

  removeItem(list, e) {
    let i = list.indexOf(e);
    if (i >= 0) {
      list.splice(i, 1);
    }
  }

  selectedCount() {
    let size = Object.values(this.selected)
      .map((e) => e.length % 3)
      .reduce((a, b) => a + b, 0);
    return size;
  }

  select(id) {
    this.removeItem(this.topList, id);
    let c = this.cards[id];
    c.selected = 1;
    c.parent.forEach((e) => {
      let c1 = this.cards[e];
      c1.children = c1.children.filter((e1) => e1 != id);
      if (c1.children.length == 0) {
        this.topList.unshift(c1.idx);
      }
    });
    this.stepList.push(id);
    let arr = this.selected[c.type];
    if (!arr) {
      arr = [];
      this.selected[c.type] = arr;
    }
    arr.push(id);
  }

  undo() {
    let last = this.stepList.pop();
    let c = this.cards[last];
    c.selected = 0;
    c.parent.forEach((e) => {
      let c1 = this.cards[e];
      c1.children.push(c.idx);
      this.removeItem(this.topList, c1.idx);
    });
    this.topList.push(last);
    this.removeItem(this.selected[c.type], last);
  }

  getSel() {
    let sel = [];
    for (let e of Object.values(this.selected)) {
      let n = e.length % 3;
      if (n > 0) {
        sel = sel.concat(e.slice(-n));
      }
    }
    return sel;
  }

  run() {
    let count = this.selectedCount();
    if (count >= this.limit) {
      return;
    }

    if (this.stepList.length >= this.cards.length) {
      return this.stepList;
    }

    const currTime = performance.now();

    if ((currTime - this.startTime) / 1000 > this.timeout) {
      return;
    }

    this.sort();
    if (this.remember()) return;
    else this.situation.add(this.topList.join(","));

    let options = this.topList.concat();
    for (let i = 0; i < options.length; i++) {
      this.select(options[i]);
      const stepList = this.run();
      if (stepList) return stepList;
      this.undo();
    }

    return;
  }

  remember() {
    let s = this.topList.join(",");
    return this.situation.has(s);
  }

  sort() {
    this.topList.sort((a, b) => {
      let c1 = this.cards[a];
      let c2 = this.cards[b];
      if (this.sortType == 1) {
        return c2.idx - c1.idx;
      } else if (this.sortType == 2) {
        return c2.layerNum - c1.layerNum;
      } else {
        if (c2.layerNum == c1.layerNum) {
          return c2.idx - c1.idx;
        } else {
          return c2.layerNum - c1.layerNum;
        }
      }
    });
  }

  findSolution() {
    this.startTime = performance.now();
    const solution = this.run();
    return solution;
  }
}

module.exports = SolverNoProps;
