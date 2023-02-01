const props = require("./util/props");
const { performance } = require("perf_hooks");

class SolverStage2 {
  constructor(mapData, timeout, sortType) {
    this.limit = 7;
    this.timeout = timeout;

    let game = mapData;
    this.cards = game.cards;
    this.topList = game.topList;
    this.stepListOld = game.stepList;
    this.selected = game.selected;
    this.target = this.cards.length;
    this.stepList = [];
    this.situation = new Set();
    this.sortType = sortType;

    while (this.selectedCount() < this.limit - 1) {
      let id = this.topList[0];
      this.select(id);
      this.stepListOld.push(this.stepList.pop()); // bug fixed
    }
    props.doOut(
      this.selected,
      this.topList,
      this.stepList,
      this.stepListOld,
      this.cards
    );
    this.target += 4;
    props.doOut2(
      this.selected,
      this.topList,
      this.stepList,
      this.stepListOld,
      this.cards
    );
    this.target += 4;
  }

  removeItem(list, e) {
    let i = list.indexOf(e);
    if (i >= 0) {
      list.splice(i, 1);
    }
  }

  selectedCount() {
    return Object.values(this.selected)
      .map((e) => e.length % 3)
      .reduce((a, b) => a + b, 0);
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
    c.parent.forEach((e) => {
      let c1 = this.cards[e];
      c1.children.push(c.idx);
      this.removeItem(this.topList, c1.idx);
    });
    this.topList.push(last);
    this.removeItem(this.selected[c.type], last);
  }

  run() {
    const currTime = performance.now();
    let count = this.selectedCount();
    if (count >= this.limit) {
      return 0;
    }

    if (this.stepList.length + this.stepListOld.length >= this.target) {
      // print(stepList)
      this.stepList = this.stepListOld.concat(this.stepList);
      // console.log('types', stepList.map(e => cards[e] && cards[e].type).join(','))
      // return {stepList: this.stepList, topList: this.topList, selected: this.selected, cards: this.cards }
      return this.stepList;
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

  mapByType(list) {
    let map = {};
    list.forEach((e) => {
      let c = this.cards[e];
      let t = c.type;
      map[t] = map[t] || [];
      map[t].push(1);
    });
    return map;
  }

  sort() {
    let mapTop = this.mapByType(this.topList);
    let mapSel = this.mapByType(this.getSel());

    this.topList.sort((a, b) => {
      let t1 = this.cards[a].type;
      let t2 = this.cards[b].type;
      let d1 =
        (mapSel[t2] ? mapSel[t2].length : 0) -
        (mapSel[t1] ? mapSel[t1].length : 0);
      let d2 = mapTop[t2].length - mapTop[t1].length;
      // return Math.random() - 0.5
      return d1 == 0 ? d2 : d1;
    });
  }

  findSolution() {
    this.startTime = performance.now();
    const solution = this.run();
    return solution;
  }
}

module.exports = SolverStage2;
