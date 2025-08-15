import numpy as np
import argparse
import pandas as pd
from math import sqrt
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

min_cluster = 2
max_cluster = 8

def optimal_silhueta(data):
    sil_scores = []

    k_range = range(min_cluster, max_cluster)
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(data)
        score = silhouette_score(data, labels)
        sil_scores.append(score)
        print(f"k={k}, Silhouette={score:.4f}")

    return k_range[sil_scores.index(max(sil_scores))]

def calculate_inertias(data):
    inertias = []
    for k in range(min_cluster, max_cluster):
        kmeans = KMeans(n_clusters=k, n_init='auto', random_state=42)
        kmeans.fit(data)
        inertias.append(kmeans.inertia_)
        print(f"calculated inertia for {k}.")
    return inertias

def optimal_number_of_clusters(inertias):
    x1, y1 = 2, inertias[0]
    x2, y2 = 20, inertias[-1]
    distances = []
    for i, y0 in enumerate(inertias, start=2):
        numerator = abs((y2-y1)*i - (x2-x1)*y0 + x2*y1 - y2*x1)
        denominator = sqrt((y2 - y1)**2 + (x2 - x1)**2)
        distances.append(numerator / denominator)
    return distances.index(max(distances)) + 2

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aplica K-Means e Agrupamento Hierarquico em um dataset de sua escolha.")
    parser.add_argument("filename", type=str, help="Caminho do arquivo .data (labels precisam ser a primeira coluna)")
    args = parser.parse_args()

    df = pd.read_csv(args.filename, header=None)
    # remove os labels
    data = df.iloc[:, 1:].values 
    labels =  df.iloc[:, 0].values

    inertias = calculate_inertias(data)
    n = optimal_number_of_clusters(inertias)
    print(f"optimal number of clusters (inertias): {n}")

    n = optimal_silhueta(data)
    print(f"optimal number of clusters (silhouette): {n}")
