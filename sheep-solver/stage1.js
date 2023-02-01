const { performance } = require("perf_hooks");
const helper = require("./util/helper");

/**
 * 第一步目标：
 * 完成高层卡牌数 >= 总数 * percentage1
 * 并且消耗的低层卡牌数 <= 总数 * percentage2
 */
class SolverStage1 {
  constructor(cards, timeout, sortType) {
    this.limit = 7;
    this.timeout = timeout; //运算时间(秒)
    this.percentage1 = 0.7; //高层卡牌百分比
    this.percentage2 = 0.3; //低层卡牌百分比
    this.layerLine = 6; //基准线，layer>=6层视为高层，其它为低层
    this.sortType = sortType;

    this.cards = cards;
    this.topList = helper.init(cards);
    this.highLevelSize = parseInt(this.cards.length * this.percentage1);
    this.lowLevelSize = parseInt(this.cards.length * this.percentage2);
    this.situation = new Set();
    // highLevelSize = 150
    // lowLevelSize = 35

    this.selected = {};
    this.stepList = [];
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
      c1.children = c1.children.filter((e1) => e1 !== id);
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

  highLevelCount() {
    return this.stepList.filter((e) => this.cards[e].layerNum >= this.layerLine)
      .length;
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
    const currTime = performance.now();
    let count = this.selectedCount();
    if (count >= this.limit) {
      return 0;
    }

    let hc = this.highLevelCount();
    if (
      hc >= this.highLevelSize &&
      this.stepList.length <= hc + this.lowLevelSize
    ) {
      return {
        stepList: this.stepList,
        topList: this.topList,
        selected: this.selected,
        cards: this.cards,
      };
    }

    if ((currTime - this.startTime) / 1000 > this.timeout) {
      return;
    }

    this.sort();
    if (this.remember()) return;
    else this.situation.add(this.topList.join(","));

    let options = this.topList.concat();
    for (let i = 0; i < options.length; i++) {
      this.select(options[i]);
      const solution = this.run();
      if (solution) return solution;
      this.undo();
    }
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

module.exports = SolverStage1;
