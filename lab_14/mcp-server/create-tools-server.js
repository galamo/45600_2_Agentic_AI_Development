import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { z } from "zod";

const GEODB_BASE = "https://geodb-free-service.wirefreethought.com/v1/geo";
const COUNTRIES_NOW_BASE = "https://countriesnow.space/api/v0.1";

const REGION_TO_CONTINENT = {
  africa: "AF",
  asia: "AS",
  europe: "EU",
  "north america": "NA",
  "south america": "SA",
  americas: "NA",
  oceania: "OC",
  antarctica: "AN",
};

const countrySchema = z.object({
  name: z.string(),
  code: z.string(),
  capital: z.string().nullable(),
  continent: z.string().nullable(),
  population: z.number().nullable(),
  currencies: z.array(z.string()),
});

const getCountriesOutputSchema = z.object({
  countries: z.array(countrySchema),
  total: z.number(),
});

const calculatorOutputSchema = z.object({
  a: z.number(),
  b: z.number(),
  sum: z.number(),
});

function structuredToolResult(structuredContent) {
  return {
    content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }],
    structuredContent,
  };
}

function resolveContinentCode(region) {
  const key = region.trim().toLowerCase();
  return REGION_TO_CONTINENT[key] ?? region.trim().toUpperCase();
}

async function fetchLatestPopulation(countryName) {
  try {
    const { data } = await axios.post(
      `${COUNTRIES_NOW_BASE}/countries/population`,
      { country: countryName },
      { timeout: 10_000 }
    );
    const counts = data?.data?.populationCounts;
    if (!Array.isArray(counts) || counts.length === 0) return null;
    return counts[counts.length - 1]?.value ?? null;
  } catch {
    return null;
  }
}

async function enrichCountry(summary) {
  const { data } = await axios.get(`${GEODB_BASE}/countries/${summary.code}`, {
    timeout: 10_000,
  });
  const details = data?.data ?? {};
  const population = await fetchLatestPopulation(details.name ?? summary.name);

  return {
    name: details.name ?? summary.name,
    code: summary.code,
    capital: details.capital ?? null,
    continent: details.continentCode ?? summary.continentCode ?? null,
    population,
    currencies: details.currencyCodes ?? summary.currencyCodes ?? [],
  };
}

async function searchCountrySummaries({ name, region }) {
  const params = { limit: 10 };
  if (name?.trim()) params.namePrefix = name.trim();
  if (region?.trim()) params.continent = resolveContinentCode(region);

  const { data } = await axios.get(`${GEODB_BASE}/countries`, {
    params,
    timeout: 15_000,
  });

  return data?.data ?? [];
}

async function fetchCountries({ name, region }) {
  if (!name?.trim() && !region?.trim()) {
    const { data } = await axios.get(`${GEODB_BASE}/countries`, {
      params: { limit: 50 },
      timeout: 15_000,
    });
    const summaries = data?.data ?? [];
    return Promise.all(summaries.map(enrichCountry));
  }

  const summaries = await searchCountrySummaries({ name, region });
  return Promise.all(summaries.map(enrichCountry));
}

export function createToolsMcpServer() {
  const server = new McpServer(
    { name: "lab14-tools-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "getCountries",
    {
      description: `Fetch country information from public web APIs (GeoDB + CountriesNow).
Use optional filters: name (partial match, e.g. "france") or region (e.g. "Europe", "Asia").
Omit both to return a sample list of countries with capitals and population.`,
      inputSchema: z.object({
        name: z
          .string()
          .optional()
          .nullable()
          .describe("Filter by country name (partial match). Example: 'japan' or 'united'."),
        region: z
          .string()
          .optional()
          .nullable()
          .describe("Filter by region. Examples: Africa, Americas, Asia, Europe, Oceania."),
      }),
      outputSchema: getCountriesOutputSchema,
    },
    async ({ name, region }) => {
      try {
        const countries = await fetchCountries({ name, region });
        return structuredToolResult({ countries, total: countries.length });
      } catch (err) {
        const message =
          err.response?.status === 404
            ? `No countries found for name="${name ?? ""}" region="${region ?? ""}".`
            : err.message || "Failed to fetch countries";
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "calculator",
    {
      description: "Add two numbers and return their sum.",
      inputSchema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
      outputSchema: calculatorOutputSchema,
    },
    async ({ a, b }) => {
      const sum = a + b;
      return structuredToolResult({ a, b, sum });
    }
  );

  return server;
}
