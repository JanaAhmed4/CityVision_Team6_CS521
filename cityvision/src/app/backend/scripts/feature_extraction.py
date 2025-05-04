import os
import pandas as pd
from collections import defaultdict
import ast

# === Define File Paths === #
POTENTIAL_LOCATIONS_FILE = "public/exports/potentialLocationsList.csv"
POI_PER_CELL_FILE = "public/exports/poi_per_cell.csv"

# === POI Categorization Logic === #
def categorize_poi(types):
    categories = {
        "restaurant": ["Restaurants", "Food & Dining"],
        "cafe": ["Coffee Shops", "Food & Dining"],
        "hospital": ["Health"], "clinic": ["Health"], "pharmacy": ["Health"], "physiotherapist": ["Health"],
        "doctor": ["Health"], "dentist": ["Health"], "veterinary_care": ["Health"],
        "school": ["Education"], "university": ["Education"], "college": ["Education"],
        "library": ["Education"], "primary_school": ["Education"], "secondary_school": ["Education"],
        "shopping_mall": ["Retail & Shopping"], "department_store": ["Retail & Shopping"],
        "clothing_store": ["Retail & Shopping"], "shoe_store": ["Retail & Shopping"],
        "electronics_store": ["Retail & Shopping"], "home_goods_store": ["Retail & Shopping"],
        "furniture_store": ["Retail & Shopping"], "jewelry_store": ["Retail & Shopping"],
        "book_store": ["Retail & Shopping"], "convenience_store": ["Retail & Shopping"],
        "supermarket": ["Retail & Shopping"], "hardware_store": ["Retail & Shopping"],
        "florist": ["Retail & Shopping"], "pet_store": ["Retail & Shopping"], "store": ["Retail & Shopping"],
        "amusement_park": ["Entertainment & Recreation"], "aquarium": ["Entertainment & Recreation"],
        "art_gallery": ["Entertainment & Recreation"], "bowling_alley": ["Entertainment & Recreation"],
        "casino": ["Entertainment & Recreation"], "movie_theater": ["Entertainment & Recreation"],
        "museum": ["Entertainment & Recreation"], "night_club": ["Entertainment & Recreation"],
        "stadium": ["Entertainment & Recreation"], "tourist_attraction": ["Entertainment & Recreation"],
        "zoo": ["Entertainment & Recreation"], "park": ["Entertainment & Recreation"],
        "bar": ["Food & Dining"], "bakery": ["Food & Dining"], "meal_delivery": ["Food & Dining"], "meal_takeaway": ["Food & Dining"],
        "hotel": ["Hotels & Hospitality"], "motel": ["Hotels & Hospitality"],
        "guest_house": ["Hotels & Hospitality"], "lodging": ["Hotels & Hospitality"],
        "bank": ["Finance & Services"], "atm": ["Finance & Services"],
        "insurance_agency": ["Finance & Services"], "accounting": ["Finance & Services"],
        "real_estate_agency": ["Finance & Services"], "lawyer": ["Finance & Services"],
        "airport": ["Transportation & Travel"], "bus_station": ["Transportation & Travel"],
        "train_station": ["Transportation & Travel"], "subway_station": ["Transportation & Travel"],
        "transit_station": ["Transportation & Travel"], "taxi_stand": ["Transportation & Travel"],
        "parking": ["Transportation & Travel"], "car_rental": ["Transportation & Travel"],
        "car_dealer": ["Transportation & Travel"], "car_repair": ["Transportation & Travel"],
        "car_wash": ["Transportation & Travel"], "moving_company": ["Transportation & Travel"],
        "rv_park": ["Transportation & Travel"], "travel_agency": ["Transportation & Travel"],
        "police": ["Public & Government Services"], "fire_station": ["Public & Government Services"],
        "sublocality": ["Public & Government Services"], "locality": ["Public & Government Services"], 
        "post_office": ["Public & Government Services"], "courthouse": ["Public & Government Services"],
        "city_hall": ["Public & Government Services"], "embassy": ["Public & Government Services"],
        "local_government_office": ["Public & Government Services"],
        "church": ["Religious Institutions"], "mosque": ["Religious Institutions"], "cemetery": ["Religious Institutions"],
        "beauty_salon": ["Beauty & Wellness"], "spa": ["Beauty & Wellness"], "hair_care": ["Beauty & Wellness"],
        "gym": ["Beauty & Wellness"], "laundry": ["Beauty & Wellness"],
        "electrician": ["Home & Construction Services"], "plumber": ["Home & Construction Services"],
        "painter": ["Home & Construction Services"], "roofing_contractor": ["Home & Construction Services"],
        "locksmith": ["Home & Construction Services"]
    }

    unique_categories = set()
    try:
        parsed_types = ast.literal_eval(types) if types.startswith("[") else types.split(",")
    except:
        parsed_types = types.split(",")

    for t in parsed_types:
        t = t.strip().strip('"').strip("'")
        if t in categories:
            unique_categories.update(categories[t])

    return unique_categories

# === Feature Extraction === #
def perform_categorization():
    combined_df = pd.read_csv(POTENTIAL_LOCATIONS_FILE)
    poi_df = pd.read_csv(POI_PER_CELL_FILE)

    combined_df["id"] = combined_df["id"].astype(str).str.strip()
    poi_df["cell_id"] = poi_df["cell_id"].astype(str).str.strip()

    category_set = {
        "Restaurants", "Coffee Shops", "Health", "Education", "Retail & Shopping", "Entertainment & Recreation", 
        "Food & Dining", "Hotels & Hospitality", "Finance & Services", 
        "Transportation & Travel", "Public & Government Services", "Religious Institutions",
        "Beauty & Wellness", "Home & Construction Services"
    }

    for category in category_set:
        combined_df[category] = 0
    combined_df["POI Density"] = 0  

    for index, row in combined_df.iterrows():
        place_id = row["id"]
        associated_pois = poi_df[poi_df["cell_id"] == place_id]

        category_counts = defaultdict(int)
        total_poi_count = 0

        if associated_pois.empty:
            print(f"No POIs found for place ID: {place_id}")

        for _, poi in associated_pois.iterrows():
            if pd.notna(poi["Types"]):
                unique_categories = categorize_poi(poi["Types"])
                if unique_categories:
                    total_poi_count += 1
                for category in unique_categories:
                    category_counts[category] += 1

        for category in category_set:
            combined_df.at[index, category] = category_counts[category]
        combined_df.at[index, "POI Density"] = total_poi_count

    combined_df.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
    print("Feature extraction completed and saved to:", POTENTIAL_LOCATIONS_FILE)

# === Add Average Ratings === #
def add_avg_ratings_food_dining():
    df = pd.read_csv(POTENTIAL_LOCATIONS_FILE)
    poi_df = pd.read_csv(POI_PER_CELL_FILE)
    poi_df = poi_df.drop_duplicates(subset=["Place ID", "Name"])

    target_category = "Food & Dining"
    df[f"Avg Rating - {target_category}"] = None

    for index, row in df.iterrows():
        place_id = row["id"]
        associated_pois = poi_df[poi_df["cell_id"] == place_id]

        food_dining_ratings = []

        for _, poi in associated_pois.iterrows():
            if pd.notna(poi["Types"]) and pd.notna(poi["Rating"]):
                categories = categorize_poi(poi["Types"])
                if target_category in categories:
                    food_dining_ratings.append(poi["Rating"])

        if food_dining_ratings:
            avg_rating = sum(food_dining_ratings) / len(food_dining_ratings)
            df.at[index, f"Avg Rating - {target_category}"] = avg_rating

    df.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
    print(f"Average rating for '{target_category}' added and saved to:", POTENTIAL_LOCATIONS_FILE)


# === Add Average Number of Reviewers for All POIs === #
def add_avg_num_of_reviewers_all_pois():
    combined_df = pd.read_csv(POTENTIAL_LOCATIONS_FILE)
    poi_df = pd.read_csv(POI_PER_CELL_FILE)

    # Ensure unique POIs per cell
    poi_df = poi_df.drop_duplicates(subset=["Place ID", "Name"])

    # Add new column for average number of reviewers
    combined_df["Avg Num of Reviewers - All POIs"] = None

    for index, row in combined_df.iterrows():
        place_id = row["id"]
        associated_pois = poi_df[poi_df["cell_id"] == place_id]

        total_reviewers = 0
        count_pois = 0

        for _, poi in associated_pois.iterrows():
            if pd.notna(poi["Types"]) and pd.notna(poi["User Ratings Total"]):
                try:
                    total_reviewers += int(poi["User Ratings Total"])
                    count_pois += 1
                except ValueError:
                    continue

        if count_pois > 0:
            avg_reviewers = total_reviewers / count_pois
            combined_df.at[index, "Avg Num of Reviewers - All POIs"] = avg_reviewers

    combined_df.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
    print("Average number of reviewers for all POIs added and saved to:", POTENTIAL_LOCATIONS_FILE)

# === Add Population Within 3km Function === #
def add_population_within_3km():
    import pandas as pd 
    import geopandas as gpd
    from shapely.geometry import Point, Polygon
    import json

    # Load population and business data
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
    csv_path = os.path.join(BASE_DIR, 'Cleaned Data', 'Cleaned_population_data.csv')

    population_data = pd.read_csv(csv_path)
    business_data = pd.read_csv(POTENTIAL_LOCATIONS_FILE) 

    # Convert the 'geometry_region' to a Polygon
    def convert_to_polygon(geometry_string):
        coordinates = json.loads(geometry_string)
        return Polygon(coordinates[0])

    population_data['geometry_region'] = population_data['geometry_region'].apply(convert_to_polygon)

    # Function to calculate population within a 1km radius around a business
    def match_population_to_business(business_row):
        business_point = Point(business_row['center.lng'], business_row['center.lat'])
        total_population = 0
        buffer = business_point.buffer(0.027)  # ~3km buffer in degrees

        for _, pop_row in population_data.iterrows():
            if pop_row['geometry_region'].intersects(buffer):
                total_population += pop_row['population_count']

        return total_population

    # Add population count to business data
    business_data['Population Within 3km'] = business_data.apply(lambda row: match_population_to_business(row), axis=1)

    # Save the updated business data
    business_data.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
    print("Combined data updated with population within 3km.")

def add_residential_price_by_district():
    import pandas as pd
    import numpy as np
    import os

    # Load potential locations
    potential_locations_df = pd.read_csv(POTENTIAL_LOCATIONS_FILE)

    # Load reference district prices with coordinates
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
    residential_prices_path = os.path.join(BASE_DIR, 'Cleaned Data', 'Cleaned_Districts.xlsx')
    residential_df = pd.read_excel(residential_prices_path)

    # Extract necessary columns and convert to radians for haversine
    ref_coords = residential_df[['Latitude', 'Longitude']].to_numpy()
    ref_coords_rad = np.radians(ref_coords)

    potential_coords = potential_locations_df[['center.lat', 'center.lng']].to_numpy()
    potential_coords_rad = np.radians(potential_coords)

    # Compute Haversine distance matrix (vectorized)
    def haversine_matrix(p1, p2):
        lat1, lon1 = p1[:, 0][:, np.newaxis], p1[:, 1][:, np.newaxis]
        lat2, lon2 = p2[:, 0], p2[:, 1]
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
        c = 2 * np.arcsin(np.sqrt(a))
        return 6371 * c  # Earth radius in km

    distances = haversine_matrix(potential_coords_rad, ref_coords_rad)
    nearest_indices = distances.argmin(axis=1)

    # Assign values from nearest district
    potential_locations_df['District_en'] = residential_df.loc[nearest_indices, 'District_en'].values
    potential_locations_df['Residential Average Price'] = residential_df.loc[nearest_indices, 'Residential Average Price'].values

    # Deduplicate by lat/lng
    deduped_df = (
        potential_locations_df
        .groupby(['center.lat', 'center.lng'], as_index=False)
        .first()
    )

    # Reassign unique IDs
    deduped_df['id'] = range(1, len(deduped_df) + 1)

    # Save cleaned and updated dataset
    deduped_df.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
    print(f"Residential prices assigned using nearest coordinates. Saved {len(deduped_df)} unique locations to {POTENTIAL_LOCATIONS_FILE}.")


def add_rental_price_by_district():
    import pandas as pd
    import numpy as np
    import os

    # Load potential locations
    potential_locations_df = pd.read_csv(POTENTIAL_LOCATIONS_FILE)

    # Load reference district prices with coordinates
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
    residential_prices_path = os.path.join(BASE_DIR, 'Cleaned Data', 'Cleaned_Districts.xlsx')
    residential_df = pd.read_excel(residential_prices_path)

    # Extract necessary columns and convert to radians for haversine
    ref_coords = residential_df[['Latitude', 'Longitude']].to_numpy()
    ref_coords_rad = np.radians(ref_coords)

    potential_coords = potential_locations_df[['center.lat', 'center.lng']].to_numpy()
    potential_coords_rad = np.radians(potential_coords)

    # Compute Haversine distance matrix (vectorized)
    def haversine_matrix(p1, p2):
        lat1, lon1 = p1[:, 0][:, np.newaxis], p1[:, 1][:, np.newaxis]
        lat2, lon2 = p2[:, 0], p2[:, 1]
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
        c = 2 * np.arcsin(np.sqrt(a))
        return 6371 * c  # Earth radius in km

    distances = haversine_matrix(potential_coords_rad, ref_coords_rad)
    nearest_indices = distances.argmin(axis=1)

    # Assign values from nearest district
    potential_locations_df['District_en'] = residential_df.loc[nearest_indices, 'District_en'].values
    potential_locations_df['Commercial Average Price'] = residential_df.loc[nearest_indices, 'Commercial Average Price'].values

    # Deduplicate by lat/lng
    deduped_df = (
        potential_locations_df
        .groupby(['center.lat', 'center.lng'], as_index=False)
        .first()
    )

    # Reassign unique IDs
    deduped_df['id'] = range(1, len(deduped_df) + 1)

    # Save cleaned and updated dataset
    deduped_df.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
    print(f"Rental prices assigned using nearest coordinates. Saved {len(deduped_df)} unique locations to {POTENTIAL_LOCATIONS_FILE}.")

 
def update_business_type_column():
    df = pd.read_csv(POTENTIAL_LOCATIONS_FILE)

    # Rename the column
    if "businessType" in df.columns:
        df = df.rename(columns={"businessType": "generalCategory"})

        # Map values
        df["generalCategory"] = df["generalCategory"].map({
            "restaurant": 1,
            "coffee_shop": 0
        })

        df.to_csv(POTENTIAL_LOCATIONS_FILE, index=False)
        print("Column 'businessType' renamed to 'generalCategory' and values mapped successfully.")
    else:
        print("'businessType' column not found in the CSV.")