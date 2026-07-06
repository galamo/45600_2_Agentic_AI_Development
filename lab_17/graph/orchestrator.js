import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { createUser } from "../nodes/create-user.js";
import { createEmail } from "../nodes/create-email.js";
import { createJob } from "../nodes/create-job.js";
import { outputUser } from "../nodes/output-user.js";

const StateAnnotation = Annotation.Root({
  name: Annotation(),
  email: Annotation(),
  job: Annotation(),
  restOfData: Annotation(),
});

/**
 * Sequential graph:
 *   START → createUser → createEmail → createJob → outputUser → END
 * Each node adds one field to the shared user object.
 */
export function createGraph() {
  const graph = new StateGraph(StateAnnotation)
    .addNode("createUser", createUser)
    .addNode("createEmail", createEmail)
    .addNode("createJob", createJob)
    .addNode("outputUser", outputUser)
    .addEdge(START, "createUser")
    .addEdge("createUser", "createEmail")
    .addEdge("createEmail", "createJob")
    .addEdge("createJob", "outputUser")
    .addEdge("outputUser", END)
    .compile();

  return {
    graph,
    getInfo: () => ({
      flow: "createUser → createEmail → createJob → outputUser",
      fields: ["id", "name", "email", "job"],
    }),
  };
}
