import { useMemo } from "react";

// Dummy names for when user is not logged in
const DUMMY_NAMES = [
  "Curious Panda",
  "Happy Dolphin",
  "Clever Fox",
  "Wise Owl",
  "Friendly Giraffe",
  "Brave Lion",
  "Creative Koala",
  "Calm Turtle",
  "Swift Eagle",
];

// Pastel color palette for when user is not logged in
const PASTEL_COLORS = [
  "#FF9FB6", // Brighter pink
  "#FFCC80", // Vibrant peach
  "#AED581", // Livelier lime
  "#80DEEA", // Brighter teal
  "#B39DDB", // Richer lavender
  "#F48FB1", // Stronger rose
  "#81C784", // Fresher mint
  "#FFD54F", // Golden yellow
  "#9FA8DA", // Bolder periwinkle
];

export function useCollaborationUser(user: any) {
  return useMemo(() => {
    // Get random name and color from arrays
    const randomNameIndex = Math.floor(Math.random() * DUMMY_NAMES.length);
    const randomColorIndex = Math.floor(Math.random() * PASTEL_COLORS.length);

    return {
      userName: user?.name || DUMMY_NAMES[randomNameIndex],
      userColor: PASTEL_COLORS[randomColorIndex],
    };
  }, [user]);
}
