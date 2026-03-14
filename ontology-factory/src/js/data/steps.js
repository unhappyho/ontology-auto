// ============================================================
// 步骤配置数据
// ============================================================

export const STEPS = [
    { id:1, name:"本体数据采集",  color:"var(--color-step1)", icon:"fa-database" },
    { id:2, name:"实体数据提取",  color:"var(--color-step2)", icon:"fa-cube" },
    { id:3, name:"关联构建",       color:"var(--color-step3)", icon:"fa-circle-nodes" },
    { id:4, name:"知识融合入库",   color:"var(--color-step4)", icon:"fa-server" }
];

export const OPERATORS = [
    { type:"op1-1", step:1, name:"数据采集(DB)",    icon:"fa-table" },
    { type:"op1-2", step:1, name:"数据采集(PDF)",   icon:"fa-file-pdf" },
    { type:"op1-3", step:1, name:"数据采集(脚本)",  icon:"fa-code" },
    { type:"op2-1", step:2, name:"实体提取+映射",   icon:"fa-brain" },
    { type:"op3-1", step:3, name:"关联构建",          icon:"fa-link" },
    { type:"op4-1", step:4, name:"知识融合入库",     icon:"fa-database" }
];
