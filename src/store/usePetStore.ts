import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Personality, PetMood, BondTier, InventoryItem, PetAnimal } from '../types';
import { getBondXPMax } from '../utils/levelSystem';
import { mmkvStorage } from './storage';

interface PetState {
  petName: string;
  petAnimal: PetAnimal;
  personality: Personality;
  mood: PetMood;
  level: number;
  bondTier: BondTier;
  bondXP: number;
  equippedCosmetics: string[];
  unlockedItems: InventoryItem[];

  setPetName: (name: string) => void;
  setPetAnimal: (animal: PetAnimal) => void;
  setPersonality: (personality: Personality) => void;
  updateMood: (mood: PetMood) => void;
  addBondXP: (amount: number) => void;
  equipItem: (id: string) => void;
  unlockItem: (item: InventoryItem) => void;
}

export const usePetStore = create<PetState>()(
  persist(
    (set) => ({
      petName: '',
      petAnimal: 'penguin' as PetAnimal,
      personality: 'soft' as Personality,
      mood: 'neutral' as PetMood,
      level: 1,
      bondTier: 1 as BondTier,
      bondXP: 0,
      equippedCosmetics: [],
      unlockedItems: [],

      setPetName: (name) => set({ petName: name }),
      setPetAnimal: (animal) => set({ petAnimal: animal }),
      setPersonality: (personality) => set({ personality }),
      updateMood: (mood) => set({ mood }),

      addBondXP: (amount) =>
        set((state) => {
          let newBondXP = state.bondXP + amount;
          let newTier = state.bondTier;
          let newLevel = state.level;
          while (newTier < 5 && newBondXP >= getBondXPMax(newTier)) {
            newBondXP -= getBondXPMax(newTier);
            newTier = (newTier + 1) as BondTier;
            newLevel += 1;
          }
          if (newTier >= 5) newBondXP = Math.min(newBondXP, getBondXPMax(5));
          return { bondXP: newBondXP, bondTier: newTier, level: newLevel };
        }),

      equipItem: (id) =>
        set((state) => ({
          equippedCosmetics: state.equippedCosmetics.includes(id)
            ? state.equippedCosmetics.filter((itemId) => itemId !== id)
            : [...state.equippedCosmetics, id],
        })),

      unlockItem: (item) =>
        set((state) => {
          if (state.unlockedItems.some((e) => e.id === item.id)) return state;
          return { unlockedItems: [...state.unlockedItems, item] };
        }),
    }),
    {
      name: 'pet-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
