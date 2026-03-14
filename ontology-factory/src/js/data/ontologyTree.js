// ============================================================
// 本体目录树结构数据
// L1: 大域  ->  L2: 子域/子目录  ->  L3(leaf): 实体组/实体集
// ============================================================

export const ONTOLOGY_TREE = [
    {
        id:'l1_crm', label:'CRM 客户管理域', color:'#165DFF', icon:'fa-building-user',
        children:[
            {
                id:'l2_crm_user', label:'用户信息子域', color:'#165DFF', icon:'fa-users',
                children:[
                    { id:'onto_crm_user_base',    label:'基本信息实体组', color:'#165DFF', total:5,  newCnt:3, existCnt:2 },
                    { id:'onto_crm_user_profile', label:'画像标签实体组', color:'#4080FF', total:4,  newCnt:2, existCnt:2 },
                    { id:'onto_crm_user_device',  label:'设备绑定实体组', color:'#6AA3FF', total:3,  newCnt:3, existCnt:0 },
                ]
            },
            {
                id:'l2_crm_contract', label:'合同服务子域', color:'#0A3D91', icon:'fa-file-contract',
                children:[
                    { id:'onto_crm_contract_main', label:'合同主体实体组', color:'#0A3D91', total:4, newCnt:2, existCnt:2 },
                    { id:'onto_crm_contract_sla',  label:'SLA 协议实体组', color:'#1A5CB5', total:3, newCnt:1, existCnt:2 },
                ]
            }
        ]
    },
    {
        id:'l1_order', label:'订单交易域', color:'#722ED1', icon:'fa-cart-shopping',
        children:[
            {
                id:'l2_order_main', label:'主交易子域', color:'#722ED1', icon:'fa-receipt',
                children:[
                    { id:'onto_order_main',    label:'订单主实体组', color:'#722ED1', total:5, newCnt:3, existCnt:2 },
                    { id:'onto_order_payment', label:'支付记录实体组', color:'#9B59B6', total:4, newCnt:2, existCnt:2 },
                ]
            },
            {
                id:'l2_order_promo', label:'促销优惠子域', color:'#531DAB', icon:'fa-tag',
                children:[
                    { id:'onto_order_coupon',   label:'优惠券实体组',   color:'#531DAB', total:3, newCnt:2, existCnt:1 },
                    { id:'onto_order_activity', label:'营销活动实体组', color:'#6B21A8', total:3, newCnt:3, existCnt:0 },
                    { id:'onto_order_refund',   label:'退款退货实体组', color:'#7C3AED', total:2, newCnt:0, existCnt:2 },
                ]
            }
        ]
    },
    {
        id:'l1_product', label:'产品目录域', color:'#14C9C9', icon:'fa-boxes-stacked',
        children:[
            {
                id:'l2_product_catalog', label:'产品分类子域', color:'#14C9C9', icon:'fa-list-tree',
                children:[
                    { id:'onto_product_main',  label:'产品主实体组',   color:'#14C9C9', total:3, newCnt:1, existCnt:2 },
                    { id:'onto_product_spec',  label:'规格参数实体组', color:'#0ABAD8', total:3, newCnt:2, existCnt:1 },
                    { id:'onto_product_price', label:'定价策略实体组', color:'#06B6D4', total:2, newCnt:1, existCnt:1 },
                ]
            },
            {
                id:'l2_product_resource', label:'资源配置子域', color:'#0E7490', icon:'fa-sliders',
                children:[
                    { id:'onto_product_pkg',  label:'套餐实体组',     color:'#0E7490', total:4, newCnt:2, existCnt:2 },
                    { id:'onto_product_flow', label:'流量资源实体组', color:'#155E75', total:3, newCnt:3, existCnt:0 },
                ]
            }
        ]
    },
    {
        id:'l1_network', label:'网络基础设施域', color:'#FA8C16', icon:'fa-tower-cell',
        children:[
            {
                id:'l2_net_station', label:'基站无线子域', color:'#FA8C16', icon:'fa-broadcast-tower',
                children:[
                    { id:'onto_net_bs',   label:'基站实体组',   color:'#FA8C16', total:3, newCnt:2, existCnt:1 },
                    { id:'onto_net_cell', label:'小区实体组',   color:'#F59E0B', total:3, newCnt:2, existCnt:1 },
                    { id:'onto_net_freq', label:'频段资源实体组', color:'#D97706', total:2, newCnt:2, existCnt:0 },
                ]
            },
            {
                id:'l2_net_core', label:'核心网子域', color:'#B45309', icon:'fa-server',
                children:[
                    { id:'onto_net_node',   label:'网元实体组',     color:'#B45309', total:4, newCnt:3, existCnt:1 },
                    { id:'onto_net_slice',  label:'网络切片实体组', color:'#92400E', total:3, newCnt:3, existCnt:0 },
                    { id:'onto_net_region', label:'地理区域实体组', color:'#78350F', total:3, newCnt:1, existCnt:2 },
                ]
            },
            {
                id:'l2_net_equip', label:'设备资产子域', color:'#C2410C', icon:'fa-microchip',
                children:[
                    { id:'onto_net_hw',   label:'硬件设备实体组', color:'#C2410C', total:4, newCnt:3, existCnt:1 },
                    { id:'onto_net_port', label:'端口接口实体组', color:'#9A3412', total:3, newCnt:1, existCnt:2 },
                ]
            }
        ]
    },
    {
        id:'l1_billing', label:'计费账务域', color:'#00B42A', icon:'fa-file-invoice-dollar',
        children:[
            {
                id:'l2_billing_bill', label:'账单账期子域', color:'#00B42A', icon:'fa-calendar-check',
                children:[
                    { id:'onto_bill_main',   label:'账单主实体组',   color:'#00B42A', total:4, newCnt:2, existCnt:2 },
                    { id:'onto_bill_detail', label:'账单明细实体组', color:'#16A34A', total:3, newCnt:1, existCnt:2 },
                ]
            },
            {
                id:'l2_billing_pay', label:'缴费发票子域', color:'#15803D', icon:'fa-receipt',
                children:[
                    { id:'onto_bill_pay',     label:'缴费记录实体组', color:'#15803D', total:3, newCnt:1, existCnt:2 },
                    { id:'onto_bill_invoice', label:'发票实体组',     color:'#166534', total:2, newCnt:0, existCnt:2 },
                ]
            }
        ]
    },
    {
        id:'l1_complaint', label:'投诉工单域', color:'#F53F3F', icon:'fa-headset',
        children:[
            {
                id:'l2_complaint_main', label:'工单主体子域', color:'#F53F3F', icon:'fa-ticket',
                children:[
                    { id:'onto_comp_ticket',  label:'投诉工单实体组', color:'#F53F3F', total:3, newCnt:3, existCnt:0 },
                    { id:'onto_comp_order',   label:'处理流程实体组', color:'#EF4444', total:3, newCnt:2, existCnt:1 },
                ]
            },
            {
                id:'l2_complaint_quality', label:'质检回访子域', color:'#B91C1C', icon:'fa-star-half-stroke',
                children:[
                    { id:'onto_comp_survey', label:'满意度调查实体组', color:'#B91C1C', total:2, newCnt:2, existCnt:0 },
                    { id:'onto_comp_qa',     label:'质检记录实体组',   color:'#991B1B', total:2, newCnt:1, existCnt:1 },
                ]
            }
        ]
    }
];
