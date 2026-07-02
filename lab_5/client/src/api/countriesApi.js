// USED_SKILL_(axios-http-enforcer)
import countriesClient from "./countriesClient.js";

export async function fetchCountryByAlpha2(code = "ca") {
  const { data } = await countriesClient.get(
    `/countries/v5/codes.alpha_2/${code.toLowerCase()}`,
    { params: { pretty: 1 } },
  );
  return data?.data?.objects ?? [];
}
