const https = require("https");
 const axios = require('axios')
 const qs = require('qs')
 const qrcode  = require('qrcode-terminal');
 const pack = require('./src/pack');
 const fs = require('fs');

// `https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=${code}&state=darwin`,
// signature: res.headers["debugger-signature"],
// newticket: res.headers["debugger-newticket"]
const OPEN_WEIXIN = 'https://open.weixin.qq.com';
const loginAppId = 'wxde40e023744664cb'  // 特殊的一个AppId不用这个无法登陆

const loginUrl = `${OPEN_WEIXIN}/connect/qrconnect?appid=${loginAppId}&redirect_uri=https://mp.weixin.qq.com/&scope=snsapi_login&state=login#wechat_redirect`
//  var fordevtool = "https://long.open.weixin.qq.com/connect/l/qrconnect?uuid=0a1Uc5PIRyuqhw20"

const login = async () => {
 const { data } = await axios.get(loginUrl)
 const urlReg = /"https:\/\/long.open.weixin.qq.com\/connect\/l\/qrconnect\?uuid=(.+?)"/;
 let longUrl = data.match(urlReg)[0] 
 longUrl = longUrl.slice(1, longUrl.length-1 )
 const uuid = qs.parse(longUrl.split('?')[1])['uuid']
 const erCodeUrl = 'https://open.weixin.qq.com/connect/confirm?uuid=' + uuid
 console.log(erCodeUrl)
 qrcode.generate(erCodeUrl, { small: true },);
 const { wx_code } =  await connect(longUrl)
 console.log(wx_code)
 const req = await axios.get(`https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=${wx_code}&state=darwin`)
 console.log({user:  req.data,  
    ticket:  req.headers['debugger-ticket'],
    newticket:  req.headers['debugger-newticket'],
    signature:  req.headers['debugger-signature'],
})
}

function connect(longUrl){
  return new Promise(r => {
    const qrconnect = async () => {
      console.log(longUrl)
      const { data } =  await axios.get(longUrl)
      const window = {};
      eval(data);
      if(window.wx_errcode === 405){
       return r(window) 
      }
      console.log(window)
      setTimeout(qrconnect, 200)
    }
    qrconnect()
  })
}

(async() => {
   let data = pack('/Users/nomac/insurance-mp/dist')
//    let options =  {
//     gzip: 1,
//     appid: 'wx977351aca2cf498c',
//     newticket: 'c5erDLVgDxl5IQaJVr_1HJGKeyMrZmIWz6xwk5--6uU',
//     path: 'pages/prePage/index',
//     clientversion: '1021907300',
//   } 
  fs.writeFileSync('wxapkg', data)
  return
   const ll = await axios.post('https://servicewechat.com/wxa-dev/testsource?'+qs.stringify(options), data)
   let v = await axios.post( 'https://servicewechat.com/wxa-dev-logic/decode_qrcode?newticket=cPUmIRSJN24yiL4pK_88GSuu9oJ-t5BXZZboQ1SY7fo&appid=wx977351aca2cf498c', Buffer.from(ll.data['qrcode_img'], 'base64'))
   qrcode.generate(v.data.result, { small: true });

})()


//    let v = Buffer.from(ssss, 'base64')
//  qrDecode.decodeByBuffer(v).then(a => {
//      console.log(v)
//  })
 
