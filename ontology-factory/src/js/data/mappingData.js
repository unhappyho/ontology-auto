// ============================================================
// 映射数据
// ============================================================

export const MAPPING_DATA = {
    onto_crm_user_base:{
        fields:[{name:'user_id',type:'VARCHAR(32)'},{name:'user_name',type:'VARCHAR(64)'},{name:'phone_number',type:'VARCHAR(20)'},{name:'status',type:'INT(2)'},{name:'create_time',type:'DATETIME'},{name:'email',type:'VARCHAR(128)'}],
        attrs:[{name:'userId',entity:'User'},{name:'userName',entity:'User'},{name:'phoneNumber',entity:'User'},{name:'status',entity:'User'},{name:'createTime',entity:'User'},{name:'email',entity:'User'}],
        links:[[0,0,'high'],[1,1,'high'],[2,2,'high'],[3,3,'high'],[4,4,'mid'],[5,5,'mid']]
    },
    onto_order_main:{
        fields:[{name:'order_id',type:'VARCHAR(32)'},{name:'user_id',type:'VARCHAR(32)'},{name:'total_amount',type:'DECIMAL(10,2)'},{name:'pay_channel',type:'VARCHAR(20)'},{name:'order_status',type:'INT(2)'},{name:'create_time',type:'DATETIME'}],
        attrs:[{name:'orderId',entity:'Order'},{name:'userId',entity:'Order'},{name:'totalAmount',entity:'Order'},{name:'payChannel',entity:'Order'},{name:'orderStatus',entity:'Order'},{name:'createTime',entity:'Order'}],
        links:[[0,0,'high'],[1,1,'high'],[2,2,'high'],[3,3,'mid'],[4,4,'high'],[5,5,'mid']]
    },
    onto_net_bs:{
        fields:[{name:'station_id',type:'VARCHAR(32)'},{name:'station_name',type:'VARCHAR(64)'},{name:'station_type',type:'VARCHAR(20)'},{name:'longitude',type:'DECIMAL(10,6)'},{name:'latitude',type:'DECIMAL(10,6)'},{name:'coverage_radius',type:'INT'}],
        attrs:[{name:'stationId',entity:'BaseStation'},{name:'stationName',entity:'BaseStation'},{name:'stationType',entity:'BaseStation'},{name:'longitude',entity:'BaseStation'},{name:'latitude',entity:'BaseStation'},{name:'coverageRadius',entity:'BaseStation'}],
        links:[[0,0,'high'],[1,1,'high'],[2,2,'mid'],[3,3,'high'],[4,4,'high'],[5,5,'mid']]
    },
    onto_bill_main:{
        fields:[{name:'bill_id',type:'VARCHAR(32)'},{name:'user_id',type:'VARCHAR(32)'},{name:'billing_cycle',type:'VARCHAR(10)'},{name:'total_fee',type:'DECIMAL(10,2)'},{name:'discount_fee',type:'DECIMAL(10,2)'},{name:'real_fee',type:'DECIMAL(10,2)'}],
        attrs:[{name:'billId',entity:'Bill'},{name:'userId',entity:'Bill'},{name:'billingCycle',entity:'Bill'},{name:'totalFee',entity:'Bill'},{name:'discountFee',entity:'Bill'},{name:'realFee',entity:'Bill'}],
        links:[[0,0,'high'],[1,1,'high'],[2,2,'mid'],[3,3,'high'],[4,4,'high'],[5,5,'high']]
    },
    onto_comp_ticket:{
        fields:[{name:'complaint_id',type:'VARCHAR(32)'},{name:'user_id',type:'VARCHAR(32)'},{name:'type_code',type:'VARCHAR(20)'},{name:'content',type:'TEXT'},{name:'submit_time',type:'DATETIME'},{name:'priority',type:'INT(2)'}],
        attrs:[{name:'complaintId',entity:'Complaint'},{name:'userId',entity:'Complaint'},{name:'typeCode',entity:'Complaint'},{name:'content',entity:'Complaint'},{name:'submitTime',entity:'Complaint'},{name:'priority',entity:'Complaint'}],
        links:[[0,0,'high'],[1,1,'high'],[2,2,'mid'],[3,3,'high'],[4,4,'high'],[5,5,'mid']]
    }
};

// 获取默认映射
export function getDefaultMapping(ontoId) {
    return {
        fields:[
            {name:'id',type:'VARCHAR(32)'},
            {name:'name',type:'VARCHAR(64)'},
            {name:'status',type:'INT(2)'},
            {name:'create_time',type:'DATETIME'}
        ],
        attrs:[
            {name:'id',entity:'Entity'},
            {name:'name',entity:'Entity'},
            {name:'status',entity:'Entity'},
            {name:'createTime',entity:'Entity'}
        ],
        links:[[0,0,'high'],[1,1,'high'],[2,2,'mid'],[3,3,'mid']]
    };
}
