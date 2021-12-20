import axios from 'axios'

const appId = process.argv[2]
const appsecret = process.argv[3]
const key = process.argv[4]

const url = `https://v0.yiketianqi.com/api/worldchina?appid=${appId}&appsecret=${appsecret}`

async function fetchPrecipPct(): Promise<number> {
  try {
    const {
      data: {
        month: [
          {
            day: { precipPct },
          },
        ],
      },
    } = await axios(url)
    return precipPct || 0
  } catch (err) {
    console.log(err)
    return 0
  }
}

function getMessageContent(precipPct: number = 0) {
  const commonPrefix = `今天白天的降雨概率为${precipPct}，`
  if (precipPct > 30) {
    return commonPrefix + '出门请记得🌂哦'
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
function send(MessageContent: string) {
  axios({
    url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=utf-8;',
    },
    data: {
      msgtype: 'markdown',
      markdown: {
        content: `>${MessageContent}`,
      },
    },
  })
}

main()
