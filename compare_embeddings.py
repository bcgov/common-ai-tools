from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain.evaluation import load_evaluator
from dotenv import load_dotenv
import openai
import os

# Load environment variables. Assumes that project contains .env file with API keys
load_dotenv()
#---- Set HUGGINGFACEHUB_API_TOKEN key 

def main():
    # Get embedding for a word.
    embedding_function = HuggingFaceEmbeddings()
    vector = embedding_function.embed_query("apple")
    print(f"Vector for 'apple': {vector}")
    print(f"Vector length: {len(vector)}")

    # Compare vector of two words
    evaluator = load_evaluator("pairwise_embedding_distance")
    words = ("apple", "iphone")
    x = evaluator.evaluate_string_pairs(prediction=words[0], prediction_b=words[1])
    print(f"Comparing ({words[0]}, {words[1]}): {x}")


if __name__ == "__main__":
    main()
