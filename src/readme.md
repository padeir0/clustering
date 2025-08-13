# Simples aplicação de K-Means e Agrupamento Hierárquico

Uso `scikit-learn` para aplicar K-Means e Agrupamento Hierárquico
em datasets do UCI e analisar a acurácia dos algoritmos.

## Datasets

Uso os datasets disponíveis gratuitamente pelo UCI:
 - `iris.data`: https://archive.ics.uci.edu/dataset/53/iris
 - `seeds.data`: https://archive.ics.uci.edu/dataset/236/seeds
 - `wine.data`: https://archive.ics.uci.edu/dataset/109/wine

Ambos os datasets estão licenciados com Creative Commons Attribution 4.0 International (CC BY 4.0).

## Como rodar o código

Precisa ter ambos `python` e `pip` instalados. Para instalar
as outras dependencias do script, execute:

```
pip install pandas numpy scikit-learn
```

Daí, basta executar o script dessa forma:

```bash
python cluster.py data/wine.data
```

E ele vai te fornecer a acurácia do clustering:

```
K-Means Clustering:
total data points: 178
dimensions: 13
accurate predictions: 125/178 (70.22%)
failed predictions: 53/178 (29.78%)

Hierarchical Clustering:
total data points: 178
dimensions: 13
accurate predictions: 115/178 (64.61%)
failed predictions: 63/178 (35.39%)
```

## Resultados

Para `wine.data`:
```
K-Means Clustering:
total data points: 178
dimensions: 13
accurate predictions: 125/178 (70.22%)
failed predictions: 53/178 (29.78%)

Hierarchical Clustering:
total data points: 178
dimensions: 13
accurate predictions: 115/178 (64.61%)
failed predictions: 63/178 (35.39%)
```

Para `iris.data`:
```
K-Means Clustering:
total data points: 150
dimensions: 4
accurate predictions: 134/150 (89.33%)
failed predictions: 16/150 (10.67%)

Hierarchical Clustering:
total data points: 150
dimensions: 4
accurate predictions: 136/150 (90.67%)
failed predictions: 14/150 (9.33%)
```

Para `seeds.data`:
```
K-Means Clustering:
total data points: 210
dimensions: 7
accurate predictions: 188/210 (89.52%)
failed predictions: 22/210 (10.48%)

Hierarchical Clustering:
total data points: 210
dimensions: 7
accurate predictions: 191/210 (90.95%)
failed predictions: 19/210 (9.05%)
```
