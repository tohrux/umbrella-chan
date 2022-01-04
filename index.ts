import axios from 'axios'

const [, , appId, appsecret, key] = process.argv

const cityid = 101020100

const url = `https://v0.yiketianqi.com/api/worldchina?appid=${appId}&appsecret=${appsecret}&cityid=${cityid}`

async function fetchPrecipPct(): Promise<number[]> {
  try {
    let { data } = await axios(url)
    const {
      data: {
        month: [
          {
            day: { precipPct: dayPrecipPct },
            night: { precipPct: nightPrecipPct },
          },
        ],
      },
    } = await axios(url)
    console.log(dayPrecipPct)

    return [dayPrecipPct || 0, nightPrecipPct || 0]
  } catch (err) {
    console.log(err)
    return [0, 0]
  }
}

enum rainyMsgLevels {
  '可以带上我↖(^ω^)↗' = 1,
  '请带上我(｡ì _ í｡)',
  '一定要带上我( ´ ▽ ` )ﾉ',
}
function getMessageContent(precipPctArr: number[]) {
  const isNight = new Date().getHours() >= 18
  const [dayPrecipPct, nightPrecipPct] = precipPctArr
  console.log('isNight:', isNight)
  //默认在家准备出门
  const dayMsg = `>ヾ(≧▽≦*)o , 早上好各位!\n今天<font color="orange">上海</font>白天的降雨概率为<font color="blue">${dayPrecipPct}%</font> , 出门时`
  //默认在公司
  const nightMsg = `>晚上好,各位!\n今晚<font color="orange">上海</font>的降雨概率为<font color="blue">${nightPrecipPct}%</font> , 回家时`

  const msg = isNight ? nightMsg : dayMsg
  const precipPct = isNight ? nightPrecipPct : dayPrecipPct

  if (precipPct > 75) {
    return msg + rainyMsgLevels[3]
  } else if (precipPct > 50) {
    return msg + rainyMsgLevels[2]
  } else if (precipPct > 25) {
    return msg + rainyMsgLevels[1]
  } else {
    return ''
  }
}

async function main(): Promise<void> {
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
