const axios = require("axios");
const { getRandom,MapInfoToStr } = require("../utils/helpers");

const BASE_URL = "https://cat-match.easygame2021.com/sheep/v1/game";
const STATIC_ASSETS_URL = "https://cat-match-static.easygame2021.com";

const getPersonalInfo = async (token) => {
    const config = {
        method: "get",
        url: `${BASE_URL}/personal_info`,
        headers: {
            Connection: "keep-alive",
            t: token,
            "content-type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
            Referer:
                "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
        },
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (err) {
        console.log(err);
    }
};

const getMapInfo = async (token, isTopic) => {
  const config = {
    method: "get",
    url: isTopic
      ? `${BASE_URL}/world/game_start?`
      : `${BASE_URL}/map_info_ex?matchType=3`,

    headers: {
      Connection: "keep-alive",
      t: token,
      "content-type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
      Referer:
        "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

async function sendMatchInfo(token, mapSeed2, matchPlayInfo, isTopic = false) {
  const data = isTopic
    ? JSON.stringify({
        rank_state: 1,
        rank_time: getRandom(300, 600),
        play_info: matchPlayInfo,
        MapSeed2: mapSeed2,
        Version: "0.0.1",
      })
    : JSON.stringify({
        rank_score: 1,
        rank_state: 1,
        rank_time: getRandom(300, 600),
        rank_role: 1,
        skin: 1,
        play_info: matchPlayInfo,
        map_seed_2: mapSeed2,
        version: "167",
      });

  var config = {
    method: "post",
    url: isTopic ? `${BASE_URL}/topic/game_over?` : `${BASE_URL}/game_over_ex?`,
    headers: {
      Connection: "keep-alive",
      t: token,
      "content-type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
      Referer:
        "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
    },
    data,
  };
  console.log(data)
  const response = await axios(config);

  return response.data;
}

const getTopicInfo = async (token) => {
  const config = {
    method: "get",
    url: `${BASE_URL}/topic/info?`,
    headers: {
      Connection: "keep-alive",
      t: token,
      "content-type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
      Referer:
        "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
    },
  };

  try {
    const response = await axios(config);

    return response.data;
  } catch (err) {
    console.log(err);
  }
};

async function topicJoinSide(token, side) {
  var data = JSON.stringify({
    type: side,
  });

  var config = {
    method: "post",
    url: `${BASE_URL}/world/game_join?`,
    headers: {
      Connection: "keep-alive",
      t: token,
      "content-type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
      Referer:
        "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
    },
    data,
  };

  const response = await axios(config);

  return response.data;
}

const getMapFromMD5 = async (md5) => {
  let config = {
    method: "get",
    url: `${STATIC_ASSETS_URL}/maps/${md5}.map`,
    responseType: "arraybuffer"
  };

  try {
    const response = await axios(config);
    return await MapInfoToStr(response.data);
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

module.exports = {
  getPersonalInfo,
  getMapFromMD5,
  sendMatchInfo,
  getMapInfo,
  getTopicInfo,
  topicJoinSide,
};
