import requests
import json

def get_leaders():
    url = 'https://query.wikidata.org/sparql'
    query = """
    SELECT 
      ?countryLabel 
      ?headOfStateLabel ?headOfStateImage ?hosPartyLabel ?hosBirthDate ?hosDesc
      ?headOfGovLabel ?headOfGovImage ?hogPartyLabel ?hogBirthDate ?hogDesc
    WHERE {
      ?country wdt:P31 wd:Q6256. 
      OPTIONAL {
        ?country wdt:P35 ?headOfState.
        ?headOfState rdfs:label ?headOfStateLabel filter (lang(?headOfStateLabel) = "en").
        OPTIONAL { ?headOfState wdt:P18 ?headOfStateImage. }
        OPTIONAL { ?headOfState wdt:P102 ?hosParty. ?hosParty rdfs:label ?hosPartyLabel filter (lang(?hosPartyLabel) = "en"). }
        OPTIONAL { ?headOfState wdt:P569 ?hosBirthDate. }
        OPTIONAL { ?headOfState schema:description ?hosDesc filter (lang(?hosDesc) = "en"). }
      }
      OPTIONAL {
        ?country wdt:P6 ?headOfGov.
        ?headOfGov rdfs:label ?headOfGovLabel filter (lang(?headOfGovLabel) = "en").
        OPTIONAL { ?headOfGov wdt:P18 ?headOfGovImage. }
        OPTIONAL { ?headOfGov wdt:P102 ?hogParty. ?hogParty rdfs:label ?hogPartyLabel filter (lang(?hogPartyLabel) = "en"). }
        OPTIONAL { ?headOfGov wdt:P569 ?hogBirthDate. }
        OPTIONAL { ?headOfGov schema:description ?hogDesc filter (lang(?hogDesc) = "en"). }
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    """
    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
    }
    
    response = requests.get(url, params={'query': query}, headers=headers)
    data = response.json()
    
    results = {}
    
    # Alias mapping
    aliases = {
        "PEOPLE'S REPUBLIC OF CHINA": "CHINA",
        "UNITED STATES OF AMERICA": "UNITED STATES",
        "RUSSIAN FEDERATION": "RUSSIA",
        "SYRIAN ARAB REPUBLIC": "SYRIA",
        "ISLAMIC REPUBLIC OF IRAN": "IRAN",
        "DEMOCRATIC PEOPLE'S REPUBLIC OF KOREA": "NORTH KOREA",
        "REPUBLIC OF KOREA": "SOUTH KOREA",
        "KINGDOM OF SAUDI ARABIA": "SAUDI ARABIA",
        "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND": "UNITED KINGDOM",
        "UNITED ARAB EMIRATES": "UAE",
    }
    
    for item in data['results']['bindings']:
        raw_country = item.get('countryLabel', {}).get('value', '').upper()
        if not raw_country: continue
        
        country = aliases.get(raw_country, raw_country)
        
        def extract(prefix):
            name = item.get(f'{prefix}Label', {}).get('value')
            img = item.get(f'{prefix}Image', {}).get('value')
            party = item.get(f'{prefix}PartyLabel', {}).get('value')
            dob = item.get(f'{prefix}BirthDate', {}).get('value')
            if dob: dob = dob[:4] # Extract year
            desc = item.get(f'{prefix}Desc', {}).get('value')
            
            if img and img.startswith("http://"):
                img = img.replace("http://", "https://")
                
            return {"name": name, "image": img, "party": party, "dob": dob, "desc": desc}
        
        if country not in results:
            results[country] = {
                "head_of_state": extract("headOfState"),
                "head_of_gov": extract("headOfGov")
            }
            
    # Also add the raw countries just in case
    for item in data['results']['bindings']:
        raw_country = item.get('countryLabel', {}).get('value', '').upper()
        if raw_country not in results:
            results[raw_country] = results.get(aliases.get(raw_country, raw_country))
            
    out_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\leaders_data.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    get_leaders()
