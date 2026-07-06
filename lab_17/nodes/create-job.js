const JOBS = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "UX Designer",
  "DevOps Engineer",
  "QA Analyst",
  "Solutions Architect",
  "Technical Writer",
];

export async function createJob(state) {
  
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];
  
  return {
    
      job
  };
}
