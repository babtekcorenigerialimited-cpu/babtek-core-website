-- Restore the full company-profile service catalogue as published, partner-coordinated CMS records.
-- These are published service areas, not claims of a fully staffed in-house division.
update public.divisions set pillar='Business & Enterprise Development', description='Education, technical training and professional development.' where slug='academy';
update public.divisions set pillar='Business & Enterprise Development', description='Commercial supply and distribution for the built environment.' where slug='products-supply';
update public.divisions set description='Architecture, engineering and construction delivery.' where slug='design-construction';
update public.divisions set description='Interior architecture, interior design and furniture.' where slug='interiors';
update public.divisions set description='Property development, investment and real estate services.' where slug='real-estate';
update public.divisions set description='Software, digital technology, automation and artificial intelligence.' where slug='smart-solutions';
update public.divisions set description='Investment, entrepreneurship and business development.' where slug='ventures';
update public.divisions set description='Research, development and applied innovation.' where slug='research-innovation';

with catalogue(division_slug,slug,name,summary,description,display_order) as (values
('design-construction','architectural-design','Architectural Design','Architectural concepts, design development, planning and technical documentation.','Architectural design, concept development, planning and technical documentation.',1),
('design-construction','structural-engineering','Structural Engineering Coordination','Structural analysis, engineering coordination and detailing.','Structural engineering coordination, analysis and detailing.',2),
('design-construction','building-services-design','Mechanical, Electrical & Plumbing Design','Building-services design coordination covering MEP, drainage, HVAC and fire protection.','Mechanical, electrical, plumbing, drainage, HVAC and fire-protection design coordination.',3),
('design-construction','construction-delivery','Construction, Renovation & Maintenance','Residential, commercial and industrial construction, renovation and maintenance coordination.','Residential, commercial and industrial construction, renovation and maintenance.',4),
('design-construction','construction-management','Construction Supervision & Project Management','Planning, scheduling, supervision, quality control and project reporting.','Construction supervision, project planning, scheduling, quality control and reporting.',5),
('design-construction','cad-drafting-visualisation','CAD Drafting & 3D Visualisation','Working drawings, shop drawings, as-built documentation and 3D visualisation.','CAD drafting, working drawings, shop drawings, as-built documentation and 3D visualization.',6),
('interiors','interior-space-planning','Interior Space Planning','Residential, commercial, office, hospitality and healthcare space planning.','Space planning and residential, commercial, office, hospitality and healthcare interiors.',1),
('interiors','furniture-joinery-design','Furniture & Joinery Design','Furniture design, custom joinery, kitchens and wardrobes.','Furniture design, custom joinery, kitchens and wardrobes.',2),
('interiors','interior-elements-lighting','Ceiling, Wall, Floor & Lighting Design','Interior elements and lighting concepts coordinated with the overall design.','Ceiling, wall, floor and lighting design.',3),
('interiors','interior-fitout-finishes','Interior Fit-out & Finishes','Interior renovation, finishes, furnishing and execution coordination.','Interior renovation, finishes, furnishing and execution.',4),
('real-estate','property-development','Property Development','Property development opportunities across land, residential and commercial assets.','Property development, land, residential and commercial development.',1),
('real-estate','property-acquisition-sales-leasing','Property Acquisition, Sales & Leasing','Property acquisition, sales, leasing and transaction coordination.','Property development, acquisition, sales, leasing and management.',2),
('real-estate','property-management','Property Management','Property management opportunities and related coordination.','Property management.',3),
('real-estate','real-estate-investment-consultancy','Real Estate Investment & Consultancy','Real estate investment and consultancy services.','Real estate investment and consultancy.',4),
('real-estate','feasibility-studies','Property Feasibility Studies','Feasibility studies and collaboration with owners, investors and developers.','Property feasibility studies and collaboration with owners, investors and developers.',5),
('smart-solutions','custom-software-development','Custom Software Development','Custom software, web and mobile application development.','Custom software, web and mobile application development.',1),
('smart-solutions','business-automation','Business Automation & Digital Transformation','Business automation, digital transformation and enterprise solutions.','Business automation, digital transformation and enterprise solutions.',2),
('smart-solutions','aec-bim-cad-technology','AEC, BIM & CAD Technology','AEC technology, BIM-related workflows and CAD automation.','AEC technology, BIM-related workflows and CAD automation.',3),
('smart-solutions','api-system-integration','API & System Integration','API integrations, digital workflow development and AI-enabled solutions.','API and system integrations, digital workflow development and AI-enabled solutions.',4),
('smart-solutions','proprietary-platform-development','Proprietary Platforms & Productivity Tools','Development of proprietary platforms and productivity tools.','Development of proprietary platforms and productivity tools.',5),
('academy','autocad-architectural-drafting','AutoCAD & Architectural Drafting','Technical learning in AutoCAD and architectural drafting.','AutoCAD and architectural drafting.',1),
('academy','2d-3d-modelling','2D Documentation & 3D Modelling','Learning pathways for 2D documentation and 3D modelling.','2D documentation and 3D modelling.',2),
('academy','revit-bim-cad-automation','Revit, BIM & CAD Automation','Learning in Revit, BIM, CAD automation and construction documentation.','Revit, BIM, CAD automation and construction documentation.',3),
('academy','digital-design-workshops','Digital Design & Software Workshops','Digital design, software development workshops and professional programmes.','Digital design, software development workshops and professional programmes.',4),
('ventures','strategic-investments-ventures','Strategic Investments & Commercial Ventures','Strategic investments, commercial ventures and product development opportunities.','Strategic investments, commercial ventures and product development.',1),
('ventures','partnership-incubation-joint-ventures','Partnership Incubation & Joint Ventures','Partnership incubation, joint ventures and startup collaboration.','Partnership incubation, joint ventures and startup collaboration.',2),
('ventures','business-development-market-exploration','Business Development & Market Exploration','Business development, market exploration and strategic partnerships.','Business development, market exploration and strategic partnerships.',3),
('products-supply','building-construction-materials','Building & Construction Materials','Building and construction materials sourcing and supply coordination.','Building and construction materials.',1),
('products-supply','interior-finishes-furniture-fittings','Interior Finishes, Furniture & Fittings','Interior finishes, furniture, fittings and architectural products.','Interior finishes, furniture, fittings and architectural products.',2),
('products-supply','electrical-plumbing-materials','Electrical & Plumbing Materials','Electrical and plumbing materials sourcing and supply coordination.','Electrical and plumbing materials.',3),
('products-supply','equipment-sourcing-procurement','Equipment Sourcing & Procurement','Equipment sourcing, procurement and general building supplies.','Equipment sourcing, procurement and general building supplies.',4),
('research-innovation','sustainable-construction-systems','Sustainable Construction Systems','Research into advanced construction methods and sustainable building systems.','Advanced construction methods and sustainable building systems.',1),
('research-innovation','smart-buildings-energy-efficiency','Smart Buildings & Energy Efficiency','Research into smart buildings, energy efficiency and innovative materials.','Smart buildings, energy efficiency and innovative materials.',2),
('research-innovation','ai-construction-automation','AI & Construction Automation','Exploration of artificial intelligence, construction automation and digital architecture.','Artificial intelligence, construction automation and digital architecture.',3),
('research-innovation','applied-technology-research','Applied Technology Research','Research that informs services, processes and new technology products.','Research that informs services, processes and new technology products.',4)
)
insert into public.services(division_id,slug,name,summary,description,delivery_model,lifecycle,visibility,display_order)
select d.id,c.slug,c.name,c.summary,c.description,'partner_coordinated','developing','published',c.display_order
from catalogue c join public.divisions d on d.slug=c.division_slug
on conflict(slug) do update set division_id=excluded.division_id,name=excluded.name,summary=excluded.summary,
description=excluded.description,delivery_model=excluded.delivery_model,lifecycle=excluded.lifecycle,
visibility=excluded.visibility,display_order=excluded.display_order;
