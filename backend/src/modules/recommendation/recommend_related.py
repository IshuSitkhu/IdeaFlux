import sys
import requests
import json
import math
from collections import defaultdict
import re


STOP_WORDS = {
    "the", "is", "in", "and", "to", "of", "a", "for", "on", "at", "by", "an",
    "be", "this", "that", "with", "as", "from", "it", "are", "was", "or", "but"
}

def tokenize(text):
    """Tokenize: lowercase, remove punctuation, and exclude stop words"""
    tokens = re.findall(r'\b\w+\b', text.lower())
    return [t for t in tokens if t not in STOP_WORDS]  # Remove stop words

def compute_tf(doc_tokens):
    """Compute term frequency for a document"""
    tf = defaultdict(int)
    for token in doc_tokens:
        tf[token] += 1
    doc_len = len(doc_tokens)
    for token in tf:
        tf[token] /= doc_len
    return tf

def compute_idf(docs_tokens):
    """Compute inverse document frequency for all terms"""
    N = len(docs_tokens)
    df = defaultdict(int)
    for tokens in docs_tokens:
        unique_tokens = set(tokens)
        for token in unique_tokens:
            df[token] += 1
    idf = {}
    for token, freq in df.items():
        idf[token] = math.log((N + 1) / (freq + 1)) + 1  # smoothed IDF
    return idf

def compute_tfidf(tf, idf):
    """Compute TF-IDF vector for a document"""
    tfidf = {}
    for token, tf_val in tf.items():
        tfidf[token] = tf_val * idf.get(token, 0)
    return tfidf

def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two TF-IDF vectors"""
    all_tokens = set(vec1.keys()) | set(vec2.keys())
    dot = sum(vec1.get(tok, 0) * vec2.get(tok, 0) for tok in all_tokens)
    norm1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
    norm2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"relatedBlogs": []}))
        return

    target_blog_id = sys.argv[1].strip()

    try:
        # Step 1: Fetch all blogs
        response = requests.get("http://localhost:8000/api/blog/recommendation-data", timeout=10)
        data = response.json()
        blogs = data.get("blogs", [])

        if not blogs:
            print(json.dumps({"relatedBlogs": []}))
            return

        # Step 2: Find target blog
        target_blog = None
        target_index = -1
        for i, blog in enumerate(blogs):
            if str(blog.get("_id")) == target_blog_id:
                target_blog = blog
                target_index = i
                break

        if not target_blog:
            print(json.dumps({"relatedBlogs": []}))
            return

        # Step 3: Combine title and content for each blog
        combined_docs = [blog.get("title", "") + " " + blog.get("content", "") for blog in blogs]
        tokenized_docs = [tokenize(doc) for doc in combined_docs]

        # Step 4: Compute TF-IDF for all blogs
        idf = compute_idf(tokenized_docs)
        tfidf_vectors = [compute_tfidf(compute_tf(tokens), idf) for tokens in tokenized_docs]

        # Step 5: Compute cosine similarity with the target blog
        target_vec = tfidf_vectors[target_index]
        similarity_scores = [cosine_similarity(target_vec, vec) for vec in tfidf_vectors]

        THRESHOLD = 0.05  

        # Step 6: Collect blogs above threshold (excluding target)
        blog_scores = [
            (score, blog)
            for i, (score, blog) in enumerate(zip(similarity_scores, blogs))
            if i != target_index and score > THRESHOLD
        ]

        # Step 7: Sort and take top 6
        blog_scores.sort(key=lambda x: x[0], reverse=True)
        top_similar = blog_scores[:6]

        # Step 8: Prepare result
        results = []
        for score, blog in top_similar:
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
                "createdAt": blog.get("createdAt"),
                "similarityScore": round(float(score), 2)
            })

        print(json.dumps({"relatedBlogs": results}))

    except Exception as e:
        print(json.dumps({"relatedBlogs": [], "error": str(e)}))

if __name__ == "__main__":
    main()
