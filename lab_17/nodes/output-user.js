export async function outputUser(state) {
  console.log("\n--- Complete user ---");
  console.log(JSON.stringify(state.user, null, 2));

  return { };
}
