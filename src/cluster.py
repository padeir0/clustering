import pandas as pd
import numpy as np
import argparse
from sklearn.cluster import KMeans, AgglomerativeClustering

def map_clusters_to_labels(true_labels, cluster_labels):
    mapping = {}
    zipped = list(zip(true_labels, cluster_labels))
    for cluster_id in np.unique(cluster_labels):
        filtered = filter(lambda x: x[1] == cluster_id, zipped)
        unzipped = map(lambda x: x[0], filtered)
        most_frequent = pd.Series(unzipped).mode()[0]
        mapping[cluster_id] = most_frequent
    return mapping

class ClusterMetrics:
    def __init__(self, cluster_labels=None, hits=0, misses=0, total_rows=0, dimensions=0, valid_labeling=False):
        self.cluster_labels = cluster_labels if cluster_labels is not None else []
        self.hits = hits
        self.misses = misses
        self.total_rows = total_rows
        self.dimensions = dimensions
        self.valid_labeling = valid_labeling

    def __str__(self):
        out = ("total data points: {}\n".format(self.total_rows) +
               "dimensions: {}\n".format(self.dimensions))
        if self.valid_labeling:
            out +=("accurate predictions: {}/{} ({:.2f}%)\n".format(self.hits, self.total_rows, 100*self.hits/self.total_rows) +
                   "failed predictions: {}/{} ({:.2f}%)\n".format(self.misses, self.total_rows, 100*self.misses/self.total_rows))
        return out

def cluster_once(unlabeled, labels, n_clusters=3, algorithm = "kmeans"):
    if algorithm == "kmeans":
        kmeans = KMeans(n_clusters=n_clusters, init="random", n_init = 1, random_state=42)
        kmeans.fit(unlabeled)
        cluster_ids = kmeans.labels_
    elif algorithm == "hierarchical":
        agg = AgglomerativeClustering(n_clusters=n_clusters, metric="euclidean", linkage="average")
        agg.fit_predict(unlabeled)
        cluster_ids = agg.labels_

    valid_labeling = len(np.unique(cluster_ids)) == len(np.unique(labels))
    dimensions = len(unlabeled[0])

    valid_labeling = len(np.unique(cluster_ids)) == len(np.unique(labels))

    cluster_to_label = map_clusters_to_labels(labels, cluster_ids)

    hits = 0
    misses = 0
    total = len(unlabeled)
    for i, label in enumerate(labels):
        cluster_id = cluster_ids[i]
        predicted = cluster_to_label[cluster_id]

        if label == predicted:
            hits += 1
        else:
            misses += 1
    return ClusterMetrics(cluster_labels = cluster_ids,
                          misses = misses,
                          hits = hits,
                          total_rows = total,
                          dimensions = dimensions,
                          valid_labeling = valid_labeling)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aplica K-Means e Agrupamento Hierarquico em um dataset de sua escolha.")
    parser.add_argument("filename", type=str, help="Caminho do arquivo .data (labels precisam ser a primeira coluna)")
    args = parser.parse_args()

    df = pd.read_csv(args.filename, header=None)
    # remove os labels
    unlabeled = df.iloc[:, 1:].values 
    labels =  df.iloc[:, 0].values
    print("K-Means Clustering:")
    result_1 = cluster_once(unlabeled, labels, n_clusters=3, algorithm="kmeans")
    print(result_1)

    print("Hierarchical Clustering:")
    result_2 = cluster_once(unlabeled, labels, n_clusters=3, algorithm="hierarchical")
    print(result_2)
