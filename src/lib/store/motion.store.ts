import { create } from 'zustand';

interface MotionState {
    selectedSportType: string | null;
    selectedSubCategory: string | null;

    setSport: (sportType: string, subCategory: string) => void;
    clearSport: () => void;
}

export const useMotionStore = create<MotionState>((set) => ({
    selectedSportType: null,
    selectedSubCategory: null,

    setSport: (sportType, subCategory) =>
        set({ selectedSportType: sportType, selectedSubCategory: subCategory }),

    clearSport: () =>
        set({ selectedSportType: null, selectedSubCategory: null }),
}));