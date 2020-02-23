const { login, preview, getLocalTicket, publish } = require("./index");
const qrcode = require("qrcode-terminal");

(async () => {
  // console.log(await getLocalTicket()) // 73K8jj_19vrNOXRgEz60lFHxZT13ITjc-rS0th4sSQ4

  let newticket = "SfoUloSEj0jq2j_LyQFkD27kySQrge43vfn-fZk3uPY";

  //    const { newticket } =  await login()
  //    console.log(newticket)  40yCLQ_vPUNoo5xfsKCMevzv78EdtdnvHbEFwpwDN-E
  // 'user-version' 'user-desc' 

  const data = await publish("/Users/zhangjingrui/Desktop/未命名文件夹 6", newticket, {
    appid: "wxda4c3f2ff8ed8352",
    path: "pages/prePage/index",
    'user-version': '1.1',
    'user-desc' : 'test'
  });
  // qrcode.generate(data.url, { small: true });
})();


