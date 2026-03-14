// ============================================================
// 主入口文件
// ============================================================

// 导入数据
import { STEPS, OPERATORS, ONTOLOGY_TREE, ENTITY_DATA, generateDefaultEntities, MAPPING_DATA, getDefaultMapping } from './js/data/index.js';

// 全局状态
let currentView = 'list';
let currentStep = 1;
let currentOntologyId = 'onto_crm_user_base';
let currentMappingView = 'line';
let nodesData = [];
let edgesData = [];
let idCounter = 1;
let draggedOpType = null;
let draggingNodeId = null;
let dragOffset = { x: 0, y: 0 };
let isConnecting = false;
let connectSourceNode = null;
let nodeToRename = null;
let openL1 = new Set();
let openL2 = new Set();
let movingEntityId = null;
let selectedTargetL1 = null;
let reextractTimer = null;

// 实体颜色
const ENTITY_COLORS = ['#165DFF', '#722ED1', '#13C2C2', '#FA8C16', '#F53F3F', '#00B42A'];

// ============================================================
// 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    renderTaskTable();
    renderStepper();
});

// ============================================================
// 视图切换
// ============================================================

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.workspace-container').forEach(el => el.classList.remove('active'));

    if (view === 'list') {
        document.getElementById('listView').classList.add('active');
    } else if (view === 'task') {
        document.getElementById('taskView').classList.add('active');
    }
}

function switchViewMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (mode === 'form') {
        document.getElementById('step1Page').style.display = (currentStep === 1) ? 'flex' : 'none';
        document.getElementById('step2Page').style.display = (currentStep === 2) ? 'flex' : 'none';
        document.getElementById('step3Page').style.display = (currentStep === 3) ? 'flex' : 'none';
        document.getElementById('step4Page').style.display = (currentStep === 4) ? 'flex' : 'none';
        document.getElementById('canvasView').classList.remove('active');
    } else {
        document.getElementById('step1Page').style.display = 'none';
        document.getElementById('step2Page').style.display = 'none';
        document.getElementById('step3Page').style.display = 'none';
        document.getElementById('step4Page').style.display = 'none';
        document.getElementById('canvasView').classList.add('active');
    }
}

// ============================================================
// 任务列表
// ============================================================

function renderTaskTable() {
    const tasks = [
        { id: 1, name: 'CRM用户画像构建任务', type: '实体提取', status: 'processing', createTime: '2024-01-15 10:30', progress: 65 },
        { id: 2, name: '订单数据同步任务', type: '数据采集', status: 'success', createTime: '2024-01-14 16:20', progress: 100 },
        { id: 3, name: '基站信息入库', type: '知识融合', status: 'success', createTime: '2024-01-14 09:15', progress: 100 },
        { id: 4, name: '投诉工单分析', type: '关联构建', status: 'warning', createTime: '2024-01-13 14:50', progress: 30 },
        { id: 5, name: '产品目录梳理', type: '本体数据采集', status: 'success', createTime: '2024-01-12 11:00', progress: 100 },
    ];

    const tbody = document.getElementById('taskTableBody');
    tbody.innerHTML = tasks.map(task => {
        let statusHtml = '';
        if (task.status === 'processing') {
            statusHtml = '<span class="status-badge processing"><i class="fa-solid fa-circle-notch fa-spin"></i> 进行中</span>';
        } else if (task.status === 'success') {
            statusHtml = '<span class="status-badge success"><i class="fa-solid fa-check-circle"></i> 已完成</span>';
        } else {
            statusHtml = '<span class="status-badge" style="background:#FFF7E6;color:#FF7D00;"><i class="fa-solid fa-triangle-exclamation"></i> 待处理</span>';
        }

        return `
            <tr>
                <td><strong>${task.name}</strong></td>
                <td>${task.type}</td>
                <td>${statusHtml}</td>
                <td>${task.createTime}</td>
                <td><div style="width:80px;height:6px;background:#F2F3F5;border-radius:3px;"><div style="width:${task.progress}%;height:100%;background:${task.progress === 100 ? 'var(--success-color)' : 'var(--primary-color)'};border-radius:3px;"></div></div></td>
                <td class="col-actions">
                    <span class="action-link" onclick="openTask(${task.id})">编辑</span>
                    <span class="action-link danger">删除</span>
                </td>
            </tr>
        `;
    }).join('');
}

function createNewTask() {
    switchView('task');
}

function openTask(id) {
    switchView('task');
}

// ============================================================
// 步骤导航
// ============================================================

function renderStepper() {
    const nav = document.getElementById('stepperNav');
    nav.innerHTML = STEPS.map((step, idx) => {
        const isActive = idx + 1 === currentStep;
        const isDone = idx + 1 < currentStep;
        return `
            <div class="step-pill ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}"
                 style="--active-step-color: ${step.color}"
                 onclick="goToStep(${step.id})">
                <span class="step-num">${isDone ? '<i class="fa-solid fa-check"></i>' : step.id}</span>
                <span>${step.name}</span>
            </div>
        `;
    }).join('');
}

function goToStep(step) {
    currentStep = step;
    renderStepper();
    showStepPage(step);
}

function showStepPage(step) {
    document.getElementById('step1Page').style.display = step === 1 ? 'flex' : 'none';
    document.getElementById('step2Page').style.display = step === 2 ? 'flex' : 'none';
    document.getElementById('step3Page').style.display = step === 3 ? 'flex' : 'none';
    document.getElementById('step4Page').style.display = step === 4 ? 'flex' : 'none';
}

function prevStep(step) {
    if (step > 1) {
        goToStep(step - 1);
    }
}

function nextStep(step) {
    if (step < 4) {
        goToStep(step + 1);
    }
}

function goBack() {
    switchView('list');
}

// ============================================================
// 表单操作
// ============================================================

function selectDataType(el, type) {
    document.querySelectorAll('.segment-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
}

function openScriptModal() {
    document.getElementById('ideModal').style.display = 'flex';
}

function saveScript() {
    closeModal('scriptModal');
}

function runTask() {
    alert('任务执行功能待实现');
}

function startImport() {
    alert('知识入库功能待实现');
}

// ============================================================
// 本体树渲染
// ============================================================

function renderOntologyTree() {
    const container = document.getElementById('ontologyTreeBody');
    container.innerHTML = ONTOLOGY_TREE.map(l1 => {
        const isOpen = openL1.has(l1.id);
        const totalCnt = l1.children.reduce((sum, l2) => sum + l2.children.reduce((s, lf) => s + lf.total, 0), 0);

        return `
            <div class="onto-l1 ${isOpen ? 'open' : ''}" id="l1_${l1.id}">
                <div class="onto-l1-header" onclick="toggleL1('${l1.id}')">
                    <div class="onto-l1-icon" style="background:${l1.color};">
                        <i class="fa-solid ${l1.icon}"></i>
                    </div>
                    <span class="onto-l1-label">${l1.label}</span>
                    <span class="onto-l1-count">${totalCnt}</span>
                    <i class="fa-solid fa-chevron-right onto-chevron"></i>
                </div>
                <div class="onto-l1-children">
                    ${l1.children.map(l2 => {
                        const isOpenL2 = openL2.has(l2.id);
                        return `
                            <div class="onto-l2 ${isOpenL2 ? 'open' : ''}" id="l2_${l2.id}">
                                <div class="onto-l2-header" onclick="toggleL2('${l2.id}')">
                                    <div class="onto-l2-dot" style="background:${l2.color};">
                                        <i class="fa-solid ${l2.icon}" style="font-size:7px;"></i>
                                    </div>
                                    <span>${l2.label}</span>
                                    <i class="fa-solid fa-chevron-right onto-chevron" style="margin-left:auto;"></i>
                                </div>
                                <div class="onto-l2-children">
                                    ${l2.children.map(lf => `
                                        <div class="onto-l3" id="l3_${lf.id}">
                                            <div class="onto-l3-header ${currentOntologyId === lf.id ? 'active' : ''}" onclick="selectLeaf('${lf.id}')">
                                                <div class="onto-l3-icon" style="background:${lf.color};">
                                                    <i class="fa-solid fa-cube" style="font-size:7px;"></i>
                                                </div>
                                                <span class="onto-l3-label">${lf.label}</span>
                                                <div class="onto-l3-badge">
                                                    <span class="badge-new">${lf.newCnt}</span>
                                                    <span class="badge-exists">${lf.existCnt}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function toggleL1(id) {
    if (openL1.has(id)) {
        openL1.delete(id);
    } else {
        openL1.add(id);
    }
    renderOntologyTree();
}

function toggleL2(id) {
    if (openL2.has(id)) {
        openL2.delete(id);
    } else {
        openL2.add(id);
    }
    renderOntologyTree();
}

function selectLeaf(id) {
    currentOntologyId = id;
    const leaf = findLeafById(id);
    if (leaf) {
        document.getElementById('currentOntologyName').textContent = leaf.label;
        document.getElementById('statTotal').textContent = leaf.total;
        document.getElementById('statNew').textContent = leaf.newCnt;
        document.getElementById('statExisting').textContent = leaf.existCnt;
        document.getElementById('entityPageTotal').textContent = leaf.total;
    }
    renderOntologyTree();
    renderEntityList(id);
    triggerMappingRecognition();
}

function findLeafById(id) {
    for (const l1 of ONTOLOGY_TREE) {
        for (const l2 of l1.children) {
            for (const lf of l2.children) {
                if (lf.id === id) return lf;
            }
        }
    }
    return null;
}

// ============================================================
// 实体列表
// ============================================================

function renderEntityList(ontoId) {
    const entities = ENTITY_DATA[ontoId] || generateDefaultEntities(ontoId);
    const container = document.getElementById('entityListBody');
    const domainLabel = getLeafLabel(ontoId);

    container.innerHTML = entities.map((ent, idx) => {
        const color = ENTITY_COLORS[idx % ENTITY_COLORS.length];
        const tagHtml = ent.isNew
            ? `<span class="tag-new"><i class="fa-solid fa-sparkles"></i> 新发现</span>`
            : `<span class="tag-existing"><i class="fa-solid fa-check-circle"></i> 已入库</span>`;

        const attrsHtml = ent.attrs.map(a => `
            <span class="attr-tag">
                <span class="attr-tag-en">${a.en}</span>
                <span class="attr-tag-cn">${a.cn}</span>
            </span>
        `).join('');

        return `
            <div class="entity-card" id="ecard_${ent.id}">
                <div class="entity-card-header" onclick="toggleEntityCard('ecard_${ent.id}')">
                    <div class="entity-card-left">
                        <div class="entity-type-dot" style="background:${color};"></div>
                        <span class="entity-name">${ent.name}</span>
                        <span class="entity-name-cn">${ent.nameCn}</span>
                    </div>
                    <div class="entity-card-right">
                        ${tagHtml}
                        <span style="font-size:10px;color:var(--text-secondary);">${ent.attrs.length}属性</span>
                        <div class="entity-ops" onclick="event.stopPropagation()">
                            <div class="entity-op-btn" onclick="openMoveDomainModal('${ent.id}','${ent.name}','${ent.nameCn}','${domainLabel}')" title="调整所属域">
                                <i class="fa-solid fa-arrow-right-arrow-left"></i>
                            </div>
                            <div class="entity-op-btn" title="编辑"><i class="fa-solid fa-pen"></i></div>
                            <div class="entity-op-btn del" title="移除"><i class="fa-solid fa-trash-can"></i></div>
                        </div>
                        <i class="fa-solid fa-chevron-down entity-expand-icon"></i>
                    </div>
                </div>
                <div class="entity-card-body">
                    <div style="font-size:10px;color:var(--text-secondary);margin-bottom:6px;">
                        <i class="fa-solid fa-tag"></i> 属性列表（${ent.attrs.length} 个）
                    </div>
                    <div class="attr-list">${attrsHtml}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getLeafLabel(leafId) {
    let label = '';
    ONTOLOGY_TREE.forEach(l1 => l1.children.forEach(l2 => l2.children.forEach(lf => {
        if (lf.id === leafId) label = lf.label;
    })));
    return label;
}

function toggleEntityCard(cardId) {
    document.getElementById(cardId).classList.toggle('expanded');
}

// ============================================================
// AI识别
// ============================================================

function showAiRecognition() {
    const ov = document.getElementById('recognitionOverlay');
    ov.style.display = 'flex';
    document.getElementById('entityListBody').innerHTML = '';
    document.getElementById('mappingRecognizingOverlay').style.display = 'flex';

    setTimeout(() => {
        ov.style.display = 'none';
        document.getElementById('mappingRecognizingOverlay').style.display = 'none';
        currentOntologyId = 'onto_crm_user_base';
        openL1.add('l1_crm');
        openL2.add('l2_crm_user');

        const leaf = findLeafById('onto_crm_user_base');
        if (leaf) {
            document.getElementById('currentOntologyName').textContent = leaf.label;
            document.getElementById('statTotal').textContent = leaf.total;
            document.getElementById('statNew').textContent = leaf.newCnt;
            document.getElementById('statExisting').textContent = leaf.existCnt;
            document.getElementById('entityPageTotal').textContent = leaf.total;
        }

        renderOntologyTree();
        renderEntityList('onto_crm_user_base');
        renderMappingPanel('onto_crm_user_base');
    }, 3000);
}

function triggerMappingRecognition() {
    const ov = document.getElementById('mappingRecognizingOverlay');
    ov.style.display = 'flex';
    setTimeout(() => {
        ov.style.display = 'none';
        renderMappingPanel(currentOntologyId);
    }, 2500);
}

// ============================================================
// 重新识别
// ============================================================

function confirmReextract() {
    document.getElementById('reextractConfirmModal').style.display = 'flex';
}

function startReextract() {
    closeModal('reextractConfirmModal');
    setProgress(0, '正在扫描数据表结构...', '初始化识别任务...');
    document.getElementById('btnProgressClose').style.display = 'none';
    document.getElementById('reextractProgressModal').style.display = 'flex';
    document.getElementById('recognitionOverlay').style.display = 'flex';
    document.getElementById('entityListBody').innerHTML = '';
    document.getElementById('mappingRecognizingOverlay').style.display = 'flex';

    const stages = [
        { pct: 15, label: '扫描数据表结构...', stage: '扫描 8 张数据表...' },
        { pct: 30, label: '解析字段类型...', stage: '分析字段语义特征...' },
        { pct: 50, label: '大模型推断中...', stage: '调用 DeepSeek R1.0...' },
        { pct: 68, label: '实体去重...', stage: '与知识库比对...' },
        { pct: 82, label: '生成映射...', stage: '构建字段属性关联...' },
        { pct: 95, label: '最终验证...', stage: '校验识别结果...' },
        { pct: 100, label: '识别完成！', stage: '共识别 5 个实体，3 新发现' },
    ];

    let idx = 0;
    reextractTimer = setInterval(() => {
        if (idx >= stages.length) {
            clearInterval(reextractTimer);
            reextractTimer = null;
            document.getElementById('btnProgressClose').style.display = 'flex';
            document.getElementById('recognitionOverlay').style.display = 'none';
            document.getElementById('mappingRecognizingOverlay').style.display = 'none';
            renderEntityList(currentOntologyId);
            renderMappingPanel(currentOntologyId);
            renderOntologyTree();
            return;
        }
        setProgress(stages[idx].pct, stages[idx].label, stages[idx].stage);
        idx++;
    }, 900);
}

function setProgress(pct, label, stage) {
    document.getElementById('progressBarFill').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressLabel').textContent = label;
    document.getElementById('progressStage').innerHTML = `
        <i class="fa-solid ${pct < 100 ? 'fa-circle-notch fa-spin' : 'fa-circle-check'}"
           style="color:${pct < 100 ? 'var(--processing-color)' : 'var(--success-color)'}"></i>
        <span>${stage}</span>
    `;
}

function dismissProgressModal() {
    closeModal('reextractProgressModal');
}

// ============================================================
// 调整实体所属域
// ============================================================

function openMoveDomainModal(entityId, name, nameCn, currentDomain) {
    movingEntityId = entityId;
    document.getElementById('movingEntityName').textContent = `${name}（${nameCn}）`;
    document.getElementById('movingEntityCurrentDomain').textContent = currentDomain;

    document.getElementById('domainOptionList').innerHTML = ONTOLOGY_TREE.map(l1 => `
        <div class="domain-option" onclick="selectDomainOption(this,'${l1.id}')" data-id="${l1.id}">
            <div class="domain-option-icon" style="background:${l1.color};">
                <i class="fa-solid ${l1.icon}"></i>
            </div>
            <div>
                <div style="font-size:12px;font-weight:500;">${l1.label}</div>
                <div style="font-size:11px;color:var(--text-secondary);">${l1.children.map(l2 => l2.label).join(' · ')}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('moveDomainModal').style.display = 'flex';
}

function selectDomainOption(el, id) {
    document.querySelectorAll('.domain-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedTargetL1 = id;
}

function confirmMoveDomain() {
    if (!selectedTargetL1) return;

    const target = ONTOLOGY_TREE.find(l1 => l1.id === selectedTargetL1);
    closeModal('moveDomainModal');
    selectedTargetL1 = null;

    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1D2129;color:#fff;padding:9px 18px;border-radius:6px;font-size:13px;z-index:9999;display:flex;align-items:center;gap:7px;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
    tip.innerHTML = `<i class="fa-solid fa-check-circle" style="color:var(--success-color);"></i>已成功调整至「${target.label}」`;
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 2500);
}

// ============================================================
// 映射面板
// ============================================================

function switchMappingView(mode) {
    currentMappingView = mode;
    document.getElementById('btnLineView').classList.toggle('active', mode === 'line');
    document.getElementById('btnTableView').classList.toggle('active', mode === 'table');

    const lv = document.getElementById('mappingLineView');
    const tv = document.getElementById('mappingTableView');

    if (mode === 'line') {
        lv.style.display = 'flex';
        tv.style.display = 'none';
    } else {
        lv.style.display = 'none';
        tv.style.display = 'block';
        renderMappingTable(currentOntologyId);
    }
}

function renderMappingPanel(ontoId) {
    const data = MAPPING_DATA[ontoId] || getDefaultMapping(ontoId);
    document.getElementById('mappingPageInfo').textContent = `共 ${data.links.length} 条映射关系`;

    if (currentMappingView === 'line') {
        renderMappingLines(ontoId);
    } else {
        renderMappingTable(ontoId);
    }
}

function renderMappingLines(ontoId) {
    const data = MAPPING_DATA[ontoId] || getDefaultMapping(ontoId);
    const lc = document.getElementById('mappingLeftCol');
    const rc = document.getElementById('mappingRightCol');

    lc.innerHTML = `<div class="mapping-col-title">物理字段</div>` + data.fields.map((f, i) =>
        `<div class="mapping-field-item" id="mf_${i}">${f.name}<span class="field-type">${f.type}</span></div>`
    ).join('');

    rc.innerHTML = `<div class="mapping-col-title">实体属性</div>` + data.attrs.map((a, i) =>
        `<div class="mapping-field-item" id="ma_${i}">${a.name}<span class="field-type">${a.entity}</span></div>`
    ).join('');

    setTimeout(() => drawMappingLines(ontoId), 80);
}

function drawMappingLines(ontoId) {
    const data = MAPPING_DATA[ontoId] || getDefaultMapping(ontoId);
    const svg = document.getElementById('mappingSvg');
    const sr = document.getElementById('mappingSvgMid')?.getBoundingClientRect() || document.getElementById('mappingLeftCol').getBoundingClientRect();
    const cc = { high: '#00B42A', mid: '#FF7D00', low: '#F53F3F' };

    svg.innerHTML = '';

    data.links.forEach(([li, ri, conf]) => {
        const le = document.getElementById('mf_' + li);
        const re = document.getElementById('ma_' + ri);
        if (!le || !re) return;

        const lr = le.getBoundingClientRect();
        const rr = re.getBoundingClientRect();

        const x1 = lr.right - sr.left;
        const y1 = lr.top + lr.height / 2 - sr.top;
        const x2 = rr.left - sr.left;
        const y2 = rr.top + rr.height / 2 - sr.top;

        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', cc[conf]);
        p.setAttribute('stroke-width', '1.5');
        p.setAttribute('stroke-opacity', '0.75');
        svg.appendChild(p);

        [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', pt.x);
            c.setAttribute('cy', pt.y);
            c.setAttribute('r', '3');
            c.setAttribute('fill', cc[conf]);
            svg.appendChild(c);
        });
    });

    data.links.forEach(([li, ri]) => {
        const le = document.getElementById('mf_' + li);
        const re = document.getElementById('ma_' + ri);
        if (le) le.classList.add('active');
        if (re) re.classList.add('active');
    });
}

function renderMappingTable(ontoId) {
    const data = MAPPING_DATA[ontoId] || getDefaultMapping(ontoId);
    const cl = { high: ['conf-high', '高'], mid: ['conf-mid', '中'], low: ['conf-low', '低'] };

    document.getElementById('mappingTableView').innerHTML = `
        <table class="mapping-tbl">
            <thead>
                <tr>
                    <th width="30%">物理字段</th>
                    <th width="8%" style="text-align:center;"></th>
                    <th width="30%">实体属性</th>
                    <th>置信度</th>
                </tr>
            </thead>
            <tbody>
                ${data.links.map(([li, ri, conf]) => {
                    const f = data.fields[li];
                    const a = data.attrs[ri];
                    return `
                        <tr>
                            <td>${f.name}<br><span style="font-size:10px;color:var(--text-secondary);">${f.type}</span></td>
                            <td class="mapped-arrow"><i class="fa-solid fa-arrow-right"></i></td>
                            <td>${a.name}<br><span style="font-size:10px;color:var(--text-secondary);">${a.entity}</span></td>
                            <td><span class="conf-badge ${cl[conf][0]}">${cl[conf][1]}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// ============================================================
// 通用模态框
// ============================================================

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function openSqlModal(t) {
    document.getElementById('sqlTableName').innerText = t;
    document.getElementById('fakeSqlInput').value = `SELECT *\nFROM ${t}\nWHERE status = 'ACTIVE'\nLIMIT 500;`;
    document.getElementById('sqlModal').style.display = 'flex';
}

function openFieldModal(t) {
    document.getElementById('fieldTableName').innerText = t;
    document.getElementById('fieldModal').style.display = 'flex';
}

function toggleDsForm() {
    document.getElementById('dsForm').classList.toggle('show');
}

// ============================================================
// 画布引擎
// ============================================================

function dragStartOp(e, type) {
    draggedOpType = type;
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (!draggedOpType) return;

    const cr = document.getElementById('canvasArea').getBoundingClientRect();
    const op = OPERATORS.find(o => o.type === draggedOpType);
    const sm = STEPS.find(s => s.id === op.step);

    nodesData.push({
        id: 'node_' + (idCounter++),
        type: op.type,
        step: op.step,
        name: op.name,
        icon: op.icon,
        color: sm.color,
        x: e.clientX - cr.left - 95,
        y: e.clientY - cr.top - 28
    });

    renderNodes();
    draggedOpType = null;
}

function renderNodes() {
    document.getElementById('nodes-container').innerHTML = nodesData.map(n => `
        <div class="canvas-node" id="${n.id}" style="left:${n.x}px;top:${n.y}px;">
            <div class="node-actions">
                <i class="fa-solid fa-pen action-icon edit" onclick="openRenameModal('${n.id}')"></i>
                <i class="fa-solid fa-trash-can action-icon delete" onclick="deleteNode('${n.id}')"></i>
            </div>
            <div class="port in" onmousedown="startConnect(event,null)" onmouseup="endConnect(event,'${n.id}')"></div>
            <div class="node-color-bar" style="background:${n.color};"></div>
            <div class="node-content" onmousedown="startNodeDrag(event,'${n.id}')" onclick="openDrawer('${n.id}')">
                <div class="node-header">
                    <i class="fa-solid ${n.icon}" style="color:${n.color};font-size:12px;"></i>
                    <div class="node-title">${n.name}</div>
                </div>
                <div class="node-desc">步骤 ${n.step}</div>
            </div>
            <div class="port out" onmousedown="startConnect(event,'${n.id}')"></div>
        </div>
    `).join('');

    renderEdges();
}

function startNodeDrag(e, id) {
    if (e.button !== 0) return;
    draggingNodeId = id;
    document.getElementById(id).classList.add('selected');

    const r = document.getElementById(id).getBoundingClientRect();
    dragOffset = { x: e.clientX - r.left, y: e.clientY - r.top };

    document.addEventListener('mousemove', nodeDrag);
    document.addEventListener('mouseup', endNodeDrag);
}

function nodeDrag(e) {
    if (!draggingNodeId) return;

    const cr = document.getElementById('canvasArea').getBoundingClientRect();
    const n = nodesData.find(n => n.id === draggingNodeId);

    n.x = e.clientX - cr.left - dragOffset.x;
    n.y = e.clientY - cr.top - dragOffset.y;

    const el = document.getElementById(draggingNodeId);
    el.style.left = n.x + 'px';
    el.style.top = n.y + 'px';
    renderEdges();
}

function endNodeDrag() {
    if (draggingNodeId) {
        document.getElementById(draggingNodeId).classList.remove('selected');
        draggingNodeId = null;
    }
    document.removeEventListener('mousemove', nodeDrag);
    document.removeEventListener('mouseup', endNodeDrag);
}

function startConnect(e, sid) {
    e.stopPropagation();
    if (!sid) return;
    isConnecting = true;
    connectSourceNode = sid;
    document.addEventListener('mousemove', tempLineDrag);
    document.addEventListener('mouseup', cancelConnect);
}

function tempLineDrag(e) {
    if (!isConnecting) return;

    const cr = document.getElementById('canvasArea').getBoundingClientRect();
    const sp = document.getElementById(connectSourceNode).querySelector('.port.out').getBoundingClientRect();

    document.getElementById('temp-line').setAttribute('d',
        createBezier(sp.left - cr.left + sp.width / 2, sp.top - cr.top + sp.height / 2, e.clientX - cr.left, e.clientY - cr.top)
    );
}

function endConnect(e, tid) {
    e.stopPropagation();
    if (isConnecting && connectSourceNode && connectSourceNode !== tid && !edgesData.find(ed => ed.sourceNode === connectSourceNode && ed.targetNode === tid)) {
        edgesData.push({ id: 'edge_' + Date.now(), sourceNode: connectSourceNode, targetNode: tid });
        renderEdges();
    }
    cleanTempLine();
}

function cancelConnect() {
    cleanTempLine();
}

function cleanTempLine() {
    isConnecting = false;
    connectSourceNode = null;
    document.getElementById('temp-line').setAttribute('d', '');
    document.removeEventListener('mousemove', tempLineDrag);
    document.removeEventListener('mouseup', cancelConnect);
}

function renderEdges() {
    const cr = document.getElementById('canvasArea').getBoundingClientRect();

    document.getElementById('edges-container').innerHTML = edgesData.map(e => {
        const sn = document.getElementById(e.sourceNode);
        const tn = document.getElementById(e.targetNode);
        if (!sn || !tn) return '';

        const sp = sn.querySelector('.port.out').getBoundingClientRect();
        const tp = tn.querySelector('.port.in').getBoundingClientRect();

        return `<path class="connection-line" d="${createBezier(sp.left - cr.left + sp.width / 2, sp.top - cr.top + sp.height / 2, tp.left - cr.left + tp.width / 2, tp.top - cr.top + tp.height / 2)}" onclick="deleteEdge('${e.id}')"></path>`;
    }).join('');
}

function createBezier(x1, y1, x2, y2) {
    const o = Math.max(Math.abs(x2 - x1) / 2, 60);
    return `M ${x1} ${y1} C ${x1 + o} ${y1}, ${x2 - o} ${y2}, ${x2} ${y2}`;
}

function deleteNode(id) {
    nodesData = nodesData.filter(n => n.id !== id);
    edgesData = edgesData.filter(e => e.sourceNode !== id && e.targetNode !== id);
    renderNodes();
    closeDrawer();
}

function deleteEdge(id) {
    edgesData = edgesData.filter(e => e.id !== id);
    renderEdges();
}

function openDrawer(id) {
    const node = nodesData.find(n => n.id === id);
    if (node) {
        document.getElementById('configNodeName').value = node.name;
        document.getElementById('configDrawer').classList.add('open');
    }
}

function closeDrawer() {
    document.getElementById('configDrawer').classList.remove('open');
}

function openRenameModal(id) {
    const node = nodesData.find(n => n.id === id);
    if (node) {
        const newName = prompt('请输入新名称:', node.name);
        if (newName) {
            node.name = newName;
            renderNodes();
        }
    }
}

// 初始化本体树（默认展开第一个）
openL1.add('l1_crm');
openL2.add('l2_crm_user');

// 导出全局函数到window
window.switchView = switchView;
window.switchViewMode = switchViewMode;
window.createNewTask = createNewTask;
window.openTask = openTask;
window.goToStep = goToStep;
window.prevStep = prevStep;
window.nextStep = nextStep;
window.goBack = goBack;
window.selectDataType = selectDataType;
window.openScriptModal = openScriptModal;
window.saveScript = saveScript;
window.runTask = runTask;
window.startImport = startImport;
window.toggleL1 = toggleL1;
window.toggleL2 = toggleL2;
window.selectLeaf = selectLeaf;
window.toggleEntityCard = toggleEntityCard;
window.showAiRecognition = showAiRecognition;
window.triggerMappingRecognition = triggerMappingRecognition;
window.confirmReextract = confirmReextract;
window.startReextract = startReextract;
window.dismissProgressModal = dismissProgressModal;
window.openMoveDomainModal = openMoveDomainModal;
window.selectDomainOption = selectDomainOption;
window.confirmMoveDomain = confirmMoveDomain;
window.switchMappingView = switchMappingView;
window.closeModal = closeModal;
window.openSqlModal = openSqlModal;
window.openFieldModal = openFieldModal;
window.toggleDsForm = toggleDsForm;
window.dragStartOp = dragStartOp;
window.allowDrop = allowDrop;
window.drop = drop;
window.startNodeDrag = startNodeDrag;
window.startConnect = startConnect;
window.endConnect = endConnect;
window.deleteNode = deleteNode;
window.deleteEdge = deleteEdge;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.openRenameModal = openRenameModal;
