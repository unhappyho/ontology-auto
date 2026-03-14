import type { OntologyL1, Entity, MappingData } from '@/types'

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
          { id: 'onto_crm_user_base', label: '基本信息实体组', color: '#165DFF', total: 5, newCnt: 3, existCnt: 2 },
          { id: 'onto_crm_user_profile', label: '画像标签实体组', color: '#4080FF', total: 4, newCnt: 2, existCnt: 2 },
          { id: 'onto_crm_user_device', label: '设备绑定实体组', color: '#6AA3FF', total: 3, newCnt: 3, existCnt: 0 }
        ]
      },
      {
        id: 'l2_crm_contract',
        label: '合同服务子域',
        color: '#0A3D91',
        icon: 'FileTextOutlined',
        children: [
          { id: 'onto_crm_contract_main', label: '合同主体实体组', color: '#0A3D91', total: 4, newCnt: 2, existCnt: 2 },
          { id: 'onto_crm_contract_sla', label: 'SLA 协议实体组', color: '#1A5CB5', total: 3, newCnt: 1, existCnt: 2 }
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
          { id: 'onto_order_main', label: '订单主实体组', color: '#722ED1', total: 5, newCnt: 3, existCnt: 2 },
          { id: 'onto_order_payment', label: '支付记录实体组', color: '#9B59B6', total: 4, newCnt: 2, existCnt: 2 }
        ]
      },
      {
        id: 'l2_order_promo',
        label: '促销优惠子域',
        color: '#531DAB',
        icon: 'TagOutlined',
        children: [
          { id: 'onto_order_coupon', label: '优惠券实体组', color: '#531DAB', total: 3, newCnt: 2, existCnt: 1 },
          { id: 'onto_order_activity', label: '营销活动实体组', color: '#6B21A8', total: 3, newCnt: 3, existCnt: 0 },
          { id: 'onto_order_refund', label: '退款退货实体组', color: '#7C3AED', total: 2, newCnt: 0, existCnt: 2 }
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
          { id: 'onto_product_main', label: '产品主实体组', color: '#14C9C9', total: 3, newCnt: 1, existCnt: 2 },
          { id: 'onto_product_spec', label: '规格参数实体组', color: '#0ABAD8', total: 3, newCnt: 2, existCnt: 1 },
          { id: 'onto_product_price', label: '定价策略实体组', color: '#06B6D4', total: 2, newCnt: 1, existCnt: 1 }
        ]
      },
      {
        id: 'l2_product_resource',
        label: '资源配置子域',
        color: '#0E7490',
        icon: 'ControlOutlined',
        children: [
          { id: 'onto_product_pkg', label: '套餐实体组', color: '#0E7490', total: 4, newCnt: 2, existCnt: 2 },
          { id: 'onto_product_flow', label: '流量资源实体组', color: '#155E75', total: 3, newCnt: 3, existCnt: 0 }
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
          { id: 'onto_net_bs', label: '基站实体组', color: '#FA8C16', total: 3, newCnt: 2, existCnt: 1 },
          { id: 'onto_net_cell', label: '小区实体组', color: '#F59E0B', total: 3, newCnt: 2, existCnt: 1 },
          { id: 'onto_net_freq', label: '频段资源实体组', color: '#D97706', total: 2, newCnt: 2, existCnt: 0 }
        ]
      },
      {
        id: 'l2_net_core',
        label: '核心网子域',
        color: '#B45309',
        icon: 'CloudServerOutlined',
        children: [
          { id: 'onto_net_node', label: '网元实体组', color: '#B45309', total: 4, newCnt: 3, existCnt: 1 },
          { id: 'onto_net_slice', label: '网络切片实体组', color: '#92400E', total: 3, newCnt: 3, existCnt: 0 },
          { id: 'onto_net_region', label: '地理区域实体组', color: '#78350F', total: 3, newCnt: 1, existCnt: 2 }
        ]
      },
      {
        id: 'l2_net_equip',
        label: '设备资产子域',
        color: '#C2410C',
        icon: 'ConsoleSqlOutlined',
        children: [
          { id: 'onto_net_hw', label: '硬件设备实体组', color: '#C2410C', total: 4, newCnt: 3, existCnt: 1 },
          { id: 'onto_net_port', label: '端口接口实体组', color: '#9A3412', total: 3, newCnt: 1, existCnt: 2 }
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
          { id: 'onto_bill_main', label: '账单主实体组', color: '#00B42A', total: 4, newCnt: 2, existCnt: 2 },
          { id: 'onto_bill_detail', label: '账单明细实体组', color: '#16A34A', total: 3, newCnt: 1, existCnt: 2 }
        ]
      },
      {
        id: 'l2_billing_pay',
        label: '缴费发票子域',
        color: '#15803D',
        icon: 'ReceiptOutlined',
        children: [
          { id: 'onto_bill_pay', label: '缴费记录实体组', color: '#15803D', total: 3, newCnt: 1, existCnt: 2 },
          { id: 'onto_bill_invoice', label: '发票实体组', color: '#166534', total: 2, newCnt: 0, existCnt: 2 }
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
          { id: 'onto_comp_ticket', label: '投诉工单实体组', color: '#F53F3F', total: 3, newCnt: 3, existCnt: 0 },
          { id: 'onto_comp_order', label: '处理流程实体组', color: '#EF4444', total: 3, newCnt: 2, existCnt: 1 }
        ]
      },
      {
        id: 'l2_complaint_quality',
        label: '质检回访子域',
        color: '#B91C1C',
        icon: 'StarOutlined',
        children: [
          { id: 'onto_comp_survey', label: '满意度调查实体组', color: '#B91C1C', total: 2, newCnt: 2, existCnt: 0 },
          { id: 'onto_comp_qa', label: '质检记录实体组', color: '#991B1B', total: 2, newCnt: 1, existCnt: 1 }
        ]
      }
    ]
  }
]

export const ENTITY_DATA: Record<string, Entity[]> = {
  onto_crm_user_base: [
    { id: 'e1', name: 'User', nameCn: '用户', isNew: true, attrs: [
      { en: 'userId', cn: '用户ID', termId: 'term_001', termName: '标准用户ID' }, { en: 'userName', cn: '用户姓名' }, { en: 'phoneNumber', cn: '手机号码', termId: 'term_002', termName: '联系电话' },
      { en: 'email', cn: '邮箱' }, { en: 'status', cn: '账户状态' }, { en: 'createTime', cn: '注册时间' }
    ]},
    { id: 'e2', name: 'UserAuth', nameCn: '认证信息', isNew: true, attrs: [
      { en: 'authId', cn: '认证ID' }, { en: 'userId', cn: '用户ID' }, { en: 'idType', cn: '证件类型' },
      { en: 'idNo', cn: '证件号码', termId: 'term_003', termName: '身份证号' }, { en: 'authStatus', cn: '实名状态' }
    ]},
    { id: 'e3', name: 'UserContact', nameCn: '联系方式', isNew: true, attrs: [
      { en: 'contactId', cn: '联系ID' }, { en: 'userId', cn: '用户ID' }, { en: 'contactType', cn: '联系类型' },
      { en: 'contactValue', cn: '联系内容' }, { en: 'isPrimary', cn: '是否主要' }
    ]},
    { id: 'e4', name: 'UserAddress', nameCn: '用户地址', isNew: false, attrs: [
      { en: 'addressId', cn: '地址ID', isNew: false }, { en: 'userId', cn: '用户ID', isNew: false }, { en: 'province', cn: '省份', termId: 'term_004', termName: '行政区划', isNew: true },
      { en: 'city', cn: '城市', isNew: true }, { en: 'district', cn: '区县', isNew: true }, { en: 'detailAddr', cn: '详细地址', isNew: false }
    ]},
    { id: 'e5', name: 'UserAccount', nameCn: '账户信息', isNew: false, attrs: [
      { en: 'accountId', cn: '账户ID', isNew: false }, { en: 'userId', cn: '用户ID', isNew: false }, { en: 'balance', cn: '账户余额' },
      { en: 'freezeAmount', cn: '冻结金额', isNew: true }, { en: 'updateTime', cn: '更新时间', isNew: false }
    ]}
  ],
  onto_crm_user_profile: [
    { id: 'e1', name: 'UserProfile', nameCn: '用户画像', isNew: true, attrs: [
      { en: 'profileId', cn: '画像ID' }, { en: 'userId', cn: '用户ID' }, { en: 'ageGroup', cn: '年龄段' },
      { en: 'gender', cn: '性别' }, { en: 'creditScore', cn: '信用评分' }
    ]},
    { id: 'e2', name: 'UserTag', nameCn: '用户标签', isNew: true, attrs: [
      { en: 'tagId', cn: '标签ID' }, { en: 'userId', cn: '用户ID' }, { en: 'tagType', cn: '标签类型' },
      { en: 'tagValue', cn: '标签值' }, { en: 'tagSource', cn: '标签来源' }
    ]},
    { id: 'e3', name: 'UserSegment', nameCn: '用户分群', isNew: false, attrs: [
      { en: 'segId', cn: '分群ID' }, { en: 'segName', cn: '分群名称' }, { en: 'segRule', cn: '分群规则' },
      { en: 'memberCnt', cn: '成员数量' }
    ]},
    { id: 'e4', name: 'VipLevel', nameCn: 'VIP等级', isNew: false, attrs: [
      { en: 'levelId', cn: '等级ID' }, { en: 'levelName', cn: '等级名称' }, { en: 'pointThreshold', cn: '积分门槛' },
      { en: 'privilege', cn: '特权描述' }
    ]}
  ],
  onto_order_main: [
    { id: 'e1', name: 'Order', nameCn: '订单', isNew: true, attrs: [
      { en: 'orderId', cn: '订单ID' }, { en: 'userId', cn: '用户ID' }, { en: 'totalAmount', cn: '订单总额' },
      { en: 'payChannel', cn: '支付渠道' }, { en: 'orderStatus', cn: '订单状态' }, { en: 'createTime', cn: '创建时间' }
    ]},
    { id: 'e2', name: 'OrderItem', nameCn: '订单明细', isNew: true, attrs: [
      { en: 'itemId', cn: '明细ID' }, { en: 'orderId', cn: '订单ID' }, { en: 'productId', cn: '产品ID' },
      { en: 'qty', cn: '数量' }, { en: 'unitPrice', cn: '单价' }, { en: 'subtotal', cn: '小计' }
    ]},
    { id: 'e3', name: 'Payment', nameCn: '支付记录', isNew: true, attrs: [
      { en: 'payId', cn: '支付ID' }, { en: 'orderId', cn: '订单ID' }, { en: 'amount', cn: '支付金额' },
      { en: 'transNo', cn: '交易流水号' }, { en: 'payTime', cn: '支付时间' }
    ]},
    { id: 'e4', name: 'Delivery', nameCn: '派发记录', isNew: false, attrs: [
      { en: 'deliverId', cn: '派发ID' }, { en: 'orderId', cn: '订单ID' }, { en: 'activateTime', cn: '激活时间' },
      { en: 'expireTime', cn: '到期时间' }, { en: 'deliverStatus', cn: '派发状态' }
    ]},
    { id: 'e5', name: 'OrderLog', nameCn: '订单日志', isNew: false, attrs: [
      { en: 'logId', cn: '日志ID' }, { en: 'orderId', cn: '订单ID' }, { en: 'opType', cn: '操作类型' },
      { en: 'opTime', cn: '操作时间' }, { en: 'opUser', cn: '操作人' }
    ]}
  ],
  onto_net_bs: [
    { id: 'e1', name: 'BaseStation', nameCn: '基站', isNew: true, attrs: [
      { en: 'stationId', cn: '基站ID' }, { en: 'stationName', cn: '基站名称' }, { en: 'stationType', cn: '基站类型' },
      { en: 'longitude', cn: '经度' }, { en: 'latitude', cn: '纬度' }, { en: 'coverageRadius', cn: '覆盖半径' },
      { en: 'status', cn: '运行状态' }
    ]},
    { id: 'e2', name: 'Cell', nameCn: '小区', isNew: true, attrs: [
      { en: 'cellId', cn: '小区ID' }, { en: 'stationId', cn: '基站ID' }, { en: 'cellName', cn: '小区名称' },
      { en: 'frequency', cn: '频率' }, { en: 'bandwidth', cn: '带宽' }, { en: 'azimuth', cn: '方位角' }
    ]},
    { id: 'e3', name: 'Region', nameCn: '区域', isNew: false, attrs: [
      { en: 'regionId', cn: '区域ID' }, { en: 'regionName', cn: '区域名称' }, { en: 'parentId', cn: '上级区域ID' },
      { en: 'level', cn: '层级' }, { en: 'areaCode', cn: '行政区划码' }
    ]}
  ],
  onto_bill_main: [
    { id: 'e1', name: 'Bill', nameCn: '账单', isNew: true, attrs: [
      { en: 'billId', cn: '账单ID' }, { en: 'userId', cn: '用户ID' }, { en: 'billingCycle', cn: '账期' },
      { en: 'totalFee', cn: '总费用' }, { en: 'discountFee', cn: '优惠金额' }, { en: 'realFee', cn: '实收金额' },
      { en: 'dueDate', cn: '缴费截止日' }
    ]},
    { id: 'e2', name: 'BillDetail', nameCn: '账单明细', isNew: true, attrs: [
      { en: 'detailId', cn: '明细ID' }, { en: 'billId', cn: '账单ID' }, { en: 'itemType', cn: '费项类型' },
      { en: 'itemName', cn: '费项名称' }, { en: 'fee', cn: '费用' }, { en: 'unit', cn: '单位' }
    ]},
    { id: 'e3', name: 'BillCycle', nameCn: '账期', isNew: false, attrs: [
      { en: 'cycleId', cn: '账期ID' }, { en: 'cycleStart', cn: '开始日期' }, { en: 'cycleEnd', cn: '结束日期' },
      { en: 'status', cn: '账期状态' }
    ]},
    { id: 'e4', name: 'FeeItem', nameCn: '费项', isNew: false, attrs: [
      { en: 'feeItemId', cn: '费项ID' }, { en: 'feeItemName', cn: '费项名称' }, { en: 'feeType', cn: '费项类型' },
      { en: 'unitPrice', cn: '单价' }, { en: 'unit', cn: '计量单位' }
    ]}
  ],
  onto_comp_ticket: [
    { id: 'e1', name: 'Complaint', nameCn: '投诉工单', isNew: true, attrs: [
      { en: 'complaintId', cn: '工单ID' }, { en: 'userId', cn: '用户ID' }, { en: 'typeCode', cn: '投诉类型' },
      { en: 'content', cn: '投诉内容' }, { en: 'submitTime', cn: '提交时间' }, { en: 'priority', cn: '优先级' }
    ]},
    { id: 'e2', name: 'WorkOrder', nameCn: '处理工单', isNew: true, attrs: [
      { en: 'orderId', cn: '工单ID' }, { en: 'complaintId', cn: '投诉ID' }, { en: 'handlerId', cn: '处理人' },
      { en: 'assignTime', cn: '分配时间' }, { en: 'resolveTime', cn: '解决时间' }
    ]},
    { id: 'e3', name: 'EscalateRecord', nameCn: '升级记录', isNew: true, attrs: [
      { en: 'escalateId', cn: '升级ID' }, { en: 'complaintId', cn: '投诉ID' }, { en: 'fromLevel', cn: '原级别' },
      { en: 'toLevel', cn: '升级后级别' }, { en: 'escalateTime', cn: '升级时间' }, { en: 'reason', cn: '升级原因' }
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
