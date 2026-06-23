import requests
import json
import os

def get_leaders():
    url = 'https://query.wikidata.org/sparql'
    # SPARQL query to get country, head of state (P35), head of government (P6), their labels and images
    query = """
    SELECT ?countryLabel ?headOfStateLabel ?headOfStateImage ?headOfGovLabel ?headOfGovImage
    WHERE {
      ?country wdt:P31 wd:Q6256. # Instance of country
      OPTIONAL {
        ?country wdt:P35 ?headOfState.
        ?headOfState rdfs:label ?headOfStateLabel filter (lang(?headOfStateLabel) = "en").
        OPTIONAL { ?headOfState wdt:P18 ?headOfStateImage. }
      }
      OPTIONAL {
        ?country wdt:P6 ?headOfGov.
        ?headOfGov rdfs:label ?headOfGovLabel filter (lang(?headOfGovLabel) = "en").
        OPTIONAL { ?headOfGov wdt:P18 ?headOfGovImage. }
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
    for item in data['results']['bindings']:
        country = item.get('countryLabel', {}).get('value', '').upper()
        if not country: continue
        
        hos = item.get('headOfStateLabel', {}).get('value')
        hos_img = item.get('headOfStateImage', {}).get('value')
        hog = item.get('headOfGovLabel', {}).get('value')
        hog_img = item.get('headOfGovImage', {}).get('value')
        
        # Convert http://commons.wikimedia.org to https://
        if hos_img and hos_img.startswith("http://"):
            hos_img = hos_img.replace("http://", "https://")
        if hog_img and hog_img.startswith("http://"):
            hog_img = hog_img.replace("http://", "https://")
            
        if country not in results:
            results[country] = {
                "head_of_state": {"name": hos, "image": hos_img},
                "head_of_gov": {"name": hog, "image": hog_img}
            }
            
    out_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\leaders_data.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    get_leaders()
