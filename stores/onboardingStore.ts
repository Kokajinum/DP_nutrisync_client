import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OnboardingState {
  currentStep: number;
  data: UserProfileData;
  setStep: (step: number) => void;
  updateData: (newData: Partial<UserProfileData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      data: {},
      setStep: (step: number) => set({ currentStep: step }),
      updateData: (newData: Partial<UserProfileData>) =>
        set((state) => ({ data: { ...state.data, ...newData } })),
      reset: () => set({ currentStep: 0, data: {} }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
