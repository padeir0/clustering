import numpy as np
import argparse
from PIL import Image
from sklearn.cluster import KMeans
from collections import Counter

class SimpleImage:
    def __init__(self, width, height, pixels):
        self.height = height
        self.width = width
        self.pixels = pixels
        self.palette = None

    def __str__(self):
        out = "dimensions: {}x{}\n".format(self.height, self.width)
        return out

    def set_palette(self, palette):
        self.palette = palette

    def save(self, filename):
        arr = np.array(self.pixels, dtype=np.uint8).reshape(self.height, self.width)
        img = Image.fromarray(arr, mode="P")
        img.putpalette(self.palette)
        img.save(filename, optimize=True)

def process_image(image, colors=3):
    kmeans = KMeans(n_clusters=colors, init="k-means++", n_init = 1, random_state=42)
    kmeans.fit(image.pixels)
    centroids = kmeans.cluster_centers_
    image.palette = centroids.astype(np.uint8).flatten().tolist()
    labels = kmeans.labels_
    for i in range(0, len(image.pixels)):
        image.pixels[i] = labels[i]

def get_image(filename):
    img = Image.open(filename)
    width, height = img.size
    img = img.convert("RGB")
    pixel_array = np.array(img)
    pixel_array = pixel_array.reshape(-1, 3).tolist()
    return SimpleImage(width, height, pixel_array)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aplica K-Means numa imagem da sua escolha")
    parser.add_argument("filename", type=str, help="Caminho da imagem .png")
    parser.add_argument("colors", type=int, help="Número total de cores")
    parser.add_argument("output", type=str, help="Caminho da imagem de output")
    args = parser.parse_args()

    img = get_image(args.filename)
    process_image(img, colors=args.colors)
    img.save(args.output)
