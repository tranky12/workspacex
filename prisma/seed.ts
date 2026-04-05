import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const BUILTIN_SKILLS = [
    {
        name: "MEDDIC Deal Analyzer",
        description: "Score a deal across all 6 MEDDIC dimensions with detailed recommendations for each weak area.",
        icon: "🎯",
        persona: "consultant",
        category: "meddic",
        promptTemplate: `Analyze the following deal using the MEDDIC framework. Score each dimension from 0-5 and provide specific recommendations.

Deal Information:
- Company: {{company}}
- Deal Value: {{deal_value}}
- Solution Type: {{solution}} (TMS/WMS/OMS/Planning)
- Key Contact: {{contact}} ({{contact_role}})
- Pain Points: {{pain_points}}
- Current Situation: {{current_situation}}

Please provide:
1. **Metrics** (0-5): Can they quantify the impact?
2. **Economic Buyer** (0-5): Do we have access to the decision maker?
3. **Decision Criteria** (0-5): Do we know how they will decide?
4. **Decision Process** (0-5): Do we know the process and timeline?
5. **Identify Pain** (0-5): Is the pain clearly defined and urgent?
6. **Champion** (0-5): Do we have an internal champion?

Then give:
- **Overall MEDDIC Score**: X/30 (convert to percentage)
- **Deal Quality**: Strong/Moderate/Weak/Critical
- **Top 3 Actions** to improve each weak dimension
- **Recommended Next Step** for this week`,
        variables: [
            { name: "company", label: "Company Name", type: "text", placeholder: "e.g. Vingroup Logistics", required: true },
            { name: "deal_value", label: "Deal Value", type: "text", placeholder: "e.g. $850,000", required: true },
            { name: "solution", label: "Solution Type", type: "text", placeholder: "e.g. TMS / WMS / OMS / Planning", required: true },
            { name: "contact", label: "Key Contact Name", type: "text", placeholder: "e.g. Nguyễn Văn An", required: false },
            { name: "contact_role", label: "Contact Role", type: "text", placeholder: "e.g. Head of Supply Chain", required: false },
            { name: "pain_points", label: "Pain Points", type: "textarea", placeholder: "e.g. Inventory visibility poor, manual planning, high transportation cost", required: true },
            { name: "current_situation", label: "Current Situation", type: "textarea", placeholder: "e.g. Using Excel for planning, 15 DCs across Vietnam, 500K SKUs", required: false },
        ],
    },
    {
        name: "Proposal Outline Generator",
        description: "Generate a complete 20-slide proposal structure tailored to your client's industry, pain points, and solution.",
        icon: "📐",
        persona: "designer",
        category: "proposal",
        promptTemplate: `Create a complete proposal outline for the following client. Follow McKinsey presentation standards.

Client: {{client_name}} | Industry: {{industry}}
Solution: {{solution}}
Key Pain Points: {{pain_points}}
Budget Range: {{budget}}
Audience: {{audience}} (e.g. CEO, CFO, Head of SC)
Tone: {{tone}} (Executive/Technical/Consultative)

Generate a full 20-slide proposal structure with:
1. **Slide number, title, and purpose** for each slide
2. **Key message** (1 sentence — the "So What?" for executives)
3. **Main content** (2-3 bullet points or visual description)
4. **Speaker notes** (what to say verbally)

Group into sections:
- Opening & Executive Summary (slides 1-3)
- Client Situation & Pain Points (slides 4-6)
- Solution Overview (slides 7-11)
- Implementation Approach (slides 12-15)
- ROI & Business Case (slides 16-17)
- Team & References (slides 18-19)
- Next Steps & Call to Action (slide 20)`,
        variables: [
            { name: "client_name", label: "Client Name", type: "text", placeholder: "e.g. THACO Auto", required: true },
            { name: "industry", label: "Industry", type: "text", placeholder: "e.g. Automotive Distribution", required: true },
            { name: "solution", label: "Solution", type: "text", placeholder: "e.g. WMS + Transportation Management", required: true },
            { name: "pain_points", label: "Pain Points (3-5)", type: "textarea", placeholder: "e.g. Poor inventory accuracy, slow order fulfillment...", required: true },
            { name: "budget", label: "Budget Range", type: "text", placeholder: "e.g. $500K–$1M", required: false },
            { name: "audience", label: "Primary Audience", type: "text", placeholder: "e.g. CEO + Head of Logistics", required: true },
            { name: "tone", label: "Tone", type: "text", placeholder: "Executive / Technical / Consultative", required: false },
        ],
    },
    {
        name: "Pain Point → ROI Converter",
        description: "Transform client pain points into quantified business impact and ROI narrative for executive presentations.",
        icon: "💡",
        persona: "bod",
        category: "pain_point",
        promptTemplate: `Convert the following operational pain points into a compelling ROI story for C-level executives.

Company: {{company}}
Industry: {{industry}}
Annual Revenue: {{revenue}}
Pain Points:
{{pain_points}}

For each pain point, provide:
1. **Current Cost of Problem**: Estimate annual cost in USD (use industry benchmarks)
2. **Root Cause**: What is causing this problem?
3. **Expected Improvement**: % improvement after solution implementation
4. **Annual Value Captured**: USD value of improvement
5. **Payback Period**: How many months to recover investment

Then provide:
- **Total Annual Value**: Sum of all improvements
- **3-Year NPV**: At 10% discount rate
- **Executive Summary** (3 sentences max): For the opening slide — make it compelling for the CEO
- **Risk Warning**: What are the top 2 risks if they do NOTHING`,
        variables: [
            { name: "company", label: "Company Name", type: "text", placeholder: "e.g. Masan Consumer", required: true },
            { name: "industry", label: "Industry", type: "text", placeholder: "e.g. FMCG / Food & Beverage", required: true },
            { name: "revenue", label: "Estimated Annual Revenue", type: "text", placeholder: "e.g. $500M USD", required: false },
            { name: "pain_points", label: "Pain Points (one per line)", type: "textarea", placeholder: "- Inventory accuracy at 75%, target 99%\n- 3-day order processing, target same-day\n- 15% transportation cost, target 10%", required: true },
        ],
    },
    {
        name: "Competitive Objection Handler",
        description: "Prepare winning responses to competitive comparisons and objections during client negotiations.",
        icon: "⚔️",
        persona: "consultant",
        category: "competitive",
        promptTemplate: `Prepare responses to competitive objections for the following deal scenario.

Our Solution: {{our_solution}}
Competitor: {{competitor}}
Client Industry: {{industry}}
Specific Objection raised by client: {{objection}}
Additional Context: {{context}}

Provide:
1. **Acknowledge & Empathize**: How to validate the client's concern without being defensive
2. **Reframe**: How to shift the conversation to our strengths
3. **Proof Points**: 2-3 specific data points, case studies, or references that support our position
4. **Differentiation**: The 3 things we do that {{competitor}} cannot match in Vietnam context
5. **Redirect**: A powerful question to ask the client that shifts focus to their business outcome
6. **Closing Statement**: 2 sentences to end this objection handling conversation strongly

Make all responses specific to Vietnam/SEA market context.`,
        variables: [
            { name: "our_solution", label: "Our Solution", type: "text", placeholder: "e.g. Blue Yonder TMS", required: true },
            { name: "competitor", label: "Competitor", type: "text", placeholder: "e.g. SAP TM / Oracle WMS / Infor", required: true },
            { name: "industry", label: "Client Industry", type: "text", placeholder: "e.g. Retail / FMCG / Manufacturing", required: true },
            { name: "objection", label: "Client Objection", type: "textarea", placeholder: "e.g. SAP is cheaper and our parent company already uses SAP globally...", required: true },
            { name: "context", label: "Additional Context", type: "textarea", placeholder: "e.g. Deal value $800K, client is 3PL, evaluation phase...", required: false },
        ],
    },
    {
        name: "Executive Summary Writer",
        description: "Generate a powerful one-page executive summary from your proposal's key data points.",
        icon: "📋",
        persona: "designer",
        category: "proposal",
        promptTemplate: `Write a compelling executive summary (1 page = ~400 words) for the following proposal.

Client: {{client}}
Our Company: {{our_company}}
Solution: {{solution}}
Project Value: {{project_value}}
Key Benefits: {{key_benefits}}
Implementation Timeline: {{timeline}}
Success References: {{references}}

The executive summary must follow this structure:
1. **Opening Hook** (2 sentences): A powerful statement about the client's challenge and the cost of inaction
2. **Our Understanding** (3-4 sentences): Demonstrate we know their business deeply
3. **Proposed Solution** (4-5 sentences): What we will do and how
4. **Business Impact** (3-4 bullet points): Quantified benefits with numbers
5. **Why Us** (2-3 sentences): Why {{our_company}} is the right partner
6. **Investment & Timeline** (2 sentences): Project value and key milestones
7. **Call to Action** (1-2 sentences): Clear next step

Tone: Executive, confident, specific. No jargon. Write for a CEO who has 90 seconds to read this.`,
        variables: [
            { name: "client", label: "Client Company", type: "text", placeholder: "e.g. Saigon Co.op Distribution", required: true },
            { name: "our_company", label: "Our Company Name", type: "text", placeholder: "e.g. Smartlog", required: true },
            { name: "solution", label: "Solution Summary", type: "text", placeholder: "e.g. End-to-end WMS + Last-mile Optimization", required: true },
            { name: "project_value", label: "Project Value & ROI", type: "text", placeholder: "e.g. $680K investment, 18-month payback, $2.1M 3-year value", required: true },
            { name: "key_benefits", label: "Key Benefits", type: "textarea", placeholder: "- 99.5% inventory accuracy (from 82%)\n- 40% reduction in picking time\n- Real-time visibility across 45 stores", required: true },
            { name: "timeline", label: "Implementation Timeline", type: "text", placeholder: "e.g. 6 months total: 3 months implementation + 3 months stabilization", required: false },
            { name: "references", label: "Relevant References", type: "text", placeholder: "e.g. Similar project: Big C Vietnam (2023), 9-month ROI", required: false },
        ],
    },
]

async function seed() {
    console.log("🌱 Seeding built-in skills...")

    for (const skill of BUILTIN_SKILLS) {
        const existing = await prisma.skill.findFirst({
            where: { name: skill.name, isBuiltin: true },
        })

        if (existing) {
            await prisma.skill.update({
                where: { id: existing.id },
                data: { ...skill, isBuiltin: true },
            })
            console.log(`  ✅ Updated: ${skill.name}`)
        } else {
            await prisma.skill.create({
                data: { ...skill, isBuiltin: true },
            })
            console.log(`  ✅ Created: ${skill.name}`)
        }
    }

    console.log(`\n✨ Done! ${BUILTIN_SKILLS.length} built-in skills seeded.`)
    await prisma.$disconnect()
}

seed().catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
})
