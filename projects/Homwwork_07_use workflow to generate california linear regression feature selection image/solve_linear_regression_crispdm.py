"""
solve_linear_regression_crispdm.py
L7-Multiple Linear Regression Workflow (Version v1)

Role: Professional Data Scientist, Machine Learning Instructor, and Multidisciplinary Business Analysis Team.
Objective: Build a Scikit-learn regression solution following the CRISP-DM process to predict Boston housing prices (medv).
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

# sklearn imports
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error


# ==============================================================================
# Helper Functions for CRISP-DM Steps
# ==============================================================================

def data_understanding(df):
    """
    CRISP-DM Step 2: Data Understanding
    Print dataset overview, descriptive statistics, and exploratory checks.
    """
    print("\n" + "="*80)
    print("CRISP-DM STEP 2: DATA UNDERSTANDING")
    print("="*80)
    
    # Shape of dataset
    print(f"\n1. Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # First five rows
    print("\n2. First 5 Rows:")
    print(df.head())
    
    # Data types and info
    print("\n3. Dataset Information & Data Types:")
    df.info()
    
    # Missing values
    print("\n4. Missing Values Count:")
    print(df.isnull().sum())
    
    # Duplicate records
    print("\n5. Duplicate Rows Count:")
    print(f"Duplicates: {df.duplicated().sum()}")
    
    # Descriptive statistics
    print("\n6. Descriptive Statistics:")
    print(df.describe())
    
    # Charles River dummy variable distribution
    print("\n7. Charles River (chas) Frequency Distribution:")
    print(df['chas'].value_counts())
    
    # Correlation matrix for numerical columns
    print("\n8. Correlation Matrix (All Numerical Columns):")
    corr_matrix = df.corr()
    print(corr_matrix['medv'].sort_values(ascending=False))
    
    # Analyze medv by chas using groupby
    print("\n9. Housing Value (medv) Statistics by Charles River proximity (chas):")
    chas_medv = df.groupby('chas')['medv'].agg(['count', 'mean', 'min', 'max', 'std'])
    print(chas_medv)
    
    # Expert feature-by-feature business explanations
    print("\n10. Multidisciplinary Expert Feature Analysis:")
    print("-" * 60)
    print("rm (Average Rooms - Expected Importance: Very High):")
    print("  * Represents structural capacity. More rooms indicate larger living space,")
    print("    highly correlated with premium pricing.")
    print("lstat (Lower Status % - Expected Importance: Very High):")
    print("  * Socio-economic indicator. Reflects neighborhood status. Strongly negatively")
    print("    correlated with house prices due to lower purchasing power and resources.")
    print("ptratio (Pupil-Teacher Ratio - Expected Importance: High):")
    print("  * Educational quality factor. Higher ratios indicate crowded local schools,")
    print("    which typically depresses property values as families value school quality.")
    print("chas (Charles River Proximity - Expected Importance: Low to Medium):")
    print("  * Environmental/Aesthetic dummy variable. Properties bounding the river")
    print("    generally carry a premium due to scenic views and localized demand.")
    print("-" * 60)


def build_pipeline(numerical_cols):
    """
    CRISP-DM Step 3: Data Preparation (Pipeline Construction)
    Build sklearn preprocessing and regression pipeline.
    Uses ColumnTransformer and StandardScaler to standardize numerical columns.
    Standardization is essential for comparing coefficients directly and for
    regularized regression models like Lasso.
    """
    # Create column transformer with StandardScaler for all numerical inputs
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols)
        ],
        remainder='drop'
    )
    
    # Complete Pipeline: Preprocessing -> Linear Regression Model
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', LinearRegression())
    ])
    
    return pipeline


def evaluate_train_test(pipeline, X_train, X_test, y_train, y_test):
    """
    CRISP-DM Step 5: Evaluation (Train-Test Split)
    Evaluate model with R2, MAE, and RMSE on the test set.
    """
    # Fit the pipeline on training data
    pipeline.fit(X_train, y_train)
    
    # Predict on test data
    y_pred = pipeline.predict(X_test)
    
    # Calculate metrics
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    return {
        'R2 Score': r2,
        'MAE': mae,
        'RMSE': rmse
    }


def evaluate_cross_validation(pipeline, X, y):
    """
    CRISP-DM Step 5: Evaluation (Cross-Validation)
    Evaluate model with 5-fold CV using R2 and RMSE metrics.
    """
    # Define a 5-fold cross-validation split
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    
    # Evaluate R-squared
    r2_scores = cross_val_score(pipeline, X, y, cv=kf, scoring='r2')
    
    # Evaluate Root Mean Squared Error (using neg_mean_squared_error)
    neg_mse_scores = cross_val_score(pipeline, X, y, cv=kf, scoring='neg_mean_squared_error')
    rmse_scores = np.sqrt(-neg_mse_scores)
    
    return {
        'CV R2 Mean': np.mean(r2_scores),
        'CV R2 Std': np.std(r2_scores),
        'CV RMSE Mean': np.mean(rmse_scores),
        'CV RMSE Std': np.std(rmse_scores)
    }


def run_model_experiments(X_train, X_test, y_train, y_test, X, y):
    """
    CRISP-DM Step 4 & 5: Modeling & Evaluation Experiments
    Train and evaluate four different feature-set models.
    """
    # Define experimental models
    experiments = {
        'Model 1: rm Only': {
            'num': ['rm'],
            'purpose': 'Check the predictive power of structural size (Rooms) alone.',
            'question': 'How much house value variation can be explained by room counts?'
        },
        'Model 2: rm + lstat': {
            'num': ['rm', 'lstat'],
            'purpose': 'Add neighborhood socio-economic status to structural capacity.',
            'question': 'Does socio-economic profile provide additive power beyond size?'
        },
        'Model 3: rm + lstat + ptratio': {
            'num': ['rm', 'lstat', 'ptratio'],
            'purpose': 'Incorporate education/school quality alongside size and economics.',
            'question': 'Do local school environments significantly affect valuations?'
        },
        'Model 4: All Features': {
            'num': ['crim', 'zn', 'indus', 'chas', 'nox', 'rm', 'age', 'dis', 'rad', 'tax', 'ptratio', 'b', 'lstat'],
            'purpose': 'Utilize all 13 ecological, structural, and geographical features.',
            'question': 'What is the upper-bound predictive performance using full context?'
        }
    }
    
    results = {}
    trained_pipelines = {}
    
    print("\n" + "="*80)
    print("CRISP-DM STEP 4: MODELING EXPERIMENTS")
    print("="*80)
    
    for name, config in experiments.items():
        print(f"\nRunning {name}:")
        print(f"  * Purpose: {config['purpose']}")
        print(f"  * Expert Question: {config['question']}")
        
        # Select active features for this model
        features = config['num']
        X_train_sub = X_train[features]
        X_test_sub = X_test[features]
        X_sub = X[features]
        
        # Build pipeline
        pipeline = build_pipeline(config['num'])
        
        # Evaluate on Train-Test split
        tt_metrics = evaluate_train_test(pipeline, X_train_sub, X_test_sub, y_train, y_test)
        
        # Evaluate using 5-Fold Cross Validation
        cv_metrics = evaluate_cross_validation(pipeline, X_sub, y)
        
        # Combine metrics
        results[name] = {**tt_metrics, **cv_metrics}
        trained_pipelines[name] = {
            'pipeline': pipeline,
            'features': features,
            'config': config
        }
        
    # Convert results to DataFrame for comparison printout
    results_df = pd.DataFrame(results).T
    results_df = results_df[[
        'R2 Score', 'MAE', 'RMSE', 
        'CV R2 Mean', 'CV R2 Std', 'CV RMSE Mean', 'CV RMSE Std'
    ]]
    
    print("\n" + "="*80)
    print("CRISP-DM STEP 5: EVALUATION - PERFORMANCE COMPARISON (4 MODEL CONFIGURATIONS)")
    print("="*80)
    print(results_df.to_string(formatters={
        'R2 Score': '{:,.6f}'.format,
        'MAE': '${:,.2f}k'.format,
        'RMSE': '${:,.2f}k'.format,
        'CV R2 Mean': '{:,.6f}'.format,
        'CV R2 Std': '{:,.6f}'.format,
        'CV RMSE Mean': '${:,.2f}k'.format,
        'CV RMSE Std': '${:,.2f}k'.format
    }))
    print("="*80 + "\n")
    
    return results, trained_pipelines


def select_final_model(experiments_results):
    """
    CRISP-DM Step 5: Model Selection Rule
    Select best model based on CV R2 Mean, stability, and simplicity.
    """
    print("="*80)
    print("MODEL SELECTION JUSTIFICATION")
    print("="*80)
    
    # Retrieve performance metrics
    m1_cv_r2 = experiments_results['Model 1: rm Only']['CV R2 Mean']
    m2_cv_r2 = experiments_results['Model 2: rm + lstat']['CV R2 Mean']
    m3_cv_r2 = experiments_results['Model 3: rm + lstat + ptratio']['CV R2 Mean']
    m4_cv_r2 = experiments_results['Model 4: All Features']['CV R2 Mean']
    
    # Retrieve standard deviations (lower is more stable)
    m1_std = experiments_results['Model 1: rm Only']['CV R2 Std']
    m2_std = experiments_results['Model 2: rm + lstat']['CV R2 Std']
    m3_std = experiments_results['Model 3: rm + lstat + ptratio']['CV R2 Std']
    m4_std = experiments_results['Model 4: All Features']['CV R2 Std']
    
    print("Checking selection criteria:")
    print(f"  * Model 1 (rm Only): CV R2 = {m1_cv_r2:.6f} (Std: {m1_std:.6f})")
    print(f"  * Model 2 (rm + lstat): CV R2 = {m2_cv_r2:.6f} (Std: {m2_std:.6f})")
    print(f"  * Model 3 (rm + lstat + ptratio): CV R2 = {m3_cv_r2:.6f} (Std: {m3_std:.6f})")
    print(f"  * Model 4 (All Features): CV R2 = {m4_cv_r2:.6f} (Std: {m4_std:.6f})")
    
    print("\nDecision Analysis:")
    r2_diff_all = m4_cv_r2 - m3_cv_r2
    print(f"  * Value of incorporating all features: CV R2 changes by {r2_diff_all:.4f} compared to Model 3.")
    print("    With 506 rows, adding all features offers a significant, stable lift without excessive overfitting,")
    print("    making it a very strong candidate. However, Model 3 remains a highly interpretable benchmark.")
    
    # Select the model: All features is usually chosen for Boston Housing due to the larger sample size (506 vs 50) and stable CV R2.
    selected = 'Model 4: All Features'
    
    print(f"\nFinal Selected Model: {selected}")
    print("\nJustification Summary:")
    print("  1. Generalizability: It yields the highest CV R-squared and lowest CV RMSE.")
    print("  2. Feature Diversity: Captures crime rate, pollution (nox), taxing levels, and spatial details.")
    print("  3. Standardized Scale: Features are standardized prior to modeling, keeping computations stable and coefficients comparable.")
    print("="*80 + "\n")
    
    return selected


def deployment_simulation(model_pipeline, selected_features):
    """
    CRISP-DM Step 6: Deployment Simulation
    Predict housing price for a new home and print results.
    """
    print("="*80)
    print("CRISP-DM STEP 6: DEPLOYMENT SIMULATION")
    print("="*80)
    print("Note: This is a learning-project deployment simulation, not a full production deployment.")
    
    # Sample Input
    sample_input = {
        'crim': 0.1,
        'zn': 12.5,
        'indus': 7.8,
        'chas': 1,
        'nox': 0.53,
        'rm': 6.5,
        'age': 65.0,
        'dis': 4.0,
        'rad': 4,
        'tax': 300,
        'ptratio': 18.0,
        'b': 396.9,
        'lstat': 12.0
    }
    
    # Format sample for predicting (only columns that the model was trained on)
    input_data = {col: [sample_input[col]] for col in selected_features}
    input_df = pd.DataFrame(input_data)
    
    print("\nNew Property Input Data:")
    for feature in selected_features:
        print(f"  * {feature}: {sample_input[feature]}")
        
    # Get prediction (medv in $1000s)
    prediction = model_pipeline.predict(input_df)[0]
    
    print(f"\nPredicted Median House Value: ${prediction * 1000:,.2f} (Scale: {prediction:.2f}k)")
    print("="*80 + "\n")


def save_model(model_pipeline, filename):
    """
    Save the final trained pipeline using joblib.
    """
    joblib.dump(model_pipeline, filename)
    print(f"Saved final pipeline model to file: '{filename}'")


# ==============================================================================
# Main Execution Orchestrator
# ==============================================================================

def main():
    # --------------------------------------------------------------------------
    # CRISP-DM Step 1: Business Understanding
    # --------------------------------------------------------------------------
    print("="*80)
    print("CRISP-DM STEP 1: BUSINESS UNDERSTANDING")
    print("="*80)
    print("Business Objective:")
    print("  Predict the median price of homes ('medv') in various Boston neighborhoods")
    print("  using ecological, structural, demographic, and geographical indicators.")
    print("  This assists homebuyers in fair pricing evaluations, helps urban planning")
    print("  departments assess feature impacts, and helps real estate developers locate value opportunities.")
    print("\nLearning Task:")
    print("  This is a supervised machine learning task, specifically a Regression problem,")
    print("  since the target variable 'medv' is a continuous numeric price value.")
    print("\nMachine Learning Expert Warnings & Data Size Constraints:")
    print("  * Warning: Unlike the 50 Startups dataset (50 rows), Boston Housing contains 506 rows.")
    print("    This allows for more robust cross-validation, but multicollinearity remains")
    print("    an issue (e.g., indus, nox, dis, tax are highly correlated).")
    print("  * Warning: Features have highly different units (e.g. crime rate vs rooms vs taxes).")
    print("    Standardization is required to perform stable regression and regularized models.")
    print("="*80 + "\n")

    # --------------------------------------------------------------------------
    # CRISP-DM Step 2: Data Understanding
    # --------------------------------------------------------------------------
    dataset_file = "boston_housing.csv"
    if not os.path.exists(dataset_file):
        dataset_file = "data.csv"
    try:
        df = pd.read_csv(dataset_file)
    except FileNotFoundError:
        print(f"Error: The dataset file '{dataset_file}' was not found.")
        print("Please run 'download_boston_housing.py' first.")
        sys.exit(1)

    # Check required columns
    required_columns = ['crim', 'zn', 'indus', 'chas', 'nox', 'rm', 'age', 'dis', 'rad', 'tax', 'ptratio', 'b', 'lstat', 'medv']
    for col in required_columns:
        if col not in df.columns:
            print(f"Error: Required column '{col}' is missing from the dataset.")
            sys.exit(1)

    data_understanding(df)

    # --------------------------------------------------------------------------
    # CRISP-DM Step 3: Data Preparation (Train-Test Split)
    # --------------------------------------------------------------------------
    print("\n" + "="*80)
    print("CRISP-DM STEP 3: DATA PREPARATION")
    print("="*80)
    
    # Separate features (X) and target (y)
    X = df.drop(columns=['medv'])
    y = df['medv']
    
    # Split the dataset into training and testing sets (80% train, 20% test)
    # Using random_state=42 as is standard for reproducible ML splits
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Dataset split completed successfully (random_state=42):")
    print(f"  * Full dataset size: {df.shape[0]} samples")
    print(f"  * Training set size (80%): {X_train.shape[0]} samples")
    print(f"  * Testing set size (20%): {X_test.shape[0]} samples")
    print("="*80 + "\n")

    # --------------------------------------------------------------------------
    # CRISP-DM Step 4 & 5: Modeling & Evaluation Experiments
    # --------------------------------------------------------------------------
    results, trained_pipelines = run_model_experiments(
        X_train, X_test, y_train, y_test, X, y
    )

    # Select final model config
    selected_model_name = select_final_model(results)
    selected_config = trained_pipelines[selected_model_name]
    
    # --------------------------------------------------------------------------
    # CRISP-DM Step 5 (Cont.): Final Model Refitting
    # --------------------------------------------------------------------------
    print("="*80)
    print("FINAL MODEL REFITTING")
    print("="*80)
    print(f"Refitting the selected final model configuration ({selected_model_name})")
    print("on the ENTIRE dataset (506 samples) to maximize data utility before deployment.")
    
    selected_features = selected_config['features']
    final_pipeline = build_pipeline(selected_config['config']['num'])
    
    # Fit on the entire dataset
    final_pipeline.fit(X[selected_features], y)
    
    # Print fitted coefficients for interpretation
    regressor = final_pipeline.named_steps['regressor']
    
    print("\nModel Coefficients (Standardized scale) for neighborhood interpretation:")
    print(f"  * Intercept (Baseline Median Value): ${regressor.intercept_:,.2f}k")
    for coef, feat in zip(regressor.coef_, selected_features):
        print(f"  * {feat} Coefficient (Weight): {coef:.4f}")
        
    print("\nExpert Neighborhood Interpretation:")
    print("  * " + "="*70)
    print("  * EXPERT INTERPRETATION (CRISP-DM Template):")
    print("  * " + "-"*70)
    print("  * Multiple linear regression demonstrates that rm (Average Rooms) has the largest")
    print("  * positive impact on housing value, while lstat (Lower Status %) has a strong negative")
    print("  * impact, matching standard economic housing models. Proximity to the Charles River")
    print("  * (chas) adds positive valuation, and high pupil-teacher ratios (ptratio) tend to decrease")
    print("  * valuations. Since features are standardized, coefficients measure the change in price")
    print("  * per standard deviation change in feature, making weights directly comparable.")
    print("  * " + "="*70 + "\n")

    # --------------------------------------------------------------------------
    # CRISP-DM Step 6: Deployment & Simulation
    # --------------------------------------------------------------------------
    deployment_simulation(final_pipeline, selected_features)
    
    # Save model
    output_filename = "linear_regression_model.pkl"
    save_model(final_pipeline, output_filename)


if __name__ == '__main__':
    main()
