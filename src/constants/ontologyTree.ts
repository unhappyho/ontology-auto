import type { OntologyL1, Entity, MappingData, ActivityDomainNode } from '@/types'

// L3 分组命名规则：
// 业务实体 → "业务实体·{分类}"，分类取值：人/财/物/信息/技术/数据
// 活动实体 → "活动实体·{领域视图}·活动" 或 "活动实体·{领域视图}·分析"

export const ONTOLOGY_TREE: OntologyL1[] = [
  {
    id: 'l1_crm',
    label: 'CRM 客户管理域',
    color: '#165DFF',
    icon: 'UsergroupAddOutlined',
    children: [
      {
        id: 'l2_crm_user',
        label: '用户信息子域',
        color: '#165DFF',
        icon: 'TeamOutlined',
        children: [
          { id: 'onto_crm_user_person', label: '业务实体·人', color: '#165DFF', total: 3, newCnt: 2, existCnt: 1, l3GroupType: 'business', entitySubClass: '人' },
          { id: 'onto_crm_user_info', label: '业务实体·信息', color: '#4080FF', total: 2, newCnt: 1, existCnt: 1, l3GroupType: 'business', entitySubClass: '信息' },
          { id: 'onto_crm_user_tech', label: '业务实体·技术', color: '#6AA3FF', total: 2, newCnt: 2, existCnt: 0, l3GroupType: 'business', entitySubClass: '技术' }
        ]
      },
      {
        id: 'l2_crm_contract',
        label: '合同服务子域',
        color: '#0A3D91',
        icon: 'FileTextOutlined',
        children: [
          { id: 'onto_crm_contract_act', label: '活动实体·销售领域·活动', color: '#0A3D91', total: 4, newCnt: 2, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '销售领域' },
          { id: 'onto_crm_contract_ana', label: '活动实体·销售领域·分析', color: '#1A5CB5', total: 3, newCnt: 1, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域分析实体', domainView: '销售领域' }
        ]
      }
    ]
  },
  {
    id: 'l1_order',
    label: '订单交易域',
    color: '#722ED1',
    icon: 'ShoppingCartOutlined',
    children: [
      {
        id: 'l2_order_main',
        label: '主交易子域',
        color: '#722ED1',
        icon: 'ProfileOutlined',
        children: [
          { id: 'onto_order_main', label: '活动实体·销售领域·活动', color: '#722ED1', total: 5, newCnt: 3, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '销售领域' },
          { id: 'onto_order_finance', label: '业务实体·财', color: '#9B59B6', total: 2, newCnt: 1, existCnt: 1, l3GroupType: 'business', entitySubClass: '财' }
        ]
      },
      {
        id: 'l2_order_promo',
        label: '促销优惠子域',
        color: '#531DAB',
        icon: 'TagOutlined',
        children: [
          { id: 'onto_order_info', label: '业务实体·信息', color: '#531DAB', total: 3, newCnt: 2, existCnt: 1, l3GroupType: 'business', entitySubClass: '信息' },
          { id: 'onto_order_mkt_act', label: '活动实体·市场营销·活动', color: '#6B21A8', total: 3, newCnt: 3, existCnt: 0, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '市场营销' },
          { id: 'onto_order_mkt_ana', label: '活动实体·市场营销·分析', color: '#7C3AED', total: 2, newCnt: 0, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域分析实体', domainView: '市场营销' }
        ]
      }
    ]
  },
  {
    id: 'l1_product',
    label: '产品目录域',
    color: '#14C9C9',
    icon: 'AppstoreAddOutlined',
    children: [
      {
        id: 'l2_product_catalog',
        label: '产品分类子域',
        color: '#14C9C9',
        icon: 'UnorderedListOutlined',
        children: [
          { id: 'onto_product_goods', label: '业务实体·物', color: '#14C9C9', total: 3, newCnt: 1, existCnt: 2, l3GroupType: 'business', entitySubClass: '物' },
          { id: 'onto_product_info', label: '业务实体·信息', color: '#0ABAD8', total: 3, newCnt: 2, existCnt: 1, l3GroupType: 'business', entitySubClass: '信息' },
          { id: 'onto_product_data', label: '业务实体·数据', color: '#06B6D4', total: 2, newCnt: 1, existCnt: 1, l3GroupType: 'business', entitySubClass: '数据' }
        ]
      },
      {
        id: 'l2_product_resource',
        label: '资源配置子域',
        color: '#0E7490',
        icon: 'ControlOutlined',
        children: [
          { id: 'onto_product_tech', label: '业务实体·技术', color: '#0E7490', total: 4, newCnt: 2, existCnt: 2, l3GroupType: 'business', entitySubClass: '技术' },
          { id: 'onto_product_tool', label: '活动实体·平台能力.工具能力·活动', color: '#155E75', total: 3, newCnt: 3, existCnt: 0, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '平台能力.工具能力' }
        ]
      }
    ]
  },
  {
    id: 'l1_network',
    label: '网络基础设施域',
    color: '#FA8C16',
    icon: 'WifiOutlined',
    children: [
      {
        id: 'l2_net_station',
        label: '基站无线子域',
        color: '#FA8C16',
        icon: 'RadioOutlined',
        children: [
          { id: 'onto_net_bs', label: '业务实体·物', color: '#FA8C16', total: 3, newCnt: 2, existCnt: 1, l3GroupType: 'business', entitySubClass: '物' },
          { id: 'onto_net_info', label: '业务实体·信息', color: '#F59E0B', total: 3, newCnt: 2, existCnt: 1, l3GroupType: 'business', entitySubClass: '信息' },
          { id: 'onto_net_tech', label: '业务实体·技术', color: '#D97706', total: 2, newCnt: 2, existCnt: 0, l3GroupType: 'business', entitySubClass: '技术' }
        ]
      },
      {
        id: 'l2_net_core',
        label: '核心网子域',
        color: '#B45309',
        icon: 'CloudServerOutlined',
        children: [
          { id: 'onto_net_core_tech', label: '业务实体·技术', color: '#B45309', total: 4, newCnt: 3, existCnt: 1, l3GroupType: 'business', entitySubClass: '技术' },
          { id: 'onto_net_engine', label: '活动实体·平台能力.引擎能力·活动', color: '#92400E', total: 3, newCnt: 3, existCnt: 0, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '平台能力.引擎能力' },
          { id: 'onto_net_data', label: '业务实体·数据', color: '#78350F', total: 3, newCnt: 1, existCnt: 2, l3GroupType: 'business', entitySubClass: '数据' }
        ]
      },
      {
        id: 'l2_net_equip',
        label: '设备资产子域',
        color: '#C2410C',
        icon: 'ConsoleSqlOutlined',
        children: [
          { id: 'onto_net_hw', label: '业务实体·物', color: '#C2410C', total: 4, newCnt: 3, existCnt: 1, l3GroupType: 'business', entitySubClass: '物' },
          { id: 'onto_net_port', label: '业务实体·技术', color: '#9A3412', total: 3, newCnt: 1, existCnt: 2, l3GroupType: 'business', entitySubClass: '技术' }
        ]
      }
    ]
  },
  {
    id: 'l1_billing',
    label: '计费账务域',
    color: '#00B42A',
    icon: 'AccountBookOutlined',
    children: [
      {
        id: 'l2_billing_bill',
        label: '账单账期子域',
        color: '#00B42A',
        icon: 'CalendarOutlined',
        children: [
          { id: 'onto_bill_main', label: '活动实体·财务领域·活动', color: '#00B42A', total: 4, newCnt: 2, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '财务领域' },
          { id: 'onto_bill_ana', label: '活动实体·财务领域·分析', color: '#16A34A', total: 3, newCnt: 1, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域分析实体', domainView: '财务领域' }
        ]
      },
      {
        id: 'l2_billing_pay',
        label: '缴费发票子域',
        color: '#15803D',
        icon: 'ReceiptOutlined',
        children: [
          { id: 'onto_bill_pay', label: '活动实体·财务领域·活动', color: '#15803D', total: 3, newCnt: 1, existCnt: 2, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '财务领域' },
          { id: 'onto_bill_finance', label: '业务实体·财', color: '#166534', total: 2, newCnt: 0, existCnt: 2, l3GroupType: 'business', entitySubClass: '财' }
        ]
      }
    ]
  },
  {
    id: 'l1_complaint',
    label: '投诉工单域',
    color: '#F53F3F',
    icon: 'CustomerServiceOutlined',
    children: [
      {
        id: 'l2_complaint_main',
        label: '工单主体子域',
        color: '#F53F3F',
        icon: 'SolutionOutlined',
        children: [
          { id: 'onto_comp_ticket', label: '活动实体·交付领域·活动', color: '#F53F3F', total: 3, newCnt: 3, existCnt: 0, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '交付领域' },
          { id: 'onto_comp_person', label: '业务实体·人', color: '#EF4444', total: 2, newCnt: 1, existCnt: 1, l3GroupType: 'business', entitySubClass: '人' }
        ]
      },
      {
        id: 'l2_complaint_quality',
        label: '质检回访子域',
        color: '#B91C1C',
        icon: 'StarOutlined',
        children: [
          { id: 'onto_comp_survey', label: '活动实体·交付领域·活动', color: '#B91C1C', total: 2, newCnt: 2, existCnt: 0, l3GroupType: 'activity', entitySubClass: '领域活动实体', domainView: '交付领域' },
          { id: 'onto_comp_qa', label: '活动实体·交付领域·分析', color: '#991B1B', total: 2, newCnt: 1, existCnt: 1, l3GroupType: 'activity', entitySubClass: '领域分析实体', domainView: '交付领域' }
        ]
      }
    ]
  }
]

// 活动实体视图树：按领域视图聚合，区分活动（activity）和分析（analysis）两类叶节点
export const ACTIVITY_DOMAIN_TREE: ActivityDomainNode[] = [
  {
    domain: '市场营销',
    label: '市场营销',
    color: '#6B21A8',
    children: [
      { id: 'act_mkt_act', label: '营销活动', type: 'activity', total: 3, newCnt: 3, existCnt: 0, domainView: '市场营销' },
      { id: 'act_mkt_ana', label: '营销分析', type: 'analysis', total: 2, newCnt: 0, existCnt: 2, domainView: '市场营销' }
    ]
  },
  {
    domain: '销售领域',
    label: '销售领域',
    color: '#0A3D91',
    children: [
      { id: 'act_sales_act', label: '销售活动', type: 'activity', total: 9, newCnt: 5, existCnt: 4, domainView: '销售领域' },
      { id: 'act_sales_ana', label: '销售分析', type: 'analysis', total: 3, newCnt: 1, existCnt: 2, domainView: '销售领域' }
    ]
  },
  {
    domain: '研发领域',
    label: '研发领域',
    color: '#14C9C9',
    children: [
      { id: 'act_rd_act', label: '研发活动', type: 'activity', total: 4, newCnt: 2, existCnt: 2, domainView: '研发领域' }
    ]
  },
  {
    domain: '交付领域',
    label: '交付领域',
    color: '#F53F3F',
    children: [
      { id: 'act_delivery_act', label: '交付活动', type: 'activity', total: 5, newCnt: 5, existCnt: 0, domainView: '交付领域' },
      { id: 'act_delivery_ana', label: '交付分析', type: 'analysis', total: 2, newCnt: 1, existCnt: 1, domainView: '交付领域' }
    ]
  },
  {
    domain: '人力资源',
    label: '人力资源',
    color: '#FA8C16',
    children: [
      { id: 'act_hr_act', label: 'HR活动', type: 'activity', total: 3, newCnt: 1, existCnt: 2, domainView: '人力资源' }
    ]
  },
  {
    domain: '财务领域',
    label: '财务领域',
    color: '#00B42A',
    children: [
      { id: 'act_fin_act', label: '财务活动', type: 'activity', total: 7, newCnt: 3, existCnt: 4, domainView: '财务领域' },
      { id: 'act_fin_ana', label: '财务分析', type: 'analysis', total: 3, newCnt: 1, existCnt: 2, domainView: '财务领域' }
    ]
  },
  {
    domain: '平台能力.工具能力',
    label: '平台工具能力',
    color: '#155E75',
    children: [
      { id: 'act_tool_act', label: '工具活动', type: 'activity', total: 3, newCnt: 3, existCnt: 0, domainView: '平台能力.工具能力' }
    ]
  },
  {
    domain: '平台能力.引擎能力',
    label: '平台引擎能力',
    color: '#92400E',
    children: [
      { id: 'act_engine_act', label: '引擎活动', type: 'activity', total: 3, newCnt: 3, existCnt: 0, domainView: '平台能力.引擎能力' }
    ]
  }
]

export const ENTITY_DATA: Record<string, Entity[]> = {
  onto_crm_user_person: [
    { id: 'e1', name: 'User', nameCn: '用户', isNew: true, entity_concept_type: '业务实体', entity_sub_class: '人', domain_view: null, attrs: [
      { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'userName', cn: '用户姓名', termId: 'term_010', termName: '用户名称' }, { en: 'phoneNumber', cn: '手机号码', termId: 'term_002', termName: '联系电话' },
      { en: 'email', cn: '邮箱', termId: 'term_011', termName: '电子邮箱' }, { en: 'status', cn: '账户状态', termId: 'term_012', termName: '账号状态' }, { en: 'createTime', cn: '注册时间', termId: 'term_013', termName: '创建时间' }
    ]},
    { id: 'e2', name: 'UserAuth', nameCn: '认证信息', isNew: true, entity_concept_type: '业务实体', entity_sub_class: '人', domain_view: null, attrs: [
      { en: 'authId', cn: '认证ID', termId: 'term_014', termName: '认证标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'idType', cn: '证件类型', termId: 'term_015', termName: '证件类别' },
      { en: 'idNo', cn: '证件号码', termId: 'term_003', termName: '身份证号' }, { en: 'authStatus', cn: '实名状态', termId: 'term_016', termName: '实名认证状态' }
    ]},
    { id: 'e3', name: 'UserContact', nameCn: '联系方式', isNew: false, entity_concept_type: '业务实体', entity_sub_class: '人', domain_view: null, attrs: [
      { en: 'contactId', cn: '联系ID', termId: 'term_017', termName: '联系方式ID' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'contactType', cn: '联系类型', termId: 'term_018', termName: '联系方式类型' },
      { en: 'contactValue', cn: '联系内容', termId: 'term_019', termName: '联系方式内容' }, { en: 'isPrimary', cn: '是否主要', termId: 'term_020', termName: '是否主联系方式' }
    ]}
  ],
  onto_crm_user_info: [
    { id: 'e1', name: 'UserProfile', nameCn: '用户画像', isNew: true, entity_concept_type: '业务实体', entity_sub_class: '信息', domain_view: null, attrs: [
      { en: 'profileId', cn: '画像ID', termId: 'term_030', termName: '用户画像ID' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'ageGroup', cn: '年龄段', termId: 'term_031', termName: '年龄分段' },
      { en: 'gender', cn: '性别', termId: 'term_032', termName: '性别' }, { en: 'creditScore', cn: '信用评分', termId: 'term_033', termName: '信用分值' }
    ]},
    { id: 'e2', name: 'UserTag', nameCn: '用户标签', isNew: false, entity_concept_type: '业务实体', entity_sub_class: '信息', domain_view: null, attrs: [
      { en: 'tagId', cn: '标签ID', termId: 'term_034', termName: '标签标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'tagType', cn: '标签类型', termId: 'term_035', termName: '标签分类' },
      { en: 'tagValue', cn: '标签值', termId: 'term_036', termName: '标签值' }, { en: 'tagSource', cn: '标签来源', termId: 'term_037', termName: '标签来源渠道' }
    ]}
  ],
  onto_order_main: [
    { id: 'e1', name: 'Order', nameCn: '订单', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '销售领域', attrs: [
      { en: 'orderId', cn: '订单ID', termId: 'term_050', termName: '订单编号' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'totalAmount', cn: '订单总额', termId: 'term_051', termName: '订单总金额' },
      { en: 'payChannel', cn: '支付渠道', termId: 'term_052', termName: '支付方式' }, { en: 'orderStatus', cn: '订单状态', termId: 'term_053', termName: '订单状态' }, { en: 'createTime', cn: '创建时间', termId: 'term_013', termName: '创建时间' }
    ]},
    { id: 'e2', name: 'OrderItem', nameCn: '订单明细', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '销售领域', attrs: [
      { en: 'itemId', cn: '明细ID', termId: 'term_054', termName: '订单明细ID' }, { en: 'orderId', cn: '订单ID', termId: 'term_050', termName: '订单编号' }, { en: 'productId', cn: '产品ID', termId: 'term_055', termName: '商品标识' },
      { en: 'qty', cn: '数量', termId: 'term_056', termName: '商品数量' }, { en: 'unitPrice', cn: '单价', termId: 'term_057', termName: '商品单价' }, { en: 'subtotal', cn: '小计', termId: 'term_058', termName: '明细小计金额' }
    ]},
    { id: 'e3', name: 'Payment', nameCn: '支付记录', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '销售领域', attrs: [
      { en: 'payId', cn: '支付ID', termId: 'term_059', termName: '支付交易ID' }, { en: 'orderId', cn: '订单ID', termId: 'term_050', termName: '订单编号' }, { en: 'amount', cn: '支付金额', termId: 'term_060', termName: '实付金额' },
      { en: 'transNo', cn: '交易流水号', termId: 'term_061', termName: '支付流水号' }, { en: 'payTime', cn: '支付时间', termId: 'term_062', termName: '支付完成时间' }
    ]},
    { id: 'e4', name: 'Delivery', nameCn: '派发记录', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '交付领域', attrs: [
      { en: 'deliverId', cn: '派发ID', termId: 'term_063', termName: '配送单ID' }, { en: 'orderId', cn: '订单ID', termId: 'term_050', termName: '订单编号' }, { en: 'activateTime', cn: '激活时间', termId: 'term_064', termName: '产品激活时间' },
      { en: 'expireTime', cn: '到期时间', termId: 'term_065', termName: '服务到期时间' }, { en: 'deliverStatus', cn: '派发状态', termId: 'term_066', termName: '配送状态' }
    ]},
    { id: 'e5', name: 'OrderLog', nameCn: '订单日志', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '销售领域', attrs: [
      { en: 'logId', cn: '日志ID', termId: 'term_067', termName: '操作日志ID' }, { en: 'orderId', cn: '订单ID', termId: 'term_050', termName: '订单编号' }, { en: 'opType', cn: '操作类型', termId: 'term_068', termName: '操作业务类型' },
      { en: 'opTime', cn: '操作时间', termId: 'term_069', termName: '操作发生时间' }, { en: 'opUser', cn: '操作人', termId: 'term_070', termName: '操作人账号' }
    ]}
  ],
  onto_net_bs: [
    { id: 'e1', name: 'BaseStation', nameCn: '基站', isNew: true, entity_concept_type: '业务实体', entity_sub_class: '物', domain_view: null, attrs: [
      { en: 'stationId', cn: '基站ID', termId: 'term_080', termName: '基站标识' }, { en: 'stationName', cn: '基站名称', termId: 'term_081', termName: '基站名称' }, { en: 'stationType', cn: '基站类型', termId: 'term_082', termName: '基站设备类型' },
      { en: 'longitude', cn: '经度', termId: 'term_083', termName: '地理经度坐标' }, { en: 'latitude', cn: '纬度', termId: 'term_084', termName: '地理纬度坐标' }, { en: 'coverageRadius', cn: '覆盖半径', termId: 'term_085', termName: '信号覆盖半径' },
      { en: 'status', cn: '运行状态', termId: 'term_086', termName: '设备运行状态' }
    ]},
    { id: 'e2', name: 'Cell', nameCn: '小区', isNew: true, entity_concept_type: '业务实体', entity_sub_class: '物', domain_view: null, attrs: [
      { en: 'cellId', cn: '小区ID', termId: 'term_087', termName: '小区标识' }, { en: 'stationId', cn: '基站ID', termId: 'term_080', termName: '基站标识' }, { en: 'cellName', cn: '小区名称', termId: 'term_088', termName: '小区名称' },
      { en: 'frequency', cn: '频率', termId: 'term_089', termName: '工作频率' }, { en: 'bandwidth', cn: '带宽', termId: 'term_090', termName: '频谱带宽' }, { en: 'azimuth', cn: '方位角', termId: 'term_091', termName: '天线方位角' }
    ]},
    { id: 'e3', name: 'Region', nameCn: '区域', isNew: false, entity_concept_type: '业务实体', entity_sub_class: '信息', domain_view: null, attrs: [
      { en: 'regionId', cn: '区域ID', termId: 'term_092', termName: '区域标识' }, { en: 'regionName', cn: '区域名称', termId: 'term_093', termName: '区域名称' }, { en: 'parentId', cn: '上级区域ID', termId: 'term_094', termName: '上级区域标识' },
      { en: 'level', cn: '层级', termId: 'term_095', termName: '区域层级' }, { en: 'areaCode', cn: '行政区划码', termId: 'term_004', termName: '行政区划' }
    ]}
  ],
  onto_bill_main: [
    { id: 'e1', name: 'Bill', nameCn: '账单', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '财务领域', attrs: [
      { en: 'billId', cn: '账单ID', termId: 'term_100', termName: '账单标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'billingCycle', cn: '账期', termId: 'term_101', termName: 'billingCycle' },
      { en: 'totalFee', cn: '总费用', termId: 'term_102', termName: '账单总金额' }, { en: 'discountFee', cn: '优惠金额', termId: 'term_103', termName: '优惠减免金额' }, { en: 'realFee', cn: '实收金额', termId: 'term_104', termName: '应收金额' },
      { en: 'dueDate', cn: '缴费截止日', termId: 'term_105', termName: '账单到期日' }
    ]},
    { id: 'e2', name: 'BillDetail', nameCn: '账单明细', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '财务领域', attrs: [
      { en: 'detailId', cn: '明细ID', termId: 'term_106', termName: '账单明细ID' }, { en: 'billId', cn: '账单ID', termId: 'term_100', termName: '账单标识' }, { en: 'itemType', cn: '费项类型', termId: 'term_107', termName: '费用项目类型' },
      { en: 'itemName', cn: '费项名称', termId: 'term_108', termName: '费用项目名称' }, { en: 'fee', cn: '费用', termId: 'term_109', termName: '计费金额' }, { en: 'unit', cn: '单位', termId: 'term_110', termName: '计量单位' }
    ]},
    { id: 'e3', name: 'BillSummary', nameCn: '账单汇总', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '财务领域', attrs: [
      { en: 'cycleId', cn: '账期ID', termId: 'term_111', termName: '账期标识' }, { en: 'cycleStart', cn: '开始日期', termId: 'term_112', termName: '账期开始日期' }, { en: 'cycleEnd', cn: '结束日期', termId: 'term_113', termName: '账期结束日期' },
      { en: 'totalBills', cn: '账单总数', termId: 'term_114', termName: '账期账单总数' }, { en: 'totalAmount', cn: '总金额', termId: 'term_115', termName: '账期总金额' }
    ]}
  ],
  onto_comp_ticket: [
    { id: 'e1', name: 'Complaint', nameCn: '投诉工单', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '交付领域', attrs: [
      { en: 'complaintId', cn: '工单ID', termId: 'term_120', termName: '投诉单标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'typeCode', cn: '投诉类型', termId: 'term_121', termName: '投诉类别' },
      { en: 'content', cn: '投诉内容', termId: 'term_122', termName: '投诉描述' }, { en: 'submitTime', cn: '提交时间', termId: 'term_123', termName: '投诉提交时间' }, { en: 'priority', cn: '优先级', termId: 'term_124', termName: '工单优先级' }
    ]},
    { id: 'e2', name: 'WorkOrder', nameCn: '处理工单', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '交付领域', attrs: [
      { en: 'orderId', cn: '工单ID', termId: 'term_125', termName: '处理工单ID' }, { en: 'complaintId', cn: '投诉ID', termId: 'term_120', termName: '投诉单标识' }, { en: 'handlerId', cn: '处理人', termId: 'term_126', termName: '处理人员' },
      { en: 'assignTime', cn: '分配时间', termId: 'term_127', termName: '任务分配时间' }, { en: 'resolveTime', cn: '解决时间', termId: 'term_128', termName: '问题解决时间' }
    ]},
    { id: 'e3', name: 'EscalateRecord', nameCn: '升级记录', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '交付领域', attrs: [
      { en: 'escalateId', cn: '升级ID', termId: 'term_129', termName: '升级记录ID' }, { en: 'complaintId', cn: '投诉ID', termId: 'term_120', termName: '投诉单标识' }, { en: 'fromLevel', cn: '原级别', termId: 'term_130', termName: '原处理级别' },
      { en: 'toLevel', cn: '升级后级别', termId: 'term_131', termName: '目标处理级别' }, { en: 'escalateTime', cn: '升级时间', termId: 'term_132', termName: '升级时间' }, { en: 'reason', cn: '升级原因', termId: 'term_133', termName: '升级原因描述' }
    ]}
  ],
  // 活动实体树叶节点示例数据
  act_sales_act: [
    { id: 'e1', name: 'SalesOpportunity', nameCn: '销售机会', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '销售领域', attrs: [
      { en: 'oppId', cn: '机会ID', termId: 'term_200', termName: '销售机会标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'oppName', cn: '机会名称', termId: 'term_201', termName: '销售机会名称' },
      { en: 'stage', cn: '阶段', termId: 'term_202', termName: '销售阶段' }, { en: 'expectedAmount', cn: '预期金额', termId: 'term_203', termName: '预期成交金额' }, { en: 'closeDate', cn: '预计成交日', termId: 'term_204', termName: '预计成交日期' }
    ]},
    { id: 'e2', name: 'SalesActivity', nameCn: '销售活动', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '销售领域', attrs: [
      { en: 'actId', cn: '活动ID', termId: 'term_205', termName: '销售活动标识' }, { en: 'oppId', cn: '机会ID', termId: 'term_200', termName: '销售机会标识' }, { en: 'actType', cn: '活动类型', termId: 'term_206', termName: '销售活动类型' },
      { en: 'actTime', cn: '活动时间', termId: 'term_207', termName: '活动发生时间' }, { en: 'result', cn: '结果', termId: 'term_208', termName: '活动结果' }
    ]},
    { id: 'e3', name: 'SalesContract', nameCn: '销售合同', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '销售领域', attrs: [
      { en: 'contractId', cn: '合同ID', termId: 'term_209', termName: '合同标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'amount', cn: '合同金额', termId: 'term_210', termName: '合同签署金额' },
      { en: 'signDate', cn: '签署日期', termId: 'term_211', termName: '合同签署日期' }, { en: 'status', cn: '合同状态', termId: 'term_212', termName: '合同状态' }
    ]}
  ],
  act_sales_ana: [
    { id: 'e1', name: 'SalesFunnel', nameCn: '销售漏斗', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '销售领域', attrs: [
      { en: 'funnelId', cn: '漏斗ID', termId: 'term_220', termName: '漏斗分析标识' }, { en: 'stage', cn: '阶段', termId: 'term_202', termName: '销售阶段' }, { en: 'totalCount', cn: '总数', termId: 'term_221', termName: '阶段总数量' },
      { en: 'convertRate', cn: '转化率', termId: 'term_222', termName: '阶段转化率' }, { en: 'cycleDate', cn: '统计周期', termId: 'term_223', termName: '统计周期' }
    ]}
  ],
  act_mkt_act: [
    { id: 'e1', name: 'MarketCampaign', nameCn: '营销活动', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '市场营销', attrs: [
      { en: 'campaignId', cn: '活动ID', termId: 'term_230', termName: '营销活动标识' }, { en: 'campaignName', cn: '活动名称', termId: 'term_231', termName: '营销活动名称' }, { en: 'channel', cn: '投放渠道', termId: 'term_232', termName: '营销投放渠道' },
      { en: 'budget', cn: '预算', termId: 'term_233', termName: '活动预算金额' }, { en: 'startDate', cn: '开始日期', termId: 'term_234', termName: '活动开始日期' }, { en: 'endDate', cn: '结束日期', termId: 'term_235', termName: '活动结束日期' }
    ]},
    { id: 'e2', name: 'CampaignTarget', nameCn: '活动目标', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '市场营销', attrs: [
      { en: 'targetId', cn: '目标ID', termId: 'term_236', termName: '活动目标标识' }, { en: 'campaignId', cn: '活动ID', termId: 'term_230', termName: '营销活动标识' }, { en: 'targetType', cn: '目标类型', termId: 'term_237', termName: '目标类型' },
      { en: 'targetValue', cn: '目标值', termId: 'term_238', termName: '目标指标值' }
    ]},
    { id: 'e3', name: 'CampaignResult', nameCn: '活动结果', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '市场营销', attrs: [
      { en: 'resultId', cn: '结果ID', termId: 'term_239', termName: '活动结果标识' }, { en: 'campaignId', cn: '活动ID', termId: 'term_230', termName: '营销活动标识' }, { en: 'reach', cn: '触达量', termId: 'term_240', termName: '用户触达量' },
      { en: 'clicks', cn: '点击量', termId: 'term_241', termName: '点击次数' }, { en: 'conversions', cn: '转化量', termId: 'term_242', termName: '转化数量' }
    ]}
  ],
  act_mkt_ana: [
    { id: 'e1', name: 'MarketAnalysis', nameCn: '营销分析', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '市场营销', attrs: [
      { en: 'analysisId', cn: '分析ID', termId: 'term_250', termName: '营销分析标识' }, { en: 'campaignId', cn: '活动ID', termId: 'term_230', termName: '营销活动标识' }, { en: 'roi', cn: 'ROI', termId: 'term_251', termName: '投入产出比' },
      { en: 'cpa', cn: 'CPA', termId: 'term_252', termName: '单次获客成本' }, { en: 'reportDate', cn: '报告日期', termId: 'term_253', termName: '分析报告日期' }
    ]},
    { id: 'e2', name: 'AudienceInsight', nameCn: '受众洞察', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '市场营销', attrs: [
      { en: 'insightId', cn: '洞察ID', termId: 'term_254', termName: '受众洞察标识' }, { en: 'segmentName', cn: '人群分层', termId: 'term_255', termName: '受众分层名称' }, { en: 'size', cn: '人群规模', termId: 'term_256', termName: '受众规模' },
      { en: 'avgLifetimeValue', cn: '平均LTV', termId: 'term_257', termName: '平均生命周期价值' }
    ]}
  ],
  act_delivery_act: [
    { id: 'e1', name: 'DeliveryTask', nameCn: '交付任务', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '交付领域', attrs: [
      { en: 'taskId', cn: '任务ID', termId: 'term_260', termName: '交付任务标识' }, { en: 'orderId', cn: '订单ID', termId: 'term_050', termName: '订单编号' }, { en: 'taskType', cn: '任务类型', termId: 'term_261', termName: '交付任务类型' },
      { en: 'assignee', cn: '负责人', termId: 'term_262', termName: '任务负责人' }, { en: 'dueDate', cn: '截止日期', termId: 'term_263', termName: '任务截止日期' }, { en: 'status', cn: '状态', termId: 'term_264', termName: '任务状态' }
    ]},
    { id: 'e2', name: 'ServiceProvision', nameCn: '业务开通', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '交付领域', attrs: [
      { en: 'provisionId', cn: '开通ID', termId: 'term_265', termName: '业务开通标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'serviceType', cn: '业务类型', termId: 'term_266', termName: '开通业务类型' },
      { en: 'provisionTime', cn: '开通时间', termId: 'term_267', termName: '业务开通时间' }, { en: 'expireTime', cn: '到期时间', termId: 'term_065', termName: '服务到期时间' }
    ]}
  ],
  act_delivery_ana: [
    { id: 'e1', name: 'DeliveryKPI', nameCn: '交付KPI', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '交付领域', attrs: [
      { en: 'kpiId', cn: 'KPI标识', termId: 'term_270', termName: '交付KPI标识' }, { en: 'period', cn: '统计周期', termId: 'term_271', termName: '统计周期' }, { en: 'avgDeliveryDays', cn: '平均交付天数', termId: 'term_272', termName: '平均交付天数' },
      { en: 'onTimeRate', cn: '准时率', termId: 'term_273', termName: '准时交付率' }, { en: 'satisfactionScore', cn: '满意度得分', termId: 'term_274', termName: '客户满意度得分' }
    ]},
    { id: 'e2', name: 'SLAMonitor', nameCn: 'SLA监控', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '交付领域', attrs: [
      { en: 'monitorId', cn: '监控ID', termId: 'term_275', termName: 'SLA监控标识' }, { en: 'slaLevel', cn: 'SLA级别', termId: 'term_276', termName: 'SLA级别' }, { en: 'breachCount', cn: '违约次数', termId: 'term_277', termName: 'SLA违约次数' },
      { en: 'checkDate', cn: '检查日期', termId: 'term_278', termName: 'SLA检查日期' }
    ]}
  ],
  act_fin_act: [
    { id: 'e1', name: 'Bill', nameCn: '账单', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '财务领域', attrs: [
      { en: 'billId', cn: '账单ID', termId: 'term_100', termName: '账单标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'billingCycle', cn: '账期', termId: 'term_101', termName: 'billingCycle' },
      { en: 'totalFee', cn: '总费用', termId: 'term_102', termName: '账单总金额' }, { en: 'realFee', cn: '实收金额', termId: 'term_104', termName: '应收金额' }, { en: 'dueDate', cn: '缴费截止日', termId: 'term_105', termName: '账单到期日' }
    ]},
    { id: 'e2', name: 'Payment', nameCn: '缴费记录', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '财务领域', attrs: [
      { en: 'payId', cn: '支付ID', termId: 'term_059', termName: '支付交易ID' }, { en: 'billId', cn: '账单ID', termId: 'term_100', termName: '账单标识' }, { en: 'amount', cn: '支付金额', termId: 'term_060', termName: '实付金额' },
      { en: 'payTime', cn: '支付时间', termId: 'term_062', termName: '支付完成时间' }, { en: 'channel', cn: '支付渠道', termId: 'term_052', termName: '支付方式' }
    ]}
  ],
  act_fin_ana: [
    { id: 'e1', name: 'FinancialReport', nameCn: '财务报表', isNew: false, entity_concept_type: '活动实体', entity_sub_class: '领域分析实体', domain_view: '财务领域', attrs: [
      { en: 'reportId', cn: '报表ID', termId: 'term_280', termName: '财务报表标识' }, { en: 'reportType', cn: '报表类型', termId: 'term_281', termName: '财务报表类型' }, { en: 'period', cn: '统计周期', termId: 'term_271', termName: '统计周期' },
      { en: 'totalRevenue', cn: '总收入', termId: 'term_282', termName: '总营业收入' }, { en: 'totalCost', cn: '总成本', termId: 'term_283', termName: '总运营成本' }, { en: 'netProfit', cn: '净利润', termId: 'term_284', termName: '净利润' }
    ]}
  ],
  act_tool_act: [
    { id: 'e1', name: 'ToolUsage', nameCn: '工具使用记录', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '平台能力.工具能力', attrs: [
      { en: 'usageId', cn: '使用ID', termId: 'term_290', termName: '工具使用标识' }, { en: 'toolId', cn: '工具ID', termId: 'term_291', termName: '工具标识' }, { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' },
      { en: 'useTime', cn: '使用时间', termId: 'term_292', termName: '工具使用时间' }, { en: 'duration', cn: '使用时长', termId: 'term_293', termName: '使用时长(秒)' }
    ]}
  ],
  act_engine_act: [
    { id: 'e1', name: 'EngineJob', nameCn: '引擎任务', isNew: true, entity_concept_type: '活动实体', entity_sub_class: '领域活动实体', domain_view: '平台能力.引擎能力', attrs: [
      { en: 'jobId', cn: '任务ID', termId: 'term_300', termName: '引擎任务标识' }, { en: 'engineType', cn: '引擎类型', termId: 'term_301', termName: '引擎类型' }, { en: 'inputSize', cn: '输入数据量', termId: 'term_302', termName: '输入数据量(行)' },
      { en: 'outputSize', cn: '输出数据量', termId: 'term_303', termName: '输出数据量(行)' }, { en: 'startTime', cn: '开始时间', termId: 'term_304', termName: '任务开始时间' }, { en: 'endTime', cn: '结束时间', termId: 'term_305', termName: '任务结束时间' },
      { en: 'status', cn: '任务状态', termId: 'term_306', termName: '任务执行状态' }
    ]}
  ]
}

export const MAPPING_DATA: Record<string, MappingData> = {
  onto_crm_user_base: {
    fields: [
      { name: 'user_id', type: 'VARCHAR(32)' },
      { name: 'user_name', type: 'VARCHAR(64)' },
      { name: 'phone_number', type: 'VARCHAR(20)' },
      { name: 'status', type: 'INT(2)' },
      { name: 'create_time', type: 'DATETIME' },
      { name: 'email', type: 'VARCHAR(128)' }
    ],
    attrs: [
      { name: 'userId', entity: 'User' },
      { name: 'userName', entity: 'User' },
      { name: 'phoneNumber', entity: 'User' },
      { name: 'status', entity: 'User' },
      { name: 'createTime', entity: 'User' },
      { name: 'email', entity: 'User' }
    ],
    links: [
      { fieldIndex: 0, attrIndex: 0, confidence: 'high' },
      { fieldIndex: 1, attrIndex: 1, confidence: 'high' },
      { fieldIndex: 2, attrIndex: 2, confidence: 'high' },
      { fieldIndex: 3, attrIndex: 3, confidence: 'high' },
      { fieldIndex: 4, attrIndex: 4, confidence: 'mid' },
      { fieldIndex: 5, attrIndex: 5, confidence: 'mid' }
    ]
  },
  onto_order_main: {
    fields: [
      { name: 'order_id', type: 'VARCHAR(32)' },
      { name: 'user_id', type: 'VARCHAR(32)' },
      { name: 'amount', type: 'DECIMAL(10,2)' },
      { name: 'pay_status', type: 'INT(1)' },
      { name: 'finish_time', type: 'DATETIME' }
    ],
    attrs: [
      { name: 'orderId', entity: 'Order' },
      { name: 'userId', entity: 'Order' },
      { name: 'totalAmount', entity: 'Order' },
      { name: 'payStatus', entity: 'Order' },
      { name: 'createTime', entity: 'Order' }
    ],
    links: [
      { fieldIndex: 0, attrIndex: 0, confidence: 'high' },
      { fieldIndex: 1, attrIndex: 1, confidence: 'high' },
      { fieldIndex: 2, attrIndex: 2, confidence: 'high' },
      { fieldIndex: 3, attrIndex: 3, confidence: 'high' },
      { fieldIndex: 4, attrIndex: 4, confidence: 'mid' }
    ]
  },
  onto_net_bs: {
    fields: [
      { name: 'station_id', type: 'VARCHAR(32)' },
      { name: 'station_name', type: 'VARCHAR(128)' },
      { name: 'longitude', type: 'DECIMAL(10,6)' },
      { name: 'latitude', type: 'DECIMAL(10,6)' },
      { name: 'status', type: 'INT(1)' }
    ],
    attrs: [
      { name: 'stationId', entity: 'BaseStation' },
      { name: 'stationName', entity: 'BaseStation' },
      { name: 'longitude', entity: 'BaseStation' },
      { name: 'latitude', entity: 'BaseStation' },
      { name: 'status', entity: 'BaseStation' }
    ],
    links: [
      { fieldIndex: 0, attrIndex: 0, confidence: 'high' },
      { fieldIndex: 1, attrIndex: 1, confidence: 'high' },
      { fieldIndex: 2, attrIndex: 2, confidence: 'high' },
      { fieldIndex: 3, attrIndex: 3, confidence: 'high' },
      { fieldIndex: 4, attrIndex: 4, confidence: 'mid' }
    ]
  },
  onto_bill_main: {
    fields: [
      { name: 'bill_id', type: 'VARCHAR(32)' },
      { name: 'user_id', type: 'VARCHAR(32)' },
      { name: 'total_fee', type: 'DECIMAL(10,2)' },
      { name: 'discount_fee', type: 'DECIMAL(10,2)' },
      { name: 'pay_time', type: 'DATETIME' }
    ],
    attrs: [
      { name: 'billId', entity: 'Bill' },
      { name: 'userId', entity: 'Bill' },
      { name: 'totalFee', entity: 'Bill' },
      { name: 'discountFee', entity: 'Bill' },
      { name: 'payTime', entity: 'Bill' }
    ],
    links: [
      { fieldIndex: 0, attrIndex: 0, confidence: 'high' },
      { fieldIndex: 1, attrIndex: 1, confidence: 'high' },
      { fieldIndex: 2, attrIndex: 2, confidence: 'high' },
      { fieldIndex: 3, attrIndex: 3, confidence: 'mid' },
      { fieldIndex: 4, attrIndex: 4, confidence: 'mid' }
    ]
  },
  onto_comp_ticket: {
    fields: [
      { name: 'complaint_id', type: 'VARCHAR(32)' },
      { name: 'user_id', type: 'VARCHAR(32)' },
      { name: 'type_code', type: 'VARCHAR(16)' },
      { name: 'content', type: 'TEXT' },
      { name: 'handle_status', type: 'INT(1)' }
    ],
    attrs: [
      { name: 'complaintId', entity: 'Complaint' },
      { name: 'userId', entity: 'Complaint' },
      { name: 'typeCode', entity: 'Complaint' },
      { name: 'content', entity: 'Complaint' },
      { name: 'handleStatus', entity: 'WorkOrder' }
    ],
    links: [
      { fieldIndex: 0, attrIndex: 0, confidence: 'high' },
      { fieldIndex: 1, attrIndex: 1, confidence: 'high' },
      { fieldIndex: 2, attrIndex: 2, confidence: 'high' },
      { fieldIndex: 3, attrIndex: 3, confidence: 'mid' },
      { fieldIndex: 4, attrIndex: 4, confidence: 'mid' }
    ]
  }
}

export const ENTITY_COLORS = ['#165DFF', '#722ED1', '#14C9C9', '#FA8C16', '#00B42A', '#F53F3F', '#EB2F96', '#52C41A']

// 生成默认映射
export function getDefaultMapping(_ontoId: string): MappingData {
  return {
    fields: [
      { name: 'id', type: 'VARCHAR(32)' },
      { name: 'name', type: 'VARCHAR(128)' },
      { name: 'status', type: 'INT(1)' },
      { name: 'create_time', type: 'DATETIME' },
      { name: 'update_time', type: 'DATETIME' }
    ],
    attrs: [
      { name: 'id', entity: 'Entity' },
      { name: 'name', entity: 'Entity' },
      { name: 'status', entity: 'Entity' },
      { name: 'createTime', entity: 'Entity' },
      { name: 'updateTime', entity: 'Entity' }
    ],
    links: [
      { fieldIndex: 0, attrIndex: 0, confidence: 'high' },
      { fieldIndex: 1, attrIndex: 1, confidence: 'high' },
      { fieldIndex: 2, attrIndex: 2, confidence: 'mid' },
      { fieldIndex: 3, attrIndex: 3, confidence: 'mid' },
      { fieldIndex: 4, attrIndex: 4, confidence: 'low' }
    ]
  }
}

// 生成默认实体
export function generateDefaultEntities(_ontoId: string): Entity[] {
  return [
    { id: 'e1', name: 'Entity', nameCn: '实体', isNew: true, attrs: [
      { en: 'id', cn: '主键ID' }, { en: 'name', cn: '名称' }, { en: 'status', cn: '状态' }, { en: 'createTime', cn: '创建时间' }
    ]},
    { id: 'e2', name: 'SubEntity', nameCn: '子实体', isNew: false, attrs: [
      { en: 'subId', cn: '子ID' }, { en: 'parentId', cn: '父ID' }, { en: 'value', cn: '值' }, { en: 'updateTime', cn: '更新时间' }
    ]}
  ]
}
