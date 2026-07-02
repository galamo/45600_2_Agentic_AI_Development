// USED_SKILL_(axios-http-enforcer)
import { useEffect, useState } from "react";
import { fetchCountryByAlpha2 } from "../api/countriesApi.js";

function formatPopulation(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat().format(value);
}

function formatCapital(capitals) {
  if (!Array.isArray(capitals) || capitals.length === 0) return "—";
  return capitals.map((capital) => capital.name).join(", ");
}

function formatCurrencies(currencies) {
  if (!Array.isArray(currencies) || currencies.length === 0) return "—";
  return currencies
    .map((currency) => {
      const code = currency.code ?? "";
      const symbol = currency.symbol ? ` (${currency.symbol})` : "";
      return `${code}${symbol}`.trim() || currency.name || "—";
    })
    .join(", ");
}

export default function CountriesTable() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCountry() {
      setLoading(true);
      setError(null);

      try {
        const objects = await fetchCountryByAlpha2("ca");
        if (!cancelled) {
          setCountries(objects);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.response?.data?.errors?.[0]?.message ??
            err.response?.data?.error ??
            err.message;
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="countries-table-section">
      <h3 className="countries-table-title">🌎 Country Data</h3>
      <div className="countries-table-wrapper">
        <table className="countries-table">
          <thead>
            <tr>
              <th>Flag</th>
              <th>Name</th>
              <th>Code</th>
              <th>Capital</th>
              <th>Region</th>
              <th>Population</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="countries-table-status">
                <td colSpan={7}>Loading country data…</td>
              </tr>
            ) : error ? (
              <tr className="countries-table-status countries-table-error">
                <td colSpan={7}>Error: {error}</td>
              </tr>
            ) : countries.length === 0 ? (
              <tr className="countries-table-status">
                <td colSpan={7}>No country data found.</td>
              </tr>
            ) : (
              countries.map((country) => (
                <tr key={country.uuid ?? country.codes?.alpha_2}>
                  <td className="country-flag">
                    {country.flag?.emoji ?? "—"}
                  </td>
                  <td>
                    <div className="country-name">{country.names?.common ?? "—"}</div>
                    <div className="country-official">{country.names?.official ?? ""}</div>
                  </td>
                  <td>{country.codes?.alpha_2 ?? "—"}</td>
                  <td>{formatCapital(country.capitals)}</td>
                  <td>
                    <div>{country.region ?? "—"}</div>
                    {country.subregion && (
                      <div className="country-subregion">{country.subregion}</div>
                    )}
                  </td>
                  <td>{formatPopulation(country.population)}</td>
                  <td>{formatCurrencies(country.currencies)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
