const axios = require("axios");
const qs = require("qs");
const qrcode = require("qrcode-terminal");
const pack = require("./src/pack");
const QrCode = require("qrcode-reader");
const Jimp = require("jimp");
const fs = require("fs");
const os = require("os");
const util = require("util");
const glob = require('glob');


const getLocalTicket = async () => {
  let weappDir = os.homedir() + '/Library/Application\ Support/微信开发者工具/**/WeappLocalData/'
  const files = glob.sync( weappDir )
  if(!files.length) return 
    const hash = files[0].split('微信开发者工具/')[1].replace('/WeappLocalData/', '')
    weappDir = weappDir.replace('**', hash)
  let data = require( weappDir + 'hash_key_map.json' )
  for (const key in data) {
    if('userInfo_newticket' === data[key]){
      const d =  await  util.promisify(fs.readFile)(`${weappDir}localstorage_${key}.json`)
      return d.toString()
    }  
  }
}

const OPEN_WEIXIN = "https://open.weixin.qq.com";
const SERVICE_WECHAT = "https://servicewechat.com";
const MP_WEIXIN = "https://mp.weixin.qq.com";
const clientversion = "1022007300"; // 开发者客户端版本

const loginAppId = "wxde40e023744664cb"; // 特殊的一个AppId不用这个无法登陆
const loginUrl = `${OPEN_WEIXIN}/connect/qrconnect?appid=${loginAppId}&redirect_uri=https://mp.weixin.qq.com&scope=snsapi_login&state=login#wechat_redirect`;

// 登陆
const login = async () => {
  const { data } = await axios.get(loginUrl);
  const urlReg = /"https:\/\/long.open.weixin.qq.com\/connect\/l\/qrconnect\?uuid=(.+?)"/;
  let longUrl = data.match(urlReg)[0];
  longUrl = longUrl.slice(1, longUrl.length - 1);
  const uuid = qs.parse(longUrl.split("?")[1])["uuid"];
  const erCodeUrl = `${OPEN_WEIXIN}/connect/confirm?uuid=${uuid}`;
  qrcode.generate(erCodeUrl, { small: true });
  const { wx_code } = await connect(longUrl);
  const req = await axios.get(
    `${MP_WEIXIN}/debug/cgi-bin/webdebugger/qrcode?code=${wx_code}&state=darwin`
  );
  return {
    user: req.data,
    ticket: req.headers["debugger-ticket"],
    newticket: req.headers["debugger-newticket"],
    signature: req.headers["debugger-signature"]
  };
};

function connect(longUrl) {
  return new Promise(r => {
    const qrconnect = async () => {
      console.log(longUrl);
      const { data } = await axios.get(longUrl);
      const window = {};
      eval(data);
      if (window.wx_errcode === 405) {
        return r(window);
      }
      console.log(window);
      setTimeout(qrconnect, 200);
    };
    qrconnect();
  });
}

// 预览
const preview = async (path, newticket, options) => {
  const { qrcode_img } =  await upload(path, '/wxa-dev/testsource' ,newticket, options)
  const url = await decode_qrcode(qrcode_img)
  return { qrcode_img, url }
}


// 上传体验版
const publish = async (path, newticket, options) => {
  const data = await upload( path, '/wxa-dev/commitsource', newticket, { 'user-version': '1.0.0', ...options } )
  return data
}

// 上传
const upload = async (path, url, newticket, options) => {
  if (!options.appid) return "no appid";
  if (!newticket) return "no newticket";

  if (newticket) options.newticket = newticket;
  const packages = pack(path); // 把目录打包压缩
  const { data } = await axios.post(
    `${SERVICE_WECHAT}${url}?${qs.stringify({
      gzip: 1,
      path: "pages/index/index",
      clientversion,
      ...options
    })}`,
    packages
  );

  return data;
};

// 使用微信接口解析二维码生成url
const decode_qrcode = async base64 => {
  const {
    data: { result: url }
  } = await axios.post(
    `${SERVICE_WECHAT}/wxa-dev-logic/decode_qrcode?${qs.stringify({
      newticket,
      appid: options.appid
    })}`,
    Buffer.from(base64, "base64")
  );
  return url
}

// 使用 jimp 和 qrcode-reader 解码
const qrcode_decode = buffer =>
  new Promise((resolve, reject) => {
    const ImgBuffer = Buffer.from(buffer, "base64");
    Jimp.read(ImgBuffer, (err, image) => {
      if (err) return reject({ err, msg: "加载图片出错" });
      const qr = new QrCode();
      qr.callback = (err, value) => {
        if (err) return reject({ err, msg: "解析图片出错" });
        resolve(value.result);
      };
      qr.decode(image.bitmap);
    });
  });

module.exports = { login, preview, getLocalTicket, publish, qrcode_decode };
