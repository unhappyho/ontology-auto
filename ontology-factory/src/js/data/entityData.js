// ============================================================
// 实体数据
// ============================================================

export const ENTITY_DATA = {
    onto_crm_user_base:[
        {id:'e1',name:'User',nameCn:'用户',isNew:true,attrs:[{en:'userId',cn:'用户ID'},{en:'userName',cn:'用户姓名'},{en:'phoneNumber',cn:'手机号码'},{en:'email',cn:'邮箱'},{en:'status',cn:'账户状态'},{en:'createTime',cn:'注册时间'}]},
        {id:'e2',name:'UserAuth',nameCn:'认证信息',isNew:true,attrs:[{en:'authId',cn:'认证ID'},{en:'userId',cn:'用户ID'},{en:'idType',cn:'证件类型'},{en:'idNo',cn:'证件号码'},{en:'authStatus',cn:'实名状态'}]},
        {id:'e3',name:'UserContact',nameCn:'联系方式',isNew:true,attrs:[{en:'contactId',cn:'联系ID'},{en:'userId',cn:'用户ID'},{en:'contactType',cn:'联系类型'},{en:'contactValue',cn:'联系内容'},{en:'isPrimary',cn:'是否主要'}]},
        {id:'e4',name:'UserAddress',nameCn:'用户地址',isNew:false,attrs:[{en:'addressId',cn:'地址ID'},{en:'userId',cn:'用户ID'},{en:'province',cn:'省份'},{en:'city',cn:'城市'},{en:'district',cn:'区县'},{en:'detailAddr',cn:'详细地址'}]},
        {id:'e5',name:'UserAccount',nameCn:'账户信息',isNew:false,attrs:[{en:'accountId',cn:'账户ID'},{en:'userId',cn:'用户ID'},{en:'balance',cn:'账户余额'},{en:'freezeAmount',cn:'冻结金额'},{en:'updateTime',cn:'更新时间'}]}
    ],
    onto_crm_user_profile:[
        {id:'e1',name:'UserProfile',nameCn:'用户画像',isNew:true,attrs:[{en:'profileId',cn:'画像ID'},{en:'userId',cn:'用户ID'},{en:'ageGroup',cn:'年龄段'},{en:'gender',cn:'性别'},{en:'creditScore',cn:'信用评分'}]},
        {id:'e2',name:'UserTag',nameCn:'用户标签',isNew:true,attrs:[{en:'tagId',cn:'标签ID'},{en:'userId',cn:'用户ID'},{en:'tagType',cn:'标签类型'},{en:'tagValue',cn:'标签值'},{en:'tagSource',cn:'标签来源'}]},
        {id:'e3',name:'UserSegment',nameCn:'用户分群',isNew:false,attrs:[{en:'segId',cn:'分群ID'},{en:'segName',cn:'分群名称'},{en:'segRule',cn:'分群规则'},{en:'memberCnt',cn:'成员数量'}]},
        {id:'e4',name:'VipLevel',nameCn:'VIP等级',isNew:false,attrs:[{en:'levelId',cn:'等级ID'},{en:'levelName',cn:'等级名称'},{en:'pointThreshold',cn:'积分门槛'},{en:'privilege',cn:'特权描述'}]}
    ],
    onto_order_main:[
        {id:'e1',name:'Order',nameCn:'订单',isNew:true,attrs:[{en:'orderId',cn:'订单ID'},{en:'userId',cn:'用户ID'},{en:'totalAmount',cn:'订单总额'},{en:'payChannel',cn:'支付渠道'},{en:'orderStatus',cn:'订单状态'},{en:'createTime',cn:'创建时间'}]},
        {id:'e2',name:'OrderItem',nameCn:'订单明细',isNew:true,attrs:[{en:'itemId',cn:'明细ID'},{en:'orderId',cn:'订单ID'},{en:'productId',cn:'产品ID'},{en:'qty',cn:'数量'},{en:'unitPrice',cn:'单价'},{en:'subtotal',cn:'小计'}]},
        {id:'e3',name:'Payment',nameCn:'支付记录',isNew:true,attrs:[{en:'payId',cn:'支付ID'},{en:'orderId',cn:'订单ID'},{en:'amount',cn:'支付金额'},{en:'transNo',cn:'交易流水号'},{en:'payTime',cn:'支付时间'}]},
        {id:'e4',name:'Delivery',nameCn:'派发记录',isNew:false,attrs:[{en:'deliverId',cn:'派发ID'},{en:'orderId',cn:'订单ID'},{en:'activateTime',cn:'激活时间'},{en:'expireTime',cn:'到期时间'},{en:'deliverStatus',cn:'派发状态'}]},
        {id:'e5',name:'OrderLog',nameCn:'订单日志',isNew:false,attrs:[{en:'logId',cn:'日志ID'},{en:'orderId',cn:'订单ID'},{en:'opType',cn:'操作类型'},{en:'opTime',cn:'操作时间'},{en:'opUser',cn:'操作人'}]}
    ],
    onto_net_bs:[
        {id:'e1',name:'BaseStation',nameCn:'基站',isNew:true,attrs:[{en:'stationId',cn:'基站ID'},{en:'stationName',cn:'基站名称'},{en:'stationType',cn:'基站类型'},{en:'longitude',cn:'经度'},{en:'latitude',cn:'纬度'},{en:'coverageRadius',cn:'覆盖半径'},{en:'status',cn:'运行状态'}]},
        {id:'e2',name:'Cell',nameCn:'小区',isNew:true,attrs:[{en:'cellId',cn:'小区ID'},{en:'stationId',cn:'基站ID'},{en:'cellName',cn:'小区名称'},{en:'frequency',cn:'频率'},{en:'bandwidth',cn:'带宽'},{en:'azimuth',cn:'方位角'}]},
        {id:'e3',name:'Region',nameCn:'区域',isNew:false,attrs:[{en:'regionId',cn:'区域ID'},{en:'regionName',cn:'区域名称'},{en:'parentId',cn:'上级区域ID'},{en:'level',cn:'层级'},{en:'areaCode',cn:'行政区划码'}]}
    ],
    onto_bill_main:[
        {id:'e1',name:'Bill',nameCn:'账单',isNew:true,attrs:[{en:'billId',cn:'账单ID'},{en:'userId',cn:'用户ID'},{en:'billingCycle',cn:'账期'},{en:'totalFee',cn:'总费用'},{en:'discountFee',cn:'优惠金额'},{en:'realFee',cn:'实收金额'},{en:'dueDate',cn:'缴费截止日'}]},
        {id:'e2',name:'BillDetail',nameCn:'账单明细',isNew:true,attrs:[{en:'detailId',cn:'明细ID'},{en:'billId',cn:'账单ID'},{en:'itemType',cn:'费项类型'},{en:'itemName',cn:'费项名称'},{en:'fee',cn:'费用'},{en:'unit',cn:'单位'}]},
        {id:'e3',name:'BillCycle',nameCn:'账期',isNew:false,attrs:[{en:'cycleId',cn:'账期ID'},{en:'cycleStart',cn:'开始日期'},{en:'cycleEnd',cn:'结束日期'},{en:'status',cn:'账期状态'}]},
        {id:'e4',name:'FeeItem',nameCn:'费项',isNew:false,attrs:[{en:'feeItemId',cn:'费项ID'},{en:'feeItemName',cn:'费项名称'},{en:'feeType',cn:'费项类型'},{en:'unitPrice',cn:'单价'},{en:'unit',cn:'计量单位'}]}
    ],
    onto_comp_ticket:[
        {id:'e1',name:'Complaint',nameCn:'投诉工单',isNew:true,attrs:[{en:'complaintId',cn:'工单ID'},{en:'userId',cn:'用户ID'},{en:'typeCode',cn:'投诉类型'},{en:'content',cn:'投诉内容'},{en:'submitTime',cn:'提交时间'},{en:'priority',cn:'优先级'}]},
        {id:'e2',name:'WorkOrder',nameCn:'处理工单',isNew:true,attrs:[{en:'orderId',cn:'工单ID'},{en:'complaintId',cn:'投诉ID'},{en:'handlerId',cn:'处理人'},{en:'assignTime',cn:'分配时间'},{en:'resolveTime',cn:'解决时间'}]},
        {id:'e3',name:'EscalateRecord',nameCn:'升级记录',isNew:true,attrs:[{en:'escalateId',cn:'升级ID'},{en:'complaintId',cn:'投诉ID'},{en:'fromLevel',cn:'原级别'},{en:'toLevel',cn:'升级后级别'},{en:'escalateTime',cn:'升级时间'},{en:'reason',cn:'升级原因'}]}
    ]
};

// 生成默认实体数据
export function generateDefaultEntities(ontoId) {
    return [
        {id:'e1',name:'Entity',nameCn:'实体',isNew:true,attrs:[{en:'id',cn:'主键ID'},{en:'name',cn:'名称'},{en:'status',cn:'状态'},{en:'createTime',cn:'创建时间'}]},
        {id:'e2',name:'SubEntity',nameCn:'子实体',isNew:false,attrs:[{en:'subId',cn:'子ID'},{en:'parentId',cn:'父ID'},{en:'value',cn:'值'},{en:'updateTime',cn:'更新时间'}]}
    ];
}
