import pandas as pd

# read_csv function which is used to read the required CSV file
data = pd.read_csv('statistics.csv')

# drop function which is used in removing or deleting rows or columns from the CSV files
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK"])
novy.to_csv("statistics-jenom-strany.csv", index=False)
