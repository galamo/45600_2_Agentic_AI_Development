/**
 * Lab 17: LangGraph sequential user builder
 *
 * Flow: createUser → createEmail → createJob → outputUser
 * Run: npm start
 */
import { createGraph } from "./graph/orchestrator.js";

const { graph, getInfo } = createGraph();

console.log("Lab 17 – LangGraph: Build User Step by Step\n");
console.log("Flow:", getInfo().flow);
console.log("Fields added:", getInfo().fields.join(" → "));
console.log("\nRunning graph...");

try {
  const finalState = await graph.invoke({ });
  console.log("!!!!!!!!!")
  console.log("\nFinal state returned from graph.");
  console.log(finalState);
} catch (err) {
  console.log(err)
  console.error("Error:", err.message);
  process.exit(1);
}
