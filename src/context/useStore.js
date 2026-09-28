// src/context/useStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginWithEmail, registerWithEmail, loginWithGoogle as fbGoogle,
  logoutUser, resetPassword, updateUserProfile, onAuthChange,
} from "../services/firebase";
import { ADMIN_EMAIL } from "../services/firebase";
import { getProfile, createProfile, updateProfile } from "../services/supabase";
import { hydrateAdminContent, subscribeAdminContent } from "../utils/adminContent";

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────
      user:        null,
      userProfile: null,
      loading:     true,
      contentLoading: true,
      progressRevision: 0,
      contentRevision: 0,

      setUser:        (u) => set({ user: u }),
      setUserProfile: (p) => set({ userProfile: p }),
      setLoading:     (l) => set({ loading: l }),
      notifyProgress: () => set(s => ({ progressRevision: s.progressRevision + 1 })),
      loadAdminContent: async () => {
        try {
          await hydrateAdminContent();
        } finally {
          set(s => ({ contentLoading: false, contentRevision: s.contentRevision + 1 }));
        }
      },
      startAdminContentSync: () => subscribeAdminContent(async () => {
        if (await hydrateAdminContent()) {
          set(s => ({ contentRevision: s.contentRevision + 1 }));
        }
      }),

      initAuth: () => {
        const unsub = onAuthChange(async (firebaseUser) => {
          if (!firebaseUser) {
            set({ user: null, userProfile: null, loading: false });
            return;
          }

          // Keep Firebase auth independent from profile storage. A Supabase
          // outage or RLS error must not turn a valid session into a logout.
          set({ user: firebaseUser });
          let profile = {
            uid: firebaseUser.uid,
            display_name: firebaseUser.displayName || "CodeBro",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            role: firebaseUser.email?.toLowerCase() === ADMIN_EMAIL ? "admin" : "student",
            xp: 0,
            level: 1,
            coins: 0,
            streak: 0,
            solved_problems: [],
            badges: [],
            social_links: {},
          };

          try {
            const storedProfile = await getProfile(firebaseUser.uid);
            if (storedProfile) {
              const configuredAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;
              profile = configuredAdmin ? { ...storedProfile, role: "admin" } : storedProfile;
              if (configuredAdmin && storedProfile.role !== "admin") {
                try {
                  profile = { ...profile, ...(await updateProfile(firebaseUser.uid, { role: "admin" })) };
                } catch (roleError) {
                  // Keep the configured admin session usable while Supabase setup is completed.
                  console.warn("Admin role sync failed; using configured admin identity:", roleError.message || roleError);
                }
              }
            } else {
              const newProfile = {
                ...profile,
                username: (firebaseUser.email?.split("@")[0] || "user") + Math.floor(Math.random() * 9999),
                bio: "",
                location: "",
                last_login_date: new Date().toISOString(),
              };
              try {
                profile = await createProfile(newProfile);
              } catch (createErr) {
                // Another auth callback may have created the row first.
                profile = await getProfile(firebaseUser.uid);
                if (!profile) throw createErr;
              }
            }
          } catch (err) {
            console.error("Profile sync error; continuing with Firebase session:", err);
          }

          set({ userProfile: profile, loading: false });
          get().updateStreak(firebaseUser.uid, profile).catch(() => {
            // A missing or misconfigured profile table must not block sign-in.
          });
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
        const { user } = get();
        if (!user) return;
        const updated = await updateProfile(user.uid, updates);
        set(s => ({ userProfile: { ...s.userProfile, ...updated }, progressRevision: s.progressRevision + 1 }));
        return updated;
      },

      // ── XP & Gamification ─────────────────────────────
      awardXP: async (amount, reason = "") => {
        const { user, userProfile } = get();
        if (!user || !userProfile) return;
        const newXP    = (userProfile.xp    || 0) + amount;
        const newLevel = Math.floor(newXP / 500) + 1;
        const updated  = await updateProfile(user.uid, { xp: newXP, level: newLevel });
        set(s => ({ userProfile: { ...s.userProfile, ...updated }, progressRevision: s.progressRevision + 1 }));
        get().addNotification({ type: "xp", message: `+${amount} XP — ${reason}` });
      },

      markProblemSolved: async (problemId) => {
        const { user, userProfile } = get();
        if (!user || !userProfile) return false;
        const solved = userProfile.solved_problems || [];
        if (solved.includes(problemId)) return false;
        const newSolved = [...solved, problemId];
        const updated   = await updateProfile(user.uid, { solved_problems: newSolved });
        set(s => ({ userProfile: { ...s.userProfile, ...updated }, progressRevision: s.progressRevision + 1 }));
        return true;
      },

      // FIX: streak logic — the original had a redundant `else if (last !== today)`
      // which always reset streak to 1 even on consecutive days.
      updateStreak: async (uid, profile) => {
        const today     = new Date().toDateString();
        const lastRaw   = profile?.last_login_date;
        const last      = lastRaw ? new Date(lastRaw).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Already updated today — skip
        if (last === today) return;

        let streak = profile?.streak || 0;
        if (last === yesterday) {
          // Consecutive day — increment
          streak += 1;
        } else {
          // Missed a day (or first ever login) — reset to 1
          streak = 1;
        }

        const storedDate = new Date().toISOString();
        await updateProfile(uid, { streak, last_login_date: storedDate });
        set(s => ({
          userProfile: s.userProfile ? { ...s.userProfile, streak, last_login_date: storedDate } : s.userProfile,
          progressRevision: s.progressRevision + 1,
        }));
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
