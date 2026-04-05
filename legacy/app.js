/* ===================================================
   PresaleX — SC&L Expert Workspace
   app.js — Application Logic
=================================================== */

// =====================================================
// 1. NAVIGATION
// =====================================================
const pages = ['dashboard','expert-panel','proposal-builder','knowledge-base','client-intel','deal-qualifier','solution-templates'];

function navigate(moduleId) {
  // Hide all pages
  pages.forEach(p => {
    document.getElementById(`page-${p}`)?.classList.remove('active');
    document.getElementById(`nav-${p}`)?.classList.remove('active');
  });
  // Show target page
  document.getElementById(`page-${moduleId}`)?.classList.add('active');
  document.getElementById(`nav-${moduleId}`)?.classList.add('active');

  // Update topbar
  const labels = {
    'dashboard': ['Dashboard', 'Overview'],
    'expert-panel': ['AI Expert Panel', 'Consult Experts'],
    'proposal-builder': ['Proposal Builder', 'Create & Edit Decks'],
    'knowledge-base': ['Knowledge Base', 'Frameworks & Reference'],
    'client-intel': ['Client Intelligence', 'Profile & Pain Points'],
    'deal-qualifier': ['Deal Qualifier', 'MEDDIC Scorecard'],
    'solution-templates': ['Solution Templates', 'Ready-to-Use Decks'],
  };
  if (labels[moduleId]) {
    document.getElementById('topbar-title').textContent = labels[moduleId][0];
    document.getElementById('topbar-crumb').textContent = labels[moduleId][1];
  }
}

// Nav click events
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => navigate(el.dataset.module));
});

// =====================================================
// 2. SIDEBAR COLLAPSE
// =====================================================
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const toggleIcon = document.getElementById('toggle-icon');
let collapsed = false;

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  collapsed = !collapsed;
  sidebar.classList.toggle('collapsed', collapsed);
  mainContent.classList.toggle('sidebar-collapsed', collapsed);
  toggleIcon.textContent = collapsed ? '▶' : '◀';
});

// =====================================================
// 3. TOAST NOTIFICATIONS
// =====================================================
function showToast(message, icon = '✅', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    toast.style.cssText += 'opacity:0;transform:translateX(80px);transition:all 0.3s ease;';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
document.getElementById('btn-notif').addEventListener('click', () => showToast('3 new opportunities flagged this week','🔔'));

// =====================================================
// 4. EXPERT PANEL — PERSONA CHAT
// =====================================================
const personas = {
  consultant: {
    name: 'Dr. Minh Khoa',
    role: 'Senior SC&L Consultant · 30 Years Experience',
    icon: '🏛️',
    color: 'rgba(0,212,170,0.15)',
    border: 'rgba(0,212,170,0.3)',
    class: 'consultant',
    greeting: 'Xin chào! Tôi là <strong>Dr. Minh Khoa</strong>, chuyên gia tư vấn Supply Chain & Logistics với 30 năm kinh nghiệm từ McKinsey, Blue Yonder và KPMG.<br><br>Hãy cho tôi biết về deal bạn đang làm việc — khách hàng là ai, ngành nào, pain point chính là gì? Tôi sẽ giúp bạn xây dựng strategy phù hợp nhất.',
    responses: [
      'Từ kinh nghiệm của tôi triển khai tại hơn 80 doanh nghiệp Việt Nam và quốc tế, <strong>pain point này rất phổ biến</strong> trong ngành đó. Tôi khuyến nghị tiếp cận theo 3 lớp: (1) Quick wins trong 60 ngày đầu để tạo momentum, (2) Foundation fixes trong Q2, (3) Transformation trong 12–18 tháng tiếp theo.',
      'Với background McKinsey, tôi luôn bắt đầu bằng <strong>value tree analysis</strong>: đâu là driver lớn nhất của cost hoặc revenue cho khách hàng? Với logistics, thường là 3 nhóm: transportation cost, inventory carrying cost, và service level. Chúng ta cần map pain points của khách hàng vào đây.',
      'Từ Blue Yonder, tôi thấy rằng <strong>ROI thường visible sớm nhất ở TMS</strong> — thường 6–9 tháng đã có kết quả đo được. Điều này giúp bạn tạo internal champion khi present cho BOD. Tôi có thể giúp bạn xây ROI model cụ thể cho deal này.',
      'Câu hỏi quan trọng cần hỏi khách hàng trong stage này: "Nếu không làm gì thay đổi trong 18 tháng tới, điều gì sẽ xảy ra với business của bạn?" Câu trả lời đó thường unlock budget và urgency rất effective.',
    ]
  },
  designer: {
    name: 'Linh Anh',
    role: 'Proposal Designer · 10 Years Experience',
    icon: '🎨',
    color: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.3)',
    class: 'designer',
    greeting: 'Xin chào! Tôi là <strong>Linh Anh</strong>, senior proposal designer với 10 năm xây dựng executive deck cho các deal SC&L lớn.<br><br>Hãy cho tôi biết bạn đang build proposal cho deal nào? Tôi sẽ giúp bạn cấu trúc slide, chọn visual language, và craft narrative phù hợp với audience — CEO, CFO, hay Head of SC?',
    responses: [
      'Với executive audience ở C-suite level, <strong>"less is more" là nguyên tắc tối thượng</strong>. Mỗi slide chỉ có 1 key message. Slide đầu tiên phải answer được câu hỏi "So what?" trong 5 giây đầu tiên họ nhìn vào deck. Tôi gợi ý bắt đầu bằng Executive Summary 1 trang với ROI rõ ràng.',
      'Để tạo impact tối đa với slide về pain points, hãy dùng <strong>"Before/After" visual contrast</strong>: bên trái là chaos (màu đỏ, metric xấu), bên phải là clarity (màu xanh, metric tốt). Khách hàng sẽ tự "see themselves" trong phần Before và bị hấp dẫn bởi phần After.',
      'Narrative arc đề xuất cho TMS/WMS proposal: (1) Situation — vẽ lại reality của họ bằng số liệu thực, (2) Complication — cost of inaction, (3) Resolution — your solution, (4) Evidence — case studies & ROI, (5) Next steps. Cấu trúc này proven với khách hàng Việt Nam ở mọi cấp độ.',
      'Màu sắc và font là 2 yếu tố ít ai nói đến nhưng tạo ra <strong>perceived credibility</strong> rất lớn. Tôi khuyên dùng navy + teal + gold cho logistics deck — nó convey trustworthiness và premium positioning. Tránh dùng quá 3 màu chính trên một deck.',
    ]
  },
  bod: {
    name: 'Mr. Trung Kiên',
    role: 'BOD Strategic Advisor · Ex-CEO',
    icon: '🏢',
    color: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.3)',
    class: 'bod',
    greeting: 'Tôi là <strong>Trung Kiên</strong>, cựu CEO và Giám đốc SC của các tập đoàn lớn. Tôi sẽ challenge bạn như một BOD member thực sự để đảm bảo proposal của bạn bulletproof trước khi gặp khách hàng.<br><br>Hãy pitch cho tôi nghe — hoặc hỏi tôi những objections bạn đang lo ngại từ phía BOD khách hàng.',
    responses: [
      'Câu đầu tiên BOD thường hỏi: <strong>"ROI trong bao lâu? Và assumptions của bạn có realistic không?"</strong> Bạn phải có conservative, base, và optimistic scenario. Nếu chỉ có 1 con số ROI, tôi sẽ không tin. Hãy show me the model.',
      'Objection phổ biến nhất tôi thấy ở level BOD: <strong>"Chúng tôi đã implement hệ thống X năm trước và thất bại."</strong> Để handle cái này, bạn phải acknowledge lịch sử đó, explain tại sao situation bây giờ khác, và show risk mitigation plan cụ thể. Đừng bỏ qua nó.',
      'Một điều tôi luôn test khi nghe proposal: <strong>Vendor có hiểu business của mình không, hay chỉ đang bán technology?</strong> Hãy đảm bảo proposal của bạn use language của khách hàng, cite industry benchmarks của họ, và show deep understanding về operating context của họ tại Việt Nam.',
      'Budget approval ở board level thường blocked bởi 2 điều: (1) Risk — "Điều gì xảy ra nếu fail?", (2) Opportunity cost — "Sao không dùng tiền này cho việc khác?". Hãy address cả 2 explicitly trong proposal. Tôi suggest có một slide riêng về Risk Mitigation.',
    ]
  },
  techleader: {
    name: 'Thanh Hùng',
    role: 'Digital Transformation Lead · 15 Years',
    icon: '⚙️',
    color: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.3)',
    class: 'techleader',
    greeting: 'Chào! Tôi là <strong>Thanh Hùng</strong>, đã lead 20+ dự án số hoá TMS, WMS, OMS và Planning tại Việt Nam và khu vực.<br><br>Hỏi tôi về technical fit assessment, integration architecture, vendor selection, implementation risk, change management — tôi sẽ give you honest, hands-on perspective.',
    responses: [
      'Vấn đề integration luôn là <strong>biggest risk trong mọi SC digitization project</strong> tại Việt Nam. Hầu hết enterprise đang chạy ERP cũ (SAP 4.6, Oracle E-Business), legacy WMS, và Excel. Bạn phải assess data quality và integration complexity trước khi commit timeline. Tôi suggest minimum 4-week discovery sprint chỉ riêng cho IT landscape.',
      'Về vendor selection: đừng chỉ nhìn features. <strong>3 factor quan trọng nhất</strong> là: (1) Local support capability — họ có team tại Vietnam không?, (2) Reference customer tương tự trong cùng industry tại ĐNÁ, (3) Total cost of ownership 5 năm, không phải license fee năm 1. Nhiều deal thất bại vì hidden costs.',
      'Change management thường bị underestimate và là <strong>top reason dự án fail</strong>. Tôi luôn recommend: dedicated Change Champion trong org khách hàng, training plan chi tiết theo role, và quick wins được defined trước khi go-live để maintain momentum. Có slide về điều này trong proposal của bạn chưa?',
      'Một pattern tôi thấy consistently: <strong>khách hàng Việt Nam muốn customization nhiều hơn cần thiết</strong>. Hãy educate họ về cost và risk của custom code versus configuration. Standard + process change thường cheaper và more sustainable. Đây là điểm bạn cần strong position khi present technical scope.',
    ]
  }
};

let currentPersona = 'consultant';

function selectPersona(personaKey) {
  currentPersona = personaKey;
  const p = personas[personaKey];

  // Update card selections
  document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`persona-${personaKey}`).classList.add('selected');

  // Update chat header
  document.getElementById('chat-avatar').textContent = p.icon;
  document.getElementById('chat-avatar').className = `persona-avatar ${p.class}`;
  document.getElementById('chat-avatar').style.width = '36px';
  document.getElementById('chat-avatar').style.height = '36px';
  document.getElementById('chat-avatar').style.fontSize = '18px';
  document.getElementById('chat-persona-name').textContent = p.name;
  document.getElementById('chat-persona-role').textContent = p.role;

  // Reset chat with greeting
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = `
    <div class="chat-msg">
      <div class="chat-msg-avatar" style="background:${p.color};border:2px solid ${p.border};">${p.icon}</div>
      <div class="chat-msg-body">${p.greeting}</div>
    </div>
  `;
}

document.querySelectorAll('.persona-card').forEach(card => {
  card.addEventListener('click', () => selectPersona(card.dataset.persona));
});

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const msgs = document.getElementById('chat-messages');
  const p = personas[currentPersona];

  // Add user message
  msgs.innerHTML += `
    <div class="chat-msg user">
      <div class="chat-msg-avatar" style="background:rgba(0,212,170,0.15);border:2px solid rgba(0,212,170,0.3);">👤</div>
      <div class="chat-msg-body">${text}</div>
    </div>
  `;
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  // Typing indicator
  const typingId = `typing-${Date.now()}`;
  msgs.innerHTML += `
    <div class="chat-msg" id="${typingId}">
      <div class="chat-msg-avatar" style="background:${p.color};border:2px solid ${p.border};">${p.icon}</div>
      <div class="chat-msg-body"><div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div></div>
    </div>
  `;
  msgs.scrollTop = msgs.scrollHeight;

  // Simulate AI response
  const delay = 1200 + Math.random() * 800;
  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    const response = p.responses[Math.floor(Math.random() * p.responses.length)];
    msgs.innerHTML += `
      <div class="chat-msg">
        <div class="chat-msg-avatar" style="background:${p.color};border:2px solid ${p.border};">${p.icon}</div>
        <div class="chat-msg-body">${response}</div>
      </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
  }, delay);
}

function clearChat() {
  selectPersona(currentPersona);
}

document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChatMessage();
});

// =====================================================
// 5. PROPOSAL BUILDER
// =====================================================
const defaultSlides = [
  { title: 'Executive Summary', icon: '⭐', type: 'cover', sub: 'Key outcomes, investment, and ROI snapshot', bullets: [], tag: 'EXECUTIVE OVERVIEW' },
  { title: 'About Our Team', icon: '🏛️', type: 'content', sub: '30 years of SC&L transformation experience across Vietnam and Southeast Asia', bullets: ['Ex-McKinsey, Blue Yonder, KPMG expertise', '80+ successful implementations', 'Deep Vietnam market knowledge'], tag: 'WHO WE ARE' },
  { title: 'Agenda', icon: '📋', type: 'agenda', sub: "Today's presentation structure", bullets: ['Client Situation & Challenges', 'Our Findings & Analysis', 'Proposed Solution Architecture', 'Implementation Roadmap', 'Investment & ROI', 'Next Steps'], tag: 'AGENDA' },
  { title: "Client's Current Challenges", icon: '⚠️', type: 'challenge', sub: 'Pain points and their business impact quantified', bullets: ['High transportation cost vs. industry benchmark', 'Limited real-time visibility across supply chain', 'Manual processes causing delays and errors', 'Inability to scale during peak seasons'], tag: 'SITUATION' },
  { title: 'Root Cause Analysis', icon: '🔍', type: 'content', sub: 'Underlying drivers of operational inefficiency', bullets: ['No integrated TMS / WMS system', 'Data silos between departments', 'Carrier management done manually via phone/Excel', 'No KPI dashboards for management visibility'], tag: 'ANALYSIS' },
  { title: 'Proposed Solution', icon: '💡', type: 'solution', sub: 'End-to-end supply chain digitization platform tailored to your business', bullets: ['TMS for route & carrier optimization', 'Real-time control tower visibility', 'Automated freight cost benchmarking', 'Mobile app for field operations'], tag: 'OUR SOLUTION' },
  { title: 'Implementation Roadmap', icon: '🗺️', type: 'roadmap', sub: '3-phase approach: Foundation → Optimization → Intelligence', bullets: ['Phase 1 (0–3 months): Core TMS deployment & data migration', 'Phase 2 (3–9 months): Advanced features & carrier portal', 'Phase 3 (9–18 months): AI optimization & predictive analytics'], tag: 'ROADMAP' },
  { title: 'ROI & Business Case', icon: '💰', type: 'roi', sub: 'Projected financial impact within 12 months', bullets: ['15–25% reduction in transportation cost', '40% improvement in on-time delivery', '$X.XM estimated annual savings', '8–12 month payback period'], tag: 'BUSINESS CASE' },
  { title: 'Case Studies', icon: '📊', type: 'cases', sub: 'Proven results in similar Vietnamese enterprise deployments', bullets: ['3PL Company: 23% fuel cost reduction, 2,000 trucks', 'FMCG DC Network: 99.4% inventory accuracy', 'Retail Conglomerate: +28% forecast accuracy'], tag: 'PROOF POINTS' },
  { title: 'Next Steps', icon: '🚀', type: 'next', sub: 'Recommended path forward to initiate the journey', bullets: ['Sign MOU to proceed to formal scoping', 'Conduct 2-week deep-dive discovery workshop', 'Finalize solution architecture & sizing', 'Board approval and contract signing'], tag: 'NEXT STEPS' },
];

let currentSlide = 0;
let slides = [...defaultSlides];

function renderSlideList() {
  const container = document.getElementById('slide-list-items');
  container.innerHTML = slides.map((s, i) => `
    <div class="slide-item ${i === currentSlide ? 'active' : ''}" onclick="selectSlide(${i})">
      <div class="slide-thumb">${s.icon}</div>
      <div>
        <div class="slide-item-title">${s.title}</div>
        <div class="slide-item-num">Slide ${i + 1}</div>
      </div>
    </div>
  `).join('');
}

function renderSlideCanvas() {
  const s = slides[currentSlide];
  const canvas = document.getElementById('slide-canvas');
  document.getElementById('slide-tool-label').textContent = `Slide ${currentSlide + 1} of ${slides.length}`;

  let bulletsHTML = '';
  if (s.bullets && s.bullets.length) {
    bulletsHTML = `<ul class="slide-canvas-bullets">
      ${s.bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>`;
  }

  canvas.innerHTML = `
    <div class="slide-canvas-tag">${s.tag || ''} &nbsp; ${currentSlide + 1}/${slides.length}</div>
    <div class="slide-canvas-title">${s.title}</div>
    <div class="slide-canvas-divider"></div>
    <div class="slide-canvas-sub">${s.sub}</div>
    ${bulletsHTML}
  `;
}

function selectSlide(idx) {
  currentSlide = idx;
  renderSlideList();
  renderSlideCanvas();
}

document.getElementById('btn-prev-slide').addEventListener('click', () => {
  if (currentSlide > 0) selectSlide(currentSlide - 1);
});
document.getElementById('btn-next-slide').addEventListener('click', () => {
  if (currentSlide < slides.length - 1) selectSlide(currentSlide + 1);
});

function loadTemplate(type) {
  const templateSlides = {
    TMS: [
      { title: 'TMS Transformation Proposal', icon: '🚛', sub: 'Reducing transportation cost and improving delivery performance', bullets: [], tag: 'TMS SOLUTION' },
      { title: 'Current State — Transportation Challenges', icon: '⚠️', sub: 'Pain point analysis from discovery', bullets: ['High freight cost: 8–12% of revenue vs 4–6% benchmark', 'No real-time shipment visibility', 'Manual carrier booking via phone/email', 'Zero route optimization capability'], tag: 'AS-IS' },
      { title: 'TMS Solution Architecture', icon: '🔧', sub: 'End-to-end transportation management platform', bullets: ['Route planning & optimization engine', 'Carrier management & RFQ portal', 'Real-time GPS tracking & ETA', 'Freight cost benchmarking'], tag: 'SOLUTION' },
      { title: 'ROI Model — TMS', icon: '💰', sub: 'Expected financial returns within 12 months', bullets: ['Fuel cost: -18 to 25% via route optimization', 'Carrier cost: -8% via competitive RFQ', 'Admin FTE savings: 2–3 headcount equivalent', 'On-time delivery: +30 percentage points'], tag: 'ROI' },
      { title: 'Implementation Roadmap', icon: '🗺️', sub: '3-phase TMS rollout over 15 months', bullets: ['Phase 1 (0–4M): Core TMS + top lanes go-live', 'Phase 2 (4–10M): Full carrier onboarding + mobile app', 'Phase 3 (10–15M): AI routing + predictive ETD'], tag: 'ROADMAP' },
      { title: 'Next Steps', icon: '🚀', sub: 'Start your TMS journey today', bullets: ['Kick-off 3-day scoping workshop', 'Finalize carrier data integration plan', 'Pilot with 2 key lanes in month 1'], tag: 'NEXT STEPS' },
    ],
    WMS: [
      { title: 'WMS Implementation Proposal', icon: '🏭', sub: 'Transforming warehouse operations for efficiency and accuracy', bullets: [], tag: 'WMS SOLUTION' },
      { title: 'Warehouse Operations Assessment', icon: '🔍', sub: 'Current state findings from DC audit', bullets: ['Inventory accuracy: 82% vs 99%+ world class', 'Picking productivity: 40 lines/hour vs 65 benchmark', 'Paper-based receiving process causing errors', 'No slotting optimization for fast-movers'], tag: 'AS-IS' },
      { title: 'WMS Solution Design', icon: '⚙️', sub: 'Best-in-class warehouse management system', bullets: ['RF/RFID-enabled receiving & putaway', 'Dynamic slotting & wave planning', 'Labor management & productivity tracking', 'Multi-DC centralized visibility'], tag: 'SOLUTION' },
      { title: 'Implementation Plan — WMS', icon: '🗺️', sub: 'Phased rollout across DC network', bullets: ['Phase 1: Pilot DC — 3 months', 'Phase 2: 3 additional DCs — 6 months', 'Phase 3: Full network standardization'], tag: 'ROADMAP' },
      { title: 'Expected Outcomes', icon: '📈', sub: 'Measurable improvements within 6 months', bullets: ['Inventory accuracy: 82% → 99.5%', 'Pick productivity: +35%', 'Receiving cycle time: -50%', 'Shrinkage reduction: -60%'], tag: 'ROI' },
      { title: 'Next Steps', icon: '🚀', sub: 'Begin your WMS transformation', bullets: ['DC readiness assessment — 2 weeks', 'Solution blueprint workshop', 'Pilot DC selection and kick-off'], tag: 'NEXT STEPS' },
    ],
    OMS: [
      { title: 'OMS & Omnichannel Fulfillment', icon: '🛒', sub: 'Unified order management for seamless customer experience', bullets: [], tag: 'OMS SOLUTION' },
      { title: 'Omnichannel Challenges', icon: '⚠️', sub: 'Current fulfillment pain points', bullets: ['Siloed inventory across online/offline channels', 'Manual order routing to DCs', 'No BOPIS / ship-from-store capability', 'Cart abandonment rate: 68% due to stock-outs'], tag: 'AS-IS' },
      { title: 'OMS Platform Design', icon: '🔗', sub: 'Unified commerce platform architecture', bullets: ['Single inventory pool across all channels', 'Intelligent order routing engine', 'BOPIS, ship-from-store, drop-ship enabled', 'Customer self-service portal'], tag: 'SOLUTION' },
      { title: 'Integration Architecture', icon: '🏗️', sub: 'System connectivity blueprint', bullets: ['OMS → ERP: order & invoice sync', 'OMS → WMS: fulfillment instructions', 'OMS → TMS: last-mile carrier booking', 'OMS → E-commerce: real-time inventory'], tag: 'ARCHITECTURE' },
      { title: 'Business Impact', icon: '💰', sub: 'Quantified OMS benefits', bullets: ['Cart abandonment: -18 pp improvement', 'Order processing time: -65%', 'Fulfillment cost: -12% via smart routing', 'Customer NPS: +15 points'], tag: 'ROI' },
      { title: 'Next Steps', icon: '🚀', sub: 'Launch your omnichannel journey', bullets: ['Channel audit & system inventory — 3 weeks', 'OMS architecture design sprint', 'Pilot with top 3 SKUs and flagship store'], tag: 'NEXT STEPS' },
    ],
    Planning: [
      { title: 'Integrated Planning Transformation', icon: '📊', sub: 'S&OP / IBP redesign for demand-supply excellence', bullets: [], tag: 'IBP/S&OP SOLUTION' },
      { title: 'Planning Maturity Diagnostic', icon: '🔍', sub: 'Current state: where you are today', bullets: ['Excel-based forecasting with no statistical engine', 'Siloed planning in Sales / Supply / Finance', 'Monthly S&OP exists but lacks executive engagement', 'Forecast accuracy: 54% vs 78% industry benchmark'], tag: 'AS-IS' },
      { title: 'IBP Process Design', icon: '🔄', sub: 'Redesigned 5-step monthly planning cycle', bullets: ['Week 1: Statistical demand review (AI-driven)', 'Week 2: Supply feasibility & constraint resolution', 'Week 3: Financial reconciliation & scenario planning', 'Week 4: Executive S&OP review & decision'], tag: 'SOLUTION' },
      { title: 'Planning Technology Recommendation', icon: '💻', sub: 'Platform selection rationale', bullets: ['Recommended: o9 Solutions or Blue Yonder IBP', 'Cloud-native, Southeast Asia references available', 'SAP IBP: if existing SAP core is stable', 'Anaplan: if finance-led IBP is priority'], tag: 'TECHNOLOGY' },
      { title: 'Expected IBP Outcomes', icon: '📈', sub: 'Measurable improvements within 12 months', bullets: ['Forecast accuracy: +25–30 percentage points', 'Inventory reduction: -15 to 20% working capital', 'Service level improvement: +8 pp OTIF', 'Planning cycle time: 30 days → 5 days'], tag: 'ROI' },
      { title: 'Transformation Roadmap', icon: '🗺️', sub: '24-month IBP journey', bullets: ['Month 1–3: Process redesign + quick wins', 'Month 4–9: Technology deployment', 'Month 10–18: AI/ML demand sensing enablement', 'Month 19–24: Enterprise-wide scaling'], tag: 'ROADMAP' },
      { title: 'Next Steps', icon: '🚀', sub: 'Start your planning transformation', bullets: ['IBP readiness workshop — 2 days', 'Planning process mapping session', 'Technology selection RFP & evaluation'], tag: 'NEXT STEPS' },
    ],
  };

  if (templateSlides[type]) {
    slides = [...templateSlides[type]];
    currentSlide = 0;
    renderSlideList();
    renderSlideCanvas();
    showToast(`${type} template loaded — ${slides.length} slides ready`, '📐');
  }
}

// =====================================================
// 6. KNOWLEDGE BASE TABS
// =====================================================
document.querySelectorAll('.kb-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.kb-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.kb-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`kb-${tab.dataset.tab}`)?.classList.add('active');
  });
});

// =====================================================
// 7. CLIENT INTELLIGENCE — PAIN POINTS
// =====================================================
const painPoints = [
  { label: '🚚 High Transport Cost', tags: ['TMS'] },
  { label: '📦 Low Inventory Accuracy', tags: ['WMS'] },
  { label: '👁 No SC Visibility', tags: ['TMS', 'Planning'] },
  { label: '📊 Poor Forecast Accuracy', tags: ['Planning'] },
  { label: '🔗 Channel Fragmentation', tags: ['OMS'] },
  { label: '⏱ Slow Order Processing', tags: ['OMS', 'WMS'] },
  { label: '🏭 DC Inefficiency', tags: ['WMS'] },
  { label: '🗓 No S&OP Process', tags: ['Planning'] },
  { label: '📱 No Real-time Tracking', tags: ['TMS'] },
  { label: '🤝 Poor Carrier Management', tags: ['TMS'] },
  { label: '💸 High Returns Rate', tags: ['OMS', 'WMS'] },
  { label: '📉 Low Service Level', tags: ['TMS', 'WMS', 'Planning'] },
];

const selectedPains = new Set();

function renderPainPoints() {
  const grid = document.getElementById('pain-grid');
  grid.innerHTML = painPoints.map((p, i) => `
    <div class="pain-checkbox ${selectedPains.has(i) ? 'checked' : ''}" onclick="togglePain(${i})">
      <div class="pain-dot"></div>
      <span class="pain-text">${p.label}</span>
    </div>
  `).join('');
}

function togglePain(i) {
  if (selectedPains.has(i)) selectedPains.delete(i);
  else selectedPains.add(i);
  renderPainPoints();
  updateRecommendations();
}

function updateRecommendations() {
  const tagCount = {};
  selectedPains.forEach(i => {
    painPoints[i].tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
  });

  const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  const recs = document.getElementById('ci-recommendations');

  const solutionInfo = {
    TMS: { icon: '🚛', name: 'TMS — Transport Management', desc: 'Route optimization, carrier management, freight cost visibility' },
    WMS: { icon: '🏭', name: 'WMS — Warehouse Management', desc: 'Inventory accuracy, picking efficiency, DC operations' },
    OMS: { icon: '🛒', name: 'OMS — Order Management', desc: 'Omnichannel fulfillment, unified inventory, customer experience' },
    Planning: { icon: '📊', name: 'Integrated Planning / IBP', desc: 'S&OP process, demand forecasting, supply-demand alignment' },
  };

  if (sorted.length === 0) {
    recs.innerHTML = '<p style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px 0;">Select pain points above to see recommendations ↑</p>';
    return;
  }

  const colors = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-purple)', 'var(--color-blue)'];
  recs.innerHTML = sorted.map(([tag, count], idx) => {
    const info = solutionInfo[tag] || {};
    return `
      <div class="card-glass" style="border-left:3px solid ${colors[idx] || 'var(--color-primary)'};">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <div style="font-size:13px;font-weight:600;">${info.icon || '📦'} ${info.name || tag}</div>
          <span class="badge badge-primary">#${idx+1} Priority</span>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);">${info.desc || ''}</div>
      </div>
    `;
  }).join('');
}

// =====================================================
// 8. DEAL QUALIFIER — MEDDIC
// =====================================================
const meddicItems = [
  { letter: 'M', question: 'Metrics', desc: 'What measurable value does the customer expect to achieve?', weight: 15 },
  { letter: 'E', question: 'Economic Buyer', desc: 'Have you identified and engaged the budget decision-maker?', weight: 20 },
  { letter: 'D', question: 'Decision Criteria', desc: 'Do you know how they will evaluate and choose a vendor?', weight: 15 },
  { letter: 'D', question: 'Decision Process', desc: 'Do you understand all steps & stakeholders in the buying process?', weight: 15 },
  { letter: 'I', question: 'Identify Pain', desc: 'Have you quantified the business pain and urgency level?', weight: 20 },
  { letter: 'C', question: 'Champion', desc: 'Is there an internal advocate who will sell on your behalf?', weight: 15 },
];

const meddicScores = new Array(meddicItems.length).fill(0);

function renderMEDDIC() {
  const container = document.getElementById('meddic-items');
  container.innerHTML = meddicItems.map((item, i) => `
    <div class="meddic-item">
      <div class="meddic-letter">${item.letter}</div>
      <div style="flex:1;">
        <div class="meddic-q">${item.question}</div>
        <div class="meddic-sub">${item.desc}</div>
      </div>
      <div class="meddic-score-btns">
        ${[0,1,2,3].map(v => `
          <div class="score-btn ${meddicScores[i] === v && meddicScores[i] > 0 ? 'selected' : ''}"
               onclick="setMeddicScore(${i}, ${v}, this)"
               title="${['Not assessed','Weak','Moderate','Strong'][v]}">
            ${v === 0 ? '–' : v}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function setMeddicScore(itemIdx, score, el) {
  meddicScores[itemIdx] = score;
  renderMEDDIC();
  updateDealScore();
}

function updateDealScore() {
  let total = 0;
  meddicScores.forEach((s, i) => {
    total += (s / 3) * meddicItems[i].weight;
  });
  const score = Math.round(total);
  document.getElementById('deal-score').textContent = score;
  document.getElementById('deal-score-bar').style.width = `${score}%`;

  let label, recClass, recText, nextSteps;
  if (score >= 70) {
    label = '🟢 Strong Opportunity';
    recClass = 'strong';
    recText = 'High deal quality. All key MEDDIC dimensions are well-covered. Prioritize this opportunity and accelerate proposal delivery.';
    nextSteps = ['① Schedule executive demo within this week', '② Finalize and submit proposal within 5 days', '③ Align Champion on internal selling strategy'];
  } else if (score >= 40) {
    label = '🟡 Moderate — Needs Work';
    recClass = 'moderate';
    recText = 'Promising opportunity but key gaps remain. Focus discovery on weak dimensions before investing heavily in proposal creation.';
    nextSteps = ['① Fill gaps: identify and engage Economic Buyer', '② Clarify decision timeline and evaluation criteria', '③ Quantify business pain with customer data'];
  } else {
    label = '🔴 Early Stage / Risky';
    recClass = 'weak';
    recText = 'Deal is not yet qualified. Significant information gaps present. Do not invest in full proposal until key MEDDIC dimensions are resolved.';
    nextSteps = ['① Conduct 2nd discovery call to gather MEDDIC info', '② Determine if real budget and urgency exist', '③ Reassess deal in 2 weeks after more data'];
  }

  document.getElementById('deal-score-label').textContent = label;
  const rec = document.getElementById('deal-recommendation');
  rec.className = `recommendation-box ${recClass}`;
  rec.textContent = recText;
  document.getElementById('deal-next-steps').innerHTML = nextSteps.map(s => `<div>${s}</div>`).join('');
}

// =====================================================
// 9. PRESENTATION MODE
// =====================================================
let presSlideIdx = 0;

function startPresentation() {
  presSlideIdx = 0;
  renderPresSlide();
  document.getElementById('presentation-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function exitPresentation() {
  document.getElementById('presentation-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function renderPresSlide() {
  const s = slides[presSlideIdx];
  document.getElementById('pres-slide-num').textContent = `Slide ${presSlideIdx + 1} of ${slides.length}`;
  document.getElementById('pres-progress').textContent = `${presSlideIdx + 1} / ${slides.length}`;
  document.getElementById('pres-title').textContent = s.title;
  document.getElementById('pres-body').textContent = s.sub;

  const badgesEl = document.getElementById('pres-badges');
  if (s.bullets && s.bullets.length) {
    badgesEl.innerHTML = s.bullets.slice(0, 4).map(b =>
      `<span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:8px 16px;font-size:14px;color:rgba(255,255,255,0.8);">${b}</span>`
    ).join('');
  } else {
    badgesEl.innerHTML = '';
  }

  const notes = [
    'Introduce yourself and the team. Set the tone — professional and client-centric.',
    'Emphasize your local market expertise and international methodology.',
    'Use this to manage time. Ask if they want to spend extra time on any section.',
    'Use their own language and quotes from the discovery call. This builds rapport.',
    'Frame this as a mirror — reflect their reality back to them.',
    'Keep it visual. Mention a reference customer in similar industry.',
    'Show a Gantt or traffic light timeline. Keep it simple.',
    'Tie ROI to a number they mentioned in discovery. Makes it personal.',
    'Use the local Vietnam case study if available. Social proof is powerful.',
    'Be specific. Give them exact next steps with dates. Create momentum.',
  ];
  document.getElementById('pres-notes').textContent = `💬 Speaker note: ${notes[presSlideIdx] || 'Engage the audience and invite questions.'}`;
}

function nextPresSlide() {
  if (presSlideIdx < slides.length - 1) { presSlideIdx++; renderPresSlide(); }
}
function prevPresSlide() {
  if (presSlideIdx > 0) { presSlideIdx--; renderPresSlide(); }
}

document.addEventListener('keydown', e => {
  const overlay = document.getElementById('presentation-overlay');
  if (!overlay.classList.contains('active')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPresSlide();
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevPresSlide();
  if (e.key === 'Escape') exitPresentation();
});

// =====================================================
// 10. INITIALIZATION
// =====================================================
function init() {
  renderSlideList();
  renderSlideCanvas();
  renderPainPoints();
  renderMEDDIC();

  // Welcome toast after short delay
  setTimeout(() => showToast('Workspace ready — Chào mừng đến PresaleX! 👋', '⟡'), 800);
}

init();
