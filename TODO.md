# TODO - Bug Audit Fixes

## Step 1 - Dashboard course progress
- Fix always-zero progress bar on Featured Courses. ✅

## Step 2 - Quiz stale closure
- Update finishQuiz useCallback dependencies to include `answers` (and any other referenced state). ✅

## Step 3 - Streak date format consistency
- Normalize `last_login_date` handling in useStore.js so comparisons and updates use the same format. ✅

## Step 4 - Certificates routing + navbar
- Add `/certificates` route in App.jsx.
- Add Certificates link in Navbar.jsx.

## Step 5 - Courses detail dynamic import
- Replace dynamic import inside CourseDetail useEffect with static import.

## Step 6 - Admin modal flash
- Prevent setup modal flash by initializing showSetup after profile loads.

## Step 7 - Verify build/test
- Run build/lint and sanity-check routes.

