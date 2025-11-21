import sys
import json
import requests
import math
from collections import defaultdict, Counter

if len(sys.argv) < 2:
    print("No user ID provided")
    sys.exit()

target_user_id = sys.argv[1]

likes_url = "http://localhost:8000/api/likes/all-public"

# Fetch all likes from backend
try:
    response = requests.get(likes_url)
    response.raise_for_status()
    likes = response.json()
except requests.exceptions.RequestException as e:
    print("HTTP Request failed:", e)
    print(json.dumps({"recommendations": []}))
    sys.exit()
except ValueError as e:
    print("Invalid JSON from backend:", e)
    print(json.dumps({"recommendations": []}))
    sys.exit()

if not likes:
    print(json.dumps({"recommendations": []}))
    sys.exit()

# Build user -> blog matrix (1 if liked, else 0)
user_blog_matrix = defaultdict(dict)
for like in likes:
    user = like.get("userId")
    blog = like.get("blogId")
    if user and blog:
        user_blog_matrix[user][blog] = 1

# Build blog -> user matrix for item-item similarity
blog_user_matrix = defaultdict(dict)
for user, blogs in user_blog_matrix.items():
    for blog, liked in blogs.items():
        blog_user_matrix[blog][user] = liked

# If less than 2 blogs, exit
if len(blog_user_matrix) < 2:
    print(json.dumps({"recommendations": []}))
    sys.exit()

# Cosine similarity function
def cosine_sim(blog1, blog2):
    users = set(blog1.keys()) | set(blog2.keys())
    dot = sum(blog1.get(u, 0) * blog2.get(u, 0) for u in users)
    norm1 = math.sqrt(sum(blog1.get(u, 0) ** 2 for u in users))
    norm2 = math.sqrt(sum(blog2.get(u, 0) ** 2 for u in users))
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)

# Compute similarity for all blog pairs
similarity = defaultdict(dict)
blogs = list(blog_user_matrix.keys())
for i in range(len(blogs)):
    for j in range(i, len(blogs)):
        sim = cosine_sim(blog_user_matrix[blogs[i]], blog_user_matrix[blogs[j]])
        similarity[blogs[i]][blogs[j]] = sim
        similarity[blogs[j]][blogs[i]] = sim

# Get blogs liked by target user
if target_user_id not in user_blog_matrix:
    print(json.dumps({"recommendations": []}))
    sys.exit()

liked_blogs = [blog for blog, liked in user_blog_matrix[target_user_id].items() if liked]

if not liked_blogs:
    print(json.dumps({"recommendations": []}))
    sys.exit()

# Aggregate similar blogs for recommendations
recommendation_scores = Counter()
for blog_id in liked_blogs:
    for sim_blog_id, score in similarity[blog_id].items():
        if sim_blog_id != blog_id and sim_blog_id not in liked_blogs:
            recommendation_scores[sim_blog_id] += score

# Get top 5 recommendations
top_recommendations = recommendation_scores.most_common(5)

# Print as JSON
print(json.dumps({
    "recommendations": [
        {"blogId": blog_id, "score": round(score, 4)}
        for blog_id, score in top_recommendations
    ]
}))
