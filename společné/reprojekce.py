import geopandas as gpd
import argparse
import warnings

warnings.filterwarnings("ignore")

parser = argparse.ArgumentParser()
parser.add_argument('--vstup', action="store", required=True)
parser.add_argument('--vystup', action="store", required=True)
argumenty = parser.parse_args()

vstup = argumenty.vstup
novysoubor = argumenty.vystup

puvodniprojekce = gpd.read_file(vstup)
reprojekce = puvodniprojekce.to_crs(epsg=4326)
reprojekce.to_file(novysoubor)