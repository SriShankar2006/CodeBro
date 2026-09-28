# 🔧 Implementation Details - Editor Architecture

## 📁 File Structure

```
src/
├── pages/
│   ├── Editor.jsx          ← NEW: Complete rewrite with split-view + full-screen
│   └── Problems.jsx        ← UPDATED: Pass state to Editor
├── data/
│   ├── problems.js         ← UPDATED: Added test cases for problems 1-3
│   └── courses.js          ← Already has roadmap integration
├── services/
│   ├── judge0.js           ← EXISTING: Code execution API
│   ├── firebase.js         ← Auth
│   └── supabase.js         ← Database
├── context/
│   └── useStore.js         ← EXISTING: Has markProblemSolved method
└── components/
    └── UI.jsx              ← Components used (DifficultyTag, Card, Button, etc.)
```


## 🎯 Editor Component Architecture

### **Main Component: Editor.jsx**

```javascript
export default function Editor() {
  // Route params & navigation
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [lang, setLang] = useState("Python 3");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  
  // Store hooks
  const { userProfile, markProblemSolved, awardXP } = useStore();
  
  // Determine layout
  const fromProblems = location.state?.fromProblems || false;
  const isFullScreen = !id;
  
  // Handlers
  const handleLangChange = useCallback((newLang) => {...}, [details]);
  const handleRunCode = useCallback(async () => {...}, [code, lang, ...]);
  
  // Render based on mode
  if (isFullScreen) return <FullScreenEditor />;
  return <SplitViewEditor />;
}
```

### **Key State Variables**

| Variable | Type | Purpose |
|----------|------|---------|
| `id` | number | Problem ID from URL params |
| `lang` | string | Selected programming language |
| `code` | string | Current code in editor |
| `running` | boolean | Show loading state during execution |
| `results` | array | Test case execution results |
| `activeTab` | string | Current tab (statement/examples/hints) |
| `fromProblems` | boolean | Whether opened from Problems page |
| `isFullScreen` | boolean | Full-screen mode (no problem) |

---

## 🔄 Data Flow

### **Full-Screen Mode (Free Coding)**
```
User opens /editor
  ↓
isFullScreen = true
  ↓
Render full-screen editor with language selector
  ↓
User writes code
  ↓
User clicks "Run Code"
  ↓
Call runCode() via Judge0 API
  ↓
Display results (no test case matching)
```

### **Split-View Mode (Problem Solving)**
```
User clicks problem in Problems list
  ↓
Navigate to /editor/123 with state: { fromProblems: true }
  ↓
isFullScreen = false && fromProblems = true
  ↓
Render split view:
  - Left: Problem details with tabs
  - Right: Code editor
  ↓
User reads problem on left, codes on right
  ↓
User clicks "Submit"
  ↓
For each test case in PROBLEM_DETAILS[id].testCases:
  - Call runCode(code, lang, test.input)
  - Compare stdout.trim() === test.expected.trim()
  - Mark PASS/FAIL
  ↓
If all tests PASS:
  - markProblemSolved(id)
  - awardXP(problem.xp)
  - Show success toast
  - Roadmap auto-updates
  ↓
Show results panel with all test details
```

---

## 🧠 Problem Details Structure

### **PROBLEM_DETAILS[id] Format**

```javascript
{
  // Problem description
  statement: "Full problem description...",
  
  // Example input/output for learning
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] = 2 + 7 = 9..."
    }
  ],
  
  // Problem constraints
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹"
  ],
  
  // Tips for solving
  hints: [
    "A brute force O(n²) check every pair — can we do better?",
    "Think about what complement you need..."
  ],
  
  // Automated test cases for grading
  testCases: [
    { input: "[2,7,11,15]\n9", expected: "[0,1]" },
    { input: "[3,2,4]\n6",     expected: "[1,2]" },
    { input: "[3,3]\n6",       expected: "[0,1]" }
  ],
  
  // Starting code for each language
  starterCode: {
    "Python 3":   "class Solution:\n    def twoSum(...)",
    "C++":        "class Solution {\npublic:\n    ...",
    "Java":       "class Solution {\n    public int[] ..."
  },
  
  // Optional: Solution explanation
  editorial: "## Approach: Hash Map — O(n) Time..."
}
```

### **Test Case Format**

```javascript
{
  input: "space-separated or newline-separated input",
  expected: "expected output"
}
```

**Note**: `input` is passed as stdin to the program. Most LeetCode-style problems expect:
- First line: first parameter
- Second line: second parameter
- etc.

---

## 🎬 Test Execution Flow

### **When User Clicks Submit**

```javascript
const handleRunCode = async () => {
  setRunning(true);
  const testCases = details?.testCases || [];
  const results = [];
  
  // Run code against each test case
  for (const tc of testCases) {
    const res = await runCode({
      sourceCode: code,
      language: lang,
      stdin: tc.input  // Pass input as stdin
    });
    
    // Compare outputs (trimmed whitespace)
    const passed = res.stdout?.trim() === tc.expected?.trim();
    
    results.push({
      input: tc.input,
      expected: tc.expected,
      output: res.stdout,
      verdict: res.verdict,
      passed: passed
    });
  }
  
  // Check if all passed
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    await markProblemSolved(problemId);
    await awardXP(problem.xp, `Solved: ${problem.title}`);
  }
  
  setResults(results);
  setRunning(false);
};
```

---

## 🔌 Judge0 API Integration

### **API Endpoint**
```
POST /submissions?base64_encoded=false&wait=false
```

### **Request Payload**
```javascript
{
  source_code: "code here",
  language_id: 71,  // 71 = Python 3
  stdin: "input data",
  cpu_time_limit: 5
}
```

### **Response**
```javascript
{
  verdict: "Accepted",
  verdictId: 3,
  stdout: "program output",
  stderr: "error messages",
  time: "0.05",
  memory: 16000
}
```

### **Verdict Codes**
- 3: Accepted ✓
- 4: Wrong Answer ✗
- 5: Time Limit Exceeded ⏱
- 6: Compilation Error 🔴
- 7: Runtime Error 💥

---

## 💾 Store Integration (useStore)

### **Methods Used**

```javascript
// Mark problem as solved
await markProblemSolved(problemId);
// Updates: userProfile.solved_problems array

// Award XP
await awardXP(amount, reason);
// Updates: userProfile.xp, userProfile.level

// Data persisted to Supabase automatically
```

### **Reactive Updates**

When profile changes, Roadmap auto-updates because it computes status from:
```javascript
const solvedSet = new Set(userProfile?.solved_problems || []);
```

---

## 📝 Performance Optimizations

### **1. Memoization**

```javascript
// Problem lookup (not refetched every render)
const problem = useMemo(
  () => PROBLEMS.find(p => p.id === problemId),
  [problemId]
);

// Problem details (regenerated only when problem/lang changes)
const details = useMemo(
  () => PROBLEM_DETAILS[problemId] || {...},
  [problem, problemId, lang]
);
```

### **2. Callback Memoization**

```javascript
const handleLangChange = useCallback(
  (newLang) => {
    setLang(newLang);
    const newCode = details?.starterCode?.[newLang] || defaultStarter(newLang);
    setCode(newCode);
  },
  [details] // Only recreate if details changes
);
```

### **3. No Unnecessary Re-renders**

- Code state only updates when user types
- Results only update when tests complete
- Language change doesn't trigger problem re-fetch

### **4. Lazy State Initialization**

```javascript
const [code, setCode] = useState("");

// Initialize code on first mount (only when problem loads)
React.useEffect(() => {
  if (problem && details && !code) {
    const starter = details.starterCode?.[lang] || defaultStarter(lang);
    setCode(starter);
  }
}, [problem, details, lang]);
```

---

## 🎨 UI/UX Features

### **1. Tab Interface (Left Panel)**

```javascript
const [activeTab, setActiveTab] = useState("statement");

// Tabs: statement | examples | hints
{["statement", "examples", "hints"].map(t => (
  <button
    onClick={() => setActiveTab(t)}
    style={{
      borderBottom: activeTab === t ? "2px solid var(--accent3)" : "none"
    }}
  >
    {t}
  </button>
))}
```

### **2. Results Animation**

```javascript
<AnimatePresence>
  {showResults && results.length > 0 && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Results panel */}
    </motion.div>
  )}
</AnimatePresence>
```

### **3. Test Result Cards**

```javascript
<div style={{
  background: r.passed ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)",
  border: `1px solid ${r.passed ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.3)"}`
}}>
  <span style={{ color: r.passed ? "var(--green)" : "var(--red)" }}>
    {r.passed ? "✓ PASS" : "✗ FAIL"}
  </span>
</div>
```

---

## 🔐 Environment Variables Required

```bash
# .env file
REACT_APP_JUDGE0_KEY=your_judge0_api_key_here

# If not set, Judge0 runs in DEMO mode
# (returns fake results for testing)
```

---

## 🚀 Extending the Implementation

### **Add More Test Cases**

```javascript
// In src/data/problems.js
PROBLEM_DETAILS[problemId] = {
  // ... existing fields ...
  testCases: [
    { input: "input1", expected: "output1" },
    { input: "input2", expected: "output2" },
    // Add more test cases here
  ]
}
```

### **Add Problem Details**

```javascript
// Create PROBLEM_DETAILS for new problems
PROBLEM_DETAILS[newId] = {
  statement: "...",
  examples: [...],
  constraints: [...],
  hints: [...],
  testCases: [...],
  starterCode: {
    "Python 3": "...",
    // Add for each language
  }
}
```

### **Support New Language**

```javascript
// In judge0.js
LANGUAGE_IDS["Go"] = 60;  // Already done!

// In Editor.jsx
LANGUAGES.push("NewLanguage");
```

---

## 📊 Roadmap Integration Details

### **How Roadmap Updates Automatically**

```javascript
// Roadmap.jsx computes status dynamically
const solvedSet = new Set(userProfile?.solved_problems || []);

// For each node:
const solved = node.problemIds.every(pid => solvedSet.has(pid));
const status = solved ? "done" : prereqsMet ? "active" : "locked";
```

When `markProblemSolved()` updates `userProfile.solved_problems`, the Roadmap component re-renders with new statuses computed from the latest solved problems.

---

## 🐛 Error Handling

### **In handleRunCode**

```javascript
try {
  const res = await runCode({...});
  // Process results
} catch (err) {
  toast.error("Error: " + err.message);
  setResults([{ verdict: "Error", output: err.message }]);
}
```

### **Errors Handled**

- Network errors (API unreachable)
- Compilation errors (code won't compile)
- Runtime errors (code crashes)
- Timeout (code takes too long)
- Network timeout (Judge0 unresponsive)

---

## 🧪 Testing the Implementation

### **Manual Testing Checklist**

- [ ] Open `/editor` (full-screen mode)
- [ ] Open `/editor/1` from Problems (split-view mode)
- [ ] Write Python code and run
- [ ] Try different languages
- [ ] Submit code against test cases
- [ ] Verify all tests pass shows success message
- [ ] Check XP awarded in profile
- [ ] Check problem marked solved in Problems list
- [ ] Verify Roadmap updates

### **Test Case: Problem #1**

```python
# Input: [2,7,11,15]\n9
# Expected: [0,1]

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i
        return []
```

---

## 📚 API References

- **Judge0 API**: https://rapidapi.com/judge0-official/api/judge0-ce
- **React Router**: https://reactrouter.com/
- **Framer Motion**: https://www.framer.com/motion/
- **Zustand**: https://github.com/pmndrs/zustand
- **React Hot Toast**: https://react-hot-toast.com/

---

## ✨ Future Enhancements

1. **Code Syntax Highlighting**: Add Monaco Editor or Ace
2. **Collaborative Coding**: Real-time multi-user coding
3. **AI Assistant**: ChatGPT integration for hints
4. **Video Editorial**: Link to solution videos
5. **Leaderboard**: Show fastest solvers
6. **Discussions**: Per-problem discussion threads
7. **Code Review**: Peer code review feature
8. **Optimization Tracking**: Show time/space complexity

---

**Implementation Complete! 🎉**

For questions or issues, refer to the code comments or existing patterns in the codebase.
