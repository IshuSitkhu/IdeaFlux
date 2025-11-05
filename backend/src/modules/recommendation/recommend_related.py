
import sys
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"relatedBlogs": []}))
        return

    target_blog_id = sys.argv[1].strip()

    try:
        # Fetch all blogs from backend
        response = requests.get("http://localhost:8000/api/blog/recommendation-data", timeout=10)
        data = response.json()
        blogs = data.get("blogs", [])

        if not blogs:
            print(json.dumps({"relatedBlogs": []}))
            return

        # Find the target blog
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

        # Prepare text data for TF-IDF (title + content)
        titles = [blog.get("title", "") for blog in blogs]
        contents = [blog.get("content", "") for blog in blogs]
        combined = [t + " " + c for t, c in zip(titles, contents)]

        # Build TF-IDF matrix
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf_matrix = vectorizer.fit_transform(combined)

        # Get the target blog's vector
        target_vec = tfidf_matrix[target_index]

        # Calculate cosine similarity between target and all blogs
        similarity_scores = cosine_similarity(target_vec, tfidf_matrix).flatten()

        # Create list of (score, blog, index) tuples, excluding the target blog itself
        blog_scores = []
        for i, (score, blog) in enumerate(zip(similarity_scores, blogs)):
            if i != target_index and score > 0.05:  # Exclude target blog and very low scores
                blog_scores.append((score, blog))

        # Sort by similarity score (descending)
        blog_scores.sort(key=lambda x: x[0], reverse=True)

        # Take top 6 most similar blogs
        top_similar = blog_scores[:6]

        # Format results
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
                "createdAt": blog.get("createdAt")
            })

        print(json.dumps({"relatedBlogs": results}))

    except Exception as e:
        # If anything fails, return empty array
        print(json.dumps({"relatedBlogs": [], "error": str(e)}))

if __name__ == "__main__":
    main()
