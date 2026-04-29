const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const data = {
  locations: [
    { city: "Toronto", province: "Ontario", city_size: "large", estimated_monthly_living_cost: 2200 },
    { city: "Vancouver", province: "British Columbia", city_size: "large", estimated_monthly_living_cost: 2400 },
    { city: "Montreal", province: "Quebec", city_size: "large", estimated_monthly_living_cost: 1600 },
    { city: "Ottawa", province: "Ontario", city_size: "medium", estimated_monthly_living_cost: 1700 },
    { city: "Edmonton", province: "Alberta", city_size: "medium", estimated_monthly_living_cost: 1400 },
    { city: "Halifax", province: "Nova Scotia", city_size: "medium", estimated_monthly_living_cost: 1500 },
    { city: "Waterloo", province: "Ontario", city_size: "small", estimated_monthly_living_cost: 1400 },
    { city: "Kingston", province: "Ontario", city_size: "small", estimated_monthly_living_cost: 1300 },
    { city: "Winnipeg", province: "Manitoba", city_size: "medium", estimated_monthly_living_cost: 1200 },
    { city: "Calgary", province: "Alberta", city_size: "large", estimated_monthly_living_cost: 1500 },
    { city: "Victoria", province: "British Columbia", city_size: "medium", estimated_monthly_living_cost: 1800 },
    { city: "Saskatoon", province: "Saskatchewan", city_size: "small", estimated_monthly_living_cost: 1100 },
  ],
  universities: [
    {
      name: "University of Toronto",
      slug: "university-of-toronto",
      description: "Canada's top-ranked university, located in downtown Toronto. World-class faculty and research opportunities across hundreds of programs.",
      location_idx: 0, ranking_proxy: 1,
      website_url: "https://www.utoronto.ca",
      programs: [
        { name: "English", slug: "english", has_coop: false, description: "Study literature, critical theory, and creative writing.", career_outcomes: ["Writer","Editor","Teacher","Communications Specialist"], tuition: 62250, ielts: 6.5, ielts_min: 6.0, toefl: 100, gpa: 3.5, deadline: "January 15", url: "https://www.artsci.utoronto.ca/future/ready-apply" },
        { name: "Political Science", slug: "political-science", has_coop: false, description: "Explore governance, international relations, and public policy.", career_outcomes: ["Policy Analyst","Diplomat","Journalist","Lawyer"], tuition: 62250, ielts: 6.5, ielts_min: 6.0, toefl: 100, gpa: 3.5, deadline: "January 15", url: "https://www.artsci.utoronto.ca/future/ready-apply" },
      ],
    },
    {
      name: "University of British Columbia",
      slug: "university-of-british-columbia",
      description: "A global leader in research and teaching, set against the stunning backdrop of Vancouver's mountains and ocean.",
      location_idx: 1, ranking_proxy: 2,
      website_url: "https://www.ubc.ca",
      programs: [
        { name: "Psychology", slug: "psychology", has_coop: true, description: "Understand human behavior through scientific research and clinical practice.", career_outcomes: ["Psychologist","Counselor","HR Specialist","Researcher"], tuition: 44091, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 3.3, deadline: "January 15", url: "https://you.ubc.ca/applying-ubc" },
        { name: "Sociology", slug: "sociology", has_coop: false, description: "Analyze social structures, inequality, and cultural dynamics.", career_outcomes: ["Social Worker","Policy Analyst","Community Organizer","Researcher"], tuition: 44091, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 3.3, deadline: "January 15", url: "https://you.ubc.ca/applying-ubc" },
      ],
    },
    {
      name: "McGill University",
      slug: "mcgill-university",
      description: "One of Canada's oldest and most prestigious universities, located in vibrant Montreal with a bilingual culture.",
      location_idx: 2, ranking_proxy: 3,
      website_url: "https://www.mcgill.ca",
      programs: [
        { name: "Philosophy", slug: "philosophy", has_coop: false, description: "Engage with fundamental questions about existence, knowledge, and ethics.", career_outcomes: ["Philosopher","Ethicist","Lawyer","Writer"], tuition: 27100, ielts: 6.5, ielts_min: 6.5, toefl: 90, gpa: 3.5, deadline: "January 15", url: "https://www.mcgill.ca/undergraduate-admissions" },
        { name: "Economics", slug: "economics", has_coop: false, description: "Study markets, policy, and economic theory with quantitative rigor.", career_outcomes: ["Economist","Financial Analyst","Policy Advisor","Consultant"], tuition: 27100, ielts: 6.5, ielts_min: 6.5, toefl: 90, gpa: 3.5, deadline: "January 15", url: "https://www.mcgill.ca/undergraduate-admissions" },
      ],
    },
    {
      name: "University of Ottawa",
      slug: "university-of-ottawa",
      description: "Canada's largest bilingual university, offering programs in English and French in the nation's capital.",
      location_idx: 3, ranking_proxy: 8,
      website_url: "https://www.uottawa.ca",
      programs: [
        { name: "International Studies", slug: "international-studies", has_coop: true, description: "Study global politics, development, and cross-cultural relations.", career_outcomes: ["Diplomat","NGO Worker","Policy Analyst","Journalist"], tuition: 38806, ielts: 6.5, ielts_min: 6.0, toefl: 86, gpa: 3.0, deadline: "April 1", url: "https://www.uottawa.ca/undergraduate-admissions" },
      ],
    },
    {
      name: "University of Alberta",
      slug: "university-of-alberta",
      description: "A top-5 Canadian research university in Edmonton, known for strong arts and sciences programs.",
      location_idx: 4, ranking_proxy: 5,
      website_url: "https://www.ualberta.ca",
      programs: [
        { name: "History", slug: "history", has_coop: true, description: "Explore the past to understand the present through critical analysis of historical events.", career_outcomes: ["Historian","Archivist","Museum Curator","Teacher"], tuition: 33470, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 3.0, deadline: "March 1", url: "https://www.ualberta.ca/admissions" },
        { name: "Linguistics", slug: "linguistics", has_coop: false, description: "Study the science of language, from phonetics to syntax and semantics.", career_outcomes: ["Linguist","Translator","Speech Therapist","AI Researcher"], tuition: 33470, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 3.0, deadline: "March 1", url: "https://www.ualberta.ca/admissions" },
      ],
    },
    {
      name: "Dalhousie University",
      slug: "dalhousie-university",
      description: "Atlantic Canada's leading research university, offering a welcoming community in beautiful Halifax.",
      location_idx: 5, ranking_proxy: 10,
      website_url: "https://www.dal.ca",
      programs: [
        { name: "Gender and Women's Studies", slug: "gender-womens-studies", has_coop: false, description: "Examine gender, sexuality, and social justice through interdisciplinary lenses.", career_outcomes: ["Advocate","Policy Analyst","Social Worker","Educator"], tuition: 22764, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 2.7, deadline: "April 1", url: "https://www.dal.ca/admissions" },
      ],
    },
    {
      name: "University of Waterloo",
      slug: "university-of-waterloo",
      description: "Famous for co-op education, Waterloo connects students with industry through the largest co-op program in the world.",
      location_idx: 6, ranking_proxy: 4,
      website_url: "https://uwaterloo.ca",
      programs: [
        { name: "Arts and Business", slug: "arts-and-business", has_coop: true, description: "Combine liberal arts with business fundamentals and guaranteed co-op placements.", career_outcomes: ["Business Analyst","Marketing Manager","Entrepreneur","Consultant"], tuition: 48600, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 3.2, deadline: "February 1", url: "https://uwaterloo.ca/future-students/admissions" },
      ],
    },
    {
      name: "Queen's University",
      slug: "queens-university",
      description: "A prestigious university in Kingston with a tight-knit campus community and strong academic tradition.",
      location_idx: 7, ranking_proxy: 6,
      website_url: "https://www.queensu.ca",
      programs: [
        { name: "Film and Media", slug: "film-and-media", has_coop: false, description: "Study film production, media theory, and digital storytelling.", career_outcomes: ["Filmmaker","Media Producer","Content Creator","Critic"], tuition: 55567, ielts: 6.5, ielts_min: 6.0, toefl: 88, gpa: 3.3, deadline: "February 1", url: "https://www.queensu.ca/admission" },
      ],
    },
    {
      name: "University of Manitoba",
      slug: "university-of-manitoba",
      description: "Manitoba's largest university, offering affordable education with strong research programs in the heart of Winnipeg.",
      location_idx: 8, ranking_proxy: 12,
      website_url: "https://umanitoba.ca",
      programs: [
        { name: "Anthropology", slug: "anthropology", has_coop: false, description: "Study human cultures, societies, and biological evolution across time and space.", career_outcomes: ["Anthropologist","Museum Curator","Cultural Consultant","Researcher"], tuition: 19800, ielts: 6.5, ielts_min: 6.0, toefl: 86, gpa: 2.5, deadline: "May 1", url: "https://umanitoba.ca/admissions" },
      ],
    },
    {
      name: "University of Calgary",
      slug: "university-of-calgary",
      description: "A young, dynamic university in Calgary with innovative programs and strong ties to industry.",
      location_idx: 9, ranking_proxy: 7,
      website_url: "https://www.ucalgary.ca",
      programs: [
        { name: "Communications", slug: "communications", has_coop: true, description: "Learn media production, journalism, and strategic communication.", career_outcomes: ["Journalist","PR Specialist","Content Strategist","Media Analyst"], tuition: 28388, ielts: 6.5, ielts_min: 6.0, toefl: 86, gpa: 3.0, deadline: "March 1", url: "https://www.ucalgary.ca/future-students/undergraduate/explore-programs" },
      ],
    },
    {
      name: "University of Victoria",
      slug: "university-of-victoria",
      description: "Located on beautiful Vancouver Island, UVic is known for co-op programs and a stunning natural campus.",
      location_idx: 10, ranking_proxy: 9,
      website_url: "https://www.uvic.ca",
      programs: [
        { name: "Environmental Studies", slug: "environmental-studies", has_coop: true, description: "Explore environmental issues through social science, policy, and humanities perspectives.", career_outcomes: ["Environmental Consultant","Policy Analyst","Sustainability Manager","Educator"], tuition: 27444, ielts: 6.5, ielts_min: 6.0, toefl: 90, gpa: 3.0, deadline: "February 28", url: "https://www.uvic.ca/undergraduate/programs" },
      ],
    },
    {
      name: "University of Saskatchewan",
      slug: "university-of-saskatchewan",
      description: "A comprehensive research university in Saskatoon offering affordable tuition and a supportive community.",
      location_idx: 11, ranking_proxy: 14,
      website_url: "https://www.usask.ca",
      programs: [
        { name: "Indigenous Studies", slug: "indigenous-studies", has_coop: false, description: "Learn about Indigenous histories, cultures, governance, and contemporary issues.", career_outcomes: ["Community Developer","Policy Advisor","Educator","Cultural Liaison"], tuition: 18040, ielts: 6.5, ielts_min: 6.0, toefl: 86, gpa: 2.5, deadline: "May 1", url: "https://admissions.usask.ca" },
      ],
    },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear existing data
    await client.query("DELETE FROM costs");
    await client.query("DELETE FROM requirements");
    await client.query("DELETE FROM programs");
    await client.query("DELETE FROM universities");
    await client.query("DELETE FROM locations");

    // Insert locations
    const locationIds = [];
    for (const loc of data.locations) {
      const res = await client.query(
        "INSERT INTO locations (city, province, city_size, estimated_monthly_living_cost) VALUES ($1,$2,$3,$4) RETURNING id",
        [loc.city, loc.province, loc.city_size, loc.estimated_monthly_living_cost]
      );
      locationIds.push(res.rows[0].id);
    }

    // Insert universities and programs
    for (const uni of data.universities) {
      const uniRes = await client.query(
        "INSERT INTO universities (name, slug, description, location_id, website_url, ranking_proxy, source_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
        [uni.name, uni.slug, uni.description, locationIds[uni.location_idx], uni.website_url, uni.ranking_proxy, uni.website_url]
      );
      const uniId = uniRes.rows[0].id;

      for (const prog of uni.programs) {
        const progRes = await client.query(
          "INSERT INTO programs (university_id, name, slug, description, has_coop, program_url, career_outcomes, source_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
          [uniId, prog.name, prog.slug, prog.description, prog.has_coop, prog.url, prog.career_outcomes, prog.url]
        );
        const progId = progRes.rows[0].id;

        await client.query(
          "INSERT INTO requirements (program_id, ielts_overall, ielts_min_band, toefl_ibt, min_gpa, additional_requirements, source_url) VALUES ($1,$2,$3,$4,$5,$6,$7)",
          [progId, prog.ielts, prog.ielts_min, prog.toefl, prog.gpa, `Application deadline: ${prog.deadline}`, prog.url]
        );

        await client.query(
          "INSERT INTO costs (program_id, tuition_yearly_international, academic_year, source_url) VALUES ($1,$2,$3,$4)",
          [progId, prog.tuition, "2025-2026", prog.url]
        );
      }
    }

    await client.query("COMMIT");
    console.log("✅ Database seeded with", data.universities.length, "universities");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
