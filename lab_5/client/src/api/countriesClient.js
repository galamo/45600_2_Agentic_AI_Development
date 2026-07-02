// USED_SKILL_(axios-http-enforcer)
import axios from "axios";

const countriesClient = axios.create({
  baseURL: "https://api.restcountries.com",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_REST_COUNTRIES_API_KEY || "rc_live_demo"}`,
  },
});

export default countriesClient;
