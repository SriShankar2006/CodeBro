# 🎮 Quick Start Guide - New Editor Features

## 🌟 What's New?

### **Feature 1: Split-View Problem Solving**
When you click a problem from the Problems page:
```
┌─────────────────────┬─────────────────────┐
│  PROBLEM PANEL      │   EDITOR PANEL      │
├─────────────────────┼─────────────────────┤
│ #1 Two Sum          │  Language: Python 3 │
│ Easy · 30 XP        │                     │
│                     │  [Submit Button]    │
│ ✓ Statement         │                     │
│ ○ Examples          │  def twoSum(...):   │
│ ○ Hints             │                     │
│                     │  [Results below]    │
│ Given an array of   │                     │
│ integers nums and   │  Test 1: ✓ PASS    │
│ an integer target...│  Test 2: ✓ PASS    │
└─────────────────────┴─────────────────────┘
```

### **Feature 2: Full-Screen Code Editor**
Access `/editor` for free-form coding (no specific problem required):
```
┌──────────────────────────────────────┐
│ Code Editor | Language: Python 3    │
├──────────────────────────────────────┤
│                                      │
│  [Your code here]                    │
│                                      │
│  [Run Code] [Submit]                 │
│                                      │
│  Results:                            │
│  ✓ Output: [results shown]           │
└──────────────────────────────────────┘
```

---

## 📝 Step-by-Step: Solve a Problem

### **Step 1: Open Problems Page**
- Navigate to `/problems`
- Browse or search for a problem
- You see: Problem ID, Title, Difficulty, Company tags, Acceptance rate

### **Step 2: Click Problem to Open Split-View**
```
Click on any problem row → Editor opens in split-view
```

### **Step 3: Read Problem Details**
Left panel shows tabs:
- **📋 Statement**: Full problem description & constraints
- **📚 Examples**: Input/output examples with explanations  
- **💡 Hints**: Tips to help you solve it

### **Step 4: Write Your Solution**
Right panel has:
- Code textarea with monospace font
- Language dropdown (Python 3, C++, Java, JavaScript, C, Go, Rust)
- [Submit] button

```python
# Example for Problem #1 (Two Sum)
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

### **Step 5: Click Submit**
- Your code executes against all test cases
- Results panel opens below code
- Each test shows: ✓ PASS or ✗ FAIL
- Input, Expected, and Actual output displayed

### **Step 6: All Tests Pass? 🎉**
```
✓ Test 1 PASSED
✓ Test 2 PASSED
✓ Test 3 PASSED
✓ Test 4 PASSED

🎉 All tests passed!
+30 XP earned!
Problem marked as SOLVED ✓
Roadmap updated
```

---

## 🎯 Key Features Explained

### **Test Case Execution**
Problem #1 has 4 test cases:
```
Test 1: [2,7,11,15] target=9 → Expected: [0,1]
Test 2: [3,2,4] target=6 → Expected: [1,2]
Test 3: [3,3] target=6 → Expected: [0,1]
Test 4: [2,5,5,11] target=10 → Expected: [0,1]
```

When you submit, your code runs against all 4 and shows results.

### **Problem Completion**
Once all tests pass:
1. Problem marked with ✓ in Problems list
2. XP awarded based on difficulty
3. Roadmap topic updates (if problem is in a roadmap)
4. Prerequisites may unlock for other topics

### **Roadmap Auto-Update**
Example: If you solve all problems in "Arrays & Hashing" topic:
```
✓ Arrays & Hashing (Completed)
  ↓ Now unlocks
🔵 Two Pointers (Now Active)
```

---

## 🚀 Pro Tips

### **Tip 1: Use Hints If Stuck**
- Click "Hints" tab to see helpful suggestions
- Try solving without hints first!

### **Tip 2: Check Examples**
- Click "Examples" tab
- Manually trace through examples with your code
- Ensures you understand the problem

### **Tip 3: Language Switching**
- Switch languages anytime
- Starter code updates automatically
- No code loss when switching

### **Tip 4: Multiple Submissions**
- Can submit as many times as needed
- Failed tests help you debug
- No penalty for wrong attempts

### **Tip 5: Copy/Paste Results**
- Results show input, expected, and actual output
- Easy to debug mismatches
- Stack traces shown for errors

---

## ⌨️ Keyboard Shortcuts

- **Ctrl+Enter** or **Cmd+Enter**: Submit code (future)
- **Tab**: Indent code (works in editor)
- **Escape**: Close results panel

---

## 🐛 Debugging Failed Tests

If a test fails, you see:
```
Test 3: ✗ FAIL
Input: [3,3] target=6
Expected: [0,1]
Output: [] (empty or wrong)
```

### How to Debug:
1. Check your algorithm logic
2. Trace through manually
3. Look at the input carefully
4. Check edge cases
5. Resubmit after fixing

---

## 📊 Progress Tracking

Your progress is tracked in:
1. **Problems Page**: ✓ marks show solved problems
2. **Dashboard**: Overall stats updated
3. **Roadmap**: Topics show completion percentage
4. **Profile**: Total XP and level increase

---

## 🎓 Example: Solving Problem #3 (Contains Duplicate)

### Problem Statement:
"Return true if any value appears at least twice, false otherwise"

### Test Cases:
```
Test 1: [1,2,3,1] → Expected: True (1 appears twice)
Test 2: [1,2,3,4] → Expected: False (all unique)
Test 3: [1,1] → Expected: True
Test 4: [99,99] → Expected: True
```

### Solution:
```python
def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False
```

### Submit Results:
```
✓ Test 1 PASS: [1,2,3,1] → True
✓ Test 2 PASS: [1,2,3,4] → False
✓ Test 3 PASS: [1,1] → True
✓ Test 4 PASS: [99,99] → True

🎉 All tests passed! +30 XP awarded!
```

---

## ❓ FAQ

**Q: Can I code without selecting a problem?**
A: Yes! Go to `/editor` and code anything you want. Results are NOT checked against test cases.

**Q: What languages are supported?**
A: Python 3, C++, Java, JavaScript, C, Go, Rust

**Q: Can I switch languages mid-code?**
A: Yes! Language dropdown auto-loads starter code for new language.

**Q: Do I get XP for failed attempts?**
A: No. XP only awarded when ALL tests pass.

**Q: Does roadmap update automatically?**
A: Yes! When you complete all problems in a topic, roadmap updates instantly.

**Q: How many times can I submit?**
A: Unlimited! Keep trying until all tests pass.

**Q: What if my code times out?**
A: Judge0 has a 5-second timeout. Optimize your algorithm!

---

## 🎉 Ready to Code?

Start with: [Open Problems](/problems) or [Free Coding](/editor)

Good luck! 🚀
