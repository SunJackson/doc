let cookiesArr = [],
	cookie = '',
	jdNotify = false,
	jdDebug = false,
	notify
const selfdomain = 'https://try.m.jd.com'
let allGoodList = []

let $ = new Env('京东试用');
// default params
$.pageSize = 12
let cidsList = ["家用电器", "手机数码", "电脑办公", "家居家装"]
let typeList = ["普通试用", "闪电试用"]
let goodFilters = "教程@软件@英语@辅导@培训@手机卡".split('@')
let minPrice = 0

const cidsMap = {
	"全部商品": "0",
	"家用电器": "737",
	"手机数码": "652,9987",
	"电脑办公": "670",
	"家居家装": "1620,6728,9847,9855,6196,15248,14065",
	"美妆护肤": "1316",
	"服饰鞋包": "1315,1672,1318,11729",
	"母婴玩具": "1319,6233",
	"生鲜美食": "12218",
	"图书音像": "1713,4051,4052,4053,7191,7192,5272",
	"钟表奢品": "5025,6144",
	"个人护理": "16750",
	"家庭清洁": "15901",
	"食品饮料": "1320,12259",
	"更多惊喜": "4938,13314,6994,9192,12473,6196,5272,12379,13678,15083,15126,15980",
}
const typeMap = {
	"全部试用": "0",
	"普通试用": "1",
	"闪电试用": "2",
	"30天试用": "5",
}

!(async () => {
	await requireConfig()
	if (!cookiesArr[0]) {
		$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
			"open-url": "https://bean.m.jd.com/"
		})
		return
	}
	for (let i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
			$.index = i + 1;
			$.isLogin = true;
			$.nickName = '';
			await TotalBean();
			that.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
			if (!$.isLogin) {
				$.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
					"open-url": "https://bean.m.jd.com/bean/signIndex.action"
				});

				if ($.isNode()) {
					await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
				}
				continue
			}

			$.goodList = []
			$.successList = []
			if(allGoodList.length == 0){
				await getGoodList()
			}
			await filterGoodList()

			$.totalTry = 0
			$.totalGoods = $.goodList.length
			await tryGoodList()
			await getSuccessList()

			await showMsg()
		}
	}
})()
.catch((e) => {
	that.log(`❗️ ${$.name} 运行错误！\n${e}`)
	if (eval(jdDebug)) $.msg($.name, ``, `${e}`)
}).finally(() => $.done())

function requireConfig() {
	return new Promise(resolve => {
		that.log('开始获取配置文件\n')
		notify = $.isNode() ? require('./sendNotify') : '';
		//Node.js用户请在jdCookie.js处填写京东ck;
		if ($.isNode()) {
			const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
			Object.keys(jdCookieNode).forEach((item) => {
				if (jdCookieNode[item]) {
					cookiesArr.push(jdCookieNode[item])
				}
			})
			if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') that.log = () => {};
		} else {
			//IOS等用户直接用NobyDa的jd cookie
			let cookiesData = $.getdata('CookiesJD') || "[]";
			cookiesData = jsonParse(cookiesData);
			cookiesArr = cookiesData.map(item => item.cookie);
			cookiesArr.reverse();
			cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
			cookiesArr.reverse();
			cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
		}
		that.log(`共${cookiesArr.length}个京东账号\n`)

		if ($.isNode()) {
			if (process.env.JD_TRY_CIDS_KEYS) {
				cidsList = process.env.JD_TRY_CIDS_KEYS.split('@').filter(key=>{
					return Object.keys(cidsMap).includes(key)
				})
			}
			if (process.env.JD_TRY_TYPE_KEYS) {
				typeList = process.env.JD_TRY_CIDS_KEYS.split('@').filter(key=>{
					return Object.keys(typeMap).includes(key)
				})
			}
			if(process.env.JD_TRY_GOOD_FILTERS){
				goodFilters = process.env.JD_TRY_GOOD_FILTERS.split('@')
			}
			if (process.env.JD_TRY_MIN_PRICE) {
				minPrice = process.env.JD_TRY_MIN_PRICE * 1
			}
			if (process.env.JD_TRY_PAGE_SIZE) {
				$.pageSize = process.env.JD_TRY_PAGE_SIZE * 1
			}
		} else {
			let qxCidsList = []
			let qxTypeList = []
			const cidsKeys = Object.keys(cidsMap)
			const typeKeys = Object.keys(typeMap)
			for (let key of cidsKeys) {
				const open = $.getdata(key)
				if (open == 'true') qxCidsList.push(key)
			}
			for (let key of typeKeys) {
				const open = $.getdata(key)
				if (open == 'true') qxTypeList.push(key)
			}
			if (qxCidsList.length != 0) cidsList = qxCidsList
			if (qxTypeList.length != 0) typeList = qxTypeList
			if ($.getdata('filter')) goodFilters = $.getdata('filter').split('&')
			if ($.getdata('min_price')) minPrice = Number($.getdata('min_price'))
			if ($.getdata('page_size')) $.pageSize = Number($.getdata('page_size'))
			if ($.pageSize == 0) $.pageSize = 12
		}
		resolve()
	})
}

function getGoodListByCond(cids, page, pageSize, type, state) {

	return new Promise((resolve, reject) => {
		let option = taskurl(`${selfdomain}/activity/list?pb=1&cids=${cids}&page=${page}&pageSize=${pageSize}&type=${type}&state=${state}`)
		delete option.headers['Cookie']
		$.get(option, (err, resp, data) => {
			try {
				if (err) {
					that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.success) {
						$.totalPages = data.data.pages
						allGoodList = allGoodList.concat(data.data.data)
					} else {
						that.log(`💩 获得 ${cids} ${page} 列表失败: ${data.message}`)
					}
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve()
			}
		})
	})
}

async function getGoodList() {
	if (cidsList.length === 0) cidsList.push("全部商品")
	if (typeList.length === 0) typeList.push("全部试用")
	for (let cidsKey of cidsList) {
		for (let typeKey of typeList) {
			if (!cidsMap.hasOwnProperty(cidsKey) || !typeMap.hasOwnProperty(typeKey)) continue
			that.log(`⏰ 获取 ${cidsKey} ${typeKey} 商品列表`)
			$.totalPages = 1
			for (let page = 1; page <= $.totalPages; page++) {
				await getGoodListByCond(cidsMap[cidsKey], page, $.pageSize, typeMap[typeKey], '0')
			}
		}
	}
}

async function filterGoodList() {
	that.log(`⏰ 过滤商品列表，当前共有${allGoodList.length}个商品`)
	const now = Date.now()
	const oneMoreDay = now + 24 * 60 * 60 * 1000
	$.goodList = allGoodList.filter(good => {
		// 1. good 有问题
		// 2. good 距离结束不到10min
		// 3. good 的结束时间大于一天
		// 4. good 的价格小于最小的限制
		if (!good || good.endTime < now + 10 * 60 * 1000 || good.endTime > oneMoreDay || good.jdPrice < minPrice) {
			return false
		}
		for (let item of goodFilters) {
			if (good.trialName.indexOf(item) != -1) return false
		}
		return true

	})
	await getApplyStateByActivityIds()
	$.goodList = $.goodList.sort((a, b) => {
		return b.jdPrice - a.jdPrice
	})
}

async function getApplyStateByActivityIds() {
	function opt(ids) {
		return new Promise((resolve, reject) => {
			$.get(taskurl(`${selfdomain}/getApplyStateByActivityIds?activityIds=${ids.join(',')}`), (err, resp, data) => {
				try {
					if (err) {
						that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
					} else {
						data = JSON.parse(data)
						ids.length = 0
						for (let apply of data) ids.push(apply.activityId)
					}
				} catch (e) {
					reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
				} finally {
					$.goodList = $.goodList.filter(good => {
						for (let id of ids) {
							if (id == good.id) {
								return false
							}
						}
						return true
					})
					resolve()
				}
			})
		})
	}

	let list = []
	for (let good of $.goodList) {
		list.push(good.id)
		if (list.length == $.pageSize) {
			await opt(list)
			list.length = 0
		}
	}
	if (list.length) await opt(list)
}

function canTry(good) {
	return new Promise((resolve, reject) => {
		let ret = false
		$.get(taskurl(`${selfdomain}/activity?id=${good.id}`), (err, resp, data) => {
			try {
				if (err) {
					that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					ret = data.indexOf('trySku') != -1
					let result = data.match(/"shopId":(\d+)/)
					if (result) {
						good.shopId = eval(result[1])
					}
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve(ret)
			}
		})
	})
}

function isFollowed(good) {
	return new Promise((resolve, reject) => {
		$.get(taskurl(`${selfdomain}/isFollowed?id=${good.shopId}`, good.id), (err, resp, data) => {
			try {
				if (err) {
					that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					resolve(data.success && data.data)
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve(false)
			}
		})
	})
}

function followShop(good) {
	return new Promise((resolve, reject) => {
		$.get(taskurl(`${selfdomain}/followShop?id=${good.shopId}`, good.id), (err, resp, data) => {
			try {
				if (err) {
					that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.code == 'F0410') {
						$.running = false
						$.stopMsg = data.msg || "关注数超过上限了哦~先清理下关注列表吧"
					}
					resolve(data.success && data.data)
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve(false)
			}
		})
	})
}

async function tryGoodList() {
	that.log(`⏰ 即将申请 ${$.goodList.length} 个商品`)
	$.running = true
	$.stopMsg = '申请完毕'
	for (let i = 0; i < $.goodList.length && $.running; i++) {
		let good = $.goodList[i]
		if (!await canTry(good)) continue
		// 如果没有关注且关注失败
		if (good.shopId && !await isFollowed(good) && !await followShop(good)) continue
		// 两个申请间隔不能太短，放在下面有利于确保 follwShop 完成
		await $.wait(5000)
		// 关注完毕，即将试用
		await doTry(good)
	}
}

async function doTry(good) {
	return new Promise((resolve, reject) => {
		$.get(taskurl(`${selfdomain}/migrate/apply?activityId=${good.id}&source=1&_s=m`, good.id), (err, resp, data) => {
			try {
				if (err) {
					that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.success) {
						$.totalTry += 1
						that.log(`🥳 ${good.id} 🛒${good.trialName.substr(0,15)}🛒 ${data.message}`)
					} else if (data.code == '-131') { // 每日300个商品
						$.stopMsg = data.message
						$.running = false
					} else {
						that.log(`🤬 ${good.id} 🛒${good.trialName.substr(0,15)}🛒 ${JSON.stringify(data)}`)
					}
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve()
			}
		})
	})
}

async function getSuccessList() {
	// 一页12个商品，不会吧不会吧，不会有人一次性中奖12个商品吧？！🤔
	return new Promise((resolve, reject) => {
		const option = {
			url: `https://try.jd.com/my/tryList?selected=2&page=1&tryVersion=2&_s=m`,
			headers: {
				'Host': 'try.jd.com',
				'Connection': 'keep-alive',
				'UserAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
				'Accept': '*/*',
				'Referer': 'https://try.m.jd.com/',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'zh,zh-CN;q=0.9,en;q=0.8',
				'Cookie': cookie
			}
		}
		$.get(option, (err, resp, data) => {
			try {
				if (err) {
					that.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
				} else {
					data = JSON.parse(data)
					if (data.success && data.data) {
						$.successList = data.data.data.filter(item => {
							return item.text.text.indexOf('请尽快领取') != -1
						})
					} else {
						that.log(`💩 获得成功列表失败: ${data.message}`)
					}
				}
			} catch (e) {
				reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
			} finally {
				resolve()
			}
		})
	})
}

async function showMsg() {
	let message = `京东账号${$.index} ${$.nickName || $.UserName}\n🎉 本次申请：${$.totalTry}/${$.totalGoods}个商品🛒\n🎉 ${$.successList.length}个商品待领取🤩\n🎉 结束原因：${$.stopMsg}`
	if (!jdNotify || jdNotify === 'false') {
		$.msg($.name, ``, message, {
			"open-url": 'https://try.m.jd.com/user'
		})
		if($.isNode()){
			await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, message)
		}
	} else {
		that.log(message)
	}
}

function taskurl(url, goodId) {
	return {
		'url': url,
		'headers': {
			'Host': 'try.m.jd.com',
			'Accept-Encoding': 'gzip, deflate, br',
			'Cookie': cookie,
			'Connection': 'keep-alive',
			'Accept': '*/*',
			'UserAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
			'Accept-Language': 'zh-cn',
			'Referer': goodId ? `https://try.m.jd.com/activity/?id=${goodId}` : undefined
		},
	}
}

function TotalBean() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
			"headers": {
				"Accept": "application/json,text/plain, */*",
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept-Encoding": "gzip, deflate, br",
				"Accept-Language": "zh-cn",
				"Connection": "keep-alive",
				"Cookie": cookie,
				"Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
				"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
			},
			"timeout": 10000,
		}
		$.post(options, (err, resp, data) => {
			try {
				if (err) {
					that.log(`${JSON.stringify(err)}`)
					that.log(`${$.name} API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data);
						if (data['retcode'] === 13) {
							$.isLogin = false; //cookie过期
							return
						}
						//$.nickName = data['base'].nickname;
						if (data['retcode'] === 0) {
                          $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                          $.nickName = $.UserName
                        }
					} else {
						that.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve();
			}
		})
	})
}

function jsonParse(str) {
	if (typeof str == "string") {
		try {
			return JSON.parse(str);
		} catch (e) {
			that.log(e);
			$.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
			return [];
		}
	}
}

function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;$.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o))),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}