from flask import Flask, request, jsonify

import pandas as pd

import lightgbm as lgb

import numpy as np

from sklearn.preprocessing import PowerTransformer, MinMaxScaler

import joblib

import openai

from dotenv import load_dotenv

import os

from flask_cors import CORS
 
app = Flask(__name__)

CORS(app)
 
# Load environment variables

load_dotenv(dotenv_path=os.path.join("..", "..", "..", ".env.local"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

openai.api_key = OPENAI_API_KEY
 
# Load model and transformers

model = lgb.Booster(model_file='LambdaMartmodel.txt')

pt = joblib.load('power_transformer.pkl')

scaler = joblib.load('minmax_scaler.pkl')
 
# Selected features

selected_features = [
    'generalCategory', 'Religious Institutions', 'Coffee Shops', 'Food & Dining', 'Restaurants',
    'Home & Construction Services', 'Entertainment & Recreation', 'Retail & Shopping', 'Finance & Services',
    'Education', 'Health', 'Public & Government Services', 'Hotels & Hospitality', 'Transportation & Travel',
    'Beauty & Wellness', 'POI Density', 'Avg Rating - Food & Dining', 'Population Within 3km',
    'Residential Average Price', 'Avg Num of Reviewers - All POIs'
]

 
@app.route("/predict", methods=["POST"])

def predict():

    try:

        # Check if file is included

        if 'file' not in request.files:

            return jsonify({"error": "No file part"}), 400

        file = request.files['file']

        data = pd.read_csv(file)

        print(data['id'].value_counts())
        # Check for missing columns

        missing = [col for col in selected_features if col not in data.columns]

        if missing:

            return jsonify({"error": f"Missing required columns: {missing}"}), 400
 
        # Prepare features

        X = data[selected_features].copy()

        id_col = data['id']  # Save the id column if needed
        rental_col = data['Commercial Average Price']
 
        # Transform and predict

        X_transformed = scaler.transform(pt.transform(X))

        data['score'] = model.predict(X_transformed)
 
        # Rank top 5
        df_ranked = data.sort_values(by='score', ascending=False).head(3)

        # Generate explanation
        category_map = {0: "Coffee Shop", 1: "Restaurant"}
        
        prompt = f"""
        You are an AI assistant helping a business user understand why certain locations were recommended for {category_map[df_ranked.iloc[0]['generalCategory']]}. 

        Our model identified the top three most promising locations. 
        The recommendations are based on SHAP (SHapley Additive exPlanations), 
        which helps explain the influence of each feature on the model’s decision.

        The most influential factors ranked by importance are:

            1. General Category of the business (SHAP: 0.0092)
            2. Average Number of Reviewers – All POIs (SHAP: 0.0086)
            3. Number of Nearby Restaurants (SHAP: 0.0070)
            4. Population Within 3 km (SHAP: 0.0037)
            5. Entertainment & Recreation Businesses Nearby (SHAP: 0.0026)
            6. Average Rating - Food & Dining (SHAP: 0.0025)
            7. Number of Nearby Coffee Shops (SHAP: 0.0018)
            8. Number of Food & Dining Businesses (SHAP: 0.0016)
            9. Finance & Services Nearby (SHAP: 0.0013)
            10. Beauty & Wellness Businesses Nearby (SHAP: 0.0013)
            11. Residential Average Price (SHAP: 0.0013)
            12. Hotels & Hospitality (SHAP: 0.0010)
            13. Retail & Shopping (SHAP: 0.0007)
            14. Religious Institutions (SHAP: 0.0007)
            15. Transportation & Travel (SHAP: 0.0006)

        Below are the feature values for the top three recommended locations (ranked). 
        These values help explain why certain areas ranked higher than others:

            **Location 1**  
            - Avg Num of Reviewers – All POIs: {df_ranked.iloc[0]['Avg Num of Reviewers - All POIs']}  
            - General Category: {df_ranked.iloc[0]['generalCategory']}  
            - Food & Dining Rating: {df_ranked.iloc[0]['Avg Rating - Food & Dining']}  
            - Population within 3 km: {df_ranked.iloc[0]['Population Within 3km']}  
            - Restaurants: {df_ranked.iloc[0]['Restaurants']}, Coffee Shops: {df_ranked.iloc[0]['Coffee Shops']}  
            - Retail & Shopping: {df_ranked.iloc[0]['Retail & Shopping']}, Entertainment & Recreation: {df_ranked.iloc[0]['Entertainment & Recreation']}  
            - Finance & Services: {df_ranked.iloc[0]['Finance & Services']}, Beauty & Wellness: {df_ranked.iloc[0]['Beauty & Wellness']}  
            - Residential Average Price: {df_ranked.iloc[0]['Residential Average Price']}  
            - Commercial Rental Costs (Commercial Average Price): {df_ranked.iloc[0]['Commercial Average Price']}

            **Location 2**  
            - Avg Num of Reviewers – All POIs: {df_ranked.iloc[1]['Avg Num of Reviewers - All POIs']}  
            - General Category: {df_ranked.iloc[1]['generalCategory']}  
            - Food & Dining Rating: {df_ranked.iloc[1]['Avg Rating - Food & Dining']}  
            - Population within 3 km: {df_ranked.iloc[1]['Population Within 3km']}  
            - Restaurants: {df_ranked.iloc[1]['Restaurants']}, Coffee Shops: {df_ranked.iloc[1]['Coffee Shops']}  
            - Retail & Shopping: {df_ranked.iloc[1]['Retail & Shopping']}, Entertainment & Recreation: {df_ranked.iloc[1]['Entertainment & Recreation']}  
            - Finance & Services: {df_ranked.iloc[1]['Finance & Services']}, Beauty & Wellness: {df_ranked.iloc[1]['Beauty & Wellness']}  
            - Residential Average Price: {df_ranked.iloc[1]['Residential Average Price']}  
            - Commercial Rental Costs (Commercial Average Price): {df_ranked.iloc[1]['Commercial Average Price']}

            **Location 3**  
            - Avg Num of Reviewers – All POIs: {df_ranked.iloc[2]['Avg Num of Reviewers - All POIs']}  
            - General Category: {df_ranked.iloc[2]['generalCategory']}  
            - Food & Dining Rating: {df_ranked.iloc[2]['Avg Rating - Food & Dining']}  
            - Population within 3 km: {df_ranked.iloc[2]['Population Within 3km']}  
            - Restaurants: {df_ranked.iloc[2]['Restaurants']}, Coffee Shops: {df_ranked.iloc[2]['Coffee Shops']}  
            - Retail & Shopping: {df_ranked.iloc[2]['Retail & Shopping']}, Entertainment & Recreation: {df_ranked.iloc[2]['Entertainment & Recreation']}  
            - Finance & Services: {df_ranked.iloc[2]['Finance & Services']}, Beauty & Wellness: {df_ranked.iloc[2]['Beauty & Wellness']}  
            - Residential Average Price: {df_ranked.iloc[2]['Residential Average Price']}  
            - Commercial Rental Costs (Commercial Average Price): {df_ranked.iloc[2]['Commercial Average Price']}

            Use this information to clearly explain to the user why one location may be better than another. 
            Talk about practical business reasons such as high customer traffic (reviewers), strong nearby competition or complement businesses (restaurants, shops, etc.), 
            and neighborhood quality (ratings, prices). 

            Be sure to mention the **average rental costs** (Commercial Average Price) for each location to help the user assess financial feasibility.

            Also explain that the **Residential Average Price** is an **indirect indicator of customer purchasing power** in the neighborhood — 
            higher residential prices often correlate with wealthier residents who may be more willing to spend on products or services.
            """



        response = openai.ChatCompletion.create(

            model="gpt-4",

            messages=[

                {"role": "system", "content": "You are a business consultant specializing in market analysis. **Answer in plain text only—no markdown formatting.**"},

                {"role": "user", "content": prompt}

            ],

            temperature=0.4,
            max_tokens=1000

        )

        generated_text = response['choices'][0]['message']['content']
 
        # Return only the generated text

        top_locations = df_ranked[['id', 'score', 'Commercial Average Price']].to_dict(orient='records')

        return jsonify({
            "status": "success",
            "top_locations": top_locations,
            "generated_text": generated_text
        })
 
    except Exception as e:

        return jsonify({"status": "error", "message": str(e)}), 500
 
if __name__ == '__main__':

    app.run(debug=True)

 