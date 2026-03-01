export const CURRENT_USER_ID = "33333333-3333-3333-3333-333333333333";


export const PICKUP_POINTS = [
  { value: "gate", label: "Gate" },
  { value: "fence_a9", label: "Fence A9" },
  { value: "fence_ag3", label: "Fence AG3" },
];

export const BUILDINGS = [
  "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10",
];

export const DROP_POINTS = [
  { value: "ground", label: "Ground Floor" },
  { value: "room", label: "Room" },
];

export const PACKAGE_TAGS = ["small", "medium", "bulky", "heavy", "long"];

export function formatPickupPoint(value) {
  const found = PICKUP_POINTS.find((p) => p.value === value);
  return found ? found.label : value;
}

export function formatDropPoint(value) {
  const found = DROP_POINTS.find((p) => p.value === value);
  return found ? found.label : value;
}
