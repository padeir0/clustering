import numpy as np
import argparse
from PIL import Image
from math import sqrt
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator

min_cluster = 2
max_cluster = 21

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
    for n in range(min_cluster, max_cluster):
        kmeans = KMeans(n_clusters=n)
        kmeans.fit(data)
        inertias.append(kmeans.inertia_)
        print(f"inertia for {n} is {kmeans.inertia_}.")
    return inertias

def optimal_number_of_clusters(inertias):
    x1, y1 = 2, inertias[0]
    x2, y2 = 20, inertias[-1]
    distances = []
    for i, y0 in enumerate(inertias, start=2):
        numerator = abs((y2-y1)*i - (x2-x1)*y0 + x2*y1 - y2*x1)
        denominator = sqrt((y2 - y1)**2 + (x2 - x1)**2)
        distances.append(numerator / denominator)
    for dist in distances:
        print(dist)
    return (distances, distances.index(max(distances)) + 2)

def get_data(filename):
    img = Image.open(filename)
    width, height = img.size
    img = img.convert("RGB")
    pixel_array = np.array(img)
    pixel_array = pixel_array.reshape(-1, 3).tolist()
    return pixel_array

def generate_elbow_graph(inertias, n, output="grafico.png"):
    clusters_range = range(2, 2 + len(inertias))

    plt.figure(figsize=(6, 3))
    ax = plt.gca()

    ax.plot(clusters_range, inertias, marker='o', color='tab:blue')

    ax.axvline(x=n, color='green', linestyle=':', linewidth=1.5)
    ax.scatter(n, inertias[n - 2], color='red', s=80, zorder=5, label=f'n = {n}')

    ax.set_xlabel('Número de clusters')
    ax.set_ylabel('Inércia')
    ax.set_title('')
    ax.legend()
    ax.grid(True)
    ax.xaxis.set_major_locator(MaxNLocator(integer=True))

    plt.savefig(output, dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Procura o número ótimo de clusters para uma imagem.")
    parser.add_argument("filename", type=str, help="Caminho da imagem .png")
    parser.add_argument("output", type=str, help="Caminho do gráfico de output (.png)")
    args = parser.parse_args()
    data = get_data(args.filename)
    inertias = calculate_inertias(data)
    distances, n = optimal_number_of_clusters(inertias)
    print(f"optimal number of clusters (elbow): {n}")

    generate_elbow_graph(inertias, n, args.output)
    # n = optimal_silhueta(data)
    # print(f"optimal number of clusters (silhouette): {n}")
