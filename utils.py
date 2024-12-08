from langchain_pinecone import PineconeVectorStore
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os

def get_huggingface_embeddings(text, model_name="sentence-transformers/all-mpnet-base-v2"):
    model = SentenceTransformer(model_name)
    return model.encode(text)

def get_ai_response(query):
    # Initialize Pinecone
    index_name = "stocks"
    namespace = "stock-descriptions"
    pc = Pinecone(api_key="pcsk_56HxkJ_KFpNYY4qhPuNRKzLHqEEfLP32KNBk1uzZuS7wRk1kDjEPb17v97WuwpKoAbA2kJ")
    pinecone_index = pc.Index(index_name)
    
    # Get embeddings
    raw_query_embedding = get_huggingface_embeddings(query)
    
    # Get matches from Pinecone
    top_matches = pinecone_index.query(
        vector=raw_query_embedding.tolist(),
        top_k=10,
        include_metadata=True,
        namespace=namespace
    )
    
    contexts = [item['metadata']['text'] for item in top_matches['matches']]
    augmented_query = "<CONTEXT>\n" + "\n\n-------\n\n".join(contexts[:10]) + "\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n" + query
    
    # Initialize OpenAI client
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key="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"
    )
    
    system_prompt = "You are an expert at providing answers about stocks. Please answer my question provided."
    
    llm_response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": augmented_query}
        ]
    )
    
    return llm_response.choices[0].message.content
