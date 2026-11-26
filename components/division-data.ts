export type Division = {
  slug: string;
  number: string;
  name: string;
  pillar: string;
  summary: string;
  overview: string;
  capabilities: string[];
  deliveryNote: string;
};

export const divisions: Division[] = [
  {
    slug: "design-construction", number: "01", name: "Design & Construction", pillar: "Built Environment",
    summary: "Architectural design, technical coordination and building project delivery.",
    overview: "BABTEK Design & Construction brings together architectural thinking, technical coordination and project-focused delivery across residential, commercial and other built-environment requirements.",
    capabilities: ["Architectural concepts and design development", "Planning and technical drawing coordination", "Structural and building-services design coordination", "Construction planning, supervision and reporting", "CAD drafting and 3D visualisation", "Renovation, maintenance and building project coordination"],
    deliveryNote: "Specialist engineering, statutory submissions and regulated professional work are undertaken with appropriately qualified and registered professionals as required."
  },
  {
    slug: "interiors", number: "02", name: "Interiors", pillar: "Built Environment",
    summary: "Interior architecture, space planning, furniture and finishing solutions.",
    overview: "BABTEK Interiors focuses on the relationship between people, spaces, materials and function, coordinating interior concepts and implementation requirements for different property types.",
    capabilities: ["Interior architecture and space planning", "Residential and commercial interior concepts", "Furniture and custom joinery design coordination", "Ceiling, wall, floor and lighting concepts", "Finishes, furnishing and fit-out coordination", "Interior renovation planning"],
    deliveryNote: "Execution scope, material selection, specialist trades and procurement are agreed for each individual engagement."
  },
  {
    slug: "real-estate", number: "03", name: "Real Estate", pillar: "Built Environment",
    summary: "Property development, consultancy, acquisition and investment opportunities.",
    overview: "BABTEK Real Estate explores property-related opportunities and coordinates suitable professional input for development, property advisory and real-estate transactions.",
    capabilities: ["Property development concepts", "Property acquisition and disposal coordination", "Real-estate consultancy and opportunity assessment", "Residential and commercial property concepts", "Development feasibility coordination", "Property management opportunities"],
    deliveryNote: "Property listings, agency activities, legal due diligence and regulated transactions require appropriate verification and authorised professionals."
  },
  {
    slug: "smart-solutions", number: "04", name: "Smart Solutions", pillar: "Technology & Innovation",
    summary: "Software, automation, digital transformation and professional technology.",
    overview: "BABTEK Smart Solutions is the technology division focused on digital products, software development, automation and practical technology for professional and enterprise workflows.",
    capabilities: ["Custom software and web application development", "Business process automation", "AEC and CAD workflow tools", "Digital transformation and system integration", "AI-enabled workflow exploration", "Proprietary product development"],
    deliveryNote: "Product concepts and development initiatives are clearly distinguished from commercially released products. Availability is confirmed individually."
  },
  {
    slug: "academy", number: "05", name: "Academy", pillar: "Business & Enterprise Development",
    summary: "Technical learning, CAD, BIM, visualisation and professional development.",
    overview: "BABTEK Academy is the planned learning and professional-development arm, with an emphasis on practical digital, design and built-environment skills.",
    capabilities: ["AutoCAD and architectural drafting learning", "2D documentation and 3D modelling", "Revit and BIM learning pathways", "Design visualisation and presentation", "CAD automation and digital workflows", "Professional workshops and development"],
    deliveryNote: "Course schedules, instructors, accreditation and enrolment availability will be published only when confirmed."
  },
  {
    slug: "ventures", number: "06", name: "Ventures", pillar: "Business & Enterprise Development",
    summary: "Strategic partnerships, business development and venture opportunities.",
    overview: "BABTEK Ventures explores opportunities for collaboration, commercial development, investment initiatives and the incubation of promising products and services.",
    capabilities: ["Strategic business development", "Joint venture exploration", "Product and venture incubation", "Commercial partnership development", "Market and opportunity assessment", "Startup and enterprise collaboration"],
    deliveryNote: "Investment proposals and joint ventures are subject to due diligence, formal agreements and applicable regulatory requirements."
  },
  {
    slug: "products-supply", number: "07", name: "Products & Supply", pillar: "Business & Enterprise Development",
    summary: "Building products, materials, procurement and equipment sourcing.",
    overview: "BABTEK Products & Supply is intended to coordinate sourcing and supply opportunities for construction, property, interiors and related business requirements.",
    capabilities: ["Building and construction material sourcing", "Interior finishes and fittings", "Furniture and architectural products", "Electrical and plumbing supply coordination", "Equipment sourcing", "Procurement support"],
    deliveryNote: "Product availability, supplier authorisation, specifications, delivery terms and pricing are confirmed per quotation."
  },
  {
    slug: "research-innovation", number: "08", name: "Research & Innovation", pillar: "Technology & Innovation",
    summary: "Sustainable systems, smart buildings, research and emerging technologies.",
    overview: "BABTEK Research & Innovation supports the wider enterprise by exploring emerging ideas, technologies and methods relevant to the built environment and digital business.",
    capabilities: ["Sustainable building systems research", "Smart building technologies", "Construction automation exploration", "Building performance and energy efficiency", "Innovative materials and methods", "AEC technology and applied research"],
    deliveryNote: "Research themes are areas of exploration and should not be interpreted as certified products, tested services or completed research outcomes unless specifically documented."
  }
];
