const FIRST_NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Quinn"];
const LAST_NAMES = ["Smith", "Johnson", "Lee", "Brown", "Garcia", "Miller", "Davis", "Wilson"];

export async function createUser() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

  return {
   
      name: `${first} ${last}`,
      email:1,
     
  };
}
