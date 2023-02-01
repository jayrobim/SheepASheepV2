const fs = require("fs");
const { getMapFromMD5 } = require("../services/services");
const path = require("path");

class Randomizer {
  static setSeed(seeds) {
    if (!Array.isArray(seeds) || seeds.length !== 4) {
      throw new TypeError("seed must be an array with 4 numbers");
    }

    this._state0U = 0 | seeds[0];
    this._state0L = 0 | seeds[1];
    this._state1U = 0 | seeds[2];
    this._state1L = 0 | seeds[3];
  }

  static randomint() {
    var t = this._state0U,
      e = this._state0L,
      o = this._state1U,
      n = this._state1L,
      i = (n >>> 0) + (e >>> 0),
      a = (o + t + ((i / 2) >>> 31)) >>> 0,
      r = i >>> 0;
    this._state0U = o;
    this._state0L = n;
    var c = 0,
      s = 0;
    return (
      (c = (t ^= c = (t << 23) | ((-512 & e) >>> 9)) ^ o),
      (s = (e ^= s = e << 23) ^ n),
      (c ^= t >>> 18),
      (s ^= (e >>> 18) | ((262143 & t) << 14)),
      (c ^= o >>> 5),
      (s ^= (n >>> 5) | ((31 & o) << 27)),
      (this._state1U = c),
      (this._state1L = s),
      [a, r]
    );
  }

  static random() {
    var t = this.randomint();
    return (
      2.3283064365386963e-10 * t[0] + 2.220446049250313e-16 * (t[1] >>> 12)
    );
  }

  static shuffle(t) {
    for (var e = t.length - 1; e >= 0; e--) {
      var o = this.random(),
        n = Math.floor(o * (e + 1)),
        a = t[n];
      t[n] = t[e];
      t[e] = a;
    }
    return t;
  }
}

class Chessboard {
  constructor() {
    this.cookieBlockType = 0;
    this.playLevelId = 1;
    this.cookieRewardLevel = 0;
    this.node = {
      width: 48,
      height: 56,
    };
  }

  init(t, mapSeed) {
    this.nowLevelData = t;
    Randomizer.setSeed(mapSeed);
    Randomizer.random();
    this.createBlockTypeObj();
    this.rewardBlockInit(t, !1);
    this.initBlockNodeLayer(!0);
    return t;
  }

  createBlockTypeObj() {
    let t = this.nowLevelData.blockTypeData;
    this.blockTypeArr = []; //cardType升序
    this.nowLevelBlockObj = {};
    for (
      let e = Object.keys(t)
          .map(function (e) {
            return {
              cardType: parseInt(e),
              cardNum: parseInt(t[e]),
            };
          })
          .sort(function (t, e) {
            return t.cardType - e.cardType;
          }),
        o = 0;
      o < e.length;
      o++
    ) {
      for (let n = 3 * e[o].cardNum, i = 0; i < n; i++)
        this.blockTypeArr.push(e[o].cardType);
    }
    this.blockTypeArr = Randomizer.shuffle(this.blockTypeArr);
    //console.log("blockTypeArr #### ", this.blockTypeArr)
  }

  rewardBlockInit(t, e) {
    if (this.baseConfigData) {
      this.cookieBlockType = 0;
      let o = this.playLevelId,
        n = this.cookieRewardLevel;
      if (e && o >= n && o % 2 !== 0) {
        // let i = this.getCookieLevelData();
        //console.log("饼干类型为", i.type), this.cookieBlockType = i.type;
      }
    }
  }

  initBlockNodeLayer(t) {
    this.cookieCurCount = 0;
    let e = this.nowLevelData.levelData,
      o = 0;
    for (let n in e) {
      for (let i in e[n]) {
        e[n][i].cardId = o;
        o++;
        t ? this.addBlockFunc(e[n][i], 896) : this.addBlockFunc(e[n][i], 0);
      }
    }
    //console.log('initBlockNodeLayer: ', this.nowLevelData.levelData)
  }

  addBlockFunc(t, e) {
    this.blockPrefab = {};
    let o = this.blockPrefab;
    let n = this.nowLevelData.widthNum * this.minBlockNum,
      i = this.node.width / n,
      a = this.node.width / this.nowLevelData.widthNum,
      c = a / this.blockMaxWidth;
    c *= this.scaleRate;
    o.scale = c;
    let s = t.rolNum * i + a / 2,
      l = -(t.rowNum * i + (c * this.blockMaxHeight) / 2);
    o.x = s;
    o.y = l;
    if (t.type === 0) {
      let u = this.blockTypeArr.pop();
      t.type = u;
    }
    this.cookieBlockType === t.type ? (t.cookie = 1) : (t.cookie = 0);
    t.cookieType = this.cookieBlockType;
  }

  getCookieLevelData() {
    let t = this.blockTypeArr.concat(),
      e = this.sortAndGroup(t),
      o = Randomizer.shuffle(e);
    //console.log("blockArr", t);
    // console.log("randomArr", o);
    let n = [];
    30 <= t.length && t.length <= 72 && n.push(3);
    36 <= t.length && t.length <= 93 && n.push(6);
    60 <= t.length && t.length <= 105 && n.push(9);
    54 <= t.length && t.length <= 99 && n.push(12);
    69 <= t.length && t.length <= 114 && n.push(15);
    114 <= t.length && t.length <= 147 && n.push(21);
    //console.log("countArr", n);
    let i = [];
    for (let a in n)
      for (let r in e)
        if (n[a] === e[r].length) {
          i.push(n[a]);
          break;
        }
    //console.log("canArr", i);
    let s = i[Math.floor(Math.random() * i.length)];
    for (let l in /*console.log("count", s),*/ o)
      if (s === o[l].length)
        return {
          count: s,
          type: o[l][0],
        };
    return {
      count: 0,
      type: 0,
    };
  }
  // sortAndGroup() {
  //     var e, o = [];
  //     t.sort(function(t, e) {
  //         return t - e;
  //     });
  //     for (var n = 0; n < t.length; n++) t[n - 1] !== t[n] && (e = [], o.push(e)), e.push(t[n]);
  //     return o;
  // }
}

const getMapFromMapInformation = (map, mapSeed) => {
  const chessboard = new Chessboard();
  return chessboard.init(map, mapSeed);
};

// const processLevelData = ({ levelData }) => {
//   const result = {};

//   for (layer in levelData) {
//     result[layer] = levelData[layer].map(({ type, rolNum, rowNum }) => ({
//       type,
//       min_x: rolNum,
//       min_y: rowNum,
//       max_x: rolNum + 8,
//       max_y: rowNum + 8,
//     }));
//   }

//   return result;
// };

const getMapCacheFolderPath = () => {
  return path.join(__dirname, "..", "cache", "maps");
};
const getMapCacheFilePath = (md5) => {
  return path.join(getMapCacheFolderPath(), `${md5}.txt`);
};

const exitsInCache = (md5) => {
  if (!fs.existsSync(getMapCacheFilePath(md5))) {
    console.log("地图数据未被缓存");
    return false;
  } else {
    console.log("地图数据已被缓存");
    return true;
  }
};

const writeToCache = (md5, mapData) => {
  console.log("写入地图数据到缓存");
  const mapCacheFolderPath = getMapCacheFolderPath();
  if (!fs.existsSync(mapCacheFolderPath)) {
    fs.mkdirSync(mapCacheFolderPath, { recursive: true });
  }
  fs.writeFileSync(getMapCacheFilePath(md5), JSON.stringify(mapData));
};

const readFromCache = (md5) => {
  console.log("从缓存读取地图数据");
  return JSON.parse(fs.readFileSync(getMapCacheFilePath(md5)));
};

const getMap = async (md5, mapSeed) => {
  let rawMap;
  if (exitsInCache(md5)) {
    rawMap = readFromCache(md5);
  } else {
    rawMap = await getMapFromMD5(md5);
    writeToCache(md5, rawMap);
  }
  // return processLevelData(getMapFromMapInformation(rawMap, mapSeed));
  return getMapFromMapInformation(rawMap, mapSeed);
};

module.exports = { getMap };
