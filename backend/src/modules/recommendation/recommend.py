import sys
import requests
import json
import math
import re
from collections import defaultdict

STOP_WORDS = {
    "the","and","is","in","to","with","a","of","for","on","at","by","an","from","as","it","this","that"
}

VALID_CATEGORIES = [
    "technology", "programming", "lifestyle", "entertainment", "music", "movies",
    "sports", "travel", "food", "nature", "health", "education", "bollywood",
    "fashion", "personal", "news"
]

THRESHOLD = 0.05              # Minimum similarity to include a blog
CATEGORY_FALLBACK_SCORE = 0.03 # Score for blogs matched by category fallback

def tokenize(text):
    """
    Convert text to lowercase, split into words, and remove stop words.
    """
    tokens = re.findall(r'\b\w[\w\+\-]*\b', text.lower())
    return [t for t in tokens if t not in STOP_WORDS]

def compute_tf(tokens):
    """
    Compute Term Frequency (TF)
    """
    tf = defaultdict(int)
    for t in tokens:
        tf[t] += 1
    total = len(tokens)
    return {t: count / total for t, count in tf.items()}

def compute_idf(docs_tokens):
    """
    Compute Inverse Document Frequency (IDF) with smoothing
    """
    N = len(docs_tokens)
    df = defaultdict(int)
    for tokens in docs_tokens:
        for t in set(tokens):
            df[t] += 1
    return {t: math.log((N + 1) / (f + 1)) + 1 for t, f in df.items()}

def compute_tfidf(tf, idf):
    """
    Compute TF-IDF vector = TF * IDF
    """
    return {t: tf_val * idf.get(t, 0) for t, tf_val in tf.items()}

def cosine_sim(vec1, vec2):
    """
    Compute cosine similarity between two TF-IDF vectors
    """
    all_tokens = set(vec1.keys()) | set(vec2.keys())
    dot = sum(vec1.get(tok, 0) * vec2.get(tok, 0) for tok in all_tokens)
    norm1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    norm2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)


def fetch_blogs():
    try:
        response = requests.get("http://localhost:8000/api/blog/recommendation-data")
        data = response.json()
        return data.get("blogs", [])
    except:
        return []

# Preprocess Blogs
def preprocess_blogs(blogs):
    """
    Step 4: Combine title + content and tokenize each blog
    """
    combined_docs = [blog.get("title", "") + " " + blog.get("content", "") for blog in blogs]
    tokenized_docs = [tokenize(doc) for doc in combined_docs]
    return tokenized_docs


def compute_vectors(tokenized_docs, query_tokens):
    """
    Compute IDF from all blog documents
    Compute TF-IDF vectors for each blog
    Compute TF-IDF vector for query
    """
    idf = compute_idf(tokenized_docs)
    blog_vectors = [compute_tfidf(compute_tf(tokens), idf) for tokens in tokenized_docs]
    query_vec = compute_tfidf(compute_tf(query_tokens), idf)
    return blog_vectors, query_vec


def recommend_blogs(blogs, blog_vectors, query_vec, query):
    similarity_scores = [cosine_sim(query_vec, vec) for vec in blog_vectors]

    # Filter blogs above threshold
    blog_scores = [(score, blog) for score, blog in zip(similarity_scores, blogs) if score >= THRESHOLD]
    blog_scores.sort(key=lambda x: x[0], reverse=True)

    # Category fallback
    if query.lower() in VALID_CATEGORIES:
        category_blogs = [
            blog for blog in blogs
            if query.lower() in [cat.lower() for cat in blog.get("categories", [])]
        ]
        existing_ids = set(blog["_id"] for _, blog in blog_scores)
        for blog in category_blogs:
            if blog["_id"] not in existing_ids:
                blog_scores.append((CATEGORY_FALLBACK_SCORE, blog))

    blog_scores.sort(key=lambda x: x[0], reverse=True)
    return blog_scores

def format_results(blog_scores):
    """
    Prepare final JSON output with similarity scores
    """
    results = []
    for score, blog in blog_scores:
        author = blog.get("author") or {}
        results.append({
            "_id": blog.get("_id"),
            "title": blog.get("title"),
            "content": blog.get("content"),
            "image": blog.get("image"),
            "categories": blog.get("categories", []),
            "author": {
                "_id": author.get("_id"),
                "name": author.get("name", "Unknown")
            },
            "similarity": round(score, 2)
        })
    return results


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"recommendations": []}))
        return
    
    query = sys.argv[1].strip().lower()
    
    blogs = fetch_blogs()
    if not blogs:
        print(json.dumps({"recommendations": []}))
        return
    
    tokenized_docs = preprocess_blogs(blogs)
    query_tokens = tokenize(query)
    
    blog_vectors, query_vec = compute_vectors(tokenized_docs, query_tokens)
    
    blog_scores = recommend_blogs(blogs, blog_vectors, query_vec, query)
    
    results = format_results(blog_scores)
    print(json.dumps({"recommendations": results}))

if __name__ == "__main__":
    main()
