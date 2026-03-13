export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const COUNTRY_CODES: Record<string, string> = {
  "france": "FR", "italy": "IT", "switzerland": "CH", "germany": "DE",
  "spain": "ES", "portugal": "PT", "netherlands": "NL", "belgium": "BE",
  "austria": "AT", "united kingdom": "GB", "uk": "GB", "ireland": "IE",
  "finland": "FI", "sweden": "SE", "norway": "NO", "denmark": "DK",
  "poland": "PL", "czech republic": "CZ", "czechia": "CZ", "romania": "RO",
  "turkey": "TR", "russia": "RU", "ukraine": "UA",
  "united states": "US", "usa": "US", "canada": "CA", "mexico": "MX",
  "brazil": "BR", "argentina": "AR", "chile": "CL", "colombia": "CO",
  "peru": "PE", "uruguay": "UY",
  "japan": "JP", "south korea": "KR", "korea": "KR",
  "thailand": "TH", "malaysia": "MY", "singapore": "SG", "india": "IN",
  "indonesia": "ID", "philippines": "PH",
  "australia": "AU", "new zealand": "NZ",
  "south africa": "ZA", "morocco": "MA", "egypt": "EG", "tunisia": "TN",
  "nigeria": "NG", "senegal": "SN", "madagascar": "MG",
  "united arab emirates": "AE", "uae": "AE", "saudi arabia": "SA",
  "jordan": "JO", "lebanon": "LB", "palestine": "PS", "israel": "IL",
  "armenia": "AM", "georgia": "GE", "luxembourg": "LU",
  "taiwan": "TW", "china": "CN", "hong kong": "HK",
};

export function countryToFlag(country: string | null): string | null {
  if (!country) return null;
  const code = COUNTRY_CODES[country.toLowerCase()];
  if (!code) return null;
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}
