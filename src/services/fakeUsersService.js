export const users = [
  {
    _id: "661ad744f9f8d3eec31c6a56",
    name: "Mosh",
    email: "admin@gmail.com",
    password: "$2b$10$IpgZzptgBIjyjIIotyrjX.mQ4i/UujsbcmO.BuuBBpNjmAiUQaDcK",
  },
  {
    _id: "661ad78cf9f8d3eec31c6a5c",
    name: "Misha",
    email: "admin2@gmail.com",
    password: "$2b$10$Doye9pTNzTi/aGUZOrobPu.8O9mJOAQE7l6QuAzYhc6QerQ4wkJm6",
  },
];

export function getUsers() {
  return users.filter((u) => u);
}
