import boto3
import json
import os
import logging
from typing import Optional
from utils.configure_logging import configure_logging
from dotenv import find_dotenv, load_dotenv
import os

load_dotenv()

logger = logging.getLogger(__name__)

configure_logging(logging.INFO)

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
CLAUDE_MODEL_ID = "arn:aws:bedrock:us-east-1:926251048803:application-inference-profile/h6rumq565qjo"
TITAN_MODEL_ID = "arn:aws:bedrock:us-east-1:926251048803:application-inference-profile/1mntu89reb06"

def get_bedrock_client():
    """Get AWS Bedrock runtime client."""
    os.environ["AWS_BEARER_TOKEN_BEDROCK"] = os.getenv('API_KEY')
    
    return boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
    )
 
 

def invoke_claude(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 4096,
    messages: list = None,
) -> str:
    """Call Claude 3.5 Sonnet via AWS Bedrock.
    
    Args:
        system_prompt: System-level instructions for Claude.
        user_message: The latest user message.
        max_tokens: Maximum tokens in the response.
        messages: Optional full conversation history (list of {role, content} dicts).
                  When provided, used as-is (multi-turn chat). When None, a single
                  user turn is constructed from user_message.
    """
    client = get_bedrock_client()

    # Use provided history or build a single-turn conversation
    conversation = messages if messages else [{"role": "user", "content": user_message}]

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": conversation,
    }

    response = client.invoke_model(
        modelId=CLAUDE_MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]


def invoke_titan_embed(text: str) -> list[float]:
    """Get embeddings from Amazon Titan Embed."""
    client = get_bedrock_client()
    
    body = {"inputText": text}
    
    response = client.invoke_model(
        modelId=TITAN_MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )

    result = json.loads(response["body"].read())
    return result["embedding"]


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    import math
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a ** 2 for a in vec_a))
    norm_b = math.sqrt(sum(b ** 2 for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)