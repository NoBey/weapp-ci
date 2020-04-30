const { login, preview, getLocalTicket, publish, qrcode_decode  } = require("./index");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const pack = require("./src/pack");
const crypto = require("crypto");
const fs = require("fs");

const appid = "wxda4c3f2ff8ed8352";
const key = fs.readFileSync("/Users/nomac/wx/private.key"); // 小程序开发设置的私钥
const version = "1.0.0";
const os = require("os");
const glob = require('glob');
// 
// qrcode.generate('https://open.weixin.qq.com/sns/getexpappinfo?appid=wxda4c3f2ff8ed8352&path=pages/index/index.html', { small: true });
// process.exit()
// ;
(async () => {

     const newticket = await getLocalTicket() //||  await login()
     console.log(newticket)  

  const data = await publish("/Users/nomac/Desktop/mc", newticket, {
    appid,
    path: "pages/index/index",
    'user-version': '1.1',
    'user-desc' : 'test'
  });
  console.log(data)
  process.exit()
  // qrcode.generate(data.url, { small: true });

  const {
    data: {
      data: { randomString: rand_str },
    },
  } = await axios.post("https://servicewechat.com/wxa/ci/getrandstr", {
    appid,
  });
  const signature = crypto
    .privateEncrypt(
      { key, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(JSON.stringify({ appid, rand_str }))
    )
    .toString("base64");
  const sgin = JSON.stringify({ signature, version });
  console.log(sgin);

  // const ddd = pack("/Users/nomac/Desktop/mc", {}, sgin);
  // // upload testSourceURL

  // const { data } = await axios.post(
  //   "https://servicewechat.com/wxa/ci/upload?appid=wxda4c3f2ff8ed8352&version=0.0.1&desc=hello",
  //   ddd,
  //   {
  //     headers: { Accept: "", "Content-Type": "" },
  //   }
  // );
  // console.log(data.body)

  // const url = await qrcode_decode(qrcode_img)
  // console.log(url);
  // qrcode.generate(url, { small: true });
})();



