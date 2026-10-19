/* ============================================================
 *  案例数据（可持续更新）
 *  ------------------------------------------------------------
 *  ★ 新增案例的操作方法：
 *    1. 把现场施工照片放到 assets/img/ 目录（建议命名 case-01.jpg / png）；
 *    2. 在下面的 CASES 数组中复制一段对象，填写字段；
 *    3. cover 填写图片路径，如 'assets/img/case-01.png'；
 *    4. gallery 可填多张现场图（数组），不填则只展示封面；
 *    5. 保存刷新页面即可，无需改 HTML。
 *  说明：以下条目为模板示例，请替换为真实项目信息后再对外发布。
 * ============================================================ */

window.CASES = [
  {
    id: 'case-01',
    category: 'factory',
    title: '成都某智能制造产业园防雷工程',
    location: '四川 · 成都',
    year: '2025',
    scale: '厂区 6 栋单体建筑，占地约 4.2 万㎡',
    cover: 'assets/img/biz-factory.png',
    summary: '厂房屋面统一敷设闭合避雷带网格，屋脊与屋角加设避雷短针，露天设备区由独立避雷针塔覆盖，全厂接地网贯通并预留测试点。',
    scope: [
      '屋面避雷带网格敷设与支架安装',
      '独立避雷针塔基础与安装（保护范围按滚球法校核）',
      '引下线敷设与断接卡箱设置',
      '接地网施工与降阻处理',
      '配电系统 SPD 分级安装'
    ],
    result: '接地电阻复测值满足设计要求，等电位连接全覆盖，竣工验收资料一次通过。',
    tags: ['工厂防雷', '避雷带', '独立避雷针', '接地网'],
    gallery: []
  },
  {
    id: 'case-02',
    category: 'building',
    title: '天府新区某商业综合体防雷检测',
    location: '四川 · 成都天府新区',
    year: '2025',
    scale: '高层主楼 + 裙楼，建筑高度约 98m',
    cover: 'assets/img/biz-building.png',
    summary: '对屋面接闪器、引下线、等电位与 SPD 开展定期检测，重点核查屋面金属设备接地与幕墙金属框架连接。',
    scope: [
      '接闪器完好性与保护范围核查',
      '引下线数量、间距与连通性测试',
      '屋面金属构件等电位检测',
      '配电与弱电系统 SPD 状态检查',
      '出具检测报告与整改建议'
    ],
    result: '排查出屋面设备接地缺失 3 处并整改闭环，复测合格。',
    tags: ['建筑防雷', '定期检测', '等电位', 'SPD'],
    gallery: []
  },
  {
    id: 'case-03',
    category: 'charging',
    title: '新能源汽车充电站防雷设计与施工',
    location: '四川 · 成都',
    year: '2024',
    scale: '直流快充桩 24 台，含充电雨棚',
    cover: 'assets/img/biz-charging.png',
    summary: '场地中央设置高耸独立避雷针，锥形保护范围覆盖全部充电桩与车辆停留区，配电回路采用分级 SPD 保护。',
    scope: [
      '独立避雷针设计与安装',
      '充电设备区直击雷防护范围校核',
      '配电柜 SPD 与后备保护配置',
      '场地接地网与设备等电位连接',
      '竣工检测与资料交付'
    ],
    result: '保护范围覆盖全部充电位，接地与等电位一次检测合格。',
    tags: ['充电站防雷', '独立避雷针', '配电 SPD', '等电位'],
    gallery: []
  },
  {
    id: 'case-04',
    category: 'special',
    title: '110kV 户外变电站防雷改造',
    location: '四川 · 眉山',
    year: '2024',
    scale: '户外配电装置区 + 主控楼',
    cover: 'assets/img/biz-special.png',
    summary: '利用构架避雷针形成联合保护，完善接地网与设备接地引下线，主控楼弱电系统加装信号 SPD。',
    scope: [
      '构架避雷针校核与补强',
      '接地网连通性检测与补焊',
      '设备接地引下线整治',
      '二次系统与通信回路 SPD 加装'
    ],
    result: '接地网连通性全部合格，二次系统防雷短板消除。',
    tags: ['变电站', '特殊站点', '接地网', '信号 SPD'],
    gallery: []
  },
  {
    id: 'case-05',
    category: 'special',
    title: '通信基站铁塔与机房防雷整治',
    location: '四川 · 川西片区',
    year: '2024',
    scale: '铁塔基站 12 座（批量整治）',
    cover: 'assets/img/service-testing.png',
    summary: '铁塔顶端避雷针完好性整治，馈线接地卡与机房接地排整改，基站电源与信号端口加装 SPD。',
    scope: [
      '铁塔避雷针与塔体接地检测',
      '馈线三点接地整改',
      '机房等电位接地排整治',
      '电源 / 信号端口 SPD 加装'
    ],
    result: '12 座站点全部完成整改，接地电阻达标率 100%。',
    tags: ['通信基站', '铁塔', '馈线接地', 'SPD'],
    gallery: []
  },
  {
    id: 'case-06',
    category: 'special',
    title: '大型仓储库房防雷设施安装',
    location: '四川 · 德阳',
    year: '2023',
    scale: '钢结构库房 3 栋，单栋长约 180m',
    cover: 'assets/img/case-construction.png',
    summary: '利用钢屋面金属板作为接闪器的条件核查与补强，沿柱敷设引下线，环形接地体与库房出入口等电位处理。',
    scope: [
      '金属屋面接闪条件核查与补强',
      '避雷带与避雷短针安装',
      '引下线沿钢柱敷设',
      '环形接地体施工与测试点预留'
    ],
    result: '施工与检测一次通过，后期纳入年度定期检测。',
    tags: ['库房防雷', '避雷带', '引下线', '环形接地'],
    gallery: []
  },
  {
    id: 'case-07',
    category: 'smart',
    title: '数据中心机房智能防雷在线监测',
    location: '四川 · 成都',
    year: '2025',
    scale: '机房 2 层，机柜 120 面',
    cover: 'assets/img/case-datacenter.png',
    summary: '机房等电位接地网整治，配电柜内 SPD 加装智能监测模块，雷击次数、SPD 状态与接地状态统一上送平台。',
    scope: [
      '机房等电位接地网整改',
      '配电柜 SPD 与监测模块安装',
      '嵌入式采集终端部署与调试',
      '监测平台接入与告警配置'
    ],
    result: '实现雷击与 SPD 状态在线可视，运维巡检由人工定期改为状态驱动。',
    tags: ['智能防雷', '数据中心', '在线监测', '嵌入式'],
    gallery: []
  },
  {
    id: 'case-08',
    category: 'factory',
    title: '装备制造厂区年度防雷检测服务',
    location: '四川 · 绵阳',
    year: '2025',
    scale: '厂区年度定期检测，点位 180 余处',
    cover: 'assets/img/service-testing.png',
    summary: '按年度周期开展全厂防雷装置检测，覆盖接闪器、引下线、接地装置、等电位与 SPD，形成隐患清单与整改建议。',
    scope: [
      '全厂防雷点位台账建立',
      '接地电阻与连通性测试',
      'SPD 状态与参数核查',
      '隐患分级与整改跟踪'
    ],
    result: '形成年度检测报告与隐患整改闭环清单。',
    tags: ['防雷检测', '年度检测', '隐患治理', '工厂防雷'],
    gallery: []
  }
];

/* 案例分类筛选标签（与 CASES 中的 category 对应） */
window.CASE_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'factory', label: '工厂防雷' },
  { key: 'building', label: '建筑防雷' },
  { key: 'charging', label: '充电站防雷' },
  { key: 'special', label: '特殊站点' },
  { key: 'smart', label: '智能防雷' }
];
