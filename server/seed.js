const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Course = require("./models/Course");
const Review = require("./models/Review");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for high-volume seeding...");

    // 1. Clean up existing seeded users, courses, and reviews to keep it clean and idempotent
    // We'll clean up any users with email ending in @edumentr.com or @student.com
    const seededUserEmails = [
      "alan.turing@edumentr.com",
      "grace.hopper@edumentr.com",
      "sarah.connor@edumentr.com",
      "marcus@edumentr.com",
      "admin@edumentr.com",
      "alice.smith@student.com",
      "bob.jones@student.com",
      "charlie.brown@student.com",
      "diana.prince@student.com",
      "ethan.hunt@student.com"
    ];

    const existingSeededUsers = await User.find({ email: { $in: seededUserEmails } });
    const userIds = existingSeededUsers.map(u => u._id);

    // Delete reviews and courses created by/related to these users
    await Review.deleteMany({ user: { $in: userIds } });
    await Course.deleteMany({ instructor: { $in: userIds } });
    await User.deleteMany({ email: { $in: seededUserEmails } });

    console.log("Cleaned up old seeded users, reviews, and courses.");

    // 2. Hash passwords
    const passwordHash = await bcrypt.hash("password123", 10);
    const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);

    // 3. Create Teachers & Admin
    console.log("Creating instructors & admin...");
    const teachers = await User.create([
      {
        name: "Dr. Alan Turing",
        email: "alan.turing@edumentr.com",
        password: passwordHash,
        role: "teacher",
        profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
      },
      {
        name: "Prof. Grace Hopper",
        email: "grace.hopper@edumentr.com",
        password: passwordHash,
        role: "teacher",
        profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
      },
      {
        name: "Sarah Connor",
        email: "sarah.connor@edumentr.com",
        password: passwordHash,
        role: "teacher",
        profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"
      },
      {
        name: "Prof. Marcus Aurelius",
        email: "marcus@edumentr.com",
        password: passwordHash,
        role: "teacher",
        profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"
      },
      {
        name: "System Admin",
        email: "admin@edumentr.com",
        password: adminPasswordHash,
        role: "admin",
        profilePic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200"
      }
    ]);

    const tMap = {};
    teachers.forEach(t => {
      tMap[t.email] = t;
    });

    // 4. Create Students
    console.log("Creating students...");
    const students = await User.create([
      {
        name: "Alice Smith",
        email: "alice.smith@student.com",
        password: passwordHash,
        role: "student",
        profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"
      },
      {
        name: "Bob Jones",
        email: "bob.jones@student.com",
        password: passwordHash,
        role: "student",
        profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
      },
      {
        name: "Charlie Brown",
        email: "charlie.brown@student.com",
        password: passwordHash,
        role: "student",
        profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
      },
      {
        name: "Diana Prince",
        email: "diana.prince@student.com",
        password: passwordHash,
        role: "student",
        profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
      },
      {
        name: "Ethan Hunt",
        email: "ethan.hunt@student.com",
        password: passwordHash,
        role: "student",
        profilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200"
      }
    ]);

    const sMap = {};
    students.forEach(s => {
      sMap[s.email] = s;
    });

    const sIds = students.map(s => s._id);

    // 5. Create Courses (8 in each category, total of 40 courses)
    console.log("Creating courses across 5 categories (Development, Business, Design, Marketing, Other)...");
    const courseData = [];

    // --- DEVELOPMENT CATEGORY ---
    const devInstructors = [tMap["alan.turing@edumentr.com"]._id, tMap["grace.hopper@edumentr.com"]._id];
    const devCourses = [
      {
        title: "Introduction to Machine Learning & Artificial Intelligence",
        description: "Dive deep into the world of Machine Learning! This course covers linear regression, logistic regression, support vector machines, neural networks, and modern deep learning frameworks. Ideal for students aspiring to become data scientists and ML engineers.",
        thumbnail: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800",
        videos: [
          { title: "Welcome to Machine Learning & Course Overview", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Supervised vs. Unsupervised Learning", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { title: "Neural Networks & Deep Learning Intuition", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Full-Stack Web Development: From Frontend to Cloud",
        description: "Become a professional full-stack developer. Master modern HTML, CSS, JavaScript, React.js for the frontend, Node.js and Express for the backend, MongoDB for databases, and deploy your production-ready apps to AWS or Vercel.",
        thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
        videos: [
          { title: "Introduction to modern React & Component Architecture", videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0" },
          { title: "State Management & React Hooks (useState, useEffect)", videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0" },
          { title: "Building RESTful APIs with Node.js and Express", videoUrl: "https://www.youtube.com/embed/fgTGADLJPh4" }
        ]
      },
      {
        title: "Advanced Python & Backend Systems",
        description: "Scale backend systems using Python, FastAPI, and asynchronous architectures. Master concurrent programming, database optimizations, caching with Redis, and message queues like RabbitMQ.",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
        videos: [
          { title: "Introduction to Asynchronous Python", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Building APIs with FastAPI", videoUrl: "https://www.youtube.com/embed/fgTGADLJPh4" }
        ]
      },
      {
        title: "Data Structures and Algorithms Masterclass",
        description: "Cracking the coding interview made simple. Build solid foundations in Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and complexity analysis.",
        thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800",
        videos: [
          { title: "Time and Space Complexity Analysis", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Mastering Binary Trees & Recursion", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Mobile App Development with React Native",
        description: "Build beautiful cross-platform native iOS and Android applications with a single React codebase. Learn layouts, native APIs, push notifications, and app store deployment.",
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
        videos: [
          { title: "Setting up Expo & React Native Elements", videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0" },
          { title: "Navigation Systems in Mobile Apps", videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0" }
        ]
      },
      {
        title: "Introduction to Cybersecurity & Ethical Hacking",
        description: "Protect systems, networks, and applications from cyber threats. Master vulnerability scanning, SQL injections, Cross-Site Scripting (XSS), and basic network forensics.",
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
        videos: [
          { title: "Cybersecurity Fundamentals & Threat Landscapes", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "How Hackers Exploit Web Application Flaws", videoUrl: "https://www.youtube.com/embed/fgTGADLJPh4" }
        ]
      },
      {
        title: "Cloud Infrastructure and DevOps (Docker, Kubernetes, AWS)",
        description: "Accelerate your deployments. Learn virtualization, containerizing applications with Docker, container orchestration with Kubernetes, and configuring CI/CD pipelines.",
        thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800",
        videos: [
          { title: "Docker Containerization Basics", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Understanding Kubernetes Pods and Services", videoUrl: "https://www.youtube.com/embed/fgTGADLJPh4" }
        ]
      },
      {
        title: "Blockchain & Smart Contract Development with Solidity",
        description: "Explore the decentralized web. Understand cryptography, consensus algorithms, Ethereum blockchain, and write smart contracts using Solidity.",
        thumbnail: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800",
        videos: [
          { title: "Introduction to Cryptography & Blockchain Theory", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Writing Your First Smart Contract in Remix IDE", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      }
    ];

    devCourses.forEach((c, index) => {
      courseData.push({
        ...c,
        category: "Development",
        instructor: devInstructors[index % 2],
        enrolledStudents: [sIds[index % 5], sIds[(index + 1) % 5], sIds[(index + 2) % 5]],
        questions: []
      });
    });

    // --- BUSINESS CATEGORY ---
    const bizInstructors = [tMap["marcus@edumentr.com"]._id, tMap["grace.hopper@edumentr.com"]._id];
    const bizCourses = [
      {
        title: "Entrepreneurship: Launching a Successful Startup",
        description: "Turn ideas into viable businesses. Learn ideation, customer validation, minimum viable products (MVPs), pricing models, pitching, and raising venture capital.",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
        videos: [
          { title: "Finding Product-Market Fit", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Writing a Winning Pitch Deck", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Financial Intelligence for Managers",
        description: "Understand the numbers that drive your business. Master balance sheets, income statements, cash flow management, budgeting, and corporate valuation.",
        thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        videos: [
          { title: "Deciphering the Balance Sheet", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Cash Flow vs Profitability", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Project Management Essentials (PMP Prep)",
        description: "Deliver projects on time and under budget. Master agile methodologies, Scrum frameworks, Kanban boards, project planning, and risk management.",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        videos: [
          { title: "Introduction to Project Lifecycle Phases", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Setting up a High-Performing Agile Scrum Team", videoUrl: "https://www.youtube.com/embed/fgTGADLJPh4" }
        ]
      },
      {
        title: "Strategic Management & Leadership",
        description: "Lead organizations through disruption. Learn competitive analysis, SWOT models, change management, and how to define corporate strategy.",
        thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
        videos: [
          { title: "The Art of Strategic Alignment", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Leading Teams Through Change and Disruption", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Business Analytics and Data-Driven Decisions",
        description: "Translate complex business data into actionable strategies. Learn hypothesis testing, regressions, and dashboard metrics using Excel and Tableau.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        videos: [
          { title: "Key Performance Indicators (KPIs) to Track", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Visualizing Data with Tableau Dashboards", videoUrl: "https://www.youtube.com/embed/fgTGADLJPh4" }
        ]
      },
      {
        title: "Supply Chain Management and Logistics",
        description: "Optimize the flow of goods and services. Explore procurement, inventory control, global shipping logistics, warehousing, and cost optimization.",
        thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        videos: [
          { title: "Fundamentals of Modern Supply Chains", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Just-In-Time (JIT) Inventory Systems", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Human Resource Management & Organizational Behavior",
        description: "Build an outstanding workplace culture. Discover recruitment techniques, performance review frameworks, conflict resolution, and employee engagement.",
        thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
        videos: [
          { title: "Attracting and Retaining Top Talent", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Resolving Interpersonal Workplace Conflict", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        title: "Negotiation Mastery: Principles of Influence",
        description: "Win deals and construct mutually beneficial partnerships. Study game theory, emotional intelligence, persuasion tactics, and contract negotiation strategies.",
        thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
        videos: [
          { title: "Principled Negotiation & BATNA Concepts", videoUrl: "https://www.youtube.com/embed/JwSS70SZdyg" },
          { title: "Handling Difficult Counterparts under Pressure", videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      }
    ];

    bizCourses.forEach((c, index) => {
      courseData.push({
        ...c,
        category: "Business",
        instructor: bizInstructors[index % 2],
        enrolledStudents: [sIds[index % 5], sIds[(index + 2) % 5]],
        questions: []
      });
    });

    // --- DESIGN CATEGORY ---
    const desInstructors = [tMap["sarah.connor@edumentr.com"]._id];
    const desCourses = [
      {
        title: "UI/UX Design Masterclass: Principles and Practice",
        description: "Learn how to design gorgeous, modern, and highly interactive user interfaces. This course covers color theory, typography, spacing systems, grid systems, wireframing, high-fidelity prototypes in Figma, and conducting user interviews.",
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800",
        videos: [
          { title: "Introduction to Figma & Design Systems", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" },
          { title: "Understanding Visual Hierarchy & Spacing", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" },
          { title: "High-Fidelity Prototyping & Micro-interactions", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" }
        ]
      },
      {
        title: "Graphic Design Fundamentals (Illustrator & Photoshop)",
        description: "Master industry-standard graphics tools. Build compelling vectors, edit imagery professionally, and design beautiful brand logos, posters, and assets.",
        thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
        videos: [
          { title: "Vector Design Basics in Adobe Illustrator", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" },
          { title: "Image Retouching Techniques in Photoshop", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" }
        ]
      },
      {
        title: "Typography & Visual Layout Design",
        description: "Express identity through typography. Learn type pairings, kerning rules, spacing systems, grid modularity, and readable content layouts.",
        thumbnail: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800",
        videos: [
          { title: "Anatomy of Typefaces", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" },
          { title: "Grid Systems and Modularity in Graphic Layouts", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" }
        ]
      },
      {
        title: "Design Systems: Scaling Products with Consistency",
        description: "Build robust systems. Learn design tokens, component modularity, styling states, and keeping Figma design files fully aligned with CSS codebases.",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        videos: [
          { title: "Introduction to Design Tokens & Atoms", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" },
          { title: "Creating Reusable Components in Figma", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" }
        ]
      },
      {
        title: "Introduction to 3D Modeling and Animation in Blender",
        description: "Step into the 3D dimensions. Master vertex manipulations, sculpting, realistic texture-mapping, node-based shaders, lighting setups, and keyframe animations.",
        thumbnail: "https://images.unsplash.com/photo-1617791160505-6f006e121980?w=800",
        videos: [
          { title: "Blender Viewport Navigation & Mesh Modeling", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" },
          { title: "Lighting and Rendering with Eevee and Cycles", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" }
        ]
      },
      {
        title: "Interaction Design & Interactive Prototyping",
        description: "Create human-centered user flows. Design micro-interactions, swipe triggers, transitions, and test prototypes on realistic devices for validation.",
        thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
        videos: [
          { title: "Mapping Interactive User Flows", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" },
          { title: "Designing Smart Animate Transitions in Figma", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" }
        ]
      },
      {
        title: "Design Thinking & User Research Methods",
        description: "Uncover user desires. Learn empathy maps, building personas, formulating user journey flows, executing usability testing, and conducting user interviews.",
        thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800",
        videos: [
          { title: "The 5 Stages of the Design Thinking Process", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" },
          { title: "Writing Non-Leading Usability Testing Scripts", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" }
        ]
      },
      {
        title: "Motion Design with After Effects",
        description: "Add rhythm to graphics. Learn curves, ease keys, graphic compositions, transitions, logo animations, and kinetic typography.",
        thumbnail: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800",
        videos: [
          { title: "Keyframes, Graph Editors & Motion Paths", videoUrl: "https://www.youtube.com/embed/3W3zO-9c-2A" },
          { title: "Animate a Vector Brand Logo from Scratch", videoUrl: "https://www.youtube.com/embed/c9Wg6Ry_zQ0" }
        ]
      }
    ];

    desCourses.forEach((c, index) => {
      courseData.push({
        ...c,
        category: "Design",
        instructor: desInstructors[0],
        enrolledStudents: [sIds[index % 5], sIds[(index + 3) % 5]],
        questions: []
      });
    });

    // --- MARKETING CATEGORY ---
    const mktInstructors = [tMap["marcus@edumentr.com"]._id, tMap["sarah.connor@edumentr.com"]._id];
    const mktCourses = [
      {
        title: "Modern Digital Marketing & SEO Strategy",
        description: "Master the art and science of digital marketing. Learn search engine optimization (SEO), social media marketing campaigns, pay-per-click advertising, content marketing, and Google Analytics to scale businesses.",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        videos: [
          { title: "SEO Basics: Keywords & Content Optimization", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Running Profitable Paid Campaigns", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Social Media Marketing & Brand Building",
        description: "Create an engaged brand community. Scale outreach using Instagram, TikTok, LinkedIn, YouTube, and design custom organic content calendars.",
        thumbnail: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800",
        videos: [
          { title: "Understanding the Algorithms (TikTok/IG Reels)", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Developing an Authentic Visual Brand Voice", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Content Marketing Masterclass",
        description: "Become a narrative authority. Write excellent blogs, build high-converting landing copies, scale podcasts, and formulate multi-channel distribution grids.",
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        videos: [
          { title: "The Content Pillars Framework", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Promoting Content: The 80/20 Distribution Formula", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Email Marketing & Marketing Automation",
        description: "Build robust sales pipelines. Master segmentations, email designs, drip workflows, lead magnets, and optimization of bounce and open metrics.",
        thumbnail: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800",
        videos: [
          { title: "Designing High-Converting Lead Capture Forms", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Building Automated Welcome Drip Sequences", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Product Marketing: Launching New Features",
        description: "Position products for ultimate growth. Build robust go-to-market strategies, user positioning matrices, competitor analyses, and sales-enablement modules.",
        thumbnail: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800",
        videos: [
          { title: "Conducting Deep Competitive Audits", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Creating User Personas and Positioning Grids", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Google Analytics & Performance Marketing",
        description: "Measure what counts. Implement GA4, tag managers, pixel pixels, conversion tracking grids, attribution architectures, and maximize your ROAS.",
        thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=800",
        videos: [
          { title: "Setting up Conversions in Google Tag Manager", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Analyzing GA4 User Acquisition Reports", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Copywriting Academy: Words That Sell",
        description: "Unlock high conversions. Write compelling taglines, landing copy, subject lines, ad creatives, and high-impact calls to action (CTAs).",
        thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
        videos: [
          { title: "The PAS (Problem-Agitate-Solve) Copy Framework", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Headline Writing: Rules for Hooking Readers", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Influencer & Affiliate Marketing Strategies",
        description: "Leverage networks. Partner with global micro-influencers, configure affiliate payouts, track promotional metrics, and launch word-of-mouth campaigns.",
        thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
        videos: [
          { title: "Pitching and Negotiating with Micro-influencers", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Tracking Conversions on Custom Referral Links", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      }
    ];

    mktCourses.forEach((c, index) => {
      courseData.push({
        ...c,
        category: "Marketing",
        instructor: mktInstructors[index % 2],
        enrolledStudents: [sIds[index % 5], sIds[(index + 4) % 5]],
        questions: []
      });
    });

    // --- OTHER CATEGORY ---
    const othInstructors = [tMap["sarah.connor@edumentr.com"]._id, tMap["marcus@edumentr.com"]._id, tMap["alan.turing@edumentr.com"]._id];
    const othCourses = [
      {
        title: "Creative Writing: Crafting Compelling Narratives",
        description: "Discover the novelist inside. Formulate detailed worlds, design deep multidimensional characters, create dramatic narrative arcs, and construct engaging dialogue scripts.",
        thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
        videos: [
          { title: "World-building & Designing Fictional Arenas", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Character Arcs: Generating Depth & Conflict", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Introduction to Photography & Lighting",
        description: "Capture reality beautifully. Master exposure triangles, aperture scales, shutter speeds, ISO controls, depth fields, and using natural and flash lighting gear.",
        thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
        videos: [
          { title: "Understanding Shutter Speed, Aperture, and ISO", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "The Rule of Thirds and Visual Framing Guidelines", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Public Speaking & Presentation Skills",
        description: "Exude absolute confidence. Master structural delivery, body languages, slides curation, speaking pacing, vocal modulations, and commanding large audiences.",
        thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        videos: [
          { title: "Overcoming Stage Fright & Speaking Fear", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Structuring a Speech for Maximum Core Retention", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Nutrition & Healthy Cooking Masterclass",
        description: "Nourish yourself with flavor. Formulate macro nutrition balances, meal preparations, knife methods, and learn healthy and quick recipes from master chefs.",
        thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        videos: [
          { title: "Macronutrients and Balancing Daily Meal Grids", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Basic Chef Knife Skills & Cutting Techniques", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Mindfulness & Mental Well-being",
        description: "Reclaim absolute calm. Learn scientifically supported stress reductions, mindful breathing routines, mental clarity exercises, and building healthy mental frameworks.",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        videos: [
          { title: "The Science and Physiology of Deep Breathing", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Guided Meditation for Anxiety and Focus", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Personal Finance & Wealth Creation",
        description: "Gain compound advantage. Learn budgeting grids, tax optimizations, stock trading concepts, index funds, retirement plans, and compound interest equations.",
        thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800",
        videos: [
          { title: "Budgeting with the 50/30/20 Rule", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "How Compound Interest Works over Decades", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Game Design & Theory",
        description: "Construct interactive realms. Study core loops, risk vs reward structures, system balance equations, level architectures, and keeping players highly engaged.",
        thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
        videos: [
          { title: "Understanding the Core Gameplay Loop", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Level Design: Leading Players Visually", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      },
      {
        title: "Music Production & Sound Engineering Basics",
        description: "Synthesize beautiful sound. Understand Digital Audio Workstations (DAWs), equalizer grids, compression concepts, synth setups, and final track mastering techniques.",
        thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        videos: [
          { title: "Navigating the DAW Viewport & Track Recording", videoUrl: "https://www.youtube.com/embed/xsVTqzratPs" },
          { title: "Understanding Equalization (EQ) & Audio Frequencies", videoUrl: "https://www.youtube.com/embed/U3_N2N5S0lM" }
        ]
      }
    ];

    othCourses.forEach((c, index) => {
      courseData.push({
        ...c,
        category: "Other",
        instructor: othInstructors[index % 3],
        enrolledStudents: [sIds[index % 5], sIds[(index + 1) % 5]],
        questions: []
      });
    });

    // Write all courses to DB
    const insertedCourses = await Course.create(courseData);
    console.log(`Inserted ${insertedCourses.length} premium courses successfully!`);

    // Let's seed questions on the first course of each category to show it's active
    console.log("Seeding active Q&As and Student reviews...");
    const courseMap = {};
    insertedCourses.forEach(c => {
      courseMap[c.title] = c;
    });

    // Populate video watched arrays dynamically for some students
    for (const c of insertedCourses) {
      if (c.videos && c.videos.length > 0 && c.enrolledStudents && c.enrolledStudents.length > 0) {
        // Mark first video as watched by the first enrolled student
        c.videos[0].watchedBy = [c.enrolledStudents[0]];
        await c.save();
      }
    }

    // Add Q&A threads
    const mlCourse = courseMap["Introduction to Machine Learning & Artificial Intelligence"];
    mlCourse.questions.push({
      user: sMap["alice.smith@student.com"]._id,
      text: "Could you explain the cost function formula for linear regression in detail?",
      replies: [
        {
          user: tMap["alan.turing@edumentr.com"]._id,
          text: "Of course, Alice! The cost function J(θ) measures the mean squared error. In our next lecture, we'll write a Python script from scratch to visualize how gradient descent minimizes this function."
        },
        {
          user: sMap["bob.jones@student.com"]._id,
          text: "I was wondering the same thing. Thanks for asking, Alice!"
        }
      ]
    });
    await mlCourse.save();

    const devCourse = courseMap["Full-Stack Web Development: From Frontend to Cloud"];
    devCourse.questions.push({
      user: sMap["bob.jones@student.com"]._id,
      text: "When should I use useContext vs Redux or other state management libraries?",
      replies: [
        {
          user: tMap["grace.hopper@edumentr.com"]._id,
          text: "Use context for global settings, theme data, or user profiles. For complex, high-frequency state updates, Redux or Zustand is generally preferred. We will cover this in Section 4!"
        }
      ]
    });
    await devCourse.save();

    const uiCourse = courseMap["UI/UX Design Masterclass: Principles and Practice"];
    uiCourse.questions.push({
      user: sMap["charlie.brown@student.com"]._id,
      text: "Should UI designers learn how to write frontend code like HTML/CSS?",
      replies: [
        {
          user: tMap["sarah.connor@edumentr.com"]._id,
          text: "Hi Charlie! While not strictly mandatory, understanding basic HTML/CSS helps you design components that are feasible to build, and makes developer handoff a breeze."
        }
      ]
    });
    await uiCourse.save();

    // 6. Create Reviews (distributing reviews across categories)
    const reviewsList = [
      {
        course: mlCourse._id,
        user: sMap["alice.smith@student.com"]._id,
        rating: 5,
        comment: "Absolutely brilliant course! Dr. Turing explains mathematical concepts with amazing clarity."
      },
      {
        course: mlCourse._id,
        user: sMap["bob.jones@student.com"]._id,
        rating: 4,
        comment: "Great introduction, looking forward to the hands-on coding assignments."
      },
      {
        course: devCourse._id,
        user: sMap["ethan.hunt@student.com"]._id,
        rating: 5,
        comment: "Best web development course on the internet! Truly comprehensive and full of practical projects."
      },
      {
        course: devCourse._id,
        user: sMap["diana.prince@student.com"]._id,
        rating: 5,
        comment: "Grace Hopper is a legend! The React component breakdown is perfect."
      },
      {
        course: uiCourse._id,
        user: sMap["charlie.brown@student.com"]._id,
        rating: 5,
        comment: "I learned so much about figma auto-layout! Absolute game changer."
      },
      {
        course: uiCourse._id,
        user: sMap["alice.smith@student.com"]._id,
        rating: 4,
        comment: "Aesthetics-wise this course is phenomenal. The design systems section is extremely detailed."
      },
      {
        course: courseMap["Modern Digital Marketing & SEO Strategy"]._id,
        user: sMap["ethan.hunt@student.com"]._id,
        rating: 4,
        comment: "Very logical and analytical breakdown. Learned a lot about SEO."
      },
      {
        course: courseMap["Entrepreneurship: Launching a Successful Startup"]._id,
        user: sMap["bob.jones@student.com"]._id,
        rating: 5,
        comment: "Highly inspiring and full of actionable steps for validating my ideas!"
      },
      {
        course: courseMap["Creative Writing: Crafting Compelling Narratives"]._id,
        user: sMap["alice.smith@student.com"]._id,
        rating: 5,
        comment: "This course completely transformed my approach to writing fiction. The character design exercises are amazing."
      }
    ];

    await Review.create(reviewsList);

    console.log("Reviews created successfully.");
    console.log("\nDatabase Seeding Completed Successfully! 🎉");
    console.log(`Summary: Seeding registered 40 premium courses (8 per category).`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
