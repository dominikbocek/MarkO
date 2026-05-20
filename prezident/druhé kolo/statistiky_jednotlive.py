import pandas as pd

# Load the data files
popisky_df = pd.read_csv('statistics-popisky.csv')
strany_df = pd.read_csv('statistics-jenom-strany.csv')

# Iterate through each column in strany_df
for col in strany_df.columns:
    # Create a new dataframe with id, party column, and PL_HL_CELK
    output_df = pd.DataFrame({
        'id': popisky_df['id'],
        col: strany_df[col],
        'PL_HL_CELK': popisky_df['PL_HL_CELK'],
        'PROCENTA': (strany_df[col] / popisky_df['PL_HL_CELK']) * 100
    })
    
    # Save to file named after the column
    filename = f'samostatné/{col}.csv'
    output_df.to_csv(filename, index=False)
    print(f'Created {filename}')