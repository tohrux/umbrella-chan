import axios from 'axios'

const appId = process.argv[2]
const appsecret = process.argv[3]
const key = process.argv[4]
const cityid = 101020100

const url = `https://v0.yiketianqi.com/api/worldchina?appid=${appId}&appsecret=${appsecret}&cityid=${cityid}`

async function fetchPrecipPct(): Promise<number> {
  try {
    let {data} = await axios(url)
    const {
      data: {
        month: [
          {
            day: { precipPct },
          },
        ],
      },
    } = await axios(url)
    console.log(precipPct)
    return precipPct || 0
  } catch (err) {
    console.log(err)
    return 0
  }
}

function getMessageContent(precipPct: number = 0) {
  const commonPrefix = `>米娜桑 ヾ(≧▽≦*)o , 早上好!\n今天<font color="orange">上海</font>白天的降雨概率为<font color="blue">${precipPct}%</font>`
  if (precipPct >= 25) {
    return commonPrefix + '，出门请记得带上我（🌂）哦~'
  } else {
    return ''
  }
}

async function main() {
  const MessageContent = getMessageContent(await fetchPrecipPct())
  if (MessageContent.length) {
    send(MessageContent)
  }
}

async function send(MessageContent: string) {
  axios({
    url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=utf-8;',
    },
    data: {
      msgtype: 'markdown',
      markdown: {
        content: MessageContent,
      },
    },
  })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err))
}

main()
