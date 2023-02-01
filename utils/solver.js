const { exit } = require("process");
const { performance } = require("perf_hooks");
const { getMap } = require("./mapUtils");
const {
  getMapInfo,
  getTopicInfo,
  topicJoinSide,
  sendMatchInfo,
} = require("../services/services");
const {
  getRandom,
  delay,
  prompt,
  matchPlayInfoToStr,
  getExpirationDateFromToken,
  flattenMapData,
} = require("./helpers");
const { getSkinName } = require("./skins");
const SolverStage1 = require("../sheep-solver/stage1");
const SolverStage2 = require("../sheep-solver/stage2");

const findSolution = (mapData, t = [30, 30, 30]) => {
  return new Promise((resolve) => {
    console.log("启动第一步模式1");
    const stage1Solver1 = new SolverStage1(mapData, t[0]);

    let solution = stage1Solver1.findSolution();
    if (!solution) {
      console.log("第一步模式1无解，启动第一步模式2");
      const stage1Solver2 = new SolverStage1(mapData, t[1], 2);
      solution = stage1Solver2.findSolution();
    }
    if (!solution) resolve(solution);
    console.log("完成第一步，启动第二步");
    const stage2Solver = new SolverStage2(solution, t[2]);
    solution = stage2Solver.findSolution();
    resolve(solution);
  });
};

const filterSolutions = async (threads) => {
  const solutions = await Promise.all(threads);
  console.log("线程运行完毕");
  console.log("===================================");
  const validSolutions = solutions.filter((solution) => solution);
  if (validSolutions.length > 0) {
    console.log("找到", validSolutions.length, "个解. 使用第一个解");

    return validSolutions[0];
  }
  return undefined;
};

const startThreads = (mapData, timeout) => {
  const promises = [];
  promises.push(findSolution(mapData, timeout));
  // promises.push(findSolution(mapData, "reverse", 0, timeout));
  // promises.push(findSolution(mapData, "", 0.85, timeout));
  // promises.push(findSolution(mapData, "", 0, timeout));

  return promises;
};

const initializeTopic = async (token) => {
  const topicInfoData = await getTopicInfo(token);
  if (topicInfoData.err_code !== 0) {
    console.error("无法获取话题数据, 请检查token是否有效");
    exit(1);
  }

  const side = topicInfoData.data.side;
  if (side === 0) {
    const randSide = getRandom(1, 3);
    console.log(
      "今日未选择队伍，随机选择",
      randSide === 1 ? "左侧" : "右侧",
      "队伍"
    );
    const { err_code: errorCode } = await topicJoinSide(token, randSide);
    if (errorCode !== 0) {
      console.error("无法加入队伍");
      exit(1);
    }
    const {
      data: { side },
    } = await getTopicInfo(token);
    if (side !== randSide) {
      console.error("无法加入队伍");
      exit(1);
    } else {
      console.log("已加入队伍:", side === 1 ? "左侧" : "右侧");
    }
  } else {
    console.log("已加入队伍:", side === 1 ? "左侧" : "右侧");
  }
};

const initialize = async (token, isTopic = false) => {
  console.log(">> 初始化地图信息 <<");
  if (isTopic) {
    await initializeTopic(token);
  }
  console.log("获取地图信息");
  const mapInfoData = await getMapInfo(token, isTopic);
  if (mapInfoData.err_code !== 0) {
    console.error("无法获取地图信息, 请检查token是否有效");
    exit(1);
  }

  const mapInfo = mapInfoData.data;
  console.log("获取地图数据");
  const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);
  return [mapInfo, mapData];
};

const waitForSomeTime = async (runningTime) => {
  console.log("求解线程运行时间:", runningTime, "秒");
  if (runningTime < 80) {
    const waitTime = 80 - runningTime;
    console.log("等待", waitTime, "秒");
    console.log("===================================");
    await delay(waitTime);
  }
};

const sendSolutionToServer = async (
  token,
  mapInfo,
  mapData,
  solution,
  runningTime,
  isTopic
) => {
  await waitForSomeTime(runningTime);
  console.log(">> 发送MatchPlayInfo到服务器 <<");
  const matchPlayInfo = await matchPlayInfoToStr(mapData, solution, isTopic);
  // console.log(matchPlayInfo);
  const result = await sendMatchInfo(
    token,
    mapInfo.map_seed_2,
    matchPlayInfo,
    isTopic
  );
  console.log("服务器返回数据:", result);
  const { err_code: errorCode, data } = result;
  if (errorCode !== 0) {
    console.error("服务器返回数据出错, 可能今日已通关或者解不正确");
    exit(1);
  }
  console.log(">> 完成 <<");
  console.log("获得皮肤", getSkinName(data.skin_id));
};

const getSolutionFromSolver = async (mapData) => {
  const cards = flattenMapData(mapData);
  console.log("===================================");
  console.log(">> 求解 <<");
  const startTime = performance.now();
  const threads = startThreads(cards, [30, 30, 30]);

  const solution = await filterSolutions(threads);
  const endTime = performance.now();

  const runningTime = Math.ceil((endTime - startTime) / 1000);

  return [solution, runningTime];
};

const main = async (isTopic) => {
  let retryCount = 0;
  let token;
  let serverMode = false;

  if (process.argv.slice(2)[0] === "-t") {
    token = process.argv.slice(2)[1];
    serverMode = true;
    if (!token) {
      console.error("未提供token");
      exit(1);
    }
  } else {
    token = await prompt("请输入token: ");
  }

  console.log("===================================");
  try {
    console.log("token 过期时间:", getExpirationDateFromToken(token));
    console.log("===================================");
    await delay(3);
  } catch (e) {
    console.log("token 格式不正确");
    exit(1);
  }

  while (1) {
    if (serverMode) {
      console.log(">>>CLEAR<<<");
    } else {
      console.clear();
    }
    retryCount += 1;
    try {
      console.log(">>> 第", retryCount, "次尝试 <<<");
      console.log("===================================");

      const [mapInfo, mapData] = await initialize(token, isTopic);
      const [solution, runningTime] = await getSolutionFromSolver(mapData);
      if (!solution) {
        console.log("无解, 开始下一轮尝试");
        await delay(2);
        continue;
      }
      await sendSolutionToServer(
        token,
        mapInfo,
        mapData,
        solution,
        runningTime,
        isTopic
      );

      if (serverMode) {
        console.log(">>>COMPLETED<<<");
      }
      exit(0);
    } catch (e) {
      console.error(e);
      console.log("出现异常");
      exit(1);
    }
  }
};

module.exports = { main };
