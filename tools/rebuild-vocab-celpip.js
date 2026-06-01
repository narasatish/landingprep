#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'content', 'learning-hub');
const now = new Date().toISOString().slice(0,10);

function write(exam, section, data) {
  const dir = path.join(BASE, exam);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, section + '.json');
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('wrote', file);
}

const celpipVocab = {
  exam: 'CELPIP',
  section: 'vocabulary',
  lastUpdated: now,
  topicCount: 10,
  topics: [
    {
      topic: 'Workplace Communication',
      items: [
        { word: 'colleague', meaning: 'A person you work with in the same organization.', example: 'My colleague helped me prepare the quarterly report.', usageNote: 'More formal than "coworker." Common in CELPIP workplace scenarios.', difficulty: 'beginner' },
        { word: 'agenda', meaning: 'A list of items to be discussed at a meeting.', example: 'Could you send me the agenda before tomorrow\'s meeting?', usageNote: 'Also means a hidden motive. Context determines meaning.', difficulty: 'beginner' },
        { word: 'deadline', meaning: 'The latest time or date by which something must be completed.', example: 'We need to submit the proposal before the deadline on Friday.', usageNote: 'Collocations: miss a deadline, meet a deadline, extend a deadline.', difficulty: 'beginner' },
        { word: 'overtime', meaning: 'Time worked beyond regular working hours, often paid at a higher rate.', example: 'The project required working overtime for two weeks straight.', usageNote: 'Common CELPIP listening topic — workplace negotiations.', difficulty: 'beginner' },
        { word: 'résumé', meaning: 'A document listing qualifications, experience, and skills for a job application.', example: 'She updated her résumé to include her volunteer work at the community centre.', usageNote: 'Canadian spelling: résumé. Related: CV (curriculum vitae).', difficulty: 'beginner' },
        { word: 'supervisor', meaning: 'A person who oversees and directs the work of other employees.', example: 'He asked his supervisor for feedback before submitting the final report.', usageNote: 'Related: manage, oversee, report to.', difficulty: 'beginner' },
        { word: 'initiative', meaning: 'The ability to act without being told; a new plan or program.', example: 'The manager praised her for taking the initiative to streamline the filing system.', usageNote: 'Collocations: take the initiative, show initiative.', difficulty: 'intermediate' },
        { word: 'maternity leave', meaning: 'A period of absence from work granted to a mother before and after childbirth.', example: 'She took 12 months of maternity leave, which is protected under Canadian law.', usageNote: 'Canada-specific: parental leave can be shared between parents.', difficulty: 'intermediate' },
        { word: 'performance review', meaning: 'A formal evaluation of an employee\'s work output and behavior.', example: 'Her annual performance review resulted in a promotion and salary increase.', usageNote: 'Also called "annual review" or "appraisal."', difficulty: 'intermediate' },
        { word: 'grievance', meaning: 'A formal complaint about unfair treatment in the workplace.', example: 'He filed a grievance with HR after being passed over for promotion without explanation.', usageNote: 'Key term in labour relations. Related: arbitration, union representation.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Canadian Life & Society',
      items: [
        { word: 'multiculturalism', meaning: 'A policy that affirms multiple cultural traditions coexisting in society.', example: 'Canada\'s multiculturalism policy is enshrined in the Canadian Multiculturalism Act of 1988.', usageNote: 'A defining feature of Canadian identity. CELPIP essays frequently ask about this.', difficulty: 'intermediate' },
        { word: 'province', meaning: 'One of the ten major administrative divisions of Canada.', example: 'Ontario is the most populous province in Canada.', usageNote: 'Canada: 10 provinces + 3 territories (different legal status).', difficulty: 'beginner' },
        { word: 'Indigenous', meaning: 'Referring to the First Nations, Métis, and Inuit peoples of Canada.', example: 'Reconciliation with Indigenous communities is a key issue in Canadian politics.', usageNote: 'Capitalize always. Preferred over "Aboriginal" in current usage.', difficulty: 'intermediate' },
        { word: 'bilingual', meaning: 'Able to speak two languages; relating to the use of two languages.', example: 'Federal government jobs often require bilingual candidates in both English and French.', usageNote: 'Canada is officially bilingual: English and French.', difficulty: 'intermediate' },
        { word: 'community centre', meaning: 'A local facility offering recreational and social programs to residents.', example: 'The community centre runs ESL classes every Tuesday and Thursday evening.', usageNote: 'Canadian spelling: centre (not center). Common CELPIP listening setting.', difficulty: 'beginner' },
        { word: 'transit', meaning: 'Public transportation systems such as buses, subways, and light rail.', example: 'Taking transit to work is cheaper and more environmentally friendly than driving.', usageNote: 'Short for "public transit." Common in CELPIP urban living scenarios.', difficulty: 'beginner' },
        { word: 'universal healthcare', meaning: 'A system in which all residents receive medical care regardless of ability to pay.', example: 'Canada\'s universal healthcare is funded through taxes at the provincial level.', usageNote: 'CELPIP writing prompt topic. Covered by provincial health cards.', difficulty: 'intermediate' },
        { word: 'neighbourhood', meaning: 'A district or community within a city or town.', example: 'We moved to a quiet neighbourhood with good schools and a short commute.', usageNote: 'Canadian/British spelling: neighbourhood. US: neighborhood.', difficulty: 'beginner' },
        { word: 'civic engagement', meaning: 'Active participation in the political and social life of one\'s community.', example: 'Voting in local elections is a fundamental form of civic engagement.', usageNote: 'Common CELPIP essay topic. Related: volunteerism, advocacy.', difficulty: 'intermediate' },
        { word: 'commute', meaning: 'The regular journey between home and work or school.', example: 'Her commute takes 45 minutes each way on the subway.', usageNote: 'As a noun or verb. Commuter = person who commutes regularly.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Healthcare & Wellness',
      items: [
        { word: 'prescription', meaning: 'A doctor\'s written instruction for a patient\'s medication.', example: 'You will need a prescription from your doctor before the pharmacy can fill that medication.', usageNote: 'Related: prescribe (verb), over-the-counter (no prescription needed).', difficulty: 'beginner' },
        { word: 'referral', meaning: 'A recommendation by a physician to consult a specialist.', example: 'The family doctor gave him a referral to a cardiologist for further testing.', usageNote: 'Common in CELPIP listening: doctor\'s office conversations.', difficulty: 'intermediate' },
        { word: 'coverage', meaning: 'The extent of insurance or government health plan protection.', example: 'Her provincial health coverage does not include dental or vision care.', usageNote: 'Related: insured, deductible, premium.', difficulty: 'intermediate' },
        { word: 'clinic', meaning: 'A medical facility for outpatient care and treatment.', example: 'She visited the walk-in clinic because her family doctor was unavailable.', usageNote: 'Walk-in clinics are common in Canada for non-emergency care.', difficulty: 'beginner' },
        { word: 'chronic', meaning: 'Persisting for a long time; recurring.', example: 'Managing chronic back pain required a combination of physiotherapy and medication.', usageNote: 'Contrast: acute (sudden, short-term). Chronic conditions need long-term management.', difficulty: 'intermediate' },
        { word: 'physiotherapy', meaning: 'Treatment of injury or disease through physical methods such as exercise and massage.', example: 'After knee surgery, he attended physiotherapy sessions twice a week.', usageNote: 'US term: physical therapy (PT). Common CELPIP healthcare vocabulary.', difficulty: 'intermediate' },
        { word: 'diagnosis', meaning: 'Identification of a disease or condition from its signs and symptoms.', example: 'Early diagnosis of diabetes can significantly improve long-term health outcomes.', usageNote: 'Plural: diagnoses. Verb: diagnose.', difficulty: 'intermediate' },
        { word: 'vaccination', meaning: 'Injection of a weakened pathogen to stimulate immune protection against disease.', example: 'Annual flu vaccination is recommended for seniors and healthcare workers.', usageNote: 'Synonyms: immunization, shot, inoculation.', difficulty: 'intermediate' },
        { word: 'symptom', meaning: 'A physical or mental sign indicating the presence of a condition.', example: 'Common symptoms of strep throat include a sore throat and difficulty swallowing.', usageNote: 'Related: sign (observable by doctor) vs. symptom (felt by patient).', difficulty: 'beginner' },
        { word: 'well-being', meaning: 'The state of being comfortable, healthy, and content.', example: 'Regular physical activity contributes significantly to mental and physical well-being.', usageNote: 'Hyphenated. Encompasses physical, mental, and social health.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Everyday Situations',
      items: [
        { word: 'complaint', meaning: 'An expression of dissatisfaction about something.', example: 'She filed a complaint with the landlord about the broken heating system.', usageNote: 'CELPIP writing often asks you to write a complaint letter.', difficulty: 'beginner' },
        { word: 'lease', meaning: 'A contract granting use of property for a specified time in exchange for rent.', example: 'The apartment lease requires 60 days\' notice before moving out.', usageNote: 'Related: landlord, tenant, sublease, renewal.', difficulty: 'intermediate' },
        { word: 'warranty', meaning: 'A written guarantee to repair or replace a product within a specified period.', example: 'The laptop came with a two-year manufacturer\'s warranty against defects.', usageNote: 'Related: guarantee, extended warranty, claim.', difficulty: 'intermediate' },
        { word: 'budget', meaning: 'A financial plan estimating income and expenditure over a period.', example: 'They set a strict budget to save for a down payment on a house.', usageNote: 'As a verb: "to budget." As an adjective: "budget-friendly."', difficulty: 'beginner' },
        { word: 'amenity', meaning: 'A useful or desirable feature of a place or facility.', example: 'The condo offers amenities including a gym, pool, and rooftop terrace.', usageNote: 'Plural: amenities. Common in real estate descriptions.', difficulty: 'intermediate' },
        { word: 'etiquette', meaning: 'The customary rules of polite behaviour in a society or group.', example: 'Understanding local etiquette helps newcomers integrate more smoothly.', usageNote: 'CELPIP topic: social norms in Canada (queuing, tipping, punctuality).', difficulty: 'intermediate' },
        { word: 'negotiate', meaning: 'To discuss and reach an agreement through compromise.', example: 'She successfully negotiated a lower monthly rent with the property manager.', usageNote: 'Related: negotiation, negotiable, compromise.', difficulty: 'intermediate' },
        { word: 'maintenance', meaning: 'The process of keeping a building or machine in good condition.', example: 'The building superintendent handles all routine maintenance requests.', usageNote: 'Related: upkeep, repair, janitor/superintendent (Canadian usage).', difficulty: 'intermediate' },
        { word: 'utilities', meaning: 'Services such as electricity, gas, water, and internet supplied to a property.', example: 'The rent is $1,800 per month with utilities included.', usageNote: 'Common in CELPIP housing ads and email writing tasks.', difficulty: 'beginner' },
        { word: 'appliance', meaning: 'A household device powered by electricity to perform a specific task.', example: 'The landlord replaced the broken appliance within 48 hours.', usageNote: 'Examples: refrigerator, dishwasher, washing machine, microwave.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Education & Learning',
      items: [
        { word: 'curriculum', meaning: 'The subjects and courses offered by an educational institution.', example: 'The school board revised the curriculum to include more STEM subjects.', usageNote: 'Plural: curricula or curriculums.', difficulty: 'intermediate' },
        { word: 'assessment', meaning: 'Evaluation of a student\'s knowledge, skills, or understanding.', example: 'Formative assessment helps teachers adjust instruction during a unit.', usageNote: 'Types: formative (ongoing) vs. summative (final).', difficulty: 'intermediate' },
        { word: 'literacy', meaning: 'The ability to read and write; competence in a particular area.', example: 'Improving digital literacy is a priority in the new provincial education strategy.', usageNote: 'Extended meanings: financial literacy, health literacy, media literacy.', difficulty: 'intermediate' },
        { word: 'enrol', meaning: 'To officially register as a student at an educational institution.', example: 'Students must enrol in courses before the registration deadline.', usageNote: 'Canadian spelling: enrol (one l). US: enroll.', difficulty: 'beginner' },
        { word: 'accreditation', meaning: 'Official recognition that an institution meets required academic standards.', example: 'The nursing program recently received national accreditation.', usageNote: 'Accredited credentials are essential for regulated professions in Canada.', difficulty: 'advanced' },
        { word: 'scholarship', meaning: 'Financial support awarded to a student based on academic merit or need.', example: 'She won a merit-based scholarship covering full tuition for four years.', usageNote: 'Distinguish from bursary (need-based) and loan (must be repaid).', difficulty: 'beginner' },
        { word: 'co-op program', meaning: 'An educational program alternating classroom study with paid work terms.', example: 'The engineering co-op program gives students four months of industry experience.', usageNote: 'Common in Canadian post-secondary education. Improves employability.', difficulty: 'intermediate' },
        { word: 'grade point average', meaning: 'A numerical measure of a student\'s academic achievement (GPA).', example: 'Maintaining a GPA above 3.0 is required to keep the scholarship.', usageNote: 'Abbreviated GPA. Canadian grading scales vary by institution.', difficulty: 'beginner' },
        { word: 'tutor', meaning: 'A private teacher who gives individual instruction.', example: 'She hired a math tutor to help her son prepare for final exams.', usageNote: 'As a verb: "to tutor someone."', difficulty: 'beginner' },
        { word: 'peer review', meaning: 'Evaluation of academic work by others working in the same field.', example: 'All articles in this journal undergo rigorous peer review before publication.', usageNote: 'Key concept in academic integrity.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Environment & Community',
      items: [
        { word: 'recycling', meaning: 'Converting waste into reusable material.', example: 'Most Canadian municipalities have blue box programs for recycling household waste.', usageNote: 'CELPIP writing prompt topic. Related: composting, landfill, zero waste.', difficulty: 'beginner' },
        { word: 'green space', meaning: 'An area of grass, trees, or other vegetation set amid largely urban surroundings.', example: 'Preserving green spaces in cities improves air quality and resident well-being.', usageNote: 'CELPIP opinion essay topic.', difficulty: 'intermediate' },
        { word: 'composting', meaning: 'Decomposing organic waste into fertilizer.', example: 'The city provides green bins for composting food scraps and yard waste.', usageNote: 'Common in Canadian municipal waste management.', difficulty: 'beginner' },
        { word: 'bylaws', meaning: 'Rules made by a municipality governing conduct in public spaces.', example: 'The city bylaws prohibit excessive noise after 11 PM in residential areas.', usageNote: 'Canadian spelling. Related: bylaw enforcement, noise complaint.', difficulty: 'intermediate' },
        { word: 'volunteer', meaning: 'A person who freely offers to work without being paid.', example: 'She volunteers at the food bank every Saturday morning.', usageNote: 'Volunteering is highly valued in Canadian culture and on job applications.', difficulty: 'beginner' },
        { word: 'sustainability', meaning: 'The ability to be maintained long-term without depleting resources.', example: 'The city\'s sustainability plan aims to reduce carbon emissions by 40% by 2030.', usageNote: 'Related: sustainable development, renewable energy, green building.', difficulty: 'intermediate' },
        { word: 'petition', meaning: 'A formal written request signed by many people to an authority.', example: 'Residents organized a petition against the proposed highway expansion.', usageNote: 'Common CELPIP writing task: responding to community issues.', difficulty: 'intermediate' },
        { word: 'infrastructure', meaning: 'The basic physical structures needed for a society to function.', example: 'Aging infrastructure such as bridges and water pipes requires urgent investment.', usageNote: 'Common CELPIP essay topic.', difficulty: 'intermediate' },
        { word: 'carpool', meaning: 'An arrangement by which several commuters travel together in one vehicle.', example: 'Carpooling to work three days a week cuts his fuel costs significantly.', usageNote: 'As a verb: "to carpool." Related: ride-sharing, transit pass.', difficulty: 'beginner' },
        { word: 'zoning', meaning: 'The regulation of land use by local government.', example: 'The area was rezoned to allow mixed residential and commercial development.', usageNote: 'CELPIP listening topic in municipal planning contexts.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Technology & Media',
      items: [
        { word: 'social media', meaning: 'Websites and apps enabling users to create and share content or participate in networking.', example: 'Social media has transformed how Canadians access and share news.', usageNote: 'CELPIP opinion writing topic.', difficulty: 'beginner' },
        { word: 'privacy', meaning: 'The right to keep personal information confidential.', example: 'Many Canadians are concerned about privacy in the age of data-driven advertising.', usageNote: 'Related: data privacy, privacy policy, PIPEDA (Canada\'s privacy law).', difficulty: 'intermediate' },
        { word: 'remote work', meaning: 'Working from a location outside the traditional office, typically from home.', example: 'Remote work options have become standard practice at many Canadian companies.', usageNote: 'CELPIP essay topic. Synonyms: work from home (WFH), telecommuting.', difficulty: 'beginner' },
        { word: 'cybersecurity', meaning: 'The practice of protecting systems and networks from digital attacks.', example: 'The company invested heavily in cybersecurity after a major data breach.', usageNote: 'CELPIP listening topic. Related: phishing, malware, two-factor authentication.', difficulty: 'advanced' },
        { word: 'digital literacy', meaning: 'The ability to use technology and evaluate digital information effectively.', example: 'Schools are incorporating digital literacy into curricula starting in Grade 1.', usageNote: 'Key skill for immigrants and workers adapting to Canadian workplaces.', difficulty: 'intermediate' },
        { word: 'algorithm', meaning: 'A set of rules followed by a computer to solve a problem.', example: 'Social media algorithms determine what content users see in their feeds.', usageNote: 'Relevant in AI, search engines, and content recommendation discussions.', difficulty: 'advanced' },
        { word: 'streaming', meaning: 'Receiving audio or video content over the internet in real time.', example: 'Many Canadians have replaced cable TV with streaming services.', usageNote: 'Related: on-demand, subscription, buffering.', difficulty: 'beginner' },
        { word: 'automation', meaning: 'The use of technology to perform tasks with minimal human intervention.', example: 'Automation in manufacturing has raised concerns about job displacement.', usageNote: 'CELPIP opinion essay topic. Related: artificial intelligence, robotics.', difficulty: 'intermediate' },
        { word: 'bandwidth', meaning: 'The capacity of a network connection to transmit data.', example: 'Streaming 4K video requires significantly more bandwidth than browsing websites.', usageNote: 'Colloquially: "I don\'t have the bandwidth for this" means lack of capacity/time.', difficulty: 'intermediate' },
        { word: 'app', meaning: 'A software application designed for use on a mobile device or computer.', example: 'The city launched an app that allows residents to report potholes and graffiti.', usageNote: 'Short for "application." Common in everyday Canadian speech.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Housing & Real Estate',
      items: [
        { word: 'down payment', meaning: 'An initial payment made when purchasing a home, with the balance covered by a mortgage.', example: 'Saving a 20% down payment helps avoid mortgage insurance fees in Canada.', usageNote: 'CMHC insurance required for down payments under 20%.', difficulty: 'intermediate' },
        { word: 'mortgage', meaning: 'A loan taken to purchase property, secured against the property itself.', example: 'They secured a five-year fixed-rate mortgage at 4.5% interest.', usageNote: 'Types: fixed-rate, variable-rate, open, closed.', difficulty: 'intermediate' },
        { word: 'deposit', meaning: 'A sum paid as an initial installment or guarantee.', example: 'The landlord required a damage deposit equal to half a month\'s rent.', usageNote: 'Tenant rights on deposits vary by province.', difficulty: 'beginner' },
        { word: 'property tax', meaning: 'A tax levied by municipalities on the assessed value of owned property.', example: 'Property taxes in the city rose 4% this year to fund school and transit upgrades.', usageNote: 'Paid annually by homeowners.', difficulty: 'intermediate' },
        { word: 'renovation', meaning: 'The process of improving a building by making significant changes.', example: 'The renovation included a new kitchen, updated bathrooms, and fresh flooring.', usageNote: 'Related: reno (informal), contractor, permit.', difficulty: 'beginner' },
        { word: 'vacancy', meaning: 'An available rental unit; the rate of unoccupied rental units in a market.', example: 'The vacancy rate in Vancouver is under 1%, making it extremely difficult to find rentals.', usageNote: 'Low vacancy rate = tight rental market.', difficulty: 'intermediate' },
        { word: 'strata', meaning: 'A form of property ownership for condominiums in western Canada.', example: 'The strata fee covers building insurance, garbage removal, and common area maintenance.', usageNote: 'BC and Alberta terminology. Ontario uses "condominium corporation."', difficulty: 'advanced' },
        { word: 'listing', meaning: 'A property advertised for sale or rent.', example: 'She found the listing on MLS and booked a viewing immediately.', usageNote: 'MLS = Multiple Listing Service, Canada\'s national real estate database.', difficulty: 'beginner' },
        { word: 'detached house', meaning: 'A free-standing residential building not connected to any other building.', example: 'Detached houses in Toronto\'s suburbs are more affordable than downtown condos.', usageNote: 'Types: detached, semi-detached, townhouse, condo.', difficulty: 'beginner' },
        { word: 'appraisal', meaning: 'A professional assessment of a property\'s market value.', example: 'The bank ordered an independent appraisal before approving the mortgage.', usageNote: 'Distinct from home inspection (checks condition, not value).', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Food & Dining',
      items: [
        { word: 'cuisine', meaning: 'A style or method of cooking characteristic of a particular country or region.', example: 'Toronto\'s diverse cuisine reflects its multicultural population.', usageNote: 'Common CELPIP speaking topic: favourite foods and restaurants.', difficulty: 'beginner' },
        { word: 'gratuity', meaning: 'A tip or extra payment given to service staff as a reward for good service.', example: 'A gratuity of 15–20% is customary in Canadian restaurants.', usageNote: 'Synonyms: tip, service charge. Understanding tipping culture is important for newcomers.', difficulty: 'intermediate' },
        { word: 'dietary restriction', meaning: 'A limitation on the foods a person can eat due to health, religion, or personal choice.', example: 'The restaurant clearly labels menu items to accommodate common dietary restrictions.', usageNote: 'Examples: gluten-free, halal, kosher, vegan, nut-free.', difficulty: 'intermediate' },
        { word: 'locally sourced', meaning: 'Obtained from nearby farms or producers rather than shipped from a distance.', example: 'The farm-to-table restaurant uses locally sourced ingredients from within 100 kilometres.', usageNote: 'Related: farm-to-table, food miles, sustainability.', difficulty: 'intermediate' },
        { word: 'expiry date', meaning: 'The date after which a food product should not be used.', example: 'Always check the expiry date before purchasing dairy products.', usageNote: 'Canadian term. US: expiration date. Related: best before date.', difficulty: 'beginner' },
        { word: 'takeout', meaning: 'Food prepared by a restaurant for eating elsewhere.', example: 'After a long shift, they ordered takeout instead of cooking dinner.', usageNote: 'Canadian/US: takeout. British: takeaway.', difficulty: 'beginner' },
        { word: 'food bank', meaning: 'A charitable organization that collects and distributes food to people in need.', example: 'Thousands of families rely on food banks during periods of financial hardship.', usageNote: 'Key social institution in Canada. CELPIP writing topic: community support.', difficulty: 'beginner' },
        { word: 'potluck', meaning: 'A shared meal where each guest contributes a dish.', example: 'The office potluck brought together dishes from many different cultural traditions.', usageNote: 'Common in Canadian social culture. Good CELPIP speaking example of community.', difficulty: 'beginner' },
        { word: 'organic', meaning: 'Produced without the use of synthetic pesticides or fertilizers.', example: 'Many Canadians prefer organic produce despite its higher cost.', usageNote: 'Regulated by the Canadian Food Inspection Agency (CFIA).', difficulty: 'beginner' },
        { word: 'portion size', meaning: 'The amount of food served or consumed in one sitting.', example: 'Restaurant portion sizes in Canada are often larger than in Europe.', usageNote: 'Common in health and wellness discussions.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Travel & Transportation',
      items: [
        { word: 'itinerary', meaning: 'A detailed plan or route of a journey.', example: 'She emailed the travel agency a copy of her itinerary before departure.', usageNote: 'CELPIP writing task: email about travel plans.', difficulty: 'intermediate' },
        { word: 'layover', meaning: 'A period of rest at an intermediate stop during a journey.', example: 'The cheapest flight included an eight-hour layover in Toronto.', usageNote: 'Synonym: stopover. A layover under 24 hours; stopover can be longer.', difficulty: 'intermediate' },
        { word: 'customs', meaning: 'The official process of checking goods and people entering a country.', example: 'All international travellers must declare goods at customs upon entering Canada.', usageNote: 'Related: border security, CBSA, declaration form.', difficulty: 'beginner' },
        { word: 'transit pass', meaning: 'A card granting unlimited travel on public transportation for a set period.', example: 'A monthly transit pass is far cheaper than paying for individual rides.', usageNote: 'Examples: Presto (Ontario), Compass Card (BC), Opus (Montreal).', difficulty: 'beginner' },
        { word: 'fare', meaning: 'The price charged for public transportation.', example: 'Student fares are available on all OC Transpo routes with a valid student ID.', usageNote: 'Bus fare, train fare, cab fare. Distinct from "fee" (for services).', difficulty: 'beginner' },
        { word: 'accommodation', meaning: 'A place to stay, especially when travelling.', example: 'She booked accommodation at a bed and breakfast in Banff.', usageNote: 'Canadian/British spelling (double c, double m).', difficulty: 'beginner' },
        { word: 'visa', meaning: 'An endorsement on a passport permitting entry into a country.', example: 'Visitors from many countries need a visa or Electronic Travel Authorization to enter Canada.', usageNote: 'Related: ETA, work permit, study permit.', difficulty: 'beginner' },
        { word: 'direct flight', meaning: 'A flight that goes from one airport to another without a change of aircraft.', example: 'Taking a direct flight saves several hours compared to routes with connections.', usageNote: 'Note: direct ≠ nonstop (direct may have stops but no plane change).', difficulty: 'beginner' },
        { word: 'road trip', meaning: 'A long journey undertaken in a vehicle by road.', example: 'They drove from Vancouver to Calgary on a summer road trip along the Trans-Canada.', usageNote: 'Popular Canadian leisure activity given vast geography.', difficulty: 'beginner' },
        { word: 'park-and-ride', meaning: 'A system where commuters drive to a transit hub and then take public transportation.', example: 'The park-and-ride facility reduces traffic congestion downtown.', usageNote: 'Common solution in Canadian suburban transit planning.', difficulty: 'intermediate' }
      ]
    }
  ]
};

write('celpip', 'vocabulary', celpipVocab);
console.log('CELPIP vocabulary done.');
