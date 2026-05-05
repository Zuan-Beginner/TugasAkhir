from sklearn.datasets import make_blobs

X, y = make_blobs(
    n_samples=150,
    centers=3,
    n_features=2,
    random_state=42
)

print(X)