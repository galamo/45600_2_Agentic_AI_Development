/**
 * Knowledge base used by BOTH retrievers.
 *
 *  - `sentences` is what the vector store sees: flat natural-language text.
 *  - `triples`   is what the graph store sees: typed (subject, predicate, object) edges.
 *
 * The same facts are expressed both ways so the comparison is apples-to-apples:
 * the only thing that changes between the two RAG branches is HOW the facts
 * are retrieved, not WHICH facts are available.
 */

export const sentences = [
  "Alice is a senior software engineer at Acme Corp.",
  "Bob is the CTO of Acme Corp.",
  "Alice reports to Bob at Acme Corp.",
  "Acme Corp is headquartered in Berlin.",
  "Berlin is the capital of Germany.",
  "Bob previously worked at Globex as a principal engineer.",
  "Charlie founded Globex in 2018.",
  "Globex acquired Initech in 2023.",
  "Initech is based in Munich, Germany.",
  "Dana is a data scientist at Initech.",
  "Dana collaborates with Alice on a joint research project.",
  "Acme Corp partners with Globex on cloud infrastructure.",
];

const s2 = [
  "Yonatan works in Microsoft",
  "Microsoft Acquired OpenAI",
  "Bar Works in OpenAI",
  "OpenAI using Kubernetes",
  "OpenAI are using Python"
]


/**
 * Graph schema (Subject)-[PREDICATE]->(Object) with optional props.
 * Entities are nodes labelled :Person, :Company, or :City.
 */
// export const triples = [
//   { s: { label: "Person",  name: "Alice"   }, p: "WORKS_AT",         o: { label: "Company", name: "Acme Corp"  }, props: { role: "Senior Software Engineer" } },
//   { s: { label: "Person",  name: "Bob"     }, p: "CTO_OF",           o: { label: "Company", name: "Acme Corp"  } },
//   { s: { label: "Person",  name: "Alice"   }, p: "REPORTS_TO",       o: { label: "Person",  name: "Bob"        } },
//   { s: { label: "Company", name: "Acme Corp" }, p: "HEADQUARTERED_IN", o: { label: "City",    name: "Berlin"   } },
//   { s: { label: "City",    name: "Berlin"  }, p: "CAPITAL_OF",       o: { label: "Country", name: "Germany"   } },
//   { s: { label: "Person",  name: "Bob"     }, p: "WORKED_AT",        o: { label: "Company", name: "Globex"    }, props: { role: "Principal Engineer", past: true } },
//   { s: { label: "Person",  name: "Charlie" }, p: "FOUNDED",          o: { label: "Company", name: "Globex"    }, props: { year: 2018 } },
//   { s: { label: "Company", name: "Globex"  }, p: "ACQUIRED",         o: { label: "Company", name: "Initech"   }, props: { year: 2023 } },
//   { s: { label: "Company", name: "Initech" }, p: "BASED_IN",         o: { label: "City",    name: "Munich"    } },
//   { s: { label: "City",    name: "Munich"  }, p: "LOCATED_IN",       o: { label: "Country", name: "Germany"   } },
//   { s: { label: "Person",  name: "Dana"    }, p: "WORKS_AT",         o: { label: "Company", name: "Initech"   }, props: { role: "Data Scientist" } },
//   { s: { label: "Person",  name: "Dana"    }, p: "COLLABORATES_WITH", o: { label: "Person", name: "Alice"     } },
//   { s: { label: "Company", name: "Acme Corp" }, p: "PARTNERS_WITH",  o: { label: "Company", name: "Globex"    } },
// ];
// What was Alice's manager's previous role before working at Acme Corp?


export const triples = [
  // Alice works at Acme
  {
    s: { label: "Person", name: "Alice" },
    p: "WORKS_AT",
    o: { label: "Company", name: "Acme Corp" },
    props: { role: "Senior Software Engineer" }
  },

  // Bob is CTO of Acme
  {
    s: { label: "Person", name: "Bob" },
    p: "CTO_OF",
    o: { label: "Company", name: "Acme Corp" }
  },

  // Alice reports to Bob
  {
    s: { label: "Person", name: "Alice" },
    p: "REPORTS_TO",
    o: { label: "Person", name: "Bob" }
  },

  // Acme location
  {
    s: { label: "Company", name: "Acme Corp" },
    p: "HEADQUARTERED_IN",
    o: { label: "City", name: "Berlin" }
  },

  {
    s: { label: "City", name: "Berlin" },
    p: "LOCATED_IN",
    o: { label: "Country", name: "Germany" }
  },

  // Important for:
  // "What is the capital of the country where Dana's employer is based?"
  {
    s: { label: "Country", name: "Germany" },
    p: "HAS_CAPITAL",
    o: { label: "City", name: "Berlin" }
  },

  // Bob previously worked at Globex
  {
    s: { label: "Person", name: "Bob" },
    p: "WORKED_AT",
    o: { label: "Company", name: "Globex" },
    props: {
      role: "Principal Engineer",
      past: true
    }
  },

  // Charlie founded Globex
  {
    s: { label: "Person", name: "Charlie" },
    p: "FOUNDED",
    o: { label: "Company", name: "Globex" },
    props: { year: 2018 }
  },

  // Useful inverse edge for Graph traversal
  {
    s: { label: "Company", name: "Globex" },
    p: "FOUNDED_BY",
    o: { label: "Person", name: "Charlie" },
    props: { year: 2018 }
  },

  // Globex acquired Initech
  {
    s: { label: "Company", name: "Globex" },
    p: "ACQUIRED",
    o: { label: "Company", name: "Initech" },
    props: { year: 2023 }
  },

  // Useful inverse edge:
  // Dana -> Initech -> Globex
  {
    s: { label: "Company", name: "Initech" },
    p: "ACQUIRED_BY",
    o: { label: "Company", name: "Globex" },
    props: { year: 2023 }
  },

  // Initech location
  {
    s: { label: "Company", name: "Initech" },
    p: "BASED_IN",
    o: { label: "City", name: "Munich" }
  },

  {
    s: { label: "City", name: "Munich" },
    p: "LOCATED_IN",
    o: { label: "Country", name: "Germany" }
  },

  // Dana works at Initech
  {
    s: { label: "Person", name: "Dana" },
    p: "WORKS_AT",
    o: { label: "Company", name: "Initech" },
    props: { role: "Data Scientist" }
  },

  // Dana collaborates with Alice
  {
    s: { label: "Person", name: "Dana" },
    p: "COLLABORATES_WITH",
    o: { label: "Person", name: "Alice" }
  },

  // Optional inverse because collaboration is naturally bidirectional
  {
    s: { label: "Person", name: "Alice" },
    p: "COLLABORATES_WITH",
    o: { label: "Person", name: "Dana" }
  },

  // Acme partners with Globex
  {
    s: { label: "Company", name: "Acme Corp" },
    p: "PARTNERS_WITH",
    o: { label: "Company", name: "Globex" }
  }
];