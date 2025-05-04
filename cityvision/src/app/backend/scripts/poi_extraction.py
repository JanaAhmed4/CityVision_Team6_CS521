import subprocess
import time
import googlemaps
import pandas as pd
from geopy.distance import geodesic  
from feature_extraction import add_avg_num_of_reviewers_all_pois, add_avg_ratings_food_dining, add_population_within_3km, add_rental_price_by_district, add_residential_price_by_district, perform_categorization, update_business_type_column

API_KEY = 'XXX'
map_client = googlemaps.Client(API_KEY)

# Input and output file paths
file_path = 'public/exports/potentialLocationsList.csv'
#file_path = 'Trial.csv'
output_file_path = 'public/exports/poi_per_cell.csv'  

# Load CSV file
data = pd.read_csv(file_path)

# Ensure required columns exist
required_columns = {'center.lat', 'center.lng', 'id'}
if not required_columns.issubset(data.columns):
    raise ValueError(f"The CSV file must contain the following columns: {required_columns}")

# Initialize list for all results
all_results = []

# Define search radius (meters)
radius = 1000  

# Loop through all POI locations
for index, row in data.iterrows():
    latitude, longitude, cell_id = row['center.lat'], row['center.lng'], row['id']
    print(f"Processing Business {index + 1}: ({latitude}, {longitude}) - cell_ID: {cell_id}")

    # Fetch nearby POIs
    response = map_client.places_nearby(
        location=(latitude, longitude),
        radius=radius,
    )

    business_list = response.get('results', [])
    next_page_token = response.get('next_page_token')

    # Handle pagination (retrieve all available results)
    while next_page_token:
        time.sleep(2)  # Pause to avoid API rate limits
        response = map_client.places_nearby(
            location=(latitude, longitude),
            radius=radius,
            page_token=next_page_token
        )
        business_list.extend(response.get('results', []))
        next_page_token = response.get('next_page_token')

    # Filter businesses by actual geodesic distance
    filtered_business_list = []
    for business in business_list:
        business_lat = business.get('geometry', {}).get('location', {}).get('lat')
        business_lng = business.get('geometry', {}).get('location', {}).get('lng')

        if business_lat and business_lng:
            business_distance = geodesic((latitude, longitude), (business_lat, business_lng)).meters
            if business_distance <= radius:
                business_data = {
                    'cell_id': cell_id,   
                    'Name': business.get('name'),
                    'Place ID': business.get('place_id'),
                    'Types': ', '.join(business.get('types', [])),
                    'Vicinity': business.get('vicinity'),
                    'Business Status': business.get('business_status', 'UNKNOWN'),
                    'Rating': business.get('rating', 'N/A'),
                    'User Ratings Total': business.get('user_ratings_total', 'N/A'),
                    'Latitude': latitude,
                    'Longitude': longitude,
                    'Distance (m)': round(business_distance, 2)
                }
                filtered_business_list.append(business_data)

    # Append results to the main list
    all_results.extend(filtered_business_list)

# Save all results to a CSV file
if all_results:
    df = pd.DataFrame(all_results)
    df.to_csv(output_file_path, index=False)
    print(f"Results successfully saved to {output_file_path}")
    perform_categorization()
    add_avg_ratings_food_dining()
    add_population_within_3km()
    add_avg_num_of_reviewers_all_pois()
    add_residential_price_by_district()
    add_rental_price_by_district()
    update_business_type_column()
else:
    print("No points of interest found within the specified radius.")