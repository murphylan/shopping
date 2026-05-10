import type { Product } from "@/types/product-types";

/**
 * `pnpm db:seed` 使用的商品快照（与数据库结构一致）。
 * 仅由 seed 脚本引用，不作为运行时假数据。
 */
export const SEED_PRODUCTS: Product[] = [
  {
    id: "1",
    businessId: "P001",
    name: "经典白色圆领T恤 纯棉透气",
    description: "100%纯棉面料，柔软透气，经典百搭",
    price: "59.00",
    stock: 200,
    imageUrl: "/images/products/tshirt.jpg",
    category: "服饰",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    businessId: "P002",
    name: "无线蓝牙降噪耳机 HIFI音质",
    description: "主动降噪，40小时续航，高清通话",
    price: "299.00",
    stock: 80,
    imageUrl: "/images/products/headphone.jpg",
    category: "数码",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    businessId: "P003",
    name: "手工牛轧糖礼盒装 多口味混合",
    description: "精选原料，手工制作，送礼佳品",
    price: "39.90",
    stock: 500,
    imageUrl: "/images/products/candy.jpg",
    category: "美食",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    businessId: "P004",
    name: "便携式迷你充电宝 10000mAh",
    description: "轻薄便携，快充协议，双口输出",
    price: "89.00",
    stock: 150,
    imageUrl: "/images/products/powerbank.jpg",
    category: "数码",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    businessId: "P005",
    name: "保湿补水面膜套装 28片装",
    description: "玻尿酸精华，深层补水，温和不刺激",
    price: "68.00",
    stock: 300,
    imageUrl: "/images/products/skincare.jpg",
    category: "美妆",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    businessId: "P006",
    name: "北欧简约台灯 LED护眼",
    description: "三档调光，USB充电，卧室书桌两用",
    price: "128.00",
    stock: 60,
    imageUrl: "/images/products/lamp.jpg",
    category: "家居",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    businessId: "P007",
    name: "双肩背包男女通用 大容量防水",
    description: "防泼水面料，多隔层收纳，减压背带",
    price: "149.00",
    stock: 120,
    imageUrl: "/images/products/backpack.jpg",
    category: "服饰",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    businessId: "P008",
    name: "精选挂耳咖啡 意式浓缩 20包",
    description: "新鲜烘焙，独立包装，随时享用",
    price: "49.90",
    stock: 400,
    imageUrl: "/images/products/coffee.jpg",
    category: "美食",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    businessId: "P009",
    name: "智能手表运动版 心率血氧监测",
    description: "全天候健康监测，14天超长续航",
    price: "399.00",
    stock: 45,
    imageUrl: "/images/products/smartwatch.jpg",
    category: "数码",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    businessId: "P010",
    name: "创意生日礼物盲盒 惊喜拆箱",
    description: "精心搭配，每盒不同，给你惊喜",
    price: "79.00",
    stock: 200,
    imageUrl: "/images/products/giftbox.jpg",
    category: "礼物",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "11",
    businessId: "P011",
    name: "纯棉休闲短裤 夏季薄款",
    description: "弹力腰带，透气舒适，多色可选",
    price: "79.00",
    stock: 180,
    imageUrl: "/images/products/shorts.jpg",
    category: "服饰",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "12",
    businessId: "P012",
    name: "畅销小说精选套装 全5册",
    description: "豆瓣高分推荐，口碑之作",
    price: "118.00",
    stock: 90,
    imageUrl: "/images/products/books.jpg",
    category: "图书",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "13",
    businessId: "P013",
    name: "ins风香薰蜡烛 助眠安神",
    description: "天然植物蜡，持久留香，礼盒包装",
    price: "45.00",
    stock: 250,
    imageUrl: "/images/products/candle.jpg",
    category: "家居",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "14",
    businessId: "P014",
    name: "口红套装礼盒 6色哑光",
    description: "丝绒质地，持久不脱色，显白提气色",
    price: "158.00",
    stock: 100,
    imageUrl: "/images/products/lipstick.jpg",
    category: "美妆",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "15",
    businessId: "P015",
    name: "进口坚果大礼包 混合装1kg",
    description: "每日坚果，健康零食，新鲜直达",
    price: "88.00",
    stock: 350,
    imageUrl: "/images/products/nuts.jpg",
    category: "美食",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "16",
    businessId: "P016",
    name: "Type-C快充数据线 1.5米",
    description: "6A大电流，编织线材，耐弯折",
    price: "19.90",
    stock: 800,
    imageUrl: "/images/products/cable.jpg",
    category: "数码",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "17",
    businessId: "SW001",
    name: "WorkSync 项目文档与协作平台",
    description: `WorkSync 是面向团队的项目文档与协作平台，把文档管理、任务看板、PlantUML 技术图表、协作白板与 AI 图表助手整合在同一个工作区。

核心能力：Markdown 与富文本双模式文档、结构化目录、全文检索、任务看板、PlantUML 实时预览、AI 图表生成、Excalidraw 白板、RBAC 权限控制、操作日志与在线备份。

适用场景：研发项目管理、客户交付文档、产品需求沉淀、知识库建设、技术方案评审、远程会议协作与私有化部署。

交付价值：一个 WorkSync 覆盖项目全生命周期协作需求，让团队资料不再散落在聊天群、邮件和个人网盘里。

在线体验：https://worksync.murphylan.cloud/`,
    price: "999.00",
    stock: 999,
    imageUrl: "/images/products/worksync-bg.jpg",
    category: "软件服务",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "18",
    businessId: "SW002",
    name: "小卒 中国象棋 AI 辅助",
    description: `小卒是中国象棋智能辅助平台，基于顶级象棋引擎 Pikafish 打造，既能做个人 AI 教练，也能作为好友在线对弈工具。

核心能力：大师级 AI 引擎、SSE 实时流式分析、搜索深度展示、局面评分、最佳走法推荐、多候选路线、走法历史、悔棋、在线房间、步时控制与断线重连。

适用场景：个人复盘研究、微信小程序对弈辅助、好友在线切磋、象棋教学演示与会员制棋艺训练。

交付价值：让每一步棋都有 AI 为你把关，手机和桌面端都能获得流畅的专业分析体验。

在线体验：https://chess.murphylan.cloud/`,
    price: "19.90",
    stock: 999,
    imageUrl: "/images/products/xiaozu-bg.jpg",
    category: "软件服务",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "19",
    businessId: "SW003",
    name: "Rally 活动互动平台",
    description: `Rally 是面向企业活动、会议、培训、年会和发布会的一站式互动平台。参与者无需下载 App，手机扫码即可签到、投票、抽奖或填写表单。

核心能力：扫码签到、大屏欢迎弹幕、白名单模式、现场投票、实时结果图表、转盘 /老虎机 / 翻牌 / 九宫格抽奖、自定义表单、SSE 大屏同步与 CSV 数据导出。

适用场景：企业年会、培训会议、候选人评选、产品发布会、婚礼互动、线下调研和客户线索收集。

交付价值：组织者 3 分钟创建活动，一个短码贯穿全流程，让现场互动从繁琐变得轻量、实时、有氛围。

在线体验：https://sign.murphylan.cloud/`,
    price: "299.00",
    stock: 999,
    imageUrl: "/images/products/rally-bg.jpg",
    category: "软件服务",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "20",
    businessId: "SW004",
    name: "Shopping H5 小商城",
    description: `Shopping 是基于 Next.js 16 的 H5 移动电商平台，商家只需要一个 URL 或二维码，就能拥有自己的手机端小商城。

核心能力：首页 Banner 与快捷入口配置、商品管理、分类浏览、关键词搜索、购物车、库存控制、下单流程、用户登录、订单管理与运营后台。

适用场景：门店私域商城、内部福利商城、社群团购、节日促销、临时活动售卖、快闪商品页和电商项目演示。

交付价值：移动端优先设计，扫码即逛即买，帮助中小商家用最低成本跑通从商品展示到下单管理的完整闭环。

在线体验：https://shopping.murphylan.cloud/`,
    price: "999.00",
    stock: 999,
    imageUrl: "/images/products/shopping-bg.jpg",
    category: "软件服务",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "21",
    businessId: "SW005",
    name: "TimeSlot 独立从业者预约小站",
    description: `TimeSlot 是面向独立从业者的预约小站，帮助私教、心理咨询师、家教、瑜伽教练和技能老师告别群聊接龙，5 分钟拥有自己的公开预约页。

核心能力：公开预约主页、服务项目管理、周视图可预约时段、例外日关闭、二维码 / 短链分享、自动锁定时段、首次预约自动建档、客户 24 小时邮件提醒、从业者每日预约清单。

套餐说明：Free 套餐永久免费；Pro 个人版 ¥39/月起，支持无限服务 / 客户 / 预约并去除水印；Team 工作室版 ¥99/月，适合 1-3 人小工作室协作。

适用场景：心理咨询、私人健身、家教约课、英语口语、瑜伽、钢琴、绘画、陶艺和个人服务预约。

交付价值：客户扫码即可选时段并确认预约，学员费用线下自收，钱不过平台，信息不外泄，把时间还给真正重要的事。

在线体验：https://timeslot.murphylan.cloud/zh`,
    price: "39.00",
    stock: 999,
    imageUrl: "/images/products/timeslot-bg.jpg",
    category: "软件服务",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
