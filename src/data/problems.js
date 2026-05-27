// src/data/problems.js
// 100+ problems across all topics and difficulty levels

export const PROBLEMS = [
  // ── ARRAYS ──────────────────────────────────────────────
  { id:1,   title:"Two Sum",                              difficulty:"Easy",   topics:["Array","Hash Table"],         acceptance:49.2, xp:30,  companies:["Google","Amazon","Apple"] },
  { id:2,   title:"Best Time to Buy and Sell Stock",      difficulty:"Easy",   topics:["Array","DP"],                 acceptance:54.3, xp:30,  companies:["Amazon","Facebook"] },
  { id:3,   title:"Contains Duplicate",                   difficulty:"Easy",   topics:["Array","Hash Table"],         acceptance:61.2, xp:30,  companies:["Apple","Netflix"] },
  { id:4,   title:"Product of Array Except Self",         difficulty:"Medium", topics:["Array","Prefix Sum"],         acceptance:65.5, xp:60,  companies:["Facebook","Amazon","Microsoft"] },
  { id:5,   title:"Maximum Subarray",                     difficulty:"Medium", topics:["Array","DP","Divide&Conquer"],acceptance:50.3, xp:60,  companies:["Amazon","Google","Apple"] },
  { id:6,   title:"Maximum Product Subarray",             difficulty:"Medium", topics:["Array","DP"],                 acceptance:34.8, xp:60,  companies:["Amazon","Google"] },
  { id:7,   title:"Find Minimum in Rotated Sorted Array", difficulty:"Medium", topics:["Array","Binary Search"],      acceptance:49.0, xp:60,  companies:["Facebook","Microsoft"] },
  { id:8,   title:"Search in Rotated Sorted Array",       difficulty:"Medium", topics:["Array","Binary Search"],      acceptance:38.9, xp:60,  companies:["Facebook","Amazon","Bloomberg"] },
  { id:9,   title:"3Sum",                                 difficulty:"Medium", topics:["Array","Two Pointers"],       acceptance:32.1, xp:60,  companies:["Facebook","Amazon","Adobe"] },
  { id:10,  title:"Container With Most Water",            difficulty:"Medium", topics:["Array","Two Pointers","Greedy"],acceptance:54.5,xp:60,  companies:["Facebook","Google","Amazon"] },
  { id:11,  title:"Trapping Rain Water",                  difficulty:"Hard",   topics:["Array","Two Pointers","Stack"],acceptance:60.0,xp:120, companies:["Amazon","Google","Facebook"] },
  { id:12,  title:"Merge Intervals",                      difficulty:"Medium", topics:["Array","Sorting"],            acceptance:46.6, xp:60,  companies:["Google","Facebook","Microsoft"] },
  { id:13,  title:"Insert Interval",                      difficulty:"Medium", topics:["Array"],                      acceptance:38.9, xp:60,  companies:["Google"] },
  { id:14,  title:"Largest Rectangle in Histogram",       difficulty:"Hard",   topics:["Array","Stack","Monotonic"],  acceptance:43.7, xp:120, companies:["Amazon","Google","Facebook"] },
  { id:15,  title:"Rotate Array",                         difficulty:"Medium", topics:["Array","Math"],               acceptance:39.0, xp:60,  companies:["Microsoft","Amazon"] },

  // ── STRINGS ─────────────────────────────────────────────
  { id:16,  title:"Valid Anagram",                        difficulty:"Easy",   topics:["String","Hash Table"],        acceptance:63.3, xp:30,  companies:["Google","Amazon","Facebook"] },
  { id:17,  title:"Valid Palindrome",                     difficulty:"Easy",   topics:["String","Two Pointers"],      acceptance:43.0, xp:30,  companies:["Facebook","Microsoft","Uber"] },
  { id:18,  title:"Longest Substring Without Repeating",  difficulty:"Medium", topics:["String","Sliding Window"],    acceptance:33.8, xp:60,  companies:["Amazon","Bloomberg","Facebook"] },
  { id:19,  title:"Longest Repeating Character Replacement",difficulty:"Medium",topics:["String","Sliding Window"],  acceptance:52.6, xp:60,  companies:["Google"] },
  { id:20,  title:"Minimum Window Substring",             difficulty:"Hard",   topics:["String","Sliding Window"],    acceptance:41.0, xp:120, companies:["Facebook","Amazon","LinkedIn"] },
  { id:21,  title:"Valid Parentheses",                    difficulty:"Easy",   topics:["String","Stack"],             acceptance:40.6, xp:30,  companies:["Facebook","Amazon","Google"] },
  { id:22,  title:"Generate Parentheses",                 difficulty:"Medium", topics:["String","Backtracking","DP"], acceptance:73.4, xp:60,  companies:["Google","Amazon","Facebook"] },
  { id:23,  title:"Longest Palindromic Substring",        difficulty:"Medium", topics:["String","DP"],                acceptance:32.4, xp:60,  companies:["Amazon","Microsoft","Google"] },
  { id:24,  title:"Palindromic Substrings",               difficulty:"Medium", topics:["String","DP"],                acceptance:68.4, xp:60,  companies:["Facebook","LinkedIn"] },
  { id:25,  title:"Group Anagrams",                       difficulty:"Medium", topics:["String","Hash Table","Sorting"],acceptance:67.0,xp:60,  companies:["Amazon","Facebook","Uber"] },
  { id:26,  title:"Encode and Decode Strings",            difficulty:"Medium", topics:["String","Design"],            acceptance:40.0, xp:60,  companies:["Google"] },
  { id:27,  title:"Find All Anagrams in a String",        difficulty:"Medium", topics:["String","Sliding Window","Hash Table"],acceptance:48.8,xp:60, companies:["Facebook","Amazon"] },

  // ── LINKED LIST ─────────────────────────────────────────
  { id:28,  title:"Reverse Linked List",                  difficulty:"Easy",   topics:["Linked List","Recursion"],    acceptance:73.4, xp:30,  companies:["Facebook","Apple","Amazon"] },
  { id:29,  title:"Merge Two Sorted Lists",               difficulty:"Easy",   topics:["Linked List","Recursion"],    acceptance:62.7, xp:30,  companies:["Amazon","Apple","Microsoft"] },
  { id:30,  title:"Reorder List",                         difficulty:"Medium", topics:["Linked List","Recursion"],    acceptance:52.2, xp:60,  companies:["Facebook","Amazon"] },
  { id:31,  title:"Remove Nth Node From End of List",     difficulty:"Medium", topics:["Linked List","Two Pointers"], acceptance:38.5, xp:60,  companies:["Amazon","Microsoft","Apple"] },
  { id:32,  title:"Copy List with Random Pointer",        difficulty:"Medium", topics:["Linked List","Hash Table"],   acceptance:55.0, xp:60,  companies:["Amazon","Microsoft","Bloomberg"] },
  { id:33,  title:"Add Two Numbers",                      difficulty:"Medium", topics:["Linked List","Math"],         acceptance:40.1, xp:60,  companies:["Amazon","Microsoft","Bloomberg"] },
  { id:34,  title:"Linked List Cycle",                    difficulty:"Easy",   topics:["Linked List","Two Pointers"], acceptance:45.9, xp:30,  companies:["Amazon","Bloomberg","Apple"] },
  { id:35,  title:"Find the Duplicate Number",            difficulty:"Medium", topics:["Linked List","Binary Search","Two Pointers"],acceptance:58.8,xp:60, companies:["Google"] },
  { id:36,  title:"LRU Cache",                            difficulty:"Medium", topics:["Design","Hash Map","Linked List"],acceptance:41.8,xp:60, companies:["Amazon","Google","Facebook"] },
  { id:37,  title:"Merge K Sorted Lists",                 difficulty:"Hard",   topics:["Linked List","Merge Sort","Heap"],acceptance:50.4,xp:120,companies:["Amazon","Facebook","Google"] },
  { id:38,  title:"Reverse Nodes in k-Group",             difficulty:"Hard",   topics:["Linked List","Recursion"],    acceptance:55.7, xp:120, companies:["Microsoft","Amazon","Facebook"] },

  // ── TREES ───────────────────────────────────────────────
  { id:39,  title:"Invert Binary Tree",                   difficulty:"Easy",   topics:["Tree","DFS","BFS"],           acceptance:75.4, xp:30,  companies:["Google","Apple","Amazon"] },
  { id:40,  title:"Maximum Depth of Binary Tree",         difficulty:"Easy",   topics:["Tree","DFS","BFS"],           acceptance:73.4, xp:30,  companies:["Amazon","LinkedIn","Apple"] },
  { id:41,  title:"Diameter of Binary Tree",              difficulty:"Easy",   topics:["Tree","DFS"],                 acceptance:57.2, xp:30,  companies:["Facebook","Google"] },
  { id:42,  title:"Balanced Binary Tree",                 difficulty:"Easy",   topics:["Tree","DFS"],                 acceptance:47.0, xp:30,  companies:["Bloomberg","Apple"] },
  { id:43,  title:"Same Tree",                            difficulty:"Easy",   topics:["Tree","DFS","BFS"],           acceptance:57.8, xp:30,  companies:["Amazon","Bloomberg"] },
  { id:44,  title:"Subtree of Another Tree",              difficulty:"Easy",   topics:["Tree","DFS","Hashing"],       acceptance:47.3, xp:30,  companies:["Amazon","Facebook","LinkedIn"] },
  { id:45,  title:"Lowest Common Ancestor of BST",        difficulty:"Medium", topics:["Tree","DFS","BST"],           acceptance:61.8, xp:60,  companies:["Amazon","Facebook","Microsoft"] },
  { id:46,  title:"Binary Tree Level Order Traversal",    difficulty:"Medium", topics:["Tree","BFS"],                 acceptance:65.8, xp:60,  companies:["Amazon","Microsoft","Bloomberg"] },
  { id:47,  title:"Binary Tree Right Side View",          difficulty:"Medium", topics:["Tree","BFS","DFS"],           acceptance:61.3, xp:60,  companies:["Amazon","Facebook","ByteDance"] },
  { id:48,  title:"Count Good Nodes in Binary Tree",      difficulty:"Medium", topics:["Tree","DFS"],                 acceptance:72.5, xp:60,  companies:["Microsoft","Amazon"] },
  { id:49,  title:"Validate Binary Search Tree",          difficulty:"Medium", topics:["Tree","DFS","BST"],           acceptance:31.8, xp:60,  companies:["Amazon","Bloomberg","Facebook"] },
  { id:50,  title:"Kth Smallest Element in BST",          difficulty:"Medium", topics:["Tree","DFS","BST"],           acceptance:69.5, xp:60,  companies:["Amazon","Google","Bloomberg"] },
  { id:51,  title:"Construct Binary Tree from Preorder and Inorder",difficulty:"Medium",topics:["Tree","Hash Table","Divide&Conquer"],acceptance:61.3,xp:60, companies:["Amazon","Microsoft"] },
  { id:52,  title:"Binary Tree Maximum Path Sum",         difficulty:"Hard",   topics:["Tree","DFS","DP"],            acceptance:38.9, xp:120, companies:["Amazon","Facebook","Google"] },
  { id:53,  title:"Serialize and Deserialize Binary Tree",difficulty:"Hard",   topics:["Tree","BFS","DFS","Design"],  acceptance:56.6, xp:120, companies:["Facebook","Google","Microsoft"] },

  // ── GRAPHS ──────────────────────────────────────────────
  { id:54,  title:"Number of Islands",                    difficulty:"Medium", topics:["Graph","BFS","DFS"],          acceptance:56.1, xp:60,  companies:["Amazon","Google","Facebook"] },
  { id:55,  title:"Clone Graph",                          difficulty:"Medium", topics:["Graph","BFS","DFS","Hash Table"],acceptance:55.0,xp:60, companies:["Facebook","Amazon","Google"] },
  { id:56,  title:"Max Area of Island",                   difficulty:"Medium", topics:["Graph","DFS","BFS"],          acceptance:70.9, xp:60,  companies:["Amazon","Facebook","Google"] },
  { id:57,  title:"Pacific Atlantic Water Flow",          difficulty:"Medium", topics:["Graph","BFS","DFS"],          acceptance:52.8, xp:60,  companies:["Google","Facebook"] },
  { id:58,  title:"Surrounded Regions",                   difficulty:"Medium", topics:["Graph","BFS","DFS","Union Find"],acceptance:35.7,xp:60, companies:["Google"] },
  { id:59,  title:"Rotting Oranges",                      difficulty:"Medium", topics:["Graph","BFS"],                acceptance:52.9, xp:60,  companies:["Amazon","Google"] },
  { id:60,  title:"Walls and Gates",                      difficulty:"Medium", topics:["Graph","BFS"],                acceptance:63.3, xp:60,  companies:["Facebook","Google"] },
  { id:61,  title:"Course Schedule",                      difficulty:"Medium", topics:["Graph","DFS","Topological Sort"],acceptance:45.8,xp:60, companies:["Facebook","Apple","Zenefits"] },
  { id:62,  title:"Course Schedule II",                   difficulty:"Medium", topics:["Graph","DFS","Topological Sort"],acceptance:49.8,xp:60, companies:["Facebook","Amazon","Zendeal"] },
  { id:63,  title:"Redundant Connection",                 difficulty:"Medium", topics:["Graph","Union Find","DFS"],   acceptance:61.9, xp:60,  companies:["Amazon","Google"] },
  { id:64,  title:"Number of Connected Components",       difficulty:"Medium", topics:["Graph","Union Find","DFS"],   acceptance:63.7, xp:60,  companies:["LinkedIn","Amazon"] },
  { id:65,  title:"Graph Valid Tree",                     difficulty:"Medium", topics:["Graph","Union Find","DFS"],   acceptance:46.8, xp:60,  companies:["LinkedIn","Google"] },
  { id:66,  title:"Word Ladder",                          difficulty:"Hard",   topics:["Graph","BFS"],                acceptance:36.4, xp:120, companies:["Amazon","Google","Facebook"] },
  { id:67,  title:"Alien Dictionary",                     difficulty:"Hard",   topics:["Graph","Topological Sort"],   acceptance:34.8, xp:120, companies:["Facebook","Google","Airbnb"] },

  // ── DYNAMIC PROGRAMMING ─────────────────────────────────
  { id:68,  title:"Climbing Stairs",                      difficulty:"Easy",   topics:["DP","Math","Memoization"],    acceptance:52.2, xp:30,  companies:["Amazon","Google","Adobe"] },
  { id:69,  title:"Min Cost Climbing Stairs",             difficulty:"Easy",   topics:["DP","Array"],                 acceptance:63.8, xp:30,  companies:["Amazon","Google"] },
  { id:70,  title:"House Robber",                         difficulty:"Medium", topics:["DP","Array"],                 acceptance:49.8, xp:60,  companies:["Airbnb","LinkedIn","Amazon"] },
  { id:71,  title:"House Robber II",                      difficulty:"Medium", topics:["DP","Array"],                 acceptance:41.0, xp:60,  companies:["Microsoft","Google"] },
  { id:72,  title:"Longest Palindromic Substring",        difficulty:"Medium", topics:["DP","String"],                acceptance:32.4, xp:60,  companies:["Amazon","Microsoft","Google"] },
  { id:73,  title:"Palindromic Substrings",               difficulty:"Medium", topics:["DP","String"],                acceptance:68.4, xp:60,  companies:["Facebook","LinkedIn"] },
  { id:74,  title:"Decode Ways",                          difficulty:"Medium", topics:["DP","String"],                acceptance:30.9, xp:60,  companies:["Facebook","Amazon","Microsoft"] },
  { id:75,  title:"Coin Change",                          difficulty:"Medium", topics:["DP","BFS"],                   acceptance:43.2, xp:60,  companies:["Google","Amazon","Microsoft"] },
  { id:76,  title:"Maximum Product Subarray",             difficulty:"Medium", topics:["DP","Array"],                 acceptance:34.8, xp:60,  companies:["LinkedIn","Amazon"] },
  { id:77,  title:"Word Break",                           difficulty:"Medium", topics:["DP","Trie","Memoization"],    acceptance:45.9, xp:60,  companies:["Google","Facebook","Amazon"] },
  { id:78,  title:"Longest Increasing Subsequence",       difficulty:"Medium", topics:["DP","Binary Search"],         acceptance:52.7, xp:60,  companies:["Microsoft","Amazon","Google"] },
  { id:79,  title:"Unique Paths",                         difficulty:"Medium", topics:["DP","Math","Combinatorics"],  acceptance:63.0, xp:60,  companies:["Amazon","Google","Bloomberg"] },
  { id:80,  title:"Jump Game",                            difficulty:"Medium", topics:["DP","Greedy","Array"],        acceptance:37.5, xp:60,  companies:["Amazon","Microsoft","Uber"] },
  { id:81,  title:"Jump Game II",                         difficulty:"Medium", topics:["DP","Greedy","Array"],        acceptance:39.6, xp:60,  companies:["Amazon","Microsoft"] },
  { id:82,  title:"Partition Equal Subset Sum",           difficulty:"Medium", topics:["DP","Array"],                 acceptance:46.7, xp:60,  companies:["Facebook","Amazon"] },
  { id:83,  title:"Burst Balloons",                       difficulty:"Hard",   topics:["DP","Array","Divide&Conquer"],acceptance:57.0, xp:120, companies:["Google","Amazon"] },
  { id:84,  title:"Edit Distance",                        difficulty:"Hard",   topics:["DP","String"],                acceptance:52.6, xp:120, companies:["Amazon","Google","Microsoft"] },
  { id:85,  title:"Regular Expression Matching",          difficulty:"Hard",   topics:["DP","Recursion","String"],    acceptance:28.3, xp:120, companies:["Facebook","Google","AirBnb"] },

  // ── MORE DSA ────────────────────────────────────────────
  { id:86,  title:"Top K Frequent Elements",              difficulty:"Medium", topics:["Heap","Hash Table","Counting"],acceptance:68.2, xp:60,  companies:["Amazon","Google","Microsoft"] },
  { id:87,  title:"Kth Largest Element",                  difficulty:"Medium", topics:["Heap","Quick Select"],         acceptance:57.0, xp:60,  companies:["Amazon","Facebook","Google"] },
  { id:88,  title:"Merge K Sorted Arrays",                difficulty:"Hard",   topics:["Heap","Divide&Conquer"],      acceptance:47.5, xp:120, companies:["Google","Amazon","Facebook"] },
  { id:89,  title:"Implement Trie",                       difficulty:"Medium", topics:["Trie","Design","Hash Table"],  acceptance:65.3, xp:60,  companies:["Google","Amazon","Facebook"] },
  { id:90,  title:"Word Search II",                       difficulty:"Hard",   topics:["Trie","DFS","Backtracking"],  acceptance:33.8, xp:120, companies:["Google","Amazon"] },
  { id:91,  title:"Median of Two Sorted Arrays",          difficulty:"Hard",   topics:["Binary Search","Array","Divide&Conquer"],acceptance:31.4,xp:120, companies:["Google","Facebook","Amazon"] },
  { id:92,  title:"First Bad Version",                    difficulty:"Easy",   topics:["Binary Search"],              acceptance:43.8, xp:30,  companies:["Google","Facebook"] },
  { id:93,  title:"Search Insert Position",               difficulty:"Easy",   topics:["Binary Search","Array"],      acceptance:43.1, xp:30,  companies:["Facebook","Amazon"] },
  { id:94,  title:"Binary Search Tree Iterator",          difficulty:"Medium", topics:["Tree","Stack","Design"],      acceptance:69.7, xp:60,  companies:["Google","Facebook","Amazon"] },
  { id:95,  title:"Number of Submatrices That Sum",       difficulty:"Hard",   topics:["Array","Hash Table","Matrix"], acceptance:48.7, xp:120, companies:["Amazon"] },
  { id:96,  title:"Set Matrix Zeroes",                    difficulty:"Medium", topics:["Array","Hash Table"],         acceptance:50.3, xp:60,  companies:["Facebook","Google","Amazon"] },
  { id:97,  title:"Spiral Matrix",                        difficulty:"Medium", topics:["Array","Matrix"],             acceptance:48.5, xp:60,  companies:["Amazon","Microsoft"] },
  { id:98,  title:"Permutations",                         difficulty:"Medium", topics:["Backtracking","Array"],       acceptance:74.3, xp:60,  companies:["Google","Amazon","Facebook"] },
  { id:99,  title:"Combinations",                         difficulty:"Medium", topics:["Backtracking","Array"],       acceptance:70.4, xp:60,  companies:["Google","Amazon"] },
  { id:100, title:"N-Queens",                             difficulty:"Hard",   topics:["Backtracking","Array"],       acceptance:65.3, xp:120, companies:["Google","Facebook"] },
  { id:101, title:"Word Search",                          difficulty:"Medium", topics:["Backtracking","DFS","Array"],  acceptance:40.2, xp:60,  companies:["Google","Amazon","Facebook"] },
  { id:102, title:"LFU Cache",                            difficulty:"Hard",   topics:["Design","Hash Table","Heap"],  acceptance:37.2, xp:120, companies:["Google","Amazon"] },
  { id:103, title:"Min Stack",                            difficulty:"Easy",   topics:["Stack","Design"],             acceptance:51.7, xp:30,  companies:["Amazon","Google","Microsoft"] },
  { id:104, title:"Implement Queue using Stacks",         difficulty:"Easy",   topics:["Queue","Stack","Design"],     acceptance:72.3, xp:30,  companies:["Google","Amazon"] },
  { id:105, title:"Implement Stack using Queue",         difficulty:"Easy",   topics:["Stack","Queue","Design"],     acceptance:70.3, xp:30,  companies:["Google","Amazon"] },
  { id:106, title:"Design HashMap",                       difficulty:"Easy",   topics:["Hash Table","Design"],        acceptance:63.1, xp:30,  companies:["Google"] },
  { id:107, title:"Remove Duplicates from Sorted Array II",difficulty:"Medium",topics:["Array","Two Pointers"],      acceptance:50.0, xp:60,  companies:["Google"] },
  { id:108, title:"Next Permutation",                     difficulty:"Medium", topics:["Array","Two Pointers"],       acceptance:38.1, xp:60,  companies:["Google","Amazon","Facebook"] },
  { id:109, title:"Pow(x, n)",                            difficulty:"Medium", topics:["Math","Binary Search","Recursion"],acceptance:32.6,xp:60,  companies:["Google","Microsoft","Amazon"] },
  { id:110, title:"Sqrt(x)",                              difficulty:"Easy",   topics:["Math","Binary Search"],       acceptance:37.3, xp:30,  companies:["Google","Amazon"] },

  // ── WEB DEVELOPMENT ────────────────────────────────────
  { id:200, title:"Build a Todo App with HTML/CSS/JS",    difficulty:"Easy",   topics:["HTML","CSS","JavaScript","DOM"],acceptance:85.0, xp:50,  companies:["Frontend"] },
  { id:201, title:"Create Responsive Portfolio Website",  difficulty:"Medium", topics:["HTML","CSS","Responsive"],    acceptance:72.0, xp:75,  companies:["Frontend"] },
  { id:202, title:"Semantic HTML Best Practices",         difficulty:"Easy",   topics:["HTML","Accessibility"],       acceptance:90.0, xp:30,  companies:["Frontend"] },
  { id:203, title:"CSS Grid Layout Projects",             difficulty:"Medium", topics:["CSS","Grid","Layout"],        acceptance:68.0, xp:60,  companies:["Frontend"] },
  { id:204, title:"Flexbox Deep Dive",                    difficulty:"Medium", topics:["CSS","Flexbox"],              acceptance:75.0, xp:60,  companies:["Frontend"] },
  { id:205, title:"CSS Animations & Transitions",         difficulty:"Medium", topics:["CSS","Animation"],            acceptance:70.0, xp:60,  companies:["Frontend"] },
  { id:206, title:"JavaScript Event Handling",            difficulty:"Medium", topics:["JavaScript","DOM","Events"],   acceptance:72.0, xp:60,  companies:["Frontend"] },
  { id:207, title:"Closures & Scope in JS",              difficulty:"Medium", topics:["JavaScript","Closures","Scope"],acceptance:65.0, xp:60,  companies:["Frontend"] },
  { id:208, title:"Array & Object Methods Mastery",       difficulty:"Easy",   topics:["JavaScript","Arrays","Objects"],acceptance:78.0, xp:45,  companies:["Frontend"] },
  { id:209, title:"DOM Traversal & Manipulation",         difficulty:"Medium", topics:["DOM","JavaScript"],           acceptance:70.0, xp:60,  companies:["Frontend"] },
  { id:210, title:"Form Validation with JS",             difficulty:"Medium", topics:["DOM","JavaScript","Forms"],    acceptance:68.0, xp:60,  companies:["Frontend"] },
  { id:211, title:"Interactive UI Components",           difficulty:"Hard",   topics:["DOM","JavaScript","UI"],      acceptance:55.0, xp:90,  companies:["Frontend"] },
  { id:212, title:"Promises & Async/Await",              difficulty:"Medium", topics:["JavaScript","Async","Promises"],acceptance:62.0, xp:75,  companies:["Frontend"] },
  { id:213, title:"Fetch API & HTTP Requests",           difficulty:"Medium", topics:["JavaScript","Fetch","API"],    acceptance:68.0, xp:60,  companies:["Frontend"] },
  { id:214, title:"Error Handling in Async Code",        difficulty:"Medium", topics:["JavaScript","Error Handling"],  acceptance:60.0, xp:60,  companies:["Frontend"] },
  { id:215, title:"React: Props & Components",            difficulty:"Easy",   topics:["React","Components","Props"],  acceptance:80.0, xp:50,  companies:["Frontend"] },
  { id:216, title:"React: Hooks Deep Dive",              difficulty:"Medium", topics:["React","Hooks","State"],       acceptance:65.0, xp:75,  companies:["Frontend"] },
  { id:217, title:"Build Todo App with React",           difficulty:"Medium", topics:["React","Components","State"],   acceptance:72.0, xp:75,  companies:["Frontend"] },
  { id:218, title:"Redux State Management",              difficulty:"Hard",   topics:["Redux","State Management"],    acceptance:55.0, xp:100, companies:["Frontend"] },
  { id:219, title:"Context API for State",               difficulty:"Medium", topics:["React","Context","Hooks"],     acceptance:68.0, xp:75,  companies:["Frontend"] },
  { id:220, title:"Component Composition Patterns",       difficulty:"Medium", topics:["React","Patterns","Design"],   acceptance:63.0, xp:75,  companies:["Frontend"] },
  { id:221, title:"REST API Client in React",            difficulty:"Medium", topics:["React","API","Fetch"],         acceptance:70.0, xp:75,  companies:["Frontend"] },
  { id:222, title:"Error Boundary & Error Handling",      difficulty:"Medium", topics:["React","Error Handling"],      acceptance:62.0, xp:75,  companies:["Frontend"] },
  { id:223, title:"API Rate Limiting & Caching",         difficulty:"Hard",   topics:["JavaScript","API","Performance"],acceptance:50.0, xp:100, companies:["Backend"] },
  { id:224, title:"SQL Basics: SELECT & WHERE",          difficulty:"Easy",   topics:["SQL","Database"],             acceptance:88.0, xp:40,  companies:["Backend"] },
  { id:225, title:"SQL Joins & Complex Queries",         difficulty:"Medium", topics:["SQL","Database","Joins"],      acceptance:65.0, xp:75,  companies:["Backend"] },
  { id:226, title:"Database Design Normalization",       difficulty:"Medium", topics:["Database","Design","SQL"],     acceptance:60.0, xp:75,  companies:["Backend"] },
  { id:227, title:"Build REST API with Node.js",         difficulty:"Hard",   topics:["Node.js","Express","API"],     acceptance:58.0, xp:100, companies:["Backend"] },
  { id:228, title:"Middleware & Authentication",         difficulty:"Hard",   topics:["Node.js","Auth","Middleware"], acceptance:55.0, xp:100, companies:["Backend"] },
  { id:229, title:"Database Connection & ORM",           difficulty:"Medium", topics:["Database","ORM","Node.js"],    acceptance:62.0, xp:75,  companies:["Backend"] },
  { id:230, title:"Docker Containerization",             difficulty:"Medium", topics:["Docker","DevOps"],             acceptance:58.0, xp:75,  companies:["DevOps"] },
  { id:231, title:"Git & GitHub Workflow",               difficulty:"Easy",   topics:["Git","Version Control"],       acceptance:85.0, xp:40,  companies:["DevOps"] },
  { id:232, title:"CI/CD Pipeline Setup",                difficulty:"Hard",   topics:["CI/CD","DevOps","GitHub"],     acceptance:50.0, xp:100, companies:["DevOps"] },
  { id:233, title:"Full Stack E-commerce Project",       difficulty:"Hard",   topics:["Full Stack","React","Node.js"], acceptance:45.0, xp:150, companies:["Full Stack"] },
  { id:234, title:"SPA with Authentication",             difficulty:"Hard",   topics:["React","Auth","Backend"],      acceptance:48.0, xp:150, companies:["Full Stack"] },
  { id:235, title:"Real-time Chat Application",          difficulty:"Hard",   topics:["WebSocket","Node.js","React"], acceptance:42.0, xp:150, companies:["Full Stack"] },
  { id:236, title:"Build Accessible Navigation Menu",    difficulty:"Easy",   topics:["HTML","Accessibility","ARIA"], acceptance:84.0, xp:45,  companies:["Frontend"] },
  { id:237, title:"Responsive Pricing Table",            difficulty:"Medium", topics:["CSS","Responsive","Layout"],   acceptance:71.0, xp:70,  companies:["Frontend"] },
  { id:238, title:"CSS Theme Switcher",                  difficulty:"Medium", topics:["CSS","JavaScript","DOM"],      acceptance:69.0, xp:70,  companies:["Frontend"] },
  { id:239, title:"Debounced Search Input",              difficulty:"Medium", topics:["JavaScript","Events","Performance"],acceptance:64.0,xp:75,companies:["Frontend"] },
  { id:240, title:"Client-side Form Wizard",             difficulty:"Hard",   topics:["JavaScript","Forms","State"],  acceptance:52.0, xp:100, companies:["Frontend"] },
  { id:241, title:"Paginated API Table",                 difficulty:"Medium", topics:["JavaScript","Fetch","API"],    acceptance:63.0, xp:80,  companies:["Frontend"] },
  { id:242, title:"Implement Infinite Scroll",           difficulty:"Hard",   topics:["JavaScript","Performance","API"],acceptance:49.0,xp:110,companies:["Frontend"] },
  { id:243, title:"React Searchable List",               difficulty:"Easy",   topics:["React","Components","State"], acceptance:78.0, xp:55,  companies:["Frontend"] },
  { id:244, title:"React Custom Hook: useLocalStorage",  difficulty:"Medium", topics:["React","Hooks","Local Storage"],acceptance:66.0,xp:85, companies:["Frontend"] },
  { id:245, title:"React Router Dashboard",              difficulty:"Medium", topics:["React","Routing","UI"],        acceptance:61.0, xp:85,  companies:["Frontend"] },
  { id:246, title:"Optimistic UI Updates",               difficulty:"Hard",   topics:["React","State Management","API"],acceptance:47.0,xp:115,companies:["Frontend"] },
  { id:247, title:"Design Component Library Tokens",     difficulty:"Medium", topics:["Design","CSS","Components"],  acceptance:58.0, xp:85,  companies:["Frontend"] },
  { id:248, title:"JWT Refresh Token Flow",              difficulty:"Hard",   topics:["Auth","Node.js","Security"],   acceptance:46.0, xp:120, companies:["Backend"] },
  { id:249, title:"Express Validation Middleware",       difficulty:"Medium", topics:["Node.js","Express","Middleware"],acceptance:62.0,xp:85, companies:["Backend"] },
  { id:250, title:"SQL Index Design Challenge",          difficulty:"Hard",   topics:["SQL","Database","Performance"],acceptance:44.0,xp:115, companies:["Backend"] },
  { id:251, title:"Build a Blog CMS API",                difficulty:"Hard",   topics:["Node.js","API","Database"],    acceptance:50.0, xp:130, companies:["Backend"] },
  { id:252, title:"WebSocket Presence Tracker",          difficulty:"Hard",   topics:["WebSocket","Node.js","Real-time"],acceptance:43.0,xp:130,companies:["Full Stack"] },
  { id:253, title:"Docker Compose Full Stack App",       difficulty:"Hard",   topics:["Docker","DevOps","Full Stack"],acceptance:48.0,xp:125, companies:["DevOps"] },

  // ── MACHINE LEARNING ───────────────────────────────────
  { id:300, title:"Linear Algebra Fundamentals",         difficulty:"Medium", topics:["Math","Linear Algebra"],       acceptance:65.0, xp:75,  companies:["ML"] },
  { id:301, title:"Matrix Operations & Eigenvalues",     difficulty:"Hard",   topics:["Math","Linear Algebra"],      acceptance:55.0, xp:100, companies:["ML"] },
  { id:302, title:"Calculus: Derivatives & Gradients",   difficulty:"Hard",   topics:["Math","Calculus"],            acceptance:52.0, xp:100, companies:["ML"] },
  { id:303, title:"Probability Distributions",           difficulty:"Medium", topics:["Statistics","Probability"],    acceptance:60.0, xp:75,  companies:["ML"] },
  { id:304, title:"Hypothesis Testing & P-values",       difficulty:"Hard",   topics:["Statistics","Testing"],        acceptance:48.0, xp:100, companies:["ML"] },
  { id:305, title:"Bayesian Statistics Intro",           difficulty:"Hard",   topics:["Statistics","Probability"],    acceptance:45.0, xp:100, companies:["ML"] },
  { id:306, title:"Python Basics for Data Science",      difficulty:"Easy",   topics:["Python","Data Science"],      acceptance:82.0, xp:40,  companies:["ML"] },
  { id:307, title:"Python Functions & OOP",              difficulty:"Medium", topics:["Python","OOP"],               acceptance:70.0, xp:60,  companies:["ML"] },
  { id:308, title:"File I/O & Data Handling",            difficulty:"Medium", topics:["Python","File I/O"],          acceptance:75.0, xp:60,  companies:["ML"] },
  { id:309, title:"NumPy: Array Operations",             difficulty:"Medium", topics:["NumPy","Data Science"],        acceptance:68.0, xp:75,  companies:["ML"] },
  { id:310, title:"Pandas DataFrames Mastery",           difficulty:"Medium", topics:["Pandas","Data Science"],       acceptance:65.0, xp:75,  companies:["ML"] },
  { id:311, title:"Data Cleaning & Preprocessing",       difficulty:"Hard",   topics:["Pandas","Data Cleaning"],      acceptance:58.0, xp:100, companies:["ML"] },
  { id:312, title:"Matplotlib & Seaborn Plotting",       difficulty:"Medium", topics:["Visualization","Python"],      acceptance:70.0, xp:75,  companies:["ML"] },
  { id:313, title:"Interactive Dashboards with Plotly",  difficulty:"Hard",   topics:["Visualization","Plotly"],      acceptance:55.0, xp:100, companies:["ML"] },
  { id:314, title:"Data Storytelling Techniques",        difficulty:"Medium", topics:["Visualization","Communication"],acceptance:62.0, xp:75,  companies:["ML"] },
  { id:315, title:"Linear Regression from Scratch",      difficulty:"Medium", topics:["Scikit-learn","Regression"],    acceptance:65.0, xp:75,  companies:["ML"] },
  { id:316, title:"Logistic Regression & Classification",difficulty:"Medium", topics:["Scikit-learn","Classification"], acceptance:62.0, xp:75,  companies:["ML"] },
  { id:317, title:"Decision Trees & Ensemble Methods",   difficulty:"Hard",   topics:["Scikit-learn","Ensemble"],     acceptance:58.0, xp:100, companies:["ML"] },
  { id:318, title:"Train/Test Split & Cross-Validation", difficulty:"Medium", topics:["ML","Validation"],            acceptance:68.0, xp:75,  companies:["ML"] },
  { id:319, title:"Feature Engineering & Selection",     difficulty:"Hard",   topics:["ML","Feature Engineering"],    acceptance:55.0, xp:100, companies:["ML"] },
  { id:320, title:"Hyperparameter Tuning with GridSearch",difficulty:"Hard",  topics:["Scikit-learn","Tuning"],       acceptance:52.0, xp:100, companies:["ML"] },
  { id:321, title:"K-Means Clustering",                  difficulty:"Medium", topics:["Clustering","Scikit-learn"],    acceptance:65.0, xp:75,  companies:["ML"] },
  { id:322, title:"Hierarchical Clustering & DBSCAN",    difficulty:"Hard",   topics:["Clustering","Scikit-learn"],    acceptance:50.0, xp:100, companies:["ML"] },
  { id:323, title:"Dimensionality Reduction: PCA",       difficulty:"Hard",   topics:["PCA","ML"],                   acceptance:48.0, xp:100, companies:["ML"] },
  { id:324, title:"Neural Networks: Perceptrons",        difficulty:"Hard",   topics:["Neural Networks","Deep Learning"],acceptance:55.0, xp:100, companies:["ML"] },
  { id:325, title:"TensorFlow & Keras Basics",           difficulty:"Hard",   topics:["TensorFlow","Deep Learning"],  acceptance:52.0, xp:100, companies:["ML"] },
  { id:326, title:"CNN: Image Classification",           difficulty:"Hard",   topics:["CNN","Computer Vision"],       acceptance:48.0, xp:100, companies:["ML"] },
  { id:327, title:"RNN & LSTM for Sequences",            difficulty:"Hard",   topics:["RNN","NLP"],                  acceptance:45.0, xp:100, companies:["ML"] },
  { id:328, title:"Text Preprocessing & Tokenization",   difficulty:"Medium", topics:["NLP","Text Processing"],       acceptance:62.0, xp:75,  companies:["ML"] },
  { id:329, title:"Word Embeddings: Word2Vec & GloVe",   difficulty:"Hard",   topics:["NLP","Embeddings"],            acceptance:50.0, xp:100, companies:["ML"] },
  { id:330, title:"Image Preprocessing & Augmentation",  difficulty:"Medium", topics:["Computer Vision"],             acceptance:60.0, xp:75,  companies:["ML"] },
  { id:331, title:"Object Detection with YOLO",          difficulty:"Hard",   topics:["Computer Vision","Detection"], acceptance:45.0, xp:100, companies:["ML"] },
  { id:332, title:"Transfer Learning & Fine-tuning",     difficulty:"Hard",   topics:["Deep Learning","Transfer Learning"],acceptance:52.0, xp:100, companies:["ML"] },
  { id:333, title:"Build Sentiment Analysis Model",      difficulty:"Hard",   topics:["NLP","ML Project"],            acceptance:48.0, xp:150, companies:["ML"] },
  { id:334, title:"Build Image Classification System",   difficulty:"Hard",   topics:["Computer Vision","Project"],   acceptance:50.0, xp:150, companies:["ML"] },
  { id:335, title:"Deploy ML Model to Production",       difficulty:"Hard",   topics:["ML Ops","Deployment"],         acceptance:45.0, xp:150, companies:["ML"] },
  { id:336, title:"Vector Norms and Distances",          difficulty:"Medium", topics:["Math","Linear Algebra"],       acceptance:63.0, xp:75,  companies:["ML"] },
  { id:337, title:"Gradient Descent Step by Step",       difficulty:"Hard",   topics:["Math","Optimization"],         acceptance:51.0, xp:105, companies:["ML"] },
  { id:338, title:"Sampling and Confidence Intervals",   difficulty:"Medium", topics:["Statistics","Probability"],    acceptance:59.0, xp:80,  companies:["ML"] },
  { id:339, title:"A/B Test Result Analyzer",            difficulty:"Hard",   topics:["Statistics","Testing"],        acceptance:47.0, xp:110, companies:["ML"] },
  { id:340, title:"Write a Mini Data Loader",            difficulty:"Medium", topics:["Python","Data Science"],       acceptance:69.0, xp:80,  companies:["ML"] },
  { id:341, title:"NumPy Broadcasting Challenge",        difficulty:"Medium", topics:["NumPy","Linear Algebra"],      acceptance:62.0, xp:85,  companies:["ML"] },
  { id:342, title:"Pandas GroupBy Analytics",            difficulty:"Medium", topics:["Pandas","Data Analysis"],      acceptance:64.0, xp:85,  companies:["ML"] },
  { id:343, title:"Missing Value Imputation Pipeline",   difficulty:"Hard",   topics:["Pandas","Data Cleaning"],      acceptance:53.0, xp:110, companies:["ML"] },
  { id:344, title:"Build Feature Scaling Utilities",     difficulty:"Medium", topics:["Scikit-learn","Preprocessing"],acceptance:61.0, xp:85,  companies:["ML"] },
  { id:345, title:"Confusion Matrix Metrics",            difficulty:"Medium", topics:["ML","Classification"],         acceptance:66.0, xp:85,  companies:["ML"] },
  { id:346, title:"Model Selection Report",              difficulty:"Hard",   topics:["ML","Validation"],             acceptance:50.0, xp:115, companies:["ML"] },
  { id:347, title:"Regularization Playground",           difficulty:"Hard",   topics:["ML","Regression"],             acceptance:49.0, xp:115, companies:["ML"] },
  { id:348, title:"Anomaly Detection with Isolation Forest",difficulty:"Hard",topics:["ML","Anomaly Detection"],      acceptance:46.0, xp:120, companies:["ML"] },
  { id:349, title:"Recommendation System Baseline",      difficulty:"Hard",   topics:["ML","Recommendation"],         acceptance:45.0, xp:125, companies:["ML"] },
  { id:350, title:"Neural Network Backprop Debugging",   difficulty:"Hard",   topics:["Neural Networks","Deep Learning"],acceptance:43.0,xp:130,companies:["ML"] },
  { id:351, title:"Transformer Attention Mini Lab",      difficulty:"Hard",   topics:["NLP","Deep Learning"],         acceptance:41.0, xp:135, companies:["ML"] },
  { id:352, title:"Image Augmentation Pipeline",         difficulty:"Medium", topics:["Computer Vision","Data Augmentation"],acceptance:57.0,xp:95,companies:["ML"] },
  { id:353, title:"ML Model Monitoring Checklist",       difficulty:"Medium", topics:["ML Ops","Monitoring"],         acceptance:60.0, xp:95,  companies:["ML"] },

  // ── HEAP / PRIORITY QUEUE ────────────────────────────────
  { id:119, title:"Kth Largest Element in an Array",      difficulty:"Medium", topics:["Heap","Divide&Conquer"],      acceptance:65.7, xp:60,  companies:["Facebook","Amazon","Microsoft"] },
  { id:120, title:"Last Stone Weight",                    difficulty:"Easy",   topics:["Heap"],                       acceptance:64.8, xp:30,  companies:["Amazon"] },
  { id:121, title:"K Closest Points to Origin",           difficulty:"Medium", topics:["Heap","Sorting","Divide&Conquer"],acceptance:66.5,xp:60, companies:["Facebook","Amazon","LinkedIn"] },
  { id:122, title:"Task Scheduler",                       difficulty:"Medium", topics:["Heap","Greedy","Hash Table"], acceptance:57.5, xp:60,  companies:["Facebook","Amazon"] },
  { id:123, title:"Design Twitter",                       difficulty:"Medium", topics:["Heap","Hash Table","Design"], acceptance:37.0, xp:60,  companies:["Twitter"] },
  { id:124, title:"Find Median from Data Stream",         difficulty:"Hard",   topics:["Heap","Design","Two Pointers"],acceptance:51.4,xp:120, companies:["Amazon","Google","Apple"] },

  // ── BINARY SEARCH ────────────────────────────────────────
  { id:125, title:"Binary Search",                        difficulty:"Easy",   topics:["Array","Binary Search"],      acceptance:56.5, xp:30,  companies:["Google","Amazon"] },
  { id:126, title:"Search a 2D Matrix",                   difficulty:"Medium", topics:["Array","Binary Search"],      acceptance:47.6, xp:60,  companies:["Amazon","Microsoft","Google"] },
  { id:127, title:"Koko Eating Bananas",                  difficulty:"Medium", topics:["Array","Binary Search"],      acceptance:46.6, xp:60,  companies:["Facebook","Google"] },
  { id:128, title:"Find Minimum in Rotated Sorted Array", difficulty:"Medium", topics:["Array","Binary Search"],      acceptance:49.0, xp:60,  companies:["Microsoft","Facebook"] },
  { id:129, title:"Median of Two Sorted Arrays",          difficulty:"Hard",   topics:["Array","Binary Search","Divide&Conquer"],acceptance:38.2,xp:120,companies:["Google","Amazon","Apple"] },
  { id:130, title:"Time Based Key-Value Store",           difficulty:"Medium", topics:["Hash Table","Binary Search","Design"],acceptance:55.2,xp:60, companies:["Google","Uber","Amazon"] },

  // ── BACKTRACKING ─────────────────────────────────────────
  { id:131, title:"Subsets",                              difficulty:"Medium", topics:["Array","Backtracking","Bit Manipulation"],acceptance:73.3,xp:60, companies:["Amazon","Facebook","Apple"] },
  { id:132, title:"Combination Sum",                      difficulty:"Medium", topics:["Array","Backtracking"],       acceptance:69.4, xp:60,  companies:["Amazon","Apple","Uber"] },
  { id:133, title:"Combination Sum II",                   difficulty:"Medium", topics:["Array","Backtracking"],       acceptance:52.9, xp:60,  companies:["Amazon"] },
  { id:134, title:"Permutations",                         difficulty:"Medium", topics:["Array","Backtracking"],       acceptance:76.6, xp:60,  companies:["LinkedIn","Facebook","Microsoft"] },
  { id:135, title:"Word Search",                          difficulty:"Medium", topics:["Array","Backtracking","DFS"], acceptance:40.2, xp:60,  companies:["Amazon","Microsoft","Bloomberg"] },
  { id:136, title:"N-Queens",                             difficulty:"Hard",   topics:["Array","Backtracking"],       acceptance:67.6, xp:120, companies:["Amazon","Apple","Uber"] },
  { id:137, title:"Sudoku Solver",                        difficulty:"Hard",   topics:["Array","Backtracking","Matrix"],acceptance:59.4,xp:120,companies:["Snapchat","Google"] },
  { id:138, title:"Letter Combinations of a Phone Number",difficulty:"Medium", topics:["String","Backtracking","Hash Table"],acceptance:56.8,xp:60, companies:["Amazon","Google","Uber"] },

  // ── SLIDING WINDOW / TWO POINTERS ────────────────────────
  { id:139, title:"Move Zeroes",                          difficulty:"Easy",   topics:["Array","Two Pointers"],       acceptance:61.2, xp:30,  companies:["Facebook","Apple","Microsoft"] },
  { id:140, title:"Two Sum II - Input Array Is Sorted",   difficulty:"Medium", topics:["Array","Two Pointers","Binary Search"],acceptance:60.4,xp:60, companies:["Amazon","Microsoft"] },
  { id:141, title:"3Sum Closest",                         difficulty:"Medium", topics:["Array","Two Pointers","Sorting"],acceptance:46.6,xp:60,  companies:["Bloomberg","Amazon"] },
  { id:142, title:"Longest Subarray with Sum K",          difficulty:"Medium", topics:["Array","Hash Table","Sliding Window"],acceptance:45.2,xp:60,companies:["Amazon","Google"] },
  { id:143, title:"Minimum Size Subarray Sum",            difficulty:"Medium", topics:["Array","Binary Search","Sliding Window"],acceptance:44.7,xp:60,companies:["Amazon","Facebook"] },

  // ── MATH / BIT MANIPULATION ──────────────────────────────
  { id:111, title:"Number of 1 Bits",                     difficulty:"Easy",   topics:["Divide&Conquer","Bit Manipulation"],acceptance:67.5,xp:30, companies:["Apple","Microsoft","Apple"] },
  { id:112, title:"Counting Bits",                        difficulty:"Easy",   topics:["DP","Bit Manipulation"],      acceptance:74.5, xp:30,  companies:["Apple","Google"] },
  { id:113, title:"Reverse Bits",                         difficulty:"Easy",   topics:["Divide&Conquer","Bit Manipulation"],acceptance:54.8,xp:30, companies:["Apple","Amazon"] },
  { id:114, title:"Missing Number",                       difficulty:"Easy",   topics:["Array","Math","Bit Manipulation","Sorting"],acceptance:63.1,xp:30,companies:["Microsoft","Amazon","Bloomberg"] },
  { id:115, title:"Sum of Two Integers",                  difficulty:"Medium", topics:["Math","Bit Manipulation"],    acceptance:51.2, xp:60,  companies:["Amazon","Hulu"] },
  { id:116, title:"Reverse Integer",                      difficulty:"Medium", topics:["Math"],                       acceptance:27.6, xp:60,  companies:["Amazon","Bloomberg","Apple"] },
  { id:117, title:"Pow(x, n)",                            difficulty:"Medium", topics:["Math","Recursion"],           acceptance:33.6, xp:60,  companies:["Google","Bloomberg","Facebook"] },
  { id:118, title:"Pascal's Triangle",                    difficulty:"Easy",   topics:["Array","DP"],                 acceptance:70.4, xp:30,  companies:["Apple","Google","Amazon"] },
];

// ─── Full problem details with starter code ────────────────
export const PROBLEM_DETAILS = {
  1: {
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to target*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6",     output: "[1,2]" },
      { input: "nums = [3,3], target = 6",        output: "[0,1]" },
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists"],
    hints: [
      "A brute force O(n²) check every pair — can we do better?",
      "Think about what complement you need for each number.",
      "Use a hash map: for each num, check if (target - num) is already stored.",
    ],
    editorial: `## Approach: Hash Map — O(n) Time, O(n) Space

For each number, we need to find its complement (target - num). Instead of scanning the whole array each time, we store visited numbers in a hash map.

\`\`\`python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
\`\`\`

**Time:** O(n) — single pass  
**Space:** O(n) — hash map stores up to n elements`,
    testCases: [
      { input: "[2,7,11,15]\n9", expected: "[0,1]" },
      { input: "[3,2,4]\n6",     expected: "[1,2]" },
    ],
    starterCode: {
      "Python 3":   "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass\n",
      "C++":        "#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};\n",
      "Java":       "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n",
      "JavaScript": "var twoSum = function(nums, target) {\n    // Write your solution here\n};\n",
    },
  },
  2: {
    statement: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the *maximum profit you can achieve*. If no profit is possible, return \`0\`.`,
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1), sell on day 5 (price=6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]",   output: "0", explanation: "No profit is possible." },
    ],
    constraints: ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
    hints: [
      "Track the minimum price seen so far as you iterate.",
      "At each day, what is the max profit if you sold today?",
    ],
    editorial: `## Approach: Greedy — O(n) Time, O(1) Space

Track the minimum price seen so far. For each price, compute profit = price - minPrice and update maxProfit.

\`\`\`python
def maxProfit(prices):
    min_price  = float('inf')
    max_profit = 0
    for p in prices:
        min_price  = min(min_price, p)
        max_profit = max(max_profit, p - min_price)
    return max_profit
\`\`\``,
    testCases: [
      { input: "[7,1,5,3,6,4]", expected: "5" },
      { input: "[7,6,4,3,1]",   expected: "0" },
    ],
    starterCode: {
      "Python 3":   "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        pass\n",
      "C++":        "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};\n",
      "Java":       "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}\n",
      "JavaScript": "var maxProfit = function(prices) {\n    \n};\n",
    },
  },
  21: {
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is **valid**.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"',       output: "true"  },
      { input: 's = "()[]{}"',   output: "true"  },
      { input: 's = "(]"',       output: "false" },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'"],
    hints: [
      "Use a stack data structure.",
      "Push open brackets onto the stack. For close brackets, check if the top of the stack matches.",
    ],
    editorial: `## Approach: Stack — O(n) Time, O(n) Space

Use a stack. Push open brackets. For closing brackets, pop and check match.

\`\`\`python
def isValid(s):
    stack = []
    match = {')':'(', ']':'[', '}':'{'}
    for c in s:
        if c in '([{':
            stack.append(c)
        elif not stack or stack[-1] != match[c]:
            return False
        else:
            stack.pop()
    return not stack
\`\`\``,
    testCases: [
      { input: "()",     expected: "true"  },
      { input: "()[]{}", expected: "true"  },
      { input: "(]",     expected: "false" },
    ],
    starterCode: {
      "Python 3":   "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass\n",
      "C++":        "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};\n",
      "Java":       "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}\n",
      "JavaScript": "var isValid = function(s) {\n    \n};\n",
    },
  },
};

const slugFunctionName = title => {
  const words = title
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "solveChallenge";
  const [first, ...rest] = words;
  return [
    first.toLowerCase(),
    ...rest.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  ].join("");
};

function makePracticeDetail(problem) {
  const fn = slugFunctionName(problem.title);
  const isMl = problem.id >= 300;
  const primary = problem.topics?.[0] || "core concepts";
  const secondary = problem.topics?.[1] || "implementation";
  const deliverable = isMl
    ? "implement a clean Python utility or notebook-ready function"
    : "implement the requested UI, API, or JavaScript utility";

  return {
    statement: `You are working on **${problem.title}** as part of the ${isMl ? "Machine Learning" : "Web Development"} roadmap.

Your task is to ${deliverable} that demonstrates ${primary} and ${secondary}. Keep the implementation readable, handle edge cases, and organize the code so it can be reused in a larger project.`,
    examples: [
      { input: "sample project requirements", output: "working implementation", explanation: "Your solution should satisfy the requested behavior and be easy to extend." },
      { input: "edge-case input or empty state", output: "graceful result", explanation: "Include fallback behavior instead of crashing or rendering broken UI." },
    ],
    constraints: [
      "Use the existing function signature from the starter code.",
      "Prefer clear names and small helper functions.",
      "Handle empty, invalid, or missing input safely.",
      isMl ? "Return deterministic results for the same input." : "Keep UI state and network errors predictable.",
    ],
    hints: [
      `Start by writing the smallest useful ${isMl ? "data transformation" : "component or function"}.`,
      `List the ${primary} edge cases before coding.`,
      "Add one helper at a time and test with custom input.",
    ],
    editorial: `## Suggested Approach

Break the problem into three parts:

1. Validate and normalize the input.
2. Implement the core ${primary} behavior.
3. Return a simple result that callers can render, test, or pipe into the next step.

For roadmap practice, prioritize correctness and maintainability before polish.`,
    testCases: [
      { input: "demo", expected: "working implementation" },
    ],
    starterCode: {
      "Python 3": isMl
        ? `def ${fn}(data):\n    \"\"\"Implement ${problem.title}.\"\"\"\n    # Write your solution here\n    return None\n`
        : `def ${fn}(input_data):\n    # Write your solution here\n    return input_data\n`,
      "C++": `class Solution {\npublic:\n    void ${fn}() {\n        // Write your solution here\n    }\n};\n`,
      "Java": `class Solution {\n    public void ${fn}() {\n        // Write your solution here\n    }\n}\n`,
      "JavaScript": isMl
        ? `function ${fn}(data) {\n  // Write your solution here\n  return null;\n}\n`
        : `function ${fn}(input) {\n  // Write your solution here\n  return input;\n}\n`,
    },
  };
}

// Default starter for problems without specific detail
export const defaultStarter = (lang) => ({
  "Python 3":   "class Solution:\n    def solve(self):\n        # Write your solution here\n        pass\n",
  "C++":        "class Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};\n",
  "Java":       "class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}\n",
  "JavaScript": "var solve = function() {\n    // Write your solution here\n};\n",
}[lang] || "# Write your solution here\n");

Object.assign(
  PROBLEM_DETAILS,
  Object.fromEntries(
    PROBLEMS
      .filter(problem => problem.id >= 200 && problem.id < 400)
      .map(problem => [problem.id, makePracticeDetail(problem)])
  )
);

// Topic list for filters
export const ALL_TOPICS = [
  "Array","String","Linked List","Tree","Graph","DP","Stack","Queue",
  "Hash Table","Binary Search","Two Pointers","Sliding Window","Backtracking",
  "Greedy","Heap","Trie","Math","Bit Manipulation","Design","Union Find",
  "Recursion","Divide&Conquer","Sorting","Prefix Sum","Memoization","BST","BFS","DFS",
  "HTML","CSS","JavaScript","DOM","React","Hooks","Node.js","Express","API","Auth",
  "SQL","Database","Docker","DevOps","WebSocket","Full Stack","Accessibility",
  "Python","Data Science","NumPy","Pandas","Statistics","Probability","Linear Algebra",
  "Scikit-learn","ML","Deep Learning","Neural Networks","NLP","Computer Vision","ML Ops",
];
