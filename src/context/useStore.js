// src/context/useStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginWithEmail, registerWithEmail, loginWithGoogle as fbGoogle,
  logoutUser, resetPassword, updateUserProfile, onAuthChange,
} from "../services/firebase";
import { getProfile, createProfile, updateProfile } from "../services/supabase";

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────
      user:        null,
      userProfile: null,
      loading:     true,

      setUser:        (u) => set({ user: u }),
      setUserProfile: (p) => set({ userProfile: p }),
      setLoading:     (l) => set({ loading: l }),

      initAuth: () => {
        const unsub = onAuthChange(async (firebaseUser) => {
          try {
            if (firebaseUser) {
              set({ user: firebaseUser });
              let profile = await getProfile(firebaseUser.uid);
              if (!profile) {
                // ── Brand new user: create clean profile ──
                profile = await createProfile({
                  uid:              firebaseUser.uid,
                  display_name:     firebaseUser.displayName || "CodeBro",
                  username:         (firebaseUser.email?.split("@")[0] || "user") + Math.floor(Math.random() * 9999),
                  email:            firebaseUser.email || "",
                  avatar:           firebaseUser.photoURL || "",
                  bio:              "",
                  location:         "",
                  role:             "student",
                  xp:               0,
                  level:            1,
                  coins:            0,
                  streak:           0,
                  last_login_date:  new Date().toISOString(),
                  solved_problems:  [],
                  badges:           [],
                  social_links:     {},
                });
              }
              set({ userProfile: profile });
              // Update streak
              get().updateStreak(firebaseUser.uid, profile);
            } else {
              set({ user: null, userProfile: null });
            }
          } catch (err) {
            console.error("Auth init error:", err);
            set({ user: null, userProfile: null });
          } finally {
            set({ loading: false });
          }
        });
        return unsub;
      },

      login: async (email, password) => {
        const cred = await loginWithEmail(email, password);
        return cred.user;
      },

      register: async (email, password, displayName) => {
        const cred = await registerWithEmail(email, password);
        await updateUserProfile(cred.user, { displayName });
        // Profile created automatically in initAuth
        return cred.user;
      },

      loginGoogle: async () => {
        const cred = await fbGoogle();
        return cred.user;
      },

      logout: async () => {
        await logoutUser();
        set({ user: null, userProfile: null });
      },

      forgotPassword: (email) => resetPassword(email),

      // ── Profile update ────────────────────────────────
      updateMyProfile: async (updates) => {
        const { user, userProfile } = get();
        if (!user) return;
        const updated = await updateProfile(user.uid, updates);
        set({ userProfile: { ...userProfile, ...updated } });
        return updated;
      },

      // ── XP & Gamification ─────────────────────────────
      awardXP: async (amount, reason = "") => {
        const { user, userProfile } = get();
        if (!user || !userProfile) return;
        const newXP    = (userProfile.xp    || 0) + amount;
        const newLevel = Math.floor(newXP / 500) + 1;
        const updated  = await updateProfile(user.uid, { xp: newXP, level: newLevel });
        set({ userProfile: { ...userProfile, ...updated } });
        get().addNotification({ type: "xp", message: `+${amount} XP — ${reason}` });
      },

      markProblemSolved: async (problemId) => {
        const { user, userProfile } = get();
        if (!user || !userProfile) return false;
        const solved = userProfile.solved_problems || [];
        if (solved.includes(problemId)) return false;
        const newSolved = [...solved, problemId];
        const updated   = await updateProfile(user.uid, { solved_problems: newSolved });
        set({ userProfile: { ...userProfile, ...updated } });
        return true;
      },

      updateStreak: async (uid, profile) => {
        const today     = new Date().toDateString();
        const last      = profile?.last_login_date;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let streak = profile?.streak || 0;
        if (last === today)     return;
        if (last === yesterday) streak += 1;
        else if (last !== today) streak = 1;
        await updateProfile(uid, { streak, last_login_date: today });
        set(s => ({ userProfile: s.userProfile ? { ...s.userProfile, streak, last_login_date: today } : s.userProfile }));
      },

      // ── UI ────────────────────────────────────────────
      darkMode:      true,
      notifications: [],

      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

      addNotification: (n) =>
        set(s => ({ notifications: [{ id: Date.now(), read: false, ...n }, ...s.notifications].slice(0, 40) })),
      markAllRead: () =>
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
    }),
    { name: "codebro-store", partialize: s => ({ darkMode: s.darkMode }) }
  )
);

export default useStore;
