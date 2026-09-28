// src/data/courses.js
// Courses with real playable YouTube video lessons

export const COURSES = [
  {
    id: "python-dsa",
    title: "Python DSA Masterclass",
    description: "Master Data Structures & Algorithms in Python — from Arrays to Graphs to DP. Crack FAANG interviews.",
    icon: "🐍",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
    color: "#0d2e1f",
    level: "Intermediate",
    totalLessons: 12,
    estimatedHours: 24,
    rating: 4.9,
    enrolled: 32840,
    tags: ["Python","DSA","Arrays","Trees","Graphs","DP"],
    chapters: [
      {
        id: 1, title: "Arrays & Hashing",
        lessons: [
          { id:"1-1", title:"Introduction to Arrays",          duration:"14:32", videoId:"RBSGKlAvoiM" },
          { id:"1-2", title:"Two Sum — Hash Map Solution",     duration:"18:45", videoId:"KLlXCFG5TnA" },
          { id:"1-3", title:"Top K Frequent Elements",         duration:"22:10", videoId:"YPTqKIgVk-k" },
        ],
      },
      {
        id: 2, title: "Two Pointers",
        lessons: [
          { id:"2-1", title:"Two Pointers Technique",          duration:"12:20", videoId:"jzZsG8n2R9A" },
          { id:"2-2", title:"Valid Palindrome",                duration:"10:15", videoId:"KLlXCFG5TnA" },
          { id:"2-3", title:"3Sum — Avoid Duplicates",         duration:"21:00", videoId:"jzZsG8n2R9A" },
        ],
      },
      {
        id: 3, title: "Sliding Window",
        lessons: [
          { id:"3-1", title:"Sliding Window Overview",         duration:"16:00", videoId:"wiGpQwVHdE0" },
          { id:"3-2", title:"Longest Substring Without Repeat",duration:"20:30", videoId:"wiGpQwVHdE0" },
          { id:"3-3", title:"Minimum Window Substring",        duration:"26:00", videoId:"jSto0O4AJbM" },
        ],
      },
      {
        id: 4, title: "Stack",
        lessons: [
          { id:"4-1", title:"Stack Data Structure",            duration:"11:45", videoId:"I37kGX-nZEI" },
          { id:"4-2", title:"Valid Parentheses",               duration:"14:00", videoId:"WTzjTskDFMg" },
          { id:"4-3", title:"Daily Temperatures — Monotonic Stack",duration:"19:30",videoId:"cTBiBSnjO3c" },
        ],
      },
      {
        id: 5, title: "Binary Search",
        lessons: [
          { id:"5-1", title:"Binary Search Fundamentals",      duration:"13:00", videoId:"s4DPM8ct1pI" },
          { id:"5-2", title:"Search in Rotated Sorted Array",  duration:"18:20", videoId:"U8XENwh8Oy8" },
          { id:"5-3", title:"Koko Eating Bananas",             duration:"17:00", videoId:"U8XENwh8Oy8" },
        ],
      },
      {
        id: 6, title: "Trees & BST",
        lessons: [
          { id:"6-1", title:"Binary Trees — DFS & BFS",        duration:"25:00", videoId:"fAAZixBzIAI" },
          { id:"6-2", title:"Level Order Traversal (BFS)",     duration:"16:45", videoId:"6ZnyEApgFYg" },
          { id:"6-3", title:"Validate BST",                    duration:"14:30", videoId:"fAAZixBzIAI" },
        ],
      },
      {
        id: 7, title: "Graphs",
        lessons: [
          { id:"7-1", title:"Graph Representations & BFS",     duration:"22:00", videoId:"tWVWeAqZ0WU" },
          { id:"7-2", title:"Number of Islands — DFS",         duration:"17:00", videoId:"pV2kpPD66nE" },
          { id:"7-3", title:"Topological Sort",                duration:"20:00", videoId:"tWVWeAqZ0WU" },
        ],
      },
      {
        id: 8, title: "Dynamic Programming",
        lessons: [
          { id:"8-1", title:"DP Introduction — Fibonacci",     duration:"18:00", videoId:"Y0lT9Fck7qI" },
          { id:"8-2", title:"Climbing Stairs & House Robber",  duration:"21:30", videoId:"Y0lT9Fck7qI" },
          { id:"8-3", title:"Coin Change — Bottom Up",         duration:"24:00", videoId:"H9bfqozjoqs" },
        ],
      },
      {
        id: 9, title: "Linked Lists",
        lessons: [
          { id:"9-1", title:"Linked List Basics",              duration:"14:00", videoId:"Hj_rA0dhr2I" },
          { id:"9-2", title:"Reverse Linked List",             duration:"12:00", videoId:"D7y_hoT_YZI" },
          { id:"9-3", title:"Detect Cycle — Floyd's Algorithm",duration:"16:00", videoId:"zbozWoMgKW0" },
        ],
      },
      {
        id: 10, title: "Heap & Priority Queue",
        lessons: [
          { id:"10-1",title:"Heap Data Structure",             duration:"20:00", videoId:"t0Cq6tVNRBA" },
          { id:"10-2",title:"Kth Largest Element",             duration:"15:30", videoId:"XEmy13g1Qxc" },
          { id:"10-3",title:"Find Median from Data Stream",    duration:"23:00", videoId:"itmhHWaHupI" },
        ],
      },
      {
        id: 11, title: "Backtracking",
        lessons: [
          { id:"11-1",title:"Backtracking Template",           duration:"19:00", videoId:"A80YzvNwqXA" },
          { id:"11-2",title:"Subsets & Permutations",          duration:"22:00", videoId:"A80YzvNwqXA" },
          { id:"11-3",title:"N-Queens Problem",                duration:"25:00", videoId:"Ph95IHmRp5M" },
        ],
      },
      {
        id: 12, title: "Advanced Topics",
        lessons: [
          { id:"12-1",title:"Tries — Prefix Trees",            duration:"20:00", videoId:"oobqoCJlHA0" },
          { id:"12-2",title:"Union Find / Disjoint Set",       duration:"18:00", videoId:"tWVWeAqZ0WU" },
          { id:"12-3",title:"Segment Trees",                   duration:"28:00", videoId:"ZBHKZF5w4YU" },
        ],
      },
    ],
  },
  {
    id: "cpp-dsa",
    title: "C++ DSA for Competitive Programming",
    description: "Competitive Programming in C++ — STL mastery, algorithms, and contest tricks.",
    icon: "⚡",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14431b9?w=800&q=80",
    color: "#1a1a2e",
    level: "Advanced",
    totalLessons: 10,
    estimatedHours: 20,
    rating: 4.8,
    enrolled: 18240,
    tags: ["C++","STL","Competitive","Algorithms"],
    chapters: [
      { id:1, title:"C++ STL Mastery", lessons:[
        { id:"1-1", title:"Vectors, Maps, Sets",     duration:"20:00", videoId:"vLnPwxZdW4Y" },
        { id:"1-2", title:"Priority Queue & Deque",  duration:"17:00", videoId:"2olsGf6JIkU" },
        { id:"1-3", title:"STL Algorithms",          duration:"22:00", videoId:"2olsGf6JIkU" },
      ]},
      { id:2, title:"Graph Algorithms", lessons:[
        { id:"2-1", title:"Dijkstra's Algorithm",    duration:"25:00", videoId:"GazC3A4OQTE" },
        { id:"2-2", title:"Bellman-Ford & SPFA",     duration:"20:00", videoId:"obWXjtg0L64" },
        { id:"2-3", title:"Floyd-Warshall",          duration:"18:00", videoId:"4NQ3HnhyNfQ" },
      ]},
      { id:3, title:"Advanced DP", lessons:[
        { id:"3-1", title:"Bitmask DP",              duration:"28:00", videoId:"rlTkd4yOQpE" },
        { id:"3-2", title:"DP on Trees",             duration:"24:00", videoId:"rlTkd4yOQpE" },
        { id:"3-3", title:"Matrix Exponentiation",   duration:"22:00", videoId:"rlTkd4yOQpE" },
      ]},
      { id:4, title:"String Algorithms", lessons:[
        { id:"4-1", title:"KMP Algorithm",           duration:"20:00", videoId:"V5-7GzOfADQ" },
        { id:"4-2", title:"Z-Algorithm",             duration:"18:00", videoId:"CpZh4eF8QBw" },
      ]},
    ],
  },
  {
    id: "system-design",
    title: "System Design for FAANG",
    description: "Learn to design scalable distributed systems — Load Balancers, Databases, Caches, Microservices.",
    icon: "🏗️",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    color: "#0d1b2a",
    level: "Advanced",
    totalLessons: 10,
    estimatedHours: 18,
    rating: 4.9,
    enrolled: 24500,
    tags: ["System Design","Scalability","Databases","Microservices","Caching"],
    chapters: [
      { id:1, title:"Fundamentals", lessons:[
        { id:"1-1", title:"Horizontal vs Vertical Scaling",  duration:"22:00", videoId:"xpDnVSmNFX0" },
        { id:"1-2", title:"Load Balancers — Types & Algos", duration:"18:00", videoId:"K0Ta65OqQkY" },
        { id:"1-3", title:"CAP Theorem & Consistency",      duration:"20:00", videoId:"k-Yaq8AHlFA" },
      ]},
      { id:2, title:"Databases & Caching", lessons:[
        { id:"2-1", title:"SQL vs NoSQL",                   duration:"24:00", videoId:"ruz-vK8IesE" },
        { id:"2-2", title:"Redis Caching Strategies",       duration:"20:00", videoId:"ruz-vK8IesE" },
        { id:"2-3", title:"Database Sharding & Replication",duration:"22:00", videoId:"5faMjKuB9bc" },
      ]},
      { id:3, title:"Real-world Designs", lessons:[
        { id:"3-1", title:"Design URL Shortener (TinyURL)", duration:"28:00", videoId:"JQDHz72OA3c" },
        { id:"3-2", title:"Design YouTube",                 duration:"32:00", videoId:"jPKTo1iGQiE" },
        { id:"3-3", title:"Design Twitter Timeline",        duration:"30:00", videoId:"wYk0xPP_P_8" },
        { id:"3-4", title:"Design WhatsApp Messaging",      duration:"28:00", videoId:"vvhC64hQZMk" },
      ]},
    ],
  },
  {
    id: "web-dev-react",
    title: "Full Stack Web Development",
    description: "HTML → CSS → JavaScript → React → Node.js → Databases. Build real production apps.",
    icon: "🌐",
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
    color: "#0a1628",
    level: "Beginner",
    totalLessons: 14,
    estimatedHours: 40,
    rating: 4.7,
    enrolled: 41200,
    tags: ["HTML","CSS","JavaScript","React","Node.js","MongoDB"],
    chapters: [
      { id:1, title:"HTML & CSS", lessons:[
        { id:"1-1", title:"HTML5 Semantic Structure",        duration:"18:00", videoId:"salY_Sm6mv4" },
        { id:"1-2", title:"CSS Flexbox Crash Course",        duration:"20:00", videoId:"phWxA89Dy94" },
        { id:"1-3", title:"CSS Grid Masterclass",            duration:"22:00", videoId:"EiNiSFIPIQE" },
        { id:"1-4", title:"Responsive Design & Media Queries",duration:"16:00",videoId:"yU7jJ3NbPdA" },
      ]},
      { id:2, title:"JavaScript", lessons:[
        { id:"2-1", title:"JavaScript Fundamentals",         duration:"25:00", videoId:"PkZNo7MFNFg" },
        { id:"2-2", title:"ES6+ Features",                   duration:"22:00", videoId:"NCwa_xi0Uuc" },
        { id:"2-3", title:"Async JS — Promises & Async/Await",duration:"20:00",videoId:"PoRJizFvM7s" },
        { id:"2-4", title:"DOM Manipulation",                duration:"18:00", videoId:"5fb2aPlgoys" },
      ]},
      { id:3, title:"React", lessons:[
        { id:"3-1", title:"React Fundamentals — Hooks",      duration:"28:00", videoId:"Ke90Tje7VS0" },
        { id:"3-2", title:"State Management with Zustand",   duration:"20:00", videoId:"_ngCLZ5Iz-0" },
        { id:"3-3", title:"React Router v6",                 duration:"18:00", videoId:"Ul3y1LXxzdU" },
      ]},
      { id:4, title:"Node.js & Backend", lessons:[
        { id:"4-1", title:"Node.js & Express REST API",      duration:"30:00", videoId:"fBNz5xF-Kx4" },
        { id:"4-2", title:"MongoDB & Mongoose",              duration:"25:00", videoId:"-56x56UppqQ" },
        { id:"4-3", title:"Authentication with JWT",         duration:"22:00", videoId:"mbsmsi7l3r4" },
      ]},
    ],
  },
  {
    id: "ml-python",
    title: "Machine Learning with Python",
    description: "NumPy → Pandas → Scikit-learn → Neural Networks → Deep Learning with TensorFlow.",
    icon: "🤖",
    thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    color: "#0e1a2e",
    level: "Intermediate",
    totalLessons: 10,
    estimatedHours: 30,
    rating: 4.6,
    enrolled: 16800,
    tags: ["Python","ML","TensorFlow","NumPy","Pandas","Neural Networks"],
    chapters: [
      { id:1, title:"Python for Data Science", lessons:[
        { id:"1-1", title:"NumPy Crash Course",              duration:"20:00", videoId:"QUT1VHiLmmI" },
        { id:"1-2", title:"Pandas for Data Analysis",        duration:"25:00", videoId:"vmEHCJofslg" },
        { id:"1-3", title:"Matplotlib & Seaborn",            duration:"18:00", videoId:"3Xc3CA655Y4" },
      ]},
      { id:2, title:"Machine Learning", lessons:[
        { id:"2-1", title:"Linear & Logistic Regression",    duration:"24:00", videoId:"VmbA0pi2cRQ" },
        { id:"2-2", title:"Decision Trees & Random Forests",  duration:"22:00", videoId:"g9c66TUylZ4" },
        { id:"2-3", title:"Support Vector Machines",          duration:"20:00", videoId:"efR1C6CvhmE" },
        { id:"2-4", title:"K-Means Clustering",              duration:"18:00", videoId:"4b5d3muPQmA" },
      ]},
      { id:3, title:"Deep Learning", lessons:[
        { id:"3-1", title:"Neural Networks from Scratch",    duration:"30:00", videoId:"aircAruvnKk" },
        { id:"3-2", title:"TensorFlow & Keras",              duration:"28:00", videoId:"tPYj3fFJGjk" },
        { id:"3-3", title:"Convolutional Neural Networks",   duration:"32:00", videoId:"YRhxdVk_sIs" },
      ]},
    ],
  },
  {
    id: "java-interview",
    title: "Java Interview Prep",
    description: "Java fundamentals → OOP → Collections → Multithreading → Spring Boot — ace your Java interviews.",
    icon: "☕",
    thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    color: "#1a0d0d",
    level: "Intermediate",
    totalLessons: 9,
    estimatedHours: 22,
    rating: 4.7,
    enrolled: 12300,
    tags: ["Java","OOP","Spring Boot","Multithreading","Collections"],
    chapters: [
      { id:1, title:"Core Java", lessons:[
        { id:"1-1", title:"Java OOP Concepts",               duration:"22:00", videoId:"pTB0EiLXUC8" },
        { id:"1-2", title:"Java Collections Framework",      duration:"28:00", videoId:"GdAon80-0KA" },
        { id:"1-3", title:"Generics & Lambdas",              duration:"20:00", videoId:"K1iu1kXkVoA" },
      ]},
      { id:2, title:"Concurrency", lessons:[
        { id:"2-1", title:"Java Multithreading",             duration:"25:00", videoId:"TCd8QIS-2KI" },
        { id:"2-2", title:"Executor Framework",              duration:"20:00", videoId:"sIkG0X4fqs4" },
        { id:"2-3", title:"Java Memory Model",               duration:"18:00", videoId:"WTVooKLLVT8" },
      ]},
      { id:3, title:"Spring Boot", lessons:[
        { id:"3-1", title:"Spring Boot REST API",            duration:"35:00", videoId:"9SGDpanrc8U" },
        { id:"3-2", title:"Spring Security & JWT",           duration:"28:00", videoId:"her_7pa0vrg" },
        { id:"3-3", title:"Spring Data JPA",                 duration:"25:00", videoId:"8SGI_XS5OPw" },
      ]},
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps Foundations",
    description: "Learn Linux, Git, Docker, CI/CD, cloud deployment, and the habits behind reliable software delivery.",
    icon: "☁️",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    color: "#102a43",
    level: "Intermediate",
    totalLessons: 9,
    estimatedHours: 20,
    rating: 4.8,
    enrolled: 15400,
    tags: ["Linux", "Docker", "AWS", "CI/CD", "DevOps"],
    chapters: [
      { id:1, title:"Linux & Git", lessons:[
        { id:"1-1", title:"Linux Command Line Essentials", duration:"24:00", videoId:"sWbUDq4S6Y8" },
        { id:"1-2", title:"Git Branching & Collaboration", duration:"20:00", videoId:"RGOj5yH7evk" },
        { id:"1-3", title:"Shell Scripts for Developers", duration:"18:00", videoId:"v-F3YLd6oMw" },
      ]},
      { id:2, title:"Containers & CI/CD", lessons:[
        { id:"2-1", title:"Docker Images and Containers", duration:"26:00", videoId:"fqMOX6JJhGo" },
        { id:"2-2", title:"GitHub Actions Pipeline", duration:"22:00", videoId:"R8_veQiYBjI" },
        { id:"2-3", title:"Testing in Continuous Integration", duration:"19:00", videoId:"scEDHsr3APg" },
      ]},
      { id:3, title:"Cloud Deployment", lessons:[
        { id:"3-1", title:"Cloud Concepts and Regions", duration:"21:00", videoId:"M988_fsOSWo" },
        { id:"3-2", title:"Deploy a Web App", duration:"28:00", videoId:"K5KVEU3aaeQ" },
        { id:"3-3", title:"Monitoring and Logs", duration:"20:00", videoId:"h4Sl21AKiDg" },
      ]},
    ],
  },
  {
    id: "sql-data-engineering",
    title: "SQL & Data Engineering",
    description: "Build strong SQL fundamentals, design reliable data models, and create practical analytics pipelines.",
    icon: "📈",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    color: "#182b49",
    level: "Beginner",
    totalLessons: 9,
    estimatedHours: 18,
    rating: 4.7,
    enrolled: 10900,
    tags: ["SQL", "PostgreSQL", "Data", "ETL", "Analytics"],
    chapters: [
      { id:1, title:"SQL Foundations", lessons:[
        { id:"1-1", title:"SELECT, WHERE, and ORDER BY", duration:"18:00", videoId:"qw--VYLpxG4" },
        { id:"1-2", title:"JOINs and Relationships", duration:"24:00", videoId:"9yeOJ0ZMUYw" },
        { id:"1-3", title:"Aggregations and GROUP BY", duration:"20:00", videoId:"4cWkVbC2bNE" },
      ]},
      { id:2, title:"Data Modeling", lessons:[
        { id:"2-1", title:"Normalization and Keys", duration:"22:00", videoId:"UrYLYV7WSHM" },
        { id:"2-2", title:"Indexes and Query Plans", duration:"25:00", videoId:"-qNSXK7s7_w" },
        { id:"2-3", title:"Transactions and Constraints", duration:"19:00", videoId:"p7q5fJp5s8M" },
      ]},
      { id:3, title:"Practical Pipelines", lessons:[
        { id:"3-1", title:"ETL Pipeline Design", duration:"23:00", videoId:"uNO0w3f6O3k" },
        { id:"3-2", title:"Analytics with Window Functions", duration:"27:00", videoId:"H6OTMoXjNiM" },
        { id:"3-3", title:"Build a Reporting Dataset", duration:"24:00", videoId:"7S_tz1z_5bA" },
      ]},
    ],
  },
];

// Quiz questions bank
export const QUIZ_QUESTIONS = {
  "Data Structures": [
    { id:"ds1", question:"What is the time complexity of accessing an element in a hash table (average case)?", options:["O(n)","O(log n)","O(1)","O(n²)"], answer:2, explanation:"Hash tables provide O(1) average access time using hash functions to directly compute array indices.", difficulty:"Easy" },
    { id:"ds2", question:"Which data structure follows LIFO (Last In First Out) order?", options:["Queue","Stack","Heap","Linked List"], answer:1, explanation:"A Stack follows LIFO: the last element pushed is the first popped.", difficulty:"Easy" },
    { id:"ds3", question:"What is the space complexity of Merge Sort?", options:["O(1)","O(log n)","O(n)","O(n log n)"], answer:2, explanation:"Merge Sort requires O(n) additional space for temporary arrays during merging.", difficulty:"Medium" },
    { id:"ds4", question:"In a Min-Heap, where is the minimum element?", options:["Last node","Root","Middle","Leaf"], answer:1, explanation:"A Min-Heap always keeps the minimum element at the root.", difficulty:"Easy" },
    { id:"ds5", question:"What is the worst-case time complexity of QuickSort?", options:["O(n log n)","O(n)","O(n²)","O(log n)"], answer:2, explanation:"QuickSort degrades to O(n²) when the pivot is always the smallest or largest element.", difficulty:"Medium" },
    { id:"ds6", question:"Which traversal of a BST gives nodes in sorted order?", options:["Pre-order","In-order","Post-order","Level-order"], answer:1, explanation:"In-order traversal (Left → Root → Right) of a BST yields elements in ascending sorted order.", difficulty:"Easy" },
    { id:"ds7", question:"What is the time complexity of deleting from a Balanced BST?", options:["O(1)","O(log n)","O(n)","O(n log n)"], answer:1, explanation:"Balanced BSTs (AVL, Red-Black) maintain O(log n) height, so deletion is O(log n).", difficulty:"Medium" },
    { id:"ds8", question:"Which data structure is used to implement BFS?", options:["Stack","Priority Queue","Queue","Deque"], answer:2, explanation:"BFS uses a Queue (FIFO) to process nodes level by level.", difficulty:"Easy" },
    { id:"ds9", question:"What is the time complexity of building a heap from an array?", options:["O(n log n)","O(n)","O(log n)","O(n²)"], answer:1, explanation:"Building a heap is O(n) using Floyd's heap construction algorithm.", difficulty:"Hard" },
    { id:"ds10",question:"A full binary tree with n leaf nodes has how many internal nodes?", options:["n","n-1","n+1","2n"], answer:1, explanation:"A full binary tree with n leaves has exactly n-1 internal nodes.", difficulty:"Medium" },
  ],
  "Algorithms": [
    { id:"alg1", question:"Binary Search requires the array to be:", options:["Sorted","Unsorted","Partially sorted","Non-empty only"], answer:0, explanation:"Binary Search relies on sorted order to eliminate half the search space each step.", difficulty:"Easy" },
    { id:"alg2", question:"Dijkstra's algorithm is used for:", options:["All-pairs shortest path","Single-source shortest path (non-negative weights)","Minimum spanning tree","Topological sort"], answer:1, explanation:"Dijkstra finds single-source shortest paths in graphs with non-negative edge weights.", difficulty:"Medium" },
    { id:"alg3", question:"What is the time complexity of Merge Sort?", options:["O(n)","O(n log n)","O(n²)","O(log n)"], answer:1, explanation:"Merge Sort always runs in O(n log n) time — optimal for comparison-based sorting.", difficulty:"Easy" },
    { id:"alg4", question:"Which algorithm is NOT used for topological sorting?", options:["Kahn's algorithm","DFS-based","BFS-based","Bellman-Ford"], answer:3, explanation:"Bellman-Ford is a shortest path algorithm, not used for topological sorting.", difficulty:"Medium" },
    { id:"alg5", question:"What is the time complexity of Floyd-Warshall algorithm?", options:["O(V²)","O(V³)","O(E log V)","O(VE)"], answer:1, explanation:"Floyd-Warshall runs in O(V³) using three nested loops over all vertex pairs.", difficulty:"Hard" },
    { id:"alg6", question:"Which sorting algorithm has the best average-case performance?", options:["Bubble Sort","Insertion Sort","Quick Sort","Selection Sort"], answer:2, explanation:"QuickSort has average O(n log n) and excellent cache performance in practice.", difficulty:"Medium" },
    { id:"alg7", question:"What does 'memoization' mean in DP?", options:["Divide problem into subproblems","Cache results of subproblems top-down","Build table bottom-up","Use greedy choices"], answer:1, explanation:"Memoization is the top-down DP technique of caching expensive function call results.", difficulty:"Easy" },
    { id:"alg8", question:"Kruskal's algorithm builds a:", options:["Shortest Path Tree","Minimum Spanning Tree","Max Flow Graph","Topological Order"], answer:1, explanation:"Kruskal's greedily adds lowest-weight edges that don't form cycles, building an MST.", difficulty:"Medium" },
  ],
  "Dynamic Programming": [
    { id:"dp1", question:"What is the base case for Fibonacci DP?", options:["fib(0)=0, fib(1)=1","fib(0)=1, fib(1)=1","fib(1)=1, fib(2)=2","fib(0)=0, fib(1)=0"], answer:0, explanation:"The standard Fibonacci base cases are fib(0)=0 and fib(1)=1.", difficulty:"Easy" },
    { id:"dp2", question:"The Knapsack Problem is an example of which type of DP?", options:["1D DP","2D DP","Interval DP","Tree DP"], answer:1, explanation:"The 0/1 Knapsack uses a 2D DP table (items × capacity).", difficulty:"Medium" },
    { id:"dp3", question:"Longest Common Subsequence has time complexity:", options:["O(n)","O(n log n)","O(nm)","O(n²m)"], answer:2, explanation:"LCS of strings of lengths n and m requires an n×m DP table — O(nm).", difficulty:"Medium" },
    { id:"dp4", question:"What makes a problem suitable for DP?", options:["It has a greedy solution","Optimal substructure & overlapping subproblems","It can be solved in O(n log n)","It requires backtracking"], answer:1, explanation:"DP is applicable when a problem has optimal substructure (optimal solution built from optimal subproblems) and overlapping subproblems.", difficulty:"Medium" },
    { id:"dp5", question:"Coin Change DP fills the table in what order?", options:["Right to left","Top to bottom, right to left","Bottom up from 0 to target","Randomly"], answer:2, explanation:"Coin Change fills dp[0..amount] from left to right, building up the minimum coins for each amount.", difficulty:"Hard" },
  ],
  "Graphs": [
    { id:"g1", question:"DFS uses which data structure internally?", options:["Queue","Stack (or call stack)","Heap","Deque"], answer:1, explanation:"DFS uses a stack (either explicit or implicit via recursion call stack).", difficulty:"Easy" },
    { id:"g2", question:"Which algorithm detects negative cycles in a graph?", options:["Dijkstra","BFS","Bellman-Ford","Prim's"], answer:2, explanation:"Bellman-Ford can detect negative cycles by checking if any edge can still be relaxed after V-1 iterations.", difficulty:"Hard" },
    { id:"g3", question:"A tree with n nodes has how many edges?", options:["n","n-1","n+1","n/2"], answer:1, explanation:"A tree is a connected acyclic graph. n nodes → exactly n-1 edges.", difficulty:"Easy" },
    { id:"g4", question:"Topological sort is only possible on:", options:["Undirected graphs","Directed Acyclic Graphs (DAGs)","Weighted graphs","Complete graphs"], answer:1, explanation:"Topological sort requires a DAG — it's undefined for graphs with cycles.", difficulty:"Medium" },
    { id:"g5", question:"In BFS, all nodes at distance d are visited before nodes at distance:", options:["d-1","d","d+1","2d"], answer:2, explanation:"BFS explores nodes level by level — all distance-d nodes before any distance-(d+1) node.", difficulty:"Easy" },
  ],
  "Python": [
    { id:"py1", question:"What does `list(range(5))` produce?", options:["[1,2,3,4,5]","[0,1,2,3,4]","[0,1,2,3,4,5]","[1,2,3,4]"], answer:1, explanation:"range(5) generates 0,1,2,3,4 — five numbers starting from 0.", difficulty:"Easy" },
    { id:"py2", question:"Which Python data structure provides O(1) average lookup?", options:["List","Tuple","Dictionary","Set"], answer:2, explanation:"Python dictionaries use hash tables providing O(1) average-case lookup.", difficulty:"Easy" },
    { id:"py3", question:"What is the output of `[x**2 for x in range(4)]`?", options:["[1,4,9,16]","[0,1,4,9]","[0,1,4,9,16]","[1,2,3,4]"], answer:1, explanation:"x ranges over 0,1,2,3 and x² gives 0,1,4,9.", difficulty:"Easy" },
    { id:"py4", question:"What does `*args` in a function definition mean?", options:["Single argument","Keyword arguments","Variable positional arguments","No arguments"], answer:2, explanation:"*args captures a variable number of positional arguments as a tuple.", difficulty:"Medium" },
    { id:"py5", question:"What is the GIL in Python?", options:["Global Import Lock","Global Interpreter Lock","Garbage In Loop","General Interface Layer"], answer:1, explanation:"The Global Interpreter Lock (GIL) prevents multiple Python threads from executing bytecode simultaneously.", difficulty:"Hard" },
    { id:"py6", question:"What does `zip([1,2],[3,4])` produce when converted to a list?", options:["[(1,3),(2,4)]","[(1,2),(3,4)]","[[1,3],[2,4]]","[1,2,3,4]"], answer:0, explanation:"zip pairs values by position, producing tuples (1,3) and (2,4).", difficulty:"Medium" },
    { id:"py7", question:"What is the output of `''.join(['a','b'])`?", options:["ab","a b","['a','b']","a+b"], answer:0, explanation:"join concatenate list strings without separators, producing 'ab'.", difficulty:"Easy" },
    { id:"py8", question:"How do you define a set literal with values 1 and 2?", options:["{1,2}","[1,2]","(1,2)","set(1,2)"], answer:0, explanation:"Python set literals are written with curly braces, e.g. {1,2}.", difficulty:"Easy" },
    { id:"py9", question:"What does `enumerate()` do?", options:["Counts items","Returns index and value","Filters list","Reverses list"], answer:1, explanation:"enumerate() returns pairs of (index, value) for each item in a sequence.", difficulty:"Medium" },
    { id:"py10", question:"Which keyword creates a generator function?", options:["def","lambda","yield","async"], answer:2, explanation:"The yield keyword is used in functions to create generators that produce values lazily.", difficulty:"Hard" },
    { id:"py11", question:"What is the difference between `==` and `is`?", options:["No difference","== checks value, is checks identity","is checks value, == checks identity","== is for numbers, is for objects"], answer:1, explanation:"== compares values while is checks if two variables refer to the same object in memory.", difficulty:"Hard" },
    { id:"py12", question:"What does `@property` decorator do?", options:["Makes a static method","Makes a method callable as an attribute","Caches function results","Marks a private method"], answer:1, explanation:"@property allows you to access a method like an attribute without parentheses, e.g., obj.value instead of obj.value().", difficulty:"Medium" },
  ],
  "Web Development": [
    { id:"web1", question:"What does CSS Specificity determine?", options:["Page load speed","Which style rules apply","Browser compatibility","File size"], answer:1, explanation:"CSS specificity determines which style rules are applied when multiple rules target the same element.", difficulty:"Easy" },
    { id:"web2", question:"What is the purpose of the box model in CSS?", options:["Animations","Layout structure for elements","Color management","Typography"], answer:1, explanation:"The box model (margin, border, padding, content) defines how elements are spaced and sized on a page.", difficulty:"Easy" },
    { id:"web3", question:"What is the difference between `let` and `var` in JavaScript?", options:["No difference","let has block scope, var has function scope","var has block scope, let has function scope","var is deprecated"], answer:1, explanation:"let has block scope (limited to { }), while var has function scope and can be re-declared.", difficulty:"Medium" },
    { id:"web4", question:"What is event delegation in JavaScript?", options:["Canceling events","Handling events on parent elements instead of individual child elements","Creating custom events","Preventing default behavior"], answer:1, explanation:"Event delegation leverages event bubbling to handle events on parent elements, reducing listener count and improving performance.", difficulty:"Hard" },
    { id:"web5", question:"What does `this` refer to in an arrow function?", options:["The object calling the function","The parent scope's `this`","Always undefined","The function itself"], answer:1, explanation:"Arrow functions inherit `this` from their enclosing scope, unlike regular functions which get `this` from the caller.", difficulty:"Medium" },
    { id:"web6", question:"What is the Virtual DOM in React?", options:["A real DOM element","A JavaScript representation of the real DOM for optimization","A browser feature","A styling tool"], answer:1, explanation:"The Virtual DOM is an abstraction layer that React uses to efficiently update the real DOM by comparing changes.", difficulty:"Medium" },
    { id:"web7", question:"What is middleware in Express.js?", options:["A database layer","Functions that handle requests/responses in a pipeline","A template engine","A type of variable"], answer:1, explanation:"Middleware functions in Express process requests and responses in sequence, allowing you to add functionality like logging, authentication, etc.", difficulty:"Medium" },
    { id:"web8", question:"How does CORS work?", options:["Encrypts data","Prevents cross-origin requests by default and allows them via headers","Speeds up requests","Caches responses"], answer:1, explanation:"CORS (Cross-Origin Resource Sharing) is a security feature that restricts cross-origin requests by default but allows them if the server sends appropriate headers.", difficulty:"Hard" },
    { id:"web9", question:"What is JWT (JSON Web Token)?", options:["A database query language","A stateless authentication token containing encoded data","A JavaScript framework","A CSS preprocessing language"], answer:1, explanation:"JWT is a compact, self-contained token that securely transmits information between parties and is commonly used for stateless authentication.", difficulty:"Hard" },
    { id:"web10", question:"What are React Hooks?", options:["Debugging tools","Functions that let you use state and lifecycle features in functional components","CSS frameworks","Browser extensions"], answer:1, explanation:"Hooks (like useState, useEffect) allow functional components to have state management and side effects, eliminating the need for class components.", difficulty:"Medium" },
  ],
  "System Design": [
    { id:"sys1", question:"What is horizontal scaling?", options:["Increasing server speed","Adding more servers to distribute load","Increasing server memory","Optimizing code"], answer:1, explanation:"Horizontal scaling means adding more machines/servers to handle increased load, as opposed to vertical scaling which adds resources to a single machine.", difficulty:"Easy" },
    { id:"sys2", question:"What is the CAP Theorem?", options:["A programming language","States a system can't have Consistency, Availability, and Partition tolerance simultaneously","A database optimization technique","A security protocol"], answer:1, explanation:"CAP Theorem states that distributed systems can guarantee at most 2 of 3: Consistency (all nodes see same data), Availability (system always responds), Partition tolerance (works despite network failures).", difficulty:"Hard" },
    { id:"sys3", question:"What is caching?", options:["Storing data permanently","Temporarily storing frequently accessed data for faster retrieval","Compressing files","Encrypting data"], answer:1, explanation:"Caching stores frequently accessed data in fast-access storage (memory) to reduce latency and improve performance.", difficulty:"Easy" },
    { id:"sys4", question:"What is a load balancer?", options:["Balances CSS rules","Distributes incoming requests across multiple servers","Balances database records","Optimizes memory usage"], answer:1, explanation:"A load balancer distributes incoming traffic across multiple servers to prevent any single server from becoming a bottleneck.", difficulty:"Easy" },
    { id:"sys5", question:"What is database replication?", options:["Copying database code","Creating copies of data on multiple servers for redundancy and availability","Duplicating queries","Backing up data"], answer:1, explanation:"Database replication maintains copies of data across multiple servers, ensuring data availability and enabling failover in case of server failure.", difficulty:"Medium" },
    { id:"sys6", question:"What is database sharding?", options:["Deleting data","Horizontally partitioning data across multiple databases based on a key","Compressing the database","Creating backups"], answer:1, explanation:"Sharding partitions large datasets horizontally across multiple database instances (shards), each handling a subset of data, to improve scalability and performance.", difficulty:"Hard" },
    { id:"sys7", question:"What is eventual consistency?", options:["Data is always consistent","Data will eventually become consistent across all nodes after updates","Data is never consistent","Consistency is optional"], answer:1, explanation:"Eventual consistency means that in a distributed system, all nodes will eventually converge to the same state, though there may be temporary inconsistencies.", difficulty:"Hard" },
    { id:"sys8", question:"What is message queuing?", options:["Ordering messages alphabetically","Using a queue to manage asynchronous task processing","A sorting algorithm","A caching technique"], answer:1, explanation:"Message queues (like RabbitMQ, Kafka) enable asynchronous communication between services by storing messages temporarily, decoupling producers and consumers.", difficulty:"Medium" },
  ],
  "JavaScript Advanced": [
    { id:"jsadv1", question:"What is event bubbling?", options:["Events rise from child to parent elements","Events sink from parent to child","Events don't propagate","Events are canceled"], answer:0, explanation:"Event bubbling causes an event to propagate up from the target element through its ancestors in the DOM tree.", difficulty:"Medium" },
    { id:"jsadv2", question:"What is prototype inheritance?", options:["A design pattern","Objects inherit properties from other objects via the prototype chain","Class-based inheritance only","A deprecated feature"], answer:1, explanation:"Prototypal inheritance allows objects to inherit directly from other objects through the prototype chain, enabling code reuse and property lookup delegation.", difficulty:"Hard" },
    { id:"jsadv3", question:"What does `Object.create()` do?", options:["Creates a copy of an object","Creates a new object with specified prototype","Creates an empty object","Merges objects"], answer:1, explanation:"Object.create(proto) creates a new object with the specified object as its prototype, enabling explicit prototype-based inheritance.", difficulty:"Medium" },
    { id:"jsadv4", question:"What is the difference between `map()` and `forEach()`?", options:["No difference","map returns a new array, forEach doesn't return anything","forEach returns an array, map doesn't","They're used differently"],answer:1, explanation:"map() returns a new array with transformed elements, while forEach() iterates without returning a value and is used for side effects.", difficulty:"Easy" },
    { id:"jsadv5", question:"What is currying in JavaScript?", options:["A food","Transforming a function to accept arguments one at a time","A loop technique","Error handling"], answer:1, explanation:"Currying transforms a function that takes multiple arguments into a series of functions that each take one argument, useful for partial application.", difficulty:"Hard" },
    { id:"jsadv6", question:"What does `apply()` do?", options:["Applies styles","Calls a function with a specific `this` value and arguments as an array","Applies a filter","Applies animations"], answer:1, explanation:"apply() calls a function with a specified `this` context and passes arguments as an array, similar to call() but taking arguments differently.", difficulty:"Medium" },
    { id:"jsadv7", question:"What are Symbols?", options:["Mathematical operators","Unique immutable data types used for object property keys","Syntax markers","Deprecated features"], answer:1, explanation:"Symbols are unique, immutable values often used as object property keys to ensure no naming conflicts, providing property privacy.", difficulty:"Hard" },
    { id:"jsadv8", question:"What is destructuring?", options:["Breaking down code","Extracting values from arrays or object properties into variables","Deleting variables","Refactoring code"], answer:1, explanation:"Destructuring is a convenient way to extract values from arrays or objects into separate variables, reducing code verbosity.", difficulty:"Easy" },
  ],
};

const EXTRA_QUIZ_QUESTIONS = {
  "Data Structures": [
    { id:"ds11", question:"Which structure is best for checking balanced parentheses?", options:["Stack","Queue","Heap","Graph"], answer:0, explanation:"A stack matches the most recently opened bracket first, which is exactly the required LIFO behavior.", difficulty:"Easy" },
    { id:"ds12", question:"What is the average lookup complexity of a well-balanced binary search tree?", options:["O(n²)","O(log n)","O(1)","O(n log n)"], answer:1, explanation:"A balanced tree has logarithmic height, so search visits O(log n) nodes.", difficulty:"Medium" },
  ],
  "Algorithms": [
    { id:"alg9", question:"Which technique solves the activity-selection problem efficiently?", options:["Greedy choice","Brute force only","Hashing only","Backtracking only"], answer:0, explanation:"Selecting the activity with the earliest finishing time leaves the most room for future activities.", difficulty:"Medium" },
    { id:"alg10", question:"What does BFS find in an unweighted graph?", options:["A minimum spanning tree only","Shortest paths by edge count","Negative cycles","A topological order always"], answer:1, explanation:"BFS explores by distance layers, giving shortest paths measured in number of edges.", difficulty:"Medium" },
  ],
  "Dynamic Programming": [
    { id:"dp6", question:"What is the usual time complexity of the 0/1 Knapsack DP?", options:["O(nW)","O(n+W)","O(2^n) always","O(W log n)"], answer:0, explanation:"The table has one dimension for items and one for capacity, giving O(nW).", difficulty:"Medium" },
    { id:"dp7", question:"Which property lets DP reuse a previously computed result?", options:["Randomization","Overlapping subproblems","A sorted input","Constant memory"], answer:1, explanation:"Overlapping subproblems mean the same smaller problems recur and can be cached.", difficulty:"Easy" },
  ],
  "Graphs": [
    { id:"g6", question:"Which algorithm is commonly used for a minimum spanning tree?", options:["Prim's","KMP","Binary Search","Floyd-Warshall only"], answer:0, explanation:"Prim's grows a minimum spanning tree by repeatedly adding the cheapest crossing edge.", difficulty:"Medium" },
    { id:"g7", question:"What is the purpose of a visited set in graph traversal?", options:["Sort vertices","Avoid revisiting vertices","Increase edge weights","Create cycles"], answer:1, explanation:"Tracking visited vertices prevents repeated work and infinite traversal through cycles.", difficulty:"Easy" },
  ],
  "Python": [
    { id:"py13", question:"Which keyword handles an exception in Python?", options:["catch","except","rescue","handle"], answer:1, explanation:"Python uses try and except blocks to catch and handle exceptions.", difficulty:"Easy" },
    { id:"py14", question:"What does a Python dictionary comprehension create?", options:["A dictionary expression","A generator only","A class","A module"], answer:0, explanation:"Dictionary comprehensions build dictionaries from an iterable using key-value expressions.", difficulty:"Medium" },
  ],
  "Web Development": [
    { id:"web11", question:"Which HTTP method is commonly used to create a resource?", options:["GET","POST","DELETE","HEAD"], answer:1, explanation:"POST commonly sends data to create a new resource on the server.", difficulty:"Easy" },
    { id:"web12", question:"What does responsive design adapt to?", options:["Only desktop screens","Different screen sizes and devices","Database schemas","Server memory"], answer:1, explanation:"Responsive layouts adapt their structure and styles to different viewport sizes.", difficulty:"Easy" },
  ],
  "System Design": [
    { id:"sys9", question:"What is a CDN primarily used for?", options:["Serving content closer to users","Writing database schemas","Compiling Java code","Replacing authentication"], answer:0, explanation:"A CDN caches and serves content from geographically distributed edge locations.", difficulty:"Easy" },
    { id:"sys10", question:"Why use a database index?", options:["To speed up selected queries","To encrypt every row","To remove all storage","To disable backups"], answer:0, explanation:"Indexes provide data structures that help the database locate matching rows faster.", difficulty:"Medium" },
  ],
  "JavaScript Advanced": [
    { id:"jsadv9", question:"What does a Promise represent?", options:["A future asynchronous result","A CSS rule","A loop counter","A DOM node"], answer:0, explanation:"A Promise represents the eventual completion or failure of an asynchronous operation.", difficulty:"Easy" },
    { id:"jsadv10", question:"What does strict equality (===) compare?", options:["Only string length","Value and type without coercion","Only object identity","Nothing"], answer:1, explanation:"=== compares both type and value without converting operands.", difficulty:"Easy" },
  ],
};

Object.entries(EXTRA_QUIZ_QUESTIONS).forEach(([topic, extra]) => {
  QUIZ_QUESTIONS[topic] = [...QUIZ_QUESTIONS[topic], ...extra];
});

export const QUIZ_TOPICS = Object.keys(QUIZ_QUESTIONS);

// Forum posts seed
// DSA Roadmap
export const ROADMAP_NODES = [
  { id:"arrays",    title:"Arrays & Hashing",       prerequisites:[],             problemIds:[1,2,3,4,5],  status:"done",   icon:"✅" },
  { id:"twoptr",    title:"Two Pointers",            prerequisites:["arrays"],     problemIds:[9,10,107],   status:"done",   icon:"✅" },
  { id:"sliding",   title:"Sliding Window",          prerequisites:["twoptr"],     problemIds:[18,19,20],   status:"done",   icon:"✅" },
  { id:"stack",     title:"Stack",                   prerequisites:["arrays"],     problemIds:[21,22],      status:"active", icon:"🔵" },
  { id:"binsearch", title:"Binary Search",           prerequisites:["arrays"],     problemIds:[92,93,94],   status:"active", icon:"🔵" },
  { id:"linkedlist",title:"Linked List",             prerequisites:["arrays"],     problemIds:[28,29,34],   status:"locked", icon:"🔒" },
  { id:"trees",     title:"Trees",                   prerequisites:["linkedlist"], problemIds:[39,40,41],   status:"locked", icon:"🔒" },
  { id:"heap",      title:"Heap / Priority Queue",   prerequisites:["trees"],      problemIds:[86,87,88],   status:"locked", icon:"🔒" },
  { id:"graphs",    title:"Graphs",                  prerequisites:["trees"],      problemIds:[54,55,56],   status:"locked", icon:"🔒" },
  { id:"backtrack", title:"Backtracking",            prerequisites:["trees"],      problemIds:[98,99,101],  status:"locked", icon:"🔒" },
  { id:"dp",        title:"Dynamic Programming",     prerequisites:["graphs","heap"],problemIds:[68,70,75], status:"locked", icon:"🔒" },
  { id:"advanced",  title:"Advanced Patterns",       prerequisites:["dp"],         problemIds:[83,84,85],   status:"locked", icon:"🔒" },
];

export const WEB_DEV_ROADMAP = [
  { id:"html",      title:"HTML Fundamentals",      prerequisites:[],             problemIds:[200,201,202,236],status:"done",   icon:"✅" },
  { id:"css",       title:"CSS & Styling",           prerequisites:["html"],       problemIds:[203,204,205,237,238],status:"done",   icon:"✅" },
  { id:"js-basics", title:"JavaScript Basics",       prerequisites:["css"],        problemIds:[206,207,208,239],status:"active", icon:"🔵" },
  { id:"dom",       title:"DOM Manipulation",        prerequisites:["js-basics"],  problemIds:[209,210,211,240],status:"active", icon:"🔵" },
  { id:"async",     title:"Async & Promises",        prerequisites:["dom"],        problemIds:[212,213,214,241,242],status:"locked", icon:"🔒" },
  { id:"react",     title:"React Fundamentals",      prerequisites:["js-basics"],  problemIds:[215,216,217,243,244,245],status:"locked", icon:"🔒" },
  { id:"state",     title:"State Management",        prerequisites:["react"],      problemIds:[218,219,220,246],status:"locked", icon:"🔒" },
  { id:"rest-api",  title:"REST APIs",               prerequisites:["async"],      problemIds:[221,222,223,249],status:"locked", icon:"🔒" },
  { id:"databases", title:"Databases & SQL",         prerequisites:["rest-api"],   problemIds:[224,225,226,250],status:"locked", icon:"🔒" },
  { id:"backend",   title:"Backend Development",     prerequisites:["databases"],  problemIds:[227,228,229,248,251],status:"locked", icon:"🔒" },
  { id:"devops",    title:"DevOps & Deployment",     prerequisites:["backend"],    problemIds:[230,231,232,253],status:"locked", icon:"🔒" },
  { id:"fullstack", title:"Full Stack Project",      prerequisites:["devops"],     problemIds:[233,234,235,247,252],status:"locked", icon:"🔒" },
];

export const ML_ROADMAP = [
  { id:"math",      title:"Linear Algebra & Calculus", prerequisites:[],           problemIds:[300,301,302,336,337],status:"done",   icon:"✅" },
  { id:"stats",     title:"Probability & Statistics",  prerequisites:["math"],     problemIds:[303,304,305,338,339],status:"done",   icon:"✅" },
  { id:"python",    title:"Python for ML",            prerequisites:["stats"],     problemIds:[306,307,308,340],status:"active", icon:"🔵" },
  { id:"numpy",     title:"NumPy & Pandas",           prerequisites:["python"],    problemIds:[309,310,311,341,342,343],status:"active", icon:"🔵" },
  { id:"viz",       title:"Data Visualization",       prerequisites:["numpy"],     problemIds:[312,313,314],status:"locked", icon:"🔒" },
  { id:"sklearn",   title:"Scikit-Learn",             prerequisites:["numpy"],     problemIds:[315,316,317,344],status:"locked", icon:"🔒" },
  { id:"supervised",title:"Supervised Learning",      prerequisites:["sklearn"],   problemIds:[318,319,320,345,346,347],status:"locked", icon:"🔒" },
  { id:"unsupervised",title:"Unsupervised Learning",  prerequisites:["sklearn"],   problemIds:[321,322,323,348,349],status:"locked", icon:"🔒" },
  { id:"neural",    title:"Neural Networks",          prerequisites:["supervised"],problemIds:[324,325,326,350],status:"locked", icon:"🔒" },
  { id:"nlp",       title:"NLP & Text Processing",    prerequisites:["neural"],    problemIds:[327,328,329,351],status:"locked", icon:"🔒" },
  { id:"cv",        title:"Computer Vision",          prerequisites:["neural"],    problemIds:[330,331,332,352],status:"locked", icon:"🔒" },
  { id:"projects",  title:"ML Projects",              prerequisites:["nlp","cv"],  problemIds:[333,334,335,353],status:"locked", icon:"🔒" },
];

// Badges
export const BADGES = [
  { id:"first_solve",   icon:"🎯", title:"First Blood",    desc:"Solve your first problem",          xp:50   },
  { id:"streak_7",      icon:"🔥", title:"Hot Week",        desc:"Maintain a 7-day streak",           xp:100  },
  { id:"streak_30",     icon:"💎", title:"Diamond Streak",  desc:"Maintain a 30-day streak",          xp:500  },
  { id:"speed_demon",   icon:"⚡", title:"Speed Demon",     desc:"Solve Medium in under 5 minutes",   xp:200  },
  { id:"solver_50",     icon:"🌟", title:"Half Century",    desc:"Solve 50 problems",                 xp:200  },
  { id:"solver_100",    icon:"💯", title:"Century",         desc:"Solve 100 problems",                xp:500  },
  { id:"quiz_perfect",  icon:"🎓", title:"Scholar",         desc:"Score 100% on any quiz",            xp:150  },
  { id:"night_owl",     icon:"🌙", title:"Night Owl",       desc:"Submit solution between 12am-4am",  xp:75   },
  { id:"helper",        icon:"🤝", title:"Helper",          desc:"Help the learning community with quality answers",   xp:200  },
  { id:"top_100",       icon:"👑", title:"Elite",           desc:"Reach Top 100 on leaderboard",      xp:1000 },
];
